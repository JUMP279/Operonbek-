// Backend /dashboard javobini mavjud UI komponentlari kutgan shaklga aylantiradi.
// Bu yerda HECH QANDAY soxta qiymat yo'q — hamma narsa DashboardData'dan.

import { CustomerSegment, DayActiveData, MetricItem, NotificationItem, ProfitDataPoint } from '../types';
import { DashboardData } from './api';
import { formatChange, formatDay, formatMoney, formatNumber, timeAgo } from './format';

export function buildMetrics(d: DashboardData, lang: string): MetricItem[] {
  const ru = lang !== 'kk';
  const m = d.metrics;
  const vs = ru ? 'к прошлому периоду' : 'өткен кезеңмен';
  const card = (
    id: string,
    label: string,
    value: string,
    numeric: number,
    change: number | null,
    icon: MetricItem['iconName'],
    note?: string,
  ): MetricItem => {
    const ch = formatChange(change);
    return {
      id,
      label,
      value,
      numericValue: numeric,
      change: ch ? ch.text : '',
      isPositive: ch ? ch.positive : true,
      comparisonText: note || (ch ? vs : ru ? 'нет данных за прошлый период' : 'өткен кезең деректері жоқ'),
      iconName: icon,
    };
  };
  return [
    card('revenue', ru ? 'Выручка' : 'Түсім', formatMoney(m.revenue, d.currency, lang), m.revenue, m.revenue_change, 'dollar-sign'),
    card('orders', ru ? 'Продажи' : 'Сатылымдар', formatNumber(m.orders, lang), m.orders, m.orders_change, 'shopping-cart'),
    card(
      'inquiries',
      ru ? 'Запросы' : 'Сұраулар',
      formatNumber(m.inquiries, lang),
      m.inquiries,
      m.inquiries_change,
      'mouse-pointer',
      m.potential_revenue
        ? `${ru ? 'потенциал' : 'әлеует'} ${formatMoney(m.potential_revenue, d.currency, lang)}`
        : undefined,
    ),
    card('customers', ru ? 'Клиенты' : 'Клиенттер', formatNumber(m.customers, lang), m.customers, m.customers_change, 'users'),
  ];
}

/** Kunlik qatorni grafik uchun ~12 nuqtagacha guruhlaydi. */
export function buildRevenueSeries(d: DashboardData, lang: string): ProfitDataPoint[] {
  const s = d.series;
  if (s.length === 0) return [];
  const bucket = Math.max(1, Math.ceil(s.length / 12));
  const out: ProfitDataPoint[] = [];
  for (let i = 0; i < s.length; i += bucket) {
    const part = s.slice(i, i + bucket);
    const revenue = part.reduce((a, x) => a + x.revenue, 0);
    out.push({
      date: part[0].date,
      displayDate: formatDay(part[0].date, lang),
      profit: revenue,
      revenue,
      orders: part.reduce((a, x) => a + x.orders, 0),
    });
  }
  return out;
}

export function buildSegments(d: DashboardData, lang: string): CustomerSegment[] {
  const ru = lang !== 'kk';
  const { returning, new: fresh, inquiry_only } = d.segments;
  const total = returning + fresh + inquiry_only;
  const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  return [
    {
      id: 'returning',
      name: ru ? 'Постоянные покупатели' : 'Тұрақты сатып алушылар',
      count: formatNumber(returning, lang),
      numericCount: returning,
      color: '#2563eb',
      bgColor: '#eff6ff',
      percentage: pct(returning),
      icon: 'store',
    },
    {
      id: 'new',
      name: ru ? 'Новые покупатели' : 'Жаңа сатып алушылар',
      count: formatNumber(fresh, lang),
      numericCount: fresh,
      color: '#10b981',
      bgColor: '#ecfdf5',
      percentage: pct(fresh),
      icon: 'network',
    },
    {
      id: 'inquiry_only',
      name: ru ? 'Только интересовались' : 'Тек қызыққандар',
      count: formatNumber(inquiry_only, lang),
      numericCount: inquiry_only,
      color: '#f97316',
      bgColor: '#fff7ed',
      percentage: pct(inquiry_only),
      icon: 'package',
    },
  ];
}

const DAYS_EN = [
  ['Monday', 'Mon'],
  ['Tuesday', 'Tue'],
  ['Wednesday', 'Wed'],
  ['Thursday', 'Thu'],
  ['Friday', 'Fri'],
  ['Saturday', 'Sat'],
  ['Sunday', 'Sun'],
];

export function buildWeekdays(d: DashboardData, lang: string): DayActiveData[] {
  const counts = d.weekday_activity.length === 7 ? d.weekday_activity : [0, 0, 0, 0, 0, 0, 0];
  const peak = Math.max(...counts);
  return counts.map((c, i) => ({
    day: DAYS_EN[i][0],
    shortDay: DAYS_EN[i][1],
    count: c,
    displayCount: formatNumber(c, lang),
    isPeak: peak > 0 && c === peak,
  }));
}

export function buildNotifications(d: DashboardData, lang: string): NotificationItem[] {
  const map = (type: string | null): NotificationItem['type'] => {
    const t = (type || '').toLowerCase();
    if (t.includes('order') || t.includes('sotuv') || t.includes('buyurtma')) return 'order';
    if (t.includes('retention') || t.includes('mijoz')) return 'retention';
    if (t.includes('alert') || t.includes('warn') || t.includes('xato')) return 'alert';
    return 'system';
  };
  return d.notifications.map((n) => ({
    id: n.id,
    title: n.title || n.message || '',
    time: timeAgo(n.created_at, lang),
    unread: !n.is_read,
    type: map(n.type),
  }));
}

/** AI yordamchiga beriladigan qisqa kontekst (haqiqiy raqamlar). */
export function buildStoreContext(d: DashboardData | null, storeName: string, rangeText: string, lang: string) {
  if (!d) return { storeName, dateRange: rangeText };
  const m = d.metrics;
  return {
    storeName: d.business.brand_name || storeName,
    dateRange: rangeText,
    totalProfit: formatMoney(m.revenue, d.currency, lang),
    orders: String(m.orders),
    inquiries: String(m.inquiries),
    customers: String(m.customers),
    activeProducts: m.products_active,
    businessId: d.business.id,
    currency: d.currency,
  };
}
