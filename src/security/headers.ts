/**
 * Security Headers Configuration
 * Provides security headers for HTTP responses and client-side security policies
 */

export interface SecurityHeaders {
  "Content-Security-Policy": string;
  "X-Frame-Options": string;
  "X-Content-Type-Options": string;
  "X-XSS-Protection": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
  "Strict-Transport-Security": string;
  "Cross-Origin-Embedder-Policy": string;
  "Cross-Origin-Opener-Policy": string;
  "Cross-Origin-Resource-Policy": string;
}

/**
 * Default security headers configuration
 */
export const DEFAULT_SECURITY_HEADERS: SecurityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-eval needed for some libraries
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),

  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "accelerometer=()",
    "gyroscope=()",
    "fullscreen=(self)",
    "picture-in-picture=()",
  ].join(", "),
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * Strict security headers for production
 */
export const STRICT_SECURITY_HEADERS: SecurityHeaders = {
  ...DEFAULT_SECURITY_HEADERS,
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'", // Remove unsafe-inline and unsafe-eval
    "style-src 'self'", // Remove unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join("; "),
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/**
 * Development security headers (more permissive)
 */
export const DEVELOPMENT_SECURITY_HEADERS: SecurityHeaders = {
  ...DEFAULT_SECURITY_HEADERS,
  "Content-Security-Policy": [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' https: http: ws: wss:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  "Strict-Transport-Security": "max-age=86400", // 1 day for development
};

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(
  headers: globalThis.Headers,
  environment: "development" | "production" | "strict" = "production"
): void {
  const securityHeaders = getSecurityHeaders(environment);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}

/**
 * Get security headers based on environment
 */
export function getSecurityHeaders(
  environment: "development" | "production" | "strict" = "production"
): SecurityHeaders {
  switch (environment) {
    case "development":
      return DEVELOPMENT_SECURITY_HEADERS;
    case "strict":
      return STRICT_SECURITY_HEADERS;
    case "production":
    default:
      return DEFAULT_SECURITY_HEADERS;
  }
}

/**
 * Validate HTTPS enforcement
 */
export function enforceHTTPS(request: globalThis.Request): boolean {
  // Check if request is over HTTPS
  const protocol = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https:") ? "https" : "http");

  return protocol === "https";
}

/**
 * Generate nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Create CSP with nonce
 */
export function createCSPWithNonce(
  nonce: string,
  environment: "development" | "production" | "strict" = "production"
): string {
  const baseHeaders = getSecurityHeaders(environment);
  const baseCSP = baseHeaders["Content-Security-Policy"];

  // Add nonce to script-src and style-src
  return baseCSP
    .replace("script-src 'self'", `script-src 'self' 'nonce-${nonce}'`)
    .replace("style-src 'self'", `style-src 'self' 'nonce-${nonce}'`);
}

/**
 * Security middleware for fetch requests
 */
export function createSecureFetch(baseUrl: string, options: RequestInit = {}): typeof fetch {
  return async (input: globalThis.RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : input.toString();
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    // Ensure HTTPS in production
    if (process.env.NODE_ENV === "production" && !fullUrl.startsWith("https:")) {
      throw new Error("HTTPS required in production");
    }

    const secureInit: RequestInit = {
      ...options,
      ...init,
      credentials: "same-origin",
      headers: {
        ...options.headers,
        ...init.headers,
        // Add security headers to requests
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    };

    return fetch(fullUrl, secureInit);
  };
}
