/**
 * @file notification-manager implementation
 */

/**
 * Notification state management logic
 * Handles adding, updating, and removing notifications
 */

import { Accessor, Setter } from "solid-js";
import { Notification } from "./notification-utils";

export interface NotificationManager {
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: (group?: string) => void;
}

export const createNotificationManager = (
  notifications: Accessor<Notification[]>,
  setNotifications: Setter<Notification[]>
): NotificationManager => {
  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      // If grouped, replace existing notification with same group
      if (notification.group) {
        const filtered = prev.filter(n => n.group !== notification.group);
        return [...filtered, notification];
      }
      return [...prev, notification];
    });
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications(prev =>
      prev.map(notification => (notification.id === id ? { ...notification, ...updates } : notification))
    );
  };

  const removeNotification = (id: string) => {
    // Use global notification container if available
    if (typeof window !== "undefined" && (window as any).__notificationContainer) {
      (window as any).__notificationContainer.removeNotification(id);
    } else {
      // Fallback to internal state if global container not available
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const clearNotifications = (group?: string) => {
    // Use global notification container if available
    if (typeof window !== "undefined" && (window as any).__notificationContainer) {
      if (group) {
        (window as any).__notificationContainer.removeNotificationByGroup(group);
      } else {
        (window as any).__notificationContainer.clearAllNotifications();
      }
    } else {
      // Fallback to internal state if global container not available
      if (group) {
        setNotifications(prev => prev.filter(n => n.group !== group));
      } else {
        setNotifications([]);
      }
    }
  };

  return {
    addNotification,
    updateNotification,
    removeNotification,
    clearNotifications,
  };
};
