import { isUz } from '../context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Gift, KeyRound, Lock, Phone, Rocket, Store, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError, MeResponse, OnboardingMode, pendingConsent } from '../lib/api';
import { ConsentChecks, legalVersion } from './LegalConsent';
import { isValidPhone, nextPhone, PhoneFlag, phonePlaceholder } from '../lib/phone';
import { applyPendingRef, normalizeRef, pendingRef, refFromLink, setPendingRef } from '../lib/referral';
import { OperonMark } from './HeaderNav';
import seoTopics from '../data/seo-topics.json';
import { isAndroidApp } from '../lib/platform';

// Oqim (2026-11-08):
//   Kirish ekrani: [Biznes nomi] [Parol] (Parolni unutdingizmi?) [Kirish]  ── yoki ──  [Google]
//   Birinchi marta: Google → "Biznesingiz nomi" → "Parol" → (Qo'shish | Yaratish) → dashboard.
//   Parolni unutdi: Google orqali tasdiq → "Yangi parol" → dashboard.
// 'register' va 'welcome' eski chaqiruvlar uchun — ikkalasi ham kirish ekranini ochadi.
// Referal promokodi (2026-11-18, sayt Login.tsx bilan bir xil): ro'yxatdan o'tishda (nom + parol bosqichi) ANIQ
// so'raladi «Есть промокод?» [Да]/[Нет]. Do'st havolasidan (?ref=) kelsa kod avtomatik qo'yiladi va
// «Вас пригласил друг — промокод применён» deb yoziladi. Kabinetga kirgach backend'ga bog'lanadi (applyPendingRef).
type PromoStatus = 'idle' | 'checking' | 'ok' | 'bad';

const usePromoCheck = (code: string) => {
  const [st, setSt] = useState<PromoStatus>('idle');
  useEffect(() => {
    if (!code || code.length < 3) {
      setSt('idle');
      return;
    }
    setSt('checking');
    const id = setTimeout(() => {
      api.referralCheck(code).then((r) => setSt(r.valid ? 'ok' : 'bad')).catch(() => setSt('idle'));
    }, 400);
    return () => clearTimeout(id);
  }, [code]);
  return st;
};

/** Kirish ekrani tepasida: do'st havolasi bilan kelganga darhol aytiladi. */
const RefBanner = ({ kk }: { kk: boolean }) => {
  const code = refFromLink() ? pendingRef() : '';
  const st = usePromoCheck(code);
  if (!code || st === 'bad') return null;
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
      <Gift className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-[12.5px] leading-snug">
        {(isUz() ? "Sizni do'stingiz taklif qildi. Promokod " : kk ? 'Сізді досыңыз шақырды. Промокод ' : 'Вас пригласил друг. Промокод ')}
        <b className="tracking-wide">{code}</b>
        {(isUz() ? " saqlandi — ro'yxatdan o'tishda avtomatik qo'llaniladi." : kk ? ' сақталды — тіркелгенде автоматты түрде қосылады.' : ' сохранён — применится автоматически при регистрации.')}
      </p>
    </div>
  );
};

