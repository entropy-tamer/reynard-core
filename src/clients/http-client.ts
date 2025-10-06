/**
 * HTTP Client for Core Package
 * Simple HTTP client implementation for core package functionality
 */

export interface HTTPClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
  authToken?: string;
  enableRetry?: boolean;
}

export interface HTTPRequestOptions {
  method: string;
  endpoint: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HTTPResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export class HTTPError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: HTTPResponse
  ) {
    super(message);
    this.name = "HTTPError";
  }
}

export class HTTPClient {
  private config: HTTPClientConfig;
  private baseHeaders: Record<string, string>;

  constructor(config: HTTPClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      enableRetry: true,
      headers: {},
      ...config,
    };

    this.baseHeaders = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };

    if (this.config.apiKey) {
      this.baseHeaders["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    if (this.config.authToken) {
      this.baseHeaders["Authorization"] = `Bearer ${this.config.authToken}`;
    }
  }

  async request<T = any>(options: HTTPRequestOptions): Promise<HTTPResponse<T>> {
    const url = `${this.config.baseUrl}${options.endpoint}`;
    const headers = { ...this.baseHeaders, ...options.headers };

    const requestOptions: RequestInit = {
      method: options.method,
      headers,
      signal: globalThis.AbortSignal.timeout(options.timeout || this.config.timeout!),
    };

    if (options.data) {
      if (options.data instanceof FormData) {
        delete (requestOptions.headers as any)["Content-Type"];
        requestOptions.body = options.data;
      } else {
        requestOptions.body = JSON.stringify(options.data);
      }
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new HTTPError(`HTTP ${response.status}: ${response.statusText}`, response.status, response.statusText);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error;
      }
      throw new HTTPError(error instanceof Error ? error.message : "Unknown error", 0, "Network Error");
    }
  }

  async upload(options: {
    endpoint: string;
    formData: FormData;
    headers?: Record<string, string>;
  }): Promise<HTTPResponse> {
    return this.request({
      method: "POST",
      endpoint: options.endpoint,
      data: options.formData,
      headers: options.headers,
    });
  }

  updateConfig(updates: Partial<HTTPClientConfig>): void {
    this.config = { ...this.config, ...updates };

    if (updates.headers) {
      this.baseHeaders = { ...this.baseHeaders, ...updates.headers };
    }

    if (updates.apiKey) {
      this.baseHeaders["Authorization"] = `Bearer ${updates.apiKey}`;
    }

    if (updates.authToken) {
      this.baseHeaders["Authorization"] = `Bearer ${updates.authToken}`;
    }
  }

  getConfig(): HTTPClientConfig {
    return { ...this.config };
  }
}

// Legacy interface for backward compatibility
export interface UploadOptions {
  endpoint: string;
  formData: FormData;
  headers?: Record<string, string>;
}

// Legacy alias for backward compatibility
export type RequestOptions = HTTPRequestOptions;
