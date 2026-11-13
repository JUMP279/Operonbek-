import React from 'react';
import { PackagePlus, ChevronRight } from 'lucide-react';

// Katalog bo'sh yoki kichik bo'lsa (2026-11-13): AI videoda ham, mijozga javobda ham aniq mahsulot va narxni
// bilmaydi — umumiy mavzuda yozadi va mijozga sotolmaydi. Bloklamaydi (mahsulotsiz rejim NicheGate bilan
// ataylab qo'llab-quvvatlanadi), lekin har safar bosh sahifada eslatadi.
export const PRODUCTS_TARGET = 3;

const T = {
  ru: {
    title: (n: number) => (n === 0 ? 'Добавьте товары' : `Добавьте ещё ${PRODUCTS_TARGET - n} товар(а)`),
    body: 'С фото и ценой AI показывает ваш товар в видео и сам продаёт его клиентам в Direct и Telegram. Без товаров он пишет о магазине в общем.',
    cta: 'Добавить товар',
  },
  kk: {
    title: (n: number) => (n === 0 ? 'Тауарларды қосыңыз' : `Тағы ${PRODUCTS_TARGET - n} тауар қосыңыз`),
    body: 'Суреті мен бағасы болса, AI тауарыңызды бейнеде көрсетеді және Direct пен Telegram-да клиенттерге өзі сатады. Тауарсыз ол дүкен туралы жалпы жазады.',
    cta: 'Тауар қосу',
  },
};

export const ProductsNudge: React.FC<{ count: number; lang: 'ru' | 'kk'; onAdd: () => void }> = ({ count, lang, onAdd }) => {
  if (count >= PRODUCTS_TARGET) return null;
  const L = T[lang];
  return (
    <button onClick={onAdd}
      className="w-full text-left bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 flex gap-3 items-start active:scale-[0.99] transition">
      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
        <PackagePlus className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-black text-slate-900">{L.title(count)}</p>
          <span className="text-[11px] font-bold text-amber-700 shrink-0">{count}/{PRODUCTS_TARGET}</span>
        </div>
        <p className="text-[12px] text-slate-600 mt-0.5 leading-snug">{L.body}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-amber-700">
          {L.cta}<ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};
