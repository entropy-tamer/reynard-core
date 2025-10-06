/**
 * Click Outside composable - detects clicks outside a target element
 * Useful for closing dropdowns, modals, and other overlay components
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface UseClickOutsideOptions {
  /** Whether the click outside detection is enabled */
  enabled?: boolean;
  /** Callback when click outside is detected */
  onOutsideClick?: () => void;
}

/**
 * Hook for detecting clicks outside a target element
 */
export const useClickOutside = <T extends HTMLElement>(options: UseClickOutsideOptions = {}) => {
  const [isOutside, setIsOutside] = createSignal(false);
  const [targetRef, setTargetRef] = createSignal<T | null>(null);

  const { enabled = true, onOutsideClick } = options;

  createEffect(() => {
    if (!enabled) return;

    const target = targetRef();
    if (!target) return;

    const handleClick = (event: MouseEvent) => {
      const clickedElement = event.target as Node;

      if (target && !target.contains(clickedElement)) {
        setIsOutside(true);
        onOutsideClick?.();
      } else {
        setIsOutside(false);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touchedElement = event.target as Node;

      if (target && !target.contains(touchedElement)) {
        setIsOutside(true);
        onOutsideClick?.();
      } else {
        setIsOutside(false);
      }
    };

    // Add event listeners
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleTouchStart);

    onCleanup(() => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleTouchStart);
    });
  });

  return {
    isOutside,
    setTargetRef,
    targetRef,
  };
};
