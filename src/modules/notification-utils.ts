/**
 * @file Utility functions for modules
 */

/**
 * Notification utilities and constants
 * Extracted from notifications module for better modularity
 */

export interface Notification {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
  group?: string;
  icon?: "spinner" | "success" | "error" | "info" | "warning";
  progress?: number;
  timestamp: number;
  duration?: number; // Auto-dismiss duration in ms
}

// Auto-dismiss durations by type (in ms)
export const DEFAULT_DURATIONS = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 0, // Don't auto-dismiss errors
} as const;

export const generateNotificationId = (): string =>
  `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const createNotificationObject = (
  message: string,
  type: "error" | "success" | "info" | "warning" = "info",
  options: {
    group?: string;
    icon?: "spinner" | "success" | "error" | "info" | "warning";
    progress?: number;
    duration?: number;
  } = {}
): Notification => {
  const id = generateNotificationId();
  const { group, icon, progress, duration } = options;

  return {
    id,
    message,
    type,
    group,
    icon: icon ?? type,
    progress: typeof progress === "number" ? Math.min(100, Math.max(0, progress)) : undefined,
    timestamp: Date.now(),
    duration: duration ?? DEFAULT_DURATIONS[type],
  };
};

export const createFullNotification = (notification: Omit<Notification, "id" | "timestamp">): Notification => {
  const id = generateNotificationId();
  return {
    ...notification,
    id,
    timestamp: Date.now(),
    duration: notification.duration ?? DEFAULT_DURATIONS[notification.type],
  };
};
