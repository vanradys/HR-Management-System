import { Bell, CheckCheck, Clock, FileText, Timer, Calendar, Receipt, MessageCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatTimeAgo } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/types';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string }> = {
  leave_approval: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  overtime_approval: { icon: Timer, color: 'text-orange-600', bg: 'bg-orange-50' },
  attendance_reminder: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  shift_update: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
  reimbursement_update: { icon: Receipt, color: 'text-green-600', bg: 'bg-green-50' },
  report_comment: { icon: MessageCircle, color: 'text-pink-600', bg: 'bg-pink-50' },
};

export default function Notifikasi() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifikasi</h2>
          {unreadCount > 0 ? (
            <p className="text-sm font-medium" style={{ color: '#E30613' }}>{unreadCount} belum dibaca</p>
          ) : (
            <p className="text-sm text-gray-500">Semua notifikasi sudah dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
            data-testid="button-tandai-semua"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notif => {
              const config = TYPE_CONFIG[notif.type] || { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' };
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={cn(
                    'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50',
                    !notif.isRead && 'bg-blue-50/40'
                  )}
                  data-testid={`notif-${notif.id}`}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
                    <Icon className={cn('w-5 h-5', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-semibold text-gray-900', !notif.isRead && 'font-bold')}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#E30613' }} />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notif.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
