import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Send, Check, BellRing } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import confetti from 'canvas-confetti';

export const InteractiveNotificationToast: React.FC = () => {
  const { state, categorizeTransaction, dismissNotification } = useAppStore();
  const notification = state.activeNotification;

  const [directReplyText, setDirectReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [confirmedState, setConfirmedState] = useState<{ categoryName: string } | null>(null);

  useEffect(() => {
    if (!notification) {
      setShowReplyInput(false);
      setDirectReplyText('');
      setConfirmedState(null);
    }
  }, [notification]);

  if (!notification) return null;

  const tx = state.transactions.find(
    (t) => t.amount === notification.parsedSms.amount && t.rawSms === notification.parsedSms.rawText
  ) || state.transactions[0];

  const handleSelectCategory = (categoryId: string, categoryName: string) => {
    if (tx) {
      categorizeTransaction(tx.id, categoryId);
    }

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.15 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa'],
      });
    } catch {
      // ignore
    }

    setConfirmedState({ categoryName });

    setTimeout(() => {
      dismissNotification(notification.id);
    }, 2000);
  };

  const handleDirectReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directReplyText.trim() || !tx) return;

    const topCat = notification.topCategories[0] || state.categories[0];
    categorizeTransaction(tx.id, topCat.id, directReplyText.trim());

    setConfirmedState({ categoryName: topCat.name });

    setTimeout(() => {
      dismissNotification(notification.id);
    }, 2000);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        className="bg-zinc-900/98 backdrop-blur-2xl border-2 border-blue-500/40 rounded-3xl p-4 shadow-2xl shadow-black/90 text-[#e4e4e7] ring-1 ring-blue-500/20"
      >
        {/* Header / Notifee Channel Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <span className="text-xs font-bold text-zinc-300">نوتیفیکیشن تعاملی پیامک (Notifee)</span>
          </div>

          <button
            onClick={() => dismissNotification(notification.id)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {confirmedState ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-3 flex items-center justify-center gap-2 text-blue-400 font-bold text-sm bg-blue-500/10 rounded-2xl border border-blue-500/20"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>ثبت شد در دسته «{confirmedState.categoryName}»</span>
          </motion.div>
        ) : (
          <div>
            <div className="mb-2">
              <h4 className="font-bold text-sm text-[#fafafa]">
                {notification.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">{notification.body}</p>
            </div>

            {/* Direct Reply Form */}
            {showReplyInput ? (
              <form onSubmit={handleDirectReplySubmit} className="mt-2 flex items-center gap-1.5">
                <input
                  type="text"
                  value={directReplyText}
                  onChange={(e) => setDirectReplyText(e.target.value)}
                  placeholder="بنویسید: مثلاً قهوه با دوستان..."
                  autoFocus
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-[#fafafa] rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ثبت</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReplyInput(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-2 cursor-pointer"
                >
                  بازگشت
                </button>
              </form>
            ) : (
              /* Action Buttons: 4 Dynamic Category Buttons + Direct Reply + Dismiss */
              <div className="space-y-2 mt-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {notification.topCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id, cat.name)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/60 text-xs font-bold text-zinc-200 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => setShowReplyInput(true)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-zinc-700/60 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>✏️ بنویس (عنوان دلخواه)</span>
                  </button>

                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="py-1.5 px-3 rounded-lg text-zinc-500 hover:text-zinc-300 text-[11px] hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    نادیده بگیر
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
