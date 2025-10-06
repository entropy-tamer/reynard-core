/**
 * Viewport Size composable - tracks viewport dimensions
 * Provides reactive viewport width and height
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface ViewportSize {
  width: number;
  height: number;
}

export interface UseViewportSizeOptions {
  /** Whether to track viewport size */
  enabled?: boolean;
  /** Debounce delay for resize events */
  debounceMs?: number;
  /** Callback when viewport size changes */
  onSizeChange?: (size: ViewportSize) => void;
}

/**
 * Hook for tracking viewport size
 */
export const useViewportSize = (options: UseViewportSizeOptions = {}) => {
  const { enabled = true, debounceMs = 100, onSizeChange } = options;

  const [size, setSize] = createSignal<ViewportSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  let resizeTimeout: number | null = null;

  createEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(() => {
        const newSize: ViewportSize = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        setSize(newSize);
        onSizeChange?.(newSize);
      }, debounceMs);
    };

    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    });
  });

  return {
    size,
    width: () => size().width,
    height: () => size().height,
  };
};
