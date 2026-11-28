// PWA: telefon ekraniga o'rnatish (2026-11-22). Sayt va ilovada BIR XIL fayl.
// `beforeinstallprompt` sahifa yuklanishi bilan keladi — komponent hali chizilmagan bo'lishi mumkin, shuning uchun
// hodisani shu yerda ushlab saqlaymiz va obunachilarga xabar beramiz.
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: BIPEvent | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function initPwa() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as BIPEvent; emit(); });
  window.addEventListener('appinstalled', () => { deferred = null; emit(); });
  if ('serviceWorker' in navigator && location.protocol === 'https:') {   // faqat jonli (https) saytda
    window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* o'rnatish ixtiyoriy */ }); });
  }
}

export const canPrompt = () => !!deferred;
export function onPwaChange(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const ev = deferred;
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  deferred = null; emit();
  return outcome === 'accepted';
}

export function isInstalled() {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isMobile = () => isIOS() || /android|mobile/i.test(navigator.userAgent);
