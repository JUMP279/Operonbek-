import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RetentionDetail } from '../lib/api';

interface RetentionGaugeProps {
  percentage?: number;
  target?: number;
  /** Real tafsilot (routers/dashboard.py) — qaysi asosda hisoblangani va sonlar */
  detail?: RetentionDetail | null;
  onShowDetails?: () => void;
}

export const RetentionGauge: React.FC<RetentionGaugeProps> = ({
  percentage = 0,
  target = 40,
  detail,
  onShowDetails
}) => {
  const { t, language } = useLanguage();
  const ru = language !== 'kk';
  const basis = detail?.basis || 'none';
  const sub = basis === 'sales'
    ? (ru ? `${detail!.returning_buyers} из ${detail!.buyers} покупателей вернулись` : `${detail!.buyers} сатып алушының ${detail!.returning_buyers}-і қайта келді`)
    : basis === 'chats'
      ? (ru ? `${detail!.chat_returning} из ${detail!.chat_customers} клиентов написали снова` : `${detail!.chat_customers} клиенттің ${detail!.chat_returning}-і қайта жазды`)
      : (ru ? 'Пока нет покупок и переписок' : 'Сатып алу мен хат алмасу әзірге жоқ');

  // Generate radial dash segments around a semi-circle arch
  const totalTicks = 34;
  const activeTicksCount = Math.round((percentage / 100) * totalTicks);

  const cx = 110;
  const cy = 95;
  const radius = 70;
  const tickLength = 12;

  // Arch span: from -195 degrees (left) to 15 degrees (right)
  const startAngle = -200;
  const endAngle = 20;
  const angleStep = (endAngle - startAngle) / (totalTicks - 1);

  const ticks = Array.from({ length: totalTicks }).map((_, index) => {
    const angle = startAngle + index * angleStep;
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + (radius - tickLength) * Math.cos(rad);
    const y1 = cy + (radius - tickLength) * Math.sin(rad);
    const x2 = cx + radius * Math.cos(rad);
    const y2 = cy + radius * Math.sin(rad);
    const isActive = index < activeTicksCount;

    return {
      index,
      x1,
      y1,
      x2,
      y2,
      isActive
    };
  });

  return (
    <div
      id="card-repeat-customer-rate"
      className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs hover:shadow-md transition-all flex flex-col items-center"
    >
      {/* Title */}
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-[14px] font-bold text-slate-900">{t.retentionTitle}</span>
      </div>

      {/* Speedometer Gauge Visual */}
      <div className="relative w-full max-w-[220px] h-[115px] flex items-center justify-center">
        <svg viewBox="0 0 220 120" className="w-full h-full overflow-visible">
          {ticks.map((tItem) => (
            <line
              key={tItem.index}
              x1={tItem.x1}
              y1={tItem.y1}
              x2={tItem.x2}
              y2={tItem.y2}
              stroke={tItem.isActive ? '#10B981' : '#E2E8F0'}
              strokeWidth="3.2"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          ))}
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">
            {percentage}%
          </span>
          <span className="text-[11px] text-slate-400 font-normal mt-1">
            {sub} · {ru ? 'цель' : 'мақсат'} {target}%
          </span>
        </div>
      </div>

      {/* Show Details Action Button */}
      <div className="w-full flex justify-center mt-3">
        <button
          id="btn-show-retention-details"
          onClick={onShowDetails}
          className="px-4 py-1.5 rounded-full border border-slate-200/90 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
        >
          {t.retentionDetails}
        </button>
      </div>
    </div>
  );
};
