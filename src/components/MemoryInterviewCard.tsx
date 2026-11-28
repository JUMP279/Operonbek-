import { isUz } from '../context/LanguageContext';
// Biznes xotirasini to'ldirish — savol-javob (2026-11-22, Gramir "Agent Builder" uslubida, FindLead stilida).
// FindLead ONLINE SOTILADIGAN MAHSULOT sotuvchilari uchun (xizmat/salon emas): avval mahsulot TURI tanlanadi,
// keyin savollar o'sha turga moslashadi + online-savdoga xos (yetkazib berish, to'lov, qaytarish). Sayt
// cabinet/MemoryInterview.tsx bilan bir xil. Javoblar BIRDAN xotiraga tushadi → AI tushuncha → kontent/chat.
import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Loader2, MessageCircleQuestion, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

type L = 'uz' | 'ru' | 'kk';
type Loc = { uz: string; ru: string; kk: string };
type Q = { key: string; topic: Loc; q: Loc; hint: Loc };

const CATEGORIES: { key: string; label: Loc }[] = [
  { key: 'clothing', label: { uz: "Kiyim", ru: 'Одежда', kk: 'Киім' } },
  { key: 'shoes', label: { uz: "Poyabzal", ru: 'Обувь', kk: 'Аяқ киім' } },
  { key: 'cosmetics', label: { uz: "Kosmetika va parvarish", ru: 'Косметика и уход', kk: 'Косметика, күтім' } },
  { key: 'electronics', label: { uz: "Elektronika va texnika", ru: 'Электроника и техника', kk: 'Электроника, техника' } },
  { key: 'accessories', label: { uz: "Aksessuarlar va taqinchoqlar", ru: 'Аксессуары и украшения', kk: 'Аксессуар, әшекей' } },
  { key: 'home', label: { uz: "Uy uchun mahsulotlar", ru: 'Товары для дома', kk: 'Үй тауарлары' } },
  { key: 'kids', label: { uz: "Bolalar tovarlari", ru: 'Детские товары', kk: 'Балалар тауары' } },
  { key: 'food', label: { uz: "Oziq-ovqat, ichimliklar, shirinliklar", ru: 'Еда, напитки, сладости', kk: 'Тағам, сусын, тәтті' } },
  { key: 'handmade', label: { uz: "Qo'lda ishlangan", ru: 'Ручная работа', kk: 'Қолдан жасалған' } },
  { key: 'other', label: { uz: "Boshqa", ru: 'Другое', kk: 'Басқа' } },
];

