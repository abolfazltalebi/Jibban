import { toPersianDigits } from './digits';
import { CurrencyUnit } from '../types';

/**
 * Normalizes input amount to Rials (Base database unit)
 */
export function normalizeToRials(amount: number, unit: 'rial' | 'toman'): number {
  if (unit === 'toman') {
    return Math.round(amount * 10);
  }
  return Math.round(amount);
}

/**
 * Converts Rials to user-selected display unit
 */
export function rialsToDisplay(amountInRials: number, targetUnit: CurrencyUnit): number {
  if (targetUnit === 'toman') {
    return Math.round(amountInRials / 10);
  }
  return amountInRials;
}

/**
 * Formats a number with standard Persian 3-digit comma separators and unit
 * e.g. 120000 Rials -> "۱۲,۰۰۰ تومان" (if target is toman)
 */
export function formatCurrency(
  amountInRials: number,
  targetUnit: CurrencyUnit = 'toman',
  includeUnit = true,
  usePersianDigits = true
): string {
  const displayAmount = rialsToDisplay(amountInRials, targetUnit);
  const formattedWithCommas = Math.abs(displayAmount).toLocaleString('en-US');
  const digits = usePersianDigits ? toPersianDigits(formattedWithCommas) : formattedWithCommas;
  const sign = amountInRials < 0 ? '-' : '';

  if (!includeUnit) {
    return `${sign}${digits}`;
  }

  const unitLabel = targetUnit === 'toman' ? 'تومان' : 'ریال';
  return `${sign}${digits} ${unitLabel}`;
}

/**
 * Short representation for large numbers (e.g. 1.2M Tomans -> ۱.۲ میلیون تومان)
 */
export function formatCompactCurrency(
  amountInRials: number,
  targetUnit: CurrencyUnit = 'toman'
): string {
  const val = rialsToDisplay(amountInRials, targetUnit);
  const absVal = Math.abs(val);

  if (absVal >= 1_000_000_000) {
    const formatted = (val / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `${toPersianDigits(formatted)} میلیارد تومان`;
  }
  if (absVal >= 1_000_000) {
    const formatted = (val / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${toPersianDigits(formatted)} میلیون تومان`;
  }
  if (absVal >= 1_000) {
    const formatted = (val / 1_000).toFixed(0);
    return `${toPersianDigits(formatted)} هزار تومان`;
  }

  return formatCurrency(amountInRials, targetUnit);
}
