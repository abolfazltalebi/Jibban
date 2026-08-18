import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  RefreshCw,
  Plus,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/currency';
import { formatJalaliDate } from '../../utils/jalali';
import { toPersianDigits } from '../../utils/digits';
import { Transaction } from '../../types';
import { SmsScanner } from '../../core/sms/SmsScanner';

interface TransactionsScreenProps {
  onOpenManualEntry: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ onOpenManualEntry }) => {
  const { state, updateTransaction, deleteTransaction, bulkAddTransactions } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'expense' | 'income' | 'unconfirmed'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter logic
  const filteredTransactions = state.transactions.filter((tx) => {
    if (selectedTypeFilter === 'expense' && tx.type !== 'expense') return false;
    if (selectedTypeFilter === 'income' && tx.type !== 'income') return false;
    if (selectedTypeFilter === 'unconfirmed' && tx.isConfirmed) return false;
    if (selectedCategoryFilter !== 'all' && tx.categoryId !== selectedCategoryFilter) return false;
    if (selectedBankFilter !== 'all' && tx.bankName !== selectedBankFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title?.toLowerCase().includes(q);
      const matchMerchant = tx.merchant?.toLowerCase().includes(q);
      const matchBank = tx.bankName?.toLowerCase().includes(q);
      const matchSms = tx.rawSms?.toLowerCase().includes(q);
      if (!matchTitle && !matchMerchant && !matchBank && !matchSms) return false;
    }

    return true;
  });

  // Group by Jalali Day
  const groupedByDay: Record<string, Transaction[]> = {};
  filteredTransactions.forEach((tx) => {
    const dayKey = formatJalaliDate(tx.occurredAt, 'relativeDay');
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    groupedByDay[dayKey].push(tx);
  });

  const uniqueBanks = Array.from(new Set(state.transactions.map((t) => t.bankName).filter(Boolean)));

  const handleScanSms = async () => {
    setIsScanning(true);
    const scanned = await SmsScanner.scanHistoricalSms(state.categories);
    bulkAddTransactions(scanned);
    setIsScanning(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    updateTransaction(editingTx.id, {
      title: editingTx.title,
      categoryId: editingTx.categoryId,
      isConfirmed: true,
    });
    setEditingTx(null);
  };

  const getEmoji = (title: string, catId: string) => {
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
      {/* Top Search & Actions Bar (Sophisticated Dark) */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان، پذیرنده، بانک یا پیامک..."
              className="w-full bg-zinc-950 border border-zinc-800 text-xs text-[#fafafa] rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleScanSms}
            disabled={isScanning}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="اسکن مجدد پیامک‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">اسکن</span>
          </button>
        </div>

        {/* Filter Type Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'همه' },
            { id: 'expense', label: 'هزینه‌ها' },
            { id: 'income', label: 'واریزی‌ها' },
            { id: 'unconfirmed', label: 'تعیین نشده' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedTypeFilter(f.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                selectedTypeFilter === f.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bank & Category dropdowns */}
        <div className="flex gap-2 text-xs">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 flex-1"
          >
            <option value="all">همه دسته‌ها</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBankFilter}
            onChange={(e) => setSelectedBankFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 flex-1"
          >
            <option value="all">همه بانک‌ها</option>
            {uniqueBanks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List Grouped By Shamsi Day */}
      {Object.keys(groupedByDay).length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-300">تراکنشی یافت نشد</h4>
          <p className="text-xs text-zinc-500 mt-1">با تغییر فیلترها تراکنش‌های بیشتری مشاهده کنید.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDay).map(([dayLabel, txs]) => {
            const dayExpenseTotal = txs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={dayLabel} className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-md">
                {/* Day Header */}
                <div className="bg-zinc-950/70 px-4 py-2.5 border-b border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {dayLabel}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-400">
                    مجموع: {formatCurrency(dayExpenseTotal, state.settings.currency)}
                  </span>
                </div>

                {/* Day's Transactions */}
                <div className="divide-y divide-zinc-800/50">
                  {txs.map((tx) => {
                    const cat = state.categories.find((c) => c.id === tx.categoryId) || {
                      name: 'متفرقه',
                      color: '#94A3B8',
                    };
                    const isExpense = tx.type === 'expense';
                    const emoji = getEmoji(tx.title, tx.categoryId);

                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                            {emoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-[#fafafa] truncate">{tx.title}</h4>
                              {!tx.isConfirmed && (
                                <span className="text-[9px] font-black bg-red-500/15 text-red-400 px-1 rounded border border-red-500/30 flex-shrink-0">
                                  تعیین نشده
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                              <span>{cat.name}</span>
                              <span>•</span>
                              <span>{formatJalaliDate(tx.occurredAt, 'timeOnly')}</span>
                              {tx.bankName && <span>• {tx.bankName}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-2">
                          <div className="text-left">
                            <p
                              className={`text-xs font-bold ${
                                isExpense ? 'text-red-400' : 'text-green-400'
                              }`}
                            >
                              {isExpense ? '- ' : '+ '}
                              {formatCurrency(tx.amount, state.settings.currency)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTx(tx)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                              title="ویرایش"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-bold text-[#fafafa]">ویرایش تراکنش</h3>
              <button onClick={() => setEditingTx(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">عنوان تراکنش:</label>
                <input
                  type="text"
                  value={editingTx.title}
                  onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">دسته‌بندی:</label>
                <select
                  value={editingTx.categoryId}
                  onChange={(e) => setEditingTx({ ...editingTx, categoryId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
                >
                  {state.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ذخیره تغییرات</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xs p-4 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#fafafa]">حذف این تراکنش؟</h4>
            <p className="text-xs text-zinc-500">این عملیات قابل بازگشت نخواهد بود.</p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  deleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs"
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
