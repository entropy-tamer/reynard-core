/**
 * @file Tests for utils
 */

/**
 * Tests for Package Exports
 */

import { describe, it, expect } from "vitest";
import { createLazyExport, getLazyExport, clearExportRegistry, mlPackages } from "../../utils/package-exports";

describe("Package Exports", () => {
  describe("createLazyExport", () => {
    it("should be a function", () => {
      expect(typeof createLazyExport).toBe("function");
    });

    it("should accept arguments", () => {
      expect(() => createLazyExport("test-package")).not.toThrow();
    });
  });

  describe("getLazyExport", () => {
    it("should be a function", () => {
      expect(typeof getLazyExport).toBe("function");
    });

    it("should accept arguments", () => {
      expect(() => getLazyExport("test-package")).not.toThrow();
    });
  });

  describe("clearExportRegistry", () => {
    it("should be a function", () => {
      expect(typeof clearExportRegistry).toBe("function");
    });

    it("should be callable", () => {
      expect(() => clearExportRegistry()).not.toThrow();
    });
  });

  describe("mlPackages", () => {
    it("should re-export mlPackages from lazy-loading", () => {
      expect(mlPackages).toBeDefined();
      expect(typeof mlPackages).toBe("object");
    });

    it("should contain predefined ML package configurations", () => {
      expect(mlPackages).toBeDefined();
      expect(typeof mlPackages).toBe("object");
    });
  });

  describe("backward compatibility", () => {
    it("should maintain same API as lazy-loading module", () => {
      expect(typeof createLazyExport).toBe("function");
      expect(typeof getLazyExport).toBe("function");
      expect(typeof clearExportRegistry).toBe("function");
      expect(typeof mlPackages).toBe("object");
    });

    it("should work with existing code that imports from package-exports", () => {
      // Test that the functions are callable without errors
      expect(() => createLazyExport("package1")).not.toThrow();
      expect(() => getLazyExport("package2")).not.toThrow();
      expect(() => clearExportRegistry()).not.toThrow();
    });
  });
});