// Operon backend (FastAPI) bilan aloqa qatlami.
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

async function tryRefresh(): Promise<boolean> {
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

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  // FormData (fayl yuklash) — Content-Type'ni brauzer o'zi qo'yadi (boundary bilan)
  const headers: Record<string, string> = init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  const access = tokens.access;
  if (access) headers.Authorization = `Bearer ${access}`;

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
  series: { date: string; revenue: number; orders: number; inquiries: number }[];
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
    const data = await request<{ access_token: string; refresh_token: string }>('/auth/login-business', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
    tokens.set(data.access_token, data.refresh_token);
  },

  /** Google'ga yo'naltiradi; qaytishda URL #access_token=... bilan keladi (consumeOAuthReturn). */
  async startGoogle(purpose: 'login' | 'reset' = 'login') {
    try {
      sessionStorage.setItem('operon_oauth_purpose', purpose);
    } catch {
      /* ignore */
    }
    const back = window.location.origin + window.location.pathname;
    const r = await request<{ url: string }>(`/auth/google/url?redirect_to=${encodeURIComponent(back)}`);
    window.location.href = r.url;
  },

  nameAvailable: (name: string) =>
    request<{ available: boolean }>(`/auth/name-available?name=${encodeURIComponent(name)}`),

  // Parol o'rnatilgach Supabase eski sessiyani bekor qiladi — server qaytargan YANGI tokenlarni saqlaymiz.
  async setupAccount(business_name: string, password: string, mode: OnboardingMode, language: 'kk' | 'ru') {
    const r = await request<{ business: { id: string; brand_name: string }; access_token?: string; refresh_token?: string }>(
      '/auth/setup',
      { method: 'POST', body: JSON.stringify({ business_name, password, mode, language }) },
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

  // Rasm bo'lmasa — Operon qahramonni (tavsifdan yoki o'zi tanlab) yaratadi va rasmini chizadi
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
    p: Pick<VideoProfile, 'direction' | 'genre' | 'has_character' | 'character_note' | 'extra' | 'seconds'>,
  ) =>
    request<{ profile: VideoProfile }>('/videos/profile', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, ...p }),
    }),

  uploadCharacter: (businessId: string, imageBase64: string, mime: string) =>
    request<{ character_image_url: string; character_desc: string | null }>('/videos/profile/character', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, image_base64: imageBase64, mime }),
    }),

  videoPlan: (businessId: string) => request<VideoPlan>(`/videos/plan/${encodeURIComponent(businessId)}`),

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

  stopPostPlan: (businessId: string) =>
    request<{ ok: boolean }>(`/post-plan/${encodeURIComponent(businessId)}`, { method: 'DELETE' }),

  // Mijozlar bilan suhbatlar (Instagram izoh/Direct, Telegram)
  conversations: (businessId: string) =>
    request<{ conversations: Conversation[] }>(`/business/${encodeURIComponent(businessId)}/conversations`),

  replyConversation: (businessId: string, convId: string, text: string) =>
    request<{ ok: boolean; sent: boolean; error: string | null }>(
      `/business/${encodeURIComponent(businessId)}/conversations/${encodeURIComponent(convId)}/reply`,
      { method: 'POST', body: JSON.stringify({ text }) },
    ),

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

  // Tarif so'rovi: tarifni O'ZI yoqmaydi — Operon to'lovni qabul qilib tasdiqlaydi (services/billing.py)
  requestPlan: (plan: 'starter' | 'growth' | 'business') =>
    request<{ status: 'pending'; plan: string }>('/auth/plan', { method: 'POST', body: JSON.stringify({ plan }) }),

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

  logout() {
    tokens.clear();
  },
};

export interface Product {
  id: string;
  name: string;
  price: number | null;
  description: string | null;
  image_url: string | null;
  stock: number | null;
  is_active: boolean;
  product_code: number | null;
}

export interface ProductInput {
  name: string;
  price?: string | null;
  description?: string | null;
  image_url?: string | null;
  stock?: number;
  is_active?: boolean;
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
  seconds?: 10 | 15 | 20;  // video uzunligi (max 20s)
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
  status: 'draft' | 'scheduled' | 'published' | 'failed';
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
  settings: { times?: string[]; stopped_at?: string } | null;
  items: VideoPlanItem[];
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
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  text: string | null;
  hashtags: string[];
  image_url: string | null;
  lang: ContentLang | null;
  published_at: string | null;
  past: boolean;
}

export interface PostPlan {
  settings: { time?: string; script_lang?: ContentLang; stopped_at?: string } | null;
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
  competitors?: { name: string; platform?: string; strengths?: string[]; weaknesses?: string[] }[];
  opportunities?: string[];
  actions?: { action: string; why?: string; expected?: string }[];
}

export interface MarketState {
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
