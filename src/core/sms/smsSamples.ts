export interface SmsTestFixture {
  id: string;
  rawText: string;
  sender: string;
  expectedBank: string;
  expectedAmountRials: number;
  expectedType: 'expense' | 'income' | 'noise';
  expectedCardLast4?: string;
  description: string;
}

export const SMS_SAMPLES: SmsTestFixture[] = [
  // 1. بلوبانک - خرید سوپرمارکت
  {
    id: 'blu_expense_1',
    rawText: 'برداشت از کارت ۵۶۷۸\nمبلغ: ۴۵۰,۰۰۰ ریال\nمانده: ۲,۱۰۰,۰۰۰ ریال\nفروشگاه افق کوروش\nبلوبانک',
    sender: 'BLUBANK',
    expectedBank: 'بلوبانک',
    expectedAmountRials: 450000,
    expectedType: 'expense',
    expectedCardLast4: '5678',
    description: 'خرید با کارت بلوبانک از افق کوروش',
  },
  // 2. بلوبانک - واریز حقوق
  {
    id: 'blu_income_2',
    rawText: 'واریز به حساب ۵۶۷۸\nمبلغ: ۸۵,۰۰۰,۰۰۰ ریال\nمانده: ۱۱۰,۴۰۰,۰۰۰ ریال\nواریز حقوق شرکت\nبلوبانک',
    sender: 'BLUBANK',
    expectedBank: 'بلوبانک',
    expectedAmountRials: 85000000,
    expectedType: 'income',
    expectedCardLast4: '5678',
    description: 'واریز حقوق به کارت بلوبانک',
  },
  // 3. بانک ملی - خرید کارت
  {
    id: 'melli_expense_3',
    rawText: 'بانک ملی ایران\nبرداشت: ۱,۵۰۰,۰۰۰ ریال\nاز: ۶۰۳۷۹۹***۴۳۲۱\nمانده: ۵,۲۰۰,۰۰۰ ریال\n۱۴۰۴/۰۹/۲۳ ۱۶:۴۰',
    sender: '20004000',
    expectedBank: 'بانک ملی',
    expectedAmountRials: 1500000,
    expectedType: 'expense',
    expectedCardLast4: '4321',
    description: 'برداشت از کارت ساپتا بانک ملی',
  },
  // 4. بانک ملی - واریز پایا
  {
    id: 'melli_income_4',
    rawText: 'بانک ملی ایران\nواریز: ۳,۰۰۰,۰۰۰ ریال\nبه: ۶۰۳۷۹۹***۴۳۲۱\nمانده: ۸,۲۰۰,۰۰۰ ریال\nانتقال پایا',
    sender: '20004000',
    expectedBank: 'بانک ملی',
    expectedAmountRials: 3000000,
    expectedType: 'income',
    expectedCardLast4: '4321',
    description: 'واریز پایا به حساب بانک ملی',
  },
  // 5. بانک ملت - خرید پوز
  {
    id: 'mellat_expense_5',
    rawText: 'بانک ملت\nبرداشت 200,000 ریال\nاز حساب 9876\nمانده 4,500,000 ریال\n1404/09/23-11:15',
    sender: '20000',
    expectedBank: 'بانک ملت',
    expectedAmountRials: 200000,
    expectedType: 'expense',
    expectedCardLast4: '9876',
    description: 'خرید از پایانه فروش بانک ملت',
  },
  // 6. بانک ملت - واریز شبا
  {
    id: 'mellat_income_6',
    rawText: 'بانک ملت\nواریز 12,000,000 ریال\nبه حساب 9876\nمانده 16,500,000 ریال\n1404/09/23-10:00',
    sender: '20000',
    expectedBank: 'بانک ملت',
    expectedAmountRials: 12000000,
    expectedType: 'income',
    expectedCardLast4: '9876',
    description: 'واریز بانکی به حساب ملت',
  },
  // 7. بانک سامان - خرید رستوران
  {
    id: 'saman_expense_7',
    rawText: 'بانک سامان\nخرید کارت 4589\nمبلغ: 850,000 ریال\nمانده: 12,300,000 ریال\nپذیرنده: رستوران ارکیده',
    sender: 'BankSaman',
    expectedBank: 'بانک سامان',
    expectedAmountRials: 850000,
    expectedType: 'expense',
    expectedCardLast4: '4589',
    description: 'خرید رستوران با کارت سامان',
  },
  // 8. بانک سامان - واریز ساتنا
  {
    id: 'saman_income_8',
    rawText: 'بانک سامان\nواریز کارت 4589\nمبلغ: 25,000,000 ریال\nمانده: 37,300,000 ریال',
    sender: '200000',
    expectedBank: 'بانک سامان',
    expectedAmountRials: 25000000,
    expectedType: 'income',
    expectedCardLast4: '4589',
    description: 'واریز مستقیم به حساب سامان',
  },
  // 9. بانک پاسارگاد - خرید اینترنتی
  {
    id: 'pasargad_expense_9',
    rawText: 'بانک پاسارگاد\nبرداشت از حساب: 3344\nمبلغ: 1,250,000 ریال\nموجودی: 6,700,000 ریال',
    sender: 'Pasargad',
    expectedBank: 'بانک پاسارگاد',
    expectedAmountRials: 1250000,
    expectedType: 'expense',
    expectedCardLast4: '3344',
    description: 'خرید اینترنتی حساب پاسارگاد',
  },
  // 10. بانک پاسارگاد - انتقال به حساب
  {
    id: 'pasargad_income_10',
    rawText: 'بانک پاسارگاد\nواریز به حساب: 3344\nمبلغ: 5,000,000 ریال\nموجودی: 11,700,000 ریال',
    sender: 'Pasargad',
    expectedBank: 'بانک پاسارگاد',
    expectedAmountRials: 5000000,
    expectedType: 'income',
    expectedCardLast4: '3344',
    description: 'واریز به حساب پاسارگاد',
  },
  // 11. بانک تجارت - پرداخت بنزین
  {
    id: 'tejarat_expense_11',
    rawText: 'بانک تجارت\nبرداشت\nمبلغ: 300,000 ریال\nکارت: 7712\nمانده: 1,800,000 ریال',
    sender: 'TejaratBank',
    expectedBank: 'بانک تجارت',
    expectedAmountRials: 300000,
    expectedType: 'expense',
    expectedCardLast4: '7712',
    description: 'پرداخت پمپ بنزین کارت تجارت',
  },
  // 12. بانک صادرات - خرید روزانه
  {
    id: 'saderat_expense_12',
    rawText: 'بانک صادرات\nکسر مبلغ 650,000 ریال\nحساب 5511\nمانده 8,900,000 ریال',
    sender: 'SaderatBank',
    expectedBank: 'بانک صادرات',
    expectedAmountRials: 650000,
    expectedType: 'expense',
    expectedCardLast4: '5511',
    description: 'کسر وجه حساب سپهر صادرات',
  },
  // 13. بانک سپه - برداشت نقدی
  {
    id: 'sepah_expense_13',
    rawText: 'بانک سپه\nبرداشت 2,000,000 ریال\nاز کارت 8821\nمانده: 14,000,000 ریال',
    sender: 'SepahBank',
    expectedBank: 'بانک سپه',
    expectedAmountRials: 2000000,
    expectedType: 'expense',
    expectedCardLast4: '8821',
    description: 'برداشت وجه کارت سپه',
  },
  // 14. بانک کشاورزی - خرید بذر و کود
  {
    id: 'keshavarzi_expense_14',
    rawText: 'بانک کشاورزی\nخرید\nمبلغ: 1,400,000 ریال\n603770***6612\nمانده: 9,300,000 ریال',
    sender: 'B.Keshavarzi',
    expectedBank: 'بانک کشاورزی',
    expectedAmountRials: 1400000,
    expectedType: 'expense',
    expectedCardLast4: '6612',
    description: 'خرید از پایانه فروش کشاورزی',
  },
  // 15. بانک پارسیان - خرید پوشاک
  {
    id: 'parsian_expense_15',
    rawText: 'بانک پارسیان\nبرداشت 3,400,000 ریال\nکارت 9021\nمانده: 7,100,000 ریال',
    sender: 'ParsianBank',
    expectedBank: 'بانک پارسیان',
    expectedAmountRials: 3400000,
    expectedType: 'expense',
    expectedCardLast4: '9021',
    description: 'برداشت از کارت پارسیان',
  },
  // 16. بانک شهر - بلیت مترو و اتوبوس
  {
    id: 'shahr_expense_16',
    rawText: 'بانک شهر\nخرید\nمبلغ: 150,000 ریال\n504706***1190\nمانده: 3,250,000 ریال',
    sender: 'ShahrBank',
    expectedBank: 'بانک شهر',
    expectedAmountRials: 150000,
    expectedType: 'expense',
    expectedCardLast4: '1190',
    description: 'شارژ شهروندی بانک شهر',
  },
  // 17. اسنپ‌پی - خرید اقساطی
  {
    id: 'snapppay_expense_17',
    rawText: 'پرداخت اقساط اسنپ‌پی\nمبلغ: 350,000 تومان با موفقیت انجام شد\nسفارش: لوازم آرایشی',
    sender: 'SnappPay',
    expectedBank: 'اسنپ‌پی',
    expectedAmountRials: 3500000, // 350,000 Tomans = 3,500,000 Rials
    expectedType: 'expense',
    description: 'پرداخت قسط سرویس اعتباری اسنپ‌پی',
  },
  // 18. دیجی‌پی - خرید لوازم جانبی
  {
    id: 'digipay_expense_18',
    rawText: 'دیجی‌پی: خرید موفق\nمبلغ: 820,000 تومان\nفروشگاه دیجی‌کالا',
    sender: 'DigiPay',
    expectedBank: 'دیجی‌پی',
    expectedAmountRials: 8200000, // Tomans normalized to Rials
    expectedType: 'expense',
    description: 'خرید از درگاه کیف پول دیجی‌پی',
  },
  // 19. آسان پرداخت (آپ) - خرید شارژ سیمکارت
  {
    id: 'ap_expense_19',
    rawText: 'آپ (آسان پرداخت)\nخرید شارژ ایرانسل\nمبلغ: 200,000 ریال\nبا موفقیت انجام گردید',
    sender: 'AsanPardakht',
    expectedBank: 'آپ (آسان پرداخت)',
    expectedAmountRials: 200000,
    expectedType: 'expense',
    description: 'خرید شارژ با آپ',
  },
  // 20. بانک مهر ایران - اقساط وام
  {
    id: 'mehr_expense_20',
    rawText: 'قرض‌الحسنه مهر ایران\nبرداشت\nمبلغ: 4,500,000 ریال\n606373***5522\nمانده: 1,100,000 ریال',
    sender: 'MehrIran',
    expectedBank: 'قرض‌الحسنه مهر',
    expectedAmountRials: 4500000,
    expectedType: 'expense',
    expectedCardLast4: '5522',
    description: 'کسر قسط وام مهر ایران',
  },
  // 21. فیلتر نویز: رمز پویا بانک ملی
  {
    id: 'noise_otp_1',
    rawText: 'رمز یکبار مصرف شما: 748923\nکارت بانک ملی ایران\nاعتبار: 120 ثانیه',
    sender: '20004000',
    expectedBank: '',
    expectedAmountRials: 0,
    expectedType: 'noise',
    description: 'فیلتر پیامک رمز پویا OTP',
  },
  // 22. فیلتر نویز: پیامک تبلیغاتی لغو ۱۱
  {
    id: 'noise_ad_2',
    rawText: 'جشنواره بزرگ یلدا! تا ۷۰٪ تخفیف خرید کفش و پوشاک. لغو ۱۱',
    sender: '982000',
    expectedBank: '',
    expectedAmountRials: 0,
    expectedType: 'noise',
    description: 'فیلتر پیامک تبلیغاتی لغو 11',
  },
  // 23. فیلتر نویز: کد ورود دیجی‌کالا
  {
    id: 'noise_otp_3',
    rawText: 'کد تایید ورود به دیجی‌کالا: 82910\nاین کد را در اختیار دیگران قرار ندهید.',
    sender: 'Digikala',
    expectedBank: '',
    expectedAmountRials: 0,
    expectedType: 'noise',
    description: 'کد احراز هویت ورود',
  },
  // 24. تراکنش عمومی با نیم‌فاصله و اعداد فارسی
  {
    id: 'generic_persian_24',
    rawText: 'خرید از فروشگاه اتکا\nمبلغ ۱۲۰,۰۰۰ تومان\nکارت ۲۳۹۰',
    sender: 'Bank',
    expectedBank: 'بانک ناشناس',
    expectedAmountRials: 1200000,
    expectedType: 'expense',
    expectedCardLast4: '2390',
    description: 'تراکنش فرمت عمومی با واحد تومان',
  },
  // 25. واریز عمومی سود سهام عدالت
  {
    id: 'generic_income_25',
    rawText: 'واریز سود سهام عدالت به شماره حساب ۶۶۱۱ مبلغ: ۷,۲۰۰,۰۰۰ ریال',
    sender: 'Paya',
    expectedBank: 'بانک ناشناس',
    expectedAmountRials: 7200000,
    expectedType: 'income',
    expectedCardLast4: '6611',
    description: 'واریز سود سهام فرمت جنریک',
  },
];
