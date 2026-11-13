import React, { useEffect, useState } from 'react';
import { Clock, MessageCircle, ShoppingBag } from 'lucide-react';
import { DayActiveData, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ActivityDetail } from '../lib/api';
import { formatMoney } from '../lib/format';

interface DayActiveChartProps {
  data: DayActiveData[];
  /** Kun bo'yicha tafsilot (buyurtma / so'rov / xabar / tushum) va soatlar — routers/dashboard.py `activity`. */
  detail?: ActivityDetail | null;
  currency?: string;
  onOpenMenu?: () => void;
}

const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL: Record<Language, string[]> = {
  ru: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
  kk: ['дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі', 'жексенбі'],
};

// Hafta kunlari bo'yicha faollik: buyurtmalar + mijoz xabarlari (real). Tanlangan kun uchun tafsilot,
// eng faol kun va soat — kontentni qachon chiqarish foydaliroq ekanini ko'rsatadi.
export const DayActiveChart: React.FC<DayActiveChartProps> = ({ data, detail, currency = 'KZT' }) => {
  const { t, language } = useLanguage();
  const ru = language !== 'kk';
  const peak = data.find((d) => d.isPeak)?.shortDay || 'Mon';
  const [selectedDay, setSelectedDay] = useState<string>(peak);
  useEffect(() => { setSelectedDay(peak); }, [peak]);

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  const idx = SHORT.indexOf(selectedDay);
  const w = detail?.weekday?.[idx];

  const label = (shortDay: string) => {
    const dayMap: Record<string, Record<Language, string>> = {
      Sun: { kk: 'Жек', ru: 'Вс' }, Mon: { kk: 'Дүй', ru: 'Пн' }, Tue: { kk: 'Сей', ru: 'Вт' },
      Wed: { kk: 'Сәр', ru: 'Ср' }, Thu: { kk: 'Бей', ru: 'Чт' }, Fri: { kk: 'Жұм', ru: 'Пт' }, Sat: { kk: 'Сен', ru: 'Сб' },
    };
    return dayMap[shortDay]?.[language] || shortDay;
  };

  const hours = detail?.hours || [];
  const hMax = Math.max(...hours, 1);
  const bh = detail?.best_hour;

  return (
    <div id="card-most-day-active" className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[14px] font-bold text-slate-900">{t.dayActive}</span>
        <span className="text-[11px] text-slate-400">{ru ? 'заказы + сообщения' : 'тапсырыс + хабарлама'}</span>
      </div>

      {total === 0 ? (
        <p className="text-[12px] text-slate-400 py-8 text-center leading-snug">
          {ru ? 'Пока нет заказов и сообщений за этот период.' : 'Бұл кезеңде тапсырыс пен хабарлама әзірге жоқ.'}
        </p>
      ) : (
        <>
          <div className="relative pt-8 pb-1">
            <div className="flex items-end justify-between gap-2 h-28 px-1">
              {data.map((item) => {
                const isSelected = selectedDay === item.shortDay;
                const heightPercent = item.count ? Math.max(14, (item.count / maxVal) * 100) : 4;
                return (
                  <div key={item.shortDay} onClick={() => setSelectedDay(item.shortDay)}
                    className="relative flex-1 h-full flex flex-col items-center justify-end cursor-pointer group">
                    {isSelected && (
                      <span className="absolute -top-6 text-[11px] font-bold text-slate-800 leading-none">{item.displayCount}</span>
                    )}
                    <div className={`w-4.5 rounded-full transition-all duration-300 ${
                      isSelected ? 'bg-blue-600 ring-2 ring-blue-100' : item.isPeak ? 'bg-blue-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                      style={{ height: `${heightPercent}%` }} />
                    <span className={`text-[11px] mt-2 font-medium ${isSelected ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                      {label(item.shortDay)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {w && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
              <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-emerald-600" />{ru ? 'продаж' : 'сатылым'}: <b>{w.orders}</b></span>
              <span>{ru ? 'запросов' : 'сұрау'}: <b>{w.inquiries}</b></span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-600" />{ru ? 'сообщений' : 'хабарлама'}: <b>{w.messages}</b></span>
              {w.revenue > 0 && <span><b>{formatMoney(w.revenue, currency, language)}</b></span>}
            </div>
          )}

          {hours.some((h) => h > 0) && (
            <div className="mt-3">
              <div className="flex items-end gap-[2px] h-9">
                {hours.map((h, i) => (
                  <div key={i} title={`${i}:00 — ${h}`}
                    className={`flex-1 rounded-sm ${i === bh ? 'bg-blue-600' : h ? 'bg-blue-200' : 'bg-slate-100'}`}
                    style={{ height: `${h ? Math.max(12, (h / hMax) * 100) : 6}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[9.5px] text-slate-400 mt-0.5"><span>0</span><span>6</span><span>12</span><span>18</span><span>23</span></div>
            </div>
          )}

          {detail?.best_day != null && (
            <p className="mt-2 text-[11.5px] text-slate-600 flex items-start gap-1.5 leading-snug">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {ru ? 'Клиенты активнее всего в ' : 'Клиенттер ең белсенді күн — '}<b>{FULL[language][detail.best_day]}</b>
                {bh != null ? (ru ? <>, около <b>{bh}:00</b></> : <>, шамамен <b>{bh}:00</b></>) : null}
                {ru ? '. Публикуйте посты и отвечайте быстрее в это время.' : '. Осы уақытта пост шығарып, тезірек жауап беріңіз.'}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
};
