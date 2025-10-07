/**
 * @file Tests for clients
 */

/**
 * Tests for HTTPClient configuration management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HTTPClient, mockFetch } from "../../clients/__tests__/http-client-setup";
import { t } from "../../../utils/optional-i18n";

interface HTTPClientConfig {
  baseURL?: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

describe("HTTPClient Configuration Management", () => {
  let httpClient: HTTPClient;
  let config: HTTPClientConfig;

  beforeEach(() => {
    config = {
      baseUrl: "https://api.example.com",
      timeout: 30000,
      retries: 3,
      apiKey: "test-key",
      headers: { "X-Custom": "value" },
    };

    // Ensure global fetch is mocked
    global.fetch = mockFetch;

    httpClient = new HTTPClient(config);
    vi.clearAllMocks();

    // Setup default successful response
    mockFetch.mockResolvedValue(new global.Response("{}", { status: 200 }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get current configuration", () => {
    const currentConfig = (httpClient as any).getConfig();

    expect(currentConfig).toEqual({
      baseUrl: "https://api.example.com",
      timeout: 30000,
      retries: 3,
      apiKey: "test-key",
      headers: { "X-Custom": "value" },
      authToken: "",
      enableRetry: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
    });
  });

  it("should return a copy of configuration", () => {
    const config1 = (httpClient as any).getConfig();
    const config2 = (httpClient as any).getConfig();

    expect(config1).not.toBe(config2);
    expect(config1).toEqual(config2);
  });

  it("should update configuration", () => {
    const updates = {
      apiKey: "new-key",
      headers: { "X-New": "new-value" },
      retries: 2,
      timeout: 10000,
    };

    httpClient.updateConfig(updates);

    expect((httpClient as any).config).toEqual({
      baseUrl: "https://api.example.com",
      timeout: 10000,
      retries: 2,
      apiKey: "new-key",
      headers: { "X-New": "new-value" },
      authToken: "",
      enableRetry: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
    });
  });

  it("should update base headers when API key changes", () => {
    httpClient.updateConfig({ apiKey: "new-key" });

    expect((httpClient as any).baseHeaders).toEqual(
      expect.objectContaining({
        Authorization: "Bearer new-key",
      })
    );
  });

  it("should update base headers when headers change", () => {
    httpClient.updateConfig({ headers: { "X-Updated": "updated-value" } });

    expect((httpClient as any).baseHeaders).toEqual(
      expect.objectContaining({
        "X-Updated": "updated-value",
      })
    );
  });
});
