import React from 'react';
import { X, Target, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RetentionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate?: number;
  target?: number;
}

export const RetentionDetailsModal: React.FC<RetentionDetailsModalProps> = ({
  isOpen,
  onClose,
  rate = 68,
  target = 80
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.repeatRate}</h3>
              <p className="text-xs text-slate-400">Cohort Retention & Loyalty</p>
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
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-slate-900">{rate}%</span>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {language === 'ru' ? 'Текущий показатель (+4.2%)' : 'Қазіргі көрсеткіш (+4.2%)'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">{t.targetGoal}</span>
              <div className="text-sm font-bold text-blue-600">{target}%</div>
            </div>
          </div>

          {/* Retention Milestones */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>30-day Repurchase:</strong> 44.8% of buyers re-order within 30 days</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>VIP Tier Retention:</strong> 89.2% for top wholesale partners</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Churn Rate:</strong> Down to 3.2% (industry avg: 7.8%)</span>
            </div>
          </div>
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
