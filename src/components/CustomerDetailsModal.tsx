import React from 'react';
import { X, Users } from 'lucide-react';
import { CustomerSegment } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: CustomerSegment[];
  selectedSegment?: CustomerSegment | null;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  segments
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const getSegmentName = (seg: CustomerSegment) => {
    if (seg.id === 'retailers') return t.retailers;
    if (seg.id === 'distributors') return t.distributors;
    if (seg.id === 'wholesalers') return t.wholesalers;
    return seg.name;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.customers}</h3>
              <p className="text-xs text-slate-400">
                {language === 'ru' ? 'Всего' : 'Барлығы'}: {segments.reduce((a, x) => a + x.numericCount, 0)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: seg.color }}
                  >
                    {getSegmentName(seg)[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{getSegmentName(seg)}</h4>
                    <p className="text-[11px] text-slate-500">{seg.count} {language === 'ru' ? 'клиентов' : 'клиент'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">{seg.percentage}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                />
              </div>

            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
