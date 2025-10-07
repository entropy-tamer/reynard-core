/**
 * @file Tests for security
 */

/**
 * Tests for file validation
 */

import { describe, it, expect } from "vitest";
import { validateFileName, validateFileSize, validateMimeType } from "../../security/validation.js";

describe("File Name Validation", () => {
  describe("validateFileName", () => {
    it("should validate correct file names", () => {
      const validNames = ["document.pdf", "image.jpg", "script.js", "data.json", "readme.txt"];

      validNames.forEach(name => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(true);
        expect(result.sanitized).toBe(name);
      });
    });

    it("should reject directory traversal attempts", () => {
      const traversalNames = [
        "../../../etc/passwd",
        "..\\..\\windows\\system32",
        "....//....//etc/passwd",
        "..%2f..%2fetc%2fpasswd",
        "..%5c..%5cwindows%5csystem32",
      ];

      traversalNames.forEach(name => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject invalid characters", () => {
      const invalidNames = [
        "file<name>.txt",
        "file:name.txt",
        "file|name.txt",
        "file?name.txt",
        "file*name.txt",
        'file"name".txt',
      ];

      invalidNames.forEach(name => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject Windows reserved names", () => {
      const reservedNames = ["CON.txt", "PRN.txt", "AUX.txt", "NUL.txt", "COM1.txt", "LPT1.txt"];

      reservedNames.forEach(name => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject hidden files", () => {
      const hiddenNames = [".hidden.txt", ".env", ".gitignore", "..hidden.txt"];

      hiddenNames.forEach(name => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject executable files", () => {
      const executableNames = ["malware.exe", "script.bat", "program.com", "screensaver.scr", "installer.msi"];

      executableNames.forEach(name => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should sanitize file names with special characters", () => {
      const result = validateFileName("file@name#test$.txt");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("file_name_test_.txt");
    });

    it("should handle empty file names", () => {
      const result = validateFileName("");
      expect(result.isValid).toBe(false);
    });
  });
});

describe("File Validation", () => {
  describe("validateFileSize", () => {
    it("should validate correct file sizes", () => {
      expect(validateFileSize(1024, 2048)).toBe(true);
      expect(validateFileSize(0, 1024)).toBe(false); // Empty file
      expect(validateFileSize(2048, 1024)).toBe(false); // Too large
    });

    it("should use default max size", () => {
      expect(validateFileSize(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(validateFileSize(15 * 1024 * 1024)).toBe(false); // 15MB
    });
  });

  describe("validateMimeType", () => {
    it("should validate correct MIME types", () => {
      const allowedTypes = ["image/jpeg", "image/png", "text/plain"];
      expect(validateMimeType("image/jpeg", allowedTypes)).toBe(true);
      expect(validateMimeType("image/png", allowedTypes)).toBe(true);
      expect(validateMimeType("text/plain", allowedTypes)).toBe(true);
    });

    it("should reject invalid MIME types", () => {
      const allowedTypes = ["image/jpeg", "image/png", "text/plain"];
      expect(validateMimeType("application/pdf", allowedTypes)).toBe(false);
      expect(validateMimeType("video/mp4", allowedTypes)).toBe(false);
    });

    it("should handle empty input", () => {
      expect(validateMimeType("", ["image/jpeg"])).toBe(false);
      expect(validateMimeType("image/jpeg", [])).toBe(false);
    });
  });
});
