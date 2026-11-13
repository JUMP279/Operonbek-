import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Bot,
  Edit3,
  Video,
  PlusCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ShoppingBag,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Copy,
  Send,
  RefreshCw,
  TrendingUp,
  Play,
  Volume2,
  Mic,
  SlidersHorizontal,
  ChevronLeft,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  User,
  ShieldCheck,
  Zap,
  Check,
  Maximize2,
  Minimize2,
  X,
  Package,
  Layers,
  ChevronRight,
  Users,
  Award,
  ShieldAlert,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  History,
  Swords
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CustomerBreakdown } from './CustomerBreakdown';
import { RetentionGauge } from './RetentionGauge';
import { SubscriptionPlanView } from './SubscriptionPlanView';
import { AIVideoGeneratorView } from './AIVideoGeneratorView';
import { AIPostGeneratorView } from './AIPostGeneratorView';
import { ProductsManagerView } from './ProductsManagerView';
import { OrdersManagerView } from './OrdersManagerView';
import { AnalyticsView } from './AnalyticsView';
import { BusinessAnalyzeView } from './BusinessAnalyzeView';
import { BusinessMemoryView } from './BusinessMemoryView';
import { CustomerResponseView } from './CustomerResponseView';

export interface ToolDetailViewProps {
  toolId: string;
  onBack: () => void;
  storeContext?: any;
  showHeaderClose?: boolean;
}

// Reusable SVG Donut Pie Chart Component

export const ToolDetailView: React.FC<ToolDetailViewProps> = ({
  toolId,
  onBack,
  storeContext,
  showHeaderClose = false
}) => {
  const { language } = useLanguage();



  const getToolTitle = () => {
    switch (toolId) {
      case 'ai-management':
        return language === 'ru' ? 'AI Бизнес-Ассистент' : 'AI Бизнес-Ассистент';
      case 'post-creator':
        return language === 'ru' ? 'Создание постов (Вирусный SMM)' : 'Пост жасау (Вирустық SMM)';
      case 'video-creator':
        return language === 'ru' ? 'Создание видео (Reels и TikTok)' : 'Видео жасау (Reels & TikTok)';
      case 'add-product':
        return language === 'ru' ? 'Добавить товар и склад' : 'Тауар қосу & Қойма';
      case 'analytics':
        return language === 'ru' ? 'Аналитика и чистая прибыль' : 'Аналитика & Таза пайда';
      case 'business-analyze':
        return language === 'ru' ? 'Бизнес-анализ (AI)' : 'Бизнес талдауы (AI)';
      case 'orders-manager':
        return language === 'ru' ? 'Управление заказами' : 'Тапсырыстарды басқару';
      case 'phone-operator':
        return language === 'ru' ? 'AI Телефонный оператор' : 'AI Телефон операторы';
      case 'customer-response':
      case 'client-response':
      case 'customer_reply':
        return language === 'ru' ? 'Ответ клиентам (Direct и Комментарии)' : 'Клиенттерге жауап (Direct & Пікірлер)';
      case 'subscription':
        return language === 'ru' ? 'Тарифные планы и подписка' : 'Тарифтер мен жазылым';
      case 'business-memory':
      case 'business_memory':
      case 'memory':
        return language === 'ru' ? 'Память бизнеса (База знаний AI)' : 'Бизнес жады (AI білім базасы)';
      default:
        return language === 'ru' ? 'Бизнес-инструмент' : 'Бизнес құралы';
    }
  };

  if (toolId === 'customer-response' || toolId === 'client-response' || toolId === 'customer_reply') {
    return <CustomerResponseView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'subscription') {
    return <SubscriptionPlanView onBack={onBack} storeContext={storeContext} />;
  }

  // AI chat-yordamchi olib tashlandi (2026-11-08, user qarori) — eski havola bo'lsa ortga qaytamiz
  if (toolId === 'ai-management') {
    setTimeout(onBack, 0);
    return null;
  }

  if (toolId === 'video-creator') {
    return <AIVideoGeneratorView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'post-creator') {
    return <AIPostGeneratorView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'add-product' || toolId === 'products' || toolId === 'products-catalog') {
    return <ProductsManagerView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'analytics') {
    return <AnalyticsView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'business-analyze') {
    return <BusinessAnalyzeView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'orders-manager') {
    return <OrdersManagerView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'business-memory' || toolId === 'business_memory' || toolId === 'memory') {
    return <BusinessMemoryView onBack={onBack} storeContext={storeContext} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-hidden select-none">
      {/* Mobile Top App Bar with `< Orqaga` button */}
      <div className="px-3.5 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors font-bold text-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>{language === 'ru' ? 'Назад' : 'Артқа'}</span>
        </button>

        <div className="text-center truncate px-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate">
            {getToolTitle()}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {showHeaderClose && (
            <button
              onClick={onBack}
              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Tool Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 no-scrollbar">


        {/* ========================================== */}
        {/* 2. BIZNES TAHLILI (AI & Mijozlar Portfeli) */}
        {/* ========================================== */}
        {toolId === 'business-analyze' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 text-center space-y-1">
            <Sparkles className="w-5 h-5 text-purple-600 mx-auto" />
            <p className="text-sm font-bold">{language === 'ru' ? 'Анализ бизнеса скоро появится' : 'Бизнес талдауы жақында қосылады'}</p>
            <p className="text-[11px] text-slate-500">{language === 'ru' ? 'Он будет строиться на реальных данных вашего магазина.' : 'Ол дүкеніңіздің нақты деректеріне негізделеді.'}</p>
          </div>
        )}


      </div>
    </div>
  );
};
