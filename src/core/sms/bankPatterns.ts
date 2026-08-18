import { TransactionType } from '../../types';

export interface BankRegexPattern {
  regex: RegExp;
  extract: (matches: RegExpMatchArray, rawText: string) => {
    amount: number; // in Rials
    type: TransactionType;
    cardLast4?: string;
    balance?: number;
    merchant?: string;
  } | null;
}

export interface BankPatternConfig {
  id: string;
  bankName: string;
  senderNumbers: string[];
  keywords: string[];
  patterns: BankRegexPattern[];
  priority: number;
}

/**
 * Parses numeric strings like "120,000", "120000", "120.000" into pure number
 */
export function parseNumberString(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/[,،._\s]/g, '').trim();
  const val = parseInt(clean, 10);
  return isNaN(val) ? 0 : val;
}

export const BANK_PATTERNS: BankPatternConfig[] = [
  // 1. بلو بانک (BluBank - سامان)
  {
    id: 'blubank',
    bankName: 'بلوبانک',
    senderNumbers: ['+9890000', 'blubank', 'BLUBANK', '9890000'],
    keywords: ['بلو', 'بلوبانک', 'blubank', 'بلو بانک'],
    priority: 10,
    patterns: [
      {
        // خرید/برداشت بلوبانک: "برداشت از کارت 1234\nمبلغ: 450,000 ریال\nمانده: 1,200,000 ریال\nفروشگاه افق کوروش"
        regex: /(برداشت|واریز|انتقال|خرید).*?(?:کارت|حساب)?\s*[:\-\s]*(\d{4})?[\s\S]*?(?:مبلغ|مبلغ تراکنش)\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?\s*(?:ریال|تومان)?(?:[\s\S]*?(?:پذیرنده|فروشگاه|در|به)\s*[:\-\s]*([^\n\r]+))?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const cardLast4 = matches[2];
          const rawAmount = parseNumberString(matches[3]);
          const unit = matches[4] === 'تومان' ? 'toman' : 'rial';
          const amountInRials = unit === 'toman' ? rawAmount * 10 : rawAmount;
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;
          const balanceInRials = rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined;
          const merchant = matches[6]?.trim();

          const isIncome = /واریز|انتقال به|دریافت/i.test(rawType);
          return {
            amount: amountInRials,
            type: isIncome ? 'income' : 'expense',
            cardLast4,
            balance: balanceInRials,
            merchant,
          };
        },
      },
    ],
  },

  // 2. بانک ملی ایران (Melli)
  {
    id: 'melli',
    bankName: 'بانک ملی',
    senderNumbers: ['+9820004000', '20004000', 'BankMelli', 'B.Melli'],
    keywords: ['بانک ملی', 'ملی ایران', 'بام', 'ساپتا', 'بانک ملي'],
    priority: 9,
    patterns: [
      {
        // مثال ملی: "بانک ملی ایران\nبرداشت: 1,500,000 ریال\nاز: 603799***1234\nمانده: 3,450,000 ریال\n1404/09/23 14:20\nخرید سوپرمارکت"
        regex: /(برداشت|واریز|انتقال|خرید|پرداخت)[\s\S]*?([0-9,،]+)\s*(ریال|تومان)[\s\S]*?(?:از|به|حساب|کارت)[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          const isIncome = /واریز|افزایش|انتقال به/i.test(rawType);
          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: isIncome ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },

  // 3. بانک ملت (Mellat)
  {
    id: 'mellat',
    bankName: 'بانک ملت',
    senderNumbers: ['+9820000', '20000', 'BankMellat'],
    keywords: ['بانک ملت', 'ملت', 'Bank Mellat'],
    priority: 9,
    patterns: [
      {
        // مثال ملت: "بانک ملت\nبرداشت 200,000 ریال\nاز حساب 1234\nمانده 4,500,000 ریال\n1404/09/23-11:15"
        regex: /(برداشت|واریز|خرید|انتقال|کسر)[\s\S]*?([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(?:حساب|کارت|از)[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)[\s\S]*?([0-9,،]+)/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = parseNumberString(matches[5]);

          const isIncome = /واریز|بستانکار/i.test(rawType);
          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: isIncome ? 'income' : 'expense',
            cardLast4,
            balance: unit === 'toman' ? rawBalance * 10 : rawBalance,
          };
        },
      },
    ],
  },

  // 4. بانک سامان (Saman)
  {
    id: 'saman',
    bankName: 'بانک سامان',
    senderNumbers: ['+98200000', 'BankSaman', '200000'],
    keywords: ['بانک سامان', 'سامان'],
    priority: 8,
    patterns: [
      {
        // "بانک سامان\nخرید کارت 4589\nمبلغ: 850,000 ریال\nمانده: 12,300,000 ریال\nپذیرنده: رستوران ارکیده"
        regex: /(خرید|برداشت|واریز|انتقال)[\s\S]*?(?:کارت|حساب)?\s*(\d{4})?[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?[\s\S]*?(?:پذیرنده\s*[:\-\s]*([^\n\r]+))?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const cardLast4 = matches[2];
          const rawAmount = parseNumberString(matches[3]);
          const unit = matches[4] === 'تومان' ? 'toman' : 'rial';
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;
          const merchant = matches[6]?.trim();

          const isIncome = /واریز|دریافت/i.test(rawType);
          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: isIncome ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
            merchant,
          };
        },
      },
    ],
  },

  // 5. بانک پاسارگاد (Pasargad)
  {
    id: 'pasargad',
    bankName: 'بانک پاسارگاد',
    senderNumbers: ['+9820008440', 'Pasargad', '20008440'],
    keywords: ['پاسارگاد', 'بانک پاسارگاد', 'Pasargad'],
    priority: 8,
    patterns: [
      {
        // "بانک پاسارگاد\nبرداشت از حساب: 1234\nمبلغ: 1,250,000 ریال\nموجودی: 6,700,000 ریال"
        regex: /(برداشت|واریز|خرید|انتقال)[\s\S]*?(?:حساب|کارت)\s*[:\-\s]*(\d{4})?[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?موجودی\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const cardLast4 = matches[2];
          const rawAmount = parseNumberString(matches[3]);
          const unit = matches[4] === 'تومان' ? 'toman' : 'rial';
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          const isIncome = /واریز|انتقال به/i.test(rawType);
          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: isIncome ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },

  // 6. بانک تجارت (Tejarat)
  {
    id: 'tejarat',
    bankName: 'بانک تجارت',
    senderNumbers: ['+98200070', 'TejaratBank', '200070'],
    keywords: ['بانک تجارت', 'تجارت'],
    priority: 8,
    patterns: [
      {
        regex: /(برداشت|واریز|خرید)[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(?:کارت|حساب)\s*[:\-\s]*(\d{4})[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          const isIncome = /واریز/i.test(rawType);
          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: isIncome ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },

  // 7. بانک صادرات (Saderat)
  {
    id: 'saderat',
    bankName: 'بانک صادرات',
    senderNumbers: ['+983000940', 'SaderatBank', '3000940'],
    keywords: ['بانک صادرات', 'صادرات'],
    priority: 8,
    patterns: [
      {
        regex: /(برداشت|واریز|خرید|کسر)[\s\S]*?مبلغ\s*([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(?:کارت|حساب)[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)[\s\S]*?([0-9,،]+)/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = parseNumberString(matches[5]);

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: /واریز/.test(rawType) ? 'income' : 'expense',
            cardLast4,
            balance: unit === 'toman' ? rawBalance * 10 : rawBalance,
          };
        },
      },
    ],
  },

  // 8. بانک سپه (Sepah)
  {
    id: 'sepah',
    bankName: 'بانک سپه',
    senderNumbers: ['+98200050', 'SepahBank'],
    keywords: ['بانک سپه', 'سپه', 'انصار', 'کوثر', 'حکمت', 'قوامین', 'مهر اقتصاد'],
    priority: 8,
    patterns: [
      {
        regex: /(برداشت|واریز|انتقال|خرید)[\s\S]*?([0-9,،]+)\s*(ریال|تومان)[\s\S]*?(?:از|به|کارت|حساب)[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: /واریز/.test(rawType) ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },

  // 9. بانک کشاورزی (Keshavarzi)
  {
    id: 'keshavarzi',
    bankName: 'بانک کشاورزی',
    senderNumbers: ['+982000911', 'B.Keshavarzi'],
    keywords: ['بانک کشاورزی', 'کشاورزی'],
    priority: 8,
    patterns: [
      {
        regex: /(برداشت|واریز|خرید)[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: /واریز/.test(rawType) ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },

  // 10. بانک پارسیان (Parsian)
  {
    id: 'parsian',
    bankName: 'بانک پارسیان',
    senderNumbers: ['+9820008585', 'ParsianBank'],
    keywords: ['بانک پارسیان', 'پارسیان'],
    priority: 8,
    patterns: [
      {
        regex: /(برداشت|واریز|خرید)[\s\S]*?([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(?:کارت|حساب)[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: /واریز/.test(rawType) ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },

  // 11. بانک شهر (Shahr)
  {
    id: 'shahr',
    bankName: 'بانک شهر',
    senderNumbers: ['+9820008686', 'ShahrBank'],
    keywords: ['بانک شهر', 'شهر'],
    priority: 8,
    patterns: [
      {
        regex: /(برداشت|واریز|خرید)[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: /واریز/.test(rawType) ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },

  // 12. اسنپ‌پی / اسنپ (SnappPay)
  {
    id: 'snapppay',
    bankName: 'اسنپ‌پی',
    senderNumbers: ['SnappPay', 'Snapp', '10001414'],
    keywords: ['اسنپ پی', 'اسنپ‌پی', 'snapppay', 'اسنپ'],
    priority: 8,
    patterns: [
      {
        // "پرداخت اقساط اسنپ‌پی\nمبلغ: 350,000 تومان با موفقیت انجام شد\nسفارش: غذا"
        regex: /(پرداخت|خرید|تسویه)[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)[\s\S]*?(?:بابت|سفارش|پذیرنده)?\s*[:\-\s]*([^\n\r]+)?/i,
        extract: (matches) => {
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const merchant = matches[4]?.trim() || 'اسنپ';

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: 'expense',
            merchant,
          };
        },
      },
    ],
  },

  // 13. دیجی‌پی (DigiPay)
  {
    id: 'digipay',
    bankName: 'دیجی‌پی',
    senderNumbers: ['DigiPay', '10004545'],
    keywords: ['دیجی پی', 'دیجی‌پی', 'digipay'],
    priority: 8,
    patterns: [
      {
        regex: /(خرید|پرداخت|انتقال)[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)[\s\S]*?(?:پذیرنده|فروشگاه)?\s*[:\-\s]*([^\n\r]+)?/i,
        extract: (matches) => {
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const merchant = matches[4]?.trim() || 'دیجی‌کالا';

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: 'expense',
            merchant,
          };
        },
      },
    ],
  },

  // 14. آپ (Asan Pardakht - آسان پرداخت)
  {
    id: 'asanpardakht',
    bankName: 'آپ (آسان پرداخت)',
    senderNumbers: ['AsanPardakht', '733', '98733'],
    keywords: ['آپ', 'آسان پرداخت', '733'],
    priority: 8,
    patterns: [
      {
        regex: /(خرید|پرداخت|قبض)[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)[\s\S]*?(?:بابت|نام)?\s*[:\-\s]*([^\n\r]+)?/i,
        extract: (matches) => {
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const merchant = matches[4]?.trim() || 'پرداخت آپ';

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: 'expense',
            merchant,
          };
        },
      },
    ],
  },

  // 15. بانک قرض‌الحسنه مهر ایران (Mehr Iran)
  {
    id: 'mehriran',
    bankName: 'قرض‌الحسنه مهر',
    senderNumbers: ['+9830008585', 'MehrIran'],
    keywords: ['مهر ایران', 'قرض الحسنه مهر', 'مهرایران'],
    priority: 8,
    patterns: [
      {
        regex: /(برداشت|واریز|انتقال)[\s\S]*?مبلغ\s*[:\-\s]*([0-9,،]+)\s*(ریال|تومان)?[\s\S]*?(\d{4})[\s\S]*?(?:مانده|موجودی)\s*[:\-\s]*([0-9,،]+)?/i,
        extract: (matches) => {
          const rawType = matches[1];
          const rawAmount = parseNumberString(matches[2]);
          const unit = matches[3] === 'تومان' ? 'toman' : 'rial';
          const cardLast4 = matches[4];
          const rawBalance = matches[5] ? parseNumberString(matches[5]) : undefined;

          return {
            amount: unit === 'toman' ? rawAmount * 10 : rawAmount,
            type: /واریز/.test(rawType) ? 'income' : 'expense',
            cardLast4,
            balance: rawBalance !== undefined ? (unit === 'toman' ? rawBalance * 10 : rawBalance) : undefined,
          };
        },
      },
    ],
  },
];
