import { isAndroidApp } from './platform';
// FindLead backend (FastAPI) bilan aloqa qatlami.
// Manzil: VITE_API_URL; berilmasa — ilova backend'ning o'zidan (localhost:8000) tarqatilsa
// shu origin, aks holda (dev: localhost:3000) lokal backend.

const ENV_API = (import.meta as any).env?.VITE_API_URL as string | undefined;

export const API_BASE: string =
  ENV_API && ENV_API.trim()
    ? ENV_API.replace(/\/$/, '')
    : typeof window === 'undefined'
      ? 'http://localhost:8000'
      // Lokal dev (Vite, port 3000/5173) → lokal backend; aks holda (backend o'zi
      // tarqatgan sahifa: localhost:8000, Railway domeni) → shu origin.
      : (['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port !== '8000')
        ? 'http://localhost:8000'
        : '';

const TOKEN_KEY = 'operon_access_token';
const REFRESH_KEY = 'operon_refresh_token';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private mode — sessiya faqat shu tab davomida yashaydi */
  }
}

export const tokens = {
  get access() {
    return safeGet(TOKEN_KEY);
  },
  set(access: string, refresh?: string) {
    safeSet(TOKEN_KEY, access);
    if (refresh) safeSet(REFRESH_KEY, refresh);
  },
  clear() {
    safeSet(TOKEN_KEY, null);
    safeSet(REFRESH_KEY, null);
  },
};

/** Google'dan qaytilganda URL hash'idagi tokenlarni oladi va saqlaydi.
 *  Natija: null — OAuth qaytishi emas; aks holda maqsad ('login' | 'reset') yoki 'error'. */
