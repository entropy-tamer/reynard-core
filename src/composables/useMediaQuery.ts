/**
 * @file useMediaQuery implementation
 */

/**
 * Media Query composable - reactive media query matching
 * Provides reactive boolean state for CSS media queries
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

/**
 * Hook for reactive media query matching
 * @param query
 * @example
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = createSignal(false);

  createEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    onCleanup(() => {
      mediaQuery.removeEventListener("change", handleChange);
    });
  });

  return matches;
};

/**
 * Common breakpoint hooks
 * @example
 */
export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useIsTablet = () => useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1025px)");
export const useIsLargeScreen = () => useMediaQuery("(min-width: 1440px)");

/**
 * Preference-based hooks
 * @example
 */
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const usePrefersDarkMode = () => useMediaQuery("(prefers-color-scheme: dark)");
export const usePrefersHighContrast = () => useMediaQuery("(prefers-contrast: high)");
