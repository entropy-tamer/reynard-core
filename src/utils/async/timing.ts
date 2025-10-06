/**
 * Timing Utilities
 * Basic timing and delay functions
 */

import { t } from "../optional-i18n";

/**
 * Creates a promise that resolves after a specified delay
 *
 * @param ms - The delay in milliseconds
 * @returns Promise that resolves after the delay
 *
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a promise that resolves after a delay with a value
 *
 * @param value - The value to resolve with
 * @param ms - The delay in milliseconds
 * @returns Promise that resolves with the value after the delay
 */
export function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

/**
 * Timeout wrapper for promises
 *
 * @param promise - The promise to wrap
 * @param ms - Timeout in milliseconds
 * @param errorMessage - Custom error message for timeout
 * @returns Promise that rejects if timeout is reached
 *
 * @example
 * const result = await withTimeout(fetch('/api/data'), 5000);
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = t("core.async.operation-timed-out")
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Waits for the next event loop tick
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Waits for the next animation frame (browser only)
 */
export function nextFrame(): Promise<number> {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => resolve(Date.now()));
    } else {
      setTimeout(() => resolve(Date.now()), 16); // ~60fps fallback
    }
  });
}
