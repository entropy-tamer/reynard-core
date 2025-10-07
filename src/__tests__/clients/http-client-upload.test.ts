/**
 * @file Tests for clients
 */

/**
 * Tests for HTTPClient upload methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HTTPClient, mockFetch } from "../../clients/__tests__/http-client-setup";

interface HTTPClientConfig {
  baseURL?: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface UploadOptions {
  url: string;
  formData: FormData;
  headers?: Record<string, string>;
  timeout?: number;
}

describe("HTTPClient Upload Methods", () => {
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

  it("should upload file successfully", async () => {
    const mockResponse = { uploaded: true };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
      status: 200,
      statusText: "OK",
    };

    mockFetch.mockResolvedValue(mockFetchResponse);

    const formData = new FormData();
    formData.append("file", new Blob(["test content"]), "test.txt");

    const options: UploadOptions = {
      endpoint: "/upload",
      formData,
    };

    const result = await httpClient.upload(options);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.objectContaining({
        method: "POST",
        body: formData,
        headers: expect.objectContaining({
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

  it("should upload file without API key", async () => {
    const clientWithoutKey = new HTTPClient({
      baseUrl: "https://api.example.com",
    });

    const mockResponse = { uploaded: true };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
      status: 200,
      statusText: "OK",
    };

    mockFetch.mockResolvedValue(mockFetchResponse);

    const formData = new FormData();
    formData.append("file", new Blob(["test content"]), "test.txt");

    const options: UploadOptions = {
      endpoint: "/upload",
      formData,
    };

    const result = await clientWithoutKey.upload(options);

    expect(result).toEqual({
      data: mockResponse,
      status: 200,
      statusText: "OK",
      headers: {},
      config: options,
    });
  });

  it("should handle upload failure", async () => {
    const mockFetchResponse = {
      ok: false,
      status: 413,
      statusText: "Payload Too Large",
      json: vi.fn().mockResolvedValue({ error: "File too large" }),
    };

    mockFetch.mockResolvedValue(mockFetchResponse);

    const formData = new FormData();
    formData.append("file", new Blob(["large content"]), "large.txt");

    const options: UploadOptions = {
      endpoint: "/upload",
      formData,
    };

    await expect(httpClient.upload(options)).rejects.toThrow("HTTP 413: Payload Too Large");
  });

  it("should use custom headers for upload", async () => {
    const mockResponse = { uploaded: true };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
      status: 200,
      statusText: "OK",
    };

    mockFetch.mockResolvedValue(mockFetchResponse);

    const formData = new FormData();
    formData.append("file", new Blob(["test content"]), "test.txt");

    const options: UploadOptions = {
      endpoint: "/upload",
      formData,
      headers: { "X-Upload-Type": "custom" },
    };

    await httpClient.upload(options);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Upload-Type": "custom",
        }),
      })
    );
  });
});
