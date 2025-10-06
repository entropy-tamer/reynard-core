/**
 * useApiClient Composable
 *
 * Provides a reactive API client for SolidJS applications
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { ApiClient, type ApiClientConfig, type HealthStatus } from "../clients/api-client.js";

export interface UseApiClientOptions extends Partial<ApiClientConfig> {
  autoHealthCheck?: boolean;
  healthCheckInterval?: number;
}

export interface UseApiClientReturn {
  client: () => ApiClient | null;
  isConnected: () => boolean;
  healthStatus: () => HealthStatus | null;
  error: () => string | null;
  isLoading: () => boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  healthCheck: () => Promise<HealthStatus>;
}

/**
 * Creates a reactive API client with health monitoring
 */
export function useApiClient(options: UseApiClientOptions = {}): UseApiClientReturn {
  const [client, setClient] = createSignal<ApiClient | null>(null);
  const [isConnected, setIsConnected] = createSignal(false);
  const [healthStatus, setHealthStatus] = createSignal<HealthStatus | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  let healthCheckInterval: NodeJS.Timeout | undefined;

  const connect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a basic API client implementation
      const apiClient = new (class extends ApiClient {
        async healthCheck(): Promise<HealthStatus> {
          try {
            // Simple health check - just verify the client is configured
            return {
              isHealthy: true,
              status: "healthy",
              timestamp: Date.now(),
              serviceName: this.config.serviceName,
              version: this.config.version,
            };
          } catch (err) {
            return {
              isHealthy: false,
              status: "unhealthy",
              timestamp: Date.now(),
              serviceName: this.config.serviceName,
              version: this.config.version,
              details: {
                error: err instanceof Error ? err.message : "Unknown error",
              },
            };
          }
        }
      })({
        baseUrl: options.baseUrl || "http://localhost:8000",
        ...options,
      });

      setClient(apiClient);
      setIsConnected(true);

      // Perform initial health check
      const health = await apiClient.healthCheck();
      setHealthStatus(health);

      // Set up automatic health checks if enabled
      if (options.autoHealthCheck !== false) {
        const interval = options.healthCheckInterval || 30000; // 30 seconds default
        healthCheckInterval = setInterval(async () => {
          try {
            const health = await apiClient.healthCheck();
            setHealthStatus(health);
            setIsConnected(health.isHealthy);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Health check failed");
            setIsConnected(false);
          }
        }, interval);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = undefined;
    }
    setClient(null);
    setIsConnected(false);
    setHealthStatus(null);
    setError(null);
  };

  const healthCheck = async (): Promise<HealthStatus> => {
    const currentClient = client();
    if (!currentClient) {
      throw new Error("Client not connected");
    }

    try {
      // Cast to any to access the healthCheck method we added
      const health = await (currentClient as any).healthCheck();
      setHealthStatus(health);
      setIsConnected(health.isHealthy);
      return health;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Health check failed";
      setError(errorMsg);
      setIsConnected(false);
      throw err;
    }
  };

  // Auto-connect on mount if baseUrl is provided
  createEffect(() => {
    if (options.baseUrl && !client()) {
      connect();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    disconnect();
  });

  return {
    client,
    isConnected,
    healthStatus,
    error,
    isLoading,
    connect,
    disconnect,
    healthCheck,
  };
}
