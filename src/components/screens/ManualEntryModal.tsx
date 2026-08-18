import React, { useState } from 'react';
import { X, Check, Delete } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, normalizeToRials } from '../../utils/currency';
import { toLatinDigits, toPersianDigits } from '../../utils/digits';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose }) => {
  const { state, addTransaction } = useAppStore();
  const [rawDigits, setRawDigits] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(state.categories[0]?.id || 'food');
  const [selectedAccountId, setSelectedAccountId] = useState(state.accounts[0]?.id || 'acc_blu');
  const [title, setTitle] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');

  if (!isOpen) return null;

  const currentAmountToman = parseInt(rawDigits || '0', 10);
  const currentAmountRials = normalizeToRials(currentAmountToman, 'toman');

  const handleKeyPress = (num: string) => {
    if (rawDigits.length >= 10) return;
    setRawDigits((prev) => prev + num);
  };

  const handleDelete = () => {
    setRawDigits((prev) => prev.slice(0, -1));
  };

  const handleQuickAddAmount = (addToman: number) => {
    const current = parseInt(rawDigits || '0', 10);
    setRawDigits(String(current + addToman));
  };

  const handleSave = () => {
    if (currentAmountRials <= 0) return;

    const cat = state.categories.find((c) => c.id === selectedCatId);
    const fallbackTitle = title.trim() || (txType === 'expense' ? `خرید ${cat?.name || ''}` : 'واریز نقدی');

    addTransaction({
      amount: currentAmountRials,
      type: txType,
      categoryId: selectedCatId,
      accountId: selectedAccountId,
      title: fallbackTitle,
      occurredAt: new Date().toISOString(),
      source: 'manual',
      isConfirmed: true,
      confidence: 1.0,
    });

    setRawDigits('');
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-4 shadow-2xl text-[#e4e4e7] flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTxType('expense')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                txType === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              هزینه
            </button>
            <button
              onClick={() => setTxType('income')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                txType === 'income'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              درآمد
            </button>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Display Amount */}
        <div className="py-3 text-center">
          <span className="text-xs text-zinc-500">مبلغ به تومان:</span>
          <div className="text-3xl font-bold text-[#fafafa] tracking-tight mt-0.5">
            {formatCurrency(currentAmountRials, 'toman')}
          </div>
        </div>

        {/* Quick Title & Category */}
        <div className="space-y-2 mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان اختیاری (قهوه، نان، بنزین...)"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500 placeholder:text-zinc-600"
          />

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {state.categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCatId === cat.id
                    ? 'bg-blue-600 text-white border-blue-500 font-bold'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex gap-1.5 justify-center mb-2">
          {[50_000, 100_000, 200_000, 500_000].map((quick) => (
            <button
              key={quick}
              onClick={() => handleQuickAddAmount(quick)}
              className="px-2 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 rounded-lg border border-zinc-700/50 cursor-pointer"
            >
              +{toPersianDigits(quick / 1000)}هزار
            </button>
          ))}
        </div>

        {/* 3-Second Numeric Keypad */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 flex-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'].map((key) => {
            if (key === 'del') {
              return (
                <button
                  key={key}
                  onClick={handleDelete}
                  className="bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl p-3 flex items-center justify-center text-zinc-300 font-bold cursor-pointer"
                >
                  <Delete className="w-5 h-5" />
                </button>
              );
            }

            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl p-3 text-base font-bold text-[#fafafa] transition-colors cursor-pointer"
              >
                {toPersianDigits(key)}
              </button>
            );
          })}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={currentAmountRials <= 0}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
        >
          <Check className="w-5 h-5" />
          <span>ثبت در ۳ ثانیه</span>
        </button>
      </div>
    </div>
  );
};
