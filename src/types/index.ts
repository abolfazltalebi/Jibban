export type TransactionType = 'expense' | 'income' | 'transfer' | 'unknown';
export type TransactionSource = 'sms' | 'manual' | 'clipboard';

export interface ParsedSms {
  amount: number; // in Rials
  type: TransactionType;
  bankName: string;
  cardLast4?: string;
  balance?: number; // in Rials
  merchant?: string;
  occurredAt: Date;
  rawText: string;
  confidence: number; // 0 to 1
  patternId?: string;
}

export interface Transaction {
  id: string;
  amount: number; // in Rials (normalized)
  type: 'expense' | 'income' | 'transfer';
  categoryId: string;
  accountId: string;
  title: string;
  note?: string;
  merchant?: string;
  occurredAt: string; // ISO string
  createdAt: string; // ISO string
  source: TransactionSource;
  rawSms?: string;
  isConfirmed: boolean;
  confidence: number;
  tags?: string[];
  bankName?: string;
  cardLast4?: string;
  balance?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId?: string;
  type: 'expense' | 'income';
  order: number;
  isDefault?: boolean;
}

export interface Account {
  id: string;
  name: string;
  bankName: string;
  cardLast4: string;
  color: string;
  currentBalance: number; // in Rials
  isActive: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number; // in Rials
  period: 'monthly' | 'weekly';
  startDate: string;
  alertThreshold: number; // e.g. 80 (%)
}

export interface MerchantMemoryItem {
  id: string;
  pattern: string;
  categoryId: string;
  useCount: number;
  lastUsedAt: string;
}

export interface SmsLogItem {
  id: string;
  rawText: string;
  sender: string;
  receivedAt: string;
  parsed: boolean;
  transactionId?: string;
  error?: string;
}

export type CurrencyUnit = 'toman' | 'rial';
export type AppTheme = 'dark' | 'light' | 'system';

export interface UserSettings {
  currency: CurrencyUnit;
  theme: AppTheme;
  biometricEnabled: boolean;
  isLocked: boolean;
  pinCode?: string;
  autoLockDelaySeconds: number;
  hasCompletedOnboarding: boolean;
  selectedBanks: string[];
  autoClipboardDetect: boolean;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  parsedSms: ParsedSms;
  topCategories: Category[];
  isDirectConfirm?: boolean;
  timestamp: number;
}
