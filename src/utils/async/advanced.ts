/**
 * @file advanced implementation
 */

/**
 * Advanced Async Utilities
 * Complex async operations like polling, memoization, and cancelable promises
 */

import { sleep } from "./timing";
import { t } from "../optional-i18n";

/**
 * Polls a condition until it becomes true or timeout is reached
 *
 * @param condition - Function that returns a promise or boolean
 * @param interval - Polling interval in milliseconds
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise that resolves when condition is true
 * @example
 */
export async function poll(
  condition: () => Promise<boolean> | boolean,
  interval: number = 1000,
  timeout: number = 30000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }

  throw new Error(t("core.async.polling-timeout-reached"));
}

/**
 * Creates a memoized version of an async function
 *
 * @param fn - Async function to memoize
 * @param keyGenerator - Function to generate cache key from arguments
 * @returns Memoized function
 * @example
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, Promise<ReturnType<T>>>();

  return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = fn(...args);
    cache.set(key, promise);

    // Clean up cache on error
    promise.catch(() => cache.delete(key));

    return promise;
  }) as T;
}

/**
 * Creates a cancelable promise
 */
export interface CancelablePromise<T> extends Promise<T> {
  cancel: () => void;
  isCanceled: () => boolean;
}

/**
 *
 * @param promise
 * @example
 */
export function makeCancelable<T>(promise: Promise<T>): CancelablePromise<T> {
  let isCanceled = false;
  let isResolved = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then(value => {
        if (!isCanceled && !isResolved) {
          isResolved = true;
          resolve(value);
        }
      })
      .catch(error => {
        if (!isCanceled && !isResolved) {
          isResolved = true;
          reject(error);
        }
      });
  }) as CancelablePromise<T>;

  wrappedPromise.cancel = () => {
    if (!isResolved) {
      isCanceled = true;
    }
  };

  wrappedPromise.isCanceled = () => isCanceled;

  return wrappedPromise;
}
