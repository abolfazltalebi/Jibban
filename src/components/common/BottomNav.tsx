import React from 'react';
import { Home, ListOrdered, PieChart, Target, CreditCard, Settings, Terminal, CheckCheck, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { toPersianDigits } from '../../utils/digits';

export type NavigationTab =
  | 'home'
  | 'transactions'
  | 'uncategorized'
  | 'reports'
  | 'budget'
  | 'accounts'
  | 'settings'
  | 'testrunner'
  | 'nativeCode';

interface BottomNavProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  onOpenManualEntry?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, onOpenManualEntry }) => {
  const { state } = useAppStore();
  const unconfirmedCount = state.transactions.filter((t) => !t.isConfirmed).length;

  const leftTabs: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'داشبورد', icon: Home },
    { id: 'transactions', label: 'تراکنش‌ها', icon: ListOrdered },
    { id: 'uncategorized', label: 'دسته‌بندی', icon: CheckCheck, badge: unconfirmedCount },
  ];

  const rightTabs: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'reports', label: 'گزارش‌ها', icon: PieChart },
    { id: 'budget', label: 'بودجه', icon: Target },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto h-16 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl flex items-center justify-between px-3 shadow-2xl shadow-black/80">
      {/* Left Tabs */}
      <div className="flex items-center gap-2 flex-1 justify-around">
        {leftTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive ? 'text-blue-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-zinc-900">
                    {toPersianDigits(tab.badge!)}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Raised Center Action Button */}
      <div className="relative -top-5 px-1">
        <button
          onClick={onOpenManualEntry}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-full border-4 border-[#09090b] flex items-center justify-center shadow-xl shadow-blue-600/40 text-white cursor-pointer transition-all"
          title="ثبت سریع هزینه در ۳ ثانیه"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Right Tabs */}
      <div className="flex items-center gap-2 flex-1 justify-around">
        {rightTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive ? 'text-blue-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
