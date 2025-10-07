/**
 * @file Tests for security
 */

/**
 * Tests for HTML validation and sanitization
 */

import { describe, it, expect } from "vitest";
import { sanitizeHTML } from "../../security/validation.js";

describe("HTML Sanitization", () => {
  describe("sanitizeHTML", () => {
    it("should remove script tags", () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello World");
    });

    it("should remove style tags", () => {
      const input = "<style>body{color:red}</style>Hello World";
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello World");
    });

    it("should remove javascript protocols", () => {
      const input = '<a href="javascript:alert(1)">Click me</a>';
      const result = sanitizeHTML(input);
      expect(result).toBe('<a href="">Click me</a>');
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHTML(input);
      expect(result).toBe("<div>Click me</div>");
    });

    it("should remove iframe tags", () => {
      const input = '<iframe src="evil.com"></iframe>Hello World';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello World");
    });

    it("should remove object and embed tags", () => {
      const input = '<object data="evil.swf"></object><embed src="evil.swf"></embed>Hello';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello");
    });

    it("should remove form elements", () => {
      const input = '<form><input type="text"><button>Submit</button></form>Hello';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello");
    });

    it("should handle empty input", () => {
      const result = sanitizeHTML("");
      expect(result).toBe("");
    });

    it("should preserve safe HTML content", () => {
      const input = "<p>Hello <strong>World</strong>!</p>";
      const result = sanitizeHTML(input);
      expect(result).toBe("<p>Hello <strong>World</strong>!</p>");
    });
  });
});
