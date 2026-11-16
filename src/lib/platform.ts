// Ilova Android qobig'i (operon-android MainActivity) ichida ochilganmi — User-Agent'da "OperonApp" belgisi bor.
// Google Play qoidalari uchun kerak (2026-11-16): ilova ichida pullik tarif sotilmaydi (Play Billing talabi),
// Google bilan kirish esa telefon brauzerida ochiladi (Google o'rnatilgan WebView'da kirishni bloklaydi).
export function isAndroidApp(): boolean {
  return typeof navigator !== 'undefined' && /OperonApp/.test(navigator.userAgent || '');
}
