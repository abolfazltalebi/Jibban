import { normalizePersianText } from '../../utils/digits';

export interface KeywordCategoryMapping {
  categoryId: string;
  categoryName: string;
  keywords: string[];
}

export const KEYWORD_CATEGORY_RULES: KeywordCategoryMapping[] = [
  {
    categoryId: 'transport',
    categoryName: 'حمل‌ونقل',
    keywords: [
      'اسنپ',
      'تپسی',
      'ماکسیم',
      'بنزین',
      'پمپ بنزین',
      'جایگاه سوخت',
      'مترو',
      'اتوبوس',
      'بی آر تی',
      'تاکسی',
      'بلیط',
      'بلیت',
      'علی بابا',
      'فلای تودی',
      'مستر بلیط',
      'پارکینگ',
      'عوارضی',
      'طرح ترافیک',
    ],
  },
  {
    categoryId: 'food',
    categoryName: 'خوراکی و رستوران',
    keywords: [
      'اسنپ فود',
      'اسنپ‌فود',
      'چیلیوری',
      'رستوران',
      'کافه',
      'قهوه',
      'فست فود',
      'فست‌فود',
      'سوپرمارکت',
      'هایپر',
      'کوروش',
      'افق کوروش',
      'جانبو',
      'میوه',
      'نانوایی',
      'نان',
      'شیرینی',
      'قنادی',
      'پروتئین',
      'قصابی',
      'مرغ',
      'پیتزا',
      'ساندویچ',
      'آبمیوه',
      'بستنی',
    ],
  },
  {
    categoryId: 'shopping',
    categoryName: 'خرید اینترنتی و حضوری',
    keywords: [
      'دیجی کالا',
      'دیجی‌کالا',
      'بامیلو',
      'ترب',
      'ایمالز',
      'پوشاک',
      'لباس',
      'کفش',
      'کیف',
      'فروشگاه',
      'پاساژ',
      'لوازم خانگی',
      'کتاب',
      'دیجی‌پی',
      'اسنپ‌پی',
      'عطر',
      'آرایشی',
      'بهداشتی',
    ],
  },
  {
    categoryId: 'health',
    categoryName: 'سلامت و درمان',
    keywords: [
      'داروخانه',
      'دارو',
      'بیمارستان',
      'کلینیک',
      'آزمایشگاه',
      'دکتر',
      'پزشک',
      'دندانپزشکی',
      'فیزیوتراپی',
      'عینک',
      'بینایی سنجی',
      'سونوگرافی',
      'رادیولوژی',
      'درمانگاه',
    ],
  },
  {
    categoryId: 'bills',
    categoryName: 'قبوض و شارژ',
    keywords: [
      'شارژ',
      'ایرانسل',
      'همراه اول',
      'رایتل',
      'شاتل',
      'آسیاتک',
      'مخابرات',
      'اینترنت',
      'قبض آب',
      'قبض برق',
      'قبض گاز',
      'قبض تلفن',
      'شرکت توزیع برق',
      'اداره گاز',
      'شهرداری',
      'خلافی',
      'جریمه',
    ],
  },
  {
    categoryId: 'entertainment',
    categoryName: 'تفریح و سرگرمی',
    keywords: [
      'سینما',
      'تئاتر',
      'استخر',
      'باشگاه',
      'بدنسازی',
      'گیم نت',
      'شهربازی',
      'کنسرت',
      'ایران کنسرت',
      'تیوال',
      'سینماتیکت',
      'سفر',
      'هتل',
      'اقامتگاه',
      'جاجیگا',
      'شب',
    ],
  },
  {
    categoryId: 'education',
    categoryName: 'آموزش',
    keywords: [
      'دانشگاه',
      'مدرسه',
      'آموزشگاه',
      'کلاس',
      'دوره',
      'مکتب خونه',
      'فرادرس',
      'کتابخانه',
      'کتابفروشی',
      'انتشارات',
      'شهریه',
    ],
  },
  {
    categoryId: 'investment',
    categoryName: 'سرمایه‌گذاری',
    keywords: [
      'طلا',
      'صرافی',
      'بورس',
      'سهام',
      'کارگزاری',
      'مفید',
      'آگاه',
      'فارابی',
      'رمز ارز',
      'نوبیتکس',
      'والکس',
      'تتر',
      'سکه',
      'صندوق',
    ],
  },
  {
    categoryId: 'housing',
    categoryName: 'مسکن و ساختمان',
    keywords: [
      'اجاره',
      'شارژ ساختمان',
      'ودیعه',
      'تعمیرات',
      'لوله کشی',
      'نقاشی',
      'تاسیسات',
      'املاک',
    ],
  },
];

/**
 * Matches text against Layer 1 keyword dictionary
 */
export function matchKeywords(text: string): { categoryId: string; categoryName: string; matchedKeyword: string } | null {
  if (!text) return null;
  const normalized = normalizePersianText(text);

  for (const rule of KEYWORD_CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = normalizePersianText(kw);
      if (normalized.includes(normalizedKw)) {
        return {
          categoryId: rule.categoryId,
          categoryName: rule.categoryName,
          matchedKeyword: kw,
        };
      }
    }
  }

  return null;
}
