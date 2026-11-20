import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, Calculator, Clock, PackageCheck, RefreshCw } from 'lucide-react';
import { api, ApiError, MpCalcInput, MpCalcPreset, MpCalcResult, MpOrdersWatch, MpPlat } from '../lib/api';
import { formatMoney } from '../lib/format';

// Marketplace iqtisodi va buyurtma muddatlari (2026-11-19) — 15 ta YouTube darsdan (mp_playbook.SOURCES):
//  • Прибыль — foyda kalkulyatori: komissiya + aksiya, logistika (Kaspi/Uzum avtomatik), soliq, reklama, brak,
//    vykup → qo'lga tushadigan pul, foyda, marja, 30% marja narxi, zarar chegarasi, zaxira kunlari.
//  • Заказы  — muddati yaqin buyurtmalar: Kaspi «Новые», Uzum 12 s jarimasiz bekor, WB FBS 13/18/120 s.
// Saytdagi nusxa: operon/src/components/cabinet/MarketplaceEcon.tsx (faqat uslub konstantalari farq qiladi).
type L = 'ru' | 'kk';
const BOX = 'bg-white rounded-2xl border border-slate-200';
const MUTED = 'text-slate-500';
const SOFT = 'bg-slate-50';
const PRIMARY = 'bg-blue-600 text-white';
const INPUT = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-slate-400';
const NAME: Record<MpPlat, string> = { kaspi: 'Kaspi', wb: 'Wildberries', uzum: 'Uzum' };
const tr = (l: L, ru: string, kk: string) => (l === 'kk' ? kk : ru);
const LS = 'fl_mp_calc_v1';

type Form = Record<string, string>;
const PCT_KEYS = ['commission_pct', 'promo_pct', 'tax_pct', 'ads_pct', 'defect_pct', 'buyout_pct'] as const;

