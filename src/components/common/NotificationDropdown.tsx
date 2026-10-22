import React from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { NavModule } from './Sidebar';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  time: string;
  targetModule?: NavModule;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onSelectNotification: (target?: NavModule) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onDismiss,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 sm:p-6 sm:pt-20">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in z-10">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 text-sm">Disaster Command Alerts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>All active alert queues normal</span>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectNotification(item.targetModule);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer group flex items-start space-x-3"
              >
                <div className="shrink-0 mt-0.5">
                  {item.type === 'danger' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                  {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {item.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                  {item.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
