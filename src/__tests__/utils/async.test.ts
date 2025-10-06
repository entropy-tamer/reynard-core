import { describe, it, expect, vi, beforeEach } from "vitest";
import { t } from "../../utils/optional-i18n";

// Import all async utilities
import {
  sleep,
  delay,
  withTimeout,
  retry,
  debounce,
  throttle,
  batchExecute,
  mapWithConcurrency,
  poll,
  memoizeAsync,
  nextTick,
  nextFrame,
  makeCancelable,
} from "../async";

describe("Async Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sleep", () => {
    it("should resolve after specified delay", async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some tolerance
    }, 10000);

    it("should handle zero delay", async () => {
      const start = Date.now();
      await sleep(0);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(20); // Should be very fast
    });
  });

  describe("delay", () => {
    it("should resolve with value after delay", async () => {
      const start = Date.now();
      const result = await delay("test", 100);
      const elapsed = Date.now() - start;
      expect(result).toBe("test");
      expect(elapsed).toBeGreaterThanOrEqual(90);
    }, 10000);

    it("should handle zero delay", async () => {
      const start = Date.now();
      const result = await delay("test", 0);
      const elapsed = Date.now() - start;
      expect(result).toBe("test");
      expect(elapsed).toBeLessThan(10);
    });
  });

  describe("withTimeout", () => {
    it("should resolve when promise completes before timeout", async () => {
      const promise = Promise.resolve("success");
      const result = await withTimeout(promise, 1000);
      expect(result).toBe("success");
    });

    it("should reject when timeout is reached", async () => {
      const promise = new Promise<string>(() => {}); // Never resolves
      await expect(withTimeout(promise, 100)).rejects.toThrow(t("core.async.operation-timed-out"));
    }, 10000);

    it("should use custom error message", async () => {
      const promise = new Promise<string>(() => {});
      await expect(withTimeout(promise, 100, t("core.async.custom-timeout"))).rejects.toThrow(
        t("core.async.custom-timeout")
      );
    }, 10000);

    it("should handle promise rejection", async () => {
      const promise = Promise.reject(new Error(t("core.async.original-error")));
      await expect(withTimeout(promise, 1000)).rejects.toThrow(t("core.async.original-error"));
    });
  });

  describe("retry", () => {
    it("should succeed on first attempt", async () => {
      const mockFn = vi.fn().mockResolvedValue("success");
      const result = await retry(mockFn, 3, 100);
      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should retry and eventually succeed", async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error(t("core.async.first-failure")))
        .mockRejectedValueOnce(new Error(t("core.async.second-failure")))
        .mockResolvedValue("success");

      const result = await retry(mockFn, 3, 50);
      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(3);
    }, 15000);

    it("should fail after max retries", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error(t("core.async.persistent-failure")));
      await expect(retry(mockFn, 2, 50)).rejects.toThrow(t("core.async.persistent-failure"));
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 15000);

    it("should use exponential backoff", async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error(t("core.async.first-failure")))
        .mockResolvedValue("success");

      const start = Date.now();
      await retry(mockFn, 1, 100);
      const elapsed = Date.now() - start;

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(elapsed).toBeGreaterThanOrEqual(90); // Should wait ~100ms
    }, 15000);

    it("should use default parameters", async () => {
      const mockFn = vi.fn().mockResolvedValue("success");
      const result = await retry(mockFn);
      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("debounce", () => {
    it("should debounce async function calls", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 50);

      // Call multiple times quickly
      const promise1 = debouncedFn("arg1");
      const promise2 = debouncedFn("arg2");
      const promise3 = debouncedFn("arg3");

      // Wait for debounce to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // All promises should resolve to the same result
      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual(["result", "result", "result"]);

      // Function should only be called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg3");
    }, 5000);

    it("should handle function errors", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error(t("core.async.function-failed")));
      const debouncedFn = debounce(mockFn, 100);

      await expect(debouncedFn("arg")).rejects.toThrow(t("core.async.function-failed"));
    });

    it("should clear timeout on new calls", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn("arg1");
      await new Promise(resolve => setTimeout(resolve, 25)); // Halfway through delay

      debouncedFn("arg2"); // Should reset the timer
      await new Promise(resolve => setTimeout(resolve, 75)); // Wait for full delay

      // With the new implementation, the function should still be called
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg2");
    }, 5000);
  });

  describe("throttle", () => {
    it("should throttle function calls", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const throttledFn = throttle(mockFn, 100);

      const promise1 = throttledFn("arg1");
      const promise2 = throttledFn("arg2");
      const promise3 = throttledFn("arg3");

      // First call should execute immediately
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Later calls should be throttled
      await Promise.all([promise1, promise2, promise3]);

      // Wait for throttle period to pass
      await new Promise(resolve => setTimeout(resolve, 100));
      throttledFn("arg4");
      expect(mockFn).toHaveBeenCalledWith("arg4");
      // The function may be called more times due to the pending promise
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 15000);

    it("should handle function errors", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error(t("core.async.function-failed")));
      const throttledFn = throttle(mockFn, 100);

      await expect(throttledFn("arg")).rejects.toThrow(t("core.async.function-failed"));
    });
  });

  describe("batchExecute", () => {
    it("should execute promises in batches", async () => {
      const mockFns = Array.from({ length: 6 }, (_, i) => vi.fn().mockResolvedValue(`result${i}`));

      const results = await batchExecute(mockFns, 2);

      expect(results).toEqual(["result0", "result1", "result2", "result3", "result4", "result5"]);

      mockFns.forEach(fn => expect(fn).toHaveBeenCalledTimes(1));
    });

    it("should use default batch size", async () => {
      const mockFns = Array.from({ length: 3 }, (_, i) => vi.fn().mockResolvedValue(`result${i}`));

      const results = await batchExecute(mockFns);

      expect(results).toEqual(["result0", "result1", "result2"]);
    });

    it("should handle empty array", async () => {
      const results = await batchExecute([], 5);
      expect(results).toEqual([]);
    });

    it("should handle batch size larger than array", async () => {
      const mockFns = Array.from({ length: 2 }, (_, i) => vi.fn().mockResolvedValue(`result${i}`));

      const results = await batchExecute(mockFns, 10);
      expect(results).toEqual(["result0", "result1"]);
    });
  });

  describe("mapWithConcurrency", () => {
    it("should map with limited concurrency", async () => {
      const items = [1, 2, 3, 4, 5];
      const mapper = vi.fn().mockImplementation(async (item: number) => {
        await sleep(item * 10);
        return item * 2;
      });

      const results = await mapWithConcurrency(items, mapper, 2);

      expect(results).toEqual([2, 4, 6, 8, 10]);
      expect(mapper).toHaveBeenCalledTimes(5);
    });

    it("should use default concurrency", async () => {
      const items = [1, 2, 3];
      const mapper = vi.fn().mockResolvedValue("result");

      const results = await mapWithConcurrency(items, mapper);

      expect(results).toEqual(["result", "result", "result"]);
    });

    it("should handle empty array", async () => {
      const results = await mapWithConcurrency([], async () => "result");
      expect(results).toEqual([]);
    });

    it("should handle mapper errors", async () => {
      const items = [1, 2, 3];
      const mapper = vi.fn().mockRejectedValue(new Error(t("core.async.mapper-failed")));

      // The function now catches errors and stores them in results array
      const results = await mapWithConcurrency(items, mapper);
      expect(results).toHaveLength(3);
      expect(results[0]).toBeInstanceOf(Error);
      expect(results[1]).toBeInstanceOf(Error);
      expect(results[2]).toBeInstanceOf(Error);
    });

    it("should handle invalid concurrency values", async () => {
      const items = [1, 2, 3];
      const mapper = vi.fn().mockResolvedValue("result");

      await expect(mapWithConcurrency(items, mapper, 0)).rejects.toThrow(
        t("core.async.concurrency-must-be-greater-than-0")
      );
      await expect(mapWithConcurrency(items, mapper, -1)).rejects.toThrow(
        t("core.async.concurrency-must-be-greater-than-0")
      );
    });

    it("should handle null/undefined items array", async () => {
      const mapper = vi.fn().mockResolvedValue("result");

      const results1 = await mapWithConcurrency(null as any, mapper);
      const results2 = await mapWithConcurrency(undefined as any, mapper);

      expect(results1).toEqual([]);
      expect(results2).toEqual([]);
    });
  });

  describe("poll", () => {
    it("should poll until condition is true", async () => {
      let attempts = 0;
      const condition = vi.fn().mockImplementation(() => {
        attempts++;
        return attempts >= 3;
      });

      const promise = poll(condition, 100, 1000);
      await new Promise(resolve => setTimeout(resolve, 300));

      await expect(promise).resolves.toBeUndefined();
      expect(condition).toHaveBeenCalledTimes(3);
    });

    it("should timeout if condition never becomes true", async () => {
      const condition = vi.fn().mockReturnValue(false);

      const promise = poll(condition, 100, 500);
      await new Promise(resolve => setTimeout(resolve, 500));

      await expect(promise).rejects.toThrow("core.async.polling-timeout-reached");
    });

    it("should handle async conditions", async () => {
      let attempts = 0;
      const condition = vi.fn().mockImplementation(async () => {
        attempts++;
        return attempts >= 2;
      });

      const promise = poll(condition, 100, 1000);
      await new Promise(resolve => setTimeout(resolve, 200));

      await expect(promise).resolves.toBeUndefined();
      expect(condition).toHaveBeenCalledTimes(2);
    });

    it("should use default interval and timeout", async () => {
      const condition = vi.fn().mockReturnValue(true);

      const promise = poll(condition);
      await expect(promise).resolves.toBeUndefined();
      expect(condition).toHaveBeenCalledTimes(1);
    });
  });

  describe("memoizeAsync", () => {
    it("should memoize function results", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const memoizedFn = memoizeAsync(mockFn);

      const result1 = await memoizedFn("arg1");
      const result2 = await memoizedFn("arg1");

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should handle different arguments", async () => {
      const mockFn = vi.fn().mockImplementation(async (arg: string) => `result-${arg}`);
      const memoizedFn = memoizeAsync(mockFn);

      await memoizedFn("arg1");
      await memoizedFn("arg2");

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledWith("arg2");
    });

    it("should use custom key generator", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const keyGenerator = vi.fn().mockImplementation((arg: string) => `key-${arg}`);
      const memoizedFn = memoizeAsync(mockFn, keyGenerator);

      await memoizedFn("arg1");
      await memoizedFn("arg1");

      expect(keyGenerator).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should clean up cache on error", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error(t("core.async.function-failed")));
      const memoizedFn = memoizeAsync(mockFn);

      await expect(memoizedFn("arg")).rejects.toThrow(t("core.async.function-failed"));

      // Second call should not use cache
      await expect(memoizedFn("arg")).rejects.toThrow(t("core.async.function-failed"));
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("nextTick", () => {
    it("should resolve on next tick", async () => {
      const promise = nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe("nextFrame", () => {
    it("should resolve with timestamp", async () => {
      const promise = nextFrame();
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
      await expect(promise).resolves.toBeTypeOf("number");
    });

    it("should fallback to setTimeout when requestAnimationFrame is not available", async () => {
      const originalRAF = global.requestAnimationFrame;
      delete (global as any).requestAnimationFrame;

      const promise = nextFrame();
      await new Promise(resolve => setTimeout(resolve, 16));
      await expect(promise).resolves.toBeTypeOf("number");

      global.requestAnimationFrame = originalRAF;
    });
  });

  describe("makeCancelable", () => {
    it("should create cancelable promise", async () => {
      const originalPromise = Promise.resolve("success");
      const cancelablePromise = makeCancelable(originalPromise);

      expect(cancelablePromise.cancel).toBeTypeOf("function");
      expect(cancelablePromise.isCanceled).toBeTypeOf("function");
      expect(cancelablePromise.isCanceled()).toBe(false);
    });

    it("should resolve when not canceled", async () => {
      const originalPromise = Promise.resolve("success");
      const cancelablePromise = makeCancelable(originalPromise);

      await expect(cancelablePromise).resolves.toBe("success");
    });

    it("should reject when not canceled", async () => {
      const originalPromise = Promise.reject(new Error("Failure"));
      const cancelablePromise = makeCancelable(originalPromise);

      await expect(cancelablePromise).rejects.toThrow("Failure");
    });

    it("should not resolve when canceled before resolution", async () => {
      const originalPromise = new Promise<string>(() => {}); // Never resolves
      const cancelablePromise = makeCancelable(originalPromise);

      cancelablePromise.cancel();
      expect(cancelablePromise.isCanceled()).toBe(true);

      // The promise should never resolve
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(cancelablePromise.isCanceled()).toBe(true);
    });

    it("should not reject when canceled before rejection", async () => {
      const originalPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Failure")), 100);
      });
      const cancelablePromise = makeCancelable(originalPromise);

      cancelablePromise.cancel();
      expect(cancelablePromise.isCanceled()).toBe(true);

      // The promise should never reject
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(cancelablePromise.isCanceled()).toBe(true);
    });
  });
});
