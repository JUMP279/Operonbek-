import React from 'react';
import { Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DashboardProduct } from '../lib/api';
import { formatMoney } from '../lib/format';

const LOW_STOCK = 5;

export const InventoryTab: React.FC<{ products: DashboardProduct[]; currency: string }> = ({ products, currency }) => {
  const { t, language } = useLanguage();
  const ru = language !== 'kk';

  return (
    <div className="space-y-3 pt-1">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t.inventoryTitle}</h2>
        <p className="text-[11px] text-slate-400">
          {ru ? `Всего товаров: ${products.length}` : `Барлық тауар: ${products.length}`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-14 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{ru ? 'Товаров пока нет' : 'Тауарлар әзірге жоқ'}</p>
          <p className="text-xs text-slate-400 max-w-[240px]">
            {ru
              ? 'Товары появятся после подключения Kaspi, Wildberries или Uzum.'
              : 'Kaspi, Wildberries немесе Uzum қосылғаннан кейін тауарлар шығады.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => {
            const stock = typeof p.stock === 'number' ? p.stock : null;
            const inactive = p.is_active === false;
            const low = stock !== null && stock <= LOW_STOCK;
            return (
              <div key={p.id} className="p-3 bg-white rounded-2xl border border-slate-100/90 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-9 h-9 rounded-xl object-cover bg-slate-100 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                    <p className="text-[10.5px] text-slate-400">
                      {p.product_code ? `#${p.product_code} • ` : ''}
                      {p.price ? formatMoney(p.price, currency, language) : '—'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    {stock === null ? '—' : `${stock} ${ru ? 'шт.' : 'дана'}`}
                  </div>
                  <span
                    className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md ${
                      inactive ? 'bg-slate-100 text-slate-500' : low ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {inactive ? (ru ? 'Скрыт' : 'Жасырын') : low ? t.lowStock : t.inStock}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
