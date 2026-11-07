import { Language } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  showcaseMode: string;
  singlePhoneMode: string;
  fullCanvasMode: string;
  registerButton: string;
  exportReport: string;
  openAI: string;
  dashboard: string;
  dashboardTitle: string;
  export: string;
  addWidget: string;
  addWidgets: string;
  conversionRate: string;
  totalProfit: string;
  activeToday: string;
  pageViews: string;
  visitors: string;
  clicks: string;
  orders: string;
  comparisonLastMonth: string;
  comparisonLastWeek: string;
  comparisonYesterday: string;
  customerBreakdown: string;
  customers: string;
  retailer: string;
  retailers: string;
  distributor: string;
  distributors: string;
  wholesaler: string;
  wholesalers: string;
  enterprise: string;
  dayActive: string;
  peakDayActive: string;
  retentionTitle: string;
  repeatRate: string;
  retentionSub: string;
  retentionTarget: string;
  targetGoal: string;
  retentionDesc: string;
  retentionDetails: string;
  aiCardTitle: string;
  aiCardSubtitle: string;
  aiInputPlaceholder: string;
  aiAskButton: string;
  aiWelcome: string;
  aiOnline: string;
  aiTyping: string;
  liveStatus: string;
  serverStatus: string;
  syncEngine: string;
  navOverview: string;
  navOrders: string;
  navInventory: string;
  navProfile: string;
  navSettings: string;
  profileTitle: string;
  profileSubtitle: string;
  toolsTitle: string;
  toolsSubtitle: string;
  ordersTitle: string;
  ordersSubtitle: string;
  inventoryTitle: string;
  inventorySubtitle: string;
  settingsTitle: string;
  settingsSubtitle: string;
  languageSelect: string;
  activeStore: string;
  filterTitle: string;
  filter: string;
  channels: string;
  salesChannel: string;
  allChannels: string;
  currency: string;
  currencyLabel: string;
  applyFilter: string;
  notificationsTitle: string;
  markAllRead: string;
  noNotifications: string;
  dateRangeTitle: string;
  selectDateRange: string;
  applyDateRange: string;
  authRegisterTitle: string;
  authLoginTitle: string;
  authSubtitle: string;
  tabRegister: string;
  tabLogin: string;
  avatarChoose: string;
  profileAvatar: string;
  fullName: string;
  storeName: string;
  businessType: string;
  businessCategory: string;
  phone: string;
  phoneNumber: string;
  email: string;
  emailAddress: string;
  password: string;
  demoAutofill: string;
  demoFill: string;
  forgotPassword: string;
  submitRegister: string;
  submitLogin: string;
  successTitle: string;
  authSuccess: string;
  successDesc: string;
  authSuccessDesc: string;
  profileAccount: string;
  verifiedMerchant: string;
  edit: string;
  save: string;
  logout: string;
  done: string;
  close: string;
  switchAccount: string;
  searchPlaceholder: string;
  stockStatus: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  price: string;
  action: string;
  totalRevenue: string;
  totalOrders: string;
  averageOrderValue: string;
  customerResponse: string;
  customerResponseSubtitle: string;
  comments: string;
  direct: string;
  autoRules: string;
  open: string;
  modulesCount: string;
  activePlan: string;
  plansTitle: string;
  langAndAuth: string;
  copyId: string;
  starterPlanSubtitle: string;
  screen1Name: string;
  screen2Name: string;
  screen3Name: string;
  screenAllName: string;
  screen1Title: string;
  screen2Title: string;
  screen3Title: string;
  ecosystemSubtitle: string;
  viewShowcase: string;
  viewSingle: string;
  viewFull: string;
  newAccountRegister: string;
  newStoreBranch: string;
  existingLogin: string;
  switchProfile: string;
  signInArrow: string;
  newBadge: string;
  back: string;
  platformLabel: string;
  allOption: string;
  aiActive247: string;
  fastCommentResponse: string;
  pendingCount: string;
  aiSpeedSubtitle: string;
  aiReplyToAll: string;
  searchCommentsPlaceholder: string;
  allFilter: string;
  pendingFilter: string;
  answeredFilter: string;
  statusPending: string;
  statusDirectSent: string;
  statusAnswered: string;
  aiSuggestedReplyTitle: string;
  sendThisReply: string;
  replyInDirect: string;
  writeCustomReply: string;
  sendAction: string;
  searchDirectPlaceholder: string;
  createOrderAction: string;
  todayChat: string;
  quickLabel: string;
  aiComposeBtn: string;
  autoRulesTitle: string;
  autoRulesSubtitle: string;
}

