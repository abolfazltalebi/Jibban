import { Category, Transaction } from '../../types';
import { parseSms } from './SmsParser';
import { AutoCategorizer } from '../categorization/AutoCategorizer';
import { SMS_SAMPLES } from './smsSamples';

export interface ScanProgress {
  total: number;
  scanned: number;
  foundTransactions: number;
  percentage: number;
  currentBank?: string;
}

export class SmsScanner {
  /**
   * Scans simulated or native SMS inbox messages and converts valid financial SMS into transactions
   */
  public static async scanHistoricalSms(
    categories: Category[],
    onProgress?: (progress: ScanProgress) => void
  ): Promise<Transaction[]> {
    const rawList = [...SMS_SAMPLES];
    const total = rawList.length;
    const found: Transaction[] = [];

    for (let i = 0; i < total; i++) {
      const item = rawList[i];

      // Artificial small delay to render scan progress gracefully
      await new Promise((res) => setTimeout(res, 80));

      const parsed = parseSms(item.rawText, item.sender, false);
      if (parsed && parsed.amount >= 1000) {
        const catResult = AutoCategorizer.categorize(parsed, categories);
        const isExpense = parsed.type === 'expense';
        const assignedCat = isExpense ? catResult.predictedCategoryId : 'salary';

        const tx: Transaction = {
          id: 'tx_scan_' + Date.now() + '_' + i,
          amount: parsed.amount,
          type: parsed.type === 'income' ? 'income' : 'expense',
          categoryId: assignedCat,
          accountId: 'acc_blu',
          title: parsed.merchant || (isExpense ? `خرید ${parsed.bankName}` : `واریز ${parsed.bankName}`),
          merchant: parsed.merchant,
          occurredAt: new Date(Date.now() - (total - i) * 86400000 * 2).toISOString(),
          createdAt: new Date().toISOString(),
          source: 'sms',
          rawSms: item.rawText,
          isConfirmed: catResult.confidence >= 0.85,
          confidence: parsed.confidence,
          bankName: parsed.bankName,
          cardLast4: parsed.cardLast4,
          balance: parsed.balance,
        };

        found.push(tx);
      }

      if (onProgress) {
        onProgress({
          total,
          scanned: i + 1,
          foundTransactions: found.length,
          percentage: Math.round(((i + 1) / total) * 100),
          currentBank: item.expectedBank || 'بانک',
        });
      }
    }

    return found;
  }
}
