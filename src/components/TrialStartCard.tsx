import { isUz } from '../context/LanguageContext';
// Bepul sinov: 14 video BIRDAN (2026-11-19, tadbirkor talabi; sayt cabinet/TrialStart.tsx bilan bir xil).
// Shart: Instagram ulangan + hamma savolga javob (soha, video so'rovnomasi, mahsulot qo'shilgan yoki o'tkazilgan).
// Shundan keyin backend 14 kunlik jadval tuzib, 14 videoni ketma-ket tayyorlaydi; foydalanuvchi faqat kuni
// kelganini ko'radi. Backend: services/video_plan.onboarding_status / ensure_trial_batch_bg.
import React, { useState } from 'react';
import { Check, Film, ImagePlus, Instagram, Loader2, Package, Send, Sparkles } from 'lucide-react';
import { api, VideoOnboarding } from '../lib/api';
import { InstagramConnectCard } from './InstagramConnectCard';
import { TelegramConnectCard } from './TelegramConnectCard';
import { bizCurSymbol } from '../lib/format';

type Lang = 'uz' | 'ru' | 'kk';
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
      setErr((isUz() ? "Tovarni saqlab bo'lmadi. Yana urinib ko'ring." : tx(lang, 'Не удалось сохранить товар. Попробуйте ещё раз.', 'Тауар сақталмады. Қайталап көріңіз.')));
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
      setErr((isUz() ? "Bo'lmadi. Qaytadan urinib ko'ring." : tx(lang, 'Не получилось. Попробуйте ещё раз.', 'Болмады. Қайталап көріңіз.')));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2.5">
      <p className="text-[11.5px] text-slate-600 leading-snug">
        {purpose === 'video'
          ? (isUz() ? "Kamida bitta mahsulot qo'shing — videolar u haqida bo'ladi. Mahsulotlar bo'lmasa, o'tkazib yuborish mumkin: videolar brendingiz haqida bo'ladi." : tx(lang, 'Добавьте хотя бы один товар — видео будут про него. Если товаров нет, можно пропустить: видео будут про ваш бренд.',
            'Кемінде бір тауар қосыңыз — бейнелер сол туралы болады. Тауар болмаса, өткізіп жіберуге болады: бейнелер брендіңіз туралы болады.'))
          : (isUz() ? "Mahsulot qo'shing — postlar u haqida bo'ladi. O'tkazib yuborish mumkin: postlar brendingiz haqida bo'ladi." : tx(lang, 'Добавьте товар — посты будут про него. Можно пропустить: посты будут про ваш бренд.',
            'Тауар қосыңыз — посттар сол туралы болады. Өткізіп жіберуге болады: посттар брендіңіз туралы болады.'))}
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
        placeholder={(isUz() ? "Mahsulot nomi" : tx(lang, 'Название товара', 'Тауар атауы'))}
        className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2" />
      <div className="flex gap-2">
        <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" maxLength={20}
          placeholder={`${isUz() ? 'Narxi' : tx(lang, 'Цена', 'Бағасы')}, ${bizCurSymbol()} (${isUz() ? 'majburiy emas' : tx(lang, 'необязательно', 'міндетті емес')})`}
          className="flex-1 min-w-0 text-sm rounded-xl border border-slate-200 px-3 py-2" />
        <label className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
          <ImagePlus className="w-4 h-4" />
          {file ? (isUz() ? "Foto ✓" : tx(lang, 'Фото ✓', 'Фото ✓')) : (isUz() ? "Foto" : tx(lang, 'Фото', 'Фото'))}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      </div>
      {err && <p className="text-[11px] font-semibold text-rose-600">{err}</p>}
      <div className="flex gap-2">
        <button onClick={add} disabled={!name.trim() || !!busy}
          className="flex-1 py-2.5 rounded-xl text-[12.5px] font-black bg-purple-600 text-white flex items-center justify-center gap-1.5 disabled:opacity-40">
          {busy === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          {(isUz() ? "Mahsulot qo'shish" : tx(lang, 'Добавить товар', 'Тауар қосу'))}
        </button>
        <button onClick={skip} disabled={!!busy}
          className="px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold bg-slate-100 text-slate-700 disabled:opacity-40">
          {busy === 'skip' ? <Loader2 className="w-4 h-4 animate-spin" /> : (isUz() ? "O'tkazib yuborish" : tx(lang, 'Пропустить', 'Өткізу'))}
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
          {(isUz() ? `Tayyorlayapmiz ${status.batch_size} video` : tx(lang, `Готовим ${status.batch_size} видео`, `${status.batch_size} бейне дайындалуда`))}
        </p>
        <p className="text-[11.5px] text-white/85 leading-snug">
          {(isUz() ? "Birinchi video o'z kunida shu yerda paydo bo'ladi va o'zi Instagram'ga chiqadi. Har kuni yangisi ochiladi — 14 kun davomida bittadan." : tx(lang, 'Первое видео появится здесь в свой день и выйдет в Instagram само. Каждый день открывается новое — по одному на 14 дней.',
            'Алғашқы бейне өз күнінде осында пайда болып, Instagram-ға өзі шығады. Күн сайын жаңасы ашылады — 14 күнге бір-бірден.'))}
        </p>
      </div>
    );
  }

  // Har qadam ENDI nima qilishni va QAYERDA qilishni tushuntiradi (2026-11-21) — avval faqat sarlavha edi.
  const Step = ({ done, n, title, desc, children }: { done: boolean; n: number; title: string; desc: string; children?: React.ReactNode }) => (
    <div className={`rounded-2xl border p-3 ${done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <p className={`text-[12.5px] font-black flex items-center gap-2 ${done ? 'text-emerald-700' : 'text-slate-900'}`}>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] ${done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {done ? <Check className="w-3.5 h-3.5" /> : n}
        </span>
        {title}
      </p>
      <p className="mt-1 pl-7 text-[11px] text-slate-500 leading-snug">{desc}</p>
      {!done && children && <div className="mt-2.5">{children}</div>}
    </div>
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
      <div>
        <h2 className="text-sm font-black flex items-center gap-1.5"><Film className="w-4 h-4 text-purple-600" />
          {(isUz() ? "14 video bepul — 4 qadamda" : tx(lang, '14 видео бесплатно — за 4 шага', '14 бейне тегін — 4 қадаммен'))}
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {(isUz() ? "4 qadamni bajaring — va FindLead 14 kunlik 14 ta videoni o'zi tayyorlaydi va har kuni bittadan joylaydi. Belgilash = qadam tayyor." : tx(lang, 'Выполните 4 шага — и FindLead сам подготовит 14 видео на 14 дней и будет выкладывать по одному в день. Галочка = шаг готов.',
            '4 қадамды орындаңыз — FindLead 14 күнге 14 бейнені дайындап, күнде бір-бірден шығарады. Белгі = қадам дайын.'))}
        </p>
      </div>
      <Step done={status.niche} n={1} title={(isUz() ? "Biznes sohasi" : tx(lang, 'Сфера бизнеса', 'Бизнес саласы'))}
        desc={status.niche
          ? (isUz() ? "Tayyor." : tx(lang, 'Готово.', 'Дайын.'))
          : (isUz() ? "Nima bilan shug'ullanasiz — shunga qarab ssenariylar yoziladi. «Biznes xotirasi» bo'limida to'ldiring." : tx(lang, 'Чем вы занимаетесь — по этому пишутся сценарии. Заполните в разделе «Память бизнеса».', 'Немен айналысасыз — сценарий соған қарап жазылады. «Бизнес жады» бөлімінде толтырыңыз.'))} />
      <Step done={status.profile} n={2} title={(isUz() ? "Til va video sozlamalari" : tx(lang, 'Язык и настройки видео', 'Тіл және бейне баптаулары'))}
        desc={status.profile
          ? (isUz() ? "Tayyor." : tx(lang, 'Готово.', 'Дайын.'))
          : (isUz() ? "Yuqorida, shu ekranning o'zida video uslubi va formatini tanlang — bu videolar qanday ko'rinishini belgilaydi." : tx(lang, 'Выберите стиль и формат видео выше, на этом же экране — это задаёт, как будут выглядеть видео.', 'Осы экранда жоғарыда стиль мен форматты таңдаңыз — бейненің түрі осыдан.'))} />
      <Step done={status.instagram} n={3} title={(isUz() ? "Instagram'ni ulang" : tx(lang, 'Подключите Instagram', 'Instagram-ды қосыңыз'))}
        desc={status.instagram
          ? (isUz() ? "Instagram ulangan — videolar avtomatik chiqadi." : tx(lang, 'Instagram подключён — видео выходят автоматически.', 'Instagram қосылды — бейнелер өзі шығады.'))
          : (isUz() ? "Instagram'siz videolar chiqmaydi. Pastdagi «Ulash» tugmasini bosing va do'kon akkauntiga kiring." : tx(lang, 'Без Instagram видео не выходят. Нажмите «Подключить» ниже и войдите в аккаунт магазина.', 'Instagram-сыз бейне шықпайды. Төменде «Қосу» басып, дүкен аккаунтына кіріңіз.'))}>
        <div className="space-y-2">
          <InstagramConnectCard businessId={businessId} />
          <button onClick={recheck} disabled={checking}
            className="w-full py-2 rounded-xl text-[11.5px] font-bold bg-slate-100 text-slate-700 flex items-center justify-center gap-1.5">
            {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
            {(isUz() ? "Men uladim — tekshirish" : tx(lang, 'Я подключил — проверить', 'Қостым — тексеру'))}
          </button>
        </div>
      </Step>
      <Step done={status.products} n={4} title={(isUz() ? "Mahsulot (yoki o'tkazib yuborish)" : tx(lang, 'Товар (или пропустить)', 'Тауар (немесе өткізу)'))}
        desc={status.products
          ? (isUz() ? "Tayyor." : tx(lang, 'Готово.', 'Дайын.'))
          : (isUz() ? "Mahsulot qo'shing — videolar u haqida bo'ladi. Mahsulotlar yo'q — «O'tkazib yuborish» tugmasini bosing." : tx(lang, 'Добавьте товар — видео будут про него. Нет товаров — нажмите «Пропустить».', 'Тауар қосыңыз — бейне сол туралы болады. Жоқ болса «Өткізу» басыңыз.'))}>
        <ProductStepCard businessId={businessId} lang={lang} purpose="video" onDone={onChange} />
      </Step>
      {/* Telegram — ixtiyoriy: video/postlar Telegram kanalga ham chiqadi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
        <p className="text-[12.5px] font-black text-slate-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-500" />{(isUz() ? "Telegram — ixtiyoriy" : tx(lang, 'Telegram — по желанию', 'Telegram — қалауыңызша'))}
        </p>
        <p className="text-[11px] text-slate-500 leading-snug">
          {(isUz() ? "Video va postlar Telegram-kanalda ham chiqishi, buyurtmalar botga kelishi uchun ulang." : tx(lang, 'Подключите, чтобы видео и посты выходили ещё и в Telegram-канал, а заказы приходили в бот.',
            'Қоссаңыз, бейне мен пост Telegram-арнаға да шығады, тапсырыстар ботқа келеді.'))}
        </p>
        <TelegramConnectCard businessId={businessId} />
      </div>
    </div>
  );
};
