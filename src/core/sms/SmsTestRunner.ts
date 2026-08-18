import { SMS_SAMPLES, SmsTestFixture } from './smsSamples';
import { parseSms } from './SmsParser';
import { ParsedSms } from '../../types';

export interface TestResult {
  sample: SmsTestFixture;
  actual: ParsedSms | null;
  passed: boolean;
  errors: string[];
}

export function runAllSmsTests(): TestResult[] {
  return SMS_SAMPLES.map((sample) => {
    const actual = parseSms(sample.rawText, sample.sender, false);
    const errors: string[] = [];

    if (sample.expectedType === 'noise') {
      if (actual !== null) {
        errors.push(`Expected noise (null), but got transaction.`);
      }
    } else {
      if (!actual) {
        errors.push(`Expected valid transaction, but parser returned null.`);
      } else {
        // Compare amount
        if (actual.amount !== sample.expectedAmountRials) {
          errors.push(
            `Amount mismatch: expected ${sample.expectedAmountRials}, got ${actual.amount}`
          );
        }

        // Compare type
        if (actual.type !== sample.expectedType) {
          errors.push(
            `Type mismatch: expected ${sample.expectedType}, got ${actual.type}`
          );
        }

        // Compare card last 4 if provided
        if (sample.expectedCardLast4 && actual.cardLast4 !== sample.expectedCardLast4) {
          errors.push(
            `Card last4 mismatch: expected ${sample.expectedCardLast4}, got ${actual.cardLast4}`
          );
        }
      }
    }

    return {
      sample,
      actual,
      passed: errors.length === 0,
      errors,
    };
  });
}