const BASE: Q[] = [
  { key: 'assortment', topic: { uz: "Assortiment", ru: 'Ассортимент', kk: 'Ассортимент' }, q: { uz: "Aynan nima sotasiz?", ru: 'Что именно вы продаёте?', kk: 'Нақты не сатасыз?' }, hint: { uz: "Asosiy tovarlar va nechta pozitsiya.", ru: 'Основные товары и сколько позиций.', kk: 'Негізгі тауарлар, неше позиция.' } },
  { key: 'audience', topic: { uz: "Mijozlar va shaharlar", ru: 'Клиенты и города', kk: 'Клиенттер, қалалар' }, q: { uz: "Kim sotib oladi va qaysi shaharlarga yetkazib berasiz?", ru: 'Кто покупает и в какие города доставляете?', kk: 'Кім сатып алады, қай қалаларға?' }, hint: { uz: "Jins, yosh; shaharlar yoki butun mamlakat.", ru: 'Пол, возраст; города или вся страна.', kk: 'Жынысы, жасы; қалалар не бүкіл ел.' } },
  { key: 'price', topic: { uz: "Narxlar", ru: 'Цены', kk: 'Бағалар' }, q: { uz: "Narxlaringiz qanday?", ru: 'Какие у вас цены?', kk: 'Бағаларыңыз қандай?' }, hint: { uz: "Diapazon va o'rtacha chek. Mas.: 5 000–40 000 tenge.", ru: 'Диапазон и средний чек. Напр.: 5 000–40 000 ₸.', kk: 'Ауқымы мен орташа чек. Мыс.: 5 000–40 000 ₸.' } },
  { key: 'delivery', topic: { uz: "Yetkazib berish", ru: 'Доставка', kk: 'Жеткізу' }, q: { uz: "Qanday va nima bilan yetkazib berasiz?", ru: 'Как и чем доставляете?', kk: 'Қалай, немен жеткізесіз?' }, hint: { uz: "Xizmat, muddatlar, narx.", ru: 'Служба, сроки, стоимость.', kk: 'Қызмет, мерзім, баға.' } },
  { key: 'payment', topic: { uz: "To'lov", ru: 'Оплата', kk: 'Төлем' }, q: { uz: "Mijozlar qanday to'laydi?", ru: 'Как клиенты оплачивают?', kk: 'Клиенттер қалай төлейді?' }, hint: { uz: "Kaspi, karta, o'tkazma, olishda.", ru: 'Kaspi, карта, перевод, при получении.', kk: 'Kaspi, карта, аударым, алғанда.' } },
  { key: 'returns', topic: { uz: "Qaytarish va almashtirish", ru: 'Возврат и обмен', kk: 'Қайтару, айырбас' }, q: { uz: "Qaytarish yoki almashtirish bormi?", ru: 'Есть ли возврат или обмен?', kk: 'Қайтару не айырбас бар ма?' }, hint: { uz: "Qanday shartlarda va necha kun.", ru: 'При каких условиях и сколько дней.', kk: 'Қандай шартпен, неше күн.' } },
  { key: 'promo', topic: { uz: "Aksiyalar", ru: 'Акции', kk: 'Акциялар' }, q: { uz: "Hozir aksiyalar yoki chegirmalar bormi?", ru: 'Есть ли сейчас акции или скидки?', kk: 'Қазір акция не жеңілдік бар ма?' }, hint: { uz: "Mas.: −20% oy oxirigacha. Yo'q — yozing.", ru: 'Напр.: −20% до конца месяца. Нет — напишите.', kk: 'Мыс.: −20% ай соңына. Жоқ — жазыңыз.' } },
  { key: 'faq', topic: { uz: "Ko'p so'raladigan savollar", ru: 'Частые вопросы', kk: 'Жиі сұрақтар' }, q: { uz: "Mijozlar ko'pincha nima so'raydi?", ru: 'Что чаще всего спрашивают клиенты?', kk: 'Клиенттер жиі нені сұрайды?' }, hint: { uz: "Va bunga qanday javob berasiz?", ru: 'И как вы на это отвечаете.', kk: 'Және оған қалай жауап бересіз.' } },
  { key: 'tone', topic: { uz: "Muloqot uslubi", ru: 'Тон общения', kk: 'Сөйлесу мәнері' }, q: { uz: "AI mijozlar bilan qanday muloqot qilishi kerak?", ru: 'Как AI должен общаться с клиентами?', kk: 'AI клиенттермен қалай сөйлессін?' }, hint: { uz: "«sen»/«siz», do'stona, hazil bilan yoki qat'iy.", ru: 'На «ты»/«вы», дружелюбно, с юмором или строго.', kk: '«Сен»/«сіз», достық, әзілмен не қатаң.' } },
  { key: 'avoid', topic: { uz: "Nima qilmaslik kerak", ru: 'Чего не делать', kk: 'Нені істемеу' }, q: { uz: "AI nima haqida gapirmasligi kerak?", ru: 'О чём AI НЕ должен говорить?', kk: 'AI не туралы айтпауы керек?' }, hint: { uz: "Taqiqlangan mavzular, so'zlar. Yo'q — o'tkazib yuboring.", ru: 'Запретные темы, слова. Нет — пропустите.', kk: 'Тыйым тақырыптар. Жоқ — өткізіңіз.' } },
];

