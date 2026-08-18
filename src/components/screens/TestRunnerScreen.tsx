import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { runAllSmsTests, TestResult } from '../../core/sms/SmsTestRunner';
import { formatCurrency } from '../../utils/currency';
import { toPersianDigits } from '../../utils/digits';

export const TestRunnerScreen: React.FC = () => {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllSmsTests();
      setResults(res);
      setIsRunning(false);
    }, 150);
  };

  const total = results?.length || 0;
  const passed = results?.filter((r) => r.passed).length || 0;
  const failed = total - passed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const filteredResults = results?.filter((r) => {
    if (activeFilter === 'passed') return r.passed;
    if (activeFilter === 'failed') return !r.passed;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 text-[#e4e4e7]">
      {/* Test Suite Hero Header (Sophisticated Dark) */}
      <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/15 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fafafa]">مجموعه تست خودکار SmsParser</h3>
              <p className="text-[11px] text-zinc-500">ارزیابی پارسر روی ۲۵ نمونه پیامک واقعی بانک‌های ایران</p>
            </div>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>اجرای تست‌ها</span>
          </button>
        </div>

        {/* Test Score Stats */}
        {results && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 font-medium">کل تست‌ها</span>
              <p className="text-sm font-bold text-zinc-200">{toPersianDigits(total)}</p>
            </div>

            <div className="bg-green-500/10 p-2.5 rounded-2xl border border-green-500/20 text-center">
              <span className="text-[10px] text-green-500 font-medium">موفق (Pass)</span>
              <p className="text-sm font-bold text-green-400">{toPersianDigits(passed)}</p>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 font-medium">نرخ دقت</span>
              <p className="text-sm font-bold text-blue-400">{toPersianDigits(passRate)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {results && (
        <div className="flex gap-1.5 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
          {[
            { id: 'all', label: `همه (${toPersianDigits(total)})` },
            { id: 'passed', label: `موفق (${toPersianDigits(passed)})` },
            { id: 'failed', label: `ناموفق (${toPersianDigits(failed)})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Results List */}
      {!results ? (
        <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 text-center space-y-3">
          <p className="text-xs text-zinc-400">
            برای اعتبارسنجی عبارات منظم و تست‌های ۲۵ بانک، دکمه «اجرای تست‌ها» را بزنید.
          </p>
          <button
            onClick={handleRunTests}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/30 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>اجرای تست ۲۵ پیامک بانکی</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResults?.map((r, index) => (
            <div
              key={r.sample.id}
              className={`p-4 rounded-3xl border shadow-md space-y-2.5 ${
                r.passed
                  ? 'bg-zinc-900/50 border-zinc-800'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <h4 className="text-xs font-bold text-[#fafafa]">
                    تست #{toPersianDigits(index + 1)}: {r.sample.description}
                  </h4>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    r.passed
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {r.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>

              {/* Raw SMS */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 leading-relaxed">
                {r.sample.rawText}
              </div>

              {/* Extraction comparison */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-500">انتظار:</span>
                  <p className="font-bold text-zinc-300 mt-0.5">
                    مبلغ: {formatCurrency(r.sample.expectedAmountRials, 'toman')} • نوع:{' '}
                    {r.sample.expectedType}
                  </p>
                </div>

                <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-500">خروجی پارسر:</span>
                  <p
                    className={`font-bold mt-0.5 ${
                      r.passed ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {r.actual
                      ? `مبلغ: ${formatCurrency(r.actual.amount, 'toman')} • نوع: ${r.actual.type}`
                      : 'رد شد (None)'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
