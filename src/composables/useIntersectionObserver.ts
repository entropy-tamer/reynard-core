/**
 * @file useIntersectionObserver implementation
 */

/**
 * Intersection Observer composable - observes element visibility
 * Useful for lazy loading, infinite scrolling, and visibility-based animations
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface UseIntersectionObserverOptions {
  /** Root element for intersection calculations */
  root?: Element | null;
  /** Margin around the root element */
  rootMargin?: string;
  /** Threshold values for intersection callbacks */
  threshold?: number | number[];
  /** Whether the observer is enabled */
  enabled?: boolean;
  /** Callback when intersection changes */
  onIntersectionChange?: (entry: IntersectionObserverEntry) => void;
}

/**
 * Hook for observing element intersection with viewport
 * @param options
 * @example
 */
export const useIntersectionObserver = <T extends HTMLElement>(options: UseIntersectionObserverOptions = {}) => {
  const [isIntersecting, setIsIntersecting] = createSignal(false);
  const [intersectionRatio, setIntersectionRatio] = createSignal(0);
  const [targetRef, setTargetRef] = createSignal<T | null>(null);

  const { root = null, rootMargin = "0px", threshold = 0, enabled = true, onIntersectionChange } = options;

  createEffect(() => {
    if (!enabled) return;

    const target = targetRef();
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
          setIntersectionRatio(entry.intersectionRatio);
          onIntersectionChange?.(entry);
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(target);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  return {
    isIntersecting,
    intersectionRatio,
    setTargetRef,
    targetRef,
  };
};
