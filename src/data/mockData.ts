import { MetricItem, CustomerSegment, DayActiveData, ProfitDataPoint, NotificationItem } from '../types';

// Single source of truth for the headline store figures.
// These were previously hardcoded (and inconsistent) in App.tsx,
// ThreeScreenShowcase.tsx, ExportModal.tsx and server.ts.
export const STORE_TOTALS = {
  totalProfit: '$446.7K',
  profitChange: '▲ 24,4%',
  profitChangeRaw: '+24.4%',
  activeProducts: 142,
  repeatCustomerRate: 68,
  repeatCustomerTarget: 80
};

// Matches the 2025 dates used by profitHistory and the DateRangeModal presets.
export const DEFAULT_DATE_RANGE = '01 - 30 Jan, 2025';

export const initialMetrics: MetricItem[] = [
  {
    id: 'page-views',
    label: 'Page Views',
    value: '16,431',
    numericValue: 16431,
    change: '▲ 15,5%',
    isPositive: true,
    comparisonText: 'vs. 14,653 last period',
    iconName: 'eye'
  },
  {
    id: 'visitors',
    label: 'Visitors',
    value: '6,225',
    numericValue: 6225,
    change: '▲ 8,4%',
    isPositive: true,
    comparisonText: 'vs. 5,732 last period',
    iconName: 'users'
  },
  {
    id: 'clicks',
    label: 'Click',
    value: '2,832',
    numericValue: 2832,
    change: '▼ 10,5%',
    isPositive: false,
    comparisonText: 'vs. 3,294 last period',
    iconName: 'mouse-pointer'
  },
  {
    id: 'orders',
    label: 'Orders',
    value: '1,224',
    numericValue: 1224,
    change: '▲ 4,4%',
    isPositive: true,
    comparisonText: 'vs. 1,186 last period',
    iconName: 'mail'
  }
];

export const profitHistory: ProfitDataPoint[] = [
  { date: '2025-01-01', displayDate: '1 Jan', profit: 4.8, orders: 120, revenue: 14200 },
  { date: '2025-01-04', displayDate: '4 Jan', profit: 4.2, orders: 105, revenue: 12800 },
  { date: '2025-01-08', displayDate: '8 Jan', profit: 9.1, orders: 230, revenue: 28400 },
  { date: '2025-01-11', displayDate: '11 Jan', profit: 7.4, orders: 190, revenue: 21900 },
  { date: '2025-01-15', displayDate: '15 Jan', profit: 11.2, orders: 290, revenue: 35000 },
  { date: '2025-01-18', displayDate: '18 Jan', profit: 9.8, orders: 250, revenue: 30200 },
  { date: '2025-01-22', displayDate: '22 Jan', profit: 12.6, orders: 340, revenue: 41500 },
  { date: '2025-01-25', displayDate: '25 Jan', profit: 10.4, orders: 275, revenue: 33100 },
  { date: '2025-01-29', displayDate: '29 Jan', profit: 14.5, orders: 390, revenue: 49000 },
];

export const customerSegments: CustomerSegment[] = [
  {
    id: 'retailers',
    name: 'Retailers',
    count: '2,884',
    numericCount: 2884,
    color: '#2563eb', // Royal blue
    bgColor: '#eff6ff',
    percentage: 59.1,
    icon: 'store'
  },
  {
    id: 'distributors',
    name: 'Distributors',
    count: '1,432',
    numericCount: 1432,
    color: '#10b981', // Emerald green
    bgColor: '#ecfdf5',
    percentage: 29.4,
    icon: 'network'
  },
  {
    id: 'wholesalers',
    name: 'Wholesalers',
    count: '562',
    numericCount: 562,
    color: '#f97316', // Orange
    bgColor: '#fff7ed',
    percentage: 11.5,
    icon: 'package'
  }
];

export const dayActivityData: DayActiveData[] = [
  { day: 'Sunday', shortDay: 'Sun', count: 4210, displayCount: '4,210', isPeak: false },
  { day: 'Monday', shortDay: 'Mon', count: 5680, displayCount: '5,680', isPeak: false },
  { day: 'Tuesday', shortDay: 'Tue', count: 8162, displayCount: '8,162', isPeak: true },
  { day: 'Wednesday', shortDay: 'Wed', count: 3920, displayCount: '3,920', isPeak: false },
  { day: 'Thursday', shortDay: 'Thu', count: 2840, displayCount: '2,840', isPeak: false },
  { day: 'Friday', shortDay: 'Fri', count: 6150, displayCount: '6,150', isPeak: false },
  { day: 'Saturday', shortDay: 'Sat', count: 7420, displayCount: '7,420', isPeak: false }
];

