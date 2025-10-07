/**
 * @file retry implementation
 */

/**
 * Retry Utilities
 * Functions for retrying operations with backoff strategies
 */

import { sleep } from "./timing";

/**
 * Retry a promise-returning function with exponential backoff
 *
 * @param fn - Function that returns a promise
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds (doubles with each retry)
 * @returns Promise that resolves/rejects after all retries
 *
 * @example
 * const result = await retry(() => fetch('/api/data'), 3);
 */
export async function retry<T>(fn: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 1000): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: baseDelay * 2^attempt
      const delayMs = baseDelay * Math.pow(2, attempt);
      await sleep(delayMs);
    }
  }

  throw lastError!;
}
