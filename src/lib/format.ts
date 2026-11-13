// Raqam/pul/sana formatlash — kk/ru uchun.

const SYMBOL: Record<string, string> = { KZT: '₸', UZS: 'сум', RUB: '₽', USD: '$' };

const locale = (lang: string) => (lang === 'kk' ? 'kk-KZ' : 'ru-RU');

export function formatNumber(n: number, lang: string): string {
  return new Intl.NumberFormat(locale(lang)).format(Math.round(n || 0));
}

export function formatMoney(n: number, currency: string, lang: string): string {
  const sym = SYMBOL[currency] || currency;
  return `${formatNumber(n, lang)} ${sym}`;
}

/** Qisqa ko'rinish grafik o'qi uchun: 1 250 000 → 1,3 млн */
export function formatCompact(n: number, lang: string): string {
  const abs = Math.abs(n);
  const mln = lang === 'kk' ? 'млн' : 'млн';
  const k = lang === 'kk' ? 'мың' : 'тыс';
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
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
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
  if (sec < 60) return ru ? 'только что' : 'жаңа ғана';
  const min = Math.floor(sec / 60);
  if (min < 60) return ru ? `${min} мин назад` : `${min} мин бұрын`;
  const h = Math.floor(min / 60);
  if (h < 24) return ru ? `${h} ч назад` : `${h} сағ бұрын`;
  const days = Math.floor(h / 24);
  if (days < 7) return ru ? `${days} дн назад` : `${days} күн бұрын`;
  return formatDay(iso, lang);
}
