/**
 * Notification factory functions for different notification types
 * Provides convenient methods for creating common notification patterns
 */

import { Notification, createNotificationObject } from "./notification-utils";

export interface NotificationFactories {
  success: (message: string, options?: NotificationOptions) => Notification;
  error: (message: string, options?: NotificationOptions) => Notification;
  info: (message: string, options?: NotificationOptions) => Notification;
  warning: (message: string, options?: NotificationOptions) => Notification;
  progress: (message: string, progress: number, options?: NotificationOptions) => Notification;
  spinner: (message: string, options?: NotificationOptions) => Notification;
}

export interface NotificationOptions {
  group?: string;
  duration?: number;
}

export const createNotificationFactories = (): NotificationFactories => {
  const success = (message: string, options: NotificationOptions = {}) =>
    createNotificationObject(message, "success", {
      ...options,
      icon: "success",
    });

  const error = (message: string, options: NotificationOptions = {}) =>
    createNotificationObject(message, "error", {
      ...options,
      icon: "error",
    });

  const info = (message: string, options: NotificationOptions = {}) =>
    createNotificationObject(message, "info", {
      ...options,
      icon: "info",
    });

  const warning = (message: string, options: NotificationOptions = {}) =>
    createNotificationObject(message, "warning", {
      ...options,
      icon: "warning",
    });

  const progress = (message: string, progress: number, options: NotificationOptions = {}) =>
    createNotificationObject(message, "info", {
      ...options,
      icon: "spinner",
      progress,
    });

  const spinner = (message: string, options: NotificationOptions = {}) =>
    createNotificationObject(message, "info", {
      ...options,
      icon: "spinner",
    });

  return {
    success,
    error,
    info,
    warning,
    progress,
    spinner,
  };
};
