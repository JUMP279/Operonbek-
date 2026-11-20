import React, { useEffect, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { API_BASE, api, ApiError } from '../lib/api';

// Yuridik rozilik (2026-11-14) — sayt bilan bir xil: oferta + maxfiylik + shaxsiy ma'lumotlarni (shu jumladan
// transchegaraviy) qayta ishlashga rozilik (QR 94-V, 8 va 16-moddalar). Hujjatlar: backend /terms /privacy /consent.

let _version: string | null = null;
export async function legalVersion(): Promise<string | null> {
  if (_version) return _version;
  try {
    _version = (await api.legalIndex()).version;
  } catch {
    _version = null;
  }
  return _version;
}

const link = (path: string) => `${API_BASE}${path}`;

const Box: React.FC<{ checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }> = ({ checked, onChange, children }) => (
  <label className="flex gap-2.5 items-start cursor-pointer select-none">
    <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className={`mt-0.5 w-[18px] h-[18px] shrink-0 rounded-md border flex items-center justify-center ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`} aria-hidden="true">
      {checked && <Check className="w-3 h-3" />}
    </span>
    <span className="text-[11.5px] leading-snug text-slate-600">{children}</span>
  </label>
);

const A: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <a href={link(to)} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 underline" onClick={(e) => e.stopPropagation()}>{children}</a>
);

export const ConsentChecks: React.FC<{ lang: 'kk' | 'ru'; onValid: (ok: boolean) => void }> = ({ lang, onValid }) => {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  useEffect(() => onValid(a && b), [a, b, onValid]);
  const ru = lang !== 'kk';
  return (
    <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <Box checked={a} onChange={setA}>
        {ru ? <>Мне есть 18 лет, я принимаю <A to="/terms">Пользовательское соглашение (оферту)</A>, <A to="/aup">Правила использования</A> и <A to="/privacy">Политику конфиденциальности</A>.</>
          : <>18 жасқа толдым, <A to="/terms">Пайдаланушы келісімін (офертаны)</A>, <A to="/aup">Пайдалану ережелерін</A> және <A to="/privacy">Құпиялылық саясатын</A> қабылдаймын.</>}
      </Box>
      <Box checked={b} onChange={setB}>
        {ru ? <>Даю <A to="/consent">согласие на обработку персональных данных</A>, в том числе на их передачу зарубежным сервисам (ИИ, хостинг).</>
          : <>Дербес деректерімді, оның ішінде шетелдік сервистерге беруге (ЖИ, хостинг) <A to="/consent">өңдеуге келісім</A> беремін.</>}
      </Box>
    </div>
  );
};

/** Kirgan, lekin joriy versiyaga rozilik bermagan foydalanuvchi uchun majburiy oyna */
export const ConsentGate: React.FC<{ lang: 'kk' | 'ru'; version: string; onDone: () => void; onLogout: () => void }> = ({ lang, version, onDone, onLogout }) => {
  const ru = lang !== 'kk';
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    setBusy(true);
    setErr('');
    try {
      await api.acceptConsent(version);
      onDone();
    } catch (e) {
      setErr(e instanceof ApiError && e.status === 409
        ? (ru ? 'Документы обновились — перезапустите приложение.' : 'Құжаттар жаңартылды — қосымшаны қайта ашыңыз.')
        : (ru ? 'Не удалось сохранить. Попробуйте ещё раз.' : 'Сақталмады. Қайталап көріңіз.'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/50 flex items-end justify-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 space-y-3.5 shadow-2xl" role="dialog" aria-modal="true">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
        <h2 className="text-lg font-extrabold text-slate-900">{ru ? 'Условия использования' : 'Пайдалану шарттары'}</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {ru ? 'Мы обновили документы в соответствии с законодательством Казахстана о персональных данных и об искусственном интеллекте. Чтобы продолжить, подтвердите согласие.'
            : 'Біз құжаттарды Қазақстанның дербес деректер және жасанды интеллект туралы заңнамасына сәйкес жаңарттық. Жалғастыру үшін келісіміңізді растаңыз.'}
        </p>
        <ConsentChecks lang={lang} onValid={setOk} />
        {err && <p className="text-xs text-rose-600">{err}</p>}
        <button onClick={submit} disabled={!ok || busy} className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm disabled:opacity-40">
          {busy ? '…' : ru ? 'Принимаю' : 'Қабылдаймын'}
        </button>
        <button onClick={onLogout} className="w-full text-xs font-semibold text-slate-400">{ru ? 'Выйти' : 'Шығу'}</button>
      </div>
    </div>
  );
};
