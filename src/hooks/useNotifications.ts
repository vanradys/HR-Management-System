import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { AppNotification, NotificationType } from '../types/types';
import { generateId, getCurrentDatetime } from '../utils/helpers';
import { SEED_NOTIFICATIONS } from '../data/seedData';

const NOTIF_KEY = 'hrptaa_notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(NOTIF_KEY, SEED_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, [setNotifications]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, [setNotifications]);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) => {
    const newNotif: AppNotification = {
      id: generateId(),
      type,
      title,
      message,
      timestamp: getCurrentDatetime(),
      isRead: false,
      link,
    };

    setNotifications(prev => [newNotif, ...prev]);
  }, [setNotifications]);

  return { notifications, unreadCount, markRead, markAllRead, addNotification };
}
