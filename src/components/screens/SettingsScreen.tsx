import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Coins,
  FileSpreadsheet,
  Download,
  Trash2,
  Tag,
  Plus,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { toPersianDigits } from '../../utils/digits';

export const SettingsScreen: React.FC = () => {
  const { state, updateSettings, resetAllData, addCategory } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jibban_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportFeedback('فایل پشتیبان محلی دانلود شد.');
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = 'ID,Title,Amount_Rials,Type,Category,Bank,OccurredAt,IsConfirmed\n';
    const rows = state.transactions
      .map(
        (t) =>
          `"${t.id}","${t.title.replace(/"/g, '""')}",${t.amount},"${t.type}","${t.categoryId}","${
            t.bankName || ''
          }","${t.occurredAt}",${t.isConfirmed}`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jibban_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setExportFeedback('خروجی Excel / CSV با موفقیت ذخیره شد.');
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      icon: 'Tag',
      color: newCatColor,
      type: 'expense',
      order: state.categories.length + 1,
    });

    setNewCatName('');
  };

  return (
    <div className="space-y-4 pb-24 text-[#e4e4e7]">
      {/* Privacy Guarantee Card */}
      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-2xl bg-blue-600/15 text-blue-500 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#fafafa]">امنیت ۱۰۰٪ آفلاین و محلی</h4>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            تمام پیامک‌ها و داده‌های مالی در حافظه امن دستگاه ذخیره شده و به هیچ سروری ارسال نمی‌شوند.
          </p>
        </div>
      </div>

      {exportFeedback && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Currency & Unit Settings */}
      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 space-y-3 shadow-md">
        <h4 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-blue-500" />
          واحد پول پیش‌فرض
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateSettings({ currency: 'toman' })}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
              state.settings.currency === 'toman'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            تومان (پیش‌فرض)
          </button>

          <button
            onClick={() => updateSettings({ currency: 'rial' })}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
              state.settings.currency === 'rial'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            ریال
          </button>
        </div>
      </div>

      {/* Biometrics */}
      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-500" />
            <div>
              <h4 className="text-xs font-bold text-[#fafafa]">قفل بیومتریک و اثر انگشت</h4>
              <p className="text-[11px] text-zinc-500">قفل خودکار بعد از خروج از برنامه</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={state.settings.biometricEnabled}
              onChange={(e) => updateSettings({ biometricEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Category Manager */}
      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 space-y-3 shadow-md">
        <h4 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-blue-500" />
          مدیریت دسته‌بندی‌ها ({toPersianDigits(state.categories.length)})
        </h4>

        <div className="flex flex-wrap gap-1.5">
          {state.categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-medium"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
          ))}
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 border-t border-zinc-800">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="نام دسته جدید..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>افزودن</span>
          </button>
        </form>
      </div>

      {/* Backup & Export */}
      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 space-y-3 shadow-md">
        <h4 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
          پشتیبان‌گیری و خروجی
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>خروجی Excel / CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>پشتیبان JSON محلی</span>
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800">
        {showClearConfirm ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
            <h5 className="text-xs font-bold text-red-300">تمام داده‌ها پاک شوند؟</h5>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  resetAllData();
                  setShowClearConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-4 rounded-xl text-xs cursor-pointer"
              >
                بله، بازنشانی
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="bg-zinc-800 text-zinc-300 py-1.5 px-4 rounded-xl text-xs cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>پاک کردن تمام اطلاعات و بازنشانی</span>
          </button>
        )}
      </div>

      {/* About */}
      <div className="text-center text-xs text-zinc-600 space-y-1 pt-1">
        <p className="font-bold text-zinc-500">جیببان (Jibban)</p>
        <p>دستیار هوشمند مدیریت مالی شخصی • ۱۰۰٪ آفلاین</p>
      </div>
    </div>
  );
};
