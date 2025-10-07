/**
 * @file Tests for __tests__
 */

/**
 * Media Query Test Setup Utilities
 */

import { vi } from "vitest";

/**
 *
 * @param matches
 * @example
 */
export function createMockMediaQuery(matches: boolean = true) {
  return {
    matches,
    media: "(min-width: 768px)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

/**
 *
 * @param matches
 * @example
 */
export function setupMatchMediaMock(matches: boolean = true) {
  const mockMatchMedia = vi.fn().mockImplementation((query: string) => {
    return createMockMediaQuery(matches);
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: mockMatchMedia,
  });

  return mockMatchMedia;
}

/**
 *
 * @example
 */
export function cleanupMatchMediaMock() {
  delete (window as any).matchMedia;
}
