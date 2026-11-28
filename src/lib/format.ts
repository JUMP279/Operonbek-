import { isUz } from '../context/LanguageContext';
// Raqam/pul/sana formatlash — kk/ru uchun.

import { API_BASE } from './api';

const SYMBOL: Record<string, string> = { KZT: '₸', UZS: 'сум', RUB: '₽', USD: '$' };
// o'zbekcha interfeysda so'm lotincha
const symOf = (cur: string) => (cur === 'UZS' && isUz() ? "so'm" : SYMBOL[cur]);

// ── Valyuta TIL bo'yicha (2026-11-25, user talabi): uz → so'm, ru → rubl, kk → tenge ─────────────────
// Summa o'z valyutasidan (Kaspi — KZT, WB — RUB, Uzum — UZS, biznes — bizCur()) Markaziy bank kursi bilan
// til valyutasiga aylantiriladi. TARIFLAR BUNGA KIRMAYDI — ular doim dollarda (USD summalar o'zgarmaydi).
// Kurs: backend GET /fx/rates (cbu.uz); javob kelguncha — 2026-11-25 dagi kurs.
export const LANG_CUR: Record<string, string> = { uz: 'UZS', ru: 'RUB', kk: 'KZT' };
const RATES: Record<string, number> = { USD: 1, UZS: 11990.54, RUB: 81.99, KZT: 459.76 };   // 1 USD = ...
try {
  fetch(`${API_BASE}/fx/rates`).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (d?.usd) for (const k of Object.keys(RATES)) if (d.usd[k] > 0) RATES[k] = d.usd[k];
  }).catch(() => {});
} catch { /* ignore */ }

// Biznesning o'z valyutasi (mahsulot narxi, buyurtma, bitim summalari shu valyutada saqlanadi)
let _biz = 'KZT';
export const bizCur = () => _biz;
export const bizCurSymbol = () => symOf(_biz) || _biz;
export function setBizCurrency(cur?: string | null) {
  if (cur && RATES[cur]) _biz = cur;
}
/** Bozor: biznes tili o'zbekcha yoki shahar O'zbekistonda → so'm, aks holda tenge (backend bilan bir xil). */
export function bizCurFromBusiness(b?: { language?: string | null; city?: string | null } | null): string {
  if (!b) return 'KZT';
  const uzCity = /tashkent|toshkent|ташкент|тошкент|samar[qk]and|самарканд|bu[xkh]+ara|бухара|andijan|андижан|namangan|наманган|fer?g.?ana|фергана|nukus|нукус|qarshi|карши|navoi|навои|jizzax|джизак|termiz|термез|xorazm|urgench|ургенч|guliston|uzbekistan|o.?zbekiston|узбекистан/i;
  return b.language === 'uz' || uzCity.test(b.city || '') ? 'UZS' : 'KZT';
}

/** Summani til valyutasiga aylantiradi: { value, cur, converted } */
export function toLangCurrency(n: number, from: string, lang: string): { value: number; cur: string; converted: boolean } {
  const to = LANG_CUR[lang] || from;
  if (from === 'USD' || from === to || !RATES[from] || !RATES[to]) return { value: n, cur: from, converted: false };
  const v = (n / RATES[from]) * RATES[to];
  const step = to === 'UZS' && Math.abs(v) >= 10_000 ? 100 : 1;
  return { value: Math.round(v / step) * step, cur: to, converted: true };
}

const locale = (lang: string) => ((lang === 'uz' ? 'uz-UZ' : lang === 'kk' ? 'kk-KZ' : 'ru-RU'));

export function formatNumber(n: number, lang: string): string {
  return new Intl.NumberFormat(locale(lang)).format(Math.round(n || 0));
}

/** Pul summasi TIL valyutasida (uz so'm / ru ₽ / kk ₸). Aylantirilgan bo'lsa oldida "≈". USD (tarif) — o'zgarmaydi. */
export function formatMoney(n: number, currency: string, lang: string): string {
  const c = toLangCurrency(n || 0, currency, lang);
  if (c.cur === 'USD') return `$${(n || 0).toFixed(2).replace(/\.00$/, '')}`;
  const sym = symOf(c.cur) || c.cur;
  return `${c.converted ? '≈ ' : ''}${formatNumber(c.value, lang)} ${sym}`;
}

/** Til valyutasining belgisi (grafik sarlavhalari uchun): uz so'm, ru ₽, kk ₸ */
export const langCurSymbol = (lang: string) => symOf(LANG_CUR[lang] || 'KZT') || '';

/** Qisqa ko'rinish grafik o'qi uchun: 1 250 000 → 1,3 млн */
export function formatCompact(n: number, lang: string): string {
  const abs = Math.abs(n);
  const mln = (lang === 'uz' ? "mln" : lang === 'kk' ? 'млн' : 'млн');
  const k = (lang === 'uz' ? "ming" : lang === 'kk' ? 'мың' : 'тыс');
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1).replace('.', ',')} ${mln}`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1).replace('.', ',')} ${k}`;
  return String(Math.round(n));
}

/** O'zgarish foizi: null → ma'lumot yo'q (oldingi davr 0 edi). */
export function formatChange(pct: number | null): { text: string; positive: boolean } | null {
  if (pct === null || pct === undefined || !isFinite(pct)) return null;
  return { text: `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1).replace('.', ',')}%`, positive: pct >= 0 };
}

const MONTHS: Record<string, string[]> = {
  uz: ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"], ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  kk: ['қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау', 'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел'],
};

export function formatDay(iso: string, lang: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${(MONTHS[lang] || MONTHS.ru)[d.getMonth()]}`;
}

export function timeAgo(iso: string, lang: string): string {
  const d = new Date(iso);
  const sec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  const ru = lang !== 'kk';
  if (sec < 60) return (isUz() ? "hozirgina" : ru ? 'только что' : 'жаңа ғана');
  const min = Math.floor(sec / 60);
  if (min < 60) return (isUz() ? `${min} daqiqa oldin` : ru ? `${min} мин назад` : `${min} мин бұрын`);
  const h = Math.floor(min / 60);
  if (h < 24) return (isUz() ? `${h} soat oldin` : ru ? `${h} ч назад` : `${h} сағ бұрын`);
  const days = Math.floor(h / 24);
  if (days < 7) return (isUz() ? `${days} kun oldin` : ru ? `${days} дн назад` : `${days} күн бұрын`);
  return formatDay(iso, lang);
}

// Reja ro'yxati: kelgusi 7 kun to'liq (kamida 8 ta). Sayt (cabinet/Content.tsx) ham shu qoida (2026-11-17).
const WEEK_MS = 7 * 24 * 3600 * 1000;
export function nearFirst<T extends { scheduled_at: string }>(items: T[]): T[] {
  const limit = Date.now() + WEEK_MS;
  return items.filter((i, idx) => idx < 8 || +new Date(i.scheduled_at) <= limit);
}
