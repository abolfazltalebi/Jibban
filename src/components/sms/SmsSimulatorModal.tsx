import React, { useState } from 'react';
import { X, Play, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, Smartphone, ShieldCheck } from 'lucide-react';
import { SMS_SAMPLES, SmsTestFixture } from '../../core/sms/smsSamples';
import { parseSms } from '../../core/sms/SmsParser';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/currency';
import { toPersianDigits } from '../../utils/digits';

interface SmsSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsSimulatorModal: React.FC<SmsSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { processIncomingSms } = useAppStore();
  const [selectedSample, setSelectedSample] = useState<SmsTestFixture>(SMS_SAMPLES[0]);
  const [customSender, setCustomSender] = useState(SMS_SAMPLES[0].sender);
  const [customText, setCustomText] = useState(SMS_SAMPLES[0].rawText);
  const [isInjecting, setIsInjecting] = useState(false);

  if (!isOpen) return null;

  const liveParsed = parseSms(customText, customSender, false);

  const handleSelectPreset = (sample: SmsTestFixture) => {
    setSelectedSample(sample);
    setCustomSender(sample.sender);
    setCustomText(sample.rawText);
  };

  const handleInjectSms = async () => {
    setIsInjecting(true);
    await processIncomingSms(customText, customSender);
    setIsInjecting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-5 shadow-2xl text-[#e4e4e7] max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fafafa]">شبیه‌ساز و تست پیامک بانکی</h3>
              <p className="text-[11px] text-zinc-500">ارسال پیامک تستی به موتور پارسر و تریگر نوتیفیکیشن تعاملی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* Quick Bank Presets */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">
              نمونه‌های واقعی پیامک بانک‌های ایرانی:
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {SMS_SAMPLES.slice(0, 10).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectPreset(sample)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedSample.id === sample.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {sample.expectedBank || sample.description}
                </button>
              ))}
            </div>
          </div>

          {/* Sender & Text Inputs */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-zinc-400 mb-1">شماره یا نام فرستنده:</label>
                <input
                  type="text"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-[#fafafa] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">متن خام پیامک:</label>
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="متن پیامک بانکی را وارد کنید..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500 leading-relaxed placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Real-time Parser Analysis Output */}
          <div className="bg-zinc-950 rounded-2xl p-3.5 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                تحلیل زنده موتور SmsParser:
              </span>
              {liveParsed ? (
                <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  تطابق با دقت {toPersianDigits(Math.round(liveParsed.confidence * 100))}%
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  تراکنش مالی نیست یا نویز است
                </span>
              )}
            </div>

            {liveParsed ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[11px]">مبلغ:</span>
                  <p className="font-bold text-blue-400 mt-0.5">
                    {formatCurrency(liveParsed.amount, 'toman')}
                  </p>
                </div>

                <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[11px]">بانک:</span>
                  <p className="font-bold text-[#fafafa] mt-0.5">{liveParsed.bankName}</p>
                </div>

                <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[11px]">نوع:</span>
                  <p className="font-bold text-zinc-300 mt-0.5">
                    {liveParsed.type === 'expense' ? 'برداشت / خرید' : 'واریز'}
                  </p>
                </div>

                <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[11px]">۴ رقم کارت:</span>
                  <p className="font-bold text-zinc-300 mt-0.5">
                    {liveParsed.cardLast4 ? toPersianDigits(liveParsed.cardLast4) : 'نامشخص'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 leading-relaxed">
                این پیامک ممکن است کد تایید (OTP)، تبلیغاتی یا بدون ساختار مالی باشد.
              </p>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-zinc-800 flex gap-2">
          <button
            onClick={handleInjectSms}
            disabled={!liveParsed || isInjecting}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>شبیه‌سازی دریافت پیامک و باز شدن نوتیفیکیشن</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};
