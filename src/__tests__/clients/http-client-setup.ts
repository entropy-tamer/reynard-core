/**
 * @file Test setup for clients
 */

/**
 * Test setup for HTTP Client tests
 * Provides mocks and test utilities for HTTP client functionality
 */

import { vi } from "vitest";
import { HTTPClient, HTTPClientConfig, HTTPRequestOptions, HTTPResponse } from "../../clients/http-client";

// Mock fetch implementation
export const mockFetch = vi.fn(() => Promise.resolve(new global.Response("{}", { status: 200 }))) as any;

// Ensure global fetch is set
global.fetch = mockFetch;

// Mock Response class
global.Response = vi.fn().mockImplementation((body, init) => ({
  ok: init?.status ? init.status >= 200 && init.status < 300 : true,
  status: init?.status || 200,
  statusText: init?.statusText || "OK",
  headers: new Map(Object.entries(init?.headers || {})),
  json: vi.fn().mockResolvedValue(typeof body === "string" ? JSON.parse(body) : body),
  text: vi.fn().mockResolvedValue(typeof body === "string" ? body : JSON.stringify(body)),
  blob: vi.fn().mockResolvedValue(new Blob([body])),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  formData: vi.fn().mockResolvedValue(new FormData()),
  clone: vi.fn().mockReturnThis(),
  body: null,
  bodyUsed: false,
  url: "",
  redirected: false,
  type: "basic" as ResponseType,
})) as any;

// Mock Headers class
global.Headers = vi.fn().mockImplementation(init => {
  const headers = new Map();
  if (init) {
    if (Array.isArray(init)) {
      init.forEach(([key, value]) => headers.set(key, value));
    } else if (typeof init === "object") {
      Object.entries(init).forEach(([key, value]) => headers.set(key, value));
    }
  }
  return {
    get: vi.fn(name => headers.get(name)),
    set: vi.fn((name, value) => headers.set(name, value)),
    has: vi.fn(name => headers.has(name)),
    delete: vi.fn(name => headers.delete(name)),
    forEach: vi.fn(callback => headers.forEach(callback)),
    entries: vi.fn(() => headers.entries()),
    keys: vi.fn(() => headers.keys()),
    values: vi.fn(() => headers.values()),
    [Symbol.iterator]: vi.fn(() => headers[Symbol.iterator]()),
  };
}) as any;

// Mock Request class
global.Request = vi.fn().mockImplementation((url, init) => ({
  url,
  method: init?.method || "GET",
  headers: new global.Headers(init?.headers),
  body: init?.body,
  cache: init?.cache || "default",
  credentials: init?.credentials || "same-origin",
  destination: "",
  integrity: "",
  keepalive: false,
  mode: init?.mode || "cors",
  redirect: init?.redirect || "follow",
  referrer: "",
  referrerPolicy: "",
  signal: init?.signal,
  clone: vi.fn().mockReturnThis(),
})) as any;

// Helper function to create mock responses
export const createMockResponse = <T = any>(
  data: T,
  status: number = 200,
  statusText: string = "OK",
  headers: Record<string, string> = {}
): Response => {
  return new global.Response(JSON.stringify(data), {
    status,
    statusText,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  }) as Response;
};

// Helper function to create mock error responses
export const createMockErrorResponse = (
  status: number,
  statusText: string = "Error",
  message: string = "Request failed"
): Response => {
  return new global.Response(JSON.stringify({ error: message }), {
    status,
    statusText,
    headers: {
      "Content-Type": "application/json",
    },
  }) as Response;
};

// Helper function to setup successful fetch mock
export const setupSuccessfulFetch = <T = any>(data: T, status: number = 200) => {
  mockFetch.mockResolvedValueOnce(createMockResponse(data, status));
};

// Helper function to setup error fetch mock
export const setupErrorFetch = (status: number, statusText: string = "Error") => {
  mockFetch.mockResolvedValueOnce(createMockErrorResponse(status, statusText));
};

// Helper function to setup network error mock
export const setupNetworkErrorFetch = (error: Error = new Error("Network error")) => {
  mockFetch.mockRejectedValueOnce(error);
};

// Helper function to setup timeout mock
export const setupTimeoutFetch = (timeout: number = 1000) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeout);
  });
};

// Re-export types for convenience
export type { HTTPClient, HTTPClientConfig, HTTPRequestOptions, HTTPResponse };
