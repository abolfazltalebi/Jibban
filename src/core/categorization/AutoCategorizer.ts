import { Category, ParsedSms } from '../../types';
import { matchKeywords } from './keywordMap';
import { MerchantMemoryService } from './MerchantMemory';

export interface CategorizationResult {
  predictedCategoryId: string;
  confidence: number;
  reason: string;
  rankedCategories: Category[];
  isHighConfidenceAutoConfirmed: boolean;
}

export class AutoCategorizer {
  /**
   * Evaluates the SMS / Transaction across all 3 layers
   */
  public static categorize(
    sms: ParsedSms | { amount: number; title?: string; merchant?: string; rawText?: string; occurredAt?: Date },
    allCategories: Category[]
  ): CategorizationResult {
    const textToSearch = [sms.merchant, (sms as any).title, sms.rawText].filter(Boolean).join(' ');
    const amountInRials = sms.amount || 0;
    const date = sms.occurredAt ? new Date(sms.occurredAt) : new Date();
    const hour = date.getHours();

    // 1. Layer 2 Check (Merchant Memory - Highest priority if learned multiple times)
    const memoryMatch = MerchantMemoryService.findMatch(textToSearch);
    if (memoryMatch && memoryMatch.useCount >= 2) {
      const cat = allCategories.find((c) => c.id === memoryMatch.categoryId);
      if (cat) {
        return {
          predictedCategoryId: cat.id,
          confidence: memoryMatch.confidence,
          reason: `یادگیری از ${memoryMatch.useCount} انتخاب قبلی شما`,
          rankedCategories: this.rankCategories(cat.id, allCategories, hour, amountInRials),
          isHighConfidenceAutoConfirmed: memoryMatch.confidence >= 0.9,
        };
      }
    }

    // 2. Layer 1 Check (Fixed Keyword Rules)
    const keywordMatch = matchKeywords(textToSearch);
    if (keywordMatch) {
      const cat = allCategories.find((c) => c.id === keywordMatch.categoryId);
      if (cat) {
        return {
          predictedCategoryId: cat.id,
          confidence: 0.88,
          reason: `تطابق کلمه کلیدی «${keywordMatch.matchedKeyword}»`,
          rankedCategories: this.rankCategories(cat.id, allCategories, hour, amountInRials),
          isHighConfidenceAutoConfirmed: false,
        };
      }
    }

    // 3. Layer 3 Check (Time & Amount Heuristics)
    // Morning (7:00 - 9:30 AM) and small amount (< 500,000 Rials = 50,000 Tomans) -> Likely Breakfast or Transport
    if (hour >= 6 && hour <= 10 && amountInRials > 0 && amountInRials <= 800_000) {
      const transportCat = allCategories.find((c) => c.id === 'transport');
      const foodCat = allCategories.find((c) => c.id === 'food');
      const primary = transportCat || foodCat || allCategories[0];

      return {
        predictedCategoryId: primary.id,
        confidence: 0.65,
        reason: 'حدس بر اساس زمان صبح و مبلغ خرد (حمل‌ونقل/صبحانه)',
        rankedCategories: this.rankCategories(primary.id, allCategories, hour, amountInRials),
        isHighConfidenceAutoConfirmed: false,
      };
    }

    // Default fallback: Uncategorized or general
    const uncategorized = allCategories.find((c) => c.id === 'other') || allCategories[0];
    return {
      predictedCategoryId: uncategorized.id,
      confidence: 0.3,
      reason: 'نیاز به انتخاب دسته‌بندی توسط کاربر',
      rankedCategories: this.rankCategories(uncategorized.id, allCategories, hour, amountInRials),
      isHighConfidenceAutoConfirmed: false,
    };
  }

  /**
   * Reorders categories so that the predicted category is first, followed by contextual top categories
   */
  private static rankCategories(
    topCategoryId: string,
    allCategories: Category[],
    hour: number,
    amount: number
  ): Category[] {
    const result: Category[] = [];
    const top = allCategories.find((c) => c.id === topCategoryId);
    if (top) result.push(top);

    // Contextual secondary candidates
    const secondaryIds =
      hour >= 12 && hour <= 15
        ? ['food', 'shopping', 'transport', 'bills']
        : hour >= 19 && hour <= 23
        ? ['food', 'entertainment', 'shopping', 'transport']
        : ['food', 'transport', 'shopping', 'bills', 'health', 'housing'];

    for (const id of secondaryIds) {
      if (id !== topCategoryId) {
        const found = allCategories.find((c) => c.id === id);
        if (found && !result.some((r) => r.id === found.id)) {
          result.push(found);
        }
      }
    }

    // Append any remaining
    for (const c of allCategories) {
      if (!result.some((r) => r.id === c.id)) {
        result.push(c);
      }
    }

    return result;
  }
}
