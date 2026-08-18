import { ParsedSms, TransactionType } from '../../types';
import { normalizePersianText, toLatinDigits } from '../../utils/digits';
import { BANK_PATTERNS, parseNumberString } from './bankPatterns';
import { isNoiseSms } from './noiseFilter';

interface RecentTransactionSignature {
  amount: number;
  bankName: string;
  timestamp: number;
}

// In-memory 90-second duplicate cache
const recentTransactionsCache: RecentTransactionSignature[] = [];
const DUPLICATE_WINDOW_MS = 90 * 1000; // 90 seconds

/**
 * Removes stale cache entries older than 90 seconds
 */
function cleanDuplicateCache() {
  const now = Date.now();
  for (let i = recentTransactionsCache.length - 1; i >= 0; i--) {
    if (now - recentTransactionsCache[i].timestamp > DUPLICATE_WINDOW_MS) {
      recentTransactionsCache.splice(i, 1);
    }
  }
}

/**
 * Checks if a transaction is a duplicate within the last 90 seconds
 */
export function isDuplicateTransaction(amount: number, bankName: string): boolean {
  cleanDuplicateCache();
  const now = Date.now();
  return recentTransactionsCache.some(
    (item) => item.amount === amount && item.bankName === bankName && now - item.timestamp <= DUPLICATE_WINDOW_MS
  );
}

/**
 * Records a parsed transaction in duplicate cache
 */
export function recordTransactionInCache(amount: number, bankName: string) {
  cleanDuplicateCache();
  recentTransactionsCache.push({
    amount,
    bankName,
    timestamp: Date.now(),
  });
}

/**
 * Fallback generic parser for SMS that didn't match any specific bank regex
 */
export function parseGenericSms(rawText: string, sender: string = ''): ParsedSms | null {
  const normalized = normalizePersianText(toLatinDigits(rawText));

  // Determine type
  const isIncome = /واریز|افزایش|انتقال به|بستانکار|دریافت/i.test(normalized);
  const isExpense = /برداشت|کسر|پرداخت|خرید|انتقال از|بدهکار/i.test(normalized);

  if (!isIncome && !isExpense) {
    return null; // Not a recognizable transaction
  }

  // Find amount: matches "مبلغ: 120,000 ریال" or standalone numbers with ریال/تومان
  const amountMatch = normalized.match(/(?:مبلغ|پرداخت|واریز|برداشت|خرید)?\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)/i);
  let amount = 0;
  let unit: 'rial' | 'toman' = 'rial';

  if (amountMatch) {
    amount = parseNumberString(amountMatch[1]);
    unit = amountMatch[2] === 'تومان' ? 'toman' : 'rial';
  } else {
    // Look for any large number (> 1,000)
    const numbers = normalized.match(/[0-9]{4,12}/g);
    if (numbers && numbers.length > 0) {
      const candidates = numbers.map((n) => parseInt(n, 10)).filter((n) => n >= 1000);
      if (candidates.length > 0) {
        amount = candidates[0];
      }
    }
  }

  if (amount < 1000) {
    return null; // Minimum threshold
  }

  // Try to detect bank from sender or text
  let bankName = 'بانک ناشناس';
  for (const config of BANK_PATTERNS) {
    if (config.keywords.some((kw) => normalized.includes(kw)) || config.senderNumbers.some((s) => sender.includes(s))) {
      bankName = config.bankName;
      break;
    }
  }

  // Try to extract card last 4 digits
  const cardMatch = normalized.match(/(?:کارت|حساب|از|به)?\s*[:\-\s]*(\d{4})(?!\d)/);
  const cardLast4 = cardMatch ? cardMatch[1] : undefined;

  const amountInRials = unit === 'toman' ? amount * 10 : amount;

  return {
    amount: amountInRials,
    type: isIncome ? 'income' : 'expense',
    bankName,
    cardLast4,
    occurredAt: new Date(),
    rawText,
    confidence: 0.55, // Lower confidence for generic fallback
    patternId: 'generic_fallback',
  };
}

/**
 * Main Pure SMS Parser Engine
 */
export function parseSms(rawText: string, sender: string = '', checkDuplicate: boolean = true): ParsedSms | null {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Noise Filter (OTP, Ads, Cancel 11, etc.)
  const noiseCheck = isNoiseSms(rawText);
  if (noiseCheck.isNoise) {
    return null;
  }

  const normalizedText = normalizePersianText(toLatinDigits(rawText));
  const normalizedSender = normalizePersianText(toLatinDigits(sender));

  // Sort pattern configs by priority
  const sortedConfigs = [...BANK_PATTERNS].sort((a, b) => b.priority - a.priority);

  // 2. Iterate through Bank specific patterns
  for (const config of sortedConfigs) {
    const senderMatched = config.senderNumbers.some((sn) => normalizedSender.includes(sn.toLowerCase()));
    const keywordMatched = config.keywords.some((kw) => normalizedText.includes(kw));

    if (senderMatched || keywordMatched) {
      for (const pattern of config.patterns) {
        const match = normalizedText.match(pattern.regex);
        if (match) {
          try {
            const extracted = pattern.extract(match, normalizedText);
            if (extracted && extracted.amount >= 1000) {
              // 3. Duplicate check
              if (checkDuplicate && isDuplicateTransaction(extracted.amount, config.bankName)) {
                return null; // Suppress duplicate
              }

              if (checkDuplicate) {
                recordTransactionInCache(extracted.amount, config.bankName);
              }

              return {
                amount: extracted.amount,
                type: extracted.type,
                bankName: config.bankName,
                cardLast4: extracted.cardLast4,
                balance: extracted.balance,
                merchant: extracted.merchant,
                occurredAt: new Date(),
                rawText,
                confidence: 0.95,
                patternId: config.id,
              };
            }
          } catch {
            // Pattern extraction failed, continue to fallback
          }
        }
      }
    }
  }

  // 3. Fallback generic parser
  const genericResult = parseGenericSms(rawText, sender);
  if (genericResult) {
    if (checkDuplicate && isDuplicateTransaction(genericResult.amount, genericResult.bankName)) {
      return null;
    }
    if (checkDuplicate) {
      recordTransactionInCache(genericResult.amount, genericResult.bankName);
    }
    return genericResult;
  }

  return null;
}
