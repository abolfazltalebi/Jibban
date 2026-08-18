import { normalizePersianText, toLatinDigits } from '../../utils/digits';

/**
 * Filter out non-financial SMS such as OTPs, promotional campaigns,
 * two-step authentications, advertisements, lottery announcements, etc.
 */

export const NOISE_KEYWORDS = [
  'رمز پویا',
  'رمز یکبار مصرف',
  'رمز یکبارمصرف',
  'رمز موقت',
  'کد تایید',
  'کد تأیید',
  'کد فعالسازی',
  'کد ورود',
  'کد احراز',
  'تبلیغ',
  'جشنواره',
  'قرعه کشی',
  'قرعه‌کشی',
  'برنده',
  'تخفیف ویژه',
  'لغو ۱۱',
  'لغو 11',
  'لغو۱۱',
  'لغو: ۱۱',
  'ارسال ۱۱',
  'ارسال 11',
  'بیمه شما',
  'فروش اقساطی',
  'وام بدون ضامن',
  'اینترنت رایگان',
  'بسته اینترنت',
  'سامانه ثنا',
  'ابلاغیه الکترونیکی',
  'رمز عبور اینترنت بانک',
];

/**
 * Returns true if the SMS text is noise (OTP, marketing, etc.) and should NOT be parsed as a transaction.
 */
export function isNoiseSms(text: string): { isNoise: boolean; reason?: string } {
  if (!text || text.trim().length < 10) {
    return { isNoise: true, reason: 'متن پیامک بسیار کوتاه است' };
  }

  const normalized = normalizePersianText(toLatinDigits(text));

  for (const keyword of NOISE_KEYWORDS) {
    const normalizedKeyword = normalizePersianText(toLatinDigits(keyword));
    if (normalized.includes(normalizedKeyword)) {
      return { isNoise: true, reason: `شامل کلیدواژه فیلتر نویز: ${keyword}` };
    }
  }

  // Check if it's an OTP message that doesn't include monetary amounts
  if (
    (normalized.includes('کد') || normalized.includes('رمز')) &&
    !normalized.includes('مبلغ') &&
    !normalized.includes('ریال') &&
    !normalized.includes('تومان') &&
    !normalized.includes('برداشت') &&
    !normalized.includes('واریز') &&
    !normalized.includes('خرید')
  ) {
    return { isNoise: true, reason: 'پیامک اعتبارسنجی یا کد بدون تراکنش مالی' };
  }

  return { isNoise: false };
}
