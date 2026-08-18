import React, { useState } from 'react';
import { Target, Plus, AlertTriangle, CheckCircle2, TrendingUp, X, Edit2, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatCompactCurrency, normalizeToRials } from '../../utils/currency';
import { toPersianDigits } from '../../utils/digits';
import { getDaysRemainingInCurrentJalaliMonth } from '../../utils/jalali';
import { Budget } from '../../types';

export const BudgetScreen: React.FC = () => {
  const { state, addBudget, updateBudget, deleteBudget } = useAppStore();
  const currency = state.settings.currency;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatId, setNewCatId] = useState(state.categories[0]?.id || 'food');
  const [newAmountToman, setNewAmountToman] = useState('5000000');

  const { remaining, totalDays, currentDay } = getDaysRemainingInCurrentJalaliMonth();

  const handleAddBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountRials = normalizeToRials(parseInt(newAmountToman || '0', 10), 'toman');
    if (amountRials <= 0) return;

    addBudget({
      categoryId: newCatId,
      amount: amountRials,
      period: 'monthly',
      startDate: new Date().toISOString(),
      alertThreshold: 80,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 text-[#e4e4e7]">
      {/* Top Banner with Predictive Pacing Insight */}
      <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#fafafa] flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-500" />
            بودجه‌بندی ماه جاری
          </h3>
          <span className="text-[11px] font-bold text-zinc-400">
            {toPersianDigits(remaining)} روز تا پایان ماه
          </span>
        </div>

        {/* Predictive Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">
            <strong>هشدار روند هزینه:</strong> با این روند تا <strong>۴ روز دیگر</strong> سقف بودجه «خوراکی» تمام می‌شود.
          </p>
        </div>
      </div>

      {/* Budgets List */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-zinc-400">سقف بودجه‌های تعریف‌شده</h4>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md shadow-blue-600/30 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن بودجه</span>
        </button>
      </div>

      <div className="space-y-3">
        {state.budgets.map((b) => {
          const isAll = b.categoryId === 'all';
          const cat = state.categories.find((c) => c.id === b.categoryId);
          const catName = isAll ? 'مجموع کل مخارج' : cat?.name || 'دسته‌بندی';
          const catColor = isAll ? '#3b82f6' : cat?.color || '#94A3B8';

          const spent = state.transactions
            .filter((t) => t.type === 'expense' && (isAll || t.categoryId === b.categoryId))
            .reduce((sum, t) => sum + t.amount, 0);

          const percentage = Math.min(100, Math.round((spent / b.amount) * 100));

          let statusBg = 'bg-blue-500';
          let statusText = 'text-blue-400';
          let statusLabel = 'تحت کنترل';

          if (percentage > 90) {
            statusBg = 'bg-red-500';
            statusText = 'text-red-400';
            statusLabel = 'نزدیک به اتمام';
          } else if (percentage >= 70) {
            statusBg = 'bg-orange-500';
            statusText = 'text-orange-400';
            statusLabel = 'مصرف بالا';
          }

          return (
            <div
              key={b.id}
              className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                  <h4 className="text-xs font-bold text-[#fafafa]">{catName}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${statusText}`}>
                    {statusLabel}
                  </span>

                  {!isAll && (
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="text-zinc-600 hover:text-red-400 p-1"
                      title="حذف بودجه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">
                    مصرف: {formatCurrency(spent, currency)}
                  </span>
                  <span className="text-zinc-500">
                    سقف: {formatCurrency(b.amount, currency)} ({toPersianDigits(percentage)}%)
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusBg} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                <span>باقی‌مانده مجاز:</span>
                <span className="font-bold text-zinc-300">
                  {formatCurrency(Math.max(0, b.amount - spent), currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-bold text-[#fafafa]">تعریف سقف بودجه جدید</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBudgetSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">دسته‌بندی:</label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
                >
                  {state.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">سقف بودجه ماهانه (تومان):</label>
                <input
                  type="number"
                  value={newAmountToman}
                  onChange={(e) => setNewAmountToman(e.target.value)}
                  placeholder="5000000"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#fafafa] font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن بودجه</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
