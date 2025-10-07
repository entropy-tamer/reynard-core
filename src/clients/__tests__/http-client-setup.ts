/**
 * @file Test setup for __tests__
 */

/**
 * Shared test setup for HTTP client tests
 */

import { vi } from "vitest";
// Type definitions for the mock
interface HTTPClientConfig {
  baseURL?: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface RequestOptions {
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

interface UploadOptions {
  url: string;
  formData: FormData;
  headers?: Record<string, string>;
  timeout?: number;
}

// Mock fetch
export const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create a mock HTTPClient class
/**
 *
 */
class MockHTTPClient {
  public config: any;
  public baseHeaders: any;
  public request: any;
  public upload: any;
  public getConfig: any;
  public updateConfig: any;

  /**
   *
   * @param config
   * @example
   */
  constructor(config: any) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 3,
      apiKey: config.apiKey ?? "",
      headers: config.headers ?? {},
      authToken: config.authToken ?? "",
      enableRetry: config.enableRetry ?? true,
      enableCircuitBreaker: config.enableCircuitBreaker ?? true,
      enableMetrics: config.enableMetrics ?? true,
    };

    this.baseHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(config.headers || {}),
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    };

    this.request = vi.fn().mockImplementation(async options => {
      const url = `${this.config.baseUrl}${options.endpoint}`;
      const headers = { ...this.baseHeaders, ...options.headers };

      // Don't include body for GET requests
      const body = options.method === "GET" ? undefined : options.data ? JSON.stringify(options.data) : undefined;

      const response = await mockFetch(url, {
        method: options.method,
        headers,
        body,
      });

      const responseData = await response.json();

      // Throw error for 4xx and 5xx status codes
      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: {},
        config: options,
      };
    });

    this.upload = vi.fn().mockImplementation(async options => {
      const url = `${this.config.baseUrl}${options.endpoint}`;
      const headers = { ...this.baseHeaders, ...options.headers };

      const response = await mockFetch(url, {
        method: "POST",
        headers,
        body: options.formData,
      });

      const responseData = await response.json();

      // Throw error for 4xx and 5xx status codes
      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: {},
        config: options,
      };
    });

    this.getConfig = vi.fn(() => ({ ...this.config }));
    this.updateConfig = vi.fn(updates => {
      Object.assign(this.config, updates);
      if (updates.apiKey) {
        this.baseHeaders.Authorization = `Bearer ${updates.apiKey}`;
      }
      if (updates.headers) {
        Object.assign(this.baseHeaders, updates.headers);
      }
    });
  }
}

// Export the mock as HTTPClient
export const HTTPClient = MockHTTPClient;
