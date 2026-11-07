import { Language, MetricItem, CustomerSegment, DayActiveData, ProfitDataPoint, NotificationItem } from '../types';

export const getLocalizedMetrics = (lang: Language): MetricItem[] => {
  if (lang === 'ru') {
    return [
      {
        id: 'page-views',
        label: 'Просмотры',
        value: '16,431',
        numericValue: 16431,
        change: '▲ 15,5%',
        isPositive: true,
        comparisonText: 'к прошлому периоду',
        iconName: 'eye'
      },
      {
        id: 'visitors',
        label: 'Посетители',
        value: '6,225',
        numericValue: 6225,
        change: '▲ 8,4%',
        isPositive: true,
        comparisonText: 'к прошлому периоду',
        iconName: 'users'
      },
      {
        id: 'clicks',
        label: 'Клики',
        value: '2,832',
        numericValue: 2832,
        change: '▼ 10,5%',
        isPositive: false,
        comparisonText: 'к прошлому периоду',
        iconName: 'mouse-pointer'
      },
      {
        id: 'orders',
        label: 'Заказы',
        value: '1,224',
        numericValue: 1224,
        change: '▲ 4,4%',
        isPositive: true,
        comparisonText: 'к прошлому периоду',
        iconName: 'mail'
      }
    ];
  }

  // Default: kk (Kazakh)
  return [
    {
      id: 'page-views',
      label: 'Көрулер саны',
      value: '16,431',
      numericValue: 16431,
      change: '▲ 15,5%',
      isPositive: true,
      comparisonText: 'өткен кезеңмен салыстырғанда',
      iconName: 'eye'
    },
    {
      id: 'visitors',
      label: 'Келушілер',
      value: '6,225',
      numericValue: 6225,
      change: '▲ 8,4%',
      isPositive: true,
      comparisonText: 'өткен кезеңмен салыстырғанда',
      iconName: 'users'
    },
    {
      id: 'clicks',
      label: 'Басулар (Clicks)',
      value: '2,832',
      numericValue: 2832,
      change: '▼ 10,5%',
      isPositive: false,
      comparisonText: 'өткен кезеңмен салыстырғанда',
      iconName: 'mouse-pointer'
    },
    {
      id: 'orders',
      label: 'Тапсырыстар',
      value: '1,224',
      numericValue: 1224,
      change: '▲ 4,4%',
      isPositive: true,
      comparisonText: 'өткен кезеңмен салыстырғанда',
      iconName: 'mail'
    }
  ];
};

export const getLocalizedCustomerSegments = (lang: Language): CustomerSegment[] => {
  if (lang === 'ru') {
    return [
      {
        id: 'retailers',
        name: 'Розничные продавцы',
        count: '2,884',
        numericCount: 2884,
        color: '#2563eb',
        bgColor: '#eff6ff',
        percentage: 59.1,
        icon: 'store'
      },
      {
        id: 'distributors',
        name: 'Дистрибьюторы',
        count: '1,432',
        numericCount: 1432,
        color: '#10b981',
        bgColor: '#ecfdf5',
        percentage: 29.4,
        icon: 'network'
      },
      {
        id: 'wholesalers',
        name: 'Оптовики',
        count: '562',
        numericCount: 562,
        color: '#f97316',
        bgColor: '#fff7ed',
        percentage: 11.5,
        icon: 'package'
      }
    ];
  }

  // Default: kk (Kazakh)
  return [
    {
      id: 'retailers',
      name: 'Бөлшек саудагерлер',
      count: '2,884',
      numericCount: 2884,
      color: '#2563eb',
      bgColor: '#eff6ff',
      percentage: 59.1,
      icon: 'store'
    },
    {
      id: 'distributors',
      name: 'Дистрибьюторлар',
      count: '1,432',
      numericCount: 1432,
      color: '#10b981',
      bgColor: '#ecfdf5',
      percentage: 29.4,
      icon: 'network'
    },
    {
      id: 'wholesalers',
      name: 'Көтерме саудагерлер',
      count: '562',
      numericCount: 562,
      color: '#f97316',
      bgColor: '#fff7ed',
      percentage: 11.5,
      icon: 'package'
    }
  ];
};

