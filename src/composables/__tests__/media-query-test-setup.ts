/**
 * Shared test setup for media query composables
 */

import { vi } from "vitest";

export interface MockMediaQuery {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

export interface MockMatchMedia {
  mockReturnValue: (mockMediaQuery: MockMediaQuery) => void;
  mockImplementation: (fn: () => any) => void;
  mockClear: () => void;
}

/**
 * Creates a mock media query object
 */
export const createMockMediaQuery = (matches = false): MockMediaQuery => ({
  matches,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

/**
 * Sets up window.matchMedia mock
 */
export const setupMatchMediaMock = (): MockMatchMedia => {
  const mockMatchMedia = vi.fn();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: mockMatchMedia,
  });

  return mockMatchMedia;
};

/**
 * Cleans up window.matchMedia mock
 */
export const cleanupMatchMediaMock = (): void => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: undefined,
  });
};

/**
 * Mocks SSR environment by removing window
 */
export const mockSSR = (): (() => void) => {
  const originalWindow = global.window;
  delete (global as any).window;

  return () => {
    global.window = originalWindow;
  };
};
