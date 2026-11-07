import React from 'react';
import { X, Bell, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.notificationsTitle}</h3>
              <p className="text-xs text-slate-400">Store alerts & milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-3 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all ${
                item.unread
                  ? 'bg-blue-50/40 border-blue-100'
                  : 'bg-white border-slate-100 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {item.title}
                </p>
                {item.unread && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                )}
              </div>
              <div className="text-[10.5px] text-slate-400 mt-1">{item.time}</div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-between items-center">
          <button
            onClick={onMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" /> {t.markAllRead}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
