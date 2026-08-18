import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, Check, Zap, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/currency';
import { formatJalaliDate } from '../../utils/jalali';
import { toPersianDigits } from '../../utils/digits';
import confetti from 'canvas-confetti';

interface UncategorizedScreenProps {
  onBackToHome: () => void;
}

export const UncategorizedScreen: React.FC<UncategorizedScreenProps> = ({ onBackToHome }) => {
  const { state, categorizeTransaction } = useAppStore();
  const unconfirmedTxs = state.transactions.filter((t) => !t.isConfirmed);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTx = unconfirmedTxs[currentIndex] || unconfirmedTxs[0];

  const handleQuickCategorize = (categoryId: string) => {
    if (!currentTx) return;

    categorizeTransaction(currentTx.id, categoryId);

    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa'],
      });
    } catch {
      // ignore
    }
  };

  if (unconfirmedTxs.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center my-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-[#fafafa]">عالی! همه تراکنش‌ها دسته‌بندی شده‌اند</h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          تمام پیامک‌های دریافتی با موفقیت دسته‌بندی و در حافظه محلی ذخیره شدند.
        </p>
        <button
          onClick={onBackToHome}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
        >
          <span>بازگشت به داشبورد</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto text-[#e4e4e7]">
      {/* Progress header */}
      <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
        <div>
          <h3 className="text-xs font-bold text-[#fafafa]">تعیین دسته سریع (زیر ۳ ثانیه)</h3>
          <p className="text-[11px] text-zinc-500">با یک ضربه دسته را مشخص کنید تا در حافظه پذیرنده ذخیره شود</p>
        </div>
        <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-xl border border-red-500/20">
          {toPersianDigits(unconfirmedTxs.length)} باقی‌مانده
        </span>
      </div>

      {/* Main Focus Card */}
      {currentTx && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTx.id}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                {currentTx.bankName || 'بانک'} • {formatJalaliDate(currentTx.occurredAt, 'short')}
              </span>
              <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700">
                پیامک خودکار
              </span>
            </div>

            {/* Amount & Title */}
            <div className="text-center py-3 border-y border-zinc-800/80">
              <div className="text-3xl font-bold text-red-400 tracking-tight">
                - {formatCurrency(currentTx.amount, state.settings.currency)}
              </div>
              <h4 className="text-sm font-bold text-[#fafafa] mt-1">
                {currentTx.merchant || currentTx.title}
              </h4>
            </div>

            {/* Raw SMS */}
            {currentTx.rawSms && (
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/70 text-[11px] text-zinc-400 leading-relaxed font-mono">
                {currentTx.rawSms}
              </div>
            )}

            {/* 1-Tap Category Grid */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                این هزینه بابت چی بود؟
              </label>
              <div className="grid grid-cols-3 gap-2">
                {state.categories.slice(0, 9).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleQuickCategorize(cat.id)}
                    className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-center transition-all active:scale-95 cursor-pointer group shadow-sm flex flex-col items-center justify-center gap-1.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-medium text-zinc-200 truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
