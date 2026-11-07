import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Instagram,
  Send,
  Copy,
  Check,
  Flame,
  MessageSquare,
  Info,
  Calendar,
  Share2,
  Trash2,
  Sliders,
  CheckCircle2,
  Layers,
  ChevronRight,
  Plus,
  Eye,
  Edit3,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface AIPostGeneratorViewProps {
  onBack: () => void;
  storeContext?: any;
}

interface PostJournalItem {
  id: string;
  image: string;
  platform: 'BOTH' | 'INSTAGRAM' | 'TELEGRAM';
  status: 'NASHR ETILGAN' | 'QORALAMA';
  text: string;
  hashtags: string[];
  date: string;
}

export const AIPostGeneratorView: React.FC<AIPostGeneratorViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();

  // Active Tab for Mobile / Responsive navigation
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'journal'>('create');

  // Social Channels
  const [instagramActive, setInstagramActive] = useState(true);
  const [telegramActive, setTelegramActive] = useState(true);

  // Form State
  const [platform, setPlatform] = useState<'instagram' | 'telegram' | 'both'>('both');
  const [promptTopic, setPromptTopic] = useState('Yangi kelgan mahsulotimizni ko\'rsatuvchi post uchun qiziqarli matn yoz, 15% chegirma borligini ta\'kidla...');
  const [toneOfVoice, setToneOfVoice] = useState<'reklama' | 'jalb' | 'malumot'>('reklama');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // AI Ideas State
  const [isSearchingIdeas, setIsSearchingIdeas] = useState(false);
  const [ideas, setIdeas] = useState([
    { id: '1', title: "«3 ta eng ko'p sotilgan tovar siri»", desc: "Mijozlar ishonchini oshiruvchi post" },
    { id: '2', title: "«Sifat va chidamlilik testi»", desc: "Amaliy foyda va kafolat haqida post" },
    { id: '3', title: "«Hafta oxirgi maxsus aksiyasi»", desc: "Tezkor xaridga undovchi chegirma posti" }
  ]);

  // Generated Post Preview
  const [generatedPost, setGeneratedPost] = useState<any>({
    platform: 'BOTH',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
    title: 'Bolalaringiz uchun sifatli va xavfsiz o‘yinchoqlar! 🎁',
    body: `Bolalaringiz uchun mukammal sovg'a qidiryapsizmi? ✅\n\nSifatli va ekologik toza materialdan tayyorlangan yangi kolleksiyamiz yetib keldi! 3 xil rangda mavjud. Kafolatlangan sifat va bolalar ijodkorligini oshirish uchun maxsus tanlov.\n\n🔥 Faqatgina ushbu haftada 15% maxsus chegirma amal qiladi!`,
    hashtags: ['#BolalarOyinchoqlari', '#LabubuFigura', '#ToshkentYetkazish', '#Chegirma', '#OperonUz'],
    time: 'Bugun, 18:00'
  });

  // Journal Items
  const [postsJournal, setPostsJournal] = useState<PostJournalItem[]>([
    {
      id: 'j-1',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
      platform: 'BOTH',
      status: 'NASHR ETILGAN',
      text: "Bolalaringiz uchun mukammal o'yinchoq qidiryapsizmi? ✅ Sifatli materialdan tayyorlangan Labubu figura 3 turli rangda mavjud: Qora, Oq, Kulrang ✅ Kafolatlangan mahsulot 💰 Narx: 145,000 so'm.",
      hashtags: ['#BolalarOyinchoqlari', '#LabubuFigura', '#OyinchogDostlar'],
      date: 'Bugun, 16:18'
    },
    {
      id: 'j-2',
      image: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=600&auto=format&fit=crop&q=80',
      platform: 'BOTH',
      status: 'NASHR ETILGAN',
      text: "Kolleksiya yig'uvchilar, e'tibor bering! ✅ Sifatli materialdan tayyorlangan Labubu figura sizning bolalaringiz uchun mukammal tanlov! ✅ 20000 so'mga sifatli o'yinchoq.",
      hashtags: ['#LabubuFigura', '#KolleksiyaYiguvchilar', '#OyinchoqTanlovi'],
      date: 'Kecha, 12:30'
    },
    {
      id: 'j-3',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
      platform: 'INSTAGRAM',
      status: 'NASHR ETILGAN',
      text: "Bolajonlar uchun qiziqarli o'yinchoq qidiryapsizmi? ✅ Rang-barang dizayni bolalarning diqqatini jalb qiladi. Ijodkorligini rivojlantirishga yordam beradi.",
      hashtags: ['#LabubuFigura', '#BolalarOyinchoqlari', '#ToshkentYetkazish'],
      date: '25-avgust, 18:00'
    }
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const isPromo = toneOfVoice === 'reklama';
      const newPost = {
        platform: platform.toUpperCase(),
        image: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=600&auto=format&fit=crop&q=80',
        title: isPromo ? "Katta Chegirma E'lon Qilindi! 🔥" : "Do'konimizdan Yangi Foydali Tavsiya ✨",
        body: `${promptTopic}\n\nDo'konimizga tashrif buyuring yoki profil havolasi orqali buyurtma bering! Tezkor yetkazib berish xizmati mavjud.`,
        hashtags: ['#YangiKolleksiya', '#Aksiya', '#OperonShop', '#TrendUz', '#Toshkent'],
        time: 'Bugun, hozir'
      };
      setGeneratedPost(newPost);
      setIsGenerating(false);
      setActiveTab('preview');
    }, 900);
  };

  const handlePublishNow = () => {
    if (!generatedPost) return;
    const newItem: PostJournalItem = {
      id: 'j-' + Date.now(),
      image: generatedPost.image,
      platform: (generatedPost.platform === 'INSTAGRAM' ? 'INSTAGRAM' : generatedPost.platform === 'TELEGRAM' ? 'TELEGRAM' : 'BOTH') as any,
      status: 'NASHR ETILGAN',
      text: generatedPost.body,
      hashtags: generatedPost.hashtags,
      date: 'Bugun, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPostsJournal([newItem, ...postsJournal]);
    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setActiveTab('journal');
    }, 1200);
  };

  const handleRefreshIdeas = () => {
    setIsSearchingIdeas(true);
    setTimeout(() => {
      setIdeas([
        { id: '4', title: "«Eng ko'p so'ralgan 5 ta savolga javob»", desc: "Mijozlar shubhasini tarqatuvchi post" },
        { id: '5', title: "«Do'konimiz ortidagi jarayon (Backstage)»", desc: "Samimiy munosabat o'rnatuvchi video/post" },
        { id: '6', title: "«Faqat bugun: Bepul yetkazib berish kuni!»", desc: "Tezkor xarid chaqirig'i va aksiyasi" }
      ]);
      setIsSearchingIdeas(false);
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-x-hidden select-none font-sans text-slate-900 w-full max-w-full">
      {/* 1. TOP HEADER */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 shrink-0 shadow-2xs w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shrink-0 active:scale-95 border border-slate-200"
              title={language === 'ru' ? 'Назад' : 'Артқа'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>AI Post Generator</span>
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {language === 'ru' ? 'Автоматические посты для социальных сетей' : 'Әлеуметтік желілер үшін автоматты посттар'}
              </p>
            </div>
          </div>

          {/* Social connection chips */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setInstagramActive(!instagramActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                instagramActive
                  ? 'bg-pink-50 text-pink-700 border-pink-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Insta {instagramActive ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setTelegramActive(!telegramActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                telegramActive
                  ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>TG {telegramActive ? '✓' : ''}</span>
            </button>
          </div>
        </div>

        {/* TOP SEGMENTED TABS (100% Mobile Friendly) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-xl mt-2.5 border border-slate-200/80">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 text-center rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'create'
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0 text-purple-600" />
            <span className="truncate">{language === 'ru' ? '1. Создание' : '1. Жасау'}</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 text-center rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0 text-pink-600" />
            <span className="truncate">{language === 'ru' ? '2. Превью' : '2. Алдын ала қарау'}</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`py-2 px-1 text-center rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'journal'
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span className="truncate">{language === 'ru' ? `Журнал (${postsJournal.length})` : `Журнал (${postsJournal.length})`}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 w-full max-w-3xl mx-auto space-y-4 pb-24">
        
        {/* ======================================================== */}
        {/* TAB 1: YARATISH (CREATION & PROMPT)                     */}
        {/* ======================================================== */}
        {activeTab === 'create' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* A. AI KONTENT G'OYALARI */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                      💡 AI Kontent G'oyalari
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Tegishli g'oyani bosing — ssenariyga o'tadi
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRefreshIdeas}
                  disabled={isSearchingIdeas}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSearchingIdeas ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">{isSearchingIdeas ? 'Qidirilmoqda...' : "G'oyalar"}</span>
                </button>
              </div>

              {/* Ideas full-width list */}
              <div className="flex flex-col gap-2">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    onClick={() => {
                      setPromptTopic(idea.title + " haqida qiziqarli va sotuvchi post yozib ber.");
                    }}
                    className="p-3 bg-slate-50 hover:bg-purple-50/80 border border-slate-200/80 hover:border-purple-300 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group active:scale-[0.99]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 leading-snug">
                        {idea.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{idea.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 group-hover:bg-purple-600 text-purple-700 group-hover:text-white text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1">
                      <span>Tanlash</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* B. PARAMETRLAR SOZLAMALARI */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Parametrlar Sozlamalari
                </h3>
              </div>

              {/* Platform Selector - 100% full width buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Qaysi platforma uchun? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4 text-pink-600" /> },
                    { id: 'telegram', label: 'Telegram', icon: <Send className="w-4 h-4 text-sky-600" /> },
                    { id: 'both', label: 'Ikkalasi', icon: <Layers className="w-4 h-4 text-purple-600" /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPlatform(item.id as any)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 text-center ${
                        platform === item.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={platform === item.id ? 'text-white' : ''}>{item.icon}</span>
                      <span className="leading-tight text-[11px] whitespace-nowrap">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Post maqsadi yoki uning ssenariysi haqida yozing:
                </label>
                <textarea
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-500 font-medium resize-none shadow-2xs leading-relaxed"
                  placeholder="Masalan: Yangi kelgan mahsulotimizni ko'rsatuvchi post uchun qiziqarli matn yoz, 15% chegirma borligini ta'kidla..."
                />
              </div>

              {/* Tone of voice - Full width vertical list with full readability */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Kontent tili va uslubi (Tone of voice):
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      id: 'reklama',
                      label: '🔥 Reklama va Sotuv',
                      sub: 'Tezkor xaridga, aksiya va chegirmaga undash',
                      icon: <Flame className="w-4 h-4 text-amber-500" />
                    },
                    {
                      id: 'jalb',
                      label: '💬 Jalb qilish (Engagement)',
                      sub: 'Muloqot, faol savol-javob va fikr bildirishga chorlash',
                      icon: <MessageSquare className="w-4 h-4 text-indigo-500" />
                    },
                    {
                      id: 'malumot',
                      label: "ℹ️ Foydali Ma'lumot (Info)",
                      sub: 'Mahsulot sifati, tavsiyalar va foydali maslahatlar',
                      icon: <Info className="w-4 h-4 text-cyan-500" />
                    }
                  ].map((tone) => {
                    const isSelected = toneOfVoice === tone.id;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setToneOfVoice(tone.id as any)}
                        className={`w-full p-3 text-left rounded-xl border transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-300/40'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-white border border-slate-200'
                            }`}
                          >
                            {tone.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold leading-tight">
                              {tone.label}
                            </div>
                            <div
                              className={`text-[11px] leading-snug mt-0.5 ${
                                isSelected ? 'text-purple-100 font-normal' : 'text-slate-500'
                              }`}
                            >
                              {tone.sub}
                            </div>
                          </div>
                        </div>

                        {/* Radio Check Circle */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-white bg-white text-purple-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !promptTopic.trim()}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sun'iy Intellekt yozmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Sun'iy Intellekt Postini Yarat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PREVIEW (PREVYU VA NASHR QILISH)                 */}
        {/* ======================================================== */}
        {activeTab === 'preview' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Ijtimoiy Tarmoq Hujjati (Preview)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Post ijtimoiy tarmoqda aynan shunday ko'rinadi
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  {generatedPost.platform}
                </span>
              </div>

              {/* Post Container Mockup */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                {/* Channel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-linear-to-tr from-purple-600 to-pink-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      OP
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Operon Rasmiy Do'koni</div>
                      <div className="text-[11px] text-slate-400 font-medium">{generatedPost.time}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Tayyor
                  </span>
                </div>

                {/* Post Body (Full and readable) */}
                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  {generatedPost.body}
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5">
                  {generatedPost.hashtags.map((ht: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200/60 cursor-pointer transition-colors"
                    >
                      {ht}
                    </span>
                  ))}
                </div>
              </div>

              {/* Success Notification */}
              {publishSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Post muvaffaqiyatli nashr qilindi va jurnalga yozildi!</span>
                </div>
              )}

              {/* Action Buttons (100% full width and clear) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${generatedPost.body}\n\n${generatedPost.hashtags.join(' ')}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Nusxa olindi!' : 'Matnni Nusxalash'}</span>
                </button>

                <button
                  onClick={handlePublishNow}
                  className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>To'g'ridan-to'g'ri Nashr Qilish</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: POSTLAR JURNALI (HISTORY & FEED)                 */}
        {/* ======================================================== */}
        {activeTab === 'journal' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Chiqarilgan Postlar Tarixi
                </h3>
              </div>
              <span className="text-xs font-bold bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-full">
                {postsJournal.length} ta post
              </span>
            </div>

            {/* Journal List: Clean 1-column stack on mobile, 2 columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
              {postsJournal.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between transition-all hover:border-purple-300"
                >
                  <div className="p-4 space-y-3">
                    {/* Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
                        {post.platform}
                      </span>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {post.status}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      {post.text}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.hashtags.map((ht, idx) => (
                        <span key={idx} className="text-[11px] font-bold text-purple-600">
                          {ht}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>{post.date}</span>
                    <button
                      onClick={() => setPostsJournal(postsJournal.filter((p) => p.id !== post.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg flex items-center gap-1"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">O'chirish</span>
                    </button>
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
