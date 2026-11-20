// Bepul sinov: 14 video BIRDAN (2026-11-19, tadbirkor talabi; sayt cabinet/TrialStart.tsx bilan bir xil).
// Shart: Instagram ulangan + hamma savolga javob (soha, video so'rovnomasi, mahsulot qo'shilgan yoki o'tkazilgan).
// Shundan keyin backend 14 kunlik jadval tuzib, 14 videoni ketma-ket tayyorlaydi; foydalanuvchi faqat kuni
// kelganini ko'radi. Backend: services/video_plan.onboarding_status / ensure_trial_batch_bg.
import React, { useState } from 'react';
import { Check, Film, ImagePlus, Instagram, Loader2, Package, Sparkles } from 'lucide-react';
import { api, VideoOnboarding } from '../lib/api';
import { InstagramConnectCard } from './InstagramConnectCard';

type Lang = 'ru' | 'kk';
const tx = (lang: Lang, ru: string, kk: string) => (lang === 'kk' ? kk : ru);

/** Bitta mahsulotni tez qo'shish yoki o'tkazib yuborish (video va post rejasi uchun umumiy). */
export const ProductStepCard: React.FC<{
  businessId: string;
  lang: Lang;
  purpose: 'video' | 'post';
  onDone: (st: VideoOnboarding) => void;
}> = ({ businessId, lang, purpose, onDone }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<'add' | 'skip' | null>(null);
  const [err, setErr] = useState('');

  const add = async () => {
    if (!name.trim() || busy) return;
    setBusy('add');
    setErr('');
    try {
      let image_url: string | null = null;
      if (file) image_url = (await api.uploadProductImage(businessId, file)).image_url;
      await api.createProduct(businessId, { name: name.trim(), price: price.trim() || null, image_url });
      onDone(await api.videoProductsStep(businessId, false));
    } catch {
      setErr(tx(lang, 'Не удалось сохранить товар. Попробуйте ещё раз.', 'Тауар сақталмады. Қайталап көріңіз.'));
    } finally {
      setBusy(null);
    }
  };

  const skip = async () => {
    if (busy) return;
    setBusy('skip');
    setErr('');
    try {
      onDone(await api.videoProductsStep(businessId, true));
    } catch {
      setErr(tx(lang, 'Не получилось. Попробуйте ещё раз.', 'Болмады. Қайталап көріңіз.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2.5">
      <p className="text-[11.5px] text-slate-600 leading-snug">
        {purpose === 'video'
          ? tx(lang, 'Добавьте хотя бы один товар — видео будут про него. Если товаров нет, можно пропустить: видео будут про ваш бренд.',
            'Кемінде бір тауар қосыңыз — бейнелер сол туралы болады. Тауар болмаса, өткізіп жіберуге болады: бейнелер брендіңіз туралы болады.')
          : tx(lang, 'Добавьте товар — посты будут про него. Можно пропустить: посты будут про ваш бренд.',
            'Тауар қосыңыз — посттар сол туралы болады. Өткізіп жіберуге болады: посттар брендіңіз туралы болады.')}
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
        placeholder={tx(lang, 'Название товара', 'Тауар атауы')}
        className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2" />
      <div className="flex gap-2">
        <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" maxLength={20}
          placeholder={tx(lang, 'Цена, ₸ (необязательно)', 'Бағасы, ₸ (міндетті емес)')}
          className="flex-1 min-w-0 text-sm rounded-xl border border-slate-200 px-3 py-2" />
        <label className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
          <ImagePlus className="w-4 h-4" />
          {file ? tx(lang, 'Фото ✓', 'Фото ✓') : tx(lang, 'Фото', 'Фото')}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      </div>
      {err && <p className="text-[11px] font-semibold text-rose-600">{err}</p>}
      <div className="flex gap-2">
        <button onClick={add} disabled={!name.trim() || !!busy}
          className="flex-1 py-2.5 rounded-xl text-[12.5px] font-black bg-purple-600 text-white flex items-center justify-center gap-1.5 disabled:opacity-40">
          {busy === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          {tx(lang, 'Добавить товар', 'Тауар қосу')}
        </button>
        <button onClick={skip} disabled={!!busy}
          className="px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold bg-slate-100 text-slate-700 disabled:opacity-40">
          {busy === 'skip' ? <Loader2 className="w-4 h-4 animate-spin" /> : tx(lang, 'Пропустить', 'Өткізу')}
        </button>
      </div>
    </div>
  );
};

/** Bepul sinov kartasi: qolgan qadamlar ro'yxati; hammasi bajarilgach — "14 video tayyorlanmoqda". */
export const TrialStartCard: React.FC<{
  businessId: string;
  lang: Lang;
  status: VideoOnboarding;
  onChange: (st: VideoOnboarding) => void;
}> = ({ businessId, lang, status, onChange }) => {
  const [checking, setChecking] = useState(false);
  const recheck = async () => {
    setChecking(true);
    try {
      onChange(await api.videoOnboarding(businessId));
    } catch {
      /* keyin */
    } finally {
      setChecking(false);
    }
  };

  if (status.started) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-4 space-y-1.5">
        <p className="text-sm font-black flex items-center gap-1.5"><Sparkles className="w-4 h-4" />
          {tx(lang, `Готовим ${status.batch_size} видео`, `${status.batch_size} бейне дайындалуда`)}
        </p>
        <p className="text-[11.5px] text-white/85 leading-snug">
          {tx(lang, 'Первое видео появится здесь в свой день и выйдет в Instagram само. Каждый день открывается новое — по одному на 14 дней.',
            'Алғашқы бейне өз күнінде осында пайда болып, Instagram-ға өзі шығады. Күн сайын жаңасы ашылады — 14 күнге бір-бірден.')}
        </p>
      </div>
    );
  }

  const Step = ({ done, title, children }: { done: boolean; title: string; children?: React.ReactNode }) => (
    <div className={`rounded-2xl border p-3 ${done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <p className={`text-[12.5px] font-black flex items-center gap-2 ${done ? 'text-emerald-700' : 'text-slate-900'}`}>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {done ? <Check className="w-3.5 h-3.5" /> : null}
        </span>
        {title}
      </p>
      {!done && children && <div className="mt-2.5">{children}</div>}
    </div>
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
      <div>
        <h2 className="text-sm font-black flex items-center gap-1.5"><Film className="w-4 h-4 text-purple-600" />
          {tx(lang, '14 видео за раз — бесплатно', '14 бейне бірден — тегін')}
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {tx(lang, 'Выполните шаги ниже — и FindLead сразу подготовит 14 видео на 14 дней.',
            'Төмендегі қадамдарды орындаңыз — FindLead 14 күнге 14 бейнені бірден дайындайды.')}
        </p>
      </div>
      <Step done={status.niche} title={tx(lang, 'Сфера бизнеса', 'Бизнес саласы')} />
      <Step done={status.profile} title={tx(lang, 'Ответы о видео', 'Бейне туралы жауаптар')} />
      <Step done={status.instagram} title={tx(lang, 'Подключите Instagram', 'Instagram-ды қосыңыз')}>
        <div className="space-y-2">
          <InstagramConnectCard businessId={businessId} />
          <button onClick={recheck} disabled={checking}
            className="w-full py-2 rounded-xl text-[11.5px] font-bold bg-slate-100 text-slate-700 flex items-center justify-center gap-1.5">
            {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
            {tx(lang, 'Я подключил — проверить', 'Қостым — тексеру')}
          </button>
        </div>
      </Step>
      <Step done={status.products} title={tx(lang, 'Товар (или пропустить)', 'Тауар (немесе өткізу)')}>
        <ProductStepCard businessId={businessId} lang={lang} purpose="video" onDone={onChange} />
      </Step>
    </div>
  );
};
