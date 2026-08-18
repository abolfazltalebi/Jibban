import { useState, useEffect } from 'react';
import {
  Account,
  Budget,
  Category,
  NotificationPayload,
  ParsedSms,
  Transaction,
  UserSettings,
} from '../types';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGETS,
  DEFAULT_CATEGORIES,
  INITIAL_TRANSACTIONS,
} from '../database/defaultData';
import { parseSms } from '../core/sms/SmsParser';
import { AutoCategorizer } from '../core/categorization/AutoCategorizer';
import { MerchantMemoryService } from '../core/categorization/MerchantMemory';
import { NotificationService } from '../core/notifications/NotificationService';

const STORAGE_KEY_TXS = 'jibban_transactions';
const STORAGE_KEY_CATS = 'jibban_categories';
const STORAGE_KEY_ACCS = 'jibban_accounts';
const STORAGE_KEY_BUDGETS = 'jibban_budgets';
const STORAGE_KEY_SETTINGS = 'jibban_settings';

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  settings: UserSettings;
  activeNotification: NotificationPayload | null;
  clipboardSms: ParsedSms | null;
}

// Initial state loader with localStorage resilience
function loadInitialState(): AppState {
  MerchantMemoryService.initialize();

  let transactions = INITIAL_TRANSACTIONS;
  let categories = DEFAULT_CATEGORIES;
  let accounts = DEFAULT_ACCOUNTS;
  let budgets = DEFAULT_BUDGETS;
  let settings: UserSettings = {
    currency: 'toman',
    theme: 'dark',
    biometricEnabled: false,
    isLocked: false,
    autoLockDelaySeconds: 60,
    hasCompletedOnboarding: true,
    selectedBanks: ['بلوبانک', 'بانک ملی', 'بانک ملت', 'بانک سامان'],
    autoClipboardDetect: true,
  };

  try {
    const storedTxs = localStorage.getItem(STORAGE_KEY_TXS);
    if (storedTxs) transactions = JSON.parse(storedTxs);

    const storedCats = localStorage.getItem(STORAGE_KEY_CATS);
    if (storedCats) categories = JSON.parse(storedCats);

    const storedAccs = localStorage.getItem(STORAGE_KEY_ACCS);
    if (storedAccs) accounts = JSON.parse(storedAccs);

    const storedBudgets = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (storedBudgets) budgets = JSON.parse(storedBudgets);

    const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (storedSettings) settings = { ...settings, ...JSON.parse(storedSettings) };
  } catch {
    // ignore
  }

  return {
    transactions,
    categories,
    accounts,
    budgets,
    settings,
    activeNotification: null,
    clipboardSms: null,
  };
}

let globalState: AppState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(globalState.transactions));
    localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(globalState.categories));
    localStorage.setItem(STORAGE_KEY_ACCS, JSON.stringify(globalState.accounts));
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(globalState.budgets));
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(globalState.settings));
  } catch {
    // ignore
  }
}