const EXTRA: Record<string, Q[]> = {
  clothing: [{ key: 'sizes', topic: { uz: "O'lchamlar va mato", ru: 'Размеры и ткань', kk: 'Өлшем, мата' }, q: { uz: "Qanday o'lchamlar va qanday matodan?", ru: 'Какие размеры и из какой ткани?', kk: 'Қай өлшемдер, қай матадан?' }, hint: { uz: "O'lcham jadvali, tarkibi, parvarish.", ru: 'Размерная сетка, состав, уход.', kk: 'Өлшем кестесі, құрам, күтім.' } }],
  shoes: [{ key: 'sizes', topic: { uz: "O'lchamlar", ru: 'Размеры', kk: 'Өлшемдер' }, q: { uz: "Qanday o'lchamlar va qanday tanlash kerak?", ru: 'Какие размеры и как подобрать?', kk: 'Қай өлшемдер, қалай таңдау?' }, hint: { uz: "O'lcham qatori, o'lchamlar jadvali.", ru: 'Размерный ряд, таблица размеров.', kk: 'Өлшем қатары, кесте.' } }],
  cosmetics: [{ key: 'composition', topic: { uz: "Tarkibi va muddati", ru: 'Состав и срок', kk: 'Құрам, мерзім' }, q: { uz: "Tarkibi, qaysi teri/soch turi uchun va muddati?", ru: 'Состав, для какого типа кожи/волос и срок?', kk: 'Құрам, қай тері/шашқа, мерзімі?' }, hint: { uz: "Xarid qilishdan oldin eng ko'p so'raladigan narsa.", ru: 'Главное, что спрашивают перед покупкой.', kk: 'Сатып алмас бұрын сұрайтыны.' } }],
  electronics: [{ key: 'warranty', topic: { uz: "Kafolat va original", ru: 'Гарантия и оригинал', kk: 'Кепілдік, түпнұсқа' }, q: { uz: "Kafolat bormi va mahsulot originalmi?", ru: 'Есть гарантия и товар оригинальный?', kk: 'Кепілдік бар ма, түпнұсқа ма?' }, hint: { uz: "Kafolat muddati, xususiyatlari.", ru: 'Срок гарантии, характеристики.', kk: 'Кепілдік мерзімі, сипаттамалар.' } }],
  accessories: [{ key: 'material', topic: { uz: "Material va o'ram", ru: 'Материал и упаковка', kk: 'Материал, қаптама' }, q: { uz: "Nimadan tayyorlangan va qanday qadoqlangan?", ru: 'Из чего сделано и как упаковано?', kk: 'Неден жасалған, қалай қапталған?' }, hint: { uz: "Materiali, sovg'a o'rami.", ru: 'Материал, подарочная упаковка.', kk: 'Материал, сыйлық қаптама.' } }],
  home: [{ key: 'size', topic: { uz: "O'lchamlari va materiali", ru: 'Размеры и материал', kk: 'Өлшем, материал' }, q: { uz: "O'lchamlari va nimadan yasalgan?", ru: 'Габариты и из чего сделаны?', kk: 'Өлшем, неден жасалған?' }, hint: { uz: "O'lchamlari, og'irligi, materiali.", ru: 'Размеры, вес, материал.', kk: 'Өлшем, салмақ, материал.' } }],
  kids: [{ key: 'age', topic: { uz: "Yosh va xavfsizlik", ru: 'Возраст и безопасность', kk: 'Жас, қауіпсіздік' }, q: { uz: "Qaysi yosh uchun va xavfsizmi?", ru: 'Для какого возраста и безопасно ли?', kk: 'Қай жасқа, қауіпсіз бе?' }, hint: { uz: "Yoshi, sertifikatlari, materiallari.", ru: 'Возраст, сертификаты, материалы.', kk: 'Жас, сертификат, материал.' } }],
  food: [{ key: 'shelf', topic: { uz: "Tarkibi va saqlash", ru: 'Состав и хранение', kk: 'Құрам, сақтау' }, q: { uz: "Tarkibi, yaroqlilik muddati va qanday saqlash kerak?", ru: 'Состав, срок годности и как хранить?', kk: 'Құрам, мерзімі, қалай сақтау?' }, hint: { uz: "Tez buziladigan mahsulotlar uchun muhim! Yetkazib berish zonasi.", ru: 'Для скоропорта важно! Зона доставки.', kk: 'Тез бұзылса маңызды! Жеткізу аймағы.' } }],
  handmade: [{ key: 'custom', topic: { uz: "Buyurtma asosida va muddatlar", ru: 'Под заказ и сроки', kk: 'Тапсырыс, мерзім' }, q: { uz: "Buyurtma asosida tayyorlaysizmi? Qancha kutish kerak?", ru: 'Делаете под заказ? Сколько ждать?', kk: 'Тапсырыспен бе? Қанша күту?' }, hint: { uz: "Tayyorlash muddatlari, noyobligi.", ru: 'Сроки изготовления, уникальность.', kk: 'Жасау мерзімі, ерекшелік.' } }],
  other: [],
};

