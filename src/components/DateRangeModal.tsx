import React from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const RANGE_OPTIONS = [1, 7, 30, 90, 365] as const;

export function rangeLabel(days: number, language: string): string {
  const ru = language !== 'kk';
  if (days === 1) return ru ? 'Сегодня' : 'Бүгін';
  if (days === 365) return ru ? 'Последний год' : 'Соңғы жыл';
  return ru ? `Последние ${days} дней` : `Соңғы ${days} күн`;
}

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDays: number;
  onSelectDays: (days: number) => void;
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  currentDays,
  onSelectDays
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const fmt = (d: Date) => d.toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  const presets = RANGE_OPTIONS.map((days) => {
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    return { days, label: rangeLabel(days, language), sub: days === 1 ? fmt(new Date()) : `${fmt(from)} — ${fmt(new Date())}` };
  });

  const handleApply = (days: number) => {
    onSelectDays(days);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.selectDateRange}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-3 space-y-1.5">
          {presets.map((item) => {
            const isMatch = currentDays === item.days;
            return (
              <button
                key={item.days}
                onClick={() => handleApply(item.days)}
                className={`w-full p-3 rounded-2xl text-left border flex items-center justify-between transition-all ${
                  isMatch
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className={`text-xs font-semibold ${isMatch ? 'text-blue-700' : 'text-slate-900'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400">{item.sub}</div>
                </div>
                {isMatch && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
