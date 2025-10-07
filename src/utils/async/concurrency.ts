/**
 * @file concurrency implementation
 */

/**
 * Concurrency Utilities
 * Functions for managing concurrent operations
 */

import { t } from "../optional-i18n";

/**
 * Executes promises in batches with a maximum concurrency
 *
 * @param promises - Array of promise-returning functions
 * @param batchSize - Maximum number of concurrent promises
 * @returns Promise that resolves when all batches complete
 *
 * @example
 * const urls = ['url1', 'url2', 'url3', 'url4'];
 * const fetchFunctions = urls.map(url => () => fetch(url));
 * const results = await batchExecute(fetchFunctions, 2);
 */
export async function batchExecute<T>(promises: Array<() => Promise<T>>, batchSize: number = 5): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Maps over an array with limited concurrency
 *
 * @param items - Array of items to process
 * @param mapper - Async function to apply to each item
 * @param concurrency - Maximum number of concurrent operations
 * @returns Promise that resolves with mapped results
 * @example
 */
export async function mapWithConcurrency<T, U>(
  items: T[],
  mapper: (item: T, index: number) => Promise<U>,
  concurrency: number = 5
): Promise<U[]> {
  // Handle edge cases
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  if (concurrency <= 0) {
    throw new Error(t("core.async.concurrency-must-be-greater-than-0"));
  }

  const results: U[] = new Array(items.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const index = i; // Capture the index for this iteration
    const promise = mapper(items[i], index)
      .then(result => {
        results[index] = result;
      })
      .catch(error => {
        // Store error in results array to maintain order
        results[index] = error as U;
      });

    executing.push(promise);

    if (executing.length >= concurrency) {
      // Wait for at least one promise to complete
      await Promise.race(executing);
      // Remove completed promises by creating a new array with only pending ones
      const pendingPromises: Promise<void>[] = [];

      for (const promise of executing) {
        // Use Promise.race to check if promise is still pending
        try {
          await Promise.race([promise, new Promise(resolve => setTimeout(() => resolve("timeout"), 0))]);
        } catch {
          // Promise was rejected, it's completed
        }

        // If we get here, the promise is still pending
        pendingPromises.push(promise);
      }

      executing.length = 0;
      executing.push(...pendingPromises);
    }
  }

  await Promise.all(executing);
  return results;
}