export const MemoryInterviewCard: React.FC<{ businessId?: string | null; lang: L; onSaved: () => void }> = ({ businessId, lang, onSaved }) => {
  const ru = lang !== 'kk';
  const [cat, setCat] = useState<{ key: string; label: Loc } | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [doneMsg, setDoneMsg] = useState(false);
  const [err, setErr] = useState('');
  const questions = useMemo(() => (cat ? [...BASE, ...(EXTRA[cat.key] || [])] : BASE), [cat]);
  if (!businessId) return null;

  const total = questions.length;
  const cur = questions[i];
  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;
  const isLast = i === total - 1;
  const setVal = (v: string) => setAnswers((a) => ({ ...a, [cur.key]: v }));

  const save = async () => {
    const texts: string[] = [];
    if (cat) texts.push(`${(isUz() ? "Mahsulot toifasi" : ru ? 'Категория товара' : 'Тауар санаты')}: ${cat.label[lang]}`);
    for (const qq of questions) {
      const v = (answers[qq.key] || '').trim();
      if (v) texts.push(`${qq.topic[lang]}: ${v}`);
    }
    if (texts.length <= 1 && !answeredCount) { setDoneMsg(true); return; }
    setSaving(true); setErr('');
    try {
      await api.addUnderstandingAnswers(businessId, texts);
      setDoneMsg(true); setAnswers({}); setCat(null); setI(0); onSaved();
    } catch {
      setErr((isUz() ? "Saqlab bo'lmadi. Yana urinib ko'ring." : ru ? 'Не удалось сохранить. Попробуйте ещё раз.' : 'Сақталмады. Қайталап көріңіз.'));
    } finally { setSaving(false); }
  };

  if (doneMsg) {
    return (
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-700"><Check className="w-4 h-4" />{(isUz() ? "Rahmat! Xotira yangilanmoqda" : ru ? 'Спасибо! Память обновляется' : 'Рақмет! Жады жаңартылуда')}</div>
        <p className="text-[11.5px] text-slate-500 leading-snug">{(isUz() ? "FindLead buni video, postlar va javoblarda hisobga oladi. Yangilanish 3 daqiqagacha vaqt oladi." : ru ? 'FindLead учтёт это в видео, постах и ответах. Обновление займёт до 3 минут.' : 'FindLead мұны видео, пост пен жауапта ескереді. 3 минутқа дейін.')}</p>
        <button onClick={() => setDoneMsg(false)} className="px-3.5 py-2 rounded-xl text-[12px] font-bold bg-slate-100 text-slate-700 active:scale-95">{(isUz() ? "Yana qo'shish" : ru ? 'Добавить ещё' : 'Тағы қосу')}</button>
      </div>
    );
  }

  // 1-qadam: tur tanlash
  if (!cat) {
    return (
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900"><MessageCircleQuestion className="w-3.5 h-3.5 text-purple-600" />{(isUz() ? "FindLeadga biznesingiz haqida aytib bering" : ru ? 'Расскажите FindLead о бизнесе' : 'FindLead-ке бизнес туралы айтыңыз')}</div>
        <div>
          <p className="text-[14.5px] font-bold text-slate-900">{(isUz() ? "Onlayn nima sotasiz?" : ru ? 'Что вы продаёте онлайн?' : 'Онлайн не сатасыз?')}</p>
          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{(isUz() ? "Kategoriyani tanlang — savollar mahsulotingizga moslashadi." : ru ? 'Выберите категорию — вопросы подстроятся под ваш товар.' : 'Санатты таңдаңыз — сұрақтар тауарыңызға бейімделеді.')}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => { setCat(c); setI(0); }}
              className="rounded-full border border-slate-200 bg-white hover:border-purple-400 hover:text-purple-700 px-3 py-2 text-[12px] font-bold active:scale-95 transition">
              {c.label[lang]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3">
      <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
        <MessageCircleQuestion className="w-3.5 h-3.5 text-purple-600" />{(isUz() ? "Biznes haqida" : ru ? 'О бизнесе' : 'Бизнес туралы')}
        <span className="ml-auto text-[10.5px] text-slate-400 font-medium">{cat.label[lang]} · <button onClick={() => { setCat(null); setI(0); }} className="text-purple-600">{(isUz() ? "o'zgartirish" : ru ? 'изменить' : 'өзгерту')}</button></span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10.5px] text-slate-400">
          <span>{(isUz() ? "Savol" : ru ? 'Вопрос' : 'Сұрақ')} {i + 1} / {total}</span>
          <span>{(isUz() ? "Javob berildi" : ru ? 'Отвечено' : 'Жауап')}: {answeredCount}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} /></div>
      </div>

      <div className="rounded-xl bg-slate-50 p-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-purple-600">{cur.topic[lang]}</div>
        <p className="mt-0.5 text-[14.5px] font-bold text-slate-900 leading-snug">{cur.q[lang]}</p>
        <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{cur.hint[lang]}</p>
        <textarea value={answers[cur.key] || ''} onChange={(e) => setVal(e.target.value)} maxLength={600} rows={3} autoFocus
          placeholder={(isUz() ? "Javobingiz…" : ru ? 'Ваш ответ…' : 'Жауабыңыз…')}
          className="mt-2 w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:border-purple-500 resize-none" />
      </div>
      {err && <p className="text-[11.5px] text-rose-600">{err}</p>}

      <div className="flex items-center gap-2">
        {i > 0 && <button onClick={() => setI(i - 1)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 active:scale-95"><ArrowLeft className="w-4 h-4" /></button>}
        {!isLast ? (
          <>
            <button onClick={() => setI(i + 1)} className="px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold text-slate-500 bg-slate-100 active:scale-95">{(isUz() ? "O'tkazib yuborish" : ru ? 'Пропустить' : 'Өткізу')}</button>
            <button onClick={() => setI(i + 1)} className="ml-auto px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold active:scale-95">{(isUz() ? "Davom etish" : ru ? 'Дальше' : 'Әрі қарай')}</button>
          </>
        ) : (
          <button onClick={save} disabled={saving} className="ml-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-[13px] font-bold disabled:opacity-50 active:scale-95">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{(isUz() ? "Xotiraga saqlash" : ru ? 'Сохранить в память' : 'Жадыға сақтау')}
          </button>
        )}
      </div>
      {answeredCount > 0 && !isLast && (
        <button onClick={save} disabled={saving} className="text-[11.5px] text-purple-700 font-bold">{saving ? '…' : ((isUz() ? `Javoblarni (${answeredCount}) hozir saqlash` : ru ? `Сохранить ответы (${answeredCount}) сейчас` : `Жауаптарды (${answeredCount}) қазір сақтау`))}</button>
      )}
    </div>
  );
};
