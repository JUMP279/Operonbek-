import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Zap,
  CornerDownRight,
  Smile,
  Image as ImageIcon,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Bell,
  Heart,
  Share2,
  Trash2,
  Copy,
  Settings2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface CustomerResponseViewProps {
  onBack: () => void;
  storeContext?: any;
}

interface CommentItem {
  id: string;
  userName: string;
  userHandle: string;
  avatarBg: string;
  platform: 'instagram' | 'telegram' | 'tiktok';
  postTitle: string;
  postBadge: string;
  commentText: string;
  timeAgo: string;
  status: 'pending' | 'answered' | 'routed_to_direct';
  likesCount: number;
  replies?: Array<{
    id: string;
    author: string;
    text: string;
    timeAgo: string;
    isAI?: boolean;
  }>;
  suggestedAIReply: string;
}

interface DirectChat {
  id: string;
  userName: string;
  userHandle: string;
  avatarBg: string;
  platform: 'instagram' | 'telegram';
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  customerTag: string;
  status: 'online' | 'offline';
  messages: Array<{
    id: string;
    sender: 'customer' | 'store' | 'ai';
    text: string;
    time: string;
    isDelivered?: boolean;
    isRead?: boolean;
  }>;
}

export const CustomerResponseView: React.FC<CustomerResponseViewProps> = ({
  onBack,
  storeContext
}) => {
  const { t, language } = useLanguage();

  // Main Tabs: 'comments' (Komentariya) | 'direct' (Direct) | 'rules' (Avto-qoidalar)
  const [activeMainTab, setActiveMainTab] = useState<'comments' | 'direct' | 'rules'>('comments');

  // Platform Filter
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'telegram' | 'tiktok'>('all');
  const [commentSearch, setCommentSearch] = useState('');
  const [activeCommentFilter, setActiveCommentFilter] = useState<'all' | 'pending' | 'answered'>('all');

  // Comments State
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c-1',
      userName: 'Malika Karimova',
      userHandle: '@malika_k',
      avatarBg: 'bg-rose-500',
      platform: 'instagram',
      postTitle: 'Labubu Exclusive Drop 2026',
      postBadge: 'Reels • 42.8K ko‘rishlar',
      commentText: 'Assalomu alaykum! Narxi qancha? Toshkent ichida yetkazib berish bormi?',
      timeAgo: '3 daqiqa oldin',
      status: 'pending',
      likesCount: 4,
      suggestedAIReply: 'Assalomu alaykum, Malika! Narxi 240,000 so‘m. Toshkent bo‘ylab 2 soatda yetkazib beramiz. Directingizga to‘liq ma’lumot jo‘natdik 📩',
      replies: []
    },
    {
      id: 'c-2',
      userName: 'Azizbek Rahmonov',
      userHandle: '@aziz_official',
      avatarBg: 'bg-blue-600',
      platform: 'instagram',
      postTitle: 'Erkaklar sport to‘plami (Original)',
      postBadge: 'Post • 1.2K like',
      commentText: 'Oq va qora rangidan L razmer bormi? Sifati qanday?',
      timeAgo: '14 daqiqa oldin',
      status: 'answered',
      likesCount: 2,
      suggestedAIReply: 'Salom, Azizbek! Ha, L razmer hozir mavjud. 100% paxta sifati kafolatlangan.',
      replies: [
        {
          id: 'rep-1',
          author: 'Operon AI',
          text: 'Salom, Azizbek! Ha, L razmer oq va qora rangda hozir omborda bor. Directingizga maxsus havola jo‘natdik!',
          timeAgo: '10 daqiqa oldin',
          isAI: true
        }
      ]
    },
    {
      id: 'c-3',
      userName: 'Dilnoza Toys & Kids',
      userHandle: '@dilnoza_kids',
      avatarBg: 'bg-amber-500',
      platform: 'tiktok',
      postTitle: 'Viral PopMart Box Ochilishi',
      postBadge: 'TikTok • 88.5K ko‘rishlar',
      commentText: 'Optomga ham sotasizmi? Narxlari ro‘yxatini bera olasizmi?',
      timeAgo: '28 daqiqa oldin',
      status: 'pending',
      likesCount: 9,
      suggestedAIReply: 'Assalomu alaykum, Dilnoza! Ha, 10 donadan ortiq buyurtmalarga 25% ulgurji chegirma bor. B2B narxnomani Directingizga tashladik 💼',
      replies: []
    },
    {
      id: 'c-4',
      userName: 'Sardor Mirzayev',
      userHandle: '@sardor_m',
      avatarBg: 'bg-emerald-600',
      platform: 'telegram',
      postTitle: 'Smart Soatlar Pro Aksiyasi',
      postBadge: 'Kanal Post • 8.4K ko‘rildi',
      commentText: 'Kafolati necha oy? Viloyatlarga BTS pochta orqali chiqarib bera olasizmi?',
      timeAgo: '45 daqiqa oldin',
      status: 'pending',
      likesCount: 1,
      suggestedAIReply: 'Salom, Sardor! 1 yil rasmiy kafolat beriladi. Butun O‘zbekiston bo‘ylab BTS va EMU pochta orqali 24 soatda yetkazamiz 🚚',
      replies: []
    },
    {
      id: 'c-5',
      userName: 'Guli Ahmedova',
      userHandle: '@guli_fashion',
      avatarBg: 'bg-purple-600',
      platform: 'instagram',
      postTitle: 'Yozgi Yangi Kolleksiya 2026',
      postBadge: 'Stories • 3.1K ko‘rildi',
      commentText: 'Juda chiroyli ekan! Qanday buyurtma bersam bo‘ladi?',
      timeAgo: '1 soat oldin',
      status: 'answered',
      likesCount: 6,
      suggestedAIReply: 'Rahmat! Directga yozsangiz menejerimiz 1 daqiqada buyurtmangizni qabul qiladi.',
      replies: [
        {
          id: 'rep-2',
          author: 'Operon AI',
          text: 'Katta rahmat, Guli xonim! Directingizga to‘g‘ridan-to‘g‘ri buyurtma havolasini yubordik, kiring 🛍️',
          timeAgo: '55 daqiqa oldin',
          isAI: true
        }
      ]
    }
  ]);

  // Reply Drafts for individual comments
  const [replyDrafts, setReplyDrafts] = useState<{ [commentId: string]: string }>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);

  // Direct Chats State
  const [directChats, setDirectChats] = useState<DirectChat[]>([
    {
      id: 'chat-1',
      userName: 'Shahzod Aliyev',
      userHandle: '@shahzod_99',
      avatarBg: 'bg-indigo-600',
      platform: 'instagram',
      unreadCount: 2,
      lastMessage: 'Iltimos, yetkazib berish narxini ayting',
      lastTime: '14:22',
      customerTag: 'Yangi mijoz • 1-buyurtma',
      status: 'online',
      messages: [
        {
          id: 'm-1',
          sender: 'customer',
          text: 'Assalomu alaykum! Labubu dropdan 2 ta buyurtma bermoqchiman.',
          time: '14:18'
        },
        {
          id: 'm-2',
          sender: 'ai',
          text: 'Vaalaykum assalom, Shahzod! Buyurtmangiz uchun rahmat. 2 ta tovar uchun maxsus bepul yetkazib berish bonusi beriladi 🎁 Qaysi ranglarni tanlaysiz?',
          time: '14:19',
          isDelivered: true,
          isRead: true
        },
        {
          id: 'm-3',
          sender: 'customer',
          text: 'Klassik jigarrang va ko‘k rangidan. Toshkent Yunusobodga yetkazish qancha bo‘ladi?',
          time: '14:22'
        }
      ]
    },
    {
      id: 'chat-2',
      userName: 'Madina Usmonova',
      userHandle: '@madina.design',
      avatarBg: 'bg-pink-600',
      platform: 'instagram',
      unreadCount: 0,
      lastMessage: 'Katta rahmat! To‘lov chekini yubordim',
      lastTime: '13:50',
      customerTag: 'VIP Mijoz • LTV: $480',
      status: 'online',
      messages: [
        {
          id: 'm-4',
          sender: 'customer',
          text: 'Salom, yangi premium kolleksiyangizdan oldingi safargi kabi chegirma bormi?',
          time: '13:40'
        },
        {
          id: 'm-5',
          sender: 'ai',
          text: 'Assalomu alaykum, Madina xonim! Albatta, siz bizning VIP mijozimizsiz, 15% maxsus keshbek va bepul sovg‘a qadoqlash tayyor!',
          time: '13:42',
          isDelivered: true,
          isRead: true
        },
        {
          id: 'm-6',
          sender: 'customer',
          text: 'Ajoyib! Unda 1 ta to‘liq to‘plamni yozing.',
          time: '13:48'
        },
        {
          id: 'm-7',
          sender: 'customer',
          text: 'Katta rahmat! To‘lov chekini yubordim',
          time: '13:50'
        }
      ]
    },
    {
      id: 'chat-3',
      userName: 'Temur Xoliqov',
      userHandle: '@temur_x',
      avatarBg: 'bg-emerald-600',
      platform: 'telegram',
      unreadCount: 1,
      lastMessage: 'Viloyatga necha kunda boradi?',
      lastTime: '12:30',
      customerTag: 'Samarqand • Salohiyatli',
      status: 'offline',
      messages: [
        {
          id: 'm-8',
          sender: 'customer',
          text: 'Assalomu alaykum, Samarqand shahriga yetkazish bormi?',
          time: '12:28'
        },
        {
          id: 'm-9',
          sender: 'customer',
          text: 'Viloyatga necha kunda boradi?',
          time: '12:30'
        }
      ]
    },
    {
      id: 'chat-4',
      userName: 'Zilola Ergasheva',
      userHandle: '@zilola_beauty',
      avatarBg: 'bg-violet-600',
      platform: 'instagram',
      unreadCount: 0,
      lastMessage: 'Kuryeringiz juda xushmuomala ekan, rahmat!',
      lastTime: 'Kechagi',
      customerTag: 'Muntazam xaridor',
      status: 'offline',
      messages: [
        {
          id: 'm-10',
          sender: 'customer',
          text: 'Kuryeringiz juda xushmuomala ekan, rahmat!',
          time: 'Kecha 18:20'
        },
        {
          id: 'm-11',
          sender: 'store',
          text: 'Yoqimli foydalanish tilaymiz! Sizga xizmat ko‘rsatganimizdan mamnunmiz ✨',
          time: 'Kecha 18:25',
          isDelivered: true,
          isRead: true
        }
      ]
    }
  ]);

  const [selectedChatId, setSelectedChatId] = useState<string>('chat-1');
  const [directInputText, setDirectInputText] = useState('');
  const [directSearch, setDirectSearch] = useState('');
  const [isAiGeneratingDirect, setIsAiGeneratingDirect] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-Rules localized
  const getAutoRules = () => {
    if (language === 'ru') {
      return [
        {
          id: 'rule-price',
          title: 'Вопрос о цене в комментариях -> Авто-отправка в Direct',
          description: 'При обнаружении слов "цена", "сколько", "стоимость" вежливо отвечает в комментариях и отправляет карточку товара со ссылкой в Direct.',
          badge: 'Популярно',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          enabled: true
        },
        {
          id: 'rule-welcome',
          title: 'Приветствие и каталог для новых клиентов в Direct',
          description: 'Отправляет приветственное сообщение и ссылку на каталог бестселлеров в течение 3 секунд после первого обращения.',
          badge: 'Конверсия +32%',
          badgeColor: 'bg-blue-100 text-blue-700',
          enabled: true
        },
        {
          id: 'rule-delivery',
          title: 'Авто-ответ по условиям и срокам доставки',
          description: 'На вопросы о доставке в регионы рассчитывает тарифы курьерской службы и сообщает точные сроки.',
          badge: 'Быстрый сервис',
          badgeColor: 'bg-purple-100 text-purple-700',
          enabled: true
        },
        {
          id: 'rule-night',
          title: 'Ночной автопилот (22:00 - 08:00)',
          description: 'В нерабочее время AI принимает заказы и заносит их в систему для утренней отправки.',
          badge: '24/7 AI Режим',
          badgeColor: 'bg-amber-100 text-amber-700',
          enabled: true
        }
      ];
    }
    // Default: Kazakh (kk)
    return [
      {
        id: 'rule-price',
        title: 'Пікірде баға сұралса -> Direct-ке автоматты баға жіберу',
        description: 'Пікірде "бағасы", "қанша", "құны" сөздері анықталғанда, пікірге сыпайы жауап беріп, Direct-ке тауар карточкасы мен сілтемесін жібереді.',
        badge: 'Ең танымал',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        enabled: true
      },
      {
        id: 'rule-welcome',
        title: 'Жаңа клиенттерге Direct-те автоматты сәлемдесу және каталог',
        description: 'Direct-ке алғаш рет жазған клиентке 3 секунд ішінде сәлемдесу хабарламасы мен танымал тауарлар каталогының сілтемесі жіберіледі.',
        badge: 'Конверсия +32%',
        badgeColor: 'bg-blue-100 text-blue-700',
        enabled: true
      },
      {
        id: 'rule-delivery',
        title: 'Жеткізу шарттары мен мерзімі бойынша автоматты жауап',
        description: 'Өңірлерге жеткізу туралы сұрақтарға курьерлік қызмет тарифтерін есептеп, нақты мерзімін хабарлайды.',
        badge: 'Жылдам қызмет',
        badgeColor: 'bg-purple-100 text-purple-700',
        enabled: true
      },
      {
        id: 'rule-night',
        title: 'Түнгі автопилот режимі (22:00 - 08:00)',
        description: 'Менеджерлер демалған уақытта AI клиенттердің тапсырыстарын қабылдап, таңертең жіберу үшін жүйеге енгізеді.',
        badge: '24/7 AI Режим',
        badgeColor: 'bg-amber-100 text-amber-700',
        enabled: true
      }
    ];
  };

  const [autoRules, setAutoRules] = useState(getAutoRules());

  useEffect(() => {
    setAutoRules(getAutoRules());
  }, [language]);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 2800);
  };

  // Reply to Comment
  const handleSendCommentReply = (commentId: string, replyText: string) => {
    if (!replyText.trim()) return;

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const newReplies = [
            ...(c.replies || []),
            {
              id: `rep-${Date.now()}`,
              author: 'Operon (Siz)',
              text: replyText,
              timeAgo: 'Hozirgina',
              isAI: false
            }
          ];
          return {
            ...c,
            status: 'answered',
            replies: newReplies
          };
        }
        return c;
      })
    );

    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));
    setActiveReplyBoxId(null);
    showNotification("Izohga javob muvaffaqiyatli chop etildi!");
  };

  // Use AI to reply to a single comment
  const handleUseAiReplyToComment = (comment: CommentItem) => {
    handleSendCommentReply(comment.id, comment.suggestedAIReply);
  };

  // Route comment inquiry directly to customer Direct
  const handleRouteCommentToDirect = (comment: CommentItem) => {
    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, status: 'routed_to_direct' } : c))
    );
    showNotification(`${comment.userHandle} ning Directiga to‘liq narx va katalog yuborildi 📩`);
  };

  // Batch Answer All Unanswered Comments via AI
  const handleBatchAiAnswerAll = () => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.status === 'pending') {
          return {
            ...c,
            status: 'answered',
            replies: [
              ...(c.replies || []),
              {
                id: `rep-ai-${Date.now()}-${c.id}`,
                author: 'Operon AI',
                text: c.suggestedAIReply,
                timeAgo: 'Hozirgina',
                isAI: true
              }
            ]
          };
        }
        return c;
      })
    );
    showNotification("Barcha ochiq izohlarga AI orqali samimiy javoblar jo‘natildi!");
  };

  // Active selected direct chat
  const activeChat = directChats.find((c) => c.id === selectedChatId) || directChats[0];

  // Send Direct Message
  const handleSendDirectMessage = (textToSend?: string) => {
    const text = textToSend || directInputText;
    if (!text.trim() || !activeChat) return;

    const newMessage = {
      id: `dm-${Date.now()}`,
      sender: 'store' as const,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDelivered: true,
      isRead: false
    };

    setDirectChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            lastMessage: text,
            lastTime: 'Hozirgina',
            unreadCount: 0,
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );

    setDirectInputText('');
    showNotification("Direct xabari yetkazildi 🚀");
  };

  // Generate AI Suggestion for Direct
  const handleGenerateAiDirectReply = () => {
    setIsAiGeneratingDirect(true);
    setTimeout(() => {
      let aiText = '';
      if (activeChat.userName.includes('Shahzod')) {
        aiText = "Shahzod, Yunusobod tumani ichida yetkazib berishimiz butunlay bepul! Jigarrang va ko‘k rangli Labubuni buyurtmaga kiritdim. Qabul qiluvchi telefon raqamingizni tasdiqlab yuborsangiz kuryer yo‘lga chiqadi 🚚";
      } else if (activeChat.userName.includes('Temur')) {
        aiText = "Assalomu alaykum, Temur aka! Ha, Samarqand shahriga BTS pochta orqali ertaga soat 12:00 gacha yetib boradi. Yetkazish narxi atigi 25,000 so‘m.";
      } else {
        aiText = "Assalomu alaykum! Sizga qanday yordam bera olamiz? Yangi mavsumiy chegirmalarimiz bilan tanishish uchun 'Katalog' havolasini yuboraylikmi?";
      }
      setDirectInputText(aiText);
      setIsAiGeneratingDirect(false);
    }, 450);
  };

  // Quick Direct Templates
  const getDirectQuickTemplates = () => {
    if (language === 'ru') {
      return [
        { label: '💰 Цена и Оплата', text: 'Стоимость товара 14,500 ₸. Принимаем оплату через Kaspi, картой или при получении.' },
        { label: '🚚 Бесплатная доставка', text: 'Доставка по городу в течение 2 часов, по регионам — за 24-48 часов.' },
        { label: '📦 Каталог товаров', text: 'Наш полный онлайн-каталог и все доступные модели: operon.shop/catalog' },
        { label: '✅ Заказ подтвержден', text: 'Ваш заказ успешно оформлен! Курьер свяжется с вами в ближайшее время.' }
      ];
    }
    // Default: Kazakh (kk)
    return [
      { label: '💰 Бағасы және төлем', text: 'Тауар бағасы 14,500 ₸. Kaspi, карта немесе қолма-қол төлем қабылданады.' },
      { label: '🚚 Тегін жеткізу', text: 'Қала бойынша 2 сағат ішінде, өңірлерге 24-48 сағатта жеткіземіз.' },
      { label: '📦 Тауарлар каталогы', text: 'Толық онлайн-каталог және барлық үлгілер сілтемесі: operon.shop/catalog' },
      { label: '✅ Тапсырыс расталды', text: 'Тапсырысыңыз сәтті рәсімделді! Курьер жақын арада сізбен байланысады.' }
    ];
  };

  const directQuickTemplates = getDirectQuickTemplates();

  // Filtering comments
  const filteredComments = comments.filter((c) => {
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    if (activeCommentFilter === 'pending' && c.status !== 'pending') return false;
    if (activeCommentFilter === 'answered' && c.status === 'pending') return false;
    if (commentSearch.trim()) {
      const q = commentSearch.toLowerCase();
      return (
        c.userName.toLowerCase().includes(q) ||
        c.userHandle.toLowerCase().includes(q) ||
        c.commentText.toLowerCase().includes(q) ||
        c.postTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtering direct chats
  const filteredDirectChats = directChats.filter((c) => {
    if (platformFilter !== 'all' && platformFilter !== 'tiktok' && c.platform !== platformFilter) return false;
    if (directSearch.trim()) {
      const q = directSearch.toLowerCase();
      return (
        c.userName.toLowerCase().includes(q) ||
        c.userHandle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCommentsCount = comments.filter((c) => c.status === 'pending').length;
  const unreadDirectCount = directChats.reduce((acc, curr) => acc + curr.unreadCount, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-hidden select-none relative">
      {/* Toast Alert */}
      {successToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors font-bold text-xs active:scale-95"
            title={language === 'ru' ? 'Назад' : 'Артқа'}
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>{language === 'ru' ? 'Назад' : 'Артқа'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{language === 'ru' ? 'Ответ клиентам' : 'Клиенттерге жауап'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              {language === 'ru' ? 'Центр управления комментариями и Direct' : 'Пікірлер мен Direct хабарламаларын басқару орталығы'}
            </p>
          </div>
        </div>

        {/* AI Agent Status Pill */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-2.5 py-1 rounded-xl">
          <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-[10.5px] font-bold text-blue-700">
            {language === 'ru' ? 'AI 24/7 Активен' : 'AI 24/7 Белсенді'}
          </span>
        </div>
      </div>

      {/* Primary 3-Tab Segmented Switcher (Komentariya | Direct | Avto-qoidalar) */}
      <div className="px-3 sm:px-4 pt-2.5 pb-2 bg-white border-b border-slate-100 shrink-0">
        <div className="bg-slate-100/90 p-1 rounded-2xl grid grid-cols-3 gap-1 max-w-xl mx-auto">
          {/* Tab 1: Komentariya */}
          <button
            onClick={() => setActiveMainTab('comments')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeMainTab === 'comments'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Комментарии' : 'Пікірлер'}</span>
            {pendingCommentsCount > 0 && (
              <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white">
                {pendingCommentsCount}
              </span>
            )}
          </button>

          {/* Tab 2: Direct */}
          <button
            onClick={() => setActiveMainTab('direct')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeMainTab === 'direct'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Direct</span>
            {unreadDirectCount > 0 && (
              <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-blue-600 text-white">
                {unreadDirectCount}
              </span>
            )}
          </button>

          {/* Tab 3: Avto-qoidalar */}
          <button
            onClick={() => setActiveMainTab('rules')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeMainTab === 'rules'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="truncate">{language === 'ru' ? 'Авто-правила' : 'Авто-ережелер'}</span>
          </button>
        </div>

        {/* Platform Quick Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[10.5px] font-bold text-slate-400 shrink-0 mr-1">
            {language === 'ru' ? 'Платформа:' : 'Платформа:'}
          </span>
          {[
            { id: 'all', label: language === 'ru' ? 'Все' : 'Барлығы', icon: null },
            { id: 'instagram', label: 'Instagram', icon: '📸' },
            { id: 'telegram', label: 'Telegram', icon: '✈️' },
            { id: 'tiktok', label: 'TikTok', icon: '🎵' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPlatformFilter(item.id as any)}
              className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                platformFilter === item.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Body Content based on activeMainTab */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* ==================================================== */}
        {/* 1. TAB: KOMENTARIYA (Comments Management & AI Reply) */}
        {/* ==================================================== */}
        {activeMainTab === 'comments' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 no-scrollbar max-w-4xl mx-auto w-full">
            
            {/* Quick Stats & One-Click AI Batch Responder Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-3.5 sm:p-4 text-white shadow-xs relative overflow-hidden">
              <div className="absolute -right-4 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-tight">
                      {language === 'ru' ? 'Быстрый ответ на комментарии' : 'Пікірлерге жылдам жауап'}
                    </span>
                    <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full border border-white/25">
                      {pendingCommentsCount} {language === 'ru' ? 'ожидает' : 'күтілуде'}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                    {language === 'ru' ? (
                      <>Средняя скорость AI ответа: <strong className="text-white">12 сек</strong> • Конверсия в 3 раза выше</>
                    ) : (
                      <>Орташа AI жауап беру жылдамдығы: <strong className="text-white">12 секунд</strong> • Конверсия 3 есе жоғары</>
                    )}
                  </p>
                </div>

                {pendingCommentsCount > 0 && (
                  <button
                    onClick={handleBatchAiAnswerAll}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>{language === 'ru' ? 'AI ответить на все' : 'Барлығына AI жауап берсін'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search and Status Sub-filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                  placeholder={language === 'ru' ? 'Поиск комментариев или клиентов...' : 'Пікірлер немесе клиент атауынан іздеу...'}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
                <button
                  onClick={() => setActiveCommentFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                    activeCommentFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ru' ? 'Все' : 'Барлығы'} ({comments.length})
                </button>
                <button
                  onClick={() => setActiveCommentFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                    activeCommentFilter === 'pending'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ru' ? 'Ожидают' : 'Күтілуде'} ({pendingCommentsCount})
                </button>
                <button
                  onClick={() => setActiveCommentFilter('answered')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                    activeCommentFilter === 'answered'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ru' ? 'Отвечено' : 'Жауап берілді'}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {filteredComments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    {language === 'ru' ? 'Комментарии не найдены' : 'Ешқандай пікір табылмады'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ru' ? 'Попробуйте изменить поисковый запрос или фильтр' : 'Сүзгі немесе іздеу сөзін өзгертіп көріңіз'}
                  </p>
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Comment Header: User Info & Post Context */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-2xl ${comment.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                        >
                          {comment.userName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900 truncate">
                              {comment.userName}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-medium">
                              {comment.userHandle}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md">
                              {comment.platform.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>{comment.postBadge}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {comment.timeAgo}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {comment.status === 'pending' ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            {language === 'ru' ? 'Ожидает' : 'Күтілуде'}
                          </span>
                        ) : comment.status === 'routed_to_direct' ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center gap-1">
                            <Send className="w-3 h-3 text-blue-600" />
                            {language === 'ru' ? 'Отправлено в Direct' : 'Direct-ке жіберілді'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {language === 'ru' ? 'Отвечено' : 'Жауап берілді'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer Comment Text */}
                    <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        "{comment.commentText}"
                      </p>
                    </div>

                    {/* Existing Replies if any */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="space-y-1.5 pl-3 border-l-2 border-blue-200">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-blue-50/60 rounded-xl p-2.5 border border-blue-100/70">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-extrabold text-blue-700 flex items-center gap-1">
                                {reply.isAI && <Bot className="w-3 h-3 text-blue-600" />}
                                {reply.author}
                              </span>
                              <span className="text-slate-400">{reply.timeAgo}</span>
                            </div>
                            <p className="text-[11.5px] text-slate-700 font-medium leading-tight">
                              {reply.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Smart Suggestion Chip (Interactive One-Tap Reply) */}
                    {comment.status === 'pending' && (
                      <div className="bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-white rounded-2xl p-2.5 border border-purple-100/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10.5px] font-extrabold text-purple-700 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            {language === 'ru' ? 'Рекомендованный ответ AI:' : 'AI ұсынған жауап:'}
                          </span>
                          <button
                            onClick={() => handleUseAiReplyToComment(comment)}
                            className="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 px-2 py-0.5 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <span>{language === 'ru' ? 'Отправить этот ответ' : 'Осы жауапты жіберу'}</span>
                            <Send className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-600 italic">
                          "{comment.suggestedAIReply}"
                        </p>
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* Direct DM Route button */}
                        <button
                          onClick={() => handleRouteCommentToDirect(comment)}
                          className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/90 transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-3 h-3 text-blue-600" />
                          <span>{language === 'ru' ? 'Написать в Direct' : 'Direct-ке жазу'}</span>
                        </button>

                        {/* Open Manual Reply Box */}
                        <button
                          onClick={() =>
                            setActiveReplyBoxId(activeReplyBoxId === comment.id ? null : comment.id)
                          }
                          className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/90 transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <CornerDownRight className="w-3 h-3 text-slate-500" />
                          <span>{language === 'ru' ? 'Написать свой ответ' : 'Өзім жазамын'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-50" />
                        <span>{comment.likesCount} {language === 'ru' ? 'лайков' : 'лайк'}</span>
                      </div>
                    </div>

                    {/* In-Line Manual Reply Box */}
                    {activeReplyBoxId === comment.id && (
                      <div className="pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={replyDrafts[comment.id] || ''}
                            onChange={(e) =>
                              setReplyDrafts({ ...replyDrafts, [comment.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSendCommentReply(comment.id, replyDrafts[comment.id] || '');
                              }
                            }}
                            placeholder={language === 'ru' ? `Ответить ${comment.userName}...` : `${comment.userName} пайдаланушысына жауап жазу...`}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() =>
                              handleSendCommentReply(comment.id, replyDrafts[comment.id] || '')
                            }
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0"
                          >
                            <span>{language === 'ru' ? 'Отправить' : 'Жіберу'}</span>
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. TAB: DIRECT (Interactive Direct Messages & CRM Inbox) */}
        {/* ======================================================== */}
        {activeMainTab === 'direct' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Column / Mobile Top: Conversations List */}
            <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-44 md:h-full border-b md:border-b-0 overflow-hidden">
              
              {/* Direct Search Bar */}
              <div className="p-2.5 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={directSearch}
                    onChange={(e) => setDirectSearch(e.target.value)}
                    placeholder={language === 'ru' ? 'Поиск клиентов или сообщений...' : 'Клиент немесе хабарлама іздеу...'}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Chat Threads List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
                {filteredDirectChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full p-2.5 text-left transition-all flex items-center gap-2.5 ${
                      selectedChatId === chat.id
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-2xl ${chat.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}
                      >
                        {chat.userName.charAt(0)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          chat.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {chat.userName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {chat.lastTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                        {chat.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9.5px] font-semibold text-slate-400 truncate">
                          {chat.customerTag}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column / Active Direct Chat Screen */}
            <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-hidden">
              {/* Active Chat Header */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl ${activeChat.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}
                  >
                    {activeChat.userName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {activeChat.userName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {activeChat.userHandle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <span className="text-blue-600 font-bold">{activeChat.platform.toUpperCase()} DIRECT</span>
                      <span>•</span>
                      <span>{activeChat.customerTag}</span>
                    </div>
                  </div>
                </div>

                {/* Quick CRM Action: Create Order */}
                <button
                  onClick={() => showNotification(language === 'ru' ? "Открытие окна создания заказа..." : "Клиент үшін тапсырыс жасау терезесі ашылуда...")}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] transition-colors flex items-center gap-1 shrink-0"
                >
                  <ShoppingBag className="w-3 h-3 text-slate-600" />
                  <span className="hidden sm:inline">{language === 'ru' ? 'Создать заказ' : 'Тапсырыс жасау'}</span>
                </button>
              </div>

              {/* Chat Messages Scrollable Feed */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 no-scrollbar">
                <div className="text-center my-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {language === 'ru' ? 'Сегодняшняя беседа' : 'Бүгінгі сұхбат'}
                  </span>
                </div>

                {activeChat.messages.map((msg) => {
                  const isStore = msg.sender === 'store';
                  const isAI = msg.sender === 'ai';
                  const isCustomer = msg.sender === 'customer';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs font-medium shadow-2xs leading-relaxed ${
                          isCustomer
                            ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                            : isAI
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-slate-900 text-white rounded-tr-xs'
                        }`}
                      >
                        {isAI && (
                          <div className="flex items-center gap-1 text-[9.5px] font-extrabold text-blue-200 mb-0.5">
                            <Bot className="w-3 h-3" />
                            <span>{language === 'ru' ? 'Ответ AI' : 'AI жауабы'}</span>
                          </div>
                        )}
                        <p>{msg.text}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[9.5px] text-slate-400 mt-1 px-1">
                        <span>{msg.time}</span>
                        {!isCustomer && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Direct Template Chips */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {language === 'ru' ? 'Быстро:' : 'Жылдам:'}
                </span>
                {directQuickTemplates.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendDirectMessage(item.text)}
                    className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors whitespace-nowrap shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Input Area with AI Assist Button */}
              <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
                <div className="flex items-center gap-2">
                  {/* AI Smart Suggestion Button */}
                  <button
                    onClick={handleGenerateAiDirectReply}
                    disabled={isAiGeneratingDirect}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] border border-purple-200 transition-colors flex items-center gap-1 shrink-0 active:scale-95"
                    title={language === 'ru' ? 'Написать ответ с AI' : 'AI арқылы жауап жазу'}
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-600 ${isAiGeneratingDirect ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{language === 'ru' ? '⚡ Написать с AI' : '⚡ AI жазсын'}</span>
                  </button>

                  <input
                    type="text"
                    value={directInputText}
                    onChange={(e) => setDirectInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendDirectMessage();
                    }}
                    placeholder={language === 'ru' ? `Написать в Direct для ${activeChat.userName}...` : `${activeChat.userName} үшін Direct-ке жазу...`}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={() => handleSendDirectMessage()}
                    disabled={!directInputText.trim()}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-xs active:scale-95 shrink-0"
                    title={language === 'ru' ? 'Отправить' : 'Жіберу'}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TAB: AVTO-QOIDALAR (Automated Rules & Integration)   */}
        {/* ======================================================== */}
        {activeMainTab === 'rules' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {language === 'ru' ? 'Правила авто-ответа AI' : 'AI автоматты жауап ережелері'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {language === 'ru' ? '100% автоматизация комментариев и Direct' : 'Пікірлер мен Direct ағынын 100% автоматтандыру'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Settings2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
              {autoRules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${rule.badgeColor}`}>
                          {rule.badge}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {rule.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {rule.description}
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        setAutoRules((prev) =>
                          prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                        );
                        showNotification(
                          rule.enabled
                            ? (language === 'ru' ? "Правило временно приостановлено" : "Ереже уақытша тоқтатылды")
                            : (language === 'ru' ? "Правило активировано и запущено!" : "Ереже қосылды және іске қосылды!")
                        );
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        rule.enabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <strong>{language === 'ru' ? 'Безопасность и Анти-Спам:' : 'Қауіпсіздік & Анти-Спам:'}</strong>{' '}
                {language === 'ru'
                  ? 'Все ответы отправляются в соответствии со стандартами Instagram Graph API и Telegram Bot API. Риск блокировки профиля 0%.'
                  : 'Барлық жауаптар Instagram Graph API және Telegram Bot API ресми стандарттарына сәйкес жіберіледі. Бұғатталу қаупі 0%.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
