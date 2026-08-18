import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, MessageSquare, Zap, ChevronLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { updateSettings } = useAppStore();
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: 'به جیببان خوش آمدید',
      subtitle: 'دستیار هوشمند مدیریت مالی شخصی، مخصوص کاربران ایرانی',
      desc: 'ثبت خودکار تراکنش‌ها از پیامک‌های بانکی بدون نیاز به وارد کردن دستی مبلغ یا ورود به حساب‌های بانکی.',
      icon: 'ج',
      badge: '۱۰۰٪ آفلاین و بدون سرور',
    },
    {
      title: 'حفظ حریم خصوصی کامل',
      subtitle: 'اطلاعات مالی شما هرگز از گوشی شما خارج نمی‌شود',
      desc: 'تمام پردازش متن پیامک‌ها و تحلیل‌ها روی دستگاه و بدون اینترنت انجام می‌شود. هیچ سرور خارجی وجود ندارد.',
      icon: '🛡️',
      badge: 'امنیت تضمین شده',
    },
    {
      title: 'ثبت در ۳ ثانیه با یک ضربه',
      subtitle: 'نوتیفیکیشن تعاملی هوشمند بعد از هر خرید',
      desc: 'بلافاصله بعد از هر خرید بانکی، نوتیفیکیشن با ۴ دسته‌بندی پیشنهادی ظاهر می‌شود تا با یک ضربه دسته‌بندی شود.',
      icon: '⚡',
      badge: 'سرعت فوق‌العاده',
    },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      updateSettings({ hasCompletedOnboarding: true });
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden" dir="rtl">
      {/* Top Skip Button */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-bold text-zinc-500">
          مرحله {step + 1} از {slides.length}
        </span>
        <button
          onClick={() => {
            updateSettings({ hasCompletedOnboarding: true });
            onComplete();
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer"
        >
          رد کردن
        </button>
      </div>

      {/* Center Animated Slide Content */}
      <div className="my-auto py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="text-center space-y-5"
          >
            {/* Big Icon */}
            <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-600/15 border border-blue-500/20 text-blue-500 flex items-center justify-center text-4xl font-extrabold shadow-xl shadow-blue-900/20">
              {slides[step].icon}
            </div>

            {/* Badge */}
            <div>
              <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold px-3 py-1 rounded-full">
                {slides[step].badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[#fafafa]">
                {slides[step].title}
              </h2>
              <p className="text-xs font-bold text-blue-400">
                {slides[step].subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              {slides[step].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-4 pb-4">
        {/* Step Dots Indicator */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-blue-600' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
        >
          <span>{step === slides.length - 1 ? 'شروع کار با جیببان' : 'ادامه'}</span>
          {step === slides.length - 1 ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
