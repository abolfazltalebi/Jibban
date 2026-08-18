import { Account, Budget, Category, Transaction } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'خوراکی و رستوران', icon: 'Utensils', color: '#F97316', type: 'expense', order: 1, isDefault: true },
  { id: 'transport', name: 'حمل‌ونقل و بنزین', icon: 'Car', color: '#06B6D4', type: 'expense', order: 2, isDefault: true },
  { id: 'shopping', name: 'خرید و پوشاک', icon: 'ShoppingBag', color: '#EC4899', type: 'expense', order: 3, isDefault: true },
  { id: 'bills', name: 'قبوض و اینترنت', icon: 'FileText', color: '#8B5CF6', type: 'expense', order: 4, isDefault: true },
  { id: 'health', name: 'سلامت و دارو', icon: 'HeartPulse', color: '#EF4444', type: 'expense', order: 5, isDefault: true },
  { id: 'entertainment', name: 'تفریح و گردش', icon: 'Gamepad2', color: '#10B981', type: 'expense', order: 6, isDefault: true },
  { id: 'education', name: 'آموزش و کتاب', icon: 'GraduationCap', color: '#3B82F6', type: 'expense', order: 7, isDefault: true },
  { id: 'housing', name: 'مسکن و ساختمان', icon: 'Home', color: '#6366F1', type: 'expense', order: 8, isDefault: true },
  { id: 'investment', name: 'سرمایه‌گذاری و طلا', icon: 'TrendingUp', color: '#EAB308', type: 'expense', order: 9, isDefault: true },
  { id: 'gift', name: 'هدیه و خیرات', icon: 'Gift', color: '#D946EF', type: 'expense', order: 10, isDefault: true },
  { id: 'salary', name: 'حقوق و دستمزد', icon: 'Coins', color: '#10B981', type: 'income', order: 11, isDefault: true },
  { id: 'other', name: 'سایر و متفرقه', icon: 'MoreHorizontal', color: '#64748B', type: 'expense', order: 12, isDefault: true },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_blu',
    name: 'بلوبانک سامان',
    bankName: 'بلوبانک',
    cardLast4: '5678',
    color: '#0284C7',
    currentBalance: 42_500_000, // 4,250,000 Tomans in Rials
    isActive: true,
  },
  {
    id: 'acc_melli',
    name: 'کارت حقوق ملی',
    bankName: 'بانک ملی',
    cardLast4: '4321',
    color: '#DC2626',
    currentBalance: 185_000_000, // 18.5M Tomans
    isActive: true,
  },
  {
    id: 'acc_mellat',
    name: 'کارت خرید ملت',
    bankName: 'بانک ملت',
    cardLast4: '9876',
    color: '#E11D48',
    currentBalance: 64_000_000, // 6.4M Tomans
    isActive: true,
  },
  {
    id: 'acc_saman',
    name: 'کارت بانک سامان',
    bankName: 'بانک سامان',
    cardLast4: '4589',
    color: '#4F46E5',
    currentBalance: 128_000_000,
    isActive: true,
  },
];

export const DEFAULT_BUDGETS: Budget[] = [
  {
    id: 'b_total',
    categoryId: 'all',
    amount: 150_000_000, // 15M Tomans in Rials
    period: 'monthly',
    startDate: new Date().toISOString(),
    alertThreshold: 80,
  },
  {
    id: 'b_food',
    categoryId: 'food',
    amount: 50_000_000, // 5M Tomans
    period: 'monthly',
    startDate: new Date().toISOString(),
    alertThreshold: 80,
  },
  {
    id: 'b_transport',
    categoryId: 'transport',
    amount: 25_000_000, // 2.5M Tomans
    period: 'monthly',
    startDate: new Date().toISOString(),
    alertThreshold: 80,
  },
  {
    id: 'b_shopping',
    categoryId: 'shopping',
    amount: 35_000_000, // 3.5M Tomans
    period: 'monthly',
    startDate: new Date().toISOString(),
    alertThreshold: 85,
  },
];

