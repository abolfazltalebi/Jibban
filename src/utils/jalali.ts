import { toPersianDigits } from './digits';

/**
 * Accurate conversion between Gregorian and Solar Hijri (Shamsi / Jalali)
 */

interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const PERSIAN_WEEKDAY_NAMES = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
];

/**
 * Converts Gregorian date to Jalali
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Format a Date or ISO string to Persian formatted string
 * e.g. "۲۳ آذر ۱۴۰۴" or "امروز، ۲۳ آذر" or "ساعت ۱۴:۳۵"
 */
export function formatJalaliDate(
  dateInput: Date | string | number,
  format: 'full' | 'short' | 'withTime' | 'timeOnly' | 'relativeDay' = 'full'
): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${toPersianDigits(hours)}:${toPersianDigits(minutes)}`;
  const monthName = PERSIAN_MONTH_NAMES[jm - 1];
  const dayStr = toPersianDigits(jd);
  const yearStr = toPersianDigits(jy);

  if (format === 'timeOnly') {
    return timeStr;
  }

  if (format === 'short') {
    return `${dayStr} ${monthName}`;
  }

  if (format === 'withTime') {
    return `${dayStr} ${monthName} ${yearStr} - ${timeStr}`;
  }

  if (format === 'relativeDay') {
    const today = new Date();
    const todayJalali = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    if (todayJalali.jy === jy && todayJalali.jm === jm && todayJalali.jd === jd) {
      return `امروز، ${dayStr} ${monthName}`;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestJalali = gregorianToJalali(yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate());
    if (yestJalali.jy === jy && yestJalali.jm === jm && yestJalali.jd === jd) {
      return `دیروز، ${dayStr} ${monthName}`;
    }

    return `${dayStr} ${monthName} ${yearStr}`;
  }

  // default 'full'
  return `${dayStr} ${monthName} ${yearStr}`;
}

export function getCurrentJalaliMonthName(): string {
  const today = new Date();
  const { jm } = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  return PERSIAN_MONTH_NAMES[jm - 1];
}

export function getDaysRemainingInCurrentJalaliMonth(): { remaining: number; totalDays: number; currentDay: number } {
  const today = new Date();
  const { jm, jd } = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const totalDays = jm <= 6 ? 31 : jm <= 11 ? 30 : 29; // 29/30 for Esfand
  const remaining = Math.max(0, totalDays - jd);
  return { remaining, totalDays, currentDay: jd };
}
