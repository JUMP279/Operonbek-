import React, { useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  Truck,
  FileText,
  Swords,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  Send,
  Zap,
  Info,
  Layers,
  BookOpen,
  Calendar,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BusinessMemoryViewProps {
  onBack?: () => void;
  storeContext?: any;
}

interface MemoryItem {
  id: string;
  type: 'permanent' | 'temporary' | 'insight';
  categoryKey?: string;
  title: string;
  content: string;
  date: string;
  confidence?: number;
  badge?: string;
  isAutoFromProducts?: boolean;
  isActive?: boolean;
}

export const BusinessMemoryView: React.FC<BusinessMemoryViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'teach' | 'permanent' | 'temporary' | 'insights'>('profile');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('15:40');
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  // New Memory Form State
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryType, setNewMemoryType] = useState<'permanent' | 'temporary'>('permanent');
  const [teachingSuccess, setTeachingSuccess] = useState(false);

  // Permanent Memories State
  const [permanentMemories, setPermanentMemories] = useState<MemoryItem[]>([
    {
      id: 'p-1',
      type: 'permanent',
      categoryKey: 'VIDEO_TREND_LAST',
      title: 'VIDEO_TREND_LAST',
      content: '["Sahna orti: Labubu narxini aytib, uning sifati va foydalarini qisqacha ko\'rsatish, masalan, 10 yoshli bola bilan o\'ynab,", "Savol-javob: \\"Labubu qanday materialdan tayyorlangan?\\", \\"U qancha yoshdagi bolalar uchun mos?\\", \\"Labubu qanday ishlatiladi\\", \\"oldin va keyin\\" natijasi: Labubu bilan o\'ynashdan oldin va keyin bolalarning rivojlanishidagi farqni ko\'rsatish, masala", "Qadamma-qadam: Labubuni to\'g\'ri ishlatish uchun qanday bosqichma-bosqich amallar bajarish kerakligini, masalan, Labubuni", "\\"5 xato\\": Labubu tanlashda qanday xatolarni qilmaslik kerakligini, masalan, sifati past bo\'lgan Labubuni tanlamaslik, yo"]',
      date: '2026-08-05'
    },
    {
      id: 'p-2',
      type: 'permanent',
      categoryKey: 'SUPPORT_TELEGRAM',
      title: 'SUPPORT_TELEGRAM',
      content: 'khosimovich_1',
      date: '2026-08-06'
    },
    {
      id: 'p-3',
      type: 'permanent',
      categoryKey: 'LABUBU',
      title: 'LABUBU',
      content: "20,000 so'm | Mahsulotimiz sifatli va kafolatlangan | Ranglar: ['Qora', 'Oq', 'Kulrang']",
      date: '2026-08-01',
      isAutoFromProducts: true
    },
    {
      id: 'p-4',
      type: 'permanent',
      categoryKey: "QO'G'IRCHOQ",
      title: "QO'G'IRCHOQ",
      content: "70,000 so'm | Qizlar uchun chiroyli qo'g'irchoqlarimiz bor | Ranglar: ['Qora', 'Oq']",
      date: '2026-08-01',
      isAutoFromProducts: true
    }
  ]);

  // Temporary Memories State
  const [temporaryMemories, setTemporaryMemories] = useState<MemoryItem[]>([
    {
      id: 't-1',
      type: 'temporary',
      title: "E'lon / aksiya",
      content: "Shu hafta Toshkent bo'ylab yetkazish MUTLAQO BEPUL (odatda 25,000 so'm)",
      date: '2026-08-28',
      badge: 'AMALDA',
      isActive: true
    }
  ]);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<MemoryItem[]>([
    {
      id: 'i-1',
      type: 'insight',
      title: 'AI XULOSASI',
      content: "Kechqurun 21:00 dagi postlar ertalabkiga qaraganda ko'proq savol va faollik keltirmoqda.",
      date: '2026-07-30',
      confidence: 75
    },
    {
      id: 'i-2',
      type: 'insight',
      title: 'STRATEGIYA',
      content: "Sotuvni oshirish chorasi: Sotuv tushib ketgan, chunki mahsulotlar tanlovi cheklangan va raqobat yuqori. Shu sababli, mijozlarni jalb qilish uchun yangi mahsulotlarni ishlab chiqish yoki mavjud mahsulotlarga chegirma taklif qilish kerak. Masalan, Labubu figuralariga 10% chegirma taklif qilish yoki yangi qo'g'irchoq modellari chiqarish tavsiya etiladi.",
      date: '2026-08-02',
      confidence: 70
    },
    {
      id: 'i-3',
      type: 'insight',
      title: 'STRATEGIYA',
      content: "Sotuv o'sishi strategiyasi: Sotuv o'sishi kuzatilmoqda, bu bizning ijtimoiy tarmoqdagi faolligimiz va sifatli mahsulotlarimiz natijasida. Sotuvni tezlashtirish uchun, mahsulotlarimizning xususiyatlarini va ularning bolalarning rivojlanishiga qanday hissa qo'shishini ko'rsatadigan kontentlar yaratishni tavsiya qilaman. Masalan, Labubu figuralari va qo'g'irchoqlar bilan bog'liq ijodiy o'yinlar haqida videolar yoki postlar chiqarish maqsadga muvofiq.",
      date: '2026-08-10',
      confidence: 70
    }
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setLastUpdated(`${hours}:${mins}`);
      setIsRefreshing(false);
    }, 600);
  };

  const handleAddNewMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      type: newMemoryType,
      title: newMemoryType === 'permanent' ? 'FOYDALANUVCHI QOIDASI' : "E'lon / aksiya",
      content: newMemoryText.trim(),
      date: new Date().toISOString().split('T')[0],
      badge: newMemoryType === 'temporary' ? 'AMALDA' : undefined,
      isActive: true
    };

    if (newMemoryType === 'permanent') {
      setPermanentMemories([newItem, ...permanentMemories]);
    } else {
      setTemporaryMemories([newItem, ...temporaryMemories]);
    }

    setNewMemoryText('');
    setTeachingSuccess(true);
    setTimeout(() => setTeachingSuccess(false), 3500);
  };

  const handleDeleteMemory = (id: string, type: 'permanent' | 'temporary' | 'insight') => {
    if (type === 'permanent') {
      setPermanentMemories(permanentMemories.filter((m) => m.id !== id));
    } else if (type === 'temporary') {
      setTemporaryMemories(temporaryMemories.filter((m) => m.id !== id));
    } else {
      setAiInsights(aiInsights.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] text-slate-800 overflow-x-hidden select-none font-sans w-full max-w-full">
      {/* 1. TOP HEADER (Polished clean light theme matching the whole app) */}
      <div className="bg-white border-b border-slate-200/80 px-3.5 py-3 shrink-0 shadow-xs w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shrink-0 active:scale-95 border border-slate-200/80"
                title={language === 'ru' ? 'Назад' : 'Артқа'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  {language === 'ru' ? 'Память бизнеса — AI База' : 'Бизнес жады — AI Базасы'}
                </h1>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 truncate">
                {language === 'ru' ? 'ИИ использует именно эти факты при генерации постов, ответах клиентам и бизнес-аудите.' : 'AI жазба дайындауда, клиенттерге жауап беруде және бизнес аудитте осы мәліметтерге сүйенеді.'}
              </p>
            </div>
          </div>

          {/* Refresh & Last Updated indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {language === 'ru' ? 'Посл. обновление' : 'Соңғы жаңарту'}
              </div>
              <div className="text-xs font-bold text-purple-600">{lastUpdated}</div>
            </div>
            <button
              onClick={handleRefresh}
              className={`w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-sm shadow-purple-500/20 active:scale-95 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title={language === 'ru' ? 'Обновить память' : 'Жадты жаңарту'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Mobile Segmented Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'AI База (14)' : 'AI База (14)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('teach')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'teach'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Обучить' : 'Үйрету'}</span>
          </button>

          <button
            onClick={() => setActiveTab('permanent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'permanent'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            <span>{language === 'ru' ? `Постоянная (${permanentMemories.length})` : `Тұрақты (${permanentMemories.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('temporary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'temporary'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{language === 'ru' ? `Временная (${temporaryMemories.length})` : `Уақытша (${temporaryMemories.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'insights'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ru' ? `Выводы AI (${aiInsights.length})` : `AI Қорытындылары (${aiInsights.length})`}</span>
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT BODY */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 pb-24 w-full max-w-5xl mx-auto">
        
        {/* ========================================================= */}
        {/* TAB 1: AI BAZA (AI BIZNESINGIZ HAQIDA NIMANI BILADI)      */}
        {/* ========================================================= */}
        {(activeTab === 'profile' || activeTab === 'teach') && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
            {/* Header Accordion */}
            <div
              onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
              className="flex items-center justify-between cursor-pointer border-b border-slate-100 pb-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    AI biznesingiz haqida nimani biladi
                  </h3>
                  <p className="text-[10.5px] text-slate-500">
                    Onboarding javoblaringizdan AI o'zi tuzgan xotira — o'zgartirilmaydi (faqat o'qish).
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                {isOverviewExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isOverviewExpanded && (
              <div className="space-y-3 pt-1">
                {/* Biznes xulosasi Full-width Banner */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>BIZNES XULOSASI</span>
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-semibold">2026-07-22</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Operon bolalar uchun Labubu figuralari va qo'g'irchoqlarni sotuvchi biznesdir. Bizning asosiy maqsadimiz kichik bolali ota-onalarga, xususan, onalarga sifatli va xavfsiz o'yinchoqlar taklif qilish. Biz ijtimoiy tarmoqlardagi faolligimiz va bolalar ijodkorligini rivojlantirish g'oyasi bilan farqlanamiz.
                  </p>
                </div>

                {/* 2-Column Responsive Grid for Core Facts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Biznes Mohiyati */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      BIZNES MOHIYATI
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Operon biznesi bolalar o'yinchoqlari, xususan Labubu figuralari va qo'g'irchoqlar sotuvi bilan shug'ullanadi. Bizning maqsadimiz bolalarning ijodkorligi va rivojlanishiga hissa qo'shish.
                    </p>
                  </div>

                  {/* Maqsadli Auditoriya */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      MAQSADLI AUDITORIYA
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Maqsadli auditoriyamiz 20-40 yoshdagi kichik bolali onalar, Toshkent shahrida yashovchi, farzandiga sifatli va xavfsiz o'yinchoq/sovg'a izlaydiganlar.
                    </p>
                  </div>

                  {/* Mahsulot / Xizmatlar */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      MAHSULOT / XIZMATLAR
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Bizning asosiy mahsulotlarimiz Labubu figuralari (20,000 so'm) va qo'g'irchoqlar (70,000 so'm).
                    </p>
                  </div>

                  {/* Narx Pozitsiyasi */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      NARX POZITSIYASI
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Bizning narxlarimiz o'rta segmentda joylashgan, chunki biz sifatli mahsulotlar taklif qilamiz, lekin raqobatchilarga nisbatan arzonroq.
                    </p>
                  </div>

                  {/* Asosiy Ustunlik */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      ASOSIY USTUNLIK
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Bizning asosiy ustunligimiz muntazam ijtimoiy tarmoq faolligi va bolalar ijodkorligini rivojlantirish g'oyasi bilan farqlanishimiz.
                    </p>
                  </div>

                  {/* Zaif Tomonlar */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      ZAIF TOMONLAR
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Mumkin bo'lgan zaif tomonlarimiz — mahsulotlar tanlovi cheklangan va raqobat yuqori.
                    </p>
                  </div>

                  {/* Muloqot Ohangi */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      MULOQOT OHANGI
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      AI mijoz bilan gaplashishi kerak bo'lgan uslub — do'stona, yordamchi va maslahatchi.
                    </p>
                  </div>

                  {/* Mijoz E'tirozlari */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      MIJOZ E'TIROZLARI
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside font-medium">
                      <li>Mahsulotlar qachon yetkazib beriladi?</li>
                      <li>Mahsulotlar sifati qanday?</li>
                      <li>Qaytarish va almashtirish shartlari qanday?</li>
                    </ul>
                  </div>

                  {/* Yetkazish va To'lov */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      YETKAZISH VA TO'LOV
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Yetkazib berish va to'lov shartlari — yetkazib berish muddati 1-3 kun, to'lov naqd pul yoki bank kartasi orqali amalga oshiriladi.
                    </p>
                  </div>

                  {/* Kontent Yo'nalishlari */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      KONTENT YO'NALISHLARI
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside font-medium">
                      <li>Bolalar ijodkorligi va Labubu/qo'g'irchoq mahsulotlariga bog'liq native reklama postlari</li>
                      <li>Mijozlarining bolalari bilan o'yinchoqlar haqidagi fotosuratlar va sharhlar</li>
                      <li>Bolalar uchun o'yinchoqlar tanlashda qanday e'tibor berish kerakligi haqidagi maslahatlar</li>
                      <li>Operon biznesi haqidagi ma'lumot va yangiliklar</li>
                      <li>Bolalar ijodkorligini rivojlantirish haqidagi maqolalar</li>
                    </ul>
                  </div>

                  {/* Raqobat Burchaklari */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 hover:border-purple-200 transition-all">
                    <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      RAQOBAT BURCHAKLARI
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside font-medium">
                      <li>Raqobatchilarga nisbatan arzonroq narxlar taklif qilish</li>
                      <li>Mahsulotlar tanlovini kengaytirish</li>
                      <li>Ijtimoiy tarmoqlardagi faolligini oshirish</li>
                    </ul>
                  </div>

                  {/* Raqobat Tahlili & Kontent G'oyalari */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 flex flex-col justify-between hover:border-purple-200 transition-all">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                          RAQOBAT TAHLILI
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-semibold">Biznes tahlili bo'limida</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium">
                        2 ta raqobatchi · ishonch 70% · 2026-07-27
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                          KONTENT G'OYALARI
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-semibold">Post/Video bo'limida</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium">
                        0 post, 0 video g'oya · 2026-08-08
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AI GA YANGI MA'LUMOT O'RGATISH                    */}
        {/* ========================================================= */}
        {(activeTab === 'teach' || activeTab === 'profile') && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>AI ga yangi ma'lumot o'rgatish</span>
              </h3>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                Masalan: "Bayram kunlari 09:00–18:00 ishlaymiz" (doimiy) yoki "Shu hafta yetkazish bepul" (vaqtinchalik).
              </p>
            </div>

            <form onSubmit={handleAddNewMemory} className="space-y-3">
              <textarea
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="AI bilishi kerak bo'lgan ma'lumotni o'z so'zlaringiz bilan yozing..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all resize-none font-medium leading-relaxed"
              />

              <div className="space-y-2.5 pt-1">
                {/* Segmented Mode Button (Full width responsive grid) */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setNewMemoryType('permanent')}
                    className={`py-2 px-2.5 rounded-lg text-left transition-all flex flex-col justify-center ${
                      newMemoryType === 'permanent'
                        ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${newMemoryType === 'permanent' ? 'bg-purple-600' : 'bg-slate-300'}`} />
                      <span className="text-xs font-black truncate">Doimiy qoida</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium pl-3.5 mt-0.5 leading-tight">
                      AI doim hisobga oladi
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewMemoryType('temporary')}
                    className={`py-2 px-2.5 rounded-lg text-left transition-all flex flex-col justify-center ${
                      newMemoryType === 'temporary'
                        ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${newMemoryType === 'temporary' ? 'bg-purple-600' : 'bg-slate-300'}`} />
                      <span className="text-xs font-black truncate">Vaqtinchalik</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium pl-3.5 mt-0.5 leading-tight">
                      Muddati tugasa unutadi
                    </span>
                  </button>
                </div>

                {/* Full Width Submit Button on Mobile */}
                <button
                  type="submit"
                  disabled={!newMemoryText.trim()}
                  className="w-full py-2.5 px-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-purple-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Xotiraga qo'shish</span>
                </button>
              </div>

              {teachingSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Xotiraga muvaffaqiyatli saqlandi! AI endi ushbu qoidaga amal qiladi.</span>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DOIMIY MA'LUMOTLAR                                 */}
        {/* ========================================================= */}
        {(activeTab === 'permanent' || activeTab === 'profile') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  DOIMIY MA'LUMOTLAR
                </h3>
              </div>
              <span className="text-[10.5px] text-slate-500 font-semibold">
                Qoidalar va javoblaringiz ({permanentMemories.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {permanentMemories.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 hover:border-purple-300 rounded-xl p-3.5 shadow-xs space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {item.categoryKey || item.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[9.5px] font-semibold">{item.date}</span>
                      <button
                        onClick={() => handleDeleteMemory(item.id, 'permanent')}
                        className="p-1 hover:text-rose-600 transition-colors ml-1"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 font-medium leading-relaxed break-words bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    {item.content}
                  </div>

                  {item.isAutoFromProducts && (
                    <div className="text-[9.5px] text-slate-500 font-bold flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      <span>Mahsulotlar bo'limidan avtomatik kelgan</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: VAQTINCHALIK (Aksiya, E'lon, Narx)                  */}
        {/* ========================================================= */}
        {(activeTab === 'temporary' || activeTab === 'profile') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  VAQTINCHALIK
                </h3>
              </div>
              <span className="text-[10.5px] text-slate-500 font-semibold">
                Aksiya, e'lon, narx o'zgarishi ({temporaryMemories.length})
              </span>
            </div>

            {temporaryMemories.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 text-center text-slate-400 text-xs font-medium">
                Hozircha vaqtinchalik aksiya yoki e'lon yo'q.
              </div>
            ) : (
              <div className="space-y-2.5">
                {temporaryMemories.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 shadow-xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10.5px] font-bold text-slate-500">
                          {item.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteMemory(item.id, 'temporary')}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-800 font-bold leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10.5px]">
                      <button
                        onClick={() => handleDeleteMemory(item.id, 'temporary')}
                        className="text-purple-600 hover:text-purple-800 font-bold transition-colors"
                      >
                        AI dan olib qo'yish
                      </button>
                      <span className="text-slate-400 text-[9.5px] font-semibold">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: AI XULOSALARI (AI O'ZI O'RGANGAN NARSALAR)        */}
        {/* ========================================================= */}
        {(activeTab === 'insights' || activeTab === 'profile') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  AI XULOSALARI
                </h3>
              </div>
              <span className="text-[10.5px] text-slate-500 font-semibold">
                AI o'zi o'rgangan narsalar ({aiInsights.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {aiInsights.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 hover:border-amber-300 rounded-xl p-3.5 shadow-xs space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded border ${
                      item.title === 'STRATEGIYA'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {item.title}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.confidence && (
                        <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          ishonch {item.confidence}%
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteMemory(item.id, 'insight')}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    {item.content}
                  </p>

                  <div className="text-[9.5px] text-slate-400 font-semibold">
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
