/**
 * @file useThrottle implementation
 */

/**
 * Throttle composable - throttled reactive values and callbacks
 * Limits the rate at which a function can be called
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { throttle } from "reynard-algorithms";

/**
 * Throttles a reactive value
 * @param value
 * @param delay
 * @example
 */
export const useThrottle = <T>(value: () => T, delay: number) => {
  const [throttledValue, setThrottledValue] = createSignal<T>(value());
  let isThrottled = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingValue: T | null = null;

  createEffect(() => {
    const currentValue = value();

    if (!isThrottled) {
      // First call or after throttle period - update immediately
      setThrottledValue(() => currentValue);
      isThrottled = true;
      pendingValue = null;

      // Set timeout to reset throttle flag
      timeoutId = setTimeout(() => {
        isThrottled = false;
        if (pendingValue !== null) {
          setThrottledValue(() => pendingValue!);
          pendingValue = null;
        }
      }, delay);
    } else {
      // During throttle period - store the latest value
      pendingValue = currentValue;
    }
  });

  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  return throttledValue;
};

/**
 * Throttles a function call
 * @param callback
 * @param delay
 * @example
 */
export const useThrottledCallback = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
): ((...args: TArgs) => void) & { cancel: () => void; flush: () => void } => {
  const throttledFn = throttle(callback, delay);

  onCleanup(() => {
    throttledFn.cancel();
  });

  return throttledFn;
};
