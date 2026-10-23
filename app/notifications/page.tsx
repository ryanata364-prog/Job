'use client';
import { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { mockNotifications } from '@/lib/mockData';
import { Notification } from '@/lib/types';
import Navbar from '@/components/layout/Navbar';

const typeIcons: Record<Notification['type'], string> = {
  application: '📄',
  interview: '📅',
  job: '💼',
  system: '🔔',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="px-4 py-2 text-sm text-brand font-medium hover:bg-brand/5 rounded-lg transition-colors">
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You have no notifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                    n.read
                      ? 'border-gray-200'
                      : 'border-blue-200 bg-blue-50/30'
                  }`}
                  onClick={() => toggleRead(n.id)}>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">{typeIcons[n.type]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {n.title}
                        </h3>
                        {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{n.message}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                        {n.type === 'application' && (
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        )}
                        {n.type !== 'system' && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <a href="/applications" className="text-brand hover:underline flex items-center gap-1">
                              View details <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    {!n.read && (
                      <button onClick={e => { e.stopPropagation(); toggleRead(n.id); }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
