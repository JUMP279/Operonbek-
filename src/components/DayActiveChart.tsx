import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { DayActiveData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DayActiveChartProps {
  data: DayActiveData[];
  onOpenMenu?: () => void;
}

export const DayActiveChart: React.FC<DayActiveChartProps> = ({ data, onOpenMenu }) => {
  const { t, language } = useLanguage();
  // Tuesday is default active peak matching mockup
  const [selectedDay, setSelectedDay] = useState<string>('Tue');

  const maxVal = Math.max(...data.map((d) => d.count), 9000);

  const getLocalizedDayLabel = (shortDay: string) => {
    const dayMap: Record<string, { uz: string; ru: string; en: string }> = {
      Sun: { uz: 'Yak', ru: 'Вс', en: 'Sun' },
      Mon: { uz: 'Dush', ru: 'Пн', en: 'Mon' },
      Tue: { uz: 'Sesh', ru: 'Вт', en: 'Tue' },
      Wed: { uz: 'Chor', ru: 'Ср', en: 'Wed' },
      Thu: { uz: 'Pay', ru: 'Чт', en: 'Thu' },
      Fri: { uz: 'Jum', ru: 'Пт', en: 'Fri' },
      Sat: { uz: 'Shan', ru: 'Сб', en: 'Sat' }
    };
    return dayMap[shortDay]?.[language] || shortDay;
  };

  return (
    <div
      id="card-most-day-active"
      className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[14px] font-bold text-slate-900">{t.dayActive}</span>
        <button
          id="btn-day-active-menu"
          onClick={onOpenMenu}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Activity Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Bar Chart Container */}
      <div className="relative pt-8 pb-1">
        <div className="flex items-end justify-between gap-2 h-28 px-1">
          {data.map((item) => {
            const isSelected = selectedDay === item.shortDay;
            const heightPercent = Math.max(18, (item.count / maxVal) * 100);

            return (
              <div
                key={item.shortDay}
                onClick={() => setSelectedDay(item.shortDay)}
                className="relative flex-1 flex flex-col items-center cursor-pointer group"
              >
                {/* Floating Value Bubble (when selected or hovered) */}
                {isSelected && (
                  <div className="absolute -top-7.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 animate-bounce-subtle">
                    <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-none">
                      {item.displayCount}
                    </span>
                    {/* Small caret */}
                    <div className="w-1.5 h-1.5 rotate-45 bg-transparent" />
                  </div>
                )}

                {/* Vertical Bar */}
                <div className="w-full flex justify-center">
                  <div
                    className={`w-4.5 rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-600 shadow-xs ring-2 ring-blue-100'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                    style={{ height: `${heightPercent}%`, minHeight: '18px' }}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] mt-2 font-medium transition-colors ${
                    isSelected
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {getLocalizedDayLabel(item.shortDay)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
