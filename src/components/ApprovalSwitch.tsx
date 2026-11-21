import React, { useState } from 'react';
import { Ban, Check, Eye, RotateCcw, Send, Zap } from 'lucide-react';
import { ApprovalMode } from '../lib/api';

// Автомат / Полуавтомат (2026-11-16; saytdagi cabinet/Content ApprovalSwitch bilan bir xil).
// Полуавтомат: AI tayyorlaydi, lekin Instagram/Telegram'ga faqat tadbirkor «Опубликовать» bosgandan keyin chiqadi.
export const ApprovalSwitch: React.FC<{ value: ApprovalMode; kind: 'video' | 'post'; lang: 'kk' | 'ru'; onChange: (m: ApprovalMode) => Promise<void> }> = ({ value, kind, lang, onChange }) => {
  const ru = lang !== 'kk';
  const [busy, setBusy] = useState(false);
  const opts: { v: ApprovalMode; icon: React.ReactNode; title: string; text: string }[] = [
    { v: 'auto', icon: <Zap className="w-3.5 h-3.5" />, title: ru ? 'Автомат' : 'Автомат',
      text: kind === 'video' ? (ru ? 'AI сам снимает и публикует' : 'AI өзі түсіріп жариялайды') : (ru ? 'AI сам пишет и публикует' : 'AI өзі жазып жариялайды') },
    { v: 'semi', icon: <Eye className="w-3.5 h-3.5" />, title: ru ? 'Полуавтомат' : 'Жартылай автомат',
      text: ru ? 'Выходит только после вашего «Опубликовать»' : 'Тек сіз «Жариялау» бассаңыз шығады' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {opts.map((o) => (
        <button key={o.v} disabled={busy}
          onClick={async () => { if (o.v === value) return; setBusy(true); try { await onChange(o.v); } finally { setBusy(false); } }}
          className={`text-left rounded-2xl border p-2.5 active:scale-[0.98] disabled:opacity-60 ${value === o.v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-1.5 text-[12px] font-black">{o.icon}{o.title}{value === o.v && <Check className="w-3.5 h-3.5 ml-auto" />}</div>
          <div className={`mt-0.5 text-[10.5px] leading-snug ${value === o.v ? 'text-white/75' : 'text-slate-500'}`}>{o.text}</div>
        </button>
      ))}
    </div>
  );
};

/** Ko'rib chiqish tugmalari: Опубликовать / Переделать (istak bilan) / Не публиковать. */
export const ReviewActions: React.FC<{
  lang: 'kk' | 'ru'; past?: boolean; busy?: boolean; redoLabel: string; redoGo: string;
  onApprove: () => void; onRedo: (wish: string) => void; onSkip: () => void;
  /** Bepul tarif: istak so'ralmaydi — bosilganda darhol 14 ta ichidan boshqa video */
  quickRedo?: boolean; redoDisabled?: boolean; redoNote?: string;
}> = ({ lang, past, busy, redoLabel, redoGo, onApprove, onRedo, onSkip, quickRedo, redoDisabled, redoNote }) => {
  const ru = lang !== 'kk';
  const [open, setOpen] = useState(false);
  const [wish, setWish] = useState('');
  const b = 'inline-flex items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-bold active:scale-95 disabled:opacity-50';
  return (
    <div className="space-y-1.5">
      <p className="text-[10.5px] font-semibold text-amber-700">{ru ? 'Без вашего «Опубликовать» не выйдет' : 'Сіз «Жариялау» баспасаңыз шықпайды'}</p>
      <div className="grid grid-cols-3 gap-1.5">
        <button disabled={busy} onClick={onApprove} className={`${b} bg-slate-900 text-white`}><Send className="w-3.5 h-3.5" />{past ? (ru ? 'Сейчас' : 'Қазір') : (ru ? 'Опубликовать' : 'Жариялау')}</button>
        <button disabled={busy || redoDisabled} onClick={() => (quickRedo ? onRedo('') : setOpen(!open))} className={`${b} bg-purple-50 text-purple-700 border border-purple-200`}><RotateCcw className="w-3.5 h-3.5" />{redoLabel}</button>
        <button disabled={busy} onClick={onSkip} className={`${b} bg-slate-100 text-slate-600`}><Ban className="w-3.5 h-3.5" />{ru ? 'Не надо' : 'Керек емес'}</button>
      </div>
      {redoNote && <p className="text-[10.5px] font-semibold text-slate-500">{redoNote}</p>}
      {open && !quickRedo && (
        <div className="space-y-1.5">
          <textarea value={wish} onChange={(e) => setWish(e.target.value)} rows={2} maxLength={1000}
            placeholder={ru ? 'Что изменить? (необязательно)' : 'Не өзгерту керек? (міндетті емес)'}
            className="w-full rounded-xl border border-slate-200 p-2 text-[12px] outline-none focus:border-purple-400" />
          <button disabled={busy} onClick={() => { setOpen(false); onRedo(wish.trim()); setWish(''); }} className={`${b} w-full bg-purple-600 text-white`}>
            <RotateCcw className="w-3.5 h-3.5" />{redoGo}
          </button>
        </div>
      )}
    </div>
  );
};
