/**
 * Generic API Client Interface for Reynard Framework
 *
 * Provides a standardized interface for API clients with common patterns
 * like health checks, configuration management, and error handling.
 */

import { HTTPClient, HTTPClientConfig } from "./http-client.js";

export interface ApiClientConfig extends HTTPClientConfig {
  serviceName?: string;
  version?: string;
}

export interface HealthStatus {
  isHealthy: boolean;
  status: string;
  timestamp: number;
  version?: string;
  serviceName?: string;
  details?: Record<string, unknown>;
}

export interface ApiClientInfo {
  serviceName: string;
  version: string;
  baseUrl: string;
  isConnected: boolean;
  lastHealthCheck?: number;
}

export abstract class ApiClient {
  protected httpClient: HTTPClient;
  protected config: ApiClientConfig;
  protected lastHealthCheck?: number;
  protected healthCheckInterval?: number;

  constructor(config: ApiClientConfig) {
    this.config = {
      serviceName: "api-client",
      version: "1.0.0",
      ...config,
    };

    this.httpClient = new HTTPClient(this.config);
  }

  /**
   * Get client information
   */
  getInfo(): ApiClientInfo {
    return {
      serviceName: this.config.serviceName!,
      version: this.config.version!,
      baseUrl: this.config.baseUrl,
      isConnected: this.isConnected(),
      lastHealthCheck: this.lastHealthCheck,
    };
  }

  /**
   * Check if the client is connected (override in subclasses)
   */
  isConnected(): boolean {
    return this.lastHealthCheck !== undefined && Date.now() - this.lastHealthCheck < 60000; // 1 minute
  }

  /**
   * Perform health check (override in subclasses)
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await this.httpClient.request<Record<string, unknown>>({
        method: "GET",
        endpoint: "/api/health",
      });

      this.lastHealthCheck = Date.now();

      return {
        isHealthy: true,
        status: "healthy",
        timestamp: this.lastHealthCheck,
        version: this.config.version,
        serviceName: this.config.serviceName,
        details: response.data,
      };
    } catch (error) {
      return {
        isHealthy: false,
        status: "unhealthy",
        timestamp: Date.now(),
        version: this.config.version,
        serviceName: this.config.serviceName,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs: number = 30000): void {
    this.healthCheckInterval = window.setInterval(async () => {
      await this.checkHealth();
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Update client configuration
   */
  updateConfig(updates: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...updates };
    this.httpClient.updateConfig(updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopHealthChecks();
  }
}
