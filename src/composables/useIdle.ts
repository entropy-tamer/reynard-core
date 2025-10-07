/**
 * @file useIdle implementation
 */

/**
 * Idle composable - tracks user idle state
 * Detects when user is idle based on activity
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface UseIdleOptions {
  /** Idle timeout in milliseconds */
  timeout?: number;
  /** Whether to track idle state */
  enabled?: boolean;
  /** Events to track for activity */
  events?: string[];
  /** Callback when user becomes idle */
  onIdle?: () => void;
  /** Callback when user becomes active */
  onActive?: () => void;
}

/**
 * Hook for tracking user idle state
 * @param options
 * @example
 */
export const useIdle = (options: UseIdleOptions = {}) => {
  const {
    timeout = 30000, // 30 seconds default
    enabled = true,
    events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"],
    onIdle,
    onActive,
  } = options;

  const [isIdle, setIsIdle] = createSignal(false);
  const [idleTime, setIdleTime] = createSignal(0);

  let idleTimer: number | null = null;
  let lastActivityTime = Date.now();

  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }

    lastActivityTime = Date.now();
    setIdleTime(0);

    if (isIdle()) {
      setIsIdle(false);
      onActive?.();
    }

    idleTimer = window.setTimeout(() => {
      setIsIdle(true);
      onIdle?.();
    }, timeout);
  };

  const updateIdleTime = () => {
    if (isIdle()) {
      setIdleTime(Date.now() - lastActivityTime);
    }
  };

  createEffect(() => {
    if (!enabled) return;

    // Set up activity event listeners
    const handleActivity = () => {
      resetIdleTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the idle timer
    resetIdleTimer();

    // Update idle time periodically
    const intervalId = setInterval(updateIdleTime, 1000);

    onCleanup(() => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      clearInterval(intervalId);
    });
  });

  return {
    isIdle,
    idleTime,
    reset: resetIdleTimer,
  };
};
