/**
 * Security Headers Tests
 * Tests for security header configuration and management
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { t } from "../../utils/optional-i18n";
import {
  DEFAULT_SECURITY_HEADERS,
  STRICT_SECURITY_HEADERS,
  DEVELOPMENT_SECURITY_HEADERS,
  applySecurityHeaders,
  getSecurityHeaders,
  enforceHTTPS,
  generateNonce,
  createCSPWithNonce,
  createSecureFetch,
} from "../../security/headers";

// Mock Headers class for testing
class MockHeaders {
  private headers: Map<string, string> = new Map();

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  entries(): IterableIterator<[string, string]> {
    return this.headers.entries();
  }
}

// Mock Request class for testing
class MockRequest {
  constructor(
    public url: string,
    public headers: MockHeaders = new MockHeaders()
  ) {}
}

describe("Security Headers", () => {
  describe("Default Security Headers", () => {
    it("should have all required security headers", () => {
      const headers = DEFAULT_SECURITY_HEADERS;

      expect(headers["Content-Security-Policy"]).toBeDefined();
      expect(headers["X-Frame-Options"]).toBeDefined();
      expect(headers["X-Content-Type-Options"]).toBeDefined();
      expect(headers["X-XSS-Protection"]).toBeDefined();
      expect(headers["Referrer-Policy"]).toBeDefined();
      expect(headers["Permissions-Policy"]).toBeDefined();
      expect(headers["Strict-Transport-Security"]).toBeDefined();
      expect(headers["Cross-Origin-Embedder-Policy"]).toBeDefined();
      expect(headers["Cross-Origin-Opener-Policy"]).toBeDefined();
      expect(headers["Cross-Origin-Resource-Policy"]).toBeDefined();
    });

    it("should have secure default values", () => {
      const headers = DEFAULT_SECURITY_HEADERS;

      expect(headers["X-Frame-Options"]).toBe("DENY");
      expect(headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(headers["X-XSS-Protection"]).toBe("1; mode=block");
      expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    });

    it("should include HSTS headers", () => {
      const headers = DEFAULT_SECURITY_HEADERS;
      expect(headers["Strict-Transport-Security"]).toContain("max-age=");
      expect(headers["Strict-Transport-Security"]).toContain("includeSubDomains");
      expect(headers["Strict-Transport-Security"]).toContain("preload");
    });
  });

  describe("Strict Security Headers", () => {
    it("should have stricter CSP than default", () => {
      const strictHeaders = STRICT_SECURITY_HEADERS;
      const defaultHeaders = DEFAULT_SECURITY_HEADERS;

      expect(strictHeaders["Content-Security-Policy"]).not.toContain("unsafe-inline");
      expect(strictHeaders["Content-Security-Policy"]).not.toContain("unsafe-eval");
      expect(strictHeaders["Content-Security-Policy"]).toContain("block-all-mixed-content");
    });

    it("should have longer HSTS max-age", () => {
      const strictHeaders = STRICT_SECURITY_HEADERS;
      const defaultHeaders = DEFAULT_SECURITY_HEADERS;

      const strictMaxAge = strictHeaders["Strict-Transport-Security"].match(/max-age=(\d+)/)?.[1];
      const defaultMaxAge = defaultHeaders["Strict-Transport-Security"].match(/max-age=(\d+)/)?.[1];

      expect(parseInt(strictMaxAge!)).toBeGreaterThan(parseInt(defaultMaxAge!));
    });
  });

  describe("Development Security Headers", () => {
    it("should be more permissive than production", () => {
      const devHeaders = DEVELOPMENT_SECURITY_HEADERS;

      expect(devHeaders["Content-Security-Policy"]).toContain("unsafe-inline");
      expect(devHeaders["Content-Security-Policy"]).toContain("unsafe-eval");
      expect(devHeaders["Content-Security-Policy"]).toContain("http:");
    });

    it("should have shorter HSTS max-age", () => {
      const devHeaders = DEVELOPMENT_SECURITY_HEADERS;
      const maxAge = devHeaders["Strict-Transport-Security"].match(/max-age=(\d+)/)?.[1];

      expect(parseInt(maxAge!)).toBeLessThan(86400 * 365); // Less than 1 year
    });
  });

  describe("Header Application", () => {
    let mockHeaders: MockHeaders;

    beforeEach(() => {
      mockHeaders = new MockHeaders();
    });

    it("should apply security headers to response", () => {
      applySecurityHeaders(mockHeaders, "production");

      expect(mockHeaders.get("content-security-policy")).toBeDefined();
      expect(mockHeaders.get("x-frame-options")).toBe("DENY");
      expect(mockHeaders.get("x-content-type-options")).toBe("nosniff");
      expect(mockHeaders.get("strict-transport-security")).toBeDefined();
    });

    it("should apply development headers in development mode", () => {
      applySecurityHeaders(mockHeaders, "development");

      const csp = mockHeaders.get("content-security-policy");
      expect(csp).toContain("unsafe-inline");
      expect(csp).toContain("http:");
    });

    it("should apply strict headers in strict mode", () => {
      applySecurityHeaders(mockHeaders, "strict");

      const csp = mockHeaders.get("content-security-policy");
      expect(csp).not.toContain("unsafe-inline");
      expect(csp).toContain("block-all-mixed-content");
    });
  });

  describe("Security Header Configuration", () => {
    it("should return correct headers for production", () => {
      const headers = getSecurityHeaders("production");
      expect(headers).toEqual(DEFAULT_SECURITY_HEADERS);
    });

    it("should return correct headers for development", () => {
      const headers = getSecurityHeaders("development");
      expect(headers).toEqual(DEVELOPMENT_SECURITY_HEADERS);
    });

    it("should return correct headers for strict mode", () => {
      const headers = getSecurityHeaders("strict");
      expect(headers).toEqual(STRICT_SECURITY_HEADERS);
    });

    it("should default to production headers", () => {
      const headers = getSecurityHeaders();
      expect(headers).toEqual(DEFAULT_SECURITY_HEADERS);
    });
  });

  describe("HTTPS Enforcement", () => {
    it("should enforce HTTPS for HTTPS requests", () => {
      const request = new MockRequest("https://example.com");
      expect(enforceHTTPS(request as any)).toBe(true);
    });

    it("should enforce HTTPS for requests with x-forwarded-proto header", () => {
      const request = new MockRequest("http://example.com");
      request.headers.set("x-forwarded-proto", "https");
      expect(enforceHTTPS(request as any)).toBe(true);
    });

    it("should not enforce HTTPS for HTTP requests", () => {
      const request = new MockRequest("http://example.com");
      expect(enforceHTTPS(request as any)).toBe(false);
    });

    it("should handle requests without protocol", () => {
      const request = new MockRequest("example.com");
      expect(enforceHTTPS(request as any)).toBe(false);
    });
  });

  describe("Nonce Generation", () => {
    it("should generate nonces", () => {
      const nonce = generateNonce();
      expect(nonce).toHaveLength(32); // 16 bytes as hex = 32 characters
      expect(nonce).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate different nonces each time", () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe("CSP with Nonce", () => {
    it("should create CSP with nonce for script-src", () => {
      const nonce = "test-nonce-123";
      const csp = createCSPWithNonce(nonce, "production");

      expect(csp).toContain(`'nonce-${nonce}'`);
      expect(csp).toContain("script-src 'self' 'nonce-test-nonce-123'");
    });

    it("should create CSP with nonce for style-src", () => {
      const nonce = "test-nonce-456";
      const csp = createCSPWithNonce(nonce, "production");

      expect(csp).toContain(`'nonce-${nonce}'`);
      expect(csp).toContain("style-src 'self' 'nonce-test-nonce-456'");
    });

    it("should work with different environments", () => {
      const nonce = "test-nonce";

      const prodCsp = createCSPWithNonce(nonce, "production");
      const devCsp = createCSPWithNonce(nonce, "development");
      const strictCsp = createCSPWithNonce(nonce, "strict");

      expect(prodCsp).toContain(`'nonce-${nonce}'`);
      expect(devCsp).toContain(`'nonce-${nonce}'`);
      expect(strictCsp).toContain(`'nonce-${nonce}'`);
    });
  });

  describe("Secure Fetch", () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
      global.fetch = mockFetch;
      vi.clearAllMocks();
    });

    it("should create secure fetch function", () => {
      const secureFetch = createSecureFetch("https://api.example.com");
      expect(typeof secureFetch).toBe("function");
    });

    it("should enforce HTTPS in production", async () => {
      const secureFetch = createSecureFetch("https://api.example.com");

      // Mock process.env.NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      await expect(secureFetch("http://insecure.com")).rejects.toThrow("HTTPS required in production");

      process.env.NODE_ENV = originalEnv;
    });

    it("should add security headers to requests", async () => {
      const secureFetch = createSecureFetch("https://api.example.com");
      mockFetch.mockResolvedValue(new Response());

      await secureFetch("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Requested-With": "XMLHttpRequest",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          }),
        })
      );
    });

    it("should set credentials to same-origin", async () => {
      const secureFetch = createSecureFetch("https://api.example.com");
      mockFetch.mockResolvedValue(new Response());

      await secureFetch("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Object),
          credentials: "same-origin",
        })
      );
    });

    it("should handle absolute URLs", async () => {
      const secureFetch = createSecureFetch("https://api.example.com");
      mockFetch.mockResolvedValue(new Response());

      await secureFetch("https://other-api.com/test");

      expect(mockFetch).toHaveBeenCalledWith("https://other-api.com/test", expect.any(Object));
    });

    it("should merge custom headers", async () => {
      const secureFetch = createSecureFetch("https://api.example.com");
      mockFetch.mockResolvedValue(new Response());

      await secureFetch("/test", {
        headers: {
          "Custom-Header": "custom-value",
          Authorization: t("core.bearer.token"),
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Custom-Header": "custom-value",
            Authorization: t("core.bearer.token"),
            "X-Requested-With": "XMLHttpRequest",
          }),
        })
      );
    });
  });

  describe("CSP Content Analysis", () => {
    it("should have comprehensive CSP directives", () => {
      const csp = DEFAULT_SECURITY_HEADERS["Content-Security-Policy"];

      expect(csp).toContain("default-src");
      expect(csp).toContain("script-src");
      expect(csp).toContain("style-src");
      expect(csp).toContain("img-src");
      expect(csp).toContain("font-src");
      expect(csp).toContain("connect-src");
      expect(csp).toContain("media-src");
      expect(csp).toContain("object-src");
      expect(csp).toContain("base-uri");
      expect(csp).toContain("form-action");
      expect(csp).toContain("frame-ancestors");
      expect(csp).toContain("upgrade-insecure-requests");
    });

    it("should block dangerous object sources", () => {
      const csp = DEFAULT_SECURITY_HEADERS["Content-Security-Policy"];
      expect(csp).toContain("object-src 'none'");
    });

    it("should restrict frame ancestors", () => {
      const csp = DEFAULT_SECURITY_HEADERS["Content-Security-Policy"];
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it("should upgrade insecure requests", () => {
      const csp = DEFAULT_SECURITY_HEADERS["Content-Security-Policy"];
      expect(csp).toContain("upgrade-insecure-requests");
    });
  });

  describe("Permissions Policy", () => {
    it("should restrict dangerous features", () => {
      const permissionsPolicy = DEFAULT_SECURITY_HEADERS["Permissions-Policy"];

      expect(permissionsPolicy).toContain("camera=()");
      expect(permissionsPolicy).toContain("microphone=()");
      expect(permissionsPolicy).toContain("geolocation=()");
      expect(permissionsPolicy).toContain("payment=()");
      expect(permissionsPolicy).toContain("usb=()");
    });

    it("should allow safe features with restrictions", () => {
      const permissionsPolicy = DEFAULT_SECURITY_HEADERS["Permissions-Policy"];

      expect(permissionsPolicy).toContain("fullscreen=(self)");
      expect(permissionsPolicy).toContain("picture-in-picture=()");
    });
  });

  describe("Cross-Origin Policies", () => {
    it("should set appropriate COEP policy", () => {
      expect(DEFAULT_SECURITY_HEADERS["Cross-Origin-Embedder-Policy"]).toBe("require-corp");
    });

    it("should set appropriate COOP policy", () => {
      expect(DEFAULT_SECURITY_HEADERS["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    });

    it("should set appropriate CORP policy", () => {
      expect(DEFAULT_SECURITY_HEADERS["Cross-Origin-Resource-Policy"]).toBe("same-origin");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty headers object", () => {
      const emptyHeaders = new MockHeaders();
      expect(() => applySecurityHeaders(emptyHeaders, "production")).not.toThrow();
    });

    it("should handle invalid environment", () => {
      const headers = new MockHeaders();
      expect(() => applySecurityHeaders(headers, "invalid" as any)).not.toThrow();
    });

    it("should handle malformed URLs in HTTPS enforcement", () => {
      const malformedRequest = new MockRequest("not-a-url");
      expect(() => enforceHTTPS(malformedRequest as any)).not.toThrow();
    });
  });
});
