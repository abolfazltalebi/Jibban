import { MerchantMemoryItem } from '../../types';
import { normalizePersianText } from '../../utils/digits';

/**
 * Layer 2: Learns from user category selections for merchants or SMS text snippets
 */

const STORAGE_KEY = 'jibban_merchant_memory';

export class MerchantMemoryService {
  private static memory: MerchantMemoryItem[] = [];

  public static initialize(initialData?: MerchantMemoryItem[]) {
    if (initialData && initialData.length > 0) {
      this.memory = [...initialData];
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.memory = JSON.parse(stored);
      }
    } catch {
      this.memory = [];
    }
  }

  public static getAll(): MerchantMemoryItem[] {
    return this.memory;
  }

  public static recordSelection(pattern: string, categoryId: string): void {
    if (!pattern || !categoryId) return;
    const cleanPattern = normalizePersianText(pattern).toLowerCase();

    const existingIndex = this.memory.findIndex(
      (m) => m.pattern.toLowerCase() === cleanPattern
    );

    if (existingIndex >= 0) {
      this.memory[existingIndex].categoryId = categoryId;
      this.memory[existingIndex].useCount += 1;
      this.memory[existingIndex].lastUsedAt = new Date().toISOString();
    } else {
      this.memory.push({
        id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        pattern: cleanPattern,
        categoryId,
        useCount: 1,
        lastUsedAt: new Date().toISOString(),
      });
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memory));
    } catch {
      // ignore storage error
    }
  }

  public static findMatch(text: string): { categoryId: string; confidence: number; useCount: number } | null {
    if (!text) return null;
    const normalized = normalizePersianText(text).toLowerCase();

    // Find exact or substring matches, prioritized by use count and recency
    const matches = this.memory.filter((item) =>
      normalized.includes(item.pattern) || item.pattern.includes(normalized)
    );

    if (matches.length === 0) return null;

    // Sort by useCount descending
    matches.sort((a, b) => b.useCount - a.useCount);
    const top = matches[0];

    const confidence = Math.min(0.98, 0.7 + top.useCount * 0.05);

    return {
      categoryId: top.categoryId,
      confidence,
      useCount: top.useCount,
    };
  }
}