/** Nom + parol bosqichida: «Есть промокод?» — aniq savol, kichik havola EMAS. */
const PromoAsk = ({ kk, onBad }: { kk: boolean; onBad: (bad: boolean) => void }) => {
  const viaLink = refFromLink();
  const [has, setHas] = useState<boolean | null>(pendingRef() ? true : null);
  const [v, setV] = useState(pendingRef());
  const [edit, setEdit] = useState(!viaLink);
  const st = usePromoCheck(has ? v : '');
  useEffect(() => onBad(!!has && (st === 'bad' || (!!v && v.length < 3))), [has, st, v, onBad]);
  const tx = (ru: string, k: string) => (kk ? k : ru);
  const setCode = (c: string) => {
    const n = normalizeRef(c);
    setV(n);
    setPendingRef(n);
  };
  const choose = (yes: boolean) => {
    setHas(yes);
    if (!yes) setCode('');
  };

  if (viaLink && has && !edit && st !== 'bad') {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1.5">
        <div className="flex items-center gap-2 text-[13px] font-bold">
          <Gift className="w-4 h-4" /> {(isUz() ? "Sizni do'st taklif qildi" : tx('Вас пригласил друг', 'Сізді досыңыз шақырды'))}
        </div>
        <p className="text-[12.5px] leading-snug">
          {(isUz() ? "Promokod " : tx('Промокод ', 'Промокод '))}<b className="tracking-wide">{v}</b>
          {st === 'checking' ? (isUz() ? " — tekshiramiz…" : tx(' — проверяем…', ' — тексерілуде…')) : (isUz() ? " avtomatik qo'llandi ✓" : tx(' применён автоматически ✓', ' автоматты түрде қосылды ✓'))}
        </p>
        <button type="button" onClick={() => setEdit(true)} className="text-[12px] font-semibold text-emerald-700 underline underline-offset-4">
          {(isUz() ? "O'zgartirish" : tx('Изменить', 'Өзгерту'))}
        </button>
      </div>
    );
  }

  const chip = (on: boolean) =>
    `flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-colors ${
      on ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
    }`;
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900">
        <Gift className="w-4 h-4 text-blue-600" /> {(isUz() ? "Promokodingiz bormi?" : tx('Есть промокод?', 'Промокод бар ма?'))}
      </div>
      <div className="flex gap-2">
        <button type="button" className={chip(has === true)} onClick={() => choose(true)}>{(isUz() ? "Ha" : tx('Да', 'Иә'))}</button>
        <button type="button" className={chip(has === false)} onClick={() => choose(false)}>{(isUz() ? "Yo'q" : tx('Нет', 'Жоқ'))}</button>
      </div>
      {has && (
        <div className="space-y-1.5">
          <input
            value={v}
            autoFocus={!v}
            onChange={(e) => setCode(e.target.value)}
            placeholder={(isUz() ? "Promokodni kiriting" : tx('Введите промокод', 'Промокодты енгізіңіз'))}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] font-semibold tracking-wide uppercase"
          />
          {st === 'checking' && <p className="text-[11.5px] text-slate-500">{(isUz() ? "Tekshiramiz…" : tx('Проверяем…', 'Тексерілуде…'))}</p>}
          {st === 'ok' && <p className="text-[11.5px] font-semibold text-emerald-700">✓ {(isUz() ? "Promokod topildi" : tx('Промокод найден', 'Промокод табылды'))}</p>}
          {st === 'bad' && <p className="text-[11.5px] font-semibold text-rose-600">{(isUz() ? "Bunday promokod yo'q — tekshiring yoki «Yo'q»ni tanlang" : tx('Такого промокода нет — проверьте или выберите «Нет»', 'Мұндай промокод жоқ — тексеріңіз немесе «Жоқ» таңдаңыз'))}</p>}
        </div>
      )}
    </div>
  );
};

// «Что умеет FindLead» (2026-11-18, sayt Landing.tsx SeoTopics bilan bir xil matn): manba src/data/seo-topics.json —
// SAYTDAGI operon/src/data/seo-topics.json nusxasi, o'zgarsa ikkalasini yangilang. Kirish ekrani ostida, ochib-yopiladi.
type TopicItem = { q: string; a: string };
type TopicLang = { title: string; items: TopicItem[] };

const TopicList = ({ data, lang }: { data: TopicLang; lang: string }) => (
  <div lang={lang} className="space-y-2">
    <h2 className="text-[13px] font-extrabold text-slate-900 px-1">{data.title}</h2>
    {data.items.map((it) => (
      <details key={it.q} className="group rounded-2xl bg-white/80 border border-slate-200 px-3.5 py-2.5">
        <summary className="flex items-center justify-between gap-3 cursor-pointer list-none text-[13px] font-semibold text-slate-800">
          <h3 className="text-[13px] font-semibold">{it.q}</h3>
          <span className="text-slate-400 transition-transform group-open:rotate-45 text-lg leading-none">+</span>
        </summary>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">{it.a}</p>
      </details>
    ))}
  </div>
);

const AutomationTopics = ({ kk }: { kk: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-md mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 text-[13.5px] font-bold text-slate-800"
      >
        {(isUz() ? "FindLead nima qila oladi?" : kk ? 'FindLead не істей алады?' : 'Что умеет FindLead?')}
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="mt-3 space-y-5">
          {/* o'zbekcha qism faqat saytda (user qarori 2026-11-18) — ilova Qozog'iston mijozlari uchun */}
          <TopicList data={(kk ? seoTopics.kk : seoTopics.ru) as TopicLang} lang={kk ? 'kk' : 'ru'} />
        </div>
      )}
    </div>
  );
};

