/**
 * @file useDebounce implementation
 */

/**
 * Debounce composable - debounced reactive values
 * Delays updates to a value until after a specified delay
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

/**
 * Debounces a reactive value
 * @param value
 * @param delay
 * @example
 */
export const useDebounce = <T>(value: () => T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = createSignal<T>(value());
  let timeoutId: ReturnType<typeof setTimeout>;

  createEffect(() => {
    const currentValue = value();

    // Clear existing timeout
    clearTimeout(timeoutId);

    // Set new timeout
    timeoutId = setTimeout(() => {
      setDebouncedValue(() => currentValue);
    }, delay);
  });

  onCleanup(() => {
    clearTimeout(timeoutId);
  });

  return debouncedValue;
};

/**
 * Debounces a function call
 * @param callback
 * @param delay
 * @example
 */
export const useDebouncedCallback = <TArgs extends unknown[]>(callback: (...args: TArgs) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: TArgs) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};
