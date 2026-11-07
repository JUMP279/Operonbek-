import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRange: string;
  onSelectRange: (range: string) => void;
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  currentRange,
  onSelectRange
}) => {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState(currentRange);

  if (!isOpen) return null;

  const presets = [
    { label: 'Jan 1, 2025 - Feb 1, 2025', sub: language === 'ru' ? 'Стандартный период' : 'Таңдалған кезең' },
    { label: language === 'ru' ? 'Сегодня (1 Фев 2025)' : 'Бүгін (1 Ақп 2025)', sub: language === 'ru' ? 'В реальном времени' : 'Тікелей трафик' },
    { label: language === 'ru' ? 'Последние 7 дней' : 'Соңғы 7 күн', sub: 'Jan 25, 2025 - Jan 31, 2025' },
    { label: language === 'ru' ? 'Последние 30 дней' : 'Соңғы 30 күн', sub: 'Jan 2, 2025 - Jan 31, 2025' },
    { label: language === 'ru' ? 'Текущий квартал (Q1 2025)' : 'Ағымдағы тоқсан (Q1 2025)', sub: 'Jan 1, 2025 - Mar 31, 2025' },
    { label: language === 'ru' ? 'С начала 2025 года' : '2025 жылдың басынан бері', sub: 'Jan 1, 2025 - Today' }
  ];

  const handleApply = (range: string) => {
    setSelected(range);
    onSelectRange(range);
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
            const isMatch = selected === item.label;
            return (
              <button
                key={item.label}
                onClick={() => handleApply(item.label)}
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
