// Vositalar menyusi ("Qo'shish" oynasi) — real vositalar ro'yxati.
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