export type AuthStep =
  | 'welcome'
  | 'login'
  | 'register'
  | 'name'
  | 'password'
  | 'choose'
  | 'finishing'
  | 'reset'
  | 'newpass';

interface AuthFlowProps {
  initialStep?: AuthStep;
  /** Kirish muvaffaqiyatli va biznesi bor — to'g'ridan-to'g'ri dashboardga. */
  onReady: (me: MeResponse) => void;
  /** Faqat allaqachon kirgan foydalanuvchi uchun (masalan, ikkinchi biznes qo'shishda). */
  onClose?: () => void;
}

const TEXT = {
  kk: {
    tagline: 'Бизнесіңізді басқаратын AI-оператор',
    bizName: 'Бизнес атауы',
    bizNamePh: 'Мысалы: Aru Coffee',
    ownerName: 'Сіздің атыңыз',
    ownerNamePh: 'Мысалы: Айгерим',
    phone: 'Телефон нөмірі',
    phonePh: '+7 701 123 45 67',
    errOwnerName: 'Атыңызды жазыңыз (кемінде 2 таңба).',
    errPhone: 'Телефон нөмірін толық жазыңыз, мысалы +7 701 123 45 67 немесе +998 90 123 45 67.',
    password: 'Құпиясөз',
    login: 'Кіру',
    forgot: 'Құпиясөзді ұмыттыңыз ба?',
    or: 'немесе',
    google: 'Google арқылы кіру',
    firstTime: 'Алғаш рет пе? Google арқылы кіріңіз — содан кейін бизнес атауы мен құпиясөз ойлап табасыз.',
    back: 'Артқа',
    next: 'Әрі қарай',
    nameTitle: 'Бизнесіңіз және өзіңіз туралы',
    nameSub: 'Келесі жолы бизнес атауы мен құпиясөз арқылы кіресіз. Телефон — сізбен байланысу үшін.',
    pwTitle: 'Құпиясөз ойлап табыңыз',
    pwSub: 'Кемінде 8 таңба. Оны ешкімге айтпаңыз.',
    pwNew: 'Жаңа құпиясөз',
    pwRepeat: 'Құпиясөзді қайталаңыз',
    chooseTitle: 'Қалай бастаймыз?',
    chooseSub: 'Бірін таңдаңыз — бизнесіңіз бірден ашылады.',
    addTitle: 'Бизнесті қосу',
    addDesc: 'Менің жұмыс істеп тұрған бизнесім бар — Kaspi, WB, Uzum немесе Instagram-да сатамын.',
    createTitle: 'Бизнес құру',
    createDesc: 'Менде идея бар, бизнесті нөлден бастағым келеді.',
    finishing: 'FindLead бизнесіңізді ашып жатыр...',
    resetTitle: 'Құпиясөзді қалпына келтіру',
    resetSub: 'Тіркелген Google аккаунтыңыз арқылы растаңыз — содан кейін жаңа құпиясөз қоясыз.',
    resetBtn: 'Google арқылы растау',
    newpassTitle: 'Жаңа құпиясөз',
    save: 'Сақтау',
    errNetwork: 'Серверге қосылу мүмкін болмады. Интернетті тексеріп, қайталаңыз.',
    errLogin: 'Бизнес атауы немесе құпиясөз қате.',
    errFill: 'Бизнес атауы мен құпиясөзді енгізіңіз.',
    errNameShort: 'Атау кемінде 2 таңба болуы керек.',
    errNameTaken: 'Бұл атау бос емес. Басқасын жазыңыз (мысалы, қаланы қосыңыз).',
    errPwShort: 'Құпиясөз кемінде 8 таңба болуы керек.',
    errPwWeak: 'Құпиясөз тым қарапайым. Әріптер мен сандарды араластырыңыз.',
    errPwMatch: 'Құпиясөздер сәйкес емес.',
    errReauth: 'Қауіпсіздік үшін Google арқылы қайта растаңыз.',
    errGoogle: 'Google арқылы кіру сәтсіз аяқталды. Қайталап көріңіз.',
    errGeneric: 'Қате орын алды. Қайталап көріңіз.',
  },
  uz: {
    tagline: "Biznesingizni yuritadigan AI-operator",
    bizName: "Biznes nomi",
    bizNamePh: "Masalan: Aru Coffee",
    ownerName: "Ismingiz",
    ownerNamePh: "Masalan: Aygerim",
    phone: "Telefon raqami",
    phonePh: '+7 701 123 45 67',
    errOwnerName: "Ismingizni kiriting (kamida 2 belgi).",
    errPhone: "Telefon raqamini to'liq kiriting, masalan +998 90 123 45 67 yoki +7 701 123 45 67.",
    password: "Parol",
    login: "Kirish",
    forgot: "Parolni unutdingizmi?",
    or: "yoki",
    google: "Google orqali kirish",
    firstTime: "Birinchi marta kirdingizmi? Google orqali kiring — keyin biznes nomi va parol o'ylab topasiz.",
    back: "Orqaga",
    next: "Davom etish",
    nameTitle: "Biznesingiz va siz haqingizda",
    nameSub: "Keyingi safar biznes nomi va parol bilan kirasiz. Telefon — siz bilan bog'lanishimiz uchun.",
    pwTitle: "Parol o'ylab toping",
    pwSub: "Kamida 8 ta belgi. Uni hech kimga aytmang.",
    pwNew: "Yangi parol",
    pwRepeat: "Parolni takrorlang",
    chooseTitle: "Nimadan boshlaymiz?",
    chooseSub: "Variantni tanlang — biznesingiz darhol ochiladi.",
    addTitle: "Biznes qo'shish",
    addDesc: "Menda allaqachon biznes bor — Kaspi, WB, Uzum yoki Instagramda sotaman.",
    createTitle: "Biznes yaratish",
    createDesc: "Menda g'oya bor, biznesni noldan boshlamoqchiman.",
    finishing: "FindLead biznesingizni ochmoqda...",
    resetTitle: "Parolni tiklash",
    resetSub: "Ro'yxatdan o'tgan Google akkauntingiz orqali kirishni tasdiqlang — keyin yangi parol o'rnating.",
    resetBtn: "Google orqali tasdiqlash",
    newpassTitle: "Yangi parol",
    save: "Saqlash",
    errNetwork: "Serverga ulanib bo'lmadi. Internetni tekshirib, qaytadan urining.",
    errLogin: "Biznes nomi yoki parol noto'g'ri.",
    errFill: "Biznes nomi va parolni kiriting.",
    errNameShort: "Nom 2 ta belgidan kam bo'lmasligi kerak.",
    errNameTaken: "Bu nom allaqachon band. Boshqasini kiriting (masalan, shahar qo'shing).",
    errPwShort: "Parol 8 ta belgidan kam bo'lmasligi kerak.",
    errPwWeak: "Parol juda oddiy. Harf va raqamlarni aralashtiring.",
    errPwMatch: "Parollar mos kelmadi.",
    errReauth: "Xavfsizlik uchun Google orqali kirishni yana bir bor tasdiqlang.",
    errGoogle: "Google orqali kirib bo'lmadi. Qaytadan urinib ko'ring.",
    errGeneric: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
  }, ru: {
    tagline: 'AI-оператор, который ведёт ваш бизнес',
    bizName: 'Название бизнеса',
    bizNamePh: 'Например: Aru Coffee',
    ownerName: 'Ваше имя',
    ownerNamePh: 'Например: Айгерим',
    phone: 'Номер телефона',
    phonePh: '+7 701 123 45 67',
    errOwnerName: 'Укажите ваше имя (не короче 2 символов).',
    errPhone: 'Укажите номер телефона полностью, например +998 90 123 45 67 или +7 701 123 45 67.',
    password: 'Пароль',
    login: 'Войти',
    forgot: 'Забыли пароль?',
    or: 'или',
    google: 'Войти через Google',
    firstTime: 'Впервые здесь? Войдите через Google — затем придумаете название бизнеса и пароль.',
    back: 'Назад',
    next: 'Далее',
    nameTitle: 'О вашем бизнесе и о вас',
    nameSub: 'В следующий раз вы войдёте по названию бизнеса и паролю. Телефон — чтобы мы могли с вами связаться.',
    pwTitle: 'Придумайте пароль',
    pwSub: 'Минимум 8 символов. Никому его не сообщайте.',
    pwNew: 'Новый пароль',
    pwRepeat: 'Повторите пароль',
    chooseTitle: 'С чего начнём?',
    chooseSub: 'Выберите вариант — ваш бизнес откроется сразу.',
    addTitle: 'Добавить бизнес',
    addDesc: 'У меня уже есть бизнес — продаю на Kaspi, WB, Uzum или в Instagram.',
    createTitle: 'Создать бизнес',
    createDesc: 'У меня есть идея, хочу запустить бизнес с нуля.',
    finishing: 'FindLead открывает ваш бизнес...',
    resetTitle: 'Восстановление пароля',
    resetSub: 'Подтвердите вход через Google-аккаунт, с которым вы регистрировались, — затем задайте новый пароль.',
    resetBtn: 'Подтвердить через Google',
    newpassTitle: 'Новый пароль',
    save: 'Сохранить',
    errNetwork: 'Не удалось подключиться к серверу. Проверьте интернет и повторите.',
    errLogin: 'Неверное название бизнеса или пароль.',
    errFill: 'Введите название бизнеса и пароль.',
    errNameShort: 'Название должно быть не короче 2 символов.',
    errNameTaken: 'Это название уже занято. Укажите другое (например, добавьте город).',
    errPwShort: 'Пароль должен быть не короче 8 символов.',
    errPwWeak: 'Слишком простой пароль. Смешайте буквы и цифры.',
    errPwMatch: 'Пароли не совпадают.',
    errReauth: 'Для безопасности подтвердите вход через Google ещё раз.',
    errGoogle: 'Не удалось войти через Google. Попробуйте ещё раз.',
    errGeneric: 'Произошла ошибка. Попробуйте ещё раз.',
  },
};

