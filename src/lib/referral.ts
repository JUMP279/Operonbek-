// Referal promokodi (2026-11-17): havola (?ref=KOD) yoki kirish sahifasidagi maydon → localStorage →
// kabinetga birinchi kirishda backend'ga bog'lanadi (POST /referral/apply). Backend qoidalari: services/referral.py.
import { api } from './api';

const KEY = 'findlead_ref';

export const normalizeRef = (v: string) => (v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);

export function pendingRef(): string {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function setPendingRef(code: string) {
  try {
    const c = normalizeRef(code);
    if (c) localStorage.setItem(KEY, c);
    else localStorage.removeItem(KEY);
  } catch {
    /* saqlab bo'lmasa — kabinetda qo'lda kiritiladi */
  }
}

// Kod do'st havolasidan (?ref=) kelganmi — shunda ro'yxatdan o'tishda «Вас пригласил друг» deb yoziladi.
const VIA_LINK = 'findlead_ref_link';
export function refFromLink(): boolean {
  try {
    return localStorage.getItem(VIA_LINK) === '1' && !!pendingRef();
  } catch {
    return false;
  }
}

/** Sahifa ochilganda ?ref=KOD ni eslab qoladi (URL'dan olib tashlamaydi — oddiy havola). */
export function captureRefFromUrl() {
  try {
    const r = new URLSearchParams(window.location.search).get('ref');
    if (r && normalizeRef(r)) {
      setPendingRef(r);
      localStorage.setItem(VIA_LINK, '1');
    }
  } catch {
    /* ignore */
  }
}

/** Kabinetga kirilgach bir marta: saqlangan kodni bog'lash. Xato (o'z kodi, allaqachon to'lagan…) — jimgina o'chiriladi. */
export async function applyPendingRef() {
  const code = pendingRef();
  if (!code) return;
  try {
    await api.referralApply(code);
    setPendingRef('');
  } catch (e: any) {
    // Tarmoq xatosi yoki jadval hali yo'q (503) — keyingi safar qayta urinamiz; qolganlari yakuniy
    if (e?.status && e.status !== 503) setPendingRef('');
  }
}
