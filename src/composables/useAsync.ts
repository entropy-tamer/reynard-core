/**
 * @file useAsync implementation
 */

/**
 * Async composable - manages async operations with reactive state
 * Provides loading, error, and data states for async operations
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface UseAsyncOptions<T> {
  /** Initial data value */
  initialData?: T;
  /** Whether to execute immediately */
  immediate?: boolean;
  /** Retry configuration */
  retry?: {
    count: number;
    delay: number;
  };
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseAsyncReturn<T> {
  /** Current data */
  data: () => T | undefined;
  /** Loading state */
  isLoading: () => boolean;
  /** Error state */
  error: () => Error | null;
  /** Whether the operation is successful */
  isSuccess: () => boolean;
  /** Whether the operation failed */
  isError: () => boolean;
  /** Execute the async operation */
  execute: (...args: any[]) => Promise<T>;
  /** Reset the state */
  reset: () => void;
  /** Retry the last operation */
  retry: () => Promise<T>;
}

/**
 * Hook for managing async operations
 * @param asyncFn
 * @param options
 * @example
 */
export const useAsync = <T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> => {
  const { initialData, immediate = false, retry = { count: 0, delay: 1000 }, onSuccess, onError } = options;

  const [data, setData] = createSignal<T | undefined>(initialData);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);

  let lastArgs: any[] = [];
  let retryCount = 0;

  const execute = async (...args: any[]): Promise<T> => {
    lastArgs = args;
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn(...args);
      setData(() => result);
      setIsLoading(false);
      onSuccess?.(result);
      retryCount = 0;
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      onError?.(error);
      throw error;
    }
  };

  const retryOperation = async (): Promise<T> => {
    if (retryCount < retry.count) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, retry.delay));
      return execute(...lastArgs);
    }
    throw new Error("Max retry attempts reached");
  };

  const reset = () => {
    setData(() => initialData);
    setIsLoading(false);
    setError(null);
    retryCount = 0;
  };

  const isSuccess = () => !isLoading() && !error() && data() !== undefined;
  const isError = () => !isLoading() && error() !== null;

  // Execute immediately if requested
  createEffect(() => {
    if (immediate) {
      execute();
    }
  });

  return {
    data,
    isLoading,
    error,
    isSuccess,
    isError,
    execute,
    reset,
    retry: retryOperation,
  };
};
