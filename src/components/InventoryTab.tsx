import React from 'react';
import { Package, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const InventoryTab: React.FC = () => {
  const { t, language } = useLanguage();

  const getStockStatusLabel = (status: 'In Stock' | 'Low Stock') => {
    if (status === 'In Stock') return t.inStock;
    return t.lowStock;
  };

  const stockItems = [
    { name: 'Wireless Smart Sensor Pro', sku: 'SKU-8012', stock: 450, status: 'In Stock' as const, price: '$89.00' },
    { name: 'Ultra HD Display Hub', sku: 'SKU-4921', stock: 24, status: 'Low Stock' as const, price: '$249.00' },
    { name: 'Industrial IoT Gateway', sku: 'SKU-9943', stock: 120, status: 'In Stock' as const, price: '$499.00' },
    { name: 'Compact NFC Terminal', sku: 'SKU-3120', stock: 680, status: 'In Stock' as const, price: '$45.00' }
  ];

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.inventoryTitle}</h2>
          <p className="text-[11px] text-slate-400">{t.inventorySubtitle}</p>
        </div>
      </div>

      <div className="space-y-2">
        {stockItems.map((item) => (
          <div
            key={item.sku}
            className="p-3 bg-white rounded-2xl border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                <p className="text-[10.5px] text-slate-400">{item.sku} • {item.price}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">{item.stock} {language === 'ru' ? 'шт.' : 'дана'}</div>
              <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md ${
                item.status === 'Low Stock' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {getStockStatusLabel(item.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
