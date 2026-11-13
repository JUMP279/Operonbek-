import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, DashboardData } from '../lib/api';
import { OrdersTab } from './OrdersTab';
import { MarketplaceConnectCard } from './MarketplaceConnectCard';

// Vositalar menyusidagi "Buyurtmalar" — REAL buyurtmalar (avval inglizcha soxta demo edi).
export const OrdersManagerView: React.FC<{ onBack: () => void; storeContext?: { businessId?: string } }> = ({
  onBack, storeContext,
}) => {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const businessId = storeContext?.businessId;
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!businessId) return;
    try {
      setDash(await api.dashboard(businessId, 90));
    } catch {
      setError(ru ? 'Не удалось загрузить заказы' : 'Тапсырыстар жүктелмеді');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full flex items-center gap-2">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-purple-600" />{ru ? 'Заказы' : 'Тапсырыстар'}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-16">
        {businessId && <MarketplaceConnectCard businessId={businessId} onSynced={load} />}
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
        {!dash && !error && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>}
        {dash && businessId && (
          <OrdersTab
            orders={dash.orders || []}
            currency={dash.currency || 'KZT'}
            onSetStatus={async (orderId, status) => {
              await api.setOrderStatus(businessId, orderId, status);
              await load();
            }}
          />
        )}
      </div>
    </div>
  );
};
