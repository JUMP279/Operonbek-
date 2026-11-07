import React from 'react';
import {
  X,
  Plus,
  Check,
  LayoutGrid,
  Bot,
  Edit3,
  Video,
  PlusCircle,
  BarChart3,
  PieChart,
  ShoppingBag,
  PhoneCall,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { availableWidgets } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWidgetIds: string[];
  onToggleWidget: (widgetId: string) => void;
  onOpenToolDemo?: (toolId: string) => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  activeWidgetIds,
  onToggleWidget,
  onOpenToolDemo
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'customer-response':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'post-creator':
        return <Edit3 className="w-4 h-4 text-purple-600" />;
      case 'video-creator':
        return <Video className="w-4 h-4 text-rose-600" />;
      case 'add-product':
        return <PlusCircle className="w-4 h-4 text-emerald-600" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4 text-cyan-600" />;
      case 'business-analyze':
        return <PieChart className="w-4 h-4 text-amber-600" />;
      case 'orders-manager':
        return <ShoppingBag className="w-4 h-4 text-violet-600" />;
      default:
        return <LayoutGrid className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t.addWidgets}</h3>
              <p className="text-xs text-slate-400">{availableWidgets.length} ta asosiy biznes vidjetlari</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Widgets List */}
        <div className="my-3 space-y-2 max-h-[400px] overflow-y-auto pr-1 no-scrollbar flex-1">
          {availableWidgets.map((w) => {
            const isAdded = activeWidgetIds.includes(w.id);
            const displayName = language === 'ru' ? w.nameRu : w.nameKk;

            return (
              <div
                key={w.id}
                onClick={() => onToggleWidget(w.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isAdded
                    ? 'border-blue-500 bg-blue-50/60 shadow-2xs'
                    : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center shrink-0">
                    {getIcon(w.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{displayName}</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {w.badge || w.category}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">
                      {w.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isAdded ? 'bg-blue-600 text-white shadow-xs' : 'border border-slate-300 text-slate-400'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs transition-all shadow-xs"
          >
            {t.done} ({activeWidgetIds.length} / 8 {language === 'ru' ? 'активно' : 'белсенді'})
          </button>
        </div>
      </div>
    </div>
  );
};