export const translations: Record<Language, Translations> = {
  kk: {
    appName: 'Operon',
    appSubtitle: 'Мобильді Аналитика & AI Платформасы',
    showcaseMode: '3-Экранды Көрініс',
    singlePhoneMode: 'Интерактивті Телефон',
    fullCanvasMode: 'Толық Экран',
    registerButton: 'Тіркелу',
    exportReport: 'Есепті жүктеу',
    openAI: 'AI Көмекшіні ашу',
    dashboard: 'Басқару Тақтасы',
    dashboardTitle: 'Dashboard',
    export: 'Экспорт',
    addWidget: 'Виджет қосу',
    addWidgets: 'Басқару виджеттерін қосу',
    conversionRate: 'Конверсия деңгейі',
    totalProfit: 'Жалпы таза пайда',
    activeToday: 'Бүгінгі белсенділік',
    pageViews: 'Бет қаралымы',
    visitors: 'Келушілер',
    clicks: 'Басулар (Clicks)',
    orders: 'Тапсырыстар саны',
    comparisonLastMonth: 'өткен аймен салыстырғанда',
    comparisonLastWeek: 'өткен аптамен салыстырғанда',
    comparisonYesterday: 'кешегі күнмен салыстырғанда',
    customerBreakdown: 'Клиенттер санаттары',
    customers: 'Клиенттер талдауы',
    retailer: 'Бөлшек саудагерлер',
    retailers: 'Бөлшек саудагерлер',
    distributor: 'Дистрибьюторлар',
    distributors: 'Дистрибьюторлар',
    wholesaler: 'Көтерме саудагерлер',
    wholesalers: 'Көтерме саудагерлер',
    enterprise: 'Ірі кәсіпорындар',
    dayActive: 'Апта күндері бойынша белсенділік',
    peakDayActive: 'Ең белсенді күн: Сейсенбі (8,162)',
    retentionTitle: 'Клиенттерді ұстап қалу',
    repeatRate: 'Тұрақты сатып алушылар үлесі',
    retentionSub: 'Тұрақты сатып алушылар үлесі',
    retentionTarget: 'Мақсатты көрсеткіш: 80%',
    targetGoal: 'Мақсатты жоспар',
    retentionDesc: 'Тұрақты сатып алушылар саны тұрақты өсуде.',
    retentionDetails: 'Толығырақ көру',
    aiCardTitle: 'AI Көмекші',
    aiCardSubtitle: 'Интеллектуалды бизнес-талдаушы',
    aiInputPlaceholder: 'AI-дан сату немесе кіріс туралы сұраңыз...',
    aiAskButton: 'Жіберу',
    aiWelcome: 'Сәлеметсіз бе! Мен сіздің жеке AI бизнес-талдаушыңызбын. Дүкен көрсеткіштері, пайда өсімі, белсенді күндер немесе сатып алушылар туралы сұрағыңызды қойыңыз.',
    aiOnline: 'AI Желіде',
    aiTyping: 'AI жауап дайындауда...',
    liveStatus: 'Жүйенің тікелей күйі',
    serverStatus: 'Сервер күйі',
    syncEngine: 'Синхрондау механизмі',
    navOverview: 'Шолу',
    navOrders: 'Тапсырыстар',
    navInventory: 'Тауарлар',
    navProfile: 'Профиль',
    navSettings: 'Баптаулар',
    profileTitle: 'Менің Профилім',
    profileSubtitle: 'Бизнесті басқару және құралдар',
    toolsTitle: 'Бизнес Құралдары & Модульдер',
    toolsSubtitle: 'Негізгі басқару модульдері',
    ordersTitle: 'Тапсырыстар тізімі',
    ordersSubtitle: 'Барлық белсенді және орындалған транзакциялар',
    inventoryTitle: 'Қойма & Тауарлар',
    inventorySubtitle: 'Қалдық көлемі мен бағалар талдауы',
    settingsTitle: 'Қолданба баптаулары',
    settingsSubtitle: 'Operon v2.5',
    languageSelect: 'Тілді таңдау / Выбор языка',
    activeStore: 'Белсенді дүкен',
    filterTitle: 'Сүзгі & Сегментация',
    filter: 'Сүзгі & Баптаулар',
    channels: 'Сату арналары',
    salesChannel: 'Сату арнасы',
    allChannels: 'Барлық арналар',
    currency: 'Валюта',
    currencyLabel: 'Көрсетілетін валюта',
    applyFilter: 'Сүзгіні қолдану',
    notificationsTitle: 'Хабарламалар',
    markAllRead: 'Барлығын оқылды деп белгілеу',
    noNotifications: 'Жаңа хабарламалар жоқ',
    dateRangeTitle: 'Уақыт аралығын таңдау',
    selectDateRange: 'Күндерді таңдаңыз',
    applyDateRange: 'Қолдану',
    authRegisterTitle: 'Operon-ға тіркелу',
    authLoginTitle: 'Operon жүйесіне кіру',
    authSubtitle: 'Мобильді аналитика және AI басқару',
    tabRegister: 'Тіркелу',
    tabLogin: 'Кіру',
    avatarChoose: 'Профиль аватары (Таңдаңыз)',
    profileAvatar: 'Профиль аватары',
    fullName: 'Аты-жөні',
    storeName: 'Дүкен немесе бренд атауы',
    businessType: 'Бизнес санаты (Сегмент)',
    businessCategory: 'Бизнес санаты',
    phone: 'Телефон нөмірі',
    phoneNumber: 'Телефон нөмірі',
    email: 'Электрондық пошта (Email)',
    emailAddress: 'Электрондық пошта (Email)',
    password: 'Құпия сөз',
    demoAutofill: 'Демо мәліметтерді толтыру',
    demoFill: 'Демо толтыру',
    forgotPassword: 'Құпия сөзді ұмыттыңыз ба?',
    submitRegister: 'Тіркелуді аяқтау',
    submitLogin: 'Жүйеге кіру',
    successTitle: 'Сәтті расталды!',
    authSuccess: 'Сәтті расталды!',
    successDesc: 'Operon басқару тақтасына қош келдіңіз. Деректеріңіз жаңартылды.',
    authSuccessDesc: 'Operon басқару тақтасына қош келдіңіз. Деректеріңіз сәтті жаңартылды.',
    profileAccount: 'Operon Профилі',
    verifiedMerchant: 'Расталған корпоративтік сатушы',
    edit: 'Өңдеу',
    save: 'Сақтау',
    logout: 'Шығу',
    done: 'Дайын',
    close: 'Жабу',
    switchAccount: 'Жаңа аккаунт / Тіркелу',
    searchPlaceholder: 'Іздеу...',
    stockStatus: 'Қойма күйі',
    inStock: 'Қоймада бар',
    lowStock: 'Аз қалды',
    outOfStock: 'Таусылды',
    price: 'Бағасы',
    action: 'Әрекет',
    totalRevenue: 'Жалпы кіріс',
    totalOrders: 'Тапсырыстар',
    averageOrderValue: 'Орташа чек мәні',
    customerResponse: 'Клиенттерге жауап',
    customerResponseSubtitle: 'Пікірлер және Direct жауаптары',
    comments: 'Пікірлер',
    direct: 'Директ',
    autoRules: 'Авто-ережелер',
    open: 'Ашу',
    modulesCount: 'модуль',
    activePlan: 'Белсенді',
    plansTitle: 'Тарифтер',
    langAndAuth: 'Тіл & Тіркелу',
    copyId: 'ID көшіріп алу',
    starterPlanSubtitle: '$15.99 / ай • Шексіз тапсырыстар & AI талдау',
    screen1Name: '1: Басқару',
    screen2Name: '2: Пайда',
    screen3Name: '3: AI Көмекші',
    screenAllName: 'Барлығы',
    screen1Title: '1-Экран: Басқару және Құралдар',
    screen2Title: '2-Экран: Пайда және Клиенттер',
    screen3Title: '3-Экран: AI Көмекші & Клиенттер',
    ecosystemSubtitle: 'Кәсіпкерлер мен бизнес иелеріне арналған толық экожүйе',
    viewShowcase: '3-Экранды Панорама',
    viewSingle: 'Мобильді Экран',
    viewFull: 'Үлкен Тақта',
    newAccountRegister: 'Жаңа аккаунт / Тіркелу',
    newStoreBranch: 'Жаңа дүкен немесе филиал ашу',
    existingLogin: 'Бар аккаунтқа кіру',
    switchProfile: 'Басқа профильге ауысу',
    signInArrow: 'Кіру →',
    newBadge: '+ Жаңа',
    back: 'Артқа',
    platformLabel: 'Желі:',
    allOption: 'Барлығы',
    aiActive247: 'AI 24/7 Белсенді',
    fastCommentResponse: 'Пікірлерге жедел жауап беру',
    pendingCount: 'күтілуде',
    aiSpeedSubtitle: 'Орташа AI жауап беру жылдамдығы: 12 секунд • Конверсия 3 есе жоғары',
    aiReplyToAll: 'Барлығына AI жауап берсін',
    searchCommentsPlaceholder: 'Пікірлерден немесе клиент атынан іздеу...',
    allFilter: 'Барлығы',
    pendingFilter: 'Күтілуде',
    answeredFilter: 'Жауап берілді',
    statusPending: 'Күтілуде',
    statusDirectSent: 'Direct-ке жіберілді',
    statusAnswered: 'Жауап берілді',
    aiSuggestedReplyTitle: 'AI ұсынған жауап:',
    sendThisReply: 'Осыны жіберу',
    replyInDirect: 'Direct-ке жазу',
    writeCustomReply: 'Өз жауабымды жазу',
    sendAction: 'Жіберу',
    searchDirectPlaceholder: 'Клиент атын немесе хабарламаны іздеу...',
    createOrderAction: 'Тапсырыс ашу',
    todayChat: 'Бүгінгі сұхбат',
    quickLabel: 'Жедел:',
    aiComposeBtn: '⚡ AI жазсын',
    autoRulesTitle: 'AI Авто-жауап ережелері',
    autoRulesSubtitle: 'Пікірлер мен Direct ағынын 100% автоматтандыру'
  },
  ru: {
    appName: 'Operon',
    appSubtitle: 'Мобильная аналитика и AI платформа',
    showcaseMode: '3 Экрана',
    singlePhoneMode: 'Интерактивный телефон',
    fullCanvasMode: 'Полный экран',
    registerButton: 'Регистрация',
    exportReport: 'Скачать отчет',
    openAI: 'Открыть AI Аналитик',
    dashboard: 'Панель управления',
    dashboardTitle: 'Панель управления',
    export: 'Экспорт',
    addWidget: 'Добавить виджет',
    addWidgets: 'Добавить виджеты',
    conversionRate: 'Конверсия',
    totalProfit: 'Общая чистая прибыль',
    activeToday: 'Активность сегодня',
    pageViews: 'Просмотры страниц',
    visitors: 'Посетители',
    clicks: 'Клики',
    orders: 'Всего заказов',
    comparisonLastMonth: 'по сравнению с прошлым месяцем',
    comparisonLastWeek: 'по сравнению с прошлой неделей',
    comparisonYesterday: 'по сравнению со вчерашним днем',
    customerBreakdown: 'Сегменты клиентов',
    customers: 'Сегменты клиентов',
    retailer: 'Розничные продавцы',
    retailers: 'Розничные продавцы',
    distributor: 'Дистрибьюторы',
    distributors: 'Дистрибьюторы',
    wholesaler: 'Оптовики',
    wholesalers: 'Оптовики',
    enterprise: 'Крупные предприятия',
    dayActive: 'Активность по дням недели',
    peakDayActive: 'Пиковый день: Вторник (8,162)',
    retentionTitle: 'Удержание клиентов',
    repeatRate: 'Доля постоянных покупателей',
    retentionSub: 'Доля постоянных покупателей',
    retentionTarget: 'Целевой уровень: 80%',
    targetGoal: 'Целевой показатель',
    retentionDesc: 'Доля постоянных покупателей стабильно растет.',
    retentionDetails: 'Подробнее',
    aiCardTitle: 'AI Ассистент',
    aiCardSubtitle: 'Интеллектуальный бизнес-аналитик',
    aiInputPlaceholder: 'Спросите у AI о прибыли, трендах...',
    aiAskButton: 'Отправить',
    aiWelcome: 'Здравствуйте! Я ваш персональный бизнес AI-аналитик. Задайте любой вопрос о прибыли магазина, динамике продаж, активности клиентов или остатках товаров.',
    aiOnline: 'AI в сети',
    aiTyping: 'AI готовит ответ...',
    liveStatus: 'Статус системы в реальном времени',
    serverStatus: 'Статус сервера',
    syncEngine: 'Механизм синхронизации',
    navOverview: 'Обзор',
    navOrders: 'Заказы',
    navInventory: 'Товары',
    navProfile: 'Профиль',
    navSettings: 'Настройки',
    profileTitle: 'Мой Профиль',
    profileSubtitle: 'Управление бизнесом и инструменты',
    toolsTitle: 'Бизнес Инструменты и Модули',
    toolsSubtitle: 'Ключевые модули управления',
    ordersTitle: 'Управление заказами',
    ordersSubtitle: 'История транзакций и статус выполнения',
    inventoryTitle: 'Склад и Товары',
    inventorySubtitle: 'Аналитика остатков и стоимость позиций',
    settingsTitle: 'Настройки приложения',
    settingsSubtitle: 'Operon v2.5',
    languageSelect: 'Язык / Language',
    activeStore: 'Текущий магазин',
    filterTitle: 'Фильтр и Сегментация',
    filter: 'Настройки фильтрации',
    channels: 'Каналы продаж',
    salesChannel: 'Канал продаж',
    allChannels: 'Все каналы',
    currency: 'Валюта',
    currencyLabel: 'Валюта отображения',
    applyFilter: 'Применить фильтр',
    notificationsTitle: 'Уведомления',
    markAllRead: 'Отметить все прочитанными',
    noNotifications: 'Нет новых уведомлений',
    dateRangeTitle: 'Выбор периода дат',
    selectDateRange: 'Выбор периода дат',
    applyDateRange: 'Применить период',
    authRegisterTitle: 'Регистрация в Operon',
    authLoginTitle: 'Вход в аккаунт Operon',
    authSubtitle: 'Мобильная аналитика и AI управление',
    tabRegister: 'Регистрация',
    tabLogin: 'Войти',
    avatarChoose: 'Аватар профиля (Выберите)',
    profileAvatar: 'Аватар профиля',
    fullName: 'Имя и Фамилия',
    storeName: 'Название магазина / бренда',
    businessType: 'Категория бизнеса',
    businessCategory: 'Категория бизнеса',
    phone: 'Номер телефона',
    phoneNumber: 'Номер телефона',
    email: 'Электронная почта (Email)',
    emailAddress: 'Электронная почта (Email)',
    password: 'Пароль',
    demoAutofill: 'Заполнить демо-данными',
    demoFill: 'Демо заполнение',
    forgotPassword: 'Забыли пароль?',
    submitRegister: 'Зарегистрироваться',
    submitLogin: 'Войти в систему',
    successTitle: 'Успешно подтверждено!',
    authSuccess: 'Успешно подтверждено!',
    successDesc: 'Добро пожаловать в панель управления Operon. Ваши данные обновлены.',
    authSuccessDesc: 'Добро пожаловать в панель управления Operon. Ваши данные успешно обновлены.',
    profileAccount: 'Профиль Operon',
    verifiedMerchant: 'Верифицированный продавец Enterprise',
    edit: 'Редактировать',
    save: 'Сохранить',
    logout: 'Выйти',
    done: 'Готово',
    close: 'Закрыть',
    switchAccount: 'Сменить аккаунт / Регистрация',
    searchPlaceholder: 'Поиск товаров или заказов...',
    stockStatus: 'Наличие на складе',
    inStock: 'В наличии',
    lowStock: 'Мало',
    outOfStock: 'Нет в наличии',
    price: 'Цена',
    action: 'Действие',
    totalRevenue: 'Общая выручка',
    totalOrders: 'Всего заказов',
    averageOrderValue: 'Средний чек',
    customerResponse: 'Ответ клиентам',
    customerResponseSubtitle: 'Ответы на комментарии и Direct',
    comments: 'Комментарии',
    direct: 'Директ',
    autoRules: 'Авто-правила',
    open: 'Открыть',
    modulesCount: 'модулей',
    activePlan: 'Активен',
    plansTitle: 'Тарифы',
    langAndAuth: 'Язык и Вход',
    copyId: 'Копировать ID',
    starterPlanSubtitle: '$15.99 / мес • Безлимитные заказы и AI аналитика',
    screen1Name: '1: Панель',
    screen2Name: '2: Прибыль',
    screen3Name: '3: AI Ассистент',
    screenAllName: 'Все',
    screen1Title: 'Экран 1: Панель и Инструменты',
    screen2Title: 'Экран 2: Прибыль и Клиенты',
    screen3Title: 'Экран 3: AI Ассистент',
    ecosystemSubtitle: 'Полная экосистема управления для предпринимателей и бизнеса',
    viewShowcase: '3-Экрана Панорама',
    viewSingle: 'Мобильный Экран',
    viewFull: 'Большая Доска',
    newAccountRegister: 'Новый аккаунт / Регистрация',
    newStoreBranch: 'Открыть новый магазин или филиал',
    existingLogin: 'Вход в существующий аккаунт',
    switchProfile: 'Переключиться на другой профиль',
    signInArrow: 'Войти →',
    newBadge: '+ Новый',
    back: 'Назад',
    platformLabel: 'Платформа:',
    allOption: 'Все',
    aiActive247: 'AI 24/7 Активен',
    fastCommentResponse: 'Быстрый ответ на комментарии',
    pendingCount: 'ожидает',
    aiSpeedSubtitle: 'Средняя скорость AI ответа: 12 сек • Конверсия в 3 раза выше',
    aiReplyToAll: 'AI ответить на все',
    searchCommentsPlaceholder: 'Поиск комментариев или клиентов...',
    allFilter: 'Все',
    pendingFilter: 'Ожидают',
    answeredFilter: 'Отвечено',
    statusPending: 'Ожидает',
    statusDirectSent: 'Отправлено в Direct',
    statusAnswered: 'Отвечено',
    aiSuggestedReplyTitle: 'Рекомендованный ответ AI:',
    sendThisReply: 'Отправить этот ответ',
    replyInDirect: 'Написать в Direct',
    writeCustomReply: 'Написать свой ответ',
    sendAction: 'Отправить',
    searchDirectPlaceholder: 'Поиск клиентов или сообщений...',
    createOrderAction: 'Создать заказ',
    todayChat: 'Сегодняшняя беседа',
    quickLabel: 'Быстро:',
    aiComposeBtn: '⚡ Написать с AI',
    autoRulesTitle: 'Правила авто-ответа AI',
    autoRulesSubtitle: '100% автоматизация комментариев и Direct'
  }
};
