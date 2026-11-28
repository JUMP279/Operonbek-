/**
 * O'zbekcha va qozoqcha sana (2026-11-28, QA): Chrome / Android WebView'da `uz-UZ` va `kk-KZ` oy nomlari yo'q —
 * `toLocaleDateString('uz-UZ', {month:'long'})` «M12» qaytaradi (kabinetda «M12 12gacha» ko'rinardi).
 * Bu shim faqat brauzerda shu til ma'lumoti YO'Q bo'lsa ishga tushadi va sanani o'zi yozadi:
 * uz: «12-dekabr», «12-dek, 14:05»; kk: «12 желтоқсан»; raqamli: «12.12.2026». Rus tiliga tegmaydi.
 * Ilova bilan bir xil fayl: Operonbek-- src/lib/uzDate.ts
 */
type Tbl = { long: string[]; short: string[]; wdLong: string[]; wdShort: string[]; sep: string; probe: RegExp };
const TBL: Record<'uz' | 'kk', Tbl> = {
  uz: {
    long: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
    short: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    wdLong: ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'],
    wdShort: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'], sep: '-', probe: /dekabr/i,
  },
  kk: {
    long: ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'],
    short: ['қаң.', 'ақп.', 'нау.', 'сәу.', 'мам.', 'мау.', 'шіл.', 'там.', 'қыр.', 'қаз.', 'қар.', 'жел.'],
    wdLong: ['жексенбі', 'дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі'],
    wdShort: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'], sep: ' ', probe: /желтоқсан/i,
  },
};
const ACTIVE: Partial<Record<'uz' | 'kk', Tbl>> = {};

type Opts = Intl.DateTimeFormatOptions;
const p2 = (n: number) => String(n).padStart(2, '0');

function tblOf(loc: unknown): Tbl | undefined {
  const l = Array.isArray(loc) ? loc[0] : loc;
  if (typeof l !== 'string') return undefined;
  const k = l.slice(0, 2).toLowerCase();
  return k === 'uz' || k === 'kk' ? ACTIVE[k] : undefined;
}

function fmt(T: Tbl, d: Date, o: Opts, defDate: boolean, defTime: boolean): string {
  if (isNaN(d.getTime())) return 'Invalid Date';
  let Y = d.getFullYear(), M = d.getMonth(), D = d.getDate(), h = d.getHours(), m = d.getMinutes(), wd = d.getDay();
  if (o.timeZone) {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: o.timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' }).formatToParts(d);
    const g = (t: string) => parts.find((x) => x.type === t)?.value || '';
    Y = +g('year'); M = +g('month') - 1; D = +g('day'); h = +g('hour'); m = +g('minute');
    wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'));
  }
  const has = (k: keyof Opts) => o[k] !== undefined;
  if (!(has('year') || has('month') || has('day') || has('weekday') || has('hour') || has('minute'))) {
    if (defDate) Object.assign(o, { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (defTime) Object.assign(o, { hour: '2-digit', minute: '2-digit' });
  }
  let date = '';
  const mo = o.month;
  if (mo === 'long' || mo === 'short' || mo === 'narrow') {
    const name = mo === 'long' ? T.long[M] : T.short[M];
    date = (o.day ? `${D}${T.sep}${name}` : name) + (o.year ? ` ${Y}` : '');
  } else if (mo) {
    const dd = o.day ? (o.day === '2-digit' ? p2(D) : String(D)) + '.' : '';
    date = dd + (mo === '2-digit' ? p2(M + 1) : String(M + 1)) + (o.year ? '.' + (o.year === '2-digit' ? String(Y).slice(-2) : Y) : '');
  } else if (o.day) {
    date = String(D);
  } else if (o.year) {
    date = String(Y);
  }
  if (o.weekday) {
    const w = o.weekday === 'long' ? T.wdLong[wd] : T.wdShort[wd];
    date = date ? `${w}, ${date}` : w;
  }
  let time = '';
  if (o.hour !== undefined || o.minute !== undefined) {
    time = (o.hour !== undefined ? p2(h) : '') + (o.minute !== undefined ? (o.hour !== undefined ? ':' : '') + p2(m) : '');
  }
  return [date, time].filter(Boolean).join(', ');
}

export function installUzDates(): void {
  for (const k of ['uz', 'kk'] as const) {
    try {
      const probe = new Date(2026, 11, 12).toLocaleDateString(k === 'uz' ? 'uz-UZ' : 'kk-KZ', { month: 'long' });
      if (TBL[k].probe.test(probe)) continue;     // brauzer bu tilni biladi — tegmaymiz
    } catch { /* davom */ }
    ACTIVE[k] = TBL[k];
  }
  const P = Date.prototype as any;
  if (P.__uzShim || (!ACTIVE.uz && !ACTIVE.kk)) return;
  P.__uzShim = true;
  const origDate = P.toLocaleDateString, origStr = P.toLocaleString, origTime = P.toLocaleTimeString;
  P.toLocaleDateString = function (loc?: any, o?: Opts) {
    const T = tblOf(loc);
    return T ? fmt(T, this, { ...(o || {}) }, true, false) : origDate.call(this, loc, o);
  };
  P.toLocaleString = function (loc?: any, o?: Opts) {
    const T = tblOf(loc);
    return T ? fmt(T, this, { ...(o || {}) }, true, true) : origStr.call(this, loc, o);
  };
  P.toLocaleTimeString = function (loc?: any, o?: Opts) {
    const T = tblOf(loc);
    if (!T) return origTime.call(this, loc, o);
    const oo = { ...(o || {}) };
    if (oo.hour === undefined && oo.minute === undefined) Object.assign(oo, { hour: '2-digit', minute: '2-digit' });
    return fmt(T, this, oo, false, true);
  };
}