export const getLocalizedDayActivity = (lang: Language): DayActiveData[] => {
  if (lang === 'ru') {
    return [
      { day: 'Воскресенье', shortDay: 'Вс', count: 4210, displayCount: '4,210', isPeak: false },
      { day: 'Понедельник', shortDay: 'Пн', count: 5680, displayCount: '5,680', isPeak: false },
      { day: 'Вторник', shortDay: 'Вт', count: 8162, displayCount: '8,162', isPeak: true },
      { day: 'Среда', shortDay: 'Ср', count: 3920, displayCount: '3,920', isPeak: false },
      { day: 'Четверг', shortDay: 'Чт', count: 2840, displayCount: '2,840', isPeak: false },
      { day: 'Пятница', shortDay: 'Пт', count: 6150, displayCount: '6,150', isPeak: false },
      { day: 'Суббота', shortDay: 'Сб', count: 7420, displayCount: '7,420', isPeak: false }
    ];
  }

  // Default: kk (Kazakh)
  return [
    { day: 'Жексенбі', shortDay: 'Жек', count: 4210, displayCount: '4,210', isPeak: false },
    { day: 'Дүйсенбі', shortDay: 'Дүй', count: 5680, displayCount: '5,680', isPeak: false },
    { day: 'Сейсенбі', shortDay: 'Сей', count: 8162, displayCount: '8,162', isPeak: true },
    { day: 'Сәрсенбі', shortDay: 'Сәр', count: 3920, displayCount: '3,920', isPeak: false },
    { day: 'Бейсенбі', shortDay: 'Бей', count: 2840, displayCount: '2,840', isPeak: false },
    { day: 'Жұма', shortDay: 'Жұм', count: 6150, displayCount: '6,150', isPeak: false },
    { day: 'Сенбі', shortDay: 'Сен', count: 7420, displayCount: '7,420', isPeak: false }
  ];
};

export const getLocalizedNotifications = (lang: Language): NotificationItem[] => {
  if (lang === 'ru') {
    return [
      {
        id: '1',
        title: 'Получен крупный заказ: $14,250 от MegaMart Retail',
        time: '12 минут назад',
        unread: true,
        type: 'order'
      },
      {
        id: '2',
        title: 'Доля постоянных клиентов достигла 68% (+4.2%)',
        time: '2 часа назад',
        unread: true,
        type: 'retention'
      },
      {
        id: '3',
        title: 'Зафиксирован пик активности во вторник: 8,162 сессии',
        time: 'Вчера',
        unread: false,
        type: 'alert'
      },
      {
        id: '4',
        title: 'Ежемесячный отчет по складским остаткам готов',
        time: '2 дня назад',
        unread: false,
        type: 'system'
      }
    ];
  }

  // Default: kk (Kazakh)
  return [
    {
      id: '1',
      title: 'Жаңа ірі тапсырыс: MegaMart Retail-ден $14,250',
      time: '12 минут бұрын',
      unread: true,
      type: 'order'
    },
    {
      id: '2',
      title: 'Тұрақты тұтынушылар үлесі 68%-ға жетті (+4.2%)',
      time: '2 сағат бұрын',
      unread: true,
      type: 'retention'
    },
    {
      id: '3',
      title: 'Сейсенбі күні ең жоғары белсенділік тіркелді: 8,162 сессия',
      time: 'Кеше',
      unread: false,
      type: 'alert'
    },
    {
      id: '4',
      title: 'Қоймадағы тауарлар бойынша айлық есеп дайын',
      time: '2 күн бұрын',
      unread: false,
      type: 'system'
    }
  ];
};
