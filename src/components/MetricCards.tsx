import React from 'react';
import { Eye, Users, MousePointer2, Mail, TrendingUp } from 'lucide-react';
import { MetricItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MetricCardsProps {
  metrics: MetricItem[];
  onSelectMetric?: (metric: MetricItem) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, onSelectMetric }) => {
  const { t, language } = useLanguage();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'eye':
        return <Eye className="w-4 h-4 text-blue-600" strokeWidth={2.2} />;
      case 'users':
        return <Users className="w-4 h-4 text-blue-600" strokeWidth={2.2} />;
      case 'mouse-pointer':
        return (
          <div className="rotate-[-45deg]">
            <MousePointer2 className="w-4 h-4 text-blue-600 fill-blue-600" strokeWidth={1.5} />
          </div>
        );
      case 'mail':
        return <Mail className="w-4 h-4 text-blue-600" strokeWidth={2.2} />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.2} />;
    }
  };

  const getLocalizedLabel = (metric: MetricItem) => {
    if (metric.id === 'page-views') return t.pageViews;
    if (metric.id === 'visitors') return t.visitors;
    if (metric.id === 'clicks') return t.clicks;
    if (metric.id === 'orders') return t.orders;
    return metric.label;
  };

  const getLocalizedComparisonText = (metric: MetricItem) => {
    // Must start on a digit: /[\d,.]+/ matched the "." in "vs. 14,653 last period"
    // and rendered "vs. . өткен кезеңге қарағанда".
    const numMatch = metric.comparisonText?.match(/\d[\d,.]*/);
    const num = numMatch ? numMatch[0] : '';
    if (language === 'ru') {
      return num ? `vs. ${num} за прошлый период` : 'по сравнению с прошлым периодом';
    }
    return num ? `vs. ${num} өткен кезеңге қарағанда` : 'өткен кезеңге қарағанда';
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          id={`metric-card-${metric.id}`}
          onClick={() => onSelectMetric?.(metric)}
          className="bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex flex-col justify-between"
        >
          {/* Header with Label and Icon */}
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-slate-700 truncate pr-1">
              {getLocalizedLabel(metric)}
            </span>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
              {getIcon(metric.iconName)}
            </div>
          </div>

          {/* Stat Value */}
          <div className="my-2.5">
            <div className="text-[22px] font-bold text-slate-900 tracking-tight leading-none">
              {metric.value}
            </div>
          </div>

          {/* Change Badge & Comparison text */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center min-h-[20px]">
              {metric.change ? (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight ${
                  metric.isPositive
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/60'
                    : 'bg-rose-50 text-rose-600 border border-rose-100/60'
                }`}
              >
                <span className="text-[9px]">{metric.isPositive ? '▲' : '▼'}</span>
                <span>{metric.change.replace('▲', '').replace('▼', '').trim()}</span>
              </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-300">—</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-normal leading-tight truncate">
              {metric.comparisonText || getLocalizedComparisonText(metric)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