export const notificationsList: NotificationItem[] = [
  {
    id: '1',
    title: 'New bulk order received: $14,250 from MegaMart Retail',
    time: '12 min ago',
    unread: true,
    type: 'order'
  },
  {
    id: '2',
    title: 'Repeat customer rate reached 68% milestone (+4.2%)',
    time: '2 hours ago',
    unread: true,
    type: 'retention'
  },
  {
    id: '3',
    title: 'Tuesday traffic peak recorded at 8,162 active sessions',
    time: 'Yesterday',
    unread: false,
    type: 'alert'
  },
  {
    id: '4',
    title: 'Monthly inventory reconciliation report ready',
    time: '2 days ago',
    unread: false,
    type: 'system'
  }
];

export const availableWidgets: {
  id: string;
  name: string;
  nameKk: string;
  nameRu: string;
  category: string;
  description: string;
  iconName: string;
  gradient: string;
  defaultEnabled?: boolean;
  value?: string;
  change?: string;
  badge?: string;
}[] = [
  {
    id: 'customer-response',
    name: 'Customer Response',
    nameKk: 'Клиенттерге жауап',
    nameRu: 'Ответ клиентам',
    category: 'Клиенттер & Direct',
    description: 'Instagram, Telegram және TikTok пікірлеріне және Direct хабарламаларына 24/7 автоматты жауап',
    iconName: 'message-square',
    gradient: 'from-indigo-600 to-blue-600',
    defaultEnabled: true,
    value: 'Пікірлер & Direct',
    change: '⚡ 12 сек',
    badge: 'Direct & Пікір'
  },
  {
    id: 'post-creator',
    name: 'Post Creator',
    nameKk: 'Пост жасау',
    nameRu: 'Создание постов',
    category: 'Маркетинг & SMM',
    description: 'Instagram, Telegram және жарнама арналары үшін сатылым посттары мен мәтіндері',
    iconName: 'edit-3',
    gradient: 'from-purple-600 to-pink-600',
    defaultEnabled: true,
    value: '18 жаңа үлгі',
    change: '+34% қамту',
    badge: 'Вирустық SMM'
  },
  {
    id: 'video-creator',
    name: 'AI Video Generator & Publisher',
    nameKk: 'Видео жасау (AI Жариялаушы)',
    nameRu: 'AI Генератор видео и публикатор',
    category: 'Медиа & Reels',
    description: 'Видео сценарийлерін жоспарлау, AI memory ережелері және автоматты жариялау',
    iconName: 'video',
    gradient: 'from-purple-600 to-indigo-600',
    defaultEnabled: false,
    value: '3 AI Агент',
    change: 'Seedance & Авто-жариялау',
    badge: 'Авто-жариялау'
  },
  {
    id: 'add-product',
    name: 'Add Product',
    nameKk: 'Тауар қосу',
    nameRu: 'Добавить товар',
    category: 'Қойма & Каталог',
    description: 'Штрих-код, фотосурет және бағамен тауарларды каталогқа жылдам жүктеу',
    iconName: 'plus-circle',
    gradient: 'from-emerald-600 to-teal-600',
    defaultEnabled: false,
    value: '1-Click Uploader',
    change: 'Жылдам қойма',
    badge: 'Каталог'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    nameKk: 'Аналитика',
    nameRu: 'Аналитика',
    category: 'KPI & Метрикалар',
    description: 'Тікелей трафик, конверсия воронкасы, сату және орташа чек динамикасы',
    iconName: 'bar-chart-3',
    gradient: 'from-cyan-600 to-blue-600',
    defaultEnabled: true,
    value: 'Real-time 16.4K',
    change: '▲ 15.5%',
    badge: 'Real-time'
  },
  {
    id: 'business-analyze',
    name: 'Business Analyze',
    nameKk: 'Бизнес талдауы',
    nameRu: 'Анализ бизнеса',
    category: 'Қаржы & Аудит',
    description: 'Рентабельділік, таза маржа, тәуекелдердің алдын алу және өсу стратегиясы',
    iconName: 'pie-chart',
    gradient: 'from-amber-600 to-orange-600',
    defaultEnabled: false,
    value: '94/100 Денсаулық',
    change: 'Тұрақты пайда',
    badge: 'Аудит'
  },
  {
    id: 'orders-manager',
    name: 'Orders',
    nameKk: 'Тапсырыстар',
    nameRu: 'Заказы',
    category: 'Сату & Жеткізу',
    description: 'Түскен тапсырыстарды өңдеу, курьер және чек шығару орталығы',
    iconName: 'shopping-bag',
    gradient: 'from-violet-600 to-indigo-600',
    defaultEnabled: true,
    value: '1,224 Тапсырыс',
    change: '▲ 4.4%',
    badge: 'Тікелей ағын'
  }
];

