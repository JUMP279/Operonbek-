import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Maximize2, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

interface AIAssistantCardProps {
  onOpenFullChat?: () => void;
  storeContext?: any;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ onOpenFullChat, storeContext }) => {
  const { t, language } = useLanguage();

  // Keyed by the app's actual Language union ('kk' | 'ru').
  // These used to be keyed 'uz'/'en'/'ru', so Kazakh users were shown Uzbek text.
  const placeholder: Record<Language, string> = {
    kk: 'Бизнесіңіз бойынша қысқа кеңес алу үшін ↻ басыңыз немесе Operon-ға сұрақ қойыңыз.',
    ru: 'Нажмите ↻, чтобы получить короткий совет по вашему бизнесу, или задайте вопрос Operon.'
  };

  const [quickInsight, setQuickInsight] = useState<string>(placeholder[language]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuickInsight(placeholder[language]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!storeContext?.businessId || loading) return;
    setLoading(true);
    try {
      const q =
        language === 'ru'
          ? 'Дай один короткий практический совет (1-2 предложения) по моему бизнесу на основе текущих данных.'
          : 'Қазіргі деректерге сүйеніп, бизнесім бойынша бір қысқа практикалық кеңес бер (1-2 сөйлем).';
      const data = await api.ask(storeContext.businessId, q);
      if (data.answer) setQuickInsight(data.answer);
    } catch (err) {
      setQuickInsight(language === 'ru' ? 'Не удалось получить совет. Попробуйте позже.' : 'Кеңес алу мүмкін болмады. Кейінірек қайталаңыз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="card-ai-assistant"
      onClick={onOpenFullChat}
      className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 rounded-2xl p-4 border border-blue-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-[14px] font-bold text-slate-900">{t.aiCardTitle}</span>
        </div>
        <button
          id="btn-expand-ai"
          onClick={onOpenFullChat}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors"
          title={t.openAI}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Insight Text */}
      <p className="text-[11.5px] text-slate-600 leading-relaxed line-clamp-2">
        {quickInsight}
      </p>

      {/* Action Row */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-blue-50 text-[11px] text-blue-600 font-medium">
        <span className="flex items-center gap-1">
          {t.aiCardSubtitle} <ChevronRight className="w-3 h-3" />
        </span>
        <button
          onClick={handleRefresh}
          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
          title="Regenerate insight"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
