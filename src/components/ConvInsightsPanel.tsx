import React, { useEffect, useState } from 'react';
import { Loader2, Timer } from 'lucide-react';
import { api, ConvInsights, ConvStatusInfo, ConvStatusKey } from '../lib/api';

// Saytdagi cabinet/ConvInsights.tsx bilan bir xil ma'no (services/conv_insights.py).
type Lang = 'ru' | 'kk';

const META: Record<ConvStatusKey, { ru: string; kk: string; cls: string }> = {
  problem: { ru: 'Нужен менеджер', kk: 'Менеджер керек', cls: 'bg-rose-100 text-rose-700' },
  stuck: { ru: 'Завис без ответа', kk: 'Жауапсыз тұр', cls: 'bg-rose-100 text-rose-700' },
  waiting: { ru: 'Ждёт ответа', kk: 'Жауап күтуде', cls: 'bg-amber-100 text-amber-800' },
  hot: { ru: 'Готов купить', kk: 'Сатып алуға дайын', cls: 'bg-orange-100 text-orange-800' },
  live: { ru: 'Сейчас пишет', kk: 'Қазір жазып жатыр', cls: 'bg-emerald-100 text-emerald-700' },
  active: { ru: 'Активный', kk: 'Белсенді', cls: 'bg-slate-100 text-slate-600' },
  sleeping: { ru: 'Уснул', kk: 'Ұйықтап қалды', cls: 'bg-slate-100 text-slate-500' },
};

export const NEEDS_ME: ConvStatusKey[] = ['problem', 'stuck', 'waiting'];
export const needsMe = (s?: ConvStatusInfo) => !!s && s.tags.some((x) => NEEDS_ME.includes(x));

const fmtMin = (m: number, lang: Lang) =>
  m < 60 ? `${m} мин` : m < 1440 ? `${Math.floor(m / 60)} ${lang === 'kk' ? 'сағ' : 'ч'}` : `${Math.floor(m / 1440)} ${lang === 'kk' ? 'күн' : 'дн'}`;

const fmtSec = (s: number | null, lang: Lang) => {
  if (s == null) return '—';
  if (s < 60) return `${Math.round(s)} сек`;
  if (s < 3600) return `${Math.round(s / 60)} мин`;
  return `${(s / 3600).toFixed(1)} ${lang === 'kk' ? 'сағ' : 'ч'}`;
};

export const StatusChip: React.FC<{ s?: ConvStatusInfo; lang: Lang }> = ({ s, lang }) => {
  if (!s || s.key === 'active' || s.key === 'hot') return null;
  const m = META[s.key];
  const wait = s.waiting_min != null && NEEDS_ME.includes(s.key) ? ` · ${fmtMin(s.waiting_min, lang)}` : '';
  return <span className={`px-1.5 py-[1px] rounded-md text-[10.5px] font-bold ${m.cls}`}>{m[lang]}{wait}</span>;
};

export const problemText = (lang: Lang) => lang === 'kk'
  ? 'AI менеджерді шақырды: бұл сұраққа сіздің жауабыңыз керек. Жауап бергенде статус алынады.'
  : 'AI позвал менеджера: на этот вопрос нужен ваш ответ. Статус снимется, когда вы ответите.';

export const FunnelPanel: React.FC<{ businessId: string; lang: Lang }> = ({ businessId, lang }) => {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<ConvInsights | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setData(null);
    setFailed(false);
    api.conversationInsights(businessId, days).then(setData).catch(() => setFailed(true));
  }, [businessId, days]);
  const k = lang === 'kk';
  if (failed) return <p className="text-center text-[12px] text-slate-500 py-8">{k ? 'Жүктеу мүмкін болмады' : 'Не удалось загрузить'}</p>;
  if (!data) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>;
  const f = data.funnel;
  const steps = [
    { v: f.started, l: k ? 'Диалог бастады' : 'Начали диалог' },
    { v: f.interest, l: k ? 'Тауар сұрады' : 'Спросили о товаре' },
    { v: f.bargain, l: k ? 'Саудаласты' : 'Торговались' },
    { v: f.ready, l: k ? 'Сатып алуға дайын' : 'Готовы купить' },
    { v: f.ordered, l: k ? 'Тапсырыс берді' : 'Оформили заказ' },
    { v: f.won, l: k ? 'Сатылды' : 'Продано' },
  ];
  const max = Math.max(1, f.started);
  return (
    <div className="space-y-2.5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black">{k ? 'Жазысудағы сату воронкасы' : 'Воронка продаж в переписке'}</p>
            <p className="text-[11px] text-slate-500">
              {data.conversion_pct != null ? (k ? `Диалогтан тапсырысқа: ${data.conversion_pct}%` : `Из диалога в заказ: ${data.conversion_pct}%`)
                : (k ? 'Кезеңде диалог әлі жоқ' : 'Диалогов за период пока нет')}
            </p>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold">
            {([7, 30, 90] as const).map((d) => (
              <button key={d} onClick={() => setDays(d)} className={`px-2.5 py-1 rounded-lg ${days === d ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{d}</button>
            ))}
          </div>
        </div>
        {steps.map((s) => (
          <div key={s.l} className="flex items-center gap-2 text-[11.5px]">
            <span className="w-28 shrink-0 text-slate-500 truncate">{s.l}</span>
            <div className="flex-1 h-5 rounded-md bg-slate-100 overflow-hidden">
              <div className="h-full rounded-md bg-purple-500" style={{ width: `${Math.max(s.v ? 3 : 0, (100 * s.v) / max)}%` }} />
            </div>
            <span className="w-8 text-right font-bold">{s.v}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: k ? 'AI жауабы (медиана)' : 'AI отвечает (медиана)', v: fmtSec(data.response.ai.p50_s, lang) },
          { l: k ? 'AI, жауаптардың 95%-ы' : 'AI, 95% ответов быстрее', v: fmtSec(data.response.ai.p95_s, lang) },
          { l: k ? 'Сіздің жауап (медиана)' : 'Вы отвечаете (медиана)', v: fmtSec(data.response.operator.p50_s, lang) },
          { l: k ? 'Менеджер шақырылды' : 'Звали менеджера', v: String(data.handoffs) },
        ].map((x) => (
          <div key={x.l} className="bg-white border border-slate-200/90 rounded-2xl p-3">
            <p className="text-[10.5px] text-slate-500 flex items-center gap-1"><Timer className="w-3 h-3" />{x.l}</p>
            <p className="text-[15px] font-black mt-0.5">{x.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