export function consumeOAuthReturn(): null | 'login' | 'reset' | 'error' {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash || '';
  if (!h.includes('access_token=') && !h.includes('error=')) return null;
  const p = new URLSearchParams(h.replace(/^#/, ''));
  history.replaceState(null, '', window.location.pathname + window.location.search);
  let purpose: 'login' | 'reset' = 'login';
  // Android ilovasi: Google telefon brauzerida ochilgan, maqsad sessionStorage'da emas — URL'da (?oauth_p=reset)
  if (new URLSearchParams(window.location.search).get('oauth_p') === 'reset') purpose = 'reset';
  try {
    if (sessionStorage.getItem('operon_oauth_purpose') === 'reset') purpose = 'reset';
    sessionStorage.removeItem('operon_oauth_purpose');
  } catch {
    /* ignore */
  }
  const access = p.get('access_token');
  if (!access) return 'error';
  tokens.set(access, p.get('refresh_token') || undefined);
  return purpose;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** JWT payload'idagi `exp` (soniya). Imzo TEKSHIRILMAYDI — faqat "muddati o'tganmi" taxmini; tekshiruv backend'da. */
function tokenExp(token: string | null): number | null {
  if (!token) return null;
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))).exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

// TEZLIK (2026-11-17, sayt bilan bir xil): bir nechta so'rov bir vaqtda 401 olsa ham /auth/refresh BIR marta chaqiriladi.
let refreshing: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/** Access token muddati tugagan (yoki 30 s ichida tugaydigan) bo'lsa — so'rovdan OLDIN yangilaydi
 *  ("401 → refresh → qayta so'rov" zanjiri o'rniga). */
export async function ensureFreshToken(): Promise<void> {
  const exp = tokenExp(tokens.access);
  if (exp !== null && exp - Date.now() / 1000 < 30 && safeGet(REFRESH_KEY)) await tryRefresh();
}

async function doRefresh(): Promise<boolean> {
  const refresh = safeGet(REFRESH_KEY);
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.access_token) return false;
    tokens.set(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// Qurilma ID (2026-11-15): bepul sinov bitta tadbirkorga bir marta — backend services/trial_guard.py.
// localStorage'dagi tasodifiy UUID; hech qanday shaxsiy ma'lumot emas.
function clientId(): string {
  try {
    let v: string = localStorage.getItem('operon_cid') || '';
    if (!v || !/^[A-Za-z0-9_-]{16,80}$/.test(v)) {
      v = (crypto as any).randomUUID ? (crypto as any).randomUUID().replace(/-/g, '') : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('operon_cid', v);
    }
    return v;
  } catch {
    return '';
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  // FormData (fayl yuklash) — Content-Type'ni brauzer o'zi qo'yadi (boundary bilan)
  const headers: Record<string, string> = init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  if (retry) await ensureFreshToken();
  const access = tokens.access;
  if (access) headers.Authorization = `Bearer ${access}`;
  const cid = clientId();
  if (cid) headers['X-Client-Id'] = cid;

  // O'qish (GET) so'rovlari 30s dan ortiq osilib qolmasin — aks holda ekran abadiy aylanadi.
  // AI so'rovlari (POST) uzoq davom etishi mumkin, ularga cheklov qo'yilmaydi.
  const isRead = !init.method || init.method.toUpperCase() === 'GET';
  // 2026-11-10: o'qish so'rovi 20s da uziladi va tarmoq xatosida BIR marta o'zi takrorlanadi —
  // qisqa uzilish (Wi-Fi, server bandligi) ekranda "abadiy yuklanish" yoki xato bo'lib ko'rinmasin.
  const once = async (): Promise<Response> => {
    const ctrl = isRead && !init.signal ? new AbortController() : null;
    const timer = ctrl ? window.setTimeout(() => ctrl.abort(), 20000) : 0;
    try {
      return await fetch(`${API_BASE}${path}`, {
        ...init, headers: { ...headers, ...(init.headers as any) }, ...(ctrl ? { signal: ctrl.signal } : {}),
      });
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  };
  let res: Response;
  try {
    res = await once();
  } catch {
    if (!isRead) throw new ApiError(0, 'network');
    await new Promise((r) => window.setTimeout(r, 900));
    try {
      res = await once();
    } catch {
      throw new ApiError(0, 'network');
    }
  }

  if (res.status === 401 && retry && access && (await tryRefresh())) {
    return request<T>(path, init, false);
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = typeof body.detail === 'string' ? body.detail : '';
    } catch {
      /* body JSON emas */
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

// ── Turlar ────────────────────────────────────────────────────────────────
export interface MeResponse {
  id: string;
  email: string;
  plan: string;
  is_onboarded: boolean;
  onboarding_in_progress?: boolean;
  /** Yuridik rozilik (2026-11-14): joriy versiyaga rozilik yo'q bo'lsa true — majburiy oyna ko'rsatiladi */
  consent_required?: boolean;
  consent_version?: string | null;
  legal_version?: string;
  business: {
    id: string;
    brand_name: string;
    store_code: number;
    stage?: string;
    business_type?: string;
    city?: string;
    language?: 'kk' | 'ru' | null;
  } | null;
}

export type OnboardingMode = 'add' | 'create';

export interface QA {
  question: string;
  answer: string;
}

export interface BusinessProfile {
  brand_name: string;
  business_type: string;
  city: string;
  target_audience: string | null;
  price_range: string | null;
  instagram_handle: string | null;
  communication_style: string | null;
  channels: string[];
  summary: string;
}

export interface DashboardProduct {
  id: string;
  name: string;
  product_code: string | number | null;
  price: number | null;
  stock: number | null;
  is_active: boolean | null;
  image_url: string | null;
  created_at: string;
}

export interface DashboardOrder {
  id: string;
  product_name: string;
  product_code: string | number | null;
  customer_id: string | null;
  status: 'inquiry' | 'confirmed' | 'delivered' | 'cancelled' | string;
  amount: number;
  created_at: string;
  /** kaspi | wb | uzum | instagram | telegram | manual */
  source?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  quantity?: number;
  external_id?: string | null;
  /** interest | ordered | paid_claimed (suhbatdan) yoki marketplace holati */
  external_status?: string | null;
  note?: string | null;
  order_currency?: string | null;
}

export interface RetentionCustomer {
  customer_id: string; name: string | null; phone: string | null; orders: number; total: number;
  last_at: string; days: number; source: string;
}

export interface RetentionDetail {
  basis: 'sales' | 'chats' | 'none';
  rate: number; prev_rate: number | null;
  buyers: number; returning_buyers: number; new_buyers: number; total_buyers: number;
  repeat_30d_pct: number | null; avg_days_between: number | null;
  at_risk: number; lost: number;
  chat_customers: number; chat_returning: number; chat_rate: number | null;
  top: RetentionCustomer[]; win_back: RetentionCustomer[];
}

export interface ActivityDetail {
  weekday: { orders: number; inquiries: number; messages: number; revenue: number }[];
  hours: number[];
  best_day: number | null; quiet_day: number | null; best_hour: number | null; total: number;
}

export interface MarketplaceState {
  migrated: boolean;
  sources: Record<'kaspi' | 'wb' | 'uzum', {
    connected: boolean; token_hint: string | null; connected_at?: string | null;
    last_sync?: string | null; last_error?: string | null; orders?: number | null;
  }>;
}

export interface DashboardNotification {
  id: string;
  title: string | null;
  message: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
}

export interface TelegramInfo {
  bot_linked: boolean;
  channel: string | null;
  channel_url: string | null;
  connected: boolean;
  bot_username: string;
  /** Mijozlar uchun havola: bosgan mijoz do'kon bilan bot chatiga tushadi */
  customer_link?: string | null;
  /** Ulangan izohlar (muhokama) guruhi nomi */
  comments_group?: string | null;
  /** Tadbirkorning o'z boti (do'kon nomi/logotipi bilan) — services/own_bot.py */
  own_bot?: { username: string; name: string; connected_at?: string } | null;
}

export interface DashboardData {
  business: {
    id: string;
    brand_name: string;
    store_code: number;
    city: string | null;
    stage: string | null;
    instagram_connected: boolean;
    telegram_connected: boolean;
  };
  language: 'kk' | 'ru' | null;
  currency: string;
  channels: string[];
  range: { days: number; from: string; to: string };
  metrics: {
    revenue: number;
    revenue_change: number | null;
    orders: number;
    orders_change: number | null;
    inquiries: number;
    inquiries_change: number | null;
    potential_revenue: number;
    customers: number;
    customers_change: number | null;
    conversations: number;
    conversations_change: number | null;
    posts_published: number;
    posts_published_change: number | null;
    products_active: number;
    products_total: number;
  };
  series: { date: string; revenue: number; orders: number; inquiries: number; prev_revenue?: number }[];
  /** 2026-11-16: o'rtacha chek, o'tgan davr, eng yaxshi kun */
  revenue_stats?: RevenueStats;
  segments: { returning: number; new: number; inquiry_only: number };
  retention: number;
  retention_detail?: RetentionDetail;
  weekday_activity: number[];
  activity?: ActivityDetail;
  conversations_by_platform: Record<string, number>;
  products: DashboardProduct[];
  orders: DashboardOrder[];
  notifications: DashboardNotification[];
  unread_notifications: number;
}

// ── Endpointlar ───────────────────────────────────────────────────────────
export const api = {
  async login(email: string, password: string) {
    const data = await request<{ access_token: string; refresh_token: string; user: { id: string; email: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    );
    tokens.set(data.access_token, data.refresh_token);
    return data.user;
  },

  async register(email: string, password: string) {
    const r = await request<{ needs_confirmation?: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Supabase "Confirm email" yoqiq: avval emaildagi havola bosilishi kerak
    if (r.needs_confirmation) throw new ApiError(403, 'email_not_confirmed');
    // Supabase'da avto-tasdiq yoqilgan — darhol kiramiz.
    return api.login(email, password);
  },

  me: () => request<MeResponse>('/auth/me'),

  // ── 2026-11-08: biznes nomi + parol / Google ──
  async loginBusiness(login: string, password: string) {
    // 2026-11-21: login POST tarmoq uzilsa (status 0) BIR marta qayta uriniladi — qisqa uzilishda
    // (Cloudflare tunnel / server bandligi) "Не удалось подключиться" xato bo'lib ko'rinmasin.
    // Login idempotent (faqat token beradi, hech narsa yaratmaydi) — qayta urinish xavfsiz.
    const call = () => request<{ access_token: string; refresh_token: string }>('/auth/login-business', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
    let data;
    try {
      data = await call();
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) {
        await new Promise((r) => setTimeout(r, 900));
        data = await call();
      } else throw e;
    }
    tokens.set(data.access_token, data.refresh_token);
  },

  /** Google'ga yo'naltiradi; qaytishda URL #access_token=... bilan keladi (consumeOAuthReturn). */
  async startGoogle(purpose: 'login' | 'reset' = 'login') {
    try {
      sessionStorage.setItem('operon_oauth_purpose', purpose);
    } catch {
      /* ignore */
    }
    // Android ilovasi (2026-11-16): Google o'rnatilgan WebView'da kirishni bloklaydi — MainActivity Supabase
    // havolasini telefon brauzerida ochadi, qaytish /app-return → findlead://auth orqali ilovaga keladi.
    const back = isAndroidApp()
      ? `${window.location.origin}/app-return?oauth_p=${purpose}`
      : window.location.origin + window.location.pathname;
    const r = await request<{ url: string }>(`/auth/google/url?redirect_to=${encodeURIComponent(back)}`);
    window.location.href = r.url;
  },

  nameAvailable: (name: string) =>
    request<{ available: boolean }>(`/auth/name-available?name=${encodeURIComponent(name)}`),

  // Parol o'rnatilgach Supabase eski sessiyani bekor qiladi — server qaytargan YANGI tokenlarni saqlaymiz.
  async setupAccount(business_name: string, password: string, mode: OnboardingMode, language: 'kk' | 'ru', consent_version?: string | null) {
    const r = await request<{ business: { id: string; brand_name: string }; access_token?: string; refresh_token?: string }>(
      '/auth/setup',
      { method: 'POST', body: JSON.stringify({ business_name, password, mode, language, consent_version: consent_version || null }) },
    );
    if (r.access_token) tokens.set(r.access_token, r.refresh_token);
    return r;
  },

  async setNewPassword(password: string) {
    const r = await request<{ ok: boolean; access_token?: string; refresh_token?: string }>('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (r.access_token) tokens.set(r.access_token, r.refresh_token);
    return r;
  },

  // Savolsiz: "Biznesni qo'shish" / "Biznes yaratish" — biznes darhol yaratiladi.
  onboardingQuick: (mode: OnboardingMode, language: 'kk' | 'ru') =>
    request<{ business: { id: string; brand_name: string } }>('/onboarding/quick', {
      method: 'POST',
      body: JSON.stringify({ mode, language }),
    }),

  dashboard: (businessId: string, days: number) =>
    request<DashboardData>(`/dashboard/${encodeURIComponent(businessId)}?days=${days}`),

  marketplaces: (businessId: string) => request<MarketplaceState>(`/marketplaces/${encodeURIComponent(businessId)}`),
  marketplaceConnect: (businessId: string, source: string, token: string) =>
    request<MarketplaceState>(`/marketplaces/${encodeURIComponent(businessId)}/connect`, {
      method: 'POST', body: JSON.stringify({ source, token }),
    }),
  marketplaceDisconnect: (businessId: string, source: string) =>
    request<MarketplaceState>(`/marketplaces/${encodeURIComponent(businessId)}/${source}`, { method: 'DELETE' }),
  marketplaceSync: (businessId: string) =>
    request<MarketplaceState>(`/marketplaces/${encodeURIComponent(businessId)}/sync`, { method: 'POST' }),

  markNotificationsRead: (businessId: string) =>
    request(`/business/${encodeURIComponent(businessId)}/notifications/read`, { method: 'POST' }),

  setOrderStatus: (businessId: string, orderId: string, status: 'inquiry' | 'confirmed' | 'cancelled') =>
    request(`/business/${encodeURIComponent(businessId)}/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Biznes xotirasi (business_memory_core / _dynamic / _experience) — AI shu yerdan o'qiydi
  memoryContext: (businessId: string) => request<MemoryContext>(`/memory/${encodeURIComponent(businessId)}/context`),

  saveCoreMemory: (businessId: string, category: string, key: string, value: string) =>
    request('/memory/core', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, category, key, value }),
    }),

  deleteCoreMemory: (businessId: string, key: string) =>
    request(`/memory/core?business_id=${encodeURIComponent(businessId)}&key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    }),

  addDynamicMemory: (businessId: string, content: string) =>
    request('/memory/dynamic', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, type: 'promotion', content, active: true }),
    }),

  deleteDynamicMemory: (businessId: string, rowId: string) =>
    request(`/memory/dynamic/${encodeURIComponent(rowId)}?business_id=${encodeURIComponent(businessId)}`, {
      method: 'DELETE',
    }),

  // Video tarixi (yaratish — videoPlan* orqali, services/video_plan.py)
  videos: (businessId: string) => request<{ videos: VideoItem[] }>(`/videos/${encodeURIComponent(businessId)}`),

  // Instagram (Meta Unified login): imzolangan ulash havolasi va holat
  instagramLink: (businessId: string) =>
    request<{ login_url: string; expires_in: number }>(`/auth/instagram/link/${encodeURIComponent(businessId)}`),

  // Telegram (2026-11-10): imzolangan havola → bot → kanalga admin; holat va uzish
  telegramLink: (businessId: string) =>
    request<{ deep_link: string; bot_username: string; expires_in: number }>(`/business/telegram-link/${encodeURIComponent(businessId)}`),
  telegramInfo: (businessId: string) =>
    request<TelegramInfo>(`/business/${encodeURIComponent(businessId)}/telegram`),
  telegramDisconnect: (businessId: string) =>
    request<{ ok: boolean }>(`/business/${encodeURIComponent(businessId)}/telegram/disconnect`, { method: 'POST' }),

  instagramDisconnect: (businessId: string) =>
    request<{ ok: boolean }>(`/auth/instagram/disconnect/${encodeURIComponent(businessId)}`, { method: 'POST' }),
  instagramStatus: (businessId: string) =>
    request<{ connected: boolean; healthy?: boolean | null; user_id: string | null; username: string | null; telegram_url?: string | null }>(
      `/auth/instagram/status/${encodeURIComponent(businessId)}`,
    ),

  // Video rejasi: uslub so'rovnomasi → tarif bo'yicha jadval → oldindan ssenariy
  videoProfile: (businessId: string) =>
    request<{ profile: VideoProfile | null; done: boolean }>(`/videos/profile/${encodeURIComponent(businessId)}`),

  // Qahramon: Pinterest qidiruv / havola / matn → JSON (fonda)
  characterSearch: (businessId: string, wish: string) =>
    request<{ query: string; items: CharacterCandidate[] }>('/videos/profile/character/search', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, wish: wish || null }),
    }),

  characterPick: (businessId: string, src: { image_url?: string; link?: string }, wish: string) =>
    request<{ character_image_url: string; character_status: string }>('/videos/profile/character/pick', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, ...src, wish: wish || null }),
    }),

  // Rasm bo'lmasa — FindLead qahramonni (tavsifdan yoki o'zi tanlab) yaratadi va rasmini chizadi
  characterGenerate: (businessId: string, wish: string) =>
    request<{ character_json: Record<string, string | string[]>; character_image_url: string | null; character_status: string }>(
      '/videos/profile/character/generate',
      { method: 'POST', body: JSON.stringify({ business_id: businessId, wish: wish || null }) },
    ),

  characterText: (businessId: string, wish: string) =>
    request<{ character_json: Record<string, string | string[]>; character_status: string }>(
      '/videos/profile/character/text',
      { method: 'POST', body: JSON.stringify({ business_id: businessId, wish: wish || null }) },
    ),

  saveVideoProfile: (
    businessId: string,
    p: Pick<VideoProfile, 'direction' | 'genre' | 'has_character' | 'character_note' | 'extra' | 'seconds' | 'art_style'>,
  ) =>
    request<{ profile: VideoProfile }>('/videos/profile', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, ...p }),
    }),

  uploadCharacter: (businessId: string, imageBase64: string, mime: string, consent = false) =>
    request<{ character_image_url: string; character_desc: string | null }>('/videos/profile/character', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, image_base64: imageBase64, mime, consent }),
    }),

  videoPlan: (businessId: string) => request<VideoPlan>(`/videos/plan/${encodeURIComponent(businessId)}`),
  videoOnboarding: (businessId: string) =>
    request<VideoOnboarding>(`/videos/onboarding/${encodeURIComponent(businessId)}`),
  videoProductsStep: (businessId: string, skipped: boolean) =>
    request<VideoOnboarding>('/videos/onboarding/products-step', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, skipped }),
    }),

  createVideoPlan: (businessId: string, times: string[]) =>
    request<{ created: number; items: VideoPlanItem[] }>('/videos/plan', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, times }),
    }),

  regenerateVideoItem: (postId: string, wish?: string) =>
    request<{ id: string; topic: string; scenario: string; caption: string; lang?: ContentLang | null; seconds?: number | null; style?: VideoPlanItem['style'] }>(
      `/videos/plan/items/${encodeURIComponent(postId)}/regenerate`,
      { method: 'POST', body: JSON.stringify({ wish: wish || null }) },
    ),

  stopVideoPlan: (businessId: string) =>
    request<{ ok: boolean }>(`/videos/plan/${encodeURIComponent(businessId)}`, { method: 'DELETE' }),

  switchVideoItemLang: (postId: string, lang: ContentLang) =>
    request<{ id: string; topic: string; scenario: string; caption: string; lang: ContentLang; seconds?: number | null; style?: VideoPlanItem['style'] }>(
      `/videos/plan/items/${encodeURIComponent(postId)}/language`,
      { method: 'POST', body: JSON.stringify({ lang }) },
    ),

  // Kunlik post rejasi
  postPlan: (businessId: string) => request<PostPlan>(`/post-plan/${encodeURIComponent(businessId)}`),

  createPostPlan: (businessId: string, time: string) =>
    request<{ created: number; items: PostPlanItem[] }>('/post-plan', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, time }),
    }),

  switchPostItemLang: (postId: string, lang: ContentLang) =>
    request<{ id: string; text: string; hashtags: string[]; lang: ContentLang }>(
      `/post-plan/items/${encodeURIComponent(postId)}/language`,
      { method: 'POST', body: JSON.stringify({ lang }) },
    ),

  regeneratePostItem: (postId: string, wish?: string) =>
    request<{ id: string; text: string; hashtags: string[]; lang: ContentLang; image_url: string | null }>(
      `/post-plan/items/${encodeURIComponent(postId)}/regenerate`,
      { method: 'POST', body: JSON.stringify({ wish: wish || null }) },
    ),

  // 2026-11-16: avtomat / yarim avtomat (har video/post tadbirkor tasdig'idan keyin chiqadi)
  setVideoApproval: (businessId: string, mode: ApprovalMode) =>
    request<{ approval: ApprovalMode; items: VideoPlanItem[] }>(`/videos/plan/${encodeURIComponent(businessId)}/approval`, {
      method: 'PUT', body: JSON.stringify({ mode }),
    }),
  approveVideoItem: (postId: string) =>
    request<{ id: string; status: string }>(`/videos/plan/items/${encodeURIComponent(postId)}/approve`, { method: 'POST' }),
  skipVideoItem: (postId: string) =>
    request<{ id: string; status: string }>(`/videos/plan/items/${encodeURIComponent(postId)}/skip`, { method: 'POST' }),
  redoVideoItem: (postId: string, wish?: string) =>
    request<{ id: string; status: string }>(`/videos/plan/items/${encodeURIComponent(postId)}/redo`, {
      method: 'POST', body: JSON.stringify({ wish: wish || null }),
    }),
  setPostApproval: (businessId: string, mode: ApprovalMode) =>
    request<{ approval: ApprovalMode; items: PostPlanItem[] }>(`/post-plan/${encodeURIComponent(businessId)}/approval`, {
      method: 'PUT', body: JSON.stringify({ mode }),
    }),
  approvePostItem: (postId: string) =>
    request<{ id: string; status: string }>(`/post-plan/items/${encodeURIComponent(postId)}/approve`, { method: 'POST' }),
  skipPostItem: (postId: string) =>
    request<{ id: string; status: string }>(`/post-plan/items/${encodeURIComponent(postId)}/skip`, { method: 'POST' }),

  stopPostPlan: (businessId: string) =>
    request<{ ok: boolean }>(`/post-plan/${encodeURIComponent(businessId)}`, { method: 'DELETE' }),

  // Mijozlar bilan suhbatlar (Instagram izoh/Direct, Telegram)
  conversations: (businessId: string) =>
    request<{ conversations: Conversation[]; counts?: ConvCounts }>(`/business/${encodeURIComponent(businessId)}/conversations`),

  // Instagram profil maslahatlari: nom, BIO, Актуальное, qadab qo'yish (services/profile_tips.py)
  profileTips: (businessId: string, lang: 'ru' | 'kk', refresh = false) =>
    request<ProfileTips>(`/growth/${encodeURIComponent(businessId)}/profile-tips?lang=${lang}${refresh ? '&refresh=1' : ''}`),

  // FindLead o'z videolarida nimani sinayapti (services/format_stats.summary)
  experiments: (businessId: string) =>
    request<Experiments>(`/growth/${encodeURIComponent(businessId)}/experiments`),

  // FindLead qo'llab-quvvatlashi (services/support_desk.py)
  supportThread: (businessId: string) => request<SupportThread>(`/support/business/${encodeURIComponent(businessId)}`),
  supportUnread: (businessId: string) => request<{ unread: number }>(`/support/business/${encodeURIComponent(businessId)}/unread`),
  /** Akkauntni butunlay o'chirish (Google Play talabi). */
  deleteAccount: () => request<{ deleted: boolean }>('/auth/account/delete', { method: 'POST', body: JSON.stringify({ confirm: 'DELETE' }) }),
  /** ИИ-контентга shikoyat (Google Play: generativ AI). */
  aiReport: (businessId: string, body: { kind: string; ref?: string; reason?: string; excerpt?: string }) =>
    request<{ id: string }>(`/support/business/${encodeURIComponent(businessId)}/ai-report`, { method: 'POST', body: JSON.stringify(body) }),
  supportSend: (businessId: string, message: string) =>
    request<{ id: string; at: string }>(`/support/business/${encodeURIComponent(businessId)}`, { method: 'POST', body: JSON.stringify({ message }) }),

  // Telegram Business (services/tg_business.py): AI egasining shaxsiy akkaunti nomidan javob beradi
  telegramBusiness: (businessId: string) =>
    request<TelegramBusinessState>(`/business/${encodeURIComponent(businessId)}/telegram-business`),

  // Voronka + javob vaqti (services/conv_insights.py)
  conversationInsights: (businessId: string, days: 7 | 30 | 90 = 30) =>
    request<ConvInsights>(`/business/${encodeURIComponent(businessId)}/conversations/insights?days=${days}`),

  // Narx himoyasi (services/price_guard.py): savdolashish, maksimal chegirma, minimal narxlar
  priceRules: (businessId: string) =>
    request<PriceRules>(`/products/${encodeURIComponent(businessId)}/price-rules`),
  savePriceRules: (businessId: string, r: PriceRules) =>
    request<PriceRules>(`/products/${encodeURIComponent(businessId)}/price-rules`, { method: 'PUT', body: JSON.stringify(r) }),

  // Katalogni fayldan yuklash (services/catalog_import.py): avval ko'rib chiqish, keyin tasdiqlash
  importPreview: (businessId: string, file: File) => {
    const fd = new FormData();
    fd.append('business_id', businessId);
    fd.append('file', file);
    return request<ImportPreview>('/products/import/preview', { method: 'POST', body: fd });
  },
  importCommit: (businessId: string, rows: ImportRow[], markupPercent = 0, updateExisting = true) =>
    request<{ added: number; updated: number; skipped: number }>('/products/import/commit', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, rows, markup_percent: markupPercent, update_existing: updateExisting }),
    }),

  replyConversation: (businessId: string, convId: string, text: string) =>
    request<{ ok: boolean; sent: boolean; error: string | null }>(
      `/business/${encodeURIComponent(businessId)}/conversations/${encodeURIComponent(convId)}/reply`,
      { method: 'POST', body: JSON.stringify({ text }) },
    ),

  /** «Сделки»: хотят купить / продано / не купили */
  deals: (businessId: string) => request<DealsBoard>(`/business/${encodeURIComponent(businessId)}/deals`),

  closeDeal: (businessId: string, convId: string, action: 'won' | 'lost' | 'ai') =>
    request<{ ok: boolean }>(
      `/business/${encodeURIComponent(businessId)}/conversations/${encodeURIComponent(convId)}/deal`,
      { method: 'POST', body: JSON.stringify({ action }) },
    ),

  toggleConversationAi: (businessId: string, convId: string, enabled: boolean) =>
    request<{ ok: boolean; ai_enabled: boolean }>(
      `/business/${encodeURIComponent(businessId)}/conversations/${encodeURIComponent(convId)}/ai`,
      { method: 'PATCH', body: JSON.stringify({ enabled }) },
    ),

  aiTone: (businessId: string) =>
    request<{ instruction: string }>(`/business/${encodeURIComponent(businessId)}/ai-tone`),

  setAiTone: (businessId: string, instruction: string) =>
    request<{ instruction: string }>(`/business/${encodeURIComponent(businessId)}/ai-tone`, {
      method: 'POST', body: JSON.stringify({ instruction }),
    }),

  // Biznes nomi (kirish login'i ham) — bandligi backend'da tekshiriladi (409 name_taken)
  updateBusiness: (businessId: string, data: { brand_name?: string; city?: string }) =>
    request<{ business: { brand_name: string } }>(`/business/${encodeURIComponent(businessId)}`, {
      method: 'PUT', body: JSON.stringify(data),
    }),

  analytics: (businessId: string, days: number, refresh = false) =>
    request<Analytics>(`/analytics/${encodeURIComponent(businessId)}?days=${days}${refresh ? '&refresh=true' : ''}`),

  // Biznes-tahlil: raqobatchilar (Kaspi/WB/Uzum/Instagram/Telegram) + o'z biznes sog'lig'i, har 3 kunda
  market: (businessId: string) => request<MarketState>(`/market/${encodeURIComponent(businessId)}`),
  marketWatch: (businessId: string, watch: MarketWatch) =>
    request<{ watch: MarketWatch }>(`/market/${encodeURIComponent(businessId)}/watch`, {
      method: 'PUT', body: JSON.stringify(watch),
    }),
  marketRefresh: (businessId: string) =>
    request<{ running: boolean }>(`/market/${encodeURIComponent(businessId)}/refresh`, { method: 'POST' }),

  planUsage: (businessId: string) => request<PlanUsage>(`/brand/${encodeURIComponent(businessId)}/usage`),

  // Tarif so'rovi: tarifni O'ZI yoqmaydi — FindLead to'lovni qabul qilib tasdiqlaydi (services/billing.py)
  requestPlan: (plan: 'starter' | 'growth' | 'business') =>
    request<{ status: 'pending'; plan: string }>('/auth/plan', { method: 'POST', body: JSON.stringify({ plan }) }),

  // Referal dasturi (2026-11-17) — sayt bilan bir xil: routers/referral.py
  referral: () => request<ReferralInfo>('/referral'),
  referralCheck: (code: string) => request<{ valid: boolean; code: string }>(`/referral/check/${encodeURIComponent(code)}`),
  referralApply: (code: string) =>
    request<{ ok: boolean; code: string }>('/referral/apply', { method: 'POST', body: JSON.stringify({ code }) }),
  referralPayout: (amount: number, method: string, account: string, holder: string) =>
    request<{ ok: boolean }>('/referral/payout', { method: 'POST', body: JSON.stringify({ amount, method, account, holder }) }),
  referralPayPlan: (plan: 'starter' | 'growth' | 'business') =>
    request<{ ok: boolean; plan: string }>('/referral/pay-plan', { method: 'POST', body: JSON.stringify({ plan }) }),

  // Brend: kontent yo'nalishi + logotip
  brand: (businessId: string) => request<BrandStatus>(`/brand/${encodeURIComponent(businessId)}`),

  setNiche: (businessId: string, niche: string) =>
    request<BrandStatus>('/brand/niche', { method: 'POST', body: JSON.stringify({ business_id: businessId, niche }) }),

  uploadLogo: (businessId: string, file: File) => {
    const fd = new FormData();
    fd.append('business_id', businessId);
    fd.append('file', file);
    return request<BrandStatus>('/brand/logo', { method: 'POST', body: fd });
  },

  deleteLogo: (businessId: string) =>
    request<BrandStatus>(`/brand/logo/${encodeURIComponent(businessId)}`, { method: 'DELETE' }),

  // Postlar: AI yaratadi (draft) → tahrir → Instagram/Telegram'ga nashr
  generatePost: (businessId: string, platform: PostPlatform, topic: string, style: string) =>
    request<GeneratedPost>('/posts/generate', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, platform, topic: topic || null, style, mode: 'manual' }),
    }),

  editPost: (postId: string, content: string, hashtags: string[], platform: PostPlatform) =>
    request<{ ok: boolean }>(`/posts/${encodeURIComponent(postId)}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content, hashtags, platform }),
    }),

  publishPost: (postId: string) =>
    request<PublishResult>(`/posts/publish/${encodeURIComponent(postId)}`, { method: 'POST' }),

  posts: (businessId: string, limit = 40) =>
    request<{ posts: PostRow[] }>(`/posts/${encodeURIComponent(businessId)}?limit=${limit}`),

  // Mahsulotlar
  products: (businessId: string) =>
    request<{ products: Product[] }>(`/products/${encodeURIComponent(businessId)}`),

  createProduct: (businessId: string, p: ProductInput) =>
    request<{ product: Product }>('/products/create', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, ...p }),
    }),

  updateProduct: (productId: string, p: Partial<ProductInput>) =>
    request<{ product: Product }>(`/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      body: JSON.stringify(p),
    }),

  deleteProduct: async (productId: string) => {
    // 204 — tana yo'q, shuning uchun request() ning res.json() siz varianti
    const access = tokens.access;
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: access ? { Authorization: `Bearer ${access}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, '');
  },

  uploadProductImage: (businessId: string, file: File) => {
    const fd = new FormData();
    fd.append('business_id', businessId);
    fd.append('file', file);
    return request<{ image_url: string }>('/products/upload-image', { method: 'POST', body: fd });
  },

  // Biznes tushunchasi (2026-11-13): FindLead biznesni qanday tushungani + tadbirkor tuzatishlari.
  // AI chat EMAS — tuzatishdan keyin tushuncha fonda ~3 daqiqada qayta yoziladi.
  understanding: (businessId: string) =>
    request<BusinessUnderstanding>(`/memory/${encodeURIComponent(businessId)}/understanding`),
  addUnderstandingCorrection: (businessId: string, text: string) =>
    request<BusinessUnderstanding>(`/memory/${encodeURIComponent(businessId)}/understanding/corrections`, {
      method: 'POST', body: JSON.stringify({ text }),
    }),
  deleteUnderstandingCorrection: (businessId: string, index: number) =>
    request<BusinessUnderstanding>(`/memory/${encodeURIComponent(businessId)}/understanding/corrections/${index}`, {
      method: 'DELETE',
    }),

  // Yuridik hujjatlar (services/legal.py) va rozilik (POST /auth/consent)
  legalIndex: () => request<{ version: string; docs: string[] }>('/legal'),
  legalDoc: (doc: string, lang: 'kk' | 'ru') => request<LegalDoc>(`/legal/${encodeURIComponent(doc)}?lang=${lang}`),
  acceptConsent: (version: string) =>
    request<{ ok: boolean; version: string; at: string }>('/auth/consent', {
      method: 'POST', body: JSON.stringify({ version, cross_border: true }),
    }),

  // Marketplace: sharhlar, kartochka generatori, bog'lanishlar (2026-11-15) — services/mp_reviews.py, mp_cards.py, mp_links.py
  mpReviews: (businessId: string, refresh = false) =>
    request<MpReviews>(`/marketplaces/${encodeURIComponent(businessId)}/reviews${refresh ? '?refresh=true' : ''}`),
  mpReviewDraft: (businessId: string, r: MpReview, lang: 'ru' | 'kk') =>
    request<{ text: string }>(`/marketplaces/${encodeURIComponent(businessId)}/reviews/draft`, {
      method: 'POST',
      body: JSON.stringify({ id: r.id, source: r.source, rating: r.rating || 0, text: r.text || '', pros: r.pros || '',
        cons: r.cons || '', author: r.author, product: r.product, lang }),
    }),
  mpReviewAnswer: (businessId: string, id: string, text: string) =>
    request<{ ok: boolean }>(`/marketplaces/${encodeURIComponent(businessId)}/reviews/answer`, {
      method: 'POST', body: JSON.stringify({ id, text }),
    }),
  mpGuide: (businessId: string) => request<MpGuide>(`/marketplaces/${encodeURIComponent(businessId)}/guide`),
  mpCalcPresets: (businessId: string) =>
    request<{ presets: Record<MpPlat, MpCalcPreset>; uzum_logistics: Record<'s' | 'm' | 'l', number>; target_margin: number }>(
      `/marketplaces/${encodeURIComponent(businessId)}/calc`),
  mpCalc: (businessId: string, body: MpCalcInput) =>
    request<MpCalcResult>(`/marketplaces/${encodeURIComponent(businessId)}/calc`, { method: 'POST', body: JSON.stringify(body) }),
  mpOrdersWatch: (businessId: string) => request<MpOrdersWatch>(`/marketplaces/${encodeURIComponent(businessId)}/orders-watch`),
  mpCards: (businessId: string, productId: string) =>
    request<{ cards: Partial<Record<'kaspi' | 'wb' | 'uzum', MpCard>> }>(`/marketplaces/${encodeURIComponent(businessId)}/cards/${encodeURIComponent(productId)}`),
  mpCardGenerate: (businessId: string, productId: string, platform: 'kaspi' | 'wb' | 'uzum', extra = '', images = true) =>
    request<{ card: MpCard }>(`/marketplaces/${encodeURIComponent(businessId)}/cards/${encodeURIComponent(productId)}`, {
      method: 'POST', body: JSON.stringify({ platform, extra, images }),
    }),
  mpLinks: (businessId: string) => request<MpLinks>(`/marketplaces/${encodeURIComponent(businessId)}/links`),
  mpLinkSet: (businessId: string, productId: string, source: 'kaspi' | 'wb' | 'uzum', skus: string[]) =>
    request<MpLinks>(`/marketplaces/${encodeURIComponent(businessId)}/links/${encodeURIComponent(productId)}`, {
      method: 'PUT', body: JSON.stringify({ source, skus }),
    }),
  mpStockSync: (businessId: string, source: 'kaspi' | 'wb' | 'uzum', on: boolean) =>
    request<MpLinks>(`/marketplaces/${encodeURIComponent(businessId)}/stock-sync`, {
      method: 'PUT', body: JSON.stringify({ source, on }),
    }),

  // Marketplace hisoboti (2026-11-14): buyurtmalar + WB voronkasi — services/marketplace_report.py
  marketplaceReport: (businessId: string, days = 30, refresh = false) =>
    request<MarketplaceReport>(`/marketplaces/${encodeURIComponent(businessId)}/report?days=${days}${refresh ? '&refresh=true' : ''}`),

  // Tadbirkor g'oyalari (2026-11-14)
  ownerIdeas: (businessId: string, kind: 'video' | 'post') =>
    request<{ ideas: OwnerIdea[] }>(`/ideas/${encodeURIComponent(businessId)}?kind=${kind}`),
  addOwnerIdea: (businessId: string, kind: 'video' | 'post', text: string) =>
    request<{ ideas: OwnerIdea[] }>(`/ideas/${encodeURIComponent(businessId)}`, { method: 'POST', body: JSON.stringify({ kind, text }) }),
  deleteOwnerIdea: (businessId: string, id: string) =>
    request<{ ok: boolean }>(`/ideas/${encodeURIComponent(businessId)}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  applyOwnerIdea: (businessId: string, id: string) =>
    request<{ ok: boolean; post_id: string; scheduled_at: string; ideas: OwnerIdea[] }>(
      `/ideas/${encodeURIComponent(businessId)}/${encodeURIComponent(id)}/apply`, { method: 'POST' }),

  growth: (businessId: string, lang: 'kk' | 'ru', refresh = false) =>
    request<GrowthChecklist>(`/growth/${encodeURIComponent(businessId)}?lang=${lang}${refresh ? '&refresh=1' : ''}`),
  setGrowthDone: (businessId: string, item: string, done: boolean) =>
    request<{ ok: boolean }>(`/growth/${encodeURIComponent(businessId)}/done`, { method: 'POST', body: JSON.stringify({ item, done }) }),

  logout() {
    tokens.clear();
  },
};

export interface BusinessUnderstanding {
  summary: string;
  facts: string[];
  corrections: { text: string; at: string }[];
  /** empty | updating | ready | error */
  status: string;
  updated_at: string | null;
}

export interface LegalDoc {
  id: string;
  lang: 'kk' | 'ru';
  version: string;
  updated: string;
  title: string;
  intro: string;
  sections: { h: string; p: (string | string[])[] }[];
}

/** Google'ga ketishdan oldin belgilangan rozilik versiyasi (qaytgach /auth/setup ga yuboriladi) */
export const pendingConsent = {
  get(): string | null {
    try { return sessionStorage.getItem('operon_consent_version'); } catch { return null; }
  },
  set(v: string | null) {
    try { if (v) sessionStorage.setItem('operon_consent_version', v); else sessionStorage.removeItem('operon_consent_version'); } catch { /* ignore */ }
  },
};

export interface MpOrdersBlock {
  connected: boolean;
  last_sync: string | null;
  last_error: string | null;
  connected_at?: string | null;
  currency: string | null;
  totals: { orders: number; units: number; revenue: number; cancelled: number; sold: number; avg_check: number | null; cancel_pct: number | null;
    /** WB: haqiqiy sotib olish (Продажи API), qaytarish, yo'ldagi buyurtmalar, buyurtma summasi */
    bought?: number; returned?: number; ordered_revenue?: number; buyout_pct?: number | null; in_transit?: number | null };
  products: { title: string; orders: number; units: number; revenue: number; cancelled: number; cancel_pct: number | null; first_order: string; last_order: string;
    bought?: number; returned?: number; buyout_pct?: number | null; product_id?: string | null }[];
  series: { date: string; orders: number; revenue: number; cancelled: number }[];
}

export interface WbFunnelProduct {
  nm_id: number | string | null; title: string; vendor_code: string | null; brand: string | null;
  open: number; cart: number; order: number; order_sum: number; buyout: number; buyout_sum: number; cancel: number;
  add_to_cart_pct: number | null; cart_to_order_pct: number | null; buyout_pct: number | null;
  stock: number; created_at: string | null; photo: string | null;
}

export interface WbFunnel {
  error?: string;
  stale?: boolean;
  period?: { start: string; end: string };
  totals?: { open: number; cart: number; order: number; buyout: number; cancel: number; order_sum: number; buyout_sum: number;
    add_to_cart_pct: number | null; cart_to_order_pct: number | null; buyout_pct: number | null };
  products?: WbFunnelProduct[];
}

export interface MarketplaceReport {
  days: number;
  generated_at: string;
  sources: { kaspi: MpOrdersBlock; wb: MpOrdersBlock & { funnel?: WbFunnel }; uzum: MpOrdersBlock };
}

/** Tadbirkorning o'z g'oyasi (services/owner_ideas.py) — keyingi video/post shu bo'yicha tayyorlanadi */
export interface OwnerIdea {
  id: string;
  kind: 'video' | 'post';
  text: string;
  created_at: string;
  status: 'new' | 'used';
  used_at?: string | null;
  post_id?: string | null;
  scheduled_at?: string | null;
}

/** Obunachilarni o'stirish rejasi (services/growth_playbook.py) */
export interface GrowthChecklist {
  items: { id: string; group: 'base' | 'instagram' | 'telegram' | 'growth'; kind: 'auto' | 'manual'; title: string; how: string; done: boolean }[];
  done: number;
  total: number;
  /** reason — nega ishlamayapti / cheklangan (masalan Instagram bloklangan) */
  ai_actions: { active: boolean; title: string; detail: string; stat: string | null; reason?: string | null }[];
  warnings: string[];
  sources: string[];
  channel_url: string | null;
  /** Jonli holat (2026-11-21): obunachilar, 7/30 kunlik o'zgarish, Instagram ulanishi (services/growth_status.py) */
  status?: GrowthStatus | null;
}

export interface GrowthStatus {
  instagram: {
    connected: boolean; ok?: boolean; problem?: 'checkpoint' | 'token' | 'network' | 'other' | null; error?: string;
    username?: string | null; name?: string | null; biography?: string | null; website?: string | null;
    followers_count?: number | null; follows_count?: number | null; media_count?: number | null;
    delta_7?: number | null; delta_30?: number | null; has_tg_link?: boolean;
  };
  telegram: { connected: boolean; channel?: string; url?: string | null; subscribers?: number | null; delta_7?: number | null; delta_30?: number | null };
  history: { date: string; ig?: number; tg?: number }[];
  history_days: number;
  checked_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number | null;
  description: string | null;
  image_url: string | null;
  stock: number | null;
  is_active: boolean;
  product_code: number | null;
  /** Chegirma % (0 — chegirma yo'q). Narx `price` — asl narx */
  discount_percent?: number | null;
  /** 4 tagacha rasm (1-chisi = image_url) — services/product_images.py */
  images?: string[];
  /** Savdolashish (services/price_guard.py): AI necha foizgacha tushishi mumkin (0 — yo'q) */
  bargain_percent?: number;
  /** Savdolashishda eng past narx (ixtiyoriy) */
  min_price?: number | null;
}

export interface ProductInput {
  name: string;
  price?: string | null;
  description?: string | null;
  image_url?: string | null;
  stock?: number;
  is_active?: boolean;
  discount_percent?: number;
  images?: string[];
  bargain_percent?: number;
  min_price?: number;
}

export type PostPlatform = 'instagram' | 'telegram' | 'both';

export interface GeneratedPost {
  post_id: string;
  content: string;
  content_preview?: string;
  hashtags: string[];
  platform: PostPlatform;
  image_url: string | null;
  image_urls?: string[];
}

export interface PublishTarget {
  ok: boolean;
  error?: string;
  account?: string | null; // IG username yoki TG kanal
  url?: string | null; // post / kanal havolasi
  profile_url?: string | null;
}

export interface PublishResult {
  post_id: string;
  status: 'published' | 'failed';
  results: { instagram?: PublishTarget; telegram?: PublishTarget; info?: { ok: boolean; message: string } };
  already_published?: boolean;
}

export interface PostRow {
  id: string;
  content: string;
  hashtags: string[] | null;
  platform: PostPlatform;
  status: string;
  mode: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  published_at: string | null;
  scheduled_at: string | null;
}

export interface VideoItem {
  id: string;
  content: string;
  video_url: string;
  status: string;
  platform: string | null;
  created_at: string;
  published_at: string | null;
}

export interface MemoryCoreRow {
  id: string;
  category: string;
  key: string;
  value: string;
  updated_at: string;
  read_only?: boolean;
}

export interface MemoryContext {
  business_id: string;
  context: string;
  raw: {
    business: {
      brand_name?: string;
      business_type?: string;
      city?: string;
      target_audience?: string;
      price_range?: string;
      communication_style?: string;
      ai_summary?: string;
    };
    core_memory: MemoryCoreRow[];
    dynamic_memory: { id: string; type: string; content: string; active: boolean; expires_at: string | null }[];
    experience_memory: { id: string; insight: string; insight_type: string; confidence: number }[];
    products: { name: string; price: number; description: string }[];
  };
}

export interface VideoProfile {
  direction: string;
  genre: string;
  has_character: boolean;
  character_note?: string | null;
  extra?: string | null;
  seconds?: 0 | 10 | 15 | 20;  // 0=avto (dastur tanlaydi), yoki maksimum
  art_style?: 'realistic' | 'cartoon' | 'pixel';  // vizual uslub
  character_image_url?: string | null;
  character_desc?: string | null;
  character_json?: Record<string, string | string[]> | null;
  character_status?: 'analyzing' | 'ready' | 'ready_text' | 'failed' | null;
  character_source?: 'pinterest' | 'upload' | 'text' | 'auto' | 'generated' | null;
}

export interface CharacterCandidate {
  image_url: string;
  title: string;
}

export interface VideoPlanItem {
  id: string;
  scheduled_at: string;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'failed' | 'skipped';
  topic: string | null;
  scenario: string | null;
  caption: string | null;
  video_url: string | null;
  lang?: ContentLang | null;
  past: boolean;
  /** Toifaga qarab 5/10/15/20 s */
  seconds?: number | null;
  /** closeup = yuz (haftada 1), wide = tana + fon, silent = so'zsiz + yozuv + musiqa */
  style?: 'closeup' | 'wide' | 'silent' | null;
}

export interface VideoPlan {
  plan: string;
  cadence: { every_days: number; per_day: number; monthly: number };
  settings: { times?: string[]; stopped_at?: string; approval?: ApprovalMode } | null;
  items: VideoPlanItem[];
  /** 2026-11-19: kelgusi kunlarga tayyorlangan, hali ko'rsatilmaydigan videolar soni */
  upcoming_hidden?: number;
  /** Bepul tarif: yana necha marta «almashtirish» mumkin (2 ta video qolganda 0) */
  swaps_left?: number | null;
}

/** Bepul sinov: 14 video paketini boshlash shartlari (services/video_plan.onboarding_status) */
export interface VideoOnboarding {
  trial: boolean;
  instagram: boolean;
  niche: boolean;
  profile: boolean;
  products: boolean;
  products_count: number;
  products_skipped: boolean;
  ready: boolean;
  started: boolean;
  batch_size: number;
}

export type ContentLang = 'kk' | 'ru';

export interface BrandStatus {
  niche: string | null;
  logo_url: string | null;
  has_products: boolean;
  needs_niche: boolean;
}

export interface PostPlanItem {
  id: string;
  scheduled_at: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'skipped';
  /** yarim avtomat: tayyor, tasdiqlashni kutmoqda */
  needs_approval?: boolean;
  text: string | null;
  hashtags: string[];
  image_url: string | null;
  lang: ContentLang | null;
  published_at: string | null;
  past: boolean;
}

export interface PostPlan {
  cadence?: { every_days: number; per_day: number; monthly: number };
  settings: { time?: string; script_lang?: ContentLang; stopped_at?: string; approval?: ApprovalMode } | null;
  items: PostPlanItem[];
}

export interface ConversationMessage {
  role: 'customer' | 'ai' | 'operator' | string;
  text: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  customer_name: string | null;
  customer_id: string | null;
  platform: string;
  messages: ConversationMessage[];
  status: string | null;
  created_at: string;
  ai_enabled?: boolean | null;
  /** Bitim bosqichi (services/customer_chat.py): ready/ordered/paid — "Готовы купить" */
  deal?: ConversationDeal | null;
  /** Joriy holat (services/conv_insights.py): muammoli / tiqilib qolgan / javob kutmoqda / ... */
  status_info?: ConvStatusInfo;
}

export interface ProfileTips {
  name: string;
  bio: string[];
  bio_text: string;
  bio_len: number;
  link: string | null;
  link_label: string;
  highlights: { title: string; emoji: string; stories: string }[];
  pinned: string[];
  dm_keyword?: string;
  username?: string | null;
  username_ideas?: string[];
  username_issue?: 'uz_domain' | null;
  /** Hozir Instagram profilida turgan matn (jonli o'qilsa) */
  current_bio?: string | null;
  current_name?: string | null;
  current_link?: string | null;
  missing?: ('city' | 'delivery' | 'payment' | 'returns')[];
  generated_at: string;
}

export interface ExperimentArm {
  key: string;
  videos: number;
  avg_views: number | null;
  score: number | null;
  status: 'winner' | 'ok' | 'weak' | 'retired' | 'testing';
}

export interface Experiments {
  samples: number;
  avg_views: number | null;
  dims: Record<'format' | 'delivery' | 'hook' | 'seconds' | 'hour' | 'cta', ExperimentArm[]>;
  recent: { topic: string | null; views: number | null; format: string | null; hour: string | null; seconds: number | null; cta: string | null; at: string | null }[];
  explore_share: number;
  min_samples: number;
}

export interface SupportThread {
  messages: { id?: string; from: 'me' | 'operon'; text: string; at?: string }[];
  unread: number;
}

export interface TelegramBusinessState {
  connected: boolean;
  can_reply: boolean;
  user_name: string | null;
  username: string | null;
  connected_at: string | null;
  owner_linked: boolean;
  bot_username: string;
}

export type ConvStatusKey = 'problem' | 'stuck' | 'waiting' | 'hot' | 'live' | 'active' | 'sleeping';

export interface ConvStatusInfo {
  key: ConvStatusKey;
  tags: ConvStatusKey[];
  waiting_min: number | null;
  last_at: string | null;
  handoff_reason?: string | null;
}

export type ConvCounts = Record<ConvStatusKey | 'all', number>;

export interface ConvRespBlock { n: number; avg_s: number | null; p50_s: number | null; p95_s: number | null }

export interface ConvInsights {
  days: number;
  funnel: { started: number; interest: number; bargain: number; ready: number; ordered: number; won: number };
  conversion_pct: number | null;
  handoffs: number;
  response: { ai: ConvRespBlock; operator: ConvRespBlock };
  channels: Record<string, { started: number; ordered: number; won: number }>;
  tracked_since: string | null;
}

export interface PriceRules {
  bargain: boolean;
  max_discount: number;
  floors: Record<string, number>;
}

export interface ImportRow {
  name: string;
  price: number | null;
  stock: number | null;
  description?: string | null;
  category?: string | null;
  colors?: string[];
  exists?: boolean;
}

export interface ImportPreview {
  source: 'table' | 'text' | 'image';
  total: number;
  rows: ImportRow[];
  without_price: number;
  existing: number;
}

export type ApprovalMode = 'auto' | 'semi';

export interface RevenueStats {
  avg_check: number;
  prev_avg_check: number;
  prev_revenue: number;
  best_day: { date: string; revenue: number } | null;
  sale_days: number;
  per_day: number;
}

export interface DealRow extends ConversationDeal {
  conversation_id: string;
  customer_name?: string | null;
  platform?: string | null;
  outcome?: 'won' | 'lost';
  closed_by?: 'owner' | 'customer';
  closed_at?: string;
}

export interface DealsBoard {
  active: DealRow[];
  won: DealRow[];
  lost: DealRow[];
  counts: { active: number; won: number; lost: number };
}

export interface ConversationDeal {
  stage: 'interest' | 'ready' | 'ordered' | 'paid';
  product?: string | null; quantity?: number; amount?: number | null;
  phone?: string | null; address?: string | null; name?: string | null; note?: string | null;
  order_id?: string | null; since?: string; updated_at?: string;
}

export interface MarketWatch {
  keywords: string[];
  kaspi: string[];
  wb: string[];
  uzum: string[];
  instagram: string[];
  telegram: string[];
  /** Tizim o'zi topgan raqobatchilar (services/competitor_discovery.py) */
  auto?: { keywords: string[]; instagram: string[]; telegram: string[]; ts?: number; instagram_verified?: boolean };
}

export interface MarketProduct {
  source: 'kaspi' | 'wb';
  id: string;
  title?: string | null;
  brand?: string | null;
  price?: number | null;
  old_price?: number | null;
  currency?: string;
  rating?: number | string | null;
  reviews_total?: number | null;
  reviews_7d?: number;
  reviews_7d_capped?: boolean;
  reviews_30d?: number;
  reviews_30d_capped?: boolean;
  min_week_revenue?: number;
  min_month_revenue?: number;
  discount_pct?: number | null;
  price_change_pct?: number;
  orders_total?: number;
  reviews_growth?: number;
  growth_days?: number;
  promos?: string[];
  installment?: boolean;
  link?: string;
  complaints?: string[];
  error?: string;
}

export interface MarketIgAccount {
  username: string;
  followers?: number;
  posts_per_week?: number | null;
  reels_share?: number | null;
  avg_er?: number | null;
  reels_per_week?: number | null;
  avg_reel_views?: number | null;
  avg_views_per_follower?: number | null;
  views_hidden?: boolean;
  discount_posts?: number;
  top_videos?: { caption: string; views?: number | null; vs_avg?: number; likes?: number; comments?: number; er?: number | null; permalink?: string; date?: string }[];
  error?: string;
}

export interface MarketTgChannel {
  channel: string;
  subscribers?: number | null;
  posts_30d?: number;
  avg_views?: number;
  posts_per_week?: number;
  err_pct?: number | null;
  discount_lift?: number | null;
  discount_avg_views?: number | null;
  discount_posts?: { text: string; views: number; date: string; link: string }[];
  error?: string;
}

export interface MarketReport {
  summary?: string;
  position?: string;
  marketplaces?: Record<string, { summary?: string; leaders?: { name: string; link?: string; sales_signal?: string; revenue_signal?: string; why_sells?: string }[]; tactics?: string[] }>;
  how_they_grow?: { lever?: string; evidence?: string; who?: string }[];
  vs_us?: { topic?: string; them?: string; us?: string; our_move?: string }[];
  content_ideas?: { idea?: string; format?: string; based_on?: string }[];
  instagram?: {
    summary?: string; video_patterns?: string[]; what_to_try?: string[]; sales_videos?: string[]; not_working?: string[];
    genres?: { genre?: string; count?: number; views_signal?: string; goal?: string; why_works?: string; example_link?: string }[];
  };
  telegram?: { summary?: string; discount_tactics?: string[]; sales_tactics?: string[] };
  competitors?: MarketCompetitor[];
  opportunities?: string[];
  actions?: MarketAction[];
  /** 2026-11-20 ixcham format (v: 2) */
  v?: number;
  verdict?: string;
  gaps?: { topic?: string; them?: string; us?: string }[];
  content_hooks?: string[];
}

export interface MarketCompetitor {
  name: string; platform?: string; link?: string;
  strengths?: string[]; weaknesses?: string[];
  strong?: string; weak?: string; adapt?: string;
  level?: 'direct' | 'near' | 'leader' | 'channel';
  price?: number; price_vs_ours_pct?: number; reviews_total?: number; reviews_30d?: number; reviews_30d_capped?: boolean;
  rating?: number; installment?: boolean; delivery?: string; ads_url?: string; shop?: string;
}

export interface MarketAction {
  action?: string; task?: string; why?: string; expected?: string; check?: string; where?: string; priority?: number;
}

export interface MarketState {
  /** Tarifda yo'q (Starter) — bo'lim qulflangan */
  locked?: boolean;
  intel: null | {
    generated_at: string;
    next_at?: string;
    report: MarketReport;
    data: {
      keywords: string[];
      kaspi_summary?: {
        market_median_price?: number; market_min_price?: number; market_max_price?: number;
        our_median_price?: number; our_vs_market_pct?: number; price_position?: string;
        with_discount_pct?: number; with_installment_pct?: number;
        min_week_sales_total?: number; min_week_revenue_total?: number;
      };
      sources: {
        kaspi?: { market_top?: MarketProduct[]; tracked?: MarketProduct[] };
        wb?: { status?: string; tracked?: MarketProduct[] };
        uzum?: { status?: string; links?: string[] };
        instagram?: { status?: string; accounts?: (MarketIgAccount | string)[] };
        telegram?: { status?: string; channels?: MarketTgChannel[] };
      };
    };
  };
  health: null | {
    generated_at: string;
    report: { verdict?: 'good' | 'ok' | 'bad'; score?: number; headline?: string; changes?: string[]; problems?: string[]; advice?: { action: string; why?: string }[] };
  };
  watch: MarketWatch;
  running: boolean;
  last_error: boolean;
  refresh_days: number;
}

export interface PlanUsage {
  plan: string;
  features?: { platforms: number; marketplaces: number; business_analysis: boolean; news: boolean; early_access: boolean; admin_contact: boolean };
  prices?: Record<string, number>;
  admin_contact?: string | null;
  /** Sinov yoki to'langan davr tugash sanasi */
  trial_end: string | null;
  /** trial | paid | expired (expired — video/post yaratish to'xtaydi) */
  state?: 'trial' | 'paid' | 'expired';
  days_left?: number | null;
  /** Tadbirkor so'ragan, admin hali tasdiqlamagan tarif */
  pending_plan?: string | null;
  videos_used: number;
  videos_limit: number;
  posts_used: number;
  posts_limit: number;
}

export interface AnalyticsTopItem {
  id: string | number;
  type: 'post' | 'video';
  caption?: string;
  text?: string;
  permalink?: string;
  timestamp?: string;
  image?: string | null;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
}

export interface Analytics {
  days: number;
  totals: { views: number | null; video_views: number | null; post_views: number | null; profile_visits: number | null; reach: number | null; followers: number | null };
  instagram: {
    connected: boolean; error?: string; username?: string; followers_count?: number; media_count?: number;
    account?: Record<string, number | null>; account_days?: number; account_error?: string; insights_denied?: boolean;
    media?: { posts: number; videos: number; post_views: number; video_views: number; likes: number; comments: number; saved: number; shares: number };
    top?: AnalyticsTopItem[];
  };
  telegram: {
    connected: boolean; error?: string; channel?: string; url?: string; subscribers?: number; views_error?: string;
    posts?: number; videos?: number; post_views?: number; video_views?: number; views?: number; avg_views?: number;
    top?: AnalyticsTopItem[];
  };
  content: { posts_published: number; videos_published: number; by_platform: Record<string, number>; upcoming: number; failed: number };
  conversations: { people: number; new_people: number; by_platform: Record<string, number>; customer_messages: number; ai_replies: number; operator_replies: number };
  sales: { orders: number; inquiries: number; revenue: number; buyers: number; conversion: number | null; avg_check: number | null; products_active: number };
  series: { date: string; posts: number; videos: number; conversations: number; orders: number; inquiries: number }[];
}

export interface MpReview {
  id: string; source: 'wb' | 'kaspi'; rating: number; text: string; pros: string; cons: string;
  author: string | null; date: string | null; product: string | null; sku: string | null;
  photos: string[]; answered: boolean; answer: string | null; can_reply: boolean; link?: string;
}
export interface MpReviews {
  items: MpReview[];
  sources: Record<'wb' | 'kaspi' | 'uzum', { ok: boolean; error?: string; unanswered?: number; products?: number; count?: number }>;
  summary?: { total: number; avg: number | null; negative: number; unanswered: number; top_complaints: string[] };
  generated_at: string;
}
export interface MpCardIssue { kind: string; word: string; hint: string; field?: string }
export interface MpCard {
  platform: 'kaspi' | 'wb' | 'uzum';
  title: Record<string, string>;
  description: Record<string, string>;
  short_keywords?: Record<string, string>;
  keywords: string[];
  characteristics: { name: string; value: string }[];
  faq: { q: string; a: string }[];
  slides: { kind: string; headline: string; bullets: string[] }[];
  main_benefit: string;
  photo_tips: string[];
  ask_seller: string[];
  lint: MpCardIssue[];
  images?: string[];
  images_error?: string;
  generated_at: string;
  product_name?: string;
}
export interface MpGuide {
  platforms: Record<'kaspi' | 'wb' | 'uzum', { name: string; langs: string[]; title_max: number; title_rule: string;
    photo: { min: number; max: number; size: string; main: string }; video: string; moderation: string; tips: string[];
    // 2026-11-19: iqtisod / buyurtma / qo'shish / reyting / xatolar + 15 ta manba video
    economics?: string[]; orders?: string[]; adding?: string[]; ranking?: string[]; mistakes?: string[];
    sources?: { id: string; title: string; topic: string; url: string }[] }>;
  infographic: string[]; reviews: string[]; description: string[]; as_of?: string;
}
export type MpPlat = 'kaspi' | 'wb' | 'uzum';
export interface MpCalcInput {
  platform: MpPlat; price: number; cost: number;
  commission_pct?: number | null; promo_pct?: number | null; tax_pct?: number | null; ads_pct?: number | null;
  defect_pct?: number | null; buyout_pct?: number | null; logistics?: number | null; return_fee?: number | null;
  storage?: number | null; other?: number | null; size?: 's' | 'm' | 'l'; scheme?: 'fbo' | 'fbs' | 'dbs';
  zone?: 'city' | 'kz'; stock?: number | null; daily_sales?: number | null; lead_days?: number | null;
}
export interface MpCalcPreset {
  currency: string; commission_pct: number; promo_pct: number; tax_pct: number; ads_pct: number; defect_pct: number;
  buyout_pct: number; logistics: number | null; return_fee: number; storage: number;
}
export interface MpCalcResult {
  platform: MpPlat; currency: string;
  lines: { commission: number; logistics: number; storage: number; ads: number; tax: number; defect: number; other: number };
  logistics_auto: boolean; payout: number; profit: number; margin_pct: number; roi_pct: number | null; markup_x: number;
  breakeven_price: number | null; price_for_30: number | null; verdict: 'loss' | 'thin' | 'ok' | 'good';
  warnings: { code: string; ru: string; kk: string }[];
  stock: { days_left: number; reorder_now: boolean; reorder_qty: number | null } | null;
}
export interface MpWatchItem {
  source: MpPlat; id: string; title: string | null; amount: number | null; currency: string | null; ordered_at: string;
  hours: number; left_h: number | null; stage: string; level: 'info' | 'warn' | 'danger'; deadline_h: number | null;
  ru: string; kk: string;
}
export interface MpOrdersWatch { items: MpWatchItem[]; connected: Record<MpPlat, boolean>; checked_at: string }
export interface MpLinks {
  items: { id: string; name: string; stock: number | null; kaspi: string[]; wb: string[]; uzum: string[]; auto: boolean }[];
  stock_sync: Record<'kaspi' | 'wb' | 'uzum', boolean>;
}

export interface ReferralInfo {
  code: string; rate: number; months: number; hold_days: number; min_payout: number;
  available: number; pending: number; earned: number; withdrawn: number;
  invited: number; paying: number; active: number;
  people: { name: string; joined: string; status: 'invited' | 'active' | 'finished'; bonus_until: string | null; earned: number }[];
  history: { kind: string; amount: number; status: string; plan?: string | null; at: string; available_at?: string | null; name?: string }[];
  my_referrer_code: string | null; can_apply_code: boolean; payout_pending: boolean;
}
