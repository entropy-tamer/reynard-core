/**
 * Notifications module - handles notification system
 * Extracted from yipyap's proven notification system
 * Refactored for modularity and maintainability
 */

import { createSignal } from "solid-js";
import { createNotificationManager } from "./notification-manager";
import { Notification, createFullNotification, createNotificationObject } from "./notification-utils";

// Re-export the Notification type for external use
export type { Notification } from "./notification-utils";

export interface NotificationsModule {
  readonly notifications: Notification[];
  notify: (
    message: string,
    type?: "error" | "success" | "info" | "warning",
    options?: {
      group?: string;
      icon?: "spinner" | "success" | "error" | "info" | "warning";
      progress?: number;
      duration?: number;
    }
  ) => string;
  createNotification: (notification: Omit<Notification, "id" | "timestamp">) => string;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: (group?: string) => void;
}

export const createNotificationsModule = (): NotificationsModule => {
  console.log("createNotificationsModule: Creating notifications module");
  const [notifications, setNotifications] = createSignal<Notification[]>([]);

  const manager = createNotificationManager(notifications, setNotifications);

  const notify = (
    message: string,
    type: "error" | "success" | "info" | "warning" = "info",
    options: {
      group?: string;
      icon?: "spinner" | "success" | "error" | "info" | "warning";
      progress?: number;
      duration?: number;
    } = {}
  ): string => {
    console.log("notify: Called with", message, type, options);
    console.log("notify: Using internal state");

    const notification = createNotificationObject(message, type, options);
    manager.addNotification(notification);

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        manager.removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  };

  const createNotification = (notification: Omit<Notification, "id" | "timestamp">): string => {
    const fullNotification = createFullNotification(notification);
    manager.addNotification(fullNotification);

    // Auto-dismiss if duration is set
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        manager.removeNotification(fullNotification.id);
      }, fullNotification.duration);
    }

    return fullNotification.id;
  };

  return {
    get notifications() {
      return notifications();
    },
    notify,
    createNotification,
    updateNotification: manager.updateNotification,
    removeNotification: manager.removeNotification,
    clearNotifications: manager.clearNotifications,
  };
};
