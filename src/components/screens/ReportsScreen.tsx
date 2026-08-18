import React, { useState } from 'react';
import {
  PieChart,
  BarChart2,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  Flame,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import { toPersianDigits } from '../../utils/digits';
import { getCurrentJalaliMonthName } from '../../utils/jalali';

export const ReportsScreen: React.FC = () => {
  const { state } = useAppStore();
  const currency = state.settings.currency;
  const [selectedPeriod, setSelectedPeriod] = useState<'currentMonth' | 'lastMonth' | '3months' | 'year'>('currentMonth');

  const expenses = state.transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Category distribution
  const categoryMap: Record<string, number> = {};
  expenses.forEach((t) => {
    categoryMap[t.categoryId] = (categoryMap[t.categoryId] || 0) + t.amount;
  });

  const categoryList = Object.entries(categoryMap)
    .map(([id, amount]) => {
      const cat = state.categories.find((c) => c.id === id) || {
        name: 'متفرقه',
        color: '#94A3B8',
      };
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return { id, name: cat.name, color: cat.color, amount, percentage };
    })
    .sort((a, b) => b.amount - a.amount);

  // Largest single expense
  const largestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0] || {
    title: 'هنوز ثبتی وجود ندارد',
    amount: 0,
    merchant: '---',
  };

  // Most frequent merchant
  const merchantCount: Record<string, { count: number; total: number }> = {};
  expenses.forEach((t) => {
    const name = t.merchant || t.title;
    if (name) {
      if (!merchantCount[name]) merchantCount[name] = { count: 0, total: 0 };
      merchantCount[name].count += 1;
      merchantCount[name].total += t.amount;
    }
  });

  const topMerchantEntry = Object.entries(merchantCount).sort(
    (a, b) => b[1].count - a[1].count
  )[0];

  const monthNames = ['تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر'];
  const monthData = [12_500_000, 14_200_000, 18_000_000, 15_100_000, 16_800_000, totalExpense || 14_900_000];
  const maxMonth = Math.max(...monthData);

  return (
    <div className="space-y-4 pb-24 text-[#e4e4e7]">
      {/* Period Selector Tabs */}
      <div className="flex gap-1.5 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
        {[
          { id: 'currentMonth', label: `این ماه (${getCurrentJalaliMonthName()})` },
          { id: 'lastMonth', label: 'ماه قبل' },
          { id: '3months', label: '۳ ماه اخیر' },
          { id: 'year', label: 'امسال' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPeriod(p.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === p.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Donut & Category Share Card (Sophisticated Dark) */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-[#fafafa] flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-blue-500" />
          سهم هزینه‌ها
        </h3>

        {/* Donut Graphic */}
        <div className="relative h-32 flex items-center justify-center">
          <div className="w-28 h-28 border-[10px] border-orange-500 rounded-full border-l-blue-500 border-b-zinc-800 border-r-purple-500 transition-transform duration-700" />
          <div className="absolute text-center">
            <p className="text-[10px] text-zinc-500 font-medium">کل مخارج</p>
            <p className="text-xs font-bold text-[#fafafa]">
              {formatCompactCurrency(totalExpense, currency)}
            </p>
          </div>
        </div>

        {/* Categories List */}
        <div className="mt-4 space-y-2.5">
          {categoryList.slice(0, 4).map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-zinc-300 font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">{formatCompactCurrency(cat.amount, currency)}</span>
                  <span className="font-bold text-[#fafafa] min-w-[28px] text-left">
                    {toPersianDigits(Math.round(cat.percentage))}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Highlights Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Largest Expense */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl space-y-1 shadow-md">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>بزرگترین خرج:</span>
          </div>
          <div className="text-sm font-bold text-red-400 truncate mt-1">
            {formatCurrency(largestExpense.amount, currency)}
          </div>
          <div className="text-[11px] text-zinc-300 truncate font-medium">
            {largestExpense.title}
          </div>
        </div>

        {/* Most Frequent Merchant */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl space-y-1 shadow-md">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>پرتکرارترین:</span>
          </div>
          <div className="text-sm font-bold text-amber-400 truncate mt-1">
            {topMerchantEntry ? topMerchantEntry[0] : 'اسنپ'}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            {topMerchantEntry ? `${toPersianDigits(topMerchantEntry[1].count)} بار` : '۲ بار'}
          </div>
        </div>
      </div>

      {/* 6 Months Bar Comparison Chart */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl space-y-3 shadow-lg">
        <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
          روند و مقایسه ۶ ماه اخیر
        </h3>

        <div className="flex items-end justify-between h-36 pt-3 px-2">
          {monthNames.map((name, i) => {
            const val = monthData[i];
            const heightPercent = Math.max(15, Math.round((val / maxMonth) * 100));
            const isCurrent = i === monthNames.length - 1;

            return (
              <div key={name} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] text-zinc-500 font-bold">
                  {toPersianDigits((val / 10_000_000).toFixed(1))}M
                </span>
                <div className="w-7 bg-zinc-950 rounded-t-xl h-20 flex items-end justify-center p-1 border border-zinc-800">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      isCurrent
                        ? 'bg-blue-600 shadow-md shadow-blue-600/30'
                        : 'bg-zinc-700'
                    }`}
                  />
                </div>
                <span className={`text-[11px] ${isCurrent ? 'font-bold text-blue-400' : 'text-zinc-500'}`}>
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
