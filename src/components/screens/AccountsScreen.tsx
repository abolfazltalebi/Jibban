import React, { useState } from 'react';
import { CreditCard, Plus, ShieldCheck, ArrowUpRight, ArrowDownLeft, Wifi } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import { toPersianDigits } from '../../utils/digits';
import { formatJalaliDate } from '../../utils/jalali';

export const AccountsScreen: React.FC = () => {
  const { state } = useAppStore();
  const currency = state.settings.currency;
  const [selectedAccountId, setSelectedAccountId] = useState<string>(state.accounts[0]?.id || 'acc_blu');

  const selectedAccount = state.accounts.find((a) => a.id === selectedAccountId) || state.accounts[0];

  const accountTransactions = state.transactions.filter(
    (t) => t.accountId === selectedAccountId || (selectedAccount && t.cardLast4 === selectedAccount.cardLast4)
  );

  const totalAssets = state.accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-4 pb-24 text-[#e4e4e7]">
      {/* Total Assets Card (Sophisticated Dark) */}
      <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs text-zinc-500 font-medium">مجموع دارایی کارت‌ها و حساب‌ها:</span>
          <div className="text-2xl font-bold text-[#fafafa] mt-1 tracking-tight">
            {formatCurrency(totalAssets, currency)}
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-blue-600/15 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
          <CreditCard className="w-5 h-5" />
        </div>
      </div>

      {/* Bank Cards Carousel */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 mb-2 px-1">کارت‌های بانکی متصل:</label>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none snap-x">
          {state.accounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`min-w-[260px] sm:min-w-[280px] h-44 rounded-3xl p-4.5 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-xl snap-center ${
                  isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'opacity-85 hover:opacity-100'
                }`}
                style={{
                  background:
                    acc.bankName === 'بلوبانک' || acc.bankName === 'بانک پاسارگاد'
                      ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                      : acc.bankName === 'بانک ملی'
                      ? 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)'
                      : acc.bankName === 'بانک ملت'
                      ? 'linear-gradient(135deg, #9f1239 0%, #4c0519 100%)'
                      : 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
                }}
              >
                {/* Chip & Bank Logo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-5 rounded-md bg-amber-300/80 border border-amber-400 flex items-center justify-center">
                      <div className="w-3.5 h-2.5 border border-amber-900/40 rounded-sm" />
                    </div>
                    <Wifi className="w-4 h-4 text-white/80 rotate-90" />
                  </div>
                  <span className="font-bold text-xs text-white drop-shadow">
                    {acc.bankName}
                  </span>
                </div>

                {/* Card Number */}
                <div className="text-center font-mono text-sm tracking-widest text-white font-bold drop-shadow">
                  **** **** **** {toPersianDigits(acc.cardLast4)}
                </div>

                {/* Account Name & Balance */}
                <div className="flex items-center justify-between text-xs text-white">
                  <div>
                    <div className="text-[10px] text-white/70">نام حساب</div>
                    <div className="font-medium drop-shadow">{acc.name}</div>
                  </div>

                  <div className="text-left">
                    <div className="text-[10px] text-white/70">مانده</div>
                    <div className="font-bold text-sm drop-shadow">
                      {formatCompactCurrency(acc.currentBalance, currency)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Card Transactions */}
      {selectedAccount && (
        <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#fafafa]">
              تراکنش‌های کارت {selectedAccount.bankName} ({toPersianDigits(selectedAccount.cardLast4)})
            </h3>
            <span className="text-[11px] text-zinc-500">
              {toPersianDigits(accountTransactions.length)} تراکنش
            </span>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-xs">
              تراکنشی برای این کارت ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {accountTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">{tx.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {formatJalaliDate(tx.occurredAt, 'short')}
                      </div>
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        isExpense ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {isExpense ? '- ' : '+ '}
                      {formatCurrency(tx.amount, currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
