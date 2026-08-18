import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Plus,
  Zap,
  Sparkles,
  CreditCard,
  ChevronLeft,
  Calendar,
  PieChart,
  Target,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import { formatJalaliDate, getCurrentJalaliMonthName } from '../../utils/jalali';
import { toPersianDigits } from '../../utils/digits';
import { NavigationTab } from '../common/BottomNav';

interface HomeScreenProps {
  onChangeTab: (tab: NavigationTab) => void;
  onOpenManualEntry: () => void;
  onOpenSmsSimulator: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onChangeTab,
  onOpenManualEntry,
  onOpenSmsSimulator,
}) => {
  const { state } = useAppStore();
  const currency = state.settings.currency;

  // Monthly stats
  const expenses = state.transactions.filter((t) => t.type === 'expense');
  const incomes = state.transactions.filter((t) => t.type === 'income');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  // Total balance calculation
  const totalBalance = state.accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  // Unconfirmed count
  const unconfirmedTxs = state.transactions.filter((t) => !t.isConfirmed);

  // Budget calculations
  const totalBudget = state.budgets.find((b) => b.categoryId === 'all') || {
    amount: 150_000_000,
  };
  const budgetPercentage = Math.min(100, Math.round((totalExpense / totalBudget.amount) * 100));

  // Category breakdown for donut / share
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((t) => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catId, amount]) => {
      const cat = state.categories.find((c) => c.id === catId) || {
        name: 'متفرقه',
        color: '#f97316',
      };
      const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return { cat, amount, percent };
    });

  // Get emoji based on category or title
  const getTransactionEmoji = (title: string, catId: string) => {
    if (title.includes('کافه') || title.includes('رستوران') || catId === 'food') return '☕';
    if (title.includes('اسنپ') || title.includes('تاکسی') || catId === 'transport') return '🚕';
    if (title.includes('حقوق') || title.includes('واریز')) return '💰';
    if (title.includes('دارو') || title.includes('دکتر') || catId === 'health') return '💊';
    if (title.includes('خرید') || title.includes('دیجی')) return '🛍️';
    if (title.includes('اجاره') || title.includes('قبض')) return '🏠';
    return '💳';
  };

  return (
    <div className="space-y-4 pb-24 text-[#e4e4e7]">
      {/* Total Balance & Monthly In/Out Overview (Sophisticated Dark Card) */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl shadow-lg">
        <div className="flex justify-between items-start mb-1">
          <p className="text-zinc-500 text-xs font-medium">موجودی کل حساب‌ها</p>
          <span className="text-[11px] text-zinc-400 font-medium">
            ماه {getCurrentJalaliMonthName()}
          </span>
        </div>

        <h2 className="text-3xl font-bold mb-4 tracking-tight text-[#fafafa]">
          {formatCurrency(totalBalance, currency)}
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {/* Monthly Income */}
          <div className="bg-green-500/10 border border-green-500/20 p-2.5 rounded-2xl text-center">
            <p className="text-[10px] text-green-500 font-bold mb-0.5">درآمد این ماه</p>
            <p className="text-xs font-bold text-green-400">
              +{formatCompactCurrency(totalIncome, currency)}
            </p>
          </div>

          {/* Monthly Expense */}
          <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-2xl text-center">
            <p className="text-[10px] text-red-500 font-bold mb-0.5">هزینه این ماه</p>
            <p className="text-xs font-bold text-red-400">
              -{formatCompactCurrency(totalExpense, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Unconfirmed Alert Banner (Red accented border & pulsing) */}
      {unconfirmedTxs.length > 0 && (
        <div
          onClick={() => onChangeTab('uncategorized')}
          className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl border-l-4 border-l-red-500 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-all shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-lg text-zinc-400 font-bold">
              ?
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#fafafa]">
                {toPersianDigits(unconfirmedTxs.length)} تراکنش نیاز به تعیین دسته
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">پیامک‌های جدید از بانک‌ها</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeTab('uncategorized');
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
            >
              تعیین دسته
            </button>
          </div>
        </div>
      )}

      {/* Budget Progress & Pacing Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex flex-col space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            بودجه‌بندی ماه جاری
          </h3>
          <span className="text-[11px] font-bold text-zinc-400">
            {toPersianDigits(budgetPercentage)}% مصرف شده
          </span>
        </div>

        <div className="space-y-3">
          {/* Food */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-300">خوراکی و رستوران</span>
              <span className="font-bold text-orange-400">۷۵٪</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full w-[75%] rounded-full" />
            </div>
          </div>

          {/* Transport */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-300">حمل و نقل</span>
              <span className="font-bold text-blue-400">۴۰٪</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[40%] rounded-full" />
            </div>
          </div>

          {/* Bills & Rent */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-300">اجاره و قبض</span>
              <span className="font-bold text-red-400">۹۵٪</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full w-[95%] rounded-full" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80">
          <p className="text-[11px] text-zinc-500 leading-relaxed italic">
            با این روند تا ۴ روز دیگر بودجه «خوراکی» تمام می‌شود.
          </p>
        </div>
      </div>

      {/* Blue Gradient Bank Card Snippet */}
      {state.accounts[0] && (
        <div
          onClick={() => onChangeTab('accounts')}
          className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-3xl flex flex-col shadow-xl shadow-blue-900/30 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div className="flex justify-between items-start mb-4">
            <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 10V5a1 1 0 011-1h14a1 1 0 011 1v5M2 10a2 2 0 002 2h14a2 2 0 002-2M2 10V19a1 1 0 001 1h14a1 1 0 001-1v-9" />
            </svg>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white">
              کارت پیش‌فرض
            </span>
          </div>

          <div>
            <p className="text-[11px] text-blue-100/80 font-medium">
              {state.accounts[0].bankName}
            </p>
            <p className="text-sm font-bold tracking-widest text-white mt-0.5">
              **** {toPersianDigits(state.accounts[0].cardLast4)}
            </p>

            <div className="flex justify-between items-end mt-4 text-white">
              <p className="text-lg font-bold">
                {formatCurrency(state.accounts[0].currentBalance, currency)}
              </p>
              <p className="text-[10px] opacity-80">{state.accounts[0].name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions List (Sophisticated Dark cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#fafafa]">آخرین تراکنش‌ها</h3>
          <button
            onClick={() => onChangeTab('transactions')}
            className="text-blue-400 text-xs font-medium hover:underline cursor-pointer"
          >
            مشاهده همه
          </button>
        </div>

        <div className="space-y-2.5">
          {state.transactions.slice(0, 5).map((tx) => {
            const cat = state.categories.find((c) => c.id === tx.categoryId) || {
              name: 'متفرقه',
              color: '#94A3B8',
            };
            const isExpense = tx.type === 'expense';
            const emoji = getTransactionEmoji(tx.title, tx.categoryId);

            return (
              <div
                key={tx.id}
                className="bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-zinc-700 transition-colors"
              >
                <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#fafafa] truncate">{tx.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    {tx.bankName || 'بانک'} • {formatJalaliDate(tx.occurredAt, 'timeOnly')}
                  </p>
                </div>

                <div className="text-left flex-shrink-0">
                  <p
                    className={`text-xs font-bold ${
                      isExpense ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {isExpense ? '- ' : '+ '}
                    {formatCurrency(tx.amount, currency)}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{cat.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