const Logo = ({ size = 40 }: { size?: number }) => (
  <div className="shadow-md rounded-[22%]" style={{ width: size, height: size }}>
    <OperonMark size={size} />
  </div>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const inputCls =
  'w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-sm text-slate-900';

export const AuthFlow: React.FC<AuthFlowProps> = ({ initialStep = 'login', onReady, onClose }) => {
  const { language, setLanguage } = useLanguage();
  const T = TEXT[language] || TEXT.ru;

  const norm = (s: AuthStep): AuthStep => (s === 'welcome' || s === 'register' ? 'login' : s);
  const [step, setStep] = useState<AuthStep>(norm(initialStep));
  const [bizName, setBizName] = useState('');
  // Ro'yxatdan o'tishda ega ismi va telefoni (2026-11-22)
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // name+password yig'ilgan bo'lsa — "choose" bosilganda setupAccount (birinchi sozlash),
  // aks holda (dashboard'dan yangi biznes qo'shish) onboardingQuick.
  const [setupMode, setSetupMode] = useState(false);
  // Yuridik rozilik (2026-11-14): Google'ga ketishdan oldin belgilanadi; versiya /auth/setup ga yuboriladi
  const [consentOk, setConsentOk] = useState(false);
  const [promoBad, setPromoBad] = useState(false);
  const [legalVer, setLegalVer] = useState<string | null>(null);
  useEffect(() => {
    legalVersion().then(setLegalVer);
  }, []);

  useEffect(() => {
    setStep(norm(initialStep));
    setError('');
    if (initialStep === 'name') setSetupMode(true);
  }, [initialStep]);

  const go = (s: AuthStep) => {
    setError('');
    setStep(s);
  };

  const errorText = (e: unknown, fallback: string) => {
    if (e instanceof ApiError) {
      if (e.status === 0) return T.errNetwork;
      const map: Record<string, string> = {
        bad_credentials: T.errLogin,
        name_taken: T.errNameTaken,
        name_short: T.errNameShort,
        password_short: T.errPwShort,
        password_weak: T.errPwWeak,
        reauth_required: T.errReauth,
        owner_name_short: T.errOwnerName,
        phone_invalid: T.errPhone,
      };
      if (map[e.message]) return map[e.message];
    }
    return fallback;
  };

  // Android ilovada Google telefon BRAUZERIDA ochiladi (WebView'da Google bloklaydi). Avval tugma cheksiz
  // aylanib qolardi (2026-11-18) — endi 2.5 s dan keyin tushuntirish va «qayta ochish» chiqadi.
  const [browserOpened, setBrowserOpened] = useState(false);
  const google = async (purpose: 'login' | 'reset') => {
    if (consentOk && legalVer) pendingConsent.set(legalVer);
    setBusy(true);
    setError('');
    setBrowserOpened(false);
    try {
      await api.startGoogle(purpose);
      if (isAndroidApp()) {
        setTimeout(() => {
          setBusy(false);
          setBrowserOpened(true);
        }, 2500);
      }
    } catch (err) {
      setError(errorText(err, T.errGoogle));
      setBusy(false);
    }
  };

  // «Зарегистрироваться»: rozilik belgilanmagan bo'lsa — belgilashni so'raymiz, keyin Google
  const register = () => {
    if (!consentOk) {
      setError((language === 'uz' ? "Ro'yxatdan o'tish uchun yuqoridagi rozilik belgilarini belgilang." : language === 'kk'
        ? 'Тіркелу үшін жоғарыдағы келісімдерді белгілеңіз.'
        : 'Чтобы зарегистрироваться, отметьте согласия выше.'));
      document.getElementById('auth-consent')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    google('login');
  };

  const BrowserNote = browserOpened ? (
    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[12.5px] text-blue-900 leading-snug space-y-2">
      <p>
        {(language === 'uz' ? "Google orqali kirish telefon brauzerida ochildi. Akkauntni tanlang — kirgach, ilovaga avtomatik qaytasiz." : language === 'kk'
          ? 'Google арқылы кіру телефон браузерінде ашылды. Аккаунтты таңдаңыз — кейін қосымшаға өзі ораласыз.'
          : 'Вход через Google открыт в браузере телефона. Выберите аккаунт — после входа вы вернётесь в приложение автоматически.')}
      </p>
      <button type="button" onClick={() => google('login')} className="font-bold text-blue-700 underline underline-offset-4">
        {(language === 'uz' ? "Brauzer ochilmadimi? Yana ochish" : language === 'kk' ? 'Браузер ашылмады ма? Қайта ашу' : 'Браузер не открылся? Открыть ещё раз')}
      </button>
    </div>
  ) : null;

  // ── Kirish: biznes nomi + parol ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!bizName.trim() || !password) {
      setError(T.errFill);
      return;
    }
    setBusy(true);
    try {
      await api.loginBusiness(bizName.trim(), password);
      const me = await api.me();
      setPassword('');
      if (me.business) onReady(me);
      else {
        setSetupMode(true);
        go('name');
      }
    } catch (err) {
      setError(errorText(err, T.errLogin));
    } finally {
      setBusy(false);
    }
  };

  // ── Birinchi sozlash: nom ───────────────────────────────────────────────
  const handleName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const n = bizName.trim().replace(/\s+/g, ' ');
    if (n.length < 2) {
      setError(T.errNameShort);
      return;
    }
    if (setupMode) {
      if (ownerName.trim().replace(/\s+/g, ' ').length < 2) {
        setError(T.errOwnerName);
        return;
      }
      if (!isValidPhone(phone)) {
        setError(T.errPhone);
        return;
      }
    }
    setBusy(true);
    try {
      const r = await api.nameAvailable(n);
      if (!r.available) {
        setError(T.errNameTaken);
        return;
      }
      setBizName(n);
      setPassword('');
      setPassword2('');
      go('password');
    } catch (err) {
      setError(errorText(err, T.errGeneric));
    } finally {
      setBusy(false);
    }
  };

  const pwProblem = (): string => {
    if (password.length < 8) return T.errPwShort;
    if (new Set(password).size < 4) return T.errPwWeak;
    if (password !== password2) return T.errPwMatch;
    return '';
  };

  // ── Birinchi sozlash: parol ─────────────────────────────────────────────
  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const p = pwProblem();
    if (p) {
      setError(p);
      return;
    }
    if (promoBad) {
      setError((language === 'uz' ? "Promokod topilmadi — to'g'rilang yoki «Yo'q»ni tanlang." : language === 'kk' ? 'Промокод табылмады — түзетіңіз немесе «Жоқ» таңдаңыз.' : 'Промокод не найден — исправьте или выберите «Нет».'));
      return;
    }
    setSetupMode(true);
    go('choose');
  };

  // ── Biznes turi tanlandi → yaratish ─────────────────────────────────────
  const chooseMode = async (m: OnboardingMode) => {
    setStep('finishing');
    setError('');
    try {
      if (setupMode) await api.setupAccount(bizName, password, m, language, pendingConsent.get(), ownerName.trim(), phone.trim());
      else await api.onboardingQuick(m, language);
      pendingConsent.set(null);
      await applyPendingRef();   // promokod — akkaunt yaratilishi bilan darhol bog'lanadi
      setPassword('');
      setPassword2('');
      const me = await api.me();
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      onReady(me);
    } catch (err) {
      const msg = errorText(err, T.errGeneric);
      setError(msg);
      // Nom band bo'lib qolgan bo'lsa — nom bosqichiga qaytaramiz
      if (err instanceof ApiError && ['name_taken', 'owner_name_short', 'phone_invalid'].includes(err.message)) setStep('name');
      else if (err instanceof ApiError && err.message.startsWith('password_')) setStep('password');
      else setStep('choose');
    }
  };

  // ── Parolni tiklash: yangi parol ────────────────────────────────────────
  const handleNewPass = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = pwProblem();
    if (p) {
      setError(p);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.setNewPassword(password);
      setPassword('');
      setPassword2('');
      const me = await api.me();
      if (me.business) onReady(me);
      else {
        setSetupMode(true);
        go('name');
      }
    } catch (err) {
      setError(errorText(err, T.errGeneric));
    } finally {
      setBusy(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────
  const LangToggle = (
    <div className="flex items-center bg-white/80 rounded-xl p-0.5 border border-slate-200 shadow-2xs">
      {(['uz', 'ru', 'kk'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLanguage(l)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            language === l ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {l === 'uz' ? "O'ZB" : l === 'kk' ? 'ҚАЗ' : 'РУС'}
        </button>
      ))}
    </div>
  );

  const ErrorBox = error ? (
    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
  ) : null;

  const BackBtn = ({ to }: { to: AuthStep }) => (
    <button
      type="button"
      onClick={() => go(to)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> {T.back}
    </button>
  );

  const Spinner = <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;

  const PrimaryBtn = ({ label }: { label: string }) => (
    <button
      type="submit"
      disabled={busy}
      className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
    >
      {busy ? (
        Spinner
      ) : (
        <>
          {label} <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );

  const GoogleBtn = ({ purpose, label, locked }: { purpose: 'login' | 'reset'; label: string; locked?: boolean }) => (
    <button
      type="button"
      disabled={busy || locked}
      onClick={() => google(purpose)}
      className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-200 flex items-center justify-center gap-2.5 disabled:opacity-60 active:scale-[0.98] transition-all"
    >
      <GoogleIcon /> {label}
    </button>
  );

  const PasswordInput = ({
    value,
    onChange,
    placeholder,
    autoComplete,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    autoComplete: string;
  }) => (
    <div className="relative">
      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? (isUz() ? "Parolni yashirish" : language === 'kk' ? 'Құпиясөзді жасыру' : 'Скрыть пароль') : (isUz() ? "Parolni ko'rsatish" : language === 'kk' ? 'Құпиясөзді көрсету' : 'Показать пароль')}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  const NameInput = (
    <div className="relative">
      <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        autoComplete="username"
        value={bizName}
        maxLength={60}
        onChange={(e) => setBizName(e.target.value)}
        placeholder={T.bizNamePh}
        className={inputCls}
      />
    </div>
  );

  let body: React.ReactNode = null;

  if (step === 'login') {
    body = (
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col items-center text-center gap-2 pt-1 pb-1">
          <Logo size={52} />
          <h1 className="text-2xl font-black tracking-tight text-slate-900">FindLead</h1>
          <p className="text-sm text-slate-500">{T.tagline}</p>
        </div>
        <RefBanner kk={language === 'kk'} />
        {ErrorBox}
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">{T.bizName}</span>
          <div className="mt-1">{NameInput}</div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">{T.password}</span>
          <div className="mt-1">
            {PasswordInput({ value: password, onChange: setPassword, placeholder: '••••••••', autoComplete: 'current-password' })}
          </div>
        </label>
        <div className="flex justify-end -mt-1">
          <button type="button" onClick={() => go('reset')} className="text-xs font-semibold text-blue-600 hover:underline">
            {T.forgot}
          </button>
        </div>
        <PrimaryBtn label={T.login} />
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase">{T.or}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div id="auth-consent"><ConsentChecks lang={language} onValid={setConsentOk} /></div>
        <GoogleBtn purpose="login" label={T.google} locked={!consentOk} />
        {BrowserNote}
        {/* Ro'yxatdan o'tish (2026-11-18, user talabi): pastda aniq tugma. Yangi akkaunt = Google → nom → parol. */}
        <div className="pt-3 mt-1 border-t border-slate-100 space-y-2">
          <p className="text-center text-[12.5px] font-semibold text-slate-700">
            {(language === 'uz' ? "Akkauntingiz yo'qmi?" : language === 'kk' ? 'Аккаунтыңыз жоқ па?' : 'Нет аккаунта?')}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={register}
            className="w-full py-3 rounded-2xl border-2 border-blue-600 text-blue-700 font-bold text-sm hover:bg-blue-50 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {(language === 'uz' ? "Ro'yxatdan o'tish" : language === 'kk' ? 'Тіркелу' : 'Зарегистрироваться')}
          </button>
          <p className="text-center text-[11px] text-slate-500 leading-relaxed px-2">{T.firstTime}</p>
        </div>
      </form>
    );
  } else if (step === 'name') {
    body = (
      <form onSubmit={handleName} className="space-y-4">
        <div className="flex items-center gap-3 pt-1">
          <Logo size={40} />
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{T.nameTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{T.nameSub}</p>
          </div>
        </div>
        {ErrorBox}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-700">{T.bizName}</span>
          {NameInput}
        </label>
        {setupMode && (
          <>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">{T.ownerName}</span>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" autoComplete="name" value={ownerName} maxLength={60}
                  onChange={(e) => setOwnerName(e.target.value)} placeholder={T.ownerNamePh} className={inputCls} />
              </div>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">{T.phone}</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center"><PhoneFlag value={phone} fallback={<Phone className="w-4 h-4 text-slate-400" />} /></span>
                <input type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={20}
                  onChange={(e) => setPhone(nextPhone(phone, e.target.value))}
                  onFocus={() => { if (!phone) setPhone('+'); }}
                  placeholder={phonePlaceholder(language)} className={inputCls} />
              </div>
            </label>
          </>
        )}
        <PrimaryBtn label={T.next} />
      </form>
    );
  } else if (step === 'password' || step === 'newpass') {
    const isNew = step === 'newpass';
    body = (
      <form onSubmit={isNew ? handleNewPass : handlePassword} className="space-y-4">
        {!isNew && <BackBtn to="name" />}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{isNew ? T.newpassTitle : T.pwTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{T.pwSub}</p>
          </div>
        </div>
        {!isNew && bizName && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            {T.bizName}: <b className="text-slate-900">{bizName}</b>
          </div>
        )}
        {ErrorBox}
        {PasswordInput({ value: password, onChange: setPassword, placeholder: isNew ? T.pwNew : T.password, autoComplete: 'new-password' })}
        {PasswordInput({ value: password2, onChange: setPassword2, placeholder: T.pwRepeat, autoComplete: 'new-password' })}
        {!isNew && <PromoAsk kk={language === 'kk'} onBad={setPromoBad} />}
        <PrimaryBtn label={isNew ? T.save : T.next} />
      </form>
    );
  } else if (step === 'reset') {
    body = (
      <div className="space-y-4">
        <BackBtn to="login" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">{T.resetTitle}</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{T.resetSub}</p>
        {ErrorBox}
        <GoogleBtn purpose="reset" label={T.resetBtn} />
      </div>
    );
  } else if (step === 'choose') {
    const Card = ({ m, icon, title, desc }: { m: OnboardingMode; icon: React.ReactNode; title: string; desc: string }) => (
      <button
        onClick={() => chooseMode(m)}
        className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 bg-white transition-all active:scale-[0.98] group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      </button>
    );
    body = (
      <div className="space-y-5">
        {setupMode && <BackBtn to="password" />}
        <div className="text-center space-y-1.5 pt-2">
          <h2 className="text-2xl font-extrabold text-slate-900">{T.chooseTitle}</h2>
          <p className="text-sm text-slate-500">{T.chooseSub}</p>
        </div>
        {ErrorBox}
        <Card m="add" icon={<Store className="w-6 h-6" />} title={T.addTitle} desc={T.addDesc} />
        <Card m="create" icon={<Rocket className="w-6 h-6" />} title={T.createTitle} desc={T.createDesc} />
      </div>
    );
  } else if (step === 'finishing') {
    body = (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">{T.finishing}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-md flex items-center justify-between mb-3">
          {onClose && step !== 'finishing' ? (
            <button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
              ✕
            </button>
          ) : (
            <span />
          )}
          {LangToggle}
        </div>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-6">{body}</div>
        {step === 'login' && <AutomationTopics kk={language === 'kk'} />}
      </div>
    </div>
  );
};