const now = new Date();
const daysAgo = (days: number, hoursOffset: number = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    amount: 1850000, // 185,000 Tomans
    type: 'expense',
    categoryId: 'food',
    accountId: 'acc_blu',
    title: 'خرید سوپرمارکت افق کوروش',
    merchant: 'افق کوروش',
    occurredAt: daysAgo(0, 2),
    createdAt: daysAgo(0, 2),
    source: 'sms',
    rawSms: 'برداشت از کارت ۵۶۷۸\nمبلغ: ۱,۸۵۰,۰۰۰ ریال\nمانده: ۴۲,۵۰۰,۰۰۰ ریال\nفروشگاه افق کوروش\nبلوبانک',
    isConfirmed: true,
    confidence: 0.98,
    bankName: 'بلوبانک',
    cardLast4: '5678',
  },
  {
    id: 'tx_2',
    amount: 450000, // 45,000 Tomans
    type: 'expense',
    categoryId: 'transport',
    accountId: 'acc_blu',
    title: 'سفر با اسنپ',
    merchant: 'اسنپ',
    occurredAt: daysAgo(0, 5),
    createdAt: daysAgo(0, 5),
    source: 'sms',
    rawSms: 'برداشت از کارت ۵۶۷۸\nمبلغ: ۴۵۰,۰۰۰ ریال\nمانده: ۴۴,۳۵۰,۰۰۰ ریال\nاسنپ\nبلوبانک',
    isConfirmed: true,
    confidence: 0.95,
    bankName: 'بلوبانک',
    cardLast4: '5678',
  },
  {
    id: 'tx_3',
    amount: 6800000, // 680,000 Tomans
    type: 'expense',
    categoryId: 'shopping',
    accountId: 'acc_mellat',
    title: 'خرید از دیجی‌کالا',
    merchant: 'دیجی‌کالا',
    occurredAt: daysAgo(1, 4),
    createdAt: daysAgo(1, 4),
    source: 'sms',
    rawSms: 'بانک ملت\nبرداشت 6,800,000 ریال\nاز حساب 9876\nمانده 64,000,000 ریال\nدیجی‌کالا',
    isConfirmed: true,
    confidence: 0.95,
    bankName: 'بانک ملت',
    cardLast4: '9876',
  },
  {
    id: 'tx_4',
    amount: 1200000, // 120,000 Tomans
    type: 'expense',
    categoryId: 'food',
    accountId: 'acc_saman',
    title: 'کافه لمیز',
    merchant: 'کافه لمیز',
    occurredAt: daysAgo(1, 8),
    createdAt: daysAgo(1, 8),
    source: 'sms',
    rawSms: 'بانک سامان\nخرید کارت 4589\nمبلغ: 1,200,000 ریال\nمانده: 128,000,000 ریال\nپذیرنده: کافه لمیز',
    isConfirmed: true,
    confidence: 0.92,
    bankName: 'بانک سامان',
    cardLast4: '4589',
  },
  {
    id: 'tx_5',
    amount: 28000000, // 2.8M Tomans
    type: 'income',
    categoryId: 'salary',
    accountId: 'acc_melli',
    title: 'واریز پاداش پروژه',
    merchant: 'شرکت فناوری',
    occurredAt: daysAgo(2, 6),
    createdAt: daysAgo(2, 6),
    source: 'sms',
    rawSms: 'بانک ملی ایران\nواریز: ۲۸,۰۰۰,۰۰۰ ریال\nبه: ۶۰۳۷۹۹***۴۳۲۱\nمانده: ۱۸۵,۰۰۰,۰۰۰ ریال',
    isConfirmed: true,
    confidence: 0.99,
    bankName: 'بانک ملی',
    cardLast4: '4321',
  },
  {
    id: 'tx_6',
    amount: 950000, // 95,000 Tomans (Unconfirmed for badge alert)
    type: 'expense',
    categoryId: 'other',
    accountId: 'acc_melli',
    title: 'خرید پایانه فروش',
    merchant: 'پایانه فروشگاهی',
    occurredAt: daysAgo(2, 10),
    createdAt: daysAgo(2, 10),
    source: 'sms',
    rawSms: 'بانک ملی ایران\nبرداشت: ۹۵۰,۰۰۰ ریال\nاز: ۶۰۳۷۹۹***۴۳۲۱\nمانده: ۱۵۷,۰۰۰,۰۰۰ ریال',
    isConfirmed: false,
    confidence: 0.4,
    bankName: 'بانک ملی',
    cardLast4: '4321',
  },
  {
    id: 'tx_7',
    amount: 1500000, // 150,000 Tomans (Unconfirmed)
    type: 'expense',
    categoryId: 'other',
    accountId: 'acc_saman',
    title: 'برداشت شتابی',
    merchant: 'انتقال شتاب',
    occurredAt: daysAgo(3, 3),
    createdAt: daysAgo(3, 3),
    source: 'sms',
    rawSms: 'بانک سامان\nخرید کارت 4589\nمبلغ: 1,500,000 ریال\nمانده: 129,200,000 ریال',
    isConfirmed: false,
    confidence: 0.45,
    bankName: 'بانک سامان',
    cardLast4: '4589',
  },
  {
    id: 'tx_8',
    amount: 3200000, // 320,000 Tomans
    type: 'expense',
    categoryId: 'bills',
    accountId: 'acc_blu',
    title: 'پرداخت قبض موبایل و اینترنت',
    merchant: 'همراه اول',
    occurredAt: daysAgo(4, 7),
    createdAt: daysAgo(4, 7),
    source: 'sms',
    rawSms: 'برداشت از کارت ۵۶۷۸\nمبلغ: ۳,۲۰۰,۰۰۰ ریال\nمانده: ۴۶,۲۰۰,۰۰۰ ریال\nهمراه اول\nبلوبانک',
    isConfirmed: true,
    confidence: 0.96,
    bankName: 'بلوبانک',
    cardLast4: '5678',
  },
];
