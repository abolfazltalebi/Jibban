/**
 * Digits & String Normalization Utilities for Persian & Arabic numerals
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts all Persian and Arabic digits in a string to standard Latin (ASCII) digits
 */
export function toLatinDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  let str = String(input);
  
  // Replace Persian digits
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), String(i));
  }
  
  // Replace Arabic digits
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(ARABIC_DIGITS[i], 'g'), String(i));
  }
  
  // Replace arabic character variations (ي -> ی , ك -> ک)
  str = str.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  
  return str;
}

/**
 * Converts all Latin digits in a string or number to Persian digits
 */
export function toPersianDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/**
 * Normalizes Persian text: unifies spaces, removes half-space anomalies, fixes standard characters
 */
export function normalizePersianText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, ' ') // Replace zero-width spaces with regular space for regex uniformity
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips non-digit characters except for period (optional decimal)
 */
export function extractDigitsOnly(text: string): string {
  const normalized = toLatinDigits(text);
  return normalized.replace(/[^\d]/g, '');
}
