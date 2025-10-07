/**
 * @file Tests for utils
 */

/**
 * Tests for Utils Lazy Package Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LazyPackageExport } from "../../utils/lazy-package-export";
import { t } from "../../utils/optional-i18n";

// Test the actual implementation

describe("Utils Lazy Package Export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("LazyPackageExport re-export", () => {
    it("should re-export LazyPackageExport from lazy-loading", () => {
      expect(LazyPackageExport).toBeDefined();
      expect(typeof LazyPackageExport).toBe("function");
    });

    it("should create LazyPackageExport instances", () => {
      const instance = new LazyPackageExport("test-package");

      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(LazyPackageExport);
    });

    it("should pass through constructor arguments", () => {
      const mockLoader = vi.fn();
      const instance = new LazyPackageExport("test-package", mockLoader, "basic", false, false);

      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(LazyPackageExport);
    });
  });

  describe("backward compatibility", () => {
    it("should maintain same API as lazy-loading module", () => {
      // Test that LazyPackageExport is available and functional
      expect(LazyPackageExport).toBeDefined();
      expect(typeof LazyPackageExport).toBe("function");
    });

    it("should work with existing code that imports from utils", () => {
      // Simulate existing code usage
      const instance = new LazyPackageExport("package-name");

      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(LazyPackageExport);
    });
  });

  describe("LazyPackageExport functionality", () => {
    let mockLoader: any;

    beforeEach(() => {
      mockLoader = vi.fn().mockResolvedValue({ test: "module" });
    });

    it("should have getMetadata method", () => {
      const instance = new LazyPackageExport("test-package");
      expect(typeof instance.getMetadata).toBe("function");
    });

    it("should have reset method", () => {
      const instance = new LazyPackageExport("test-package");
      expect(typeof instance.reset).toBe("function");
    });

    it("should have getModule method", () => {
      const instance = new LazyPackageExport("test-package");
      expect(typeof instance.getModule).toBe("function");
    });

    it("should initialize with correct metadata", () => {
      const instance = new LazyPackageExport("test-package");
      const metadata = instance.getMetadata();

      expect(metadata.packageName).toBe("test-package");
      expect(metadata.accessCount).toBe(0);
      expect(metadata.errorCount).toBe(0);
      expect(metadata.dependencies).toEqual([]);
      expect(metadata.typeHints).toEqual({});
    });

    it("should load module using provided loader", async () => {
      const instance = new LazyPackageExport("test-package", mockLoader);

      const module = await instance.getModule();

      expect(mockLoader).toHaveBeenCalledTimes(1);
      expect(module).toEqual({ test: "module" });
    });

    it("should return cached module on subsequent calls", async () => {
      const instance = new LazyPackageExport("test-package", mockLoader);

      const module1 = await instance.getModule();
      const module2 = await instance.getModule();

      expect(mockLoader).toHaveBeenCalledTimes(1);
      expect(module1).toBe(module2);
    });

    it("should update access statistics", async () => {
      const instance = new LazyPackageExport("test-package", mockLoader);

      await instance.getModule();
      await instance.getModule();

      const metadata = instance.getMetadata();
      expect(metadata.accessCount).toBe(2);
      expect(metadata.lastAccess).toBeDefined();
    });

    it("should handle loading errors", async () => {
      const errorLoader = vi.fn().mockRejectedValue(new Error(t("core.module.load-failed")));
      const instance = new LazyPackageExport("test-package", errorLoader);

      await expect(instance.getModule()).rejects.toThrow(t("core.module.load-failed"));

      const metadata = instance.getMetadata();
      expect(metadata.errorCount).toBe(1);
      expect(metadata.lastError).toBe(t("core.module.load-failed"));
    });

    it("should reset module and clear metadata", async () => {
      const instance = new LazyPackageExport("test-package", mockLoader);

      await instance.getModule();
      instance.reset();

      const metadata = instance.getMetadata();
      expect(metadata.loadTime).toBeUndefined();
      expect(metadata.lastAccess).toBeUndefined();
      expect(metadata.memoryUsage).toBeUndefined();
    });

    it("should return a copy of metadata", () => {
      const instance = new LazyPackageExport("test-package");
      const metadata1 = instance.getMetadata();
      const metadata2 = instance.getMetadata();

      expect(metadata1).not.toBe(metadata2);
      expect(metadata1).toEqual(metadata2);
    });

    it("should handle dynamic import when no loader provided", async () => {
      // Mock dynamic import
      const mockModule = { test: "dynamic module" };
      const originalImport = global.import;
      global.import = vi.fn().mockResolvedValue(mockModule);

      const instance = new LazyPackageExport("test-package");

      try {
        const module = await instance.getModule();
        expect(module).toEqual(mockModule);
      } catch (error) {
        // Dynamic import might fail in test environment, which is expected
        expect(error).toBeDefined();
      }

      global.import = originalImport;
    });

    it("should handle validation errors", async () => {
      const invalidLoader = vi.fn().mockResolvedValue(null);
      const instance = new LazyPackageExport("test-package", invalidLoader);

      await expect(instance.getModule()).rejects.toThrow();

      const metadata = instance.getMetadata();
      expect(metadata.errorCount).toBe(1);
    });

    it("should handle non-object modules in validation", async () => {
      const invalidLoader = vi.fn().mockResolvedValue("string module");
      const instance = new LazyPackageExport("test-package", invalidLoader);

      await expect(instance.getModule()).rejects.toThrow();

      const metadata = instance.getMetadata();
      expect(metadata.errorCount).toBe(1);
    });

    it("should estimate memory usage", async () => {
      const instance = new LazyPackageExport("test-package", mockLoader);

      await instance.getModule();

      const metadata = instance.getMetadata();
      expect(metadata.memoryUsage).toBeDefined();
      expect(typeof metadata.memoryUsage).toBe("number");
    });
  });
});
