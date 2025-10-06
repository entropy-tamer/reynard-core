/**
 * Tests for URL validation
 */

import { describe, it, expect } from "vitest";
import { validateURL } from "../../security/validation.js";

describe("URL Validation", () => {
  describe("validateURL", () => {
    it("should validate correct URLs", () => {
      const result = validateURL("https://example.com");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("https://example.com/");
    });

    it("should validate HTTP URLs", () => {
      const result = validateURL("http://example.com");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("http://example.com/");
    });

    it("should reject dangerous protocols", () => {
      const dangerousUrls = [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "vbscript:msgbox(1)",
        "file:///etc/passwd",
        "ftp://example.com",
      ];

      dangerousUrls.forEach(url => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject localhost URLs", () => {
      const localhostUrls = ["http://localhost:3000", "https://127.0.0.1:8080", "http://0.0.0.0:9000"];

      localhostUrls.forEach(url => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
      });
    });

    it("should handle invalid URLs", () => {
      const invalidUrls = ["not-a-url", "http://", "https://", "", null as any, undefined as any];

      invalidUrls.forEach(url => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
      });
    });

    it("should sanitize URLs with query parameters", () => {
      const result = validateURL("https://example.com?param=value");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("https://example.com?param=value");
    });
  });
});
