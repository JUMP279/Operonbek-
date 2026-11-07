import React, { useState, useEffect } from 'react';
import { Maximize2, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AIAssistantCardProps {
  onOpenFullChat?: () => void;
  storeContext?: any;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ onOpenFullChat, storeContext }) => {
  const { t, language } = useLanguage();

  const defaultInsights: Record<string, string> = {
    uz: "Seshanba kunlari eng yuqori trafik (+8,162 faol foydalanuvchi) haftalik buyurtmalarning 42% ini tashkil qildi. Konversiyani oshirish uchun maxsus chegirmalar tavsiya etiladi.",
    en: "Tuesday peak traffic (+8,162 active users) generated 42% of weekly orders. Consider running Tuesday Flash Specials to drive conversion higher.",
    ru: "Пиковый трафик во вторник (+8,162 активных сессий) обеспечил 42% недельных заказов. Рекомендуются специальные промо-акции по вторникам."
  };

  const [quickInsight, setQuickInsight] = useState<string>(
    defaultInsights[language] || defaultInsights.uz
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuickInsight(defaultInsights[language] || defaultInsights.uz);
  }, [language]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Generate a 1-sentence quick actionable insight for this store.",
          storeContext,
          language
        })
      });
      const data = await res.json();
      if (data.reply) {
        setQuickInsight(data.reply);
      }
    } catch (err) {
      console.error(err);
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
