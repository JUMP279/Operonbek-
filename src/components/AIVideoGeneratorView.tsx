import React, { useState } from 'react';
import {
  ArrowLeft,
  Video,
  Sparkles,
  RefreshCw,
  Upload,
  Calendar,
  Clock,
  Instagram,
  Send,
  Sliders,
  CheckCircle2,
  Play,
  Pause,
  Film,
  Flame,
  Search,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Bot,
  BrainCircuit,
  Music,
  FileVideo,
  Wand2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface AIVideoGeneratorViewProps {
  onBack: () => void;
}

type TabType = 'ai-video' | 'ideas' | 'order-upload' | 'settings' | 'schedule';

interface VideoIdea {
  id: string;
  title: string;
  category: string;
  viralScore: number;
  hook: string;
  duration: string;
  platform: 'Instagram' | 'Telegram' | 'TikTok' | 'Barchasi';
  description: string;
}

interface ScheduledVideo {
  id: string;
  title: string;
  thumbnail: string;
  platform: 'Instagram' | 'Telegram' | 'TikTok';
  scheduledTime: string;
  status: 'Kutilmoqda' | 'Nashr etildi' | 'Qoralama' | 'Jarayonda';
  viewsForecast: string;
}

export const AIVideoGeneratorView: React.FC<AIVideoGeneratorViewProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('ai-video');

  // Channels connection state
  const [instagramConnected, setInstagramConnected] = useState(true);
  const [telegramConnected, setTelegramConnected] = useState(true);
  const [tiktokConnected, setTiktokConnected] = useState(false);

  // Trend search modal
  const [showTrendSearch, setShowTrendSearch] = useState(false);
  const [trendSearching, setTrendSearching] = useState(false);
  const [trendResults, setTrendResults] = useState<any[]>([]);

  // Tab 1: AI Video state
  const [topic, setTopic] = useState('Yangi mavsumiy kolleksiya va mijozlar uchun maxsus 20% chegirma');
  const [additionalNote, setAdditionalNote] = useState("Do'kon ichida, xaridorlar gavjum paytida suratga olinsin, quvnoq va baquvvat ritmda bo'lsin");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<any | null>({
    title: "Mavsumiy yangi kolleksiya — 3 soniyalik viral hook",
    hook: "«Agar do'koningizga hali kirmagan bo'lsangiz, bugungi trendlarni o'tkazib yubordingiz!»",
    scenes: [
      { sec: "0-3s", visual: "Kameraga yaqinlashib eng chiroyli kiyim kadrga tutiladi, savol bilan boshlanadi.", audio: "Trend phonk beat / Bass drop" },
      { sec: "4-9s", visual: "Kassadagi va rastadagi xursand mijozlar, qulay narx belgilari va sifat detallari.", audio: "Dinamik musiqa + Ovozli hikoya" },
      { sec: "10-15s", visual: "Do'kon manzili, bio dagi havola va chegirma kuponi ekranda chaqnaydi.", audio: "Outro + Call-to-action" }
    ],
    hashtags: "#trend #yangi_kolleksiya #shopping #uzbekistan #toshkent #chegirma",
    recommendedAudio: "Asap Rocky - Praise The Lord (Remix Viral)",
    agentReviews: [
      { agent: "1-Agent: Ssenarist AI", role: "Hook & Dialog", verdict: "98% e'tibor ushlash kuchi. Birinchi 3 soniya judayam kuchli." },
      { agent: "2-Agent: Vizual Direktor", role: "Ritm & Montaj", verdict: "9:16 vertikal format, 12 ta tezkor kesish tavsiya etildi." },
      { agent: "3-Agent: SMM Operator", role: "Nashr & SEO", verdict: "Instagram Reels uchun eng qulay vaqt: Bugun soat 18:45." }
    ]
  });

  // Tab 2: Ideas state
  const [ideas, setIdeas] = useState<VideoIdea[]>([
    {
      id: 'idea-1',
      title: "«Do'kondagi eng ko'p sotilgan 3 ta mahsulot siri»",
      category: 'Mahsulot taqdimoti',
      viralScore: 94,
      hook: "«Nega bu 3 ta kiyim 2 kunda tugab qoldi? Sababini bilmoqchimisiz?»",
      duration: '15 soniya',
      platform: 'Instagram',
      description: "Xaridorlarning eng sevimli tanlovlarini ko'rsatib, ijtimoiy isbot orqali ishonch uyg'otish."
    },
    {
      id: 'idea-2',
      title: "«Sifatni tekshirish: Yuvish va cho'zilish testi»",
      category: 'Mijoz ishonchi',
      viralScore: 97,
      hook: "«Kiyimlarimiz 50 marta yuvilgandan keyin rangi o'chadimi? Keling tekshiramiz!»",
      duration: '22 soniya',
      platform: 'TikTok',
      description: "Haqiqiy tajriba va sifat kafolatini ko'rsatuvchi virusli video formati."
    },
    {
      id: 'idea-3',
      title: "«Kassirning bir kuni: Eng g'alati xaridorlar savollari»",
      category: 'Komediya & Lifestyle',
      viralScore: 89,
      hook: "«— Aka, bu kiyimni kiyib to'yga borsam hamma qaraydimi? 😂»",
      duration: '18 soniya',
      platform: 'Barchasi',
      description: "Samimiy, kulgili va do'kon xodimlari bilan bog'langan iliq atmosferadagi rolik."
    }
  ]);
  const [isRefreshingIdeas, setIsRefreshingIdeas] = useState(false);

  // Tab 3: Order & Upload state
  const [orderTopic, setOrderTopic] = useState('Kiyimlarimizni uzoq vaqt rangini saqlab qolishi bo‘yicha amaliy yuvish testi...');
  const [orderStyle, setOrderStyle] = useState<'elegant' | 'viral' | 'minimal'>('viral');
  const [orderDuration, setOrderDuration] = useState('15 s');
  const [publishMode, setPublishMode] = useState<'semi' | 'auto'>('semi');
  const [scheduleDate, setScheduleDate] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [scheduleTime, setScheduleTime] = useState('14:30');
  const [targetPlatform, setTargetPlatform] = useState<'Instagram' | 'Telegram' | 'TikTok'>('Instagram');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Tab 4: Settings state
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Mahsulot taqdimoti', 'Trend videolar', 'Aksiya va chegirma']);
  const [selectedStyle, setSelectedStyle] = useState('Professional');
  const [customPromptInstruction, setCustomPromptInstruction] = useState("Kiyimlarimiz sifatini ko'rsatadigan dinamik uslubda bo'lsin, narxlarni aniq aytilsin va har doim do'kon manzilini ko'rsatilsin.");
  const [musicMood, setMusicMood] = useState('Zamonaviy');
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Tab 5: Schedule state
  const [schedules, setSchedules] = useState<ScheduledVideo[]>([
    {
      id: 'sch-1',
      title: "Yangi kolleksiya premyerasi (Reels #1)",
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
      platform: 'Instagram',
      scheduledTime: 'Bugun, 18:45',
      status: 'Kutilmoqda',
      viewsForecast: '18.4K - 25K'
    },
    {
      id: 'sch-2',
      title: "Chegirmalar haftaligi boshlandi!",
      thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&auto=format&fit=crop&q=80',
      platform: 'Telegram',
      scheduledTime: 'Ertaga, 11:00',
      status: 'Kutilmoqda',
      viewsForecast: '4.2K ko‘rish'
    },
    {
      id: 'sch-3',
      title: "Mijozlarimizdan real fikrlar va obzor",
      thumbnail: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300&auto=format&fit=crop&q=80',
      platform: 'Instagram',
      scheduledTime: '26-Avgust, 20:00',
      status: 'Nashr etildi',
      viewsForecast: '32.1K'
    }
  ]);

  const handleGenerateScript = () => {
    setIsGeneratingScript(true);
    setTimeout(() => {
      setGeneratedScript({
        title: `${topic.slice(0, 35)}...`,
        hook: `«${topic.includes('chegirma') ? "Do'konimizdagi eng katta chegirma boshlandi!" : "Buni ko'rmasangiz afsuslanasiz!"}»`,
        scenes: [
          { sec: "0-3s", visual: `Kamerada tezkor harakat: ${additionalNote.slice(0, 45) || 'Asosiy mahsulot ko‘tariladi.'}`, audio: "Effektli boshlanish (Whoosh + Drop)" },
          { sec: "4-10s", visual: "Narx, sifat va assortiment detallari yirik planda.", audio: "Dinamik ritm va ovozli sharh" },
          { sec: "11-15s", visual: "Maxsus taklif, do‘kon manzili va profildagi havola.", audio: "Yakuniy chaqiriq (CTA)" }
        ],
        hashtags: "#operon #trend #uzbekistan #toshkent #reels",
        recommendedAudio: "Viral TikTok Audio - Trending Beats #4",
        agentReviews: [
          { agent: "1-Agent: Ssenarist", role: "Hook & Dialog", verdict: "Kuchli emotsional tutqich bilan tayyorlandi." },
          { agent: "2-Agent: Vizual Direktor", role: "Kamera & Ritm", verdict: "9:16 vertikal format, 15 soniyalik ideal montaj." },
          { agent: "3-Agent: SMM Operator", role: "SEO & Hashtag", verdict: "Instagram & Telegram avto-nashriga mos." }
        ]
      });
      setIsGeneratingScript(false);
    }, 1200);
  };

  const handleRefreshIdeas = () => {
    setIsRefreshingIdeas(true);
    setTimeout(() => {
      setIdeas([
        {
          id: 'idea-' + Date.now(),
          title: "«Eng arzon va eng qimmat tovarimiz taqqoslashi»",
          category: 'Trend & Solishtirish',
          viralScore: 98,
          hook: "«100 ming so'mlik bilan 600 ming so'mlik tovar farqi!»",
          duration: '19 soniya',
          platform: 'Barchasi',
          description: "Mijozlarda yuqori qiziqish uyg'otuvchi va bahs boshlaydigan viral ssenariy."
        },
        {
          id: 'idea-' + (Date.now() + 1),
          title: "«Ertalabki qabul: Yangi tovarlarni qutidan ochish»",
          category: 'ASMR & Lifestyle',
          viralScore: 92,
          hook: "«Bugun ertalab kelgan yangi to'plamni birga ochamiz!»",
          duration: '15 soniya',
          platform: 'Instagram',
          description: "Estetik qadoqlash, toza ovozlar va yangilik hissini uyg'otish."
        },
        {
          id: 'idea-' + (Date.now() + 2),
          title: "«To'g'ri o'lcham tanlash bo'yicha master-klass»",
          category: "Foydali qo'llanma",
          viralScore: 88,
          hook: "«O'lchamingiz to'g'ri kelmay qolishidan qo'rqasizmi?»",
          duration: '25 soniya',
          platform: 'Telegram',
          description: "Mijozlarning xavotirlarini yechib, xaridga olib boruvchi video."
        }
      ]);
      setIsRefreshingIdeas(false);
    }, 1000);
  };

  const handleSaveSettings = () => {
    setSavedSettingsNotice(true);
    setTimeout(() => {
      setSavedSettingsNotice(false);
    }, 3000);
  };

  const handleScheduleOrder = () => {
    const newSch: ScheduledVideo = {
      id: 'sch-' + Date.now(),
      title: orderTopic ? orderTopic.slice(0, 30) + '...' : 'Yangi AI Reels',
      thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
      platform: targetPlatform,
      scheduledTime: `${scheduleDate === 'today' ? 'Bugun' : scheduleDate === 'tomorrow' ? 'Ertaga' : 'Kelasi hafta'}, ${scheduleTime}`,
      status: 'Kutilmoqda',
      viewsForecast: '15K - 22K kutilmoqda'
    };
    setSchedules([newSch, ...schedules]);
    setActiveTab('schedule');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden select-none font-sans text-slate-900 w-full max-w-full">
      {/* 1. TOP MOBILE-OPTIMIZED HEADER */}
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 shadow-2xs w-full">
        {/* Title row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0 active:scale-95"
              title={language === 'ru' ? 'Назад' : 'Артқа'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                  <Film className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{language === 'ru' ? 'Создание видео (AI)' : 'Видео жасау (AI)'}</span>
                </h1>
                <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.5 rounded-md border border-purple-200 shrink-0">
                  {language === 'ru' ? '3 AI Агента' : '3 AI Агент'}
                </span>
              </div>
            </div>
          </div>

          {/* Trend Radar Button */}
          <button
            onClick={() => {
              setShowTrendSearch(true);
              setTrendSearching(true);
              setTimeout(() => {
                setTrendResults(
                  language === 'ru'
                    ? [
                        { keyword: "#ТрендыКазахстан", count: "482K просмотров", growth: "+42%", niche: "Мода & Продажи" },
                        { keyword: "#СезонныеСкидки", count: "310K просмотров", growth: "+88%", niche: "Акции" },
                        { keyword: "#АлматыШопинг", count: "620K просмотров", growth: "+29%", niche: "Магазины" },
                        { keyword: "#РаспаковкаКЗ", count: "190K просмотров", growth: "+64%", niche: "Видеообзор" }
                      ]
                    : [
                        { keyword: "#ҚазақстанТренд", count: "482K қаралым", growth: "+42%", niche: "Сән & Сауда" },
                        { keyword: "#МаусымдықЖеңілдік", count: "310K қаралым", growth: "+88%", niche: "Акция" },
                        { keyword: "#АлматыШопинг", count: "620K қаралым", growth: "+29%", niche: "Дүкендер" },
                        { keyword: "#ОбзорКЗ", count: "190K қаралым", growth: "+64%", niche: "Бейне шолу" }
                      ]
                );
                setTrendSearching(false);
              }, 800);
            }}
            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden xs:inline">Trend Radar</span>
            <span className="xs:hidden">Trend</span>
          </button>
        </div>

        {/* Social channels badges row */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
            {language === 'ru' ? 'Каналы:' : 'Арналар:'}
          </span>
          
          <button
            onClick={() => setInstagramConnected(!instagramConnected)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold shrink-0 transition-all ${
              instagramConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Instagram className="w-3 h-3 text-pink-600" />
            <span>Insta {instagramConnected ? '✓' : ''}</span>
          </button>

          <button
            onClick={() => setTelegramConnected(!telegramConnected)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold shrink-0 transition-all ${
              telegramConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Send className="w-3 h-3 text-sky-600" />
            <span>TG {telegramConnected ? '✓' : ''}</span>
          </button>

          <button
            onClick={() => setTiktokConnected(!tiktokConnected)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold shrink-0 transition-all ${
              tiktokConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}
          >
            <span>{tiktokConnected ? 'TikTok ✓' : '+ TikTok'}</span>
          </button>
        </div>

        {/* 2. NAVIGATION TABS (Mobile Scrollable with clear touch targets) */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'ai-video' as const, label: 'AI Video', icon: <Wand2 className="w-3.5 h-3.5" /> },
            { id: 'ideas' as const, label: language === 'ru' ? 'Идеи' : 'Идеялар', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'order-upload' as const, label: language === 'ru' ? 'Загрузка' : 'Жүктеу', icon: <Upload className="w-3.5 h-3.5" /> },
            { id: 'settings' as const, label: language === 'ru' ? 'Настройки' : 'Баптаулар', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'schedule' as const, label: language === 'ru' ? 'Расписание' : 'Кесте', icon: <Calendar className="w-3.5 h-3.5" />, badge: schedules.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER (100% Mobile Responsive) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full max-w-full space-y-3.5 pb-16">
        {/* ========================================================================= */}
        {/* TAB 1: AI Video (Seedance & 3 AI Agents) */}
        {/* ========================================================================= */}
        {activeTab === 'ai-video' && (
          <div className="space-y-3.5 w-full max-w-full">
            {/* Input Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 w-full">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      AI Video Ssenariy Generatori
                    </h2>
                    <p className="text-[10.5px] text-slate-500 truncate">3 ta AI agent tahlili bilan</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  ⚡ Tezkor AI
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Video Mavzusi *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Masalan: Yangi kolleksiya tanishtiruvi"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Qo'shimcha Fikringiz
                  </label>
                  <input
                    type="text"
                    value={additionalNote}
                    onChange={(e) => setAdditionalNote(e.target.value)}
                    placeholder="Masalan: 'do'kon ichida', 'quvnoq musiqa'"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium transition-all shadow-2xs"
                  />
                </div>

                <button
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript || !topic.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingScript ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Agentlar yozmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Ssenariy Yaratish</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Script */}
            {generatedScript && (
              <div className="bg-white border border-purple-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 w-full">
                {/* Script Header & Actions */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {generatedScript.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 self-end xs:self-auto shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(generatedScript, null, 2));
                        setCopiedNotice(true);
                        setTimeout(() => setCopiedNotice(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedNotice ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNotice ? 'Nusxalandi!' : 'Nusxa'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setOrderTopic(generatedScript.title);
                        setActiveTab('order-upload');
                      }}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Video className="w-3 h-3" />
                      <span>Yuklashga o'tish</span>
                    </button>
                  </div>
                </div>

                {/* Viral Hook */}
                <div className="p-3 bg-purple-50/80 border border-purple-100 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Viral Hook (Birinchi 3 soniya)</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 italic leading-relaxed">
                    {generatedScript.hook}
                  </div>
                </div>

                {/* Scenes timeline */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">
                    Sahnama-sahna montaj rejasi (15 soniya):
                  </div>
                  <div className="space-y-1.5">
                    {generatedScript.scenes.map((scene: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[10px] font-black shrink-0">
                          {scene.sec}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 leading-snug">{scene.visual}</p>
                          <p className="text-[10.5px] text-purple-700 font-medium mt-0.5 flex items-center gap-1">
                            <Music className="w-3 h-3 shrink-0" /> <span className="truncate">{scene.audio}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 AI AGENTS EVALUATION - MOBILE STACKED CLEAN CARDS */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>3 ta AI Agent Ekspertiza Xulosasi</span>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {generatedScript.agentReviews.map((rev: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-bold text-slate-900 text-[11px]">{rev.agent}</span>
                          <span className="text-[9.5px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            {rev.role}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 leading-relaxed">{rev.verdict}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hashtags and audio */}
                <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                  <div>
                    <span className="font-bold text-slate-700">Hashtaglar: </span>
                    <span className="text-purple-600 font-semibold">{generatedScript.hashtags}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Tavsiya musiqa: </span>
                    <span className="text-slate-700">{generatedScript.recommendedAudio}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: G'oyalar (AI Content Ideas) */}
        {/* ========================================================================= */}
        {activeTab === 'ideas' && (
          <div className="space-y-3 w-full max-w-full">
            {/* Header banner */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">AI Kontent G'oyalari</h2>
                  <p className="text-[10.5px] text-slate-500 truncate">Do'koningizga mos viral takliflar</p>
                </div>
              </div>

              <button
                onClick={handleRefreshIdeas}
                disabled={isRefreshingIdeas}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingIdeas ? 'animate-spin' : ''}`} />
                <span>Yangilash</span>
              </button>
            </div>

            {/* Ideas List (Mobile Vertical Stack) */}
            <div className="flex flex-col gap-2.5 w-full">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white border border-slate-200/90 hover:border-purple-300 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs space-y-2.5 w-full"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {idea.category}
                      </span>

                      <span className="text-[9.5px] px-2 py-0.5 rounded-full font-black bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-amber-500" />
                        {idea.viralScore}% Viral
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {idea.title}
                    </h3>

                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl italic border border-slate-100 leading-relaxed">
                      "{idea.hook}"
                    </p>

                    <p className="text-[10.5px] text-slate-500 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400">
                      {idea.platform} • {idea.duration}
                    </span>

                    <button
                      onClick={() => {
                        setTopic(idea.title);
                        setAdditionalNote(idea.hook);
                        setActiveTab('ai-video');
                        handleGenerateScript();
                      }}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10.5px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                    >
                      <span>Ssenariy yaratish</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Buyurtma & Yuklash (Mobile Form Layout) */}
        {/* ========================================================================= */}
        {activeTab === 'order-upload' && (
          <div className="space-y-3.5 w-full max-w-full">
            {/* 1. DIY Video Upload Section */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 w-full">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide truncate">
                      O'Z VIDEONGIZNI YUKLASH (DIY)
                    </h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                  Tayyor rolik
                </span>
              </div>

              {/* Upload Box */}
              <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 block w-full">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFileName(e.target.files[0].name);
                    }
                  }}
                />
                <FileVideo className="w-7 h-7 text-purple-600 shrink-0" />
                <div className="text-xs font-bold text-slate-800 truncate max-w-xs">
                  {uploadedFileName || "Video faylni tanlang yoki tashlang"}
                </div>
                <div className="text-[10px] text-slate-400">
                  MP4, MOV (Maksimal 500MB)
                </div>
              </label>

              {/* Schedule date & time */}
              <div className="space-y-2 pt-1">
                <label className="text-[10.5px] font-bold text-slate-700 block uppercase tracking-wider">
                  Qo'yilish Sanasi:
                </label>
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  {[
                    { id: 'today', label: 'Bugun' },
                    { id: 'tomorrow', label: 'Ertaga' },
                    { id: 'custom', label: 'Boshqa' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setScheduleDate(item.id as any)}
                      className={`py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                        scheduleDate === item.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Joylash Soati:</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Platforma:</label>
                    <div className="flex gap-1">
                      {(['Instagram', 'Telegram'] as const).map((plat) => (
                        <button
                          key={plat}
                          onClick={() => setTargetPlatform(plat)}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all truncate ${
                            targetPlatform === plat
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {plat === 'Instagram' ? 'Insta' : 'TG'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleScheduleOrder}
                  className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Avto-Publishing jadvaliga qo'shish</span>
                </button>
              </div>
            </div>

            {/* 2. AI Video Generation Order */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 w-full">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                    AI Video Buyurtmasi
                  </h3>
                  <p className="text-[10px] text-slate-500">Ssenariy va vizual plan kiritish</p>
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                  Video mavzusi / g'oyasi nima haqida? *
                </label>
                <textarea
                  value={orderTopic}
                  onChange={(e) => setOrderTopic(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium resize-none shadow-2xs"
                  placeholder="Masalan: Kiyimlarimizni amaliy yuvish testi..."
                />
              </div>

              {/* Style Buttons */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                  Video Uslubi (Style):
                </label>
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  {[
                    { id: 'elegant', label: '🎁 Elegant' },
                    { id: 'viral', label: '⚡ Viral' },
                    { id: 'minimal', label: '✨ Minimal' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setOrderStyle(st.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center truncate ${
                        orderStyle === st.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Mode */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Davomiyligi:</label>
                  <input
                    type="text"
                    value={orderDuration}
                    onChange={(e) => setOrderDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-purple-700 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Joylash Turi:</label>
                  <select
                    value={publishMode}
                    onChange={(e) => setPublishMode(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="semi">Yarim Avtomat</option>
                    <option value="auto">To‘liq Avtomat</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleScheduleOrder}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Video ssenariyni yarat va rejalashtir</span>
              </button>
            </div>

            {/* Video Preview Player */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-purple-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    9:16 Video Prevyu (Reels & TikTok)
                  </h3>
                </div>

                <span className="text-[9.5px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  1080x1920
                </span>
              </div>

              <div className="rounded-2xl p-6 bg-slate-900 text-white text-center flex flex-col items-center justify-center gap-2 min-h-[140px] relative overflow-hidden">
                <div
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  className="w-11 h-11 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-lg"
                >
                  {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
                </div>

                <div className="text-xs font-bold text-slate-200">
                  {isPlayingPreview ? "Rolik ijro etilmoqda" : "Ssenariy prevyusini ko'rish"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: Sozlamalar (Experience Memory) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-3.5 w-full max-w-full">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3.5 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        AI Yo'nalish Sozlamalari
                      </h2>
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.2 rounded-full">
                        MEMORY
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 truncate">Brendingizga mos qoidalar saqlanadi</p>
                  </div>
                </div>
              </div>

              {savedSettingsNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sozlamalar AI xotirasiga saqlandi!</span>
                </div>
              )}

              {/* 1. Video Janri */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-slate-700 block uppercase tracking-wider">
                  Video Janri:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Mahsulot taqdimoti',
                    'Aksiya va chegirma',
                    'Mijoz sharhi',
                    'Trend videolar',
                    'Komediya & Hazil',
                    'Foydali maslahat'
                  ].map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGenres(selectedGenres.filter((g) => g !== genre));
                          } else {
                            setSelectedGenres([...selectedGenres, genre]);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{genre}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Video Uslubi */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-slate-700 block uppercase tracking-wider">
                  Video Uslubi:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Professional', 'Quvnoq', 'Minimalist', 'Energetik'].map((style) => {
                    const isSelected = selectedStyle === style;
                    return (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Custom Prompt */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block">
                  Qo'shimcha Ko'rsatma (AI doim hisobga oladi):
                </label>
                <textarea
                  value={customPromptInstruction}
                  onChange={(e) => setCustomPromptInstruction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium resize-none shadow-2xs"
                  placeholder="Masalan: Narxlarni aniq aytilsin va har doim manzil ko'rsatilsin."
                />
              </div>

              {/* 4. Muzika kayfiyati */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-slate-700 block uppercase tracking-wider">
                  Musiqa Kayfiyati:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Enerjetik', 'Vazmin', 'Zamonaviy', 'Milliy'].map((m) => {
                    const isSelected = musicMood === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMusicMood(m)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Music className="w-3 h-3" />
                        <span>{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sozlamalarni AI xotirasiga saqlash</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: Jadval (Mobile-Friendly Scheduled Cards) */}
        {/* ========================================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-3.5 w-full max-w-full">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      NASHR JADVALI
                    </h2>
                    <p className="text-[10px] text-slate-500 truncate">
                      Kutilayotgan videolaringiz
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('order-upload')}
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Qo'shish</span>
                </button>
              </div>

              {/* Mobile Scheduled Cards List (NO TABLE OVERFLOW) */}
              <div className="flex flex-col gap-2 w-full">
                {schedules.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 justify-between w-full"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</div>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                            item.platform === 'Instagram' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            {item.platform === 'Instagram' ? <Instagram className="w-2.5 h-2.5" /> : <Send className="w-2.5 h-2.5" />}
                            {item.platform}
                          </span>

                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {item.scheduledTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.2 rounded-full text-[9.5px] font-black ${
                            item.status === 'Nashr etildi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Kutilmoqda'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{item.viewsForecast}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSchedules(schedules.filter((s) => s.id !== item.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Trend Search Modal (Mobile Optimized) */}
      {showTrendSearch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">AI Trend Radar</h3>
              </div>
              <button
                onClick={() => setShowTrendSearch(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {trendSearching ? (
              <div className="py-6 text-center space-y-2">
                <RefreshCw className="w-5 h-5 text-purple-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-800">Trendlar tahlil qilinmoqda...</div>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {trendResults.map((tr, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setTopic(`${tr.keyword} mavzusida viral rolik`);
                      setShowTrendSearch(false);
                      setActiveTab('ai-video');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all active:scale-95"
                  >
                    <div>
                      <div className="font-bold text-purple-700 text-xs">{tr.keyword}</div>
                      <div className="text-[10px] text-slate-500">{tr.count}</div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {tr.growth}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowTrendSearch(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
