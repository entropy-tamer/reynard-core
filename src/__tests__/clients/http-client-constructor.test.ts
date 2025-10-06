/**
 * Tests for HTTPClient constructor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HTTPClient, HTTPClientConfig, mockFetch } from "../http-client-setup";

describe("HTTPClient Constructor", () => {
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

  it("should create HttpClient with default config", () => {
    const defaultConfig: HTTPClientConfig = {
      baseUrl: "https://api.example.com",
    };

    const client = new HTTPClient(defaultConfig);

    expect((client as any).config).toEqual({
      baseUrl: "https://api.example.com",
      timeout: 30000,
      retries: 3,
      apiKey: "",
      headers: {},
      authToken: "",
      enableRetry: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
    });
  });

  it("should create HttpClient with custom config", () => {
    expect((httpClient as any).config).toEqual({
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

  it("should set up base headers with API key", () => {
    const baseHeaders = (httpClient as any).baseHeaders;

    expect(baseHeaders).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-Custom": "value",
      Authorization: "Bearer test-key",
    });
  });

  it("should set up base headers without API key", () => {
    const configWithoutKey: HTTPClientConfig = {
      baseUrl: "https://api.example.com",
      headers: { "X-Custom": "value" },
    };

    const client = new HTTPClient(configWithoutKey);
    const baseHeaders = (client as any).baseHeaders;

    expect(baseHeaders).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-Custom": "value",
    });
  });
});
