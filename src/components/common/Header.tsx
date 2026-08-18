import React from 'react';
import { ShieldCheck, Zap, Clipboard, Terminal, Sparkles, Bell, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatJalaliDate } from '../../utils/jalali';
import { toPersianDigits } from '../../utils/digits';
import { NavigationTab } from './BottomNav';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenSmsSimulator: () => void;
  onOpenTestRunner: () => void;
  onOpenNativeCode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSmsSimulator,
  onOpenTestRunner,
  onOpenNativeCode,
}) => {
  const { state } = useAppStore();
  const unconfirmedCount = state.transactions.filter((t) => !t.isConfirmed).length;
  const todayJalali = formatJalaliDate(new Date().toISOString(), 'full');

  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-2 py-3 mb-2">
      <div className="flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30 text-white font-bold text-xl flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-[#e4e4e7]">جیببان</h1>
              <span className="text-[10px] font-bold bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-md border border-blue-500/30">
                آفلاین
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">دستیار هوشمند مالی شما</p>
          </div>
        </div>

        {/* Right side: Tools & Date Badge */}
        <div className="flex items-center gap-2">
          {/* Quick SMS Simulator Action */}
          <button
            onClick={onOpenSmsSimulator}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-blue-400 border border-zinc-800 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
            title="تست و شبیه‌سازی دریافت پیامک بانکی"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline text-[11px]">شبیه‌ساز پیامک</span>
          </button>

          {/* Test Runner */}
          <button
            onClick={onOpenTestRunner}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            title="اجرای تست ۲۵ پیامک واقعی"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>

          {/* Native Code */}
          <button
            onClick={onOpenNativeCode}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            title="مشاهده کدهای Native اندروید"
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Unconfirmed Notification Dot indicator */}
          <div className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900/90 flex items-center justify-center relative flex-shrink-0">
            {unconfirmedCount > 0 && (
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#09090b] animate-pulse" />
            )}
            <Bell className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
