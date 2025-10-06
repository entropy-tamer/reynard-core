/**
 * Tests for ApiClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient, ApiClientConfig, HealthStatus } from "../../clients/api-client";
import { HTTPClient } from "../../clients/http-client";
import { t } from "../../utils/optional-i18n";

// Mock HTTPClient
vi.mock("../../clients/http-client", () => {
  const mockHTTPClient = vi.fn().mockImplementation(config => ({
    config,
    request: vi.fn().mockResolvedValue({
      data: { status: "ok", uptime: 12345 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    }),
    updateConfig: vi.fn(),
  }));

  return {
    HTTPClient: mockHTTPClient,
  };
});

// Ensure global fetch is mocked
global.fetch = vi.fn(() => Promise.resolve(new global.Response("{}", { status: 200 }))) as any;

describe("ApiClient", () => {
  let mockHttpClient: any;
  let apiClient: ApiClient;

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      updateConfig: vi.fn(),
    };
    (HTTPClient as any).mockImplementation(() => mockHttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create ApiClient with default config", () => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);

      expect(HTTPClient).toHaveBeenCalledWith({
        serviceName: "api-client",
        version: "1.0.0",
        baseUrl: "https://api.example.com",
      });
    });

    it("should create ApiClient with custom config", () => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
        serviceName: "custom-service",
        version: "2.0.0",
        timeout: 5000,
        retries: 5,
        apiKey: "test-key",
        headers: { "X-Custom": "value" },
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);

      expect(HTTPClient).toHaveBeenCalledWith(config);
    });
  });

  describe("getInfo", () => {
    beforeEach(() => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
        serviceName: "test-service",
        version: "1.0.0",
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);
    });

    it("should return client information", () => {
      const info = apiClient.getInfo();

      expect(info).toEqual({
        serviceName: "test-service",
        version: "1.0.0",
        baseUrl: "https://api.example.com",
        isConnected: false,
        lastHealthCheck: undefined,
      });
    });

    it("should return connected status when health check is recent", () => {
      // Mock recent health check
      (apiClient as any).lastHealthCheck = Date.now() - 30000; // 30 seconds ago

      const info = apiClient.getInfo();

      expect(info.isConnected).toBe(true);
      expect(info.lastHealthCheck).toBe((apiClient as any).lastHealthCheck);
    });

    it("should return disconnected status when health check is old", () => {
      // Mock old health check
      (apiClient as any).lastHealthCheck = Date.now() - 120000; // 2 minutes ago

      const info = apiClient.getInfo();

      expect(info.isConnected).toBe(false);
    });
  });

  describe("isConnected", () => {
    beforeEach(() => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);
    });

    it("should return false when no health check performed", () => {
      expect(apiClient.isConnected()).toBe(false);
    });

    it("should return true when health check is recent", () => {
      (apiClient as any).lastHealthCheck = Date.now() - 30000; // 30 seconds ago
      expect(apiClient.isConnected()).toBe(true);
    });

    it("should return false when health check is old", () => {
      (apiClient as any).lastHealthCheck = Date.now() - 120000; // 2 minutes ago
      expect(apiClient.isConnected()).toBe(false);
    });
  });

  describe("checkHealth", () => {
    beforeEach(() => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
        serviceName: "test-service",
        version: "1.0.0",
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);
    });

    it("should return healthy status on successful health check", async () => {
      const mockResponse = { data: { status: "ok", uptime: 12345 } };
      mockHttpClient.request.mockResolvedValue(mockResponse);

      const healthStatus = await apiClient.checkHealth();

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: "GET",
        endpoint: "/api/health",
      });

      expect(healthStatus).toEqual({
        isHealthy: true,
        status: "healthy",
        timestamp: expect.any(Number),
        version: "1.0.0",
        serviceName: "test-service",
        details: mockResponse.data,
      });

      expect((apiClient as any).lastHealthCheck).toBeDefined();
    });

    it("should return unhealthy status on failed health check", async () => {
      const mockError = new Error(t("core.connection.failed"));
      mockHttpClient.request.mockRejectedValue(mockError);

      const healthStatus = await apiClient.checkHealth();

      expect(healthStatus).toEqual({
        isHealthy: false,
        status: "unhealthy",
        timestamp: expect.any(Number),
        version: "1.0.0",
        serviceName: "test-service",
        details: {
          error: t("core.connection.failed"),
        },
      });

      expect((apiClient as any).lastHealthCheck).toBeUndefined();
    });

    it("should handle non-Error exceptions", async () => {
      mockHttpClient.request.mockRejectedValue(t("core.errors.string-error"));

      const healthStatus = await apiClient.checkHealth();

      expect(healthStatus.details).toEqual({
        error: t("core.errors.string-error"),
      });
    });
  });

  describe("health checks management", () => {
    beforeEach(() => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);
    });

    it("should start periodic health checks", () => {
      const checkHealthSpy = vi.spyOn(apiClient, "checkHealth").mockResolvedValue({
        isHealthy: true,
        status: "healthy",
        timestamp: Date.now(),
      } as HealthStatus);

      apiClient.startHealthChecks(1000);

      expect((apiClient as any).healthCheckInterval).toBeDefined();

      apiClient.stopHealthChecks();
    });

    it("should stop periodic health checks", () => {
      apiClient.startHealthChecks(1000);
      const intervalId = (apiClient as any).healthCheckInterval;

      apiClient.stopHealthChecks();

      expect((apiClient as any).healthCheckInterval).toBeUndefined();
    });

    it("should handle stopping when no health checks are running", () => {
      expect(() => apiClient.stopHealthChecks()).not.toThrow();
    });
  });

  describe("configuration management", () => {
    beforeEach(() => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
        serviceName: "test-service",
        version: "1.0.0",
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);
    });

    it("should update configuration", () => {
      const updates = {
        timeout: 10000,
        retries: 2,
        apiKey: "new-key",
      };

      apiClient.updateConfig(updates);

      expect(mockHttpClient.updateConfig).toHaveBeenCalledWith(updates);
      expect((apiClient as any).config).toEqual({
        serviceName: "test-service",
        version: "1.0.0",
        baseUrl: "https://api.example.com",
        timeout: 10000,
        retries: 2,
        apiKey: "new-key",
      });
    });

    it("should get current configuration", () => {
      const config = apiClient.getConfig();

      expect(config).toEqual({
        serviceName: "test-service",
        version: "1.0.0",
        baseUrl: "https://api.example.com",
      });
    });

    it("should return a copy of configuration", () => {
      const config1 = apiClient.getConfig();
      const config2 = apiClient.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe("dispose", () => {
    beforeEach(() => {
      const config: ApiClientConfig = {
        baseUrl: "https://api.example.com",
      };

      apiClient = new (class extends ApiClient {
        // Test implementation
      })(config);
    });

    it("should stop health checks on dispose", () => {
      const stopHealthChecksSpy = vi.spyOn(apiClient, "stopHealthChecks");

      apiClient.dispose();

      expect(stopHealthChecksSpy).toHaveBeenCalled();
    });
  });
});
