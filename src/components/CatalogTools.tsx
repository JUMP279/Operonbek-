import React, { useRef, useState } from 'react';
import { FileSpreadsheet, Loader2, ShieldCheck, Upload, X } from 'lucide-react';
import { api, ApiError, ImportPreview, ImportRow, PriceRules } from '../lib/api';
import { formatMoney } from '../lib/format';

// Saytdagi cabinet/CatalogTools.tsx bilan bir xil: /products/import/* va /products/{id}/price-rules.
type Lang = 'ru' | 'kk';

const T = {
  ru: {
    bargain: 'Торг с клиентом',
    bargainOn: (p: number) => `AI может уступить до ${p}% (или до минимальной цены товара). Ниже система не пропустит.`,
    bargainOff: 'Цены фиксированные: AI не снижает цену, система проверяет каждый ответ.',
    max: 'макс.',
    importTitle: 'Загрузить каталог', importBtn: 'Загрузить файлом',
    importHint: 'Excel, CSV, текстовый прайс или фото прайса. AI сам найдёт названия, цены и остатки — вы проверите перед сохранением.',
    pick: 'Выбрать файл', reading: 'AI читает файл…', upTo: 'до 8 МБ',
    found: (n: number) => `Найдено: ${n}`, existing: (n: number) => `Уже есть: ${n}`, noPrice: (n: number) => `Без цены: ${n}`,
    markup: 'Наценка, % (если в файле себестоимость)', upd: 'Обновлять цены и остатки у существующих', noUpd: 'Существующие не трогать',
    willUpd: 'обновится', pcs: 'шт', other: 'Другой файл', save: (n: number) => `Сохранить ${n}`,
    done: (a: number, u: number, s: number) => `Добавлено: ${a}, обновлено: ${u}${s ? `, пропущено: ${s}` : ''}`,
    saveErr: 'Не удалось сохранить. Попробуйте ещё раз.',
    errs: {
      too_big: 'Файл больше 8 МБ.', empty: 'Файл пустой.', xls_old: 'Старый формат .xls — сохраните файл в Excel как .xlsx.',
      bad_excel: 'Не удалось открыть Excel-файл.', bad_text: 'Не удалось прочитать текст файла.',
      no_name_column: 'Не нашли колонку с названиями товаров.', no_products: 'В файле не нашли товаров.',
      image_unreadable: 'С фото не удалось прочитать текст — загрузите чётче или файлом.',
      network: 'Нет связи с сервером.', generic: 'Не удалось прочитать файл. Попробуйте ещё раз.',
    } as Record<string, string>,
  },
  kk: {
    bargain: 'Клиентпен саудаласу',
    bargainOn: (p: number) => `AI ${p}%-ға дейін (немесе тауардың ең төменгі бағасына дейін) түсе алады. Одан төмен жүйе жібермейді.`,
    bargainOff: 'Баға тұрақты: AI бағаны түсірмейді, жүйе әр жауапты тексереді.',
    max: 'макс.',
    importTitle: 'Каталогты жүктеу', importBtn: 'Файлмен жүктеу',
    importHint: 'Excel, CSV, мәтіндік прайс немесе прайс фотосы. AI атауларды, бағалар мен қалдықтарды өзі табады — сақтамас бұрын тексересіз.',
    pick: 'Файл таңдау', reading: 'AI файлды оқып жатыр…', upTo: '8 МБ дейін',
    found: (n: number) => `Табылды: ${n}`, existing: (n: number) => `Бар: ${n}`, noPrice: (n: number) => `Бағасыз: ${n}`,
    markup: 'Үстеме, % (файлда өзіндік құн болса)', upd: 'Бар тауарлардың баға мен қалдығын жаңарту', noUpd: 'Бар тауарларға тимеу',
    willUpd: 'жаңарады', pcs: 'дана', other: 'Басқа файл', save: (n: number) => `${n} сақтау`,
    done: (a: number, u: number, s: number) => `Қосылды: ${a}, жаңартылды: ${u}${s ? `, өткізілді: ${s}` : ''}`,
    saveErr: 'Сақталмады. Қайталап көріңіз.',
    errs: {
      too_big: 'Файл 8 МБ-тан үлкен.', empty: 'Файл бос.', xls_old: 'Ескі .xls форматы — Excel-де .xlsx етіп сақтаңыз.',
      bad_excel: 'Excel файлын ашу мүмкін болмады.', bad_text: 'Файл мәтінін оқу мүмкін болмады.',
      no_name_column: 'Тауар атаулары бар бағанды таппадық.', no_products: 'Файлдан тауар табылмады.',
      image_unreadable: 'Фотодан мәтін оқылмады — анығырақ фото немесе файл жүктеңіз.',
      network: 'Сервермен байланыс жоқ.', generic: 'Файлды оқу мүмкін болмады. Қайталап көріңіз.',
    } as Record<string, string>,
  },
};

export const catalogText = (lang: Lang) => T[lang];

