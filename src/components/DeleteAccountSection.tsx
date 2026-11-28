import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

// Akkauntni o'chirish (2026-11-16, Google Play talabi: ilova ichida). Ikki bosqichli tasdiq — tasodifan bosilmasin.
const T = {
  uz: {
    btn: "Akkauntni o'chirish",
    title: "Akkauntni butunlay o'chirishmi?",
    text: "Barcha do'konlaringiz, mijozlaringiz va yozishmalaringiz, postlaringiz, videolaringiz, mahsulotlaringiz va akkauntingizning o'zi o'chiriladi. Ma'lumotlarni tiklab bo'lmaydi.",
    confirm: "Ha, abadiy o'chirish",
    cancel: "Bekor qilish",
    err: "Akkauntni o'chirib bo'lmadi. Keyinroq urinib ko'ring yoki qo'llab-quvvatlashga yozing.",
  }, ru: {
    btn: 'Удалить аккаунт',
    title: 'Удалить аккаунт навсегда?',
    text: 'Будут удалены все ваши магазины, клиенты и переписки, посты, видео, товары и сам аккаунт. Восстановить данные будет невозможно.',
    confirm: 'Да, удалить навсегда',
    cancel: 'Отмена',
    err: 'Не удалось удалить аккаунт. Попробуйте позже или напишите в поддержку.',
  },
  kk: {
    btn: 'Аккаунтты жою',
    title: 'Аккаунтты біржола жою керек пе?',
    text: 'Барлық дүкендеріңіз, клиенттер мен хат-хабарлар, посттар, бейнелер, тауарлар және аккаунттың өзі жойылады. Деректерді қалпына келтіру мүмкін болмайды.',
    confirm: 'Иә, біржола жою',
    cancel: 'Болдырмау',
    err: 'Аккаунтты жою мүмкін болмады. Кейінірек қайталаңыз немесе қолдауға жазыңыз.',
  },
};

export const DeleteAccountSection: React.FC<{ lang: 'uz' | 'ru' | 'kk'; onDeleted: () => void }> = ({ lang, onDeleted }) => {
  const L = T[lang];
  const [step, setStep] = useState<'idle' | 'confirm' | 'busy'>('idle');
  const [error, setError] = useState('');

  const doDelete = async () => {
    setStep('busy');
    setError('');
    try {
      await api.deleteAccount();
      onDeleted();
    } catch {
      setError(L.err);
      setStep('confirm');
    }
  };

  if (step === 'idle') {
    return (
      <button type="button" onClick={() => setStep('confirm')}
        className="w-full py-2 text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center justify-center gap-1.5">
        <Trash2 className="w-3.5 h-3.5" />{L.btn}
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-2">
      <p className="text-[13px] font-black text-rose-700">{L.title}</p>
      <p className="text-[11.5px] leading-snug text-rose-800/90">{L.text}</p>
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={doDelete} disabled={step === 'busy'}
          className="flex-1 h-9 rounded-lg bg-rose-600 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
          {step === 'busy' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{L.confirm}
        </button>
        <button type="button" onClick={() => { setStep('idle'); setError(''); }} disabled={step === 'busy'}
          className="flex-1 h-9 rounded-lg bg-white border border-slate-200 text-slate-600 text-[12px] font-bold">{L.cancel}</button>
      </div>
    </div>
  );
};
