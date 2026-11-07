import React, { useState } from 'react';
import { ChevronLeft, SlidersHorizontal, Package, Check, Clock, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface OrderItem {
  id: string;
  orderNumber: string;
  createdDate: string;
  deliveryDate: string;
  itemsCount: number;
  shippingMethod: string;
  status: 'In processing' | 'Completed' | 'Return';
}

export const OrdersTab: React.FC<{ onOpenExport?: () => void; onBack?: () => void }> = ({
  onOpenExport,
  onBack
}) => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'All' | 'In processing' | 'Completed' | 'Return'>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const ordersData: OrderItem[] = [
    {
      id: '1',
      orderNumber: 'Order 34567',
      createdDate: 'From Sept 22',
      deliveryDate: 'Sept 27',
      itemsCount: 1,
      shippingMethod: 'Canada post',
      status: 'In processing'
    },
    {
      id: '2',
      orderNumber: 'Order 54577',
      createdDate: 'From Sept 12',
      deliveryDate: 'Sept 16',
      itemsCount: 2,
      shippingMethod: 'Canada post',
      status: 'Completed'
    },
    {
      id: '3',
      orderNumber: 'Order 4567',
      createdDate: 'From Sept 1',
      deliveryDate: 'Sept 10',
      itemsCount: 8,
      shippingMethod: 'Canada post',
      status: 'Return'
    },
    {
      id: '4',
      orderNumber: 'Order 98421',
      createdDate: 'From Oct 14',
      deliveryDate: 'Oct 19',
      itemsCount: 3,
      shippingMethod: 'Express Post',
      status: 'In processing'
    },
    {
      id: '5',
      orderNumber: 'Order 87123',
      createdDate: 'From Oct 08',
      deliveryDate: 'Oct 12',
      itemsCount: 5,
      shippingMethod: 'DHL Express',
      status: 'Completed'
    }
  ];

  const filteredOrders = ordersData.filter((order) => {
    if (filter === 'All') return true;
    return order.status === filter;
  });

  const getFilterLabel = (f: 'All' | 'In processing' | 'Completed' | 'Return') => {
    switch (f) {
      case 'All':
        return language === 'ru' ? 'Все' : 'Барлығы';
      case 'In processing':
        return language === 'ru' ? 'В обработке' : 'Өңделуде';
      case 'Completed':
        return language === 'ru' ? 'Завершен' : 'Орындалды';
      case 'Return':
        return language === 'ru' ? 'Возврат' : 'Қайтарылды';
    }
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'In processing':
        return (
          <span className="px-3.5 py-1 rounded-full bg-[#007AFF] text-white text-[11px] font-semibold tracking-tight shadow-xs">
            {language === 'ru' ? 'В обработке' : 'Өңделуде'}
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3.5 py-1 rounded-full bg-[#34C759] text-white text-[11px] font-semibold tracking-tight shadow-xs">
            {language === 'ru' ? 'Завершен' : 'Орындалды'}
          </span>
        );
      case 'Return':
        return (
          <span className="px-3.5 py-1 rounded-full bg-[#C7C7CC] text-white text-[11px] font-semibold tracking-tight">
            {language === 'ru' ? 'Возврат' : 'Қайтарылды'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 pt-0 select-none pb-2">
      {/* Header bar matching exact screenshot 1 */}
      <div className="flex items-center justify-between px-1 py-1 relative">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors"
          title={language === 'ru' ? 'Назад' : 'Артқа'}
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
          {language === 'ru' ? 'Заказы' : 'Тапсырыстар'}
        </h2>

        {/* Filter Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-800 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-700" strokeWidth={2} />
            <span>{getFilterLabel(filter)}</span>
          </button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-30 min-w-[130px] animate-in fade-in zoom-in-95 duration-100">
              {(['All', 'In processing', 'Completed', 'Return'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    filter === f ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{getFilterLabel(f)}</span>
                  {filter === f && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-[22px] p-4 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-3"
          >
            {/* Top Row: Order Title & Status Badge */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[14.5px] font-bold text-slate-900 tracking-tight">
                  {order.orderNumber}
                </h3>
                <p className="text-[11.5px] text-slate-400 font-normal mt-0.5">
                  {order.createdDate}
                </p>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* Bottom Row: Delivery Date, Items Count & Shipping Method */}
            <div className="space-y-0.5 text-[11.5px] text-slate-400">
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-normal text-slate-700">
                    {language === 'ru' ? 'Дата доставки' : 'Жеткізу күні'}
                  </span>{' '}
                  <span className="text-slate-400">{order.deliveryDate}</span>
                </p>
                <span className="text-slate-400 font-medium">
                  {order.itemsCount} {language === 'ru' ? 'товара' : 'тауар'}
                </span>
              </div>
              <p>
                <span className="font-normal text-slate-700">
                  {language === 'ru' ? 'Способ доставки' : 'Жеткізу тәсілі'}
                </span>{' '}
                <span className="text-slate-400">{order.shippingMethod}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
