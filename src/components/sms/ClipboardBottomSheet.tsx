import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/currency';

export const ClipboardBottomSheet: React.FC = () => {
  const { state, addTransaction, setClipboardSms } = useAppStore();
  const detected = state.clipboardSms;

  if (!detected) return null;

  const handleAccept = () => {
    const txType = detected.type === 'income' ? 'income' : detected.type === 'transfer' ? 'transfer' : 'expense';
    const dateStr =
      typeof detected.occurredAt === 'string'
        ? detected.occurredAt
        : detected.occurredAt instanceof Date
        ? detected.occurredAt.toISOString()
        : new Date().toISOString();

    addTransaction({
      amount: detected.amount,
      type: txType,
      categoryId: 'food',
      accountId: state.accounts[0]?.id || 'acc_blu',
      title: detected.merchant || (txType === 'expense' ? 'خرید پیامکی' : 'واریز'),
      occurredAt: dateStr,
      bankName: detected.bankName,
      cardLast4: detected.cardLast4,
      rawSms: detected.rawText,
      source: 'clipboard',
      isConfirmed: false,
      confidence: detected.confidence,
    });

    setClipboardSms(null);
  };

  const handleDismiss = () => {
    setClipboardSms(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-4 shadow-2xl text-[#e4e4e7] space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Clipboard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#fafafa]">تشخیص پیامک در کلیپ‌بورد (iOS)</h4>
                <p className="text-[10px] text-zinc-500">پیامک کپی‌شده از بانک شناسایی شد</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">بانک:</span>
              <span className="font-bold text-zinc-200">{detected.bankName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">مبلغ استخراج‌شده:</span>
              <span className="font-bold text-blue-400">
                {formatCurrency(detected.amount, 'toman')}
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/80 truncate">
              {detected.rawText}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <Check className="w-4 h-4" />
              <span>ثبت تراکنش</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-700 cursor-pointer"
            >
              رد کردن
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
