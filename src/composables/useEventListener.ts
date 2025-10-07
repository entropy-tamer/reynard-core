/**
 * @file useEventListener implementation
 */

/**
 * Event Listener composable - manages event listeners with automatic cleanup
 * Provides reactive event handling with proper cleanup
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface UseEventListenerOptions {
  /** Whether the event listener is enabled */
  enabled?: boolean;
  /** Whether to use passive event listeners */
  passive?: boolean;
  /** Whether to use capture phase */
  capture?: boolean;
  /** Whether to use once (remove after first trigger) */
  once?: boolean;
}

/**
 * Hook for managing event listeners
 * @param eventName
 * @param handler
 * @param options
 * @example
 */
export const useEventListener = <K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options: UseEventListenerOptions = {}
) => {
  const [isListening, setIsListening] = createSignal(false);

  const { enabled = true, passive = false, capture = false, once = false } = options;

  createEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }

    const eventOptions: AddEventListenerOptions = {
      passive,
      capture,
      once,
    };

    const wrappedHandler = (event: WindowEventMap[K]) => {
      handler(event);
      if (once) {
        setIsListening(false);
      }
    };

    window.addEventListener(eventName, wrappedHandler, eventOptions);
    setIsListening(true);

    onCleanup(() => {
      window.removeEventListener(eventName, wrappedHandler, eventOptions);
      setIsListening(false);
    });
  });

  return {
    isListening,
  };
};

/**
 * Hook for managing event listeners on a specific element
 * @param element
 * @param eventName
 * @param handler
 * @param options
 * @example
 */
export const useElementEventListener = <T extends HTMLElement, K extends keyof HTMLElementEventMap>(
  element: () => T | null,
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options: UseEventListenerOptions = {}
) => {
  const [isListening, setIsListening] = createSignal(false);

  const { enabled = true, passive = false, capture = false, once = false } = options;

  createEffect(() => {
    const target = element();
    if (!target || !enabled) {
      setIsListening(false);
      return;
    }

    const eventOptions: AddEventListenerOptions = {
      passive,
      capture,
      once,
    };

    const wrappedHandler = (event: HTMLElementEventMap[K]) => {
      handler(event);
      if (once) {
        setIsListening(false);
      }
    };

    target.addEventListener(eventName, wrappedHandler, eventOptions);
    setIsListening(true);

    onCleanup(() => {
      target.removeEventListener(eventName, wrappedHandler, eventOptions);
      setIsListening(false);
    });
  });

  return {
    isListening,
  };
};
