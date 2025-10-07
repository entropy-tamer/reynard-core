/**
 * @file Tests for src
 */

/**
 * Test setup for core package
 * Simplified setup to avoid recursive issues
 */

import { vi } from "vitest";
import { setupMSW, teardownMSW } from "./__tests__/msw-setup";

// Setup MSW for comprehensive request interception
setupMSW();

// Mock fetch globally BEFORE any modules are imported
const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    clone: vi.fn().mockReturnThis(),
    url: "",
    redirected: false,
    type: "basic" as ResponseType,
    body: null,
    bodyUsed: false,
  } as Response)
) as any;

// Apply the mock immediately
global.fetch = mockFetch;

// Mock Node.js HTTP modules to prevent actual network requests
vi.mock("http", () => ({
  request: vi.fn(() => ({
    on: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    setTimeout: vi.fn(),
  })),
  get: vi.fn(() => ({
    on: vi.fn(),
    setTimeout: vi.fn(),
  })),
}));

vi.mock("https", () => ({
  request: vi.fn(() => ({
    on: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    setTimeout: vi.fn(),
  })),
  get: vi.fn(() => ({
    on: vi.fn(),
    setTimeout: vi.fn(),
  })),
}));

// Mock the optional i18n system - it should gracefully handle missing i18n
vi.mock("reynard-i18n", () => {
  // Simulate i18n not being available by throwing an error
  throw new Error("Module not found");
});
