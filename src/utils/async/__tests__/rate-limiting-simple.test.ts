/**
 * Simple test suite for enhanced async rate limiting utilities
 *
 * Tests the core functionality without complex setup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  debounce,
  throttle,
  createAbortController,
  createTimeoutAbortController,
  combineAbortSignals,
  PrecisionTier,
} from "../rate-limiting";

describe("Enhanced Async Rate Limiting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock performance.now() to return incremental timestamps
    let time = 0;
    vi.stubGlobal("performance", {
      now: vi.fn(() => time++),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("Async Debounce", () => {
    it("should debounce async function calls", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      const promise1 = debouncedFn("arg1");
      const promise2 = debouncedFn("arg2");
      const promise3 = debouncedFn("arg3");

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Only the last call should execute
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenLastCalledWith("arg3");

      // All promises should resolve to the same result
      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual(["result", "result", "result"]);
    });

    it("should support leading edge execution", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100, { leading: true });

      const result = await debouncedFn("arg1");
      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should support cancel method", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("arg1");
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should support flush method", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("arg1");
      const result = await debouncedFn.flush();

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should support isPending method", () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100, { precision: PrecisionTier.HIGH });

      expect(debouncedFn.isPending()).toBe(false);

      debouncedFn("arg1");
      expect(debouncedFn.isPending()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(debouncedFn.isPending()).toBe(false);
    });
  });

  describe("Async Throttle", () => {
    it("should throttle async function calls", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const throttledFn = throttle(mockFn, 100, { precision: PrecisionTier.HIGH });

      // Call multiple times rapidly
      const promise1 = throttledFn("arg1");
      const promise2 = throttledFn("arg2");
      const promise3 = throttledFn("arg3");

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Should execute immediately (leading) and then after delay (trailing)
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, "arg1");
      expect(mockFn).toHaveBeenNthCalledWith(2, "arg3");
    });

    it("should support leading edge only", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const throttledFn = throttle(mockFn, 100, { leading: true, trailing: false, precision: PrecisionTier.HIGH });

      const result1 = await throttledFn("arg1");
      const result2 = await throttledFn("arg2");
      const result3 = await throttledFn("arg3");

      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(result1).toBe("result");
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();
    });
  });

  describe("AbortController Utilities", () => {
    it("should create AbortController", () => {
      const controller = createAbortController();
      expect(controller).toBeInstanceOf(AbortController);
      expect(controller.signal.aborted).toBe(false);
    });

    it("should create timeout-based AbortController", () => {
      const controller = createTimeoutAbortController(100);
      expect(controller.signal.aborted).toBe(false);

      vi.advanceTimersByTime(100);
      expect(controller.signal.aborted).toBe(true);
    });

    it("should combine multiple AbortSignals", () => {
      const controller1 = createAbortController();
      const controller2 = createAbortController();
      const combined = combineAbortSignals([controller1.signal, controller2.signal]);

      expect(combined.signal.aborted).toBe(false);

      controller1.abort();
      expect(combined.signal.aborted).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle async function errors", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error("Async error"));
      const debouncedFn = debounce(mockFn, 100);

      const promise = debouncedFn("arg1");
      vi.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow("Async error");
    });

    it("should handle cancellation errors", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100);

      const promise = debouncedFn("arg1");
      debouncedFn.cancel();

      await expect(promise).rejects.toThrow("Operation was cancelled");
    });
  });
});
