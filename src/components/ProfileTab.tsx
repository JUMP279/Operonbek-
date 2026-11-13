import React, { useState } from 'react';
import {
  Settings,
  Bot,
  Edit3,
  Video,
  PlusCircle,
  BarChart3,
  PieChart,
  ShoppingBag,
  PhoneCall,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Globe,
  LogOut,
  UserPlus,
  ShieldCheck,
  Crown,
  Brain,
  MessageSquareText
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { UserAvatarIcon } from './UserAvatar';
import { useLanguage } from '../context/LanguageContext';
import { InstagramConnectCard } from './InstagramConnectCard';
import { TelegramConnectCard } from './TelegramConnectCard';
import { LogoCard } from './LogoCard';
import { ToolDetailView } from './ToolDetailView';
import { AvatarQuickMenuModal } from './AvatarQuickMenuModal';

interface ProfileTabProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void; // Opens settings/profile modal
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenAIChat?: () => void;
  onSelectTool?: (toolId: string) => void;
  userProfile?: UserProfile | null;
  storeContext?: any;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  onOpenNotifications,
  onOpenProfile,
  onOpenAuth,
  onOpenAIChat,
  onSelectTool,
  userProfile,
  storeContext
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [copiedId, setCopiedId] = useState(false);
  const [internalActiveTool, setInternalActiveTool] = useState<string | null>(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  const uniqueId = userProfile?.uniqueCode || userProfile?.id || '';

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(uniqueId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleToolClick = (toolId: string) => {
    if (onSelectTool) {
      onSelectTool(toolId);
    } else {
      setInternalActiveTool(toolId);
    }
  };

  // If a tool is active within this tab, render its full-screen view while bottom nav bar stays visible underneath
  if (internalActiveTool) {
    return (
      <ToolDetailView
        toolId={internalActiveTool}
        onBack={() => setInternalActiveTool(null)}
        storeContext={storeContext}
      />
    );
  }

  const languageOptions: { code: Language; title: string; native: string; flag: string }[] = [
    { code: 'kk', title: 'Қазақша', native: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', title: 'Русский', native: 'Русский', flag: '🇷🇺' }
  ];

  const allTools = [
    {
      id: 'customer-response',
      titleKk: 'Клиенттерге жауап',
      titleRu: 'Ответ клиентам',
      subtitleKk: 'Пікірлер және Direct жауаптары',
      subtitleRu: 'Ответы на комментарии и Direct',
      icon: <MessageSquareText className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-100',
      badgeKk: 'Direct & Пікір',
      badgeRu: 'Direct и Комментарии',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'post-creator',
      titleKk: 'Пост жасау',
      titleRu: 'Создание постов',
      subtitleKk: 'Instagram және Telegram посттары',
      subtitleRu: 'Посты для Instagram и Telegram',
      icon: <Edit3 className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: 'Вирустық SMM',
      badgeRu: 'Вирусный SMM',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'video-creator',
      titleKk: 'Видео жасау (AI)',
      titleRu: 'Создание видео (AI)',
      subtitleKk: 'Reels, TikTok және жариялау',
      subtitleRu: 'Reels, TikTok и публикатор',
      icon: <Video className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: '3 AI Агент',
      badgeRu: '3 AI Агента',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'add-product',
      titleKk: 'Тауар қосу',
      titleRu: 'Добавить товар',
      subtitleKk: 'Штрих-код және жаңа қойма',
      subtitleRu: 'Штрих-код и новый товар',
      icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-100',
      badgeKk: 'Жылдам қойма',
      badgeRu: 'Быстрый склад',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'analytics',
      titleKk: 'Аналитика',
      titleRu: 'Аналитика',
      subtitleKk: 'Тікелей трафик және конверсия',
      subtitleRu: 'Живой трафик и конверсия',
      icon: <BarChart3 className="w-4 h-4 text-cyan-600" />,
      bg: 'bg-cyan-50/80',
      border: 'border-cyan-100',
      badgeKk: 'Нақты',
      badgeRu: 'Реальные',
      badgeColor: 'bg-cyan-100 text-cyan-700'
    },
    {
      id: 'business-analyze',
      titleKk: 'Бизнес талдауы',
      titleRu: 'Анализ бизнеса (ИИ)',
      subtitleKk: 'Kaspi, WB, Instagram, Telegram бәсекелестері',
      subtitleRu: 'Конкуренты: Kaspi, WB, Instagram, Telegram',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: 'AI Аудит',
      badgeRu: 'AI Аудит',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'orders-manager',
      titleKk: 'Тапсырыстар',
      titleRu: 'Заказы',
      subtitleKk: 'Сұраулар мен сатылымдар',
      subtitleRu: 'Запросы и продажи',
      icon: <ShoppingBag className="w-4 h-4 text-violet-600" />,
      bg: 'bg-violet-50/80',
      border: 'border-violet-100',
      badgeKk: 'Тікелей ағын',
      badgeRu: 'Живой поток',
      badgeColor: 'bg-violet-100 text-violet-700'
    },
    {
      id: 'subscription',
      titleKk: 'Тарифтер мен жазылым',
      titleRu: 'Тарифы и подписка',
      subtitleKk: 'Starter, Growth, Enterprise',
      subtitleRu: 'Starter, Growth, Enterprise',
      icon: <Crown className="w-4 h-4 text-amber-600" />,
      bg: 'bg-gradient-to-br from-purple-50/90 to-indigo-50/90',
      border: 'border-purple-200/80',
      badgeKk: 'PRO Тариф',
      badgeRu: 'PRO Тариф',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'business-memory',
      titleKk: 'Бизнес жады (AI)',
      titleRu: 'Память бизнеса (AI)',
      subtitleKk: 'AI жады және білім базасы',
      subtitleRu: 'Память AI и база знаний',
      icon: <Brain className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: 'AI Жады',
      badgeRu: 'AI Память',
      badgeColor: 'bg-purple-100 text-purple-700'
    }
  ];
  // 'business-analyze' qaytarildi (2026-11-09): endi REAL — BusinessAnalyzeView (raqobatchilar + biznes sog'lig'i).
  const toolsList = allTools;

  return (
    <div className="space-y-3 pt-1 select-none pb-3">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.profileTitle}</h2>
          <p className="text-[11px] text-slate-400">{t.profileSubtitle}</p>
        </div>

        {/* Gear / Settings Button -> Opens Settings Modal */}
        <button
          id="btn-profile-settings"
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors shadow-2xs"
          title={t.settingsTitle}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Profile Card */}
      <div
        onClick={onOpenProfile}
        className="bg-gradient-to-br from-white via-slate-50/40 to-blue-50/30 rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Clickable Avatar with Globe Indicator */}
            <div
              id="btn-profile-avatar-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setIsAvatarMenuOpen(true);
              }}
              className="relative cursor-pointer group/av shrink-0 active:scale-95 transition-transform"
              title={language === 'ru' ? 'Язык и настройки входа (Нажмите)' : 'Тіл және кіру баптаулары (Басыңыз)'}
            >
              <UserAvatarIcon avatarId={userProfile?.avatarId || 1} size={46} showBadge />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs group-hover/av:bg-blue-700">
                <Globe className="w-3 h-3" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {/* Faqat do'kon nomi (kirgan biznes) — gmail ko'rsatilmaydi */}
              <div className="flex items-center gap-1.5">
                <span className="text-[19px] leading-tight font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate tracking-tight">
                  {userProfile?.storeName || 'Operon'}
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAvatarMenuOpen(true);
                }}
                className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>{t.langAndAuth}</span>
              </button>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
        </div>

        {/* ID Badge Row & Settings Trigger */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">ID:</span>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {uniqueId}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyId();
              }}
              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
              title={t.copyId}
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <span className="text-[10.5px] font-bold text-blue-600 flex items-center gap-0.5">
            {t.settingsTitle} <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Instagram ulash (real) */}
      <InstagramConnectCard businessId={storeContext?.businessId} />
      <TelegramConnectCard businessId={storeContext?.businessId} />

      {/* Logotip — post rasmlarida chiqadi */}
      <LogoCard businessId={storeContext?.businessId} />

      {/* Subscription Plan Active Status Banner (Interactive) */}
      <div
        onClick={() => handleToolClick('subscription')}
        className="bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] rounded-2xl p-3.5 text-white shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group active:scale-[0.99]"
      >
        <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-md pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25">
              <Crown className="w-4 h-4 text-white fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight">Starter Plan</span>
                <span className="text-[9px] bg-white/25 text-white font-bold px-1.5 py-0.5 rounded-full border border-white/20">
                  {t.activePlan}
                </span>
              </div>
              <p className="text-[10.5px] text-purple-100 font-medium leading-tight mt-0.5">
                {t.starterPlanSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white text-purple-700 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-xs group-hover:bg-purple-50 transition-colors shrink-0">
            <span>{t.plansTitle}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 8 Business Tools & Functions Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            {t.toolsTitle}
          </h3>
          <span className="text-[10.5px] font-semibold text-slate-400">{toolsList.length} {t.modulesCount}</span>
        </div>

        {/* 2-Column Grid for the 8 Functions */}
        <div className="grid grid-cols-2 gap-2">
          {toolsList.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`p-2.5 rounded-2xl border ${tool.border} ${tool.bg} hover:bg-white text-left transition-all shadow-2xs hover:shadow-xs active:scale-98 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-xl bg-white shadow-2xs flex items-center justify-center border border-slate-100">
                    {tool.icon}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${tool.badgeColor}`}>
                    {language === 'ru' ? tool.badgeRu : tool.badgeKk}
                  </span>
                </div>

                <div className="text-[11.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {language === 'ru' ? tool.titleRu : tool.titleKk}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'ru' ? tool.subtitleRu : tool.subtitleKk}
                </div>
              </div>

              <div className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                <span>{t.open}</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Click Quick Menu: Til & Ro'yxatdan o'tish */}
      <AvatarQuickMenuModal
        isOpen={isAvatarMenuOpen}
        onClose={() => setIsAvatarMenuOpen(false)}
        userProfile={userProfile}
        onOpenAuth={(mode) => {
          if (onOpenAuth) onOpenAuth(mode);
        }}
        onOpenProfileSettings={onOpenProfile}
      />
    </div>
  );
};
