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
import { customerSegments } from '../data/mockData';
import { RevenueAreaChart } from './RevenueAreaChart';
import { SubscriptionPlanView } from './SubscriptionPlanView';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { AIVideoGeneratorView } from './AIVideoGeneratorView';
import { AIPostGeneratorView } from './AIPostGeneratorView';
import { ProductsManagerView } from './ProductsManagerView';
import { BusinessMemoryView } from './BusinessMemoryView';
import { CustomerResponseView } from './CustomerResponseView';

export interface ToolDetailViewProps {
  toolId: string;
  onBack: () => void;
  storeContext?: any;
  showHeaderClose?: boolean;
}

// Reusable SVG Donut Pie Chart Component
const SvgPieChart: React.FC<{
  data: { label: string; value: number; color: string; prefix?: string; suffix?: string }[];
  size?: number;
  centerTitle?: string;
  centerSubtitle?: string;
}> = ({ data, size = 160, centerTitle, centerSubtitle }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let accumulatedAngle = -90;

  const radius = size / 2;
  const innerRadius = radius * 0.58;

  const slices = data.map((item) => {
    const sliceAngle = total > 0 ? (item.value / total) * 360 : 0;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + sliceAngle;
    accumulatedAngle += sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = radius + radius * 0.9 * Math.cos(startRad);
    const y1 = radius + radius * 0.9 * Math.sin(startRad);
    const x2 = radius + radius * 0.9 * Math.cos(endRad);
    const y2 = radius + radius * 0.9 * Math.sin(endRad);

    const ix1 = radius + innerRadius * Math.cos(endRad);
    const iy1 = radius + innerRadius * Math.sin(endRad);
    const ix2 = radius + innerRadius * Math.cos(startRad);
    const iy2 = radius + innerRadius * Math.sin(startRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius * 0.9} ${radius * 0.9} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z'
    ].join(' ');

    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

    return {
      ...item,
      pathData,
      percentage
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {slices.map((s, idx) => (
            <path
              key={idx}
              d={s.pathData}
              fill={s.color}
              className="transition-all duration-300 hover:opacity-85 cursor-pointer"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {centerTitle && (
            <span className="text-[13px] font-black text-slate-900 leading-tight">
              {centerTitle}
            </span>
          )}
          {centerSubtitle && (
            <span className="text-[9px] font-medium text-slate-400">
              {centerSubtitle}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2.5 w-full max-w-[260px]">
        {slices.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate pr-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-600 truncate text-[10.5px] font-medium">{s.label}</span>
            </div>
            <span className="font-bold text-slate-900 text-[10.5px]">
              {s.prefix || ''}{s.value.toLocaleString()}{s.suffix || ''} ({s.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ToolDetailView: React.FC<ToolDetailViewProps> = ({
  toolId,
  onBack,
  storeContext,
  showHeaderClose = false
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Time filter for Analytics pie charts: 'today' | 'week' | 'month'
  const [analyticsFilter, setAnalyticsFilter] = useState<'today' | 'week' | 'month'>('week');

  // Orders filter
  const [orderFilter, setOrderFilter] = useState<'All' | 'In processing' | 'Completed' | 'Return'>('All');
  const [showOrderFilterDropdown, setShowOrderFilterDropdown] = useState(false);

  // AI Operator states
  const [operatorCallType, setOperatorCallType] = useState<'promo' | 'incoming'>('promo');
  const [operatorTopic, setOperatorTopic] = useState('');
  const [operatorCalling, setOperatorCalling] = useState(false);
  const [operatorCallStep, setOperatorCallStep] = useState(0);

  // Script creator state
  const [scriptGoal, setScriptGoal] = useState('');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);

  // Call Analysis state
  const [analyzingCalls, setAnalyzingCalls] = useState(false);
  const [callAnalysisResult, setCallAnalysisResult] = useState<string | null>(null);

  // Post creator state
  const [postTopic, setPostTopic] = useState(language === 'ru' ? 'Новая коллекция и скидка 20%' : 'Жаңа топтама және 20% жеңілдік');
  const [postPlatform, setPostPlatform] = useState<'instagram' | 'telegram' | 'facebook'>('instagram');
  const [generatedPost, setGeneratedPost] = useState<string>(
    language === 'ru'
      ? `✨ СПЕШИТЕ! НОВАЯ СЕЗОННАЯ КОЛЛЕКЦИЯ УЖЕ В ПРОДАЖЕ! ✨\n\n` +
        `🔥 Только на этой неделе специальная СКИДКА -20% на весь ассортимент!\n\n` +
        `📦 Быстрая доставка по всему Казахстану.\n` +
        `📲 Чтобы оформить заказ, пишите в Direct или переходите по ссылке.\n\n` +
        `#новая_коллекция #скидки #operon #мода #онлайн_магазин`
      : `✨ АСЫҒЫҢЫЗДАР! ЖАҢА МАУСЫМДЫҚ ТОПТАМА САТЫЛЫМДА! ✨\n\n` +
        `🔥 Тек осы аптада таңдаулы тауарларға -20% АРНАЙЫ ЖЕҢІЛДІК!\n\n` +
        `📦 Қазақстан бойынша жылдам жеткізу қызметі бар.\n` +
        `📲 Тапсырыс беру үшін Direct-ке жазыңыз немесе сілтемеге өтіңіз.\n\n` +
        `#жаңа_топтама #жеңілдік #operon #сән #онлайн_сауда`
  );

  // Video creator state
  const [videoPrompt, setVideoPrompt] = useState('Mahsulot taqdimoti va dinamik musiqa');
  const [videoStyle, setVideoStyle] = useState('viral');
  const [videoRendering, setVideoRendering] = useState(false);
  const [videoProgress, setVideoProgress] = useState(100);

  // Product add state
  const [prodName, setProdName] = useState('Premium Smart Watch Pro');
  const [prodPrice, setProdPrice] = useState('420000');
  const [prodCategory, setProdCategory] = useState('Elektronika');
  const [prodStock, setProdStock] = useState('35');
  const [prodSuccess, setProdSuccess] = useState(false);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Assalomu alaykum! Men AI biznes maslahatchisiman. Do‘koningiz tahlili yoki avtomatlashtirish bo‘yicha qanday yordam bera olaman?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);

  // Business Analyze (AI) state
  const [isAnalyzingBiz, setIsAnalyzingBiz] = useState(false);
  const [bizRecommendations, setBizRecommendations] = useState<string[] | null>(null);
  const [showHistoryRecommendations, setShowHistoryRecommendations] = useState(false);

  // Competitor Analyze (AI) state
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<{
    competitors: Array<{ name: string; share: string; advantage: string; threat: string }>;
    winningStrategy: string[];
  } | null>(null);

  const handleAnalyzeBusiness = () => {
    setIsAnalyzingBiz(true);
    setTimeout(() => {
      setBizRecommendations([
        "Xarid savatchasi o'rtacha chekini 18% ga oshirish uchun 'Labubu + Mini aksessuarlar' to'plamini yarating.",
        "Muntazam xaridorlar (20-40 yoshdagi onalar) uchun 3-chi xariddan boshlab avtomatik bonus tizimini yoqing.",
        "Reels va TikTok video formatlarida bolalar xavfsizligi va qadoqlash jarayonini ko'rsatish konversiyani +24% ga ko'taradi."
      ]);
      setIsAnalyzingBiz(false);
    }, 700);
  };

  const handleAnalyzeCompetitors = () => {
    setIsAnalyzingCompetitors(true);
    setTimeout(() => {
      setCompetitorAnalysis({
        competitors: [
          { name: "ToyLand Uz", share: "34% bozor ulushi", advantage: "Katta assortiment", threat: "Yetkazib berish sekin (2 kun)" },
          { name: "KidsStore Tashkent", share: "22% bozor ulushi", advantage: "Oflayn filiallar", threat: "Narxlari 15-20% qimmat" },
          { name: "PopMart Express", share: "14% bozor ulushi", advantage: "Eksklyuziv modellar", threat: "Mijozlar bilan aloqa sust" }
        ],
        winningStrategy: [
          "2 soat ichida ekspress yetkazib berish xizmati bilan raqobatchilardan tezroq bo'lish.",
          "AI orqali har bir mijozga shaxsiylashtirilgan taklif va video-obzorlar jo'natish.",
          "Asl nusxa (Original sertifikat) kafolatini reklama kampaniyalarining asosiy fokusiga aylantirish."
        ]
      });
      setIsAnalyzingCompetitors(false);
    }, 750);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateScript = () => {
    setScriptLoading(true);
    setTimeout(() => {
      setGeneratedScript(
        `🎙️ AI Qo'ng'iroq Ssenariysi:\n\n` +
        `1. Salomlashish: "Assalomu alaykum! Do'konimizdan sizga qulay taklif bilan AI operator qo'ng'iroq qilmoqda."\n` +
        `2. Asosiy taklif: "${scriptGoal || 'Siz yoqtirgan tovarlar uchun maxsus 20% keshbek va bepul yetkazish'}"\n` +
        `3. Mijoz e'tirozi: "Agar hozir band bo'lsangiz, Telegram orqali katalog yuborishimiz mumkin."\n` +
        `4. Harakatga undash: "Buyurtmangizni kuryer orqali band qilamizmi?"`
      );
      setScriptLoading(false);
    }, 600);
  };

  const handleAnalyzeCalls = () => {
    setAnalyzingCalls(true);
    setTimeout(() => {
      setCallAnalysisResult(
        `📊 AI Qo'ng'iroqlar Xulosasi (Oxirgi 140 ta suhbat):\n\n` +
        `• 78% mijozlar narx va yetkazish tezligidan to'liq rozi bo'lgan.\n` +
        `• 14% rad etish sababi: boshqa rang yoki o'lcham qidirilgan.\n` +
        `• Tavsiya: Yetkazib berish vaqtini 1 kun oldin eslatish va savdo konversiyasini +12% ga oshirish mumkin.`
      );
      setAnalyzingCalls(false);
    }, 700);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatThinking(true);

    setTimeout(() => {
      let reply = `Operon tahliliga ko‘ra, bu yo‘nalishda daromadni 15-20% ga oshirish mumkin. Tavsiya: doimiy mijozlarga shaxsiy chegirma bildirishnomasi yuboring!`;
      if (userText.toLowerCase().includes('reklama') || userText.toLowerCase().includes('smm')) {
        reply = `Instagram va Telegram kanalingiz uchun yangi 3 ta viral video ssenariysi tayyorlandi. Post yaratish bo‘limidan foydalanishingiz mumkin!`;
      } else if (userText.toLowerCase().includes('foyda') || userText.toLowerCase().includes('daromad')) {
        reply = `Oxirgi 12 oylik sof daromadingiz $1,469,324,230 ga yetdi (+12.2%). Eng yuqori rentabellik 'Wholesalers' segmentida kuzatilmoqda.`;
      }
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setChatThinking(false);
    }, 600);
  };

  // Demo Financial Data by Time Filter for Analytics
  const financialDataMap = {
    today: {
      netProfit: '$14,820',
      slices: [
        { label: 'Kirim', value: 22400, color: '#3B82F6', prefix: '$' },
        { label: 'Foyda', value: 14820, color: '#10B981', prefix: '$' },
        { label: 'Chiqim', value: 6200, color: '#F59E0B', prefix: '$' },
        { label: 'Zarar', value: 1380, color: '#EF4444', prefix: '$' },
      ],
      activitySlices: [
        { label: 'Mijoz suhbatlari', value: 38, color: '#6366F1' },
        { label: 'Buyurtmalar', value: 18, color: '#10B981' },
        { label: 'Postlar', value: 4, color: '#8B5CF6' },
        { label: 'Videolar', value: 2, color: '#EC4899' },
      ]
    },
    week: {
      netProfit: '$104,250',
      slices: [
        { label: 'Kirim', value: 158000, color: '#3B82F6', prefix: '$' },
        { label: 'Foyda', value: 104250, color: '#10B981', prefix: '$' },
        { label: 'Chiqim', value: 44300, color: '#F59E0B', prefix: '$' },
        { label: 'Zarar', value: 9450, color: '#EF4444', prefix: '$' },
      ],
      activitySlices: [
        { label: 'Mijoz suhbatlari', value: 240, color: '#6366F1' },
        { label: 'Buyurtmalar', value: 128, color: '#10B981' },
        { label: 'Postlar', value: 24, color: '#8B5CF6' },
        { label: 'Videolar', value: 12, color: '#EC4899' },
      ]
    },
    month: {
      netProfit: '$446,700',
      slices: [
        { label: 'Kirim', value: 682000, color: '#3B82F6', prefix: '$' },
        { label: 'Foyda', value: 446700, color: '#10B981', prefix: '$' },
        { label: 'Chiqim', value: 192500, color: '#F59E0B', prefix: '$' },
        { label: 'Zarar', value: 42800, color: '#EF4444', prefix: '$' },
      ],
      activitySlices: [
        { label: 'Mijoz suhbatlari', value: 980, color: '#6366F1' },
        { label: 'Buyurtmalar', value: 512, color: '#10B981' },
        { label: 'Postlar', value: 96, color: '#8B5CF6' },
        { label: 'Videolar', value: 48, color: '#EC4899' },
      ]
    }
  };

  const currentFinancial = financialDataMap[analyticsFilter];

  // Orders data (matching Image 1 exactly)
  const ordersList = [
    {
      id: '34567',
      createdDate: 'From Sept 22',
      deliveryDate: 'Sept 27',
      itemsCount: 1,
      shippingMethod: 'Canada post',
      status: 'In processing' as const
    },
    {
      id: '54577',
      createdDate: 'From Sept 12',
      deliveryDate: 'Sept 16',
      itemsCount: 2,
      shippingMethod: 'Canada post',
      status: 'Completed' as const
    },
    {
      id: '4567',
      createdDate: 'From Sept 1',
      deliveryDate: 'Sept 10',
      itemsCount: 8,
      shippingMethod: 'Canada post',
      status: 'Return' as const
    },
    {
      id: '98421',
      createdDate: 'From Oct 14',
      deliveryDate: 'Oct 19',
      itemsCount: 3,
      shippingMethod: 'Express Post',
      status: 'In processing' as const
    },
    {
      id: '87123',
      createdDate: 'From Oct 08',
      deliveryDate: 'Oct 12',
      itemsCount: 5,
      shippingMethod: 'DHL Express',
      status: 'Completed' as const
    }
  ];

  const filteredOrders = ordersList.filter((o) => {
    if (orderFilter === 'All') return true;
    return o.status === orderFilter;
  });

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
    return <SubscriptionPlanView onBack={onBack} />;
  }

  if (toolId === 'ai-management') {
    return <AIAssistantDrawer isOpen={true} onClose={onBack} storeContext={storeContext} isEmbedded={true} />;
  }

  if (toolId === 'video-creator') {
    return <AIVideoGeneratorView onBack={onBack} />;
  }

  if (toolId === 'post-creator') {
    return <AIPostGeneratorView onBack={onBack} storeContext={storeContext} />;
  }

  if (toolId === 'add-product' || toolId === 'products' || toolId === 'products-catalog') {
    return <ProductsManagerView onBack={onBack} storeContext={storeContext} />;
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
        {/* 1. ANALYTICS (Sof foyda + 2 ta Pie Chart) */}
        {/* ========================================== */}
        {toolId === 'analytics' && (
          <div className="space-y-4">
            {/* Total Revenue Area Graph (matching exact uploaded user reference image) */}
            <RevenueAreaChart />

            {/* 2 ta Donut / Pie Chart: Moliya & Faollik */}
            <div className="grid grid-cols-1 gap-3.5">
              {/* 1-Pie: Moliya */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    Moliya Taqsimoti (Kirim, Foyda, Chiqim, Zarar)
                  </h4>
                </div>

                <SvgPieChart
                  data={currentFinancial.slices}
                  size={155}
                  centerTitle={currentFinancial.netProfit}
                  centerSubtitle="Sof Foyda"
                />
              </div>

              {/* 2-Pie: Faollik */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    Suhbatlar, Kontent va Buyurtmalar Ulushi
                  </h4>
                </div>

                <SvgPieChart
                  data={currentFinancial.activitySlices}
                  size={155}
                  centerTitle={`${currentFinancial.activitySlices.reduce((a, c) => a + c.value, 0)}`}
                  centerSubtitle="Jami Amallar"
                />
              </div>
            </div>

            {/* Vaqt Filtri: Bugun, Oxirgi hafta, Oxirgi oy */}
            <div className="p-1.5 bg-slate-200/70 rounded-2xl flex items-center gap-1 border border-slate-200">
              {[
                { id: 'today', label: 'Bugun' },
                { id: 'week', label: 'Oxirgi hafta' },
                { id: 'month', label: 'Oxirgi oy' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAnalyticsFilter(f.id as any)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
                    analyticsFilter === f.id
                      ? 'bg-white text-slate-900 shadow-2xs scale-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 2. BIZNES TAHLILI (AI & Mijozlar Portfeli) */}
        {/* ========================================== */}
        {toolId === 'business-analyze' && (
          <div className="space-y-3.5">
            {/* Header description */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">Biznes Tahlili & Mijozlar Portfeli</h3>
                  <p className="text-[10.5px] text-slate-500 font-normal leading-tight">
                    Operon AI — biznes xulosasi, raqobat tahlili hamda mijozlar toifalari & sodiqlik auditi.
                  </p>
                </div>
              </div>
            </div>

            {/* 1. AI Biznes Xulosasi */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">AI Biznes Xulosasi</h4>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-600">
                {storeContext?.storeName ? `${storeContext.storeName} — ` : 'Operon — '}bolalar uchun Labubu figuralari va qo'g'irchoqlarni sotuvchi biznesdir. Bizning asosiy maqsadimiz kichik bolali ota-onalarga, xususan, onalarga sifatli va xavfsiz o'yinchoqlar taklif qilish. Biz ijtimoiy tarmoqlardagi faolligimiz va bolalar ijodkorligini rivojlantirish g'oyasi bilan farqlanamiz.
              </p>
            </div>

            {/* 2. 4-Grid Cards: Maqsadli auditoriya, Asosiy ustunlik, Zaif tomonlar, Muloqot uslubi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Card 1: Maqsadli auditoriya */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-600">Maqsadli Auditoriya</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Maqsadli auditoriyamiz 20-40 yoshdagi kichik bolali onalar, Toshkent shahrida yashovchi, farzandiga sifatli va xavfsiz o'yinchoq/sovg'a izlaydiganlar.
                </p>
              </div>

              {/* Card 2: Asosiy ustunlik */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Award className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-600">Asosiy Ustunlik</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Bizning asosiy ustunligimiz muntazam ijtimoiy tarmoq faolligi va bolalar ijodkorligini rivojlantirish g'oyasi bilan farqlanishimiz.
                </p>
              </div>

              {/* Card 3: Zaif tomonlar */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-500">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-rose-500">Zaif Tomonlar</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Mumkin bo'lgan zaif tomonlarimiz — mahsulotlar tanlovi cheklangan va raqobat yuqori.
                </p>
              </div>

              {/* Card 4: Muloqot uslubi */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-600">Muloqot Uslubi</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  AI mijoz bilan gaplashishi kerak bo'lgan uslub — do'stona, yordamchi va maslahatchi.
                </p>
              </div>
            </div>

            {/* 3. AI Tavsiyalari */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-500">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">AI Tavsiyalari</h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Biznesingizning haqiqiy raqamlarini tahlil qilib, aniq qadamlar tavsiya qiladi.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeBusiness}
                  disabled={isAnalyzingBiz}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-[11.5px] font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 disabled:opacity-75"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzingBiz ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingBiz ? 'Tahlil qilinmoqda...' : 'Tahlil qilish'}</span>
                </button>
              </div>

              {/* Box */}
              <div className="bg-[#FAFBFD] rounded-xl p-3 border border-slate-200/80 min-h-[65px] flex items-center justify-center">
                {isAnalyzingBiz ? (
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold py-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI sotuv, mahsulot va mijoz ma'lumotlarini o'lchamoqda...</span>
                  </div>
                ) : bizRecommendations ? (
                  <div className="w-full text-left space-y-2 py-1">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 3 ta strategik tavsiya tayyorlandi
                      </span>
                      <span className="text-[10px] text-slate-400">Hozirgina</span>
                    </div>
                    {bizRecommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-3xs">
                        <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{rec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed text-center">
                    "Tahlil qilish" tugmasini bosing — AI sotuv, mahsulot, kontent va mijoz ma'lumotlaringizni o'lchab, aniq qadamlar tavsiya qiladi.
                  </p>
                )}
              </div>

              {/* Collapsible history */}
              <div>
                <button
                  onClick={() => setShowHistoryRecommendations(!showHistoryRecommendations)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <History className="w-3 h-3 text-slate-400" />
                  <span>Avvalgi tavsiyalar (30)</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showHistoryRecommendations ? 'rotate-180' : ''}`} />
                </button>

                {showHistoryRecommendations && (
                  <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100 text-[10.5px] text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2">
                      <span>• Labubu Pop Mart to'plamini 10% keshbek bilan reklama qilish</span>
                      <span className="text-slate-400 shrink-0">Kecha</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2">
                      <span>• Telegram bot orqali avtomatik kvitansiya yuborishni ulash</span>
                      <span className="text-slate-400 shrink-0">3 kun oldin</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. AI Raqobat Tahlili */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-purple-600">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Swords className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">AI Raqobat Tahlili</h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Biznesingiz yo'nalishidagi raqobatchilar va g'olib bo'lish strategiyasi (real AI).
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeCompetitors}
                  disabled={isAnalyzingCompetitors}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-[11.5px] font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 disabled:opacity-75"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzingCompetitors ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingCompetitors ? 'Tahlil qilinmoqda...' : 'Raqobatchilarni tahlil qilish'}</span>
                </button>
              </div>

              {/* Content box */}
              <div className="bg-[#FAFBFD] rounded-xl p-3 border border-slate-200/80 min-h-[75px] flex items-center justify-center">
                {isAnalyzingCompetitors ? (
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold py-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Raqobatchilar narxlari, assortimenti va bozor ulushi tahlil qilinmoqda...</span>
                  </div>
                ) : competitorAnalysis ? (
                  <div className="w-full text-left space-y-2.5 py-1">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <Swords className="w-3.5 h-3.5 text-purple-600" /> Top Raqobatchilar va Ulushi
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                        Jonli AI Tahlil
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {competitorAnalysis.competitors.map((c, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200/70 shadow-3xs flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[11px] font-bold text-slate-800">{c.name}</div>
                            <div className="text-[10px] text-slate-500">{c.advantage} • Zaifligi: {c.threat}</div>
                          </div>
                          <span className="text-[10.5px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">
                            {c.share}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-xl space-y-1">
                      <div className="text-[10.5px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> G'olib bo'lish strategiyasi:
                      </div>
                      <ul className="text-[10px] text-emerald-900/90 space-y-0.5 pl-3 list-disc">
                        {competitorAnalysis.winningStrategy.map((strat, i) => (
                          <li key={i}>{strat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 space-y-1.5 text-center">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <p className="text-[11px] text-slate-500 font-medium max-w-sm">
                      "Raqobatchilarni tahlil qilish" tugmasini bosing — AI biznesingiz uchun raqobat tahlilini tayyorlaydi.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. MIJOZLAR TOIFASI & SODIQLIK AUDITI */}
            <div className="pt-2 space-y-3">
              {/* Mijoz toifasi (Customer Breakdown Donut/Segments) */}
              <div className="border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-2xs p-1">
                <CustomerBreakdown segments={customerSegments} />
              </div>

              {/* Mijozlarni saqlab qolish (Retention Gauge) */}
              <div className="border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-2xs p-1">
                <RetentionGauge percentage={68} target={80} />
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 3. BUYURTMALAR (Orders) */}
        {/* ========================================== */}
        {toolId === 'orders-manager' && (
          <div className="space-y-3">
            {/* Header bar matching exact screenshot 1 */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 tracking-tight">Orders List</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowOrderFilterDropdown(!showOrderFilterDropdown)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200/90 px-2.5 py-1 rounded-xl shadow-2xs"
                >
                  <SlidersHorizontal className="w-3 h-3 text-slate-600" />
                  <span>{orderFilter}</span>
                </button>

                {showOrderFilterDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-30 min-w-[120px]">
                    {(['All', 'In processing', 'Completed', 'Return'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setOrderFilter(f);
                          setShowOrderFilterDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-between ${
                          orderFilter === f ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{f}</span>
                        {orderFilter === f && <Check className="w-3 h-3 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Orders Cards matching screenshot 1 */}
            <div className="space-y-2.5">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                        Order {order.id}
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-normal mt-0.5">
                        {order.createdDate}
                      </p>
                    </div>
                    <div>
                      {order.status === 'In processing' && (
                        <span className="px-3 py-0.5 rounded-full bg-[#007AFF] text-white text-[10px] font-semibold">
                          In processing
                        </span>
                      )}
                      {order.status === 'Completed' && (
                        <span className="px-3 py-0.5 rounded-full bg-[#34C759] text-white text-[10px] font-semibold">
                          Completed
                        </span>
                      )}
                      {order.status === 'Return' && (
                        <span className="px-3 py-0.5 rounded-full bg-[#C7C7CC] text-white text-[10px] font-semibold">
                          Return
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-[10.5px] text-slate-400 border-t border-slate-100 pt-1.5">
                    <div className="flex items-center justify-between">
                      <p>
                        <span className="font-normal text-slate-700">Delivery date</span>{' '}
                        <span className="text-slate-400">{order.deliveryDate}</span>
                      </p>
                      <span className="text-slate-400 font-medium">
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <p>
                      <span className="font-normal text-slate-700">Shipping method</span>{' '}
                      <span className="text-slate-400">{order.shippingMethod}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 4. TELEFON OPERATORI (Image 2 & 3) */}
        {/* ========================================== */}
        {toolId === 'phone-operator' && (
          <div className="space-y-3.5">
            {/* Sinov qo'ng'irog'i (Image 2) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">Sinov qo'ng'irog'i</h4>

              <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1">
                <button
                  onClick={() => setOperatorCallType('promo')}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    operatorCallType === 'promo'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Reklama qo'ng'irog'i
                </button>
                <button
                  onClick={() => setOperatorCallType('incoming')}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    operatorCallType === 'incoming'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kiruvchi qo'ng'irog'i
                </button>
              </div>

              <textarea
                rows={2}
                value={operatorTopic}
                onChange={(e) => setOperatorTopic(e.target.value)}
                placeholder="Nima haqida gapirsin? (bo'sh qoldirsangiz — aksiya yoki mahsulotingizdan o'zi oladi)"
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[11px] outline-none focus:border-emerald-500 placeholder:text-slate-400 resize-none"
              />

              {operatorCalling ? (
                <div className="p-2.5 bg-slate-900 text-white rounded-xl space-y-1.5 text-center animate-in fade-in">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Qo'ng'iroq jarayonda ({operatorCallStep === 1 ? 'Ulanmoqda...' : 'Suhbat davom etmoqda'})
                  </div>
                  <p className="text-[10px] text-emerald-300">
                    🎙️ AI Operator: "Assalomu alaykum! Do'kondan maxsus aksiya bo'yicha sizga aloqaga chiqyapman."
                  </p>
                  <button
                    onClick={() => { setOperatorCalling(false); setOperatorCallStep(0); }}
                    className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg"
                  >
                    Yakunlash
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setOperatorCalling(true);
                    setOperatorCallStep(1);
                    setTimeout(() => setOperatorCallStep(2), 1500);
                  }}
                  className="w-full py-2 bg-[#34C759] hover:bg-emerald-600 text-white font-bold text-[11.5px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Qo'ng'iroq qilish</span>
                </button>
              )}
            </div>

            {/* Ovoz xabari yozish & Qo'ng'iroqlar bahosi */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">Ovoz xabari yozish</h4>
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2 bg-[#34C759] hover:bg-emerald-600 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs">
                  <Mic className="w-3 h-3" />
                  <span>Yozishni boshlash</span>
                </button>
                <button className="flex-1 py-2 bg-[#007AFF] hover:bg-blue-600 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs">
                  <Volume2 className="w-3 h-3" />
                  <span>Audio fayl yuklash</span>
                </button>
              </div>
            </div>

            {/* AI ssenariy (Image 3) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">AI qo'ng'iroq ssenariysi</h4>
              </div>

              <p className="text-[10.5px] text-slate-500">
                Maqsadni yozing — AI nima deyishingizni tayyorlab beradi.
              </p>

              <textarea
                rows={2}
                value={scriptGoal}
                onChange={(e) => setScriptGoal(e.target.value)}
                placeholder="Masalan: yangi mahsulotni taklif qilish, qaytmagan mijozni qaytarish..."
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[11px] outline-none focus:border-purple-500 placeholder:text-slate-400 resize-none"
              />

              <button
                onClick={handleGenerateScript}
                disabled={scriptLoading}
                className="w-full py-2 bg-[#5856D6] hover:bg-indigo-600 text-white font-bold text-[11.5px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {scriptLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>⭐ Ssenariy tuzish</span>
              </button>

              {generatedScript && (
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-950 whitespace-pre-line leading-relaxed">
                  {generatedScript}
                </div>
              )}
            </div>

            {/* Qo'ng'iroqlar tahlili (Image 3) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#007AFF] text-white flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">Qo'ng'iroqlar tahlili</h4>
                </div>

                <button
                  onClick={handleAnalyzeCalls}
                  disabled={analyzingCalls}
                  className="py-1 px-2.5 bg-[#007AFF] hover:bg-blue-600 text-white text-[10.5px] font-bold rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  {analyzingCalls ? <RefreshCw className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3" />}
                  <span>Tahlil qilish</span>
                </button>
              </div>

              <p className="text-[10.5px] text-slate-500">
                Qo'ng'iroqlar natijasini AI tahlil qilib, mijozlar nima sabab bilan rad etayotganini ko'rsatadi.
              </p>

              {callAnalysisResult && (
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-950 whitespace-pre-line leading-relaxed">
                  {callAnalysisResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 5. JIMI AI (AI Management) */}
        {/* ========================================== */}
        {toolId === 'ai-management' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold">AI Biznes Assistent</h4>
                  <p className="text-[10px] text-blue-100">Operon real vaqtdagi korporativ yordamchingiz</p>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-slate-200/80 min-h-[220px] max-h-[340px] overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-2xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {chatThinking && (
                <div className="flex justify-start">
                  <div className="p-2 bg-slate-100 rounded-2xl text-[11px] text-slate-500 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                    AI o'ylamoqda...
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="AI ga savol bering yoki hisobot so'rang..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-medium shadow-2xs"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-xs active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 6. POST YARATISH (SMM Moduli) */}
        {/* ========================================== */}
        {toolId === 'post-creator' && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Post mavzusi yoki Mahsulot</label>
              <input
                type="text"
                value={postTopic}
                onChange={(e) => setPostTopic(e.target.value)}
                placeholder="Masalan: Yangi kiyimlar, 15% chegirma..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 font-medium shadow-2xs"
              />
            </div>

            <div className="flex gap-1.5">
              {(['instagram', 'telegram', 'facebook'] as const).map((plat) => (
                <button
                  key={plat}
                  onClick={() => setPostPlatform(plat)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all border ${
                    postPlatform === plat
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setGeneratedPost(
                    `🌟 ${postTopic.toUpperCase()} 🌟\n\n` +
                    `Siz kutgan eng sara takliflar endi do'konimizda! AI tomonidan tavsiya etilgan eng yuqori sifatli tovarlar siz uchun tayyorlandi.\n\n` +
                    `✅ Kafolatlangan sifat\n` +
                    `🚚 24 soat ichida yetkazish\n` +
                    `🎁 Har bir xaridga sovg'a!\n\n` +
                    `👉 Hoziroq izohlarda "+" qoldiring yoki Direct ga yozing!\n\n` +
                    `#${postPlatform} #trend #operon #biznes #savdo`
                  );
                  setLoading(false);
                }, 500);
              }}
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>AI bilan yangi post yaratish</span>
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 relative shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-[10.5px] font-bold text-purple-700 uppercase tracking-wider">Tayyor Post Matni</span>
                <button
                  onClick={() => copyToClipboard(generatedPost)}
                  className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-semibold px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Nusxa olindi!' : 'Nusxa olish'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {generatedPost}
              </p>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 7. VIDEO YARATISH (Reels & Shorts) */}
        {/* ========================================== */}
        {toolId === 'video-creator' && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Video g‘oyasi & Tavsif</label>
              <input
                type="text"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-500 font-medium shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'viral', label: '🔥 Viral Trend' },
                { id: 'promo', label: '🎯 Sotuvchi' },
                { id: 'review', label: '⭐ Obzor' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setVideoStyle(st.id)}
                  className={`py-2 px-1 rounded-xl text-[10.5px] font-bold border text-center transition-all ${
                    videoStyle === st.id
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="relative aspect-[9/9] max-w-[200px] mx-auto bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 flex flex-col items-center justify-center text-white p-3 shadow-lg">
              {videoRendering ? (
                <div className="text-center space-y-2">
                  <RefreshCw className="w-7 h-7 text-rose-500 animate-spin mx-auto" />
                  <div className="text-[11px] font-bold">Generatsiya ({videoProgress}%)</div>
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1.5">
                  <div className="w-11 h-11 rounded-full bg-rose-500/80 flex items-center justify-center mx-auto shadow-md cursor-pointer hover:scale-105 transition-transform">
                    <Play className="w-5 h-5 ml-0.5" fill="white" />
                  </div>
                  <div className="text-[11px] font-bold">Reels AI Preview</div>
                  <div className="text-[9.5px] text-slate-400">1080x1920 • 9:16 • 15 soniya</div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setVideoRendering(true);
                setVideoProgress(15);
                const interval = setInterval(() => {
                  setVideoProgress((prev) => {
                    if (prev >= 100) {
                      clearInterval(interval);
                      setVideoRendering(false);
                      return 100;
                    }
                    return prev + 25;
                  });
                }, 400);
              }}
              disabled={videoRendering}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yangi Reels render qilish</span>
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* 8. MAXSULOT QO'SHISH */}
        {/* ========================================== */}
        {toolId === 'add-product' && (
          <div className="space-y-3">
            {prodSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Mahsulot omborga muvaffaqiyatli qo‘shildi!
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Mahsulot nomi</label>
              <input
                type="text"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Sotish narxi (UZS)</label>
                <input
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Ombordagi miqdor</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Kategoriya</label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none shadow-2xs"
              >
                <option>Elektronika</option>
                <option>Kiyim & Poyabzal</option>
                <option>Go'zallik & Parvarish</option>
                <option>Uy & Oshxona</option>
                <option>Aksessuarlar</option>
              </select>
            </div>

            <button
              onClick={() => {
                setProdSuccess(true);
                setTimeout(() => setProdSuccess(false), 3000);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Mahsulotni Do‘konga Qo‘shish</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
