import React, { useState } from 'react';
import { Flag, Loader2, Check } from 'lucide-react';
import { api } from '../lib/api';

// «Пожаловаться» на ИИ-контент (2026-11-16, Google Play: генеративный ИИ — жалоба прямо из приложения).
// Жалоба уходит в поддержку FindLead (чат магазина + Telegram админа).
type Kind = 'post' | 'video' | 'reply' | 'script' | 'image';

const T = {
  uz: { btn: "Shikoyat qilish", title: "AI-kontentga shikoyat", hint: "Nima noto'g'ri? (haqoratli, yolg'on, xavfli…)",
        send: "Yuborish", cancel: "Bekor qilish", done: "Shikoyat yuborildi", err: "Yuborib bo'lmadi" }, ru: { btn: 'Пожаловаться', title: 'Жалоба на ИИ-контент', hint: 'Что не так? (оскорбительно, неправда, опасно…)',
        send: 'Отправить', cancel: 'Отмена', done: 'Жалоба отправлена', err: 'Не удалось отправить' },
  kk: { btn: 'Шағымдану', title: 'ЖИ-контентке шағым', hint: 'Не дұрыс емес? (балағат, жалған, қауіпті…)',
        send: 'Жіберу', cancel: 'Болдырмау', done: 'Шағым жіберілді', err: 'Жіберу мүмкін болмады' },
};

export const AiReportButton: React.FC<{
  businessId?: string;
  kind: Kind;
  refId?: string;
  excerpt?: string;
  lang: 'uz' | 'ru' | 'kk';
  className?: string;
}> = ({ businessId, kind, refId, excerpt, lang, className = '' }) => {
  const L = T[lang];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  if (!businessId) return null;

  const send = async () => {
    setState('sending');
    try {
      await api.aiReport(businessId, { kind, ref: refId || '', reason: reason.trim(), excerpt: (excerpt || '').slice(0, 500) });
      setState('done');
      setOpen(false);
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 ${className}`}><Check className="w-3 h-3" />{L.done}</span>;
  }
  return (
    <span className={className}>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 active:scale-95">
          <Flag className="w-3 h-3" />{L.btn}
        </button>
      ) : (
        <span className="block w-full mt-1.5 rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 space-y-2">
          <span className="block text-[12px] font-bold text-rose-700">{L.title}</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={2}
            placeholder={L.hint}
            className="w-full rounded-lg border border-rose-200 bg-white p-2 text-[12px] outline-none focus:border-rose-400" />
          {state === 'error' && <span className="block text-[11px] text-rose-600">{L.err}</span>}
          <span className="flex gap-2">
            <button type="button" onClick={send} disabled={state === 'sending'}
              className="flex-1 h-8 rounded-lg bg-rose-600 text-white text-[12px] font-bold flex items-center justify-center gap-1 disabled:opacity-60">
              {state === 'sending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{L.send}
            </button>
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 text-[12px] font-bold">{L.cancel}</button>
          </span>
        </span>
      )}
    </span>
  );
};