export function useAppStore() {
  const [, setRender] = useState(0);

  useEffect(() => {
    const listener = () => setRender((prev) => prev + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Action methods
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };

    globalState.transactions = [newTx, ...globalState.transactions];

    // Update account balance if account matched
    if (tx.accountId) {
      const acc = globalState.accounts.find((a) => a.id === tx.accountId);
      if (acc) {
        if (tx.type === 'expense') {
          acc.currentBalance = Math.max(0, acc.currentBalance - tx.amount);
        } else if (tx.type === 'income') {
          acc.currentBalance += tx.amount;
        }
      }
    }

    persist();
    notify();
    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    globalState.transactions = globalState.transactions.map((t) => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        // If user categorized, learn merchant memory
        if (updates.categoryId && (updated.merchant || updated.title)) {
          MerchantMemoryService.recordSelection(updated.merchant || updated.title, updates.categoryId);
        }
        return updated;
      }
      return t;
    });
    persist();
    notify();
  };

  const deleteTransaction = (id: string) => {
    globalState.transactions = globalState.transactions.filter((t) => t.id !== id);
    persist();
    notify();
  };

  const categorizeTransaction = (id: string, categoryId: string, customTitle?: string) => {
    updateTransaction(id, {
      categoryId,
      isConfirmed: true,
      ...(customTitle ? { title: customTitle } : {}),
    });
  };

  const processIncomingSms = async (rawSms: string, sender: string = '', fromClipboard = false) => {
    const parsed = parseSms(rawSms, sender, !fromClipboard);
    if (!parsed) return null;

    // Check AutoCategorizer
    const catResult = AutoCategorizer.categorize(parsed, globalState.categories);
    const matchedCategory = globalState.categories.find((c) => c.id === catResult.predictedCategoryId);

    // Find account by card last 4 or bank name
    const matchedAccount =
      globalState.accounts.find(
        (a) => (parsed.cardLast4 && a.cardLast4 === parsed.cardLast4) || a.bankName.includes(parsed.bankName)
      ) || globalState.accounts[0];

    const isExpense = parsed.type === 'expense';
    const isHighConfidence = catResult.isHighConfidenceAutoConfirmed;

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      amount: parsed.amount,
      type: isExpense ? 'expense' : 'income',
      categoryId: isExpense ? (isHighConfidence ? catResult.predictedCategoryId : 'other') : 'salary',
      accountId: matchedAccount?.id || 'acc_blu',
      title: parsed.merchant || (isExpense ? `خرید ${parsed.bankName}` : `واریز به ${parsed.bankName}`),
      merchant: parsed.merchant,
      occurredAt: parsed.occurredAt.toISOString(),
      createdAt: new Date().toISOString(),
      source: fromClipboard ? 'clipboard' : 'sms',
      rawSms,
      isConfirmed: isHighConfidence || !isExpense,
      confidence: parsed.confidence,
      bankName: parsed.bankName,
      cardLast4: parsed.cardLast4,
      balance: parsed.balance,
    };

    // Save transaction
    globalState.transactions = [newTx, ...globalState.transactions];
    persist();
    notify();

    // Trigger Notification
    const payload = await NotificationService.sendTransactionNotification(
      parsed,
      catResult.rankedCategories,
      isHighConfidence
    );

    globalState.activeNotification = payload;
    notify();

    return { transaction: newTx, notification: payload };
  };

  const dismissNotification = (id?: string) => {
    globalState.activeNotification = null;
    notify();
  };

  const setClipboardSms = (sms: ParsedSms | null) => {
    globalState.clipboardSms = sms;
    notify();
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    globalState.settings = { ...globalState.settings, ...updates };
    persist();
    notify();
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat_' + Date.now(),
    };
    globalState.categories = [...globalState.categories, newCat];
    persist();
    notify();
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    globalState.categories = globalState.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    persist();
    notify();
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: 'b_' + Date.now(),
    };
    globalState.budgets = [...globalState.budgets, newBudget];
    persist();
    notify();
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    globalState.budgets = globalState.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b));
    persist();
    notify();
  };

  const deleteBudget = (id: string) => {
    globalState.budgets = globalState.budgets.filter((b) => b.id !== id);
    persist();
    notify();
  };

  const bulkAddTransactions = (txs: Transaction[]) => {
    globalState.transactions = [...txs, ...globalState.transactions];
    persist();
    notify();
  };

  const resetAllData = () => {
    globalState = {
      transactions: INITIAL_TRANSACTIONS,
      categories: DEFAULT_CATEGORIES,
      accounts: DEFAULT_ACCOUNTS,
      budgets: DEFAULT_BUDGETS,
      settings: {
        currency: 'toman',
        theme: 'dark',
        biometricEnabled: false,
        isLocked: false,
        autoLockDelaySeconds: 60,
        hasCompletedOnboarding: true,
        selectedBanks: ['بلوبانک', 'بانک ملی', 'بانک ملت', 'بانک سامان'],
        autoClipboardDetect: true,
      },
      activeNotification: null,
      clipboardSms: null,
    };
    persist();
    notify();
  };

  return {
    state: globalState,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categorizeTransaction,
    processIncomingSms,
    dismissNotification,
    setClipboardSms,
    updateSettings,
    addCategory,
    updateCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    bulkAddTransactions,
    resetAllData,
  };
}
