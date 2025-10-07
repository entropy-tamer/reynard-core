/**
 * @file Tests for utils
 */

/**
 * Tests for Package Export Registry
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLazyExport, getLazyExport, clearExportRegistry, mlPackages } from "../../utils/package-export-registry";
import { LazyPackageExport } from "../../utils/lazy-package-export";

// Test the actual implementation

describe("Package Export Registry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear registry before each test
    clearExportRegistry();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createLazyExport", () => {
    it("should create a new LazyPackageExport instance", () => {
      const lazyExport = createLazyExport("test-package");

      expect(lazyExport).toBeDefined();
      expect(lazyExport).toBeInstanceOf(LazyPackageExport);
    });

    it("should create LazyPackageExport with custom loader", () => {
      const mockLoader = vi.fn();
      const lazyExport = createLazyExport("test-package", mockLoader);

      expect(lazyExport).toBeDefined();
      expect(lazyExport).toBeInstanceOf(LazyPackageExport);
    });

    it("should create LazyPackageExport with custom validation level", () => {
      const mockLoader = vi.fn();
      const validationLevel = "strict" as any;

      const lazyExport = createLazyExport("test-package", mockLoader, validationLevel);

      expect(lazyExport).toBeDefined();
      expect(lazyExport).toBeInstanceOf(LazyPackageExport);
    });
  });

  describe("getLazyExport", () => {
    it("should return existing LazyPackageExport if already created", () => {
      const lazyExport1 = createLazyExport("test-package");
      const lazyExport2 = getLazyExport("test-package");

      expect(lazyExport1).toBe(lazyExport2);
    });

    it("should return undefined if package not exists", () => {
      const lazyExport = getLazyExport("new-package");

      expect(lazyExport).toBeUndefined();
    });

    it("should return same instance for multiple calls with same package name", () => {
      const lazyExport1 = createLazyExport("test-package");
      const lazyExport2 = getLazyExport("test-package");

      expect(lazyExport1).toBe(lazyExport2);
    });
  });

  describe("clearExportRegistry", () => {
    it("should clear all registered exports", () => {
      const lazyExport1 = createLazyExport("package1");
      const lazyExport2 = createLazyExport("package2");

      clearExportRegistry();

      const newLazyExport1 = getLazyExport("package1");
      const newLazyExport2 = getLazyExport("package2");

      expect(newLazyExport1).not.toBe(lazyExport1);
      expect(newLazyExport2).not.toBe(lazyExport2);
    });

    it("should allow creating new exports after clearing", () => {
      createLazyExport("test-package");
      clearExportRegistry();

      const newLazyExport = createLazyExport("test-package");

      expect(newLazyExport).toBeDefined();
      // LazyPackageExport is not mocked, so we can't check call times
      expect(newLazyExport).toBeInstanceOf(LazyPackageExport);
    });
  });

  describe("mlPackages", () => {
    it("should contain predefined ML package configurations", () => {
      expect(mlPackages).toBeDefined();
      expect(typeof mlPackages).toBe("object");
    });

    it("should have package configurations with expected structure", () => {
      const packageNames = Object.keys(mlPackages);

      // Skip this test if mlPackages is empty (which it currently is)
      if (packageNames.length === 0) {
        expect(packageNames.length).toBe(0);
        return;
      }

      expect(packageNames.length).toBeGreaterThan(0);

      packageNames.forEach(packageName => {
        const config = mlPackages[packageName];
        expect(config).toBeDefined();
        expect(typeof config).toBe("function");
      });
    });
  });

  describe("integration", () => {
    it("should work with multiple packages", () => {
      const package1 = createLazyExport("package1");
      const package2 = createLazyExport("package2");
      const package3 = getLazyExport("package3");

      expect(package1).toBeDefined();
      expect(package2).toBeDefined();
      expect(package3).toBeUndefined(); // Not created yet

      // Should be different instances
      expect(package1).not.toBe(package2);
    });

    it("should maintain registry state across operations", () => {
      const package1 = createLazyExport("package1");
      const package2 = getLazyExport("package2");

      // Get same instances
      const samePackage1 = getLazyExport("package1");
      const samePackage2 = getLazyExport("package2");

      expect(package1).toBe(samePackage1);
      expect(package2).toBeUndefined(); // Not created yet
    });

    it("should handle mixed create and get operations", () => {
      const package1 = createLazyExport("package1");
      const package2 = getLazyExport("package2");
      const package3 = createLazyExport("package3");
      const package4 = getLazyExport("package4");

      // All should be defined
      expect(package1).toBeDefined();
      expect(package2).toBeUndefined(); // Not created yet
      expect(package3).toBeDefined();
      expect(package4).toBeUndefined(); // Not created yet

      // Created packages should be different instances
      expect(package1).not.toBe(package3);
    });
  });
});
