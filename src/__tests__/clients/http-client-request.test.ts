/**
 * Tests for HTTPClient request methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HTTPClient, HTTPClientConfig, RequestOptions, mockFetch } from "../http-client-setup";
import { t } from "../../../utils/optional-i18n";

describe("HTTPClient Request Methods", () => {
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

  describe("GET requests", () => {
    it("should make successful GET request", async () => {
      const mockResponse = { data: "test" };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
        status: 200,
        statusText: "OK",
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
      };

      const result = await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Custom": "value",
            Authorization: "Bearer test-key",
          }),
        })
      );

      expect(result).toEqual({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: options,
      });
    });

    it("should not include body for GET request", async () => {
      const mockResponse = { data: "test" };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
        status: 200,
        statusText: "OK",
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
        data: { shouldNotBeIncluded: true },
      };

      await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.not.objectContaining({
          body: expect.any(String),
        })
      );
    });
  });

  describe("POST requests", () => {
    it("should make successful POST request with data", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
        status: 200,
        statusText: "OK",
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "POST",
        endpoint: "/test",
        data: { name: "test" },
      };

      const result = await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        })
      );

      expect(result).toEqual({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: options,
      });
    });
  });

  describe("Error handling", () => {
    it("should handle request timeout", async () => {
      mockFetch.mockRejectedValue(new Error("Request timeout"));

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
        timeout: 1000,
      };

      await expect(httpClient.request(options)).rejects.toThrow("Request timeout");
    });

    it("should handle HTTP error responses", async () => {
      const mockFetchResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: vi.fn().mockResolvedValue({ error: "Not found" }),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/nonexistent",
      };

      await expect(httpClient.request(options)).rejects.toThrow("HTTP 404: Not Found");
    });
  });
});
