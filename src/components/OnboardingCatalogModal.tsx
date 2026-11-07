import React, { useState } from 'react';
import {
  X,
  Store,
  Rocket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Building2,
  DollarSign,
  Users,
  Layers,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { UserAvatarIcon } from './UserAvatar';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onCompleteOnboarding: (updatedProfile: UserProfile) => void;
}

type OnboardingState = 'select_catalog' | 'connect_questions' | 'startup_questions' | 'analyzing' | 'results';

export const OnboardingCatalogModal: React.FC<OnboardingCatalogModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onCompleteOnboarding
}) => {
  const { t, language } = useLanguage();
  const [stage, setStage] = useState<OnboardingState>('select_catalog');
  const [selectedCatalog, setSelectedCatalog] = useState<'connect' | 'startup' | null>(null);

  // Connect Business Survey State
  const [connectStep, setConnectStep] = useState(1);
  const [bizCategory, setBizCategory] = useState('Kiyim-kechak & Aksessuarlar');
  const [monthlyRevenue, setMonthlyRevenue] = useState('$5,000 - $25,000 (O‘suvchi do‘kon)');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Telegram bot & kanal', 'Instagram Direct']);
  const [customerRetention, setCustomerRetention] = useState('40-70% Qaytuvchi mijozlar');
  const [mainGoal, setMainGoal] = useState('Sof foyda va doimiy mijozlarni ko‘paytirish');

  // Create Startup Survey State
  const [startupStep, setStartupStep] = useState(1);
  const [startupCategory, setStartupCategory] = useState('E-commerce / Onlayn savdo');
  const [startupBudget, setStartupBudget] = useState('$1,000 - $3,000 (Test MVP byudjet)');
  const [targetAudience, setTargetAudience] = useState('Yoshlar va zamonaviy xaridorlar (18-35 yosh)');
  const [salesFormat, setSalesFormat] = useState('Telegram / Instagram orqali onlayn yetkazib berish');

  if (!isOpen) return null;

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]
    );
  };

  const handleStartAnalysis = (catalog: 'connect' | 'startup') => {
    setSelectedCatalog(catalog);
    setStage('analyzing');

    setTimeout(() => {
      setStage('results');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1400);
  };

  const handleFinish = () => {
    const updated: UserProfile = {
      ...userProfile,
      onboardingCompleted: true,
      businessData: {
        category: selectedCatalog === 'connect' ? bizCategory : startupCategory,
        monthlyRevenue: selectedCatalog === 'connect' ? monthlyRevenue : undefined,
        salesChannels: selectedCatalog === 'connect' ? selectedChannels : [salesFormat],
        customerBase: customerRetention,
        primaryGoal: mainGoal,
        startupBudget: selectedCatalog === 'startup' ? startupBudget : undefined,
        targetAudience: selectedCatalog === 'startup' ? targetAudience : undefined,
        businessModel: selectedCatalog === 'connect' ? 'existing_business' : 'new_startup'
      }
    };

    onCompleteOnboarding(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <UserAvatarIcon avatarId={userProfile.avatarId} size={44} className="border-2 border-white/80" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold leading-tight">{userProfile.name}</h3>
                <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">
                  ID: {userProfile.uniqueCode || userProfile.id}
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {userProfile.storeName} • {userProfile.businessType}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= STAGE 1: 2-CATALOG SELECTION ================= */}
        {stage === 'select_catalog' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="text-center max-w-md mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Operon Onboarding Tizimi
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {language === 'ru' ? 'Выберите направление вашего бизнеса' : 'Бизнесіңіз үшін қолайлы бағытты таңдаңыз'}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {language === 'ru'
                  ? 'Каждому предпринимателю присваивается уникальный ID. Выберите нужный раздел для точной настройки:'
                  : 'Әрбір кәсіпкерге бірегей ID беріледі. Жүйені баптау үшін қажетті бөлімді таңдаңыз:'}
              </p>
            </div>

            {/* 2 Big Catalogs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* CATALOG 1: Biznesni Qo'shish */}
              <div
                onClick={() => {
                  setSelectedCatalog('connect');
                  setStage('connect_questions');
                }}
                className="group relative p-5 rounded-3xl border-2 border-slate-200/90 hover:border-blue-600 bg-gradient-to-b from-white to-slate-50/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {language === 'ru' ? 'Действующий магазин' : 'Қолданыстағы дүкен'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {language === 'ru' ? '1. Подключить бизнес' : '1. Бизнесті қосу'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {language === 'ru'
                        ? 'Для действующих магазинов и брендов. Опросник для глубокого изучения ваших продаж, каналов и клиентов.'
                        : 'Жұмыс істеп тұрған дүкендер үшін. Сату, арналар және клиенттерді терең талдауға арналған сұрақтама.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{language === 'ru' ? 'Мониторинг оборота и остатков' : 'Айналым және қорлар мониторингі'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{language === 'ru' ? 'Анализ удержания клиентов (Retention)' : 'Тұрақты клиенттер (Retention) талдауы'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>{language === 'ru' ? 'Перейти к вопросам' : 'Сұрақтарға өту'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* CATALOG 2: Biznes Yaratish */}
              <div
                onClick={() => {
                  setSelectedCatalog('startup');
                  setStage('startup_questions');
                }}
                className="group relative p-5 rounded-3xl border-2 border-slate-200/90 hover:border-amber-500 bg-gradient-to-b from-white to-amber-50/20 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {language === 'ru' ? 'Стартап и План' : 'Стартап және Жоспар'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {language === 'ru' ? '2. Создать бизнес' : '2. Бизнес құру'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {language === 'ru'
                        ? 'Для начинающих. Вопросы по идее, советы AI: где есть риск банкротства и какой путь самый надежный.'
                        : 'Жаңадан бастаушылар үшін. Идея бойынша сұрақтар және AI кеңестері: тәуекелдер мен ең сенімді жолдар.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{language === 'ru' ? 'Анализ рисков банкротства' : 'Банкроттық тәуекелдерін талдау'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'ru' ? 'Безопасная дорожная карта старта' : 'Ең қауіпсіз бастау жол картасы'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>{language === 'ru' ? 'Получить рекомендации' : 'Кеңестер алу'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: BIZNESNI QO'SHISH SAVOLLARI ================= */}
        {stage === 'connect_questions' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Step Progress */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => setStage('select_catalog')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Orqaga
              </button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <span>Biznesni o‘rganish: {connectStep}/5 bosqich</span>
              </div>
            </div>

            {/* Step 1: Savdo yo'nalishi */}
            {connectStep === 1 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    1-Savol: Asosiy savdo yo‘nalishingiz va mahsulot turi nima?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Dastur sizning sohangizga mos ko‘rsatkichlarni shakllantirishi uchun kerak.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    '👗 Kiyim-kechak, Poyabzal & Moda',
                    '📱 Smartfon, Gadjetlar & Elektronika',
                    '🍔 Oziq-ovqat, Restoran & Yetkazib berish',
                    '💄 Kosmetika & Go‘zallik parvarishi',
                    '🛠 Qurilish mollari & Avto-ehtiyot qismlar',
                    '📦 B2B Ulgurji savdo & Xomashyo'
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setBizCategory(cat)}
                      className={`p-3 rounded-2xl border text-left font-semibold transition-all ${
                        bizCategory === cat
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Savdo aylanmasi */}
            {connectStep === 2 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    2-Savol: Oylik o‘rtacha savdo aylanmangiz va buyurtmalar hajmi qancha?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Grafik va rentabellik shkalasini aniq kalibrlash uchun.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: '< $5,000', label: 'Boshlang‘ich bosqich: Oylik < $5,000 (100-300 buyurtma)' },
                    { id: '$5,000 - $25,000', label: 'O‘suvchi do‘kon: $5,000 - $25,000 (500-1,500 buyurtma)' },
                    { id: '$25,000 - $100,000', label: 'Barqaror biznes: $25,000 - $100,000 (2,000+ buyurtma)' },
                    { id: '$100,000+', label: 'Yirik tarmoq / Enterprise: $100,000+ (Katta hajm)' }
                  ].map((rev) => (
                    <button
                      key={rev.id}
                      onClick={() => setMonthlyRevenue(rev.label)}
                      className={`w-full p-3 rounded-2xl border text-left font-semibold transition-all ${
                        monthlyRevenue === rev.label
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {rev.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Savdo kanallari */}
            {connectStep === 3 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    3-Savol: Savdo asosan qaysi kanallar orqali amalga oshiriladi?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Bir nechta kanalni tanlashingiz mumkin.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    '🏪 Jismoniy savdo nuqtasi / Do‘kon',
                    '✈️ Telegram bot & Kanal orqali savdo',
                    '📸 Instagram Direct & Reels buyurtmalari',
                    '🌐 Internet-do‘kon / Web-sayt',
                    '📦 Marketpleyslar (Uzum, Wildberries, Ozon)'
                  ].map((ch) => {
                    const isSelected = selectedChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        onClick={() => toggleChannel(ch)}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left font-semibold transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{ch}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Qaytuvchi mijozlar */}
            {connectStep === 4 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    4-Savol: Mijozlar bazasi va qaytuvchi xaridorlar ulushi qanday?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Mijozlarni ushlab qolish (Retention) tezligini o‘lchash uchun.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    'Yangi xaridorlar ko‘p (qayta xarid < 30%)',
                    'O‘rtacha ko‘rsatkich (qaytuvchi xaridorlar 40-70%)',
                    'Kuchli doimiy baza (qaytuvchi mijozlar 70-90%)'
                  ].map((ret) => (
                    <button
                      key={ret}
                      onClick={() => setCustomerRetention(ret)}
                      className={`w-full p-3 rounded-2xl border text-left font-semibold transition-all ${
                        customerRetention === ret
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {ret}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Asosiy maqsad */}
            {connectStep === 5 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    5-Savol: Hozirgi paytda biznesingizdagi asosiy maqsad yoki to‘siq nima?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Operon AI aynan shu maqsadga yo‘naltirilgan xulosalar beradi.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    '📈 Sof foyda va savdo hajmini 2 barobarga oshirish',
                    '🔄 Qaytuvchi mijozlarni ushlab qolish (Retention)ni oshirish',
                    '📊 Ombor qoldiqlari va kassa uzilishlarini yo‘qotish',
                    '🚚 Filiallar ochish va yangi hududlarga kengayish'
                  ].map((g) => (
                    <button
                      key={g}
                      onClick={() => setMainGoal(g)}
                      className={`w-full p-3 rounded-2xl border text-left font-semibold transition-all ${
                        mainGoal === g
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              {connectStep > 1 ? (
                <button
                  onClick={() => setConnectStep((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Oldingi
                </button>
              ) : (
                <div />
              )}

              {connectStep < 5 ? (
                <button
                  onClick={() => setConnectStep((prev) => prev + 1)}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 flex items-center gap-1.5"
                >
                  Keyingisi <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleStartAnalysis('connect')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" /> Tahlilni yakunlash va Panelga kirish
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 3: BIZNES YARATISH SAVOLLARI ================= */}
        {stage === 'startup_questions' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Step Progress */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => setStage('select_catalog')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Orqaga
              </button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <span>Startap tahlili: {startupStep}/4 bosqich</span>
              </div>
            </div>

            {/* Step 1: Qaysi sohada */}
            {startupStep === 1 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    1-Savol: Qaysi sohada yangi biznes boshlamoqchisiz?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Bozor raqobati va xavf darajasini hisoblash uchun.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    '🛍 E-commerce / Onlayn do‘kon',
                    '🏭 Mahsulot ishlab chiqarish & Brend',
                    '☕️ Qahvaxona / Fast-food / Restoran',
                    '💼 Xizmat ko‘rsatish & Agentlik',
                    '🚚 Ulgurji savdo & Dropshipping'
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStartupCategory(s)}
                      className={`p-3 rounded-2xl border text-left font-semibold transition-all ${
                        startupCategory === s
                          ? 'border-amber-600 bg-amber-50 text-amber-800 ring-1 ring-amber-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Boshlang'ich byudjet */}
            {startupStep === 2 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    2-Savol: Boshlang‘ich sarmoya (investitsiya) byudjetingiz qancha?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Kapital yetishmovchiligi xavfini aniqlash uchun.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    '🧪 Kichik test byudjeti ($300 - $1,500)',
                    '🚀 O‘rta byudjet ($1,500 - $8,000)',
                    '🏢 Katta investitsiya ($8,000 - $30,000+)'
                  ].map((b) => (
                    <button
                      key={b}
                      onClick={() => setStartupBudget(b)}
                      className={`w-full p-3 rounded-2xl border text-left font-semibold transition-all ${
                        startupBudget === b
                          ? 'border-amber-600 bg-amber-50 text-amber-800 ring-1 ring-amber-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Maqsadli auditoriya */}
            {startupStep === 3 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    3-Savol: Asosiy maqsadli auditoriyangiz kimlar?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Marketing strategiyasi va talab hajmini baholash.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    'Yoshlar va talabalar (18-25 yosh)',
                    'Ayollar, onalar va oilaviy xaridorlar (22-45 yosh)',
                    'Erkaklar va texnologiya/avto ishqibozlari',
                    'B2B Korxonalar va tadbirkorlar'
                  ].map((aud) => (
                    <button
                      key={aud}
                      onClick={() => setTargetAudience(aud)}
                      className={`w-full p-3 rounded-2xl border text-left font-semibold transition-all ${
                        targetAudience === aud
                          ? 'border-amber-600 bg-amber-50 text-amber-800 ring-1 ring-amber-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Savdo formati */}
            {startupStep === 4 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    4-Savol: Savdoni qanday boshlashni rejalashtiryapsiz?
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Ijara va doimiy xarajatlar yukini hisoblash.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    '📱 Faqat onlayn (Telegram, Instagram, yetkazib berish)',
                    '🏬 Do‘kon ijaraga olib to‘liq oflayn ochilish',
                    '🌐 Marketpleyslar (Uzum / Wildberries orqali savdo)'
                  ].map((sf) => (
                    <button
                      key={sf}
                      onClick={() => setSalesFormat(sf)}
                      className={`w-full p-3 rounded-2xl border text-left font-semibold transition-all ${
                        salesFormat === sf
                          ? 'border-amber-600 bg-amber-50 text-amber-800 ring-1 ring-amber-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sf}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              {startupStep > 1 ? (
                <button
                  onClick={() => setStartupStep((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Oldingi
                </button>
              ) : (
                <div />
              )}

              {startupStep < 4 ? (
                <button
                  onClick={() => setStartupStep((prev) => prev + 1)}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 flex items-center gap-1.5"
                >
                  Keyingisi <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleStartAnalysis('startup')}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 flex items-center gap-2 shadow-xs"
                >
                  <Flame className="w-4 h-4" /> Xavflarni va Maslahatlarni ko‘rish
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 4: AI ANALYZING ANIMATION ================= */}
        {stage === 'analyzing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 flex-1">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Operon AI Tahlil O‘tkazmoqda...</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {selectedCatalog === 'connect'
                  ? 'Do‘koningiz modeli o‘rganilib, individual metrikalar va o‘sish nuqtalari sozlanmoqda.'
                  : 'Startap g‘oyangiz bo‘yicha bankrotlik xavflari va eng daromadli strategiya shakllantirilmoqda.'}
              </p>
            </div>
          </div>
        )}

        {/* ================= STAGE 5: RESULTS & STRATEGY / MASLAHATLAR ================= */}
        {stage === 'results' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {selectedCatalog === 'connect' ? (
              /* CONNECT BUSINESS SUCCESS REPORT */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Biznesingiz Operon tizimiga muvaffaqiyatli ulandi!</h4>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Unikal ID: <strong>{userProfile.uniqueCode}</strong> • Soha: {bizCategory}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Operon AI Tavsiyalari:</h4>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-slate-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Asosiy daromad drayveri:</strong> {selectedChannels.join(', ')} orqali faol kunlar (ayniqsa Seshanba va Juma)da promo-aksiyalar o‘tkazish.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Retention (Qaytuvchi xaridorlar):</strong> Qayta xarid ulushini 68% dan 80% ga oshirish uchun SMS va Telegram eslatmalar tizimini yoqish.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Zaxira nazorati:</strong> Tez aylanadigan tovarlarni avtomatik hisoblab, kassa uzilishlarining oldini olish.</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* STARTUP BANKRUPTCY RISKS & BEST PATH ADVICE */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950">Startap Yaratuvchilar Uchun AI Strategik Tahlili</h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Soha: {startupCategory} • Byudjet: {startupBudget}
                    </p>
                  </div>
                </div>

                {/* 1. Bankrot bo'lish xavflari (Qayerga bormaslik kerak) */}
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>⚠️ QAYERGA BORSA BANKROT BO‘LADI? (Eng katta xatolar):</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-rose-900 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>Katta ijara va qimmat ta’mir tuzog‘i:</strong> Savdo bo‘lmasdan turib barcha kapitalni hashamatli joy ijarasiga sarflash 90% yangi do‘konlarni 3 oyda yopilishiga olib keladi.
                    </li>
                    <li>
                      <strong>Talabni tekshirmasdan omborni to‘ldirish:</strong> O‘zingizga yoqqan tovardan katta partiya olib pulni muzlatib qo‘yish (likvidlik nolga tushadi).
                    </li>
                    <li>
                      <strong>Yashirin xarajatlar va past marja:</strong> Tovar ustiga 10-15% qo‘yib, soliq, yetkazib berish, brak va reklamani hisobga olmaslik.
                    </li>
                  </ul>
                </div>

                {/* 2. Qaysi yo'l yaxshi (Eng to'g'ri va xavfsiz strategiya) */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>💡 QAYSI YO‘L ENG YAXSHI VA DAROMADLI? (G‘olib strategiya):</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-emerald-950 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>MVP & Kichik test partiyasi:</strong> Avval $300-$500 bilan talabni tekshiring, reklama berib real buyurtma oling, so‘ngra kattaroq hajmga o‘ting.
                    </li>
                    <li>
                      <strong>Marjani kamida 40-60% ushlash:</strong> Kassa uzilishi bo‘lmasligi uchun xarajatlar va reklama zaxirasi bo‘lsin.
                    </li>
                    <li>
                      <strong>Birinchi 100 ta mijoz bilan yaqin aloqa:</strong> Har bir mijozning raqamini saqlab, Operon AI yordamida qayta xarid (Retention) qildiring.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action to Enter Dashboard */}
            <div className="pt-2">
              <button
                id="btn-confirm-onboarding"
                onClick={handleFinish}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Boshqaruv Paneliga Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
