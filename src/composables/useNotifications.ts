/**
 * @file useNotifications implementation
 */

/**
 * Notifications composable - SolidJS composable for notification management
 * Provides reactive notification state and utilities
 */

import { createContext, useContext } from "solid-js";
import { createNotificationsModule, type NotificationsModule, type Notification } from "../modules/notifications";

const NotificationsContext = createContext<NotificationsModule>();

export const NotificationsProvider = NotificationsContext.Provider;

/**
 * Hook for accessing notification state and utilities
 * Must be used within a NotificationsProvider
 * @example
 */
export const useNotifications = (): NotificationsModule => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

/**
 * Create a notifications module instance
 * Use this to create a provider value
 */
export const createNotifications = createNotificationsModule;

/**
 * Hook for notification utilities only
 * Useful for components that only need to send notifications
 * @example
 */
export const useNotify = () => {
  const { notify, createNotification, removeNotification, clearNotifications } = useNotifications();
  return { notify, createNotification, removeNotification, clearNotifications };
};

/**
 * Hook for notification values only
 * Useful for components that only need to display notifications
 * @example
 */
export const useNotificationValues = (): Notification[] => {
  const { notifications } = useNotifications();
  return notifications;
};