export const PriceRulesCard: React.FC<{ lang: Lang; rules: PriceRules | null; onChange: (r: PriceRules) => Promise<void> }> = ({ lang, rules, onChange }) => {
  const L = T[lang];
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState('');
  if (!rules) return null;
  const set = async (r: PriceRules) => {
    setBusy(true);
    try { await onChange(r); } catch { /* ignore */ } finally { setBusy(false); }
  };
  const pctVal = pct !== '' ? pct : String(rules.max_discount);
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><ShieldCheck className="w-4.5 h-4.5" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-bold">{L.bargain}</p>
        <p className="text-[10.5px] text-slate-500 leading-snug">{rules.bargain ? L.bargainOn(rules.max_discount) : L.bargainOff}</p>
        {rules.bargain && (
          <label className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            {L.max}
            <input className="w-12 rounded-lg border border-slate-200 px-1.5 py-1 text-[12px] text-center text-slate-900" inputMode="numeric" maxLength={2}
              value={pctVal} onChange={(e) => setPct(e.target.value.replace(/\D/g, ''))}
              onBlur={() => { const n = Math.min(50, parseInt(pctVal, 10) || 0); setPct(''); if (n !== rules.max_discount) set({ ...rules, max_discount: n }); }} />
            %
          </label>
        )}
      </div>
      <button type="button" disabled={busy} onClick={() => set({ ...rules, bargain: !rules.bargain })} aria-pressed={rules.bargain}
        className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 disabled:opacity-50 ${rules.bargain ? 'bg-emerald-500' : 'bg-slate-200'}`}>
        <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${rules.bargain ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
};

export const ImportCatalogSheet: React.FC<{ lang: Lang; businessId: string; currency: string; onClose: () => void; onDone: (msg: string) => void }> = ({ lang, businessId, currency, onClose, onDone }) => {
  const L = T[lang];
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [prev, setPrev] = useState<ImportPreview | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [markup, setMarkup] = useState('');
  const [updateExisting, setUpdateExisting] = useState(true);

  const pick = async (f: File) => {
    setBusy(true);
    setErr('');
    try {
      const p = await api.importPreview(businessId, f);
      setPrev(p);
      setRows(p.rows);
    } catch (e) {
      const code = e instanceof ApiError ? (e.status === 0 ? 'network' : e.message) : '';
      setErr(L.errs[code] || L.errs.generic);
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    setBusy(true);
    setErr('');
    try {
      const r = await api.importCommit(businessId, rows, parseInt(markup, 10) || 0, updateExisting);
      onDone(L.done(r.added, r.updated, r.skipped));
    } catch {
      setErr(L.saveErr);
      setBusy(false);
    }
  };

  const m = parseInt(markup, 10) || 0;
  const sell = (p: number | null) => (p == null ? null : m ? Math.round((p * (100 + m)) / 100 / 10) * 10 : p);
  const input = 'w-full rounded-xl border border-slate-200 p-2.5 text-[12.5px] outline-none focus:border-purple-400';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-black">{L.importTitle}</p>
        <button onClick={onClose} disabled={busy} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
      </div>
      {!prev ? (
        <>
          <p className="text-[11.5px] text-slate-500">{L.importHint}</p>
          <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-8 flex flex-col items-center gap-2 text-slate-500 disabled:opacity-60">
            {busy ? <Loader2 className="w-6 h-6 text-purple-600 animate-spin" /> : <FileSpreadsheet className="w-6 h-6" />}
            <span className="text-[12.5px] font-bold text-slate-800">{busy ? L.reading : L.pick}</span>
            <span className="text-[10.5px]">.xlsx · .csv · .txt · фото — {L.upTo}</span>
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xlsm,.csv,.tsv,.txt,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ''; }} />
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 text-[10.5px] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{L.found(rows.length)}</span>
            {prev.existing > 0 && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{L.existing(prev.existing)}</span>}
            {prev.without_price > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{L.noPrice(prev.without_price)}</span>}
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500">{L.markup}</p>
            <input className={input} inputMode="numeric" maxLength={3} value={markup} placeholder="0" onChange={(e) => setMarkup(e.target.value.replace(/\D/g, ''))} />
          </div>
          <label className="flex items-center gap-2 text-[12px] font-semibold">
            <input type="checkbox" checked={updateExisting} onChange={(e) => setUpdateExisting(e.target.checked)} />
            {updateExisting ? L.upd : L.noUpd}
          </label>
          <div className="rounded-xl border border-slate-200 max-h-[45vh] overflow-y-auto divide-y divide-slate-100">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-2 text-[12px]">
                <span className="flex-1 min-w-0 truncate">{r.name}{r.exists && <span className="ml-1 text-[10px] text-slate-400">{L.willUpd}</span>}</span>
                {r.stock != null && <span className="text-slate-400 shrink-0">{r.stock} {L.pcs}</span>}
                <span className="font-bold text-purple-700 shrink-0">{sell(r.price) != null ? formatMoney(sell(r.price) as number, currency, lang) : '—'}</span>
                <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-slate-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setPrev(null); setRows([]); }} disabled={busy} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-slate-100 text-slate-700">{L.other}</button>
            <button onClick={commit} disabled={busy || rows.length === 0}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-purple-600 text-white flex items-center justify-center gap-1.5 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}{L.save(rows.length)}
            </button>
          </div>
        </>
      )}
      {err && <p className="text-[11.5px] font-semibold text-rose-600">{err}</p>}
    </div>
  );
};
