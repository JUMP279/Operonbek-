import React from 'react';
import { X, Target, Users, RefreshCw, AlertTriangle, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { RetentionDetail } from '../lib/api';
import { formatMoney } from '../lib/format';

interface RetentionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate?: number;
  target?: number;
  detail?: RetentionDetail | null;
  currency?: string;
}

// Ushlab qolish tafsiloti — HAMMASI real (routers/dashboard.py `retention_detail`). Avval bu oynada
// o'ylab topilgan inglizcha raqamlar turardi ("44.8% re-order", "Churn 3.2%").
export const RetentionDetailsModal: React.FC<RetentionDetailsModalProps> = ({
  isOpen, onClose, rate = 0, target = 40, detail, currency = 'KZT',
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;
  const ru = language !== 'kk';
  const d = detail;
  const basis = d?.basis || 'none';
  const diff = d && d.prev_rate != null ? d.rate - d.prev_rate : null;

  const Row: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 text-[12.5px] text-slate-700">
      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      <b className="text-slate-900">{value}</b>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.retentionTitle}</h3>
              <p className="text-xs text-slate-400">
                {basis === 'sales' ? (ru ? 'По покупкам за выбранный период' : 'Таңдалған кезеңдегі сатып алулар бойынша')
                  : basis === 'chats' ? (ru ? 'Покупок ещё нет — считаем по перепискам' : 'Сатып алу әлі жоқ — хат алмасу бойынша')
                  : (ru ? 'Данных пока нет' : 'Деректер әзірге жоқ')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-slate-900">{rate}%</span>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {basis === 'sales' ? (ru ? 'покупателей вернулись' : 'сатып алушы қайта келді')
                  : basis === 'chats' ? (ru ? 'клиентов написали снова' : 'клиент қайта жазды') : '—'}
                {diff != null && diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff} ${ru ? 'п.п. к прошлому периоду' : 'п.т. өткен кезеңге'})` : ''}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">{t.targetGoal}</span>
              <div className="text-sm font-bold text-blue-600">{target}%</div>
            </div>
          </div>

          {basis === 'none' && (
            <p className="text-[12px] text-slate-500 bg-slate-50 rounded-xl p-3 leading-snug">
              {ru ? 'Показатель появится после первых заказов или переписок с клиентами. Подключите Kaspi / Wildberries в разделе «Заказы» и Instagram / Telegram в профиле.'
                : 'Көрсеткіш алғашқы тапсырыстар немесе хат алмасудан кейін пайда болады. «Тапсырыстар» бөлімінде Kaspi / Wildberries, профильде Instagram / Telegram қосыңыз.'}
            </p>
          )}

          {d && basis !== 'none' && (
            <div className="space-y-2">
              {basis === 'sales' && (
                <>
                  <Row icon={<Users className="w-3.5 h-3.5" />} label={ru ? 'Покупателей за период' : 'Кезеңдегі сатып алушылар'} value={d.buyers} />
                  <Row icon={<RefreshCw className="w-3.5 h-3.5" />} label={ru ? 'Из них вернулись / новые' : 'Қайта келген / жаңа'} value={`${d.returning_buyers} / ${d.new_buyers}`} />
                </>
              )}
              {d.total_buyers > 0 && d.repeat_30d_pct != null && (
                <Row icon={<RefreshCw className="w-3.5 h-3.5" />} label={ru ? 'Купили повторно в течение 30 дней' : '30 күн ішінде қайта сатып алды'} value={`${d.repeat_30d_pct}%`} />
              )}
              {d.avg_days_between != null && (
                <Row icon={<RefreshCw className="w-3.5 h-3.5" />} label={ru ? 'В среднем между покупками' : 'Сатып алулар арасы орташа'} value={`${d.avg_days_between} ${ru ? 'дн.' : 'күн'}`} />
              )}
              {(d.at_risk > 0 || d.lost > 0) && (
                <Row icon={<AlertTriangle className="w-3.5 h-3.5" />} label={ru ? 'Давно не покупали (30–90 дн. / больше 90)' : 'Көптен сатып алмаған (30–90 күн / 90-нан көп)'} value={`${d.at_risk} / ${d.lost}`} />
              )}
              {d.chat_customers > 0 && (
                <Row icon={<MessageCircle className="w-3.5 h-3.5" />} label={ru ? 'Писали в чат / написали снова' : 'Чатқа жазған / қайта жазған'} value={`${d.chat_customers} / ${d.chat_returning}`} />
              )}
            </div>
          )}

          {d && d.win_back.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 mb-1.5">{ru ? 'Кому стоит написать (давно не покупали)' : 'Кімге жазу керек (көптен сатып алмаған)'}</p>
              <div className="space-y-1.5">
                {d.win_back.map((c) => (
                  <div key={c.customer_id} className="rounded-xl bg-amber-50/70 p-2.5 text-[12px] flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{c.name || c.customer_id}</p>
                      <p className="text-slate-500">{c.orders} {ru ? 'зак.' : 'тапс.'} · {formatMoney(c.total, currency, language)} · {c.days} {ru ? 'дн. назад' : 'күн бұрын'}</p>
                    </div>
                    {c.phone && <a href={`tel:${c.phone}`} className="shrink-0 w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center"><Phone className="w-3.5 h-3.5" /></a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {d && d.top.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 mb-1.5">{ru ? 'Постоянные клиенты' : 'Тұрақты клиенттер'}</p>
              <div className="space-y-1">
                {d.top.map((c) => (
                  <div key={c.customer_id} className="flex items-center justify-between text-[12px] text-slate-700 bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <span className="truncate">{c.name || c.customer_id}</span>
                    <b className="shrink-0 ml-2">{c.orders} × · {formatMoney(c.total, currency, language)}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={onClose} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
          {t.close}
        </button>
      </div>
    </div>
  );
};