const Seg: React.FC<{ value: string; options: [string, string][]; onChange: (v: string) => void }> = ({ value, options, onChange }) => (
  <div className="flex gap-1">
    {options.map(([v, label]) => (
      <button key={v} type="button" onClick={() => onChange(v)}
        className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-bold border ${value === v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{label}</button>
    ))}
  </div>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="text-[11.5px] font-bold text-slate-700">{label}</span>
    {children}
    {hint && <span className={`block text-[10.5px] ${MUTED} mt-0.5 leading-snug`}>{hint}</span>}
  </label>
);

// ── Прибыль ───────────────────────────────────────────────────────────────────
export const MpCalcPanel: React.FC<{ businessId: string; l: L }> = ({ businessId, l }) => {
  const [plat, setPlat] = useState<MpPlat>('kaspi');
  const [presets, setPresets] = useState<Record<MpPlat, MpCalcPreset> | null>(null);
  const [f, setF] = useState<Form>(() => {
    try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch { return {}; }
  });
  const [res, setRes] = useState<MpCalcResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [more, setMore] = useState(false);

  useEffect(() => { api.mpCalcPresets(businessId).then((r) => setPresets(r.presets)).catch(() => undefined); }, [businessId]);
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify(f)); } catch { /* ignore */ } }, [f]);
  useEffect(() => { setRes(null); }, [plat]);

  const p = presets?.[plat];
  const cur = p?.currency || (plat === 'kaspi' ? 'KZT' : plat === 'wb' ? 'RUB' : 'UZS');
  const key = (k: string) => `${plat}.${k}`;
  const val = (k: string) => f[key(k)] ?? '';
  const set = (k: string, v: string) => setF((o) => ({ ...o, [key(k)]: v }));
  const num = (k: string): number | null => {
    const s = (val(k) || '').replace(/\s/g, '').replace(',', '.');
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  const money = (n: number | null | undefined) => (n == null ? '—' : formatMoney(n, cur, l));

  const run = async () => {
    const price = num('price'); const cost = num('cost');
    if (!price || !cost) { setErr(tr(l, 'Укажите цену продажи и себестоимость.', 'Сату бағасы мен өзіндік құнды жазыңыз.')); return; }
    setBusy(true); setErr('');
    const body: MpCalcInput = { platform: plat, price, cost, size: (val('size') || 's') as 's', scheme: (val('scheme') || 'fbo') as 'fbo', zone: (val('zone') || 'kz') as 'kz' };
    for (const k of [...PCT_KEYS, 'logistics', 'return_fee', 'storage', 'other', 'stock', 'daily_sales', 'lead_days'] as const) {
      const n = num(k);
      if (n != null) (body as unknown as Record<string, unknown>)[k] = n;
    }
    try { setRes(await api.mpCalc(businessId, body)); }
    catch (e) { setErr(e instanceof ApiError ? e.message : tr(l, 'Не удалось посчитать.', 'Есептеу болмады.')); }
    finally { setBusy(false); }
  };

  const pctLabel: Record<string, [string, string]> = {
    commission_pct: ['Комиссия, %', 'Комиссия, %'],
    promo_pct: plat === 'kaspi' ? ['Надбавка в акциях, %', 'Акциядағы үстеме, %'] : plat === 'uzum' ? ['Скидка в акциях, %', 'Акция жеңілдігі, %'] : ['Акции / СПП, %', 'Акциялар / СПП, %'],
    tax_pct: ['Налог, %', 'Салық, %'],
    ads_pct: ['Реклама, % от цены', 'Жарнама, бағадан %'],
    defect_pct: ['Брак, % от себестоимости', 'Ақау, өзіндік құннан %'],
    buyout_pct: ['Выкуп, %', 'Сатып алу, %'],
  };
  const taxHint = plat === 'kaspi' ? tr(l, 'Упрощёнка РК 2026 — 4% (маслихат может менять) — уточните у бухгалтера', 'ҚР 2026 оңайлатылған — 4% (мәслихат өзгертуі мүмкін)')
    : plat === 'uzum' ? tr(l, 'ЯТТ — 1% с оборота до 1 млрд сум', 'ЯТТ — айналымнан 1% (1 млрд сумға дейін)') : tr(l, 'УСН 6% / по вашему режиму', 'УСН 6% / сіздің режиміңіз');

  const verdictCls = res ? ({ loss: 'bg-rose-50 border-rose-200 text-rose-700', thin: 'bg-amber-50 border-amber-200 text-amber-800', ok: 'bg-sky-50 border-sky-200 text-sky-800', good: 'bg-emerald-50 border-emerald-200 text-emerald-700' }[res.verdict]) : '';
  const verdictTxt = res ? ({
    loss: tr(l, 'Убыток', 'Шығын'), thin: tr(l, 'Тонкая маржа', 'Жұқа маржа'),
    ok: tr(l, 'Можно, но ниже 30%', 'Болады, бірақ 30%-дан төмен'), good: tr(l, 'Хорошая маржа', 'Жақсы маржа'),
  }[res.verdict]) : '';
  const LINE: [keyof MpCalcResult['lines'], string, string][] = [
    ['commission', 'Комиссия (+ акции)', 'Комиссия (+ акция)'], ['logistics', 'Логистика', 'Логистика'],
    ['storage', 'Хранение', 'Сақтау'], ['ads', 'Реклама', 'Жарнама'], ['tax', 'Налог', 'Салық'],
    ['defect', 'Брак', 'Ақау'], ['other', 'Прочее', 'Басқа'],
  ];

  return (
    <div className="space-y-3">
      <p className={`text-[11px] ${MUTED} leading-snug px-1`}>{tr(l,
        'Считает чистую прибыль с одной продажи по правилам площадки. Главная ошибка новичков — «себестоимость + 15%»: так комиссия 15% не покрывается. Цифры тарифов — из уроков продавцов, сверяйте в своём кабинете.',
        'Бір сатудан таза пайданы алаң ережесімен есептейді. Жаңадан бастаушылардың басты қатесі — «өзіндік құн + 15%»: бұлай 15% комиссия жабылмайды. Тариф сандары сатушылар сабақтарынан, кабинетіңізде тексеріңіз.')}</p>
      <div className="flex gap-1.5">
        {(['kaspi', 'wb', 'uzum'] as const).map((x) => <button key={x} onClick={() => setPlat(x)} className={`flex-1 py-2 rounded-xl text-[12px] font-bold border ${plat === x ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{NAME[x]}</button>)}
      </div>
      <div className={`p-3 ${BOX} space-y-2.5`}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={tr(l, `Цена продажи, ${cur}`, `Сату бағасы, ${cur}`)}>
            <input inputMode="decimal" value={val('price')} onChange={(e) => set('price', e.target.value)} className={INPUT} placeholder="10000" />
          </Field>
          <Field label={tr(l, `Себестоимость, ${cur}`, `Өзіндік құн, ${cur}`)} hint={tr(l, 'закупка + карго + упаковка', 'сатып алу + карго + қаптама')}>
            <input inputMode="decimal" value={val('cost')} onChange={(e) => set('cost', e.target.value)} className={INPUT} placeholder="4000" />
          </Field>
        </div>
        {plat === 'kaspi' && (
          <Field label={tr(l, 'Kaspi Доставка', 'Kaspi Жеткізу')} hint={tr(l, 'до 5 000 ₸ — 0; 5–15 тыс — ≈549/699 ₸; дороже — по весу (впишите в «Логистика»)', '5 000 ₸ дейін — 0; 5–15 мың — ≈549/699 ₸; қымбаты — салмақпен')}>
            <Seg value={val('zone') || 'kz'} onChange={(v) => set('zone', v)} options={[['kz', tr(l, 'По Казахстану', 'Қазақстан бойынша')], ['city', tr(l, 'По городу', 'Қала ішінде')]]} />
          </Field>
        )}
        {plat === 'uzum' && (
          <div className="grid grid-cols-2 gap-2">
            <Field label={tr(l, 'Схема', 'Схема')}>
              <Seg value={val('scheme') || 'fbo'} onChange={(v) => set('scheme', v)} options={[['fbo', 'FBO'], ['fbs', 'FBS'], ['dbs', 'DBS']]} />
            </Field>
            <Field label={tr(l, 'Габарит', 'Габарит')} hint={tr(l, '≈5 / 8 / 20 тыс сум', '≈5 / 8 / 20 мың сум')}>
              <Seg value={val('size') || 's'} onChange={(v) => set('size', v)} options={[['s', 'S'], ['m', 'M'], ['l', 'L']]} />
            </Field>
          </div>
        )}
        <button type="button" onClick={() => setMore((x) => !x)} className="text-[12px] font-bold text-blue-600">
          {more ? tr(l, 'Скрыть проценты и расходы', 'Пайыз бен шығынды жасыру') : tr(l, 'Комиссия, налог, реклама, выкуп…', 'Комиссия, салық, жарнама, сатып алу…')}
        </button>
        {more && (
          <div className="grid grid-cols-2 gap-2">
            {PCT_KEYS.map((k) => (
              <Field key={k} label={tr(l, pctLabel[k][0], pctLabel[k][1])} hint={k === 'tax_pct' ? taxHint : undefined}>
                <input inputMode="decimal" value={val(k)} onChange={(e) => set(k, e.target.value)} className={INPUT} placeholder={p ? String(p[k]) : ''} />
              </Field>
            ))}
            <Field label={tr(l, `Логистика за заказ, ${cur}`, `Тапсырыс логистикасы, ${cur}`)} hint={plat === 'wb' ? tr(l, 'из калькулятора WB для вашего склада', 'WB калькуляторынан') : tr(l, 'пусто = автоматически', 'бос = автоматты')}>
              <input inputMode="decimal" value={val('logistics')} onChange={(e) => set('logistics', e.target.value)} className={INPUT} placeholder={p?.logistics != null ? String(p.logistics) : tr(l, 'авто', 'авто')} />
            </Field>
            <Field label={tr(l, `Возврат, ${cur}`, `Қайтарым, ${cur}`)}>
              <input inputMode="decimal" value={val('return_fee')} onChange={(e) => set('return_fee', e.target.value)} className={INPUT} placeholder={p ? String(p.return_fee) : ''} />
            </Field>
            <Field label={tr(l, `Хранение на 1 шт., ${cur}`, `1 дана сақтау, ${cur}`)}>
              <input inputMode="decimal" value={val('storage')} onChange={(e) => set('storage', e.target.value)} className={INPUT} placeholder={p ? String(p.storage) : ''} />
            </Field>
            <Field label={tr(l, `Прочее на 1 шт., ${cur}`, `Басқа 1 данаға, ${cur}`)}>
              <input inputMode="decimal" value={val('other')} onChange={(e) => set('other', e.target.value)} className={INPUT} placeholder="0" />
            </Field>
            <Field label={tr(l, 'Остаток, шт.', 'Қалдық, дана')}>
              <input inputMode="decimal" value={val('stock')} onChange={(e) => set('stock', e.target.value)} className={INPUT} placeholder="—" />
            </Field>
            <Field label={tr(l, 'Продаж в день', 'Күнделікті сату')}>
              <input inputMode="decimal" value={val('daily_sales')} onChange={(e) => set('daily_sales', e.target.value)} className={INPUT} placeholder="—" />
            </Field>
            <Field label={tr(l, 'Срок поставки, дней', 'Жеткізу мерзімі, күн')}>
              <input inputMode="decimal" value={val('lead_days')} onChange={(e) => set('lead_days', e.target.value)} className={INPUT} placeholder="15" />
            </Field>
          </div>
        )}
        {err && <p className="text-[11.5px] font-semibold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{err}</p>}
        <button onClick={run} disabled={busy} className={`w-full py-2.5 rounded-xl text-[13px] font-black flex items-center justify-center gap-1.5 disabled:opacity-50 ${PRIMARY}`}>
          {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}{tr(l, 'Посчитать прибыль', 'Пайданы есептеу')}
        </button>
      </div>

      {res && (
        <div className="space-y-2.5">
          <div className={`p-3 rounded-2xl border ${verdictCls}`}>
            <div className="text-[12px] font-bold">{verdictTxt}</div>
            <div className="text-[22px] font-black leading-tight mt-0.5">{money(res.profit)} <span className="text-[13px] font-bold">{tr(l, 'с продажи', 'бір сатудан')}</span></div>
            <div className="text-[12px] mt-0.5">{tr(l, 'Маржа', 'Маржа')} {res.margin_pct}% · ROI {res.roi_pct ?? '—'}% · ×{res.markup_x}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([[tr(l, 'Придёт на счёт', 'Шотқа түседі'), res.payout], [tr(l, 'Безубыток', 'Залалсыз баға'), res.breakeven_price], [tr(l, 'Цена для 30%', '30% үшін баға'), res.price_for_30]] as [string, number | null][]).map(([t, v]) => (
              <div key={t} className={`p-2.5 rounded-xl ${SOFT}`}>
                <div className={`text-[10.5px] ${MUTED} leading-tight`}>{t}</div>
                <div className="text-[13px] font-black mt-0.5">{money(v)}</div>
              </div>
            ))}
          </div>
          <div className={`p-3 ${BOX}`}>
            <div className="text-[12.5px] font-black mb-1.5">{tr(l, 'Куда уходят деньги с одной продажи', 'Бір сатудан ақша қайда кетеді')}</div>
            <div className="flex justify-between text-[12px] py-0.5"><span>{tr(l, 'Себестоимость', 'Өзіндік құн')}</span><b>{money(Number(val('cost').replace(/\s/g, '').replace(',', '.')) || 0)}</b></div>
            {LINE.filter(([k]) => res.lines[k] > 0).map(([k, ru, kk]) => (
              <div key={k} className="flex justify-between text-[12px] py-0.5"><span>{tr(l, ru, kk)}{k === 'logistics' && res.logistics_auto ? <span className={MUTED}> · {tr(l, 'авто', 'авто')}</span> : null}</span><b>{money(res.lines[k])}</b></div>
            ))}
          </div>
          {res.stock && (
            <div className={`p-3 ${BOX} text-[12px] flex items-start gap-2`}>
              <PackageCheck className={`w-4 h-4 shrink-0 mt-0.5 ${res.stock.reorder_now ? 'text-amber-600' : 'text-emerald-600'}`} />
              <div>{tr(l, `Запаса хватит на ~${res.stock.days_left} дн.`, `Қор ~${res.stock.days_left} күнге жетеді.`)}{' '}
                {res.stock.reorder_now ? tr(l, `Пора заказывать новую партию (≈${res.stock.reorder_qty} шт.), иначе будет out of stock и карточка просядет.`, `Жаңа партияға тапсырыс беретін уақыт (≈${res.stock.reorder_qty} дана), әйтпесе тауар бітіп, карточка төмендейді.`)
                  : tr(l, 'Дозаказ пока не нужен.', 'Әзірге қосымша тапсырыс керек емес.')}</div>
            </div>
          )}
          {res.warnings.map((w) => (
            <div key={w.code} className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{l === 'kk' ? w.kk : w.ru}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Заказы (muddatlar) ───────────────────────────────────────────────────────
export const MpOrdersPanel: React.FC<{ businessId: string; l: L }> = ({ businessId, l }) => {
  const [d, setD] = useState<MpOrdersWatch | null>(null);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true); setErr(false);
    try { setD(await api.mpOrdersWatch(businessId)); } catch { setErr(true); } finally { setBusy(false); }
  };
  useEffect(() => { load(); }, [businessId]); // eslint-disable-line react-hooks/exhaustive-deps
  const anyConnected = useMemo(() => !!d && Object.values(d.connected).some(Boolean), [d]);
  const hrs = (h: number) => (h >= 1 ? tr(l, `${Math.floor(h)} ч`, `${Math.floor(h)} сағ`) : tr(l, `${Math.max(1, Math.round(h * 60))} мин`, `${Math.max(1, Math.round(h * 60))} мин`));
  const cls = { danger: 'border-rose-200 bg-rose-50', warn: 'border-amber-200 bg-amber-50', info: 'border-slate-200 bg-white' };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2 px-1">
        <p className={`text-[11px] ${MUTED} leading-snug`}>{tr(l,
          'Заказы, у которых идёт таймер площадки: Kaspi — принять в «Новых»; Uzum — отмена без штрафа только 12 ч; WB FBS — сдать до 13 ч (комиссия ниже), после 18 ч комиссия растёт. FindLead проверяет каждые 30 минут и пишет в Telegram.',
          'Алаң таймері жүріп тұрған тапсырыстар: Kaspi — «Жаңа» бөлімінде қабылдау; Uzum — айыппұлсыз бас тарту тек 12 сағ; WB FBS — 13 сағатқа дейін тапсыру, 18 сағаттан кейін комиссия өседі. FindLead әр 30 минут тексеріп, Telegram-ға жазады.')}</p>
        <button onClick={load} className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center hover:bg-slate-100" aria-label="refresh"><RefreshCw className={`w-4 h-4 text-slate-600 ${busy ? 'animate-spin' : ''}`} /></button>
      </div>
      {err && <div className={`p-3 ${BOX} text-[12px] text-rose-600`}>{tr(l, 'Не удалось загрузить заказы.', 'Тапсырыстар жүктелмеді.')}</div>}
      {d && !anyConnected && <div className={`p-3 ${BOX} text-[12px] ${MUTED}`}>{tr(l, 'Подключите Kaspi, WB или Uzum во вкладке «Отчёт» — тогда здесь появятся заказы с таймером.', '«Есеп» бөлімінде Kaspi, WB немесе Uzum қосыңыз — сонда мұнда таймері бар тапсырыстар шығады.')}</div>}
      {d && anyConnected && d.items.length === 0 && (
        <div className={`p-4 ${BOX} text-[12.5px] flex items-center gap-2`}><PackageCheck className="w-4 h-4 text-emerald-600" />{tr(l, 'Срочных заказов нет — всё обработано.', 'Шұғыл тапсырыс жоқ — бәрі өңделген.')}</div>
      )}
      {d?.items.map((it) => (
        <div key={`${it.source}:${it.id}`} className={`p-3 rounded-2xl border ${cls[it.level]}`}>
          <div className="flex items-center justify-between gap-2 text-[12px]">
            <b>{NAME[it.source]} · №{it.id}</b>
            <span className="flex items-center gap-1 font-bold"><Clock className="w-3.5 h-3.5" />{hrs(it.hours)}{it.left_h != null && it.left_h > 0 ? tr(l, ` · осталось ${hrs(it.left_h)}`, ` · қалды ${hrs(it.left_h)}`) : ''}</span>
          </div>
          {(it.title || it.amount != null) && <div className={`text-[11.5px] ${MUTED} mt-0.5`}>{it.title || ''}{it.amount != null && it.currency ? ` · ${formatMoney(it.amount, it.currency, l)}` : ''}</div>}
          <div className="text-[12px] mt-1.5 leading-snug">{l === 'kk' ? it.kk : it.ru}</div>
        </div>
      ))}
    </div>
  );
};
