import { isUz } from '../context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
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
  MessageSquareText,
  Store,
  Rocket,
  LifeBuoy,
  Handshake
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { UserAvatarIcon } from './UserAvatar';
import { useLanguage } from '../context/LanguageContext';
import { InstagramConnectCard } from './InstagramConnectCard';
import { TelegramConnectCard } from './TelegramConnectCard';
import { TelegramBusinessCard } from './TelegramBusinessCard';
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
  // 2026-11-20 BUG: tarif banneri HAR DOIM "Starter Plan" ko'rsatardi, haqiqiy tarifdan qat'i nazar.
  // Endi haqiqiy tarifni olamiz (api.planUsage → billing).
  const [plan, setPlan] = useState<{ plan: string; state?: string; days_left?: number | null; prices?: Record<string, number> } | null>(null);
  useEffect(() => {
    const bid = storeContext?.businessId;
    if (!bid) return;
    let on = true;
    api.planUsage(bid).then((u) => { if (on) setPlan(u); }).catch(() => { /* banner sukut holatda qoladi */ });
    return () => { on = false; };
  }, [storeContext?.businessId]);
  const PLAN_LABEL: Record<string, string> = { trial: 'Trial', starter: 'Starter', growth: 'Growth', business: 'Business' };
  const PLAN_LIMITS: Record<string, string> = {
    trial: (language === 'uz' ? "14 kun bepul • kuniga 1 video + 1 post" : language === 'kk' ? '14 күн тегін • күніне 1 бейне + 1 пост' : '14 дней бесплатно • 1 видео + 1 пост в день'),
    starter: (language === 'uz' ? "$20 / oy • 15 video + 15 post" : language === 'kk' ? '$20 / ай • 15 бейне + 15 пост' : '$20 / мес • 15 видео + 15 постов'),
    growth: (language === 'uz' ? "$49.90 / oy • kuniga 1 video + 1 post" : language === 'kk' ? '$49.90 / ай • күніне 1 бейне + 1 пост' : '$49.90 / мес • 1 видео + 1 пост в день'),
    business: (language === 'uz' ? "$79.99 / oy • kuniga 3 video + 3 post" : language === 'kk' ? '$79.99 / ай • күніне 3 бейне + 3 пост' : '$79.99 / мес • 3 видео + 3 поста в день'),
  };
  const planKey = plan && PLAN_LABEL[plan.plan] ? plan.plan : 'starter';
  const planName = PLAN_LABEL[planKey] + ' Plan';
  const planSubtitle = PLAN_LIMITS[planKey] || t.starterPlanSubtitle;
  const planBadge = plan?.state === 'expired'
    ? ((language === 'uz' ? "Tugagan" : language === 'kk' ? 'Аяқталды' : 'Истёк'))
    : plan?.state === 'trial' && plan.days_left != null
      ? ((language === 'uz' ? `Qoldi ${plan.days_left} kun` : language === 'kk' ? `${plan.days_left} күн қалды` : `Осталось ${plan.days_left} дн.`))
      : t.activePlan;

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
    { code: 'uz', title: "O'zbekcha", native: "O'zbekcha", flag: '🇺🇿' },
    { code: 'kk', title: 'Қазақша', native: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', title: 'Русский', native: 'Русский', flag: '🇷🇺' }
  ];

  const allTools = [
    {
      id: 'customer-response',
      titleKk: 'Клиенттерге жауап',
      titleUz: "Mijozlarga javob", titleRu: 'Ответ клиентам',
      subtitleKk: 'Direct, пікірлер және мәмілелер',
      subtitleUz: "Direct, izohlar va bitimlar", subtitleRu: 'Direct, комментарии и сделки',
      icon: <MessageSquareText className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-100',
      badgeKk: 'Direct & Пікір',
      badgeUz: "Direct va izohlar", badgeRu: 'Direct и Комментарии',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'post-creator',
      titleKk: 'Пост жасау',
      titleUz: "Post yaratish", titleRu: 'Создание постов',
      subtitleKk: 'Instagram және Telegram посттары',
      subtitleUz: "Instagram va Telegram uchun postlar", subtitleRu: 'Посты для Instagram и Telegram',
      icon: <Edit3 className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: 'Вирустық SMM',
      badgeUz: "Virusli SMM", badgeRu: 'Вирусный SMM',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'video-creator',
      titleKk: 'Видео жасау (AI)',
      titleUz: "Video yaratish (AI)", titleRu: 'Создание видео (AI)',
      subtitleKk: 'Reels, TikTok және жариялау',
      subtitleUz: "Reels, TikTok va publikator", subtitleRu: 'Reels, TikTok и публикатор',
      icon: <Video className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: '3 AI Агент',
      badgeUz: "3 AI agent", badgeRu: '3 AI Агента',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'add-product',
      titleKk: 'Тауар қосу',
      titleUz: "Mahsulot qo'shish", titleRu: 'Добавить товар',
      subtitleKk: 'Штрих-код және жаңа қойма',
      subtitleUz: "Shtrix-kod va yangi mahsulot", subtitleRu: 'Штрих-код и новый товар',
      icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-100',
      badgeKk: 'Жылдам қойма',
      badgeUz: "Tez ombor", badgeRu: 'Быстрый склад',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'analytics',
      titleKk: 'Аналитика',
      titleUz: "Analitika", titleRu: 'Аналитика',
      subtitleKk: 'Тікелей трафик және конверсия',
      subtitleUz: "Jonli trafik va konversiya", subtitleRu: 'Живой трафик и конверсия',
      icon: <BarChart3 className="w-4 h-4 text-cyan-600" />,
      bg: 'bg-cyan-50/80',
      border: 'border-cyan-100',
      badgeKk: 'Нақты',
      badgeUz: "Haqiqiy", badgeRu: 'Реальные',
      badgeColor: 'bg-cyan-100 text-cyan-700'
    },
    {
      id: 'business-analyze',
      titleKk: 'Бизнес талдауы',
      titleUz: "Biznes tahlili (AI)", titleRu: 'Анализ бизнеса (ИИ)',
      subtitleKk: 'Kaspi, WB, Instagram, Telegram бәсекелестері',
      subtitleUz: "Raqobatchilar: Kaspi, WB, Instagram, Telegram", subtitleRu: 'Конкуренты: Kaspi, WB, Instagram, Telegram',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: 'AI Аудит',
      badgeUz: "AI audit", badgeRu: 'AI Аудит',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'orders-manager',
      titleKk: 'Тапсырыстар',
      titleUz: "Buyurtmalar", titleRu: 'Заказы',
      subtitleKk: 'Сұраулар мен сатылымдар',
      subtitleUz: "So'rovlar va savdolar", subtitleRu: 'Запросы и продажи',
      icon: <ShoppingBag className="w-4 h-4 text-violet-600" />,
      bg: 'bg-violet-50/80',
      border: 'border-violet-100',
      badgeKk: 'Тікелей ағын',
      badgeUz: "Jonli oqim", badgeRu: 'Живой поток',
      badgeColor: 'bg-violet-100 text-violet-700'
    },
    {
      id: 'support',
      titleKk: 'Қолдау',
      titleUz: "Yordam", titleRu: 'Поддержка',
      subtitleKk: 'FindLead командасына жазу',
      subtitleUz: "FindLead jamoasiga yozish", subtitleRu: 'Написать команде FindLead',
      icon: <LifeBuoy className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: 'Чат',
      badgeUz: "Chat", badgeRu: 'Чат',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'growth',
      titleKk: 'Жазылушы өсуі',
      titleUz: "Obunachilar o'sishi", titleRu: 'Рост подписчиков',
      subtitleKk: 'Instagram және Telegram: қадамдық жоспар',
      subtitleUz: "Instagram va Telegram: bosqichma-bosqich reja", subtitleRu: 'Instagram и Telegram: план по шагам',
      icon: <Rocket className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-100',
      badgeKk: 'Жоспар',
      badgeUz: "Reja", badgeRu: 'План',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'marketplaces',
      titleKk: 'Маркетплейстер',
      titleUz: "Marketpleyslar", titleRu: 'Маркетплейсы',
      subtitleKk: 'Kaspi, WB, Uzum: тапсырыс, қаралым, сатылым',
      subtitleUz: "Kaspi, WB, Uzum: buyurtmalar, ko'rishlar, savdolar", subtitleRu: 'Kaspi, WB, Uzum: заказы, просмотры, продажи',
      icon: <Store className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50/80',
      border: 'border-rose-100',
      badgeKk: 'Есеп',
      badgeUz: "Hisobot", badgeRu: 'Отчёт',
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    {
      id: 'subscription',
      titleKk: 'Тарифтер мен жазылым',
      titleUz: "Tariflar va obuna", titleRu: 'Тарифы и подписка',
      subtitleKk: 'Starter, Growth, Enterprise',
      subtitleRu: 'Starter, Growth, Enterprise',
      icon: <Crown className="w-4 h-4 text-amber-600" />,
      bg: 'bg-gradient-to-br from-purple-50/90 to-indigo-50/90',
      border: 'border-purple-200/80',
      badgeKk: 'PRO Тариф',
      badgeUz: "PRO tarif", badgeRu: 'PRO Тариф',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'business-memory',
      titleKk: 'Бизнес жады (AI)',
      titleUz: "Biznes xotirasi (AI)", titleRu: 'Память бизнеса (AI)',
      subtitleKk: 'AI жады және білім базасы',
      subtitleUz: "AI xotirasi va bilimlar bazasi", subtitleRu: 'Память AI и база знаний',
      icon: <Brain className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      badgeKk: 'AI Жады',
      badgeUz: "AI xotira", badgeRu: 'AI Память',
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
              title={(language === 'uz' ? "Til va kirish sozlamalari (Bosing)" : language === 'ru' ? 'Язык и настройки входа (Нажмите)' : 'Тіл және кіру баптаулары (Басыңыз)')}
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
                  {userProfile?.storeName || 'FindLead'}
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
      <TelegramBusinessCard businessId={storeContext?.businessId} />

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
                <span className="text-xs font-black tracking-tight">{planName}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${plan?.state === 'expired' ? 'bg-rose-500/40 border-rose-200/40' : 'bg-white/25 border-white/20'} text-white`}>
                  {planBadge}
                </span>
              </div>
              <p className="text-[10.5px] text-purple-100 font-medium leading-tight mt-0.5">
                {planSubtitle}
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
                    {(isUz() ? (tool.badgeUz ?? tool.badgeRu) : language === 'ru' ? tool.badgeRu : tool.badgeKk)}
                  </span>
                </div>

                <div className="text-[11.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {(isUz() ? (tool.titleUz ?? tool.titleRu) : language === 'ru' ? tool.titleRu : tool.titleKk)}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {(isUz() ? (tool.subtitleUz ?? tool.subtitleRu) : language === 'ru' ? tool.subtitleRu : tool.subtitleKk)}
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
