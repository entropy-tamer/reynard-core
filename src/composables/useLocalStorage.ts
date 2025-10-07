/**
 * @file useLocalStorage implementation
 */

/**
 * LocalStorage composable - reactive localStorage with SolidJS
 * Provides persistent reactive state synchronized with localStorage
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { defaultSerializer, type Serializer } from "./localStorageSerializer";
import { createStorageEventHandler } from "./storageEventHandler";

export interface UseLocalStorageOptions<T> {
  /** Default value if key doesn't exist */
  defaultValue: T;
  /** Custom serializer */
  serializer?: Serializer<T>;
  /** Storage event listener */
  syncAcrossTabs?: boolean;
}

/**
 * Reactive localStorage hook
 * @param key
 * @param options
 * @example
 */
export const useLocalStorage = <T>(key: string, options: UseLocalStorageOptions<T>) => {
  const { defaultValue, serializer = defaultSerializer as Serializer<T>, syncAcrossTabs = true } = options;

  // Validate key input
  if (!key || typeof key !== "string" || key.trim() === "") {
    throw new Error("useLocalStorage key must be a non-empty string");
  }

  // Get initial value from localStorage
  const getInitialValue = (): T => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return serializer.read(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const [value, setValue] = createSignal<T>(getInitialValue());

  // Update localStorage when value changes
  createEffect(() => {
    const currentValue = value();
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, serializer.write(currentValue));
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  });

  // Setup cross-tab synchronization
  const storageHandler = syncAcrossTabs ? createStorageEventHandler(key, setValue, serializer) : { cleanup: () => {} };

  onCleanup(storageHandler.cleanup);

  const remove = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
    setValue(() => defaultValue);
  };

  return [value, setValue, remove, storageHandler.cleanup] as const;
};
