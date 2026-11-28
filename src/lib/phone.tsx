import React, { useState } from 'react';

/**
 * Telefon raqami — MDH davlatlari, aniq uzunlik, bayroqcha (2026-11-28, user talabi).
 * Avval maydon doim «+7» bilan boshlanardi va 10–15 ta har qanday raqam o'tib ketardi.
 * Endi: «+» dan keyin faqat ma'lum davlat kodi yoziladi, kod aniqlangach o'sha davlat bayrog'i chiqadi
 * va raqamlar soni shu davlatnikidan oshmaydi. Backend bilan bir xil: operon-backend routers/auth.py norm_phone.
 * Ilova bilan bir xil fayl: Operonbek-- src/lib/phone.tsx
 */
type Country = { iso: string; code: string; len: number; groups: number[] };

const COUNTRIES: Country[] = [
  { iso: 'uz', code: '998', len: 9, groups: [2, 3, 2, 2] },
  { iso: 'kg', code: '996', len: 9, groups: [3, 3, 3] },
  { iso: 'tj', code: '992', len: 9, groups: [2, 3, 2, 2] },
  { iso: 'tm', code: '993', len: 8, groups: [2, 2, 2, 2] },
  { iso: 'az', code: '994', len: 9, groups: [2, 3, 2, 2] },
  { iso: 'ge', code: '995', len: 9, groups: [3, 2, 2, 2] },
  { iso: 'by', code: '375', len: 9, groups: [2, 3, 2, 2] },
  { iso: 'am', code: '374', len: 8, groups: [2, 3, 3] },
  { iso: 'md', code: '373', len: 8, groups: [2, 3, 3] },
  { iso: 'ua', code: '380', len: 9, groups: [2, 3, 2, 2] },
  { iso: 'kz', code: '7', len: 10, groups: [3, 3, 2, 2] },   // +7 6xx / 7xx — Qozog'iston
  { iso: 'ru', code: '7', len: 10, groups: [3, 3, 2, 2] },   // +7 boshqa — Rossiya
];

const digitsOf = (s: string) => (s || '').replace(/\D/g, '');

/** Raqam qaysi davlatniki. «+7» dan keyingi birinchi raqam 6/7 → KZ, boshqasi → RU, hali yo'q → kz/ru noaniq. */
export function phoneCountry(raw: string): Country | null {
  const d = digitsOf(raw);
  const c = COUNTRIES.find((x) => x.code !== '7' && d.startsWith(x.code));
  if (c) return c;
  if (d.startsWith('7')) {
    const next = d[1];
    if (!next) return null;
    return COUNTRIES.find((x) => x.iso === (next === '6' || next === '7' ? 'kz' : 'ru')) || null;
  }
  return null;
}

const codePossible = (d: string) => COUNTRIES.some((x) => x.code.startsWith(d) || d.startsWith(x.code));

function format(d: string): string {
  const c = phoneCountry('+' + d) || (d.startsWith('7') ? COUNTRIES.find((x) => x.iso === 'kz')! : null);
  if (!c) return '+' + d;
  const rest = d.slice(c.code.length, c.code.length + c.len);
  const parts: string[] = [];
  let i = 0;
  for (const g of c.groups) {
    if (i >= rest.length) break;
    parts.push(rest.slice(i, i + g));
    i += g;
  }
  return ['+' + c.code, ...parts].join(' ');
}

/** Input onChange uchun: noto'g'ri davlat kodi va ortiqcha raqamlar qabul qilinmaydi. */
export function nextPhone(prev: string, typed: string): string {
  let d = digitsOf(typed);
  if (!d) return typed.includes('+') ? '+' : '';
  if (!codePossible(d)) return prev;                      // bunday davlat kodi yo'q — kiritilmaydi
  const c = phoneCountry('+' + d) || (d.startsWith('7') ? COUNTRIES.find((x) => x.iso === 'kz')! : null);
  if (c) d = d.slice(0, c.code.length + c.len);           // ortiqcha raqam kiritilmaydi
  return format(d);
}

export function isValidPhone(raw: string): boolean {
  const c = phoneCountry(raw);
  return !!c && digitsOf(raw).length === c.code.length + c.len;
}

export const phonePlaceholder = (lang: string) => (lang === 'uz' ? '+998 90 123 45 67' : '+7 701 123 45 67');

/** Input ichidagi chap belgi: davlat aniqlansa bayroq, aks holda oddiy telefon ikonkasi (fallback). */
export const PhoneFlag: React.FC<{ value: string; fallback: React.ReactNode; className?: string }> = ({ value, fallback, className }) => {
  const c = phoneCountry(value);
  const [bad, setBad] = useState<string | null>(null);
  if (!c || bad === c.iso) return <>{fallback}</>;
  return (
    <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt={c.iso.toUpperCase()} width={20} height={14}
      onError={() => setBad(c.iso)}
      className={`rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] object-cover ${className || ''}`}
      style={{ width: 20, height: 14 }} />
  );
};
