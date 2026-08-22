'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotificationStore } from './store';
import { AppNotification, NotificationPriority } from './types';
import {
  Bell,
  BellRing,
  X,
  CheckCheck,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Info,
  ChevronRight,
  Clock,
} from 'lucide-react';

const PRIORITY_CONFIG: Record<NotificationPriority, { color: string; bgColor: string; borderColor: string; Icon: any }> = {
  critical: { color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', Icon: ShieldAlert },
  high: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', Icon: AlertTriangle },
  medium: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', Icon: Info },
  low: { color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', Icon: Info },
};

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationCenter() {
  const {
    notifications,
    isOpen,
    toggleOpen,
    setOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="relative p-2 rounded-lg hover:bg-slate-800/60 transition text-slate-400 hover:text-white"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4.5 h-4.5 text-indigo-400" />
        ) : (
          <Bell className="w-4.5 h-4.5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-indigo-600/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-slate-500">
                No notifications
              </div>
            )}
            {notifications.map((notif) => {
              const cfg = PRIORITY_CONFIG[notif.priority];
              const Icon = cfg.Icon;
              return (
                <div
                  key={notif.id}
                  className={`px-4 py-3 hover:bg-slate-800/30 transition flex gap-3 ${
                    !notif.isRead ? 'bg-indigo-500/5' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bgColor} border ${cfg.borderColor}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {formatTimeAgo(notif.createdAt)}
                      </span>
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => setOpen(false)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                        >
                          View <ChevronRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif.id);
                    }}
                    className="text-slate-600 hover:text-red-400 transition shrink-0 self-start mt-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-800 flex justify-center">
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] text-slate-500 hover:text-red-400 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
