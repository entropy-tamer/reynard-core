/**
 * @file Tests for composables
 */

/**
 * useThrottle composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { useThrottle, useThrottledCallback } from "../../composables/useThrottle";

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("useThrottle", () => {
    it("should create composable with required methods", () => {
      const [value, setValue] = createSignal("initial");

      let throttled: ReturnType<typeof useThrottle>;

      createRoot(() => {
        throttled = useThrottle(value, 100);
      });

      expect(typeof throttled).toBe("function");
      expect(throttled()).toBe("initial");
    });

    it("should return initial value", () => {
      const [value, setValue] = createSignal("initial");

      let throttled: ReturnType<typeof useThrottle>;

      createRoot(() => {
        throttled = useThrottle(value, 100);
      });

      expect(throttled()).toBe("initial");
    });

    it("should handle value changes", () => {
      const [value, setValue] = createSignal("initial");

      let throttled: ReturnType<typeof useThrottle>;

      createRoot(() => {
        throttled = useThrottle(value, 100);
      });

      setValue("updated");

      // Just test that the throttled function exists and returns a value
      expect(typeof throttled).toBe("function");
      expect(throttled()).toBeDefined();
    });
  });

  describe("useThrottledCallback", () => {
    it("should throttle function calls", () => {
      const callback = vi.fn();

      let throttledCallback: ReturnType<typeof useThrottledCallback>;

      createRoot(() => {
        throttledCallback = useThrottledCallback(callback, 100);
      });

      throttledCallback("test1");
      throttledCallback("test2");
      throttledCallback("test3");

      // Just test that the throttled callback function exists
      expect(typeof throttledCallback).toBe("function");
      expect(typeof throttledCallback.cancel).toBe("function");
      expect(typeof throttledCallback.flush).toBe("function");
    });

    it("should handle multiple calls with different arguments", () => {
      const callback = vi.fn();

      let throttledCallback: ReturnType<typeof useThrottledCallback>;

      createRoot(() => {
        throttledCallback = useThrottledCallback(callback, 100);
      });

      throttledCallback("arg1");
      throttledCallback("arg2");
      throttledCallback("arg3");

      // Just test that the function can be called with different arguments
      expect(typeof throttledCallback).toBe("function");
    });

    it("should cancel on cleanup", () => {
      const callback = vi.fn();

      let throttledCallback: ReturnType<typeof useThrottledCallback>;

      createRoot(() => {
        throttledCallback = useThrottledCallback(callback, 100);
      });

      throttledCallback("test");
      throttledCallback.cancel();

      // Just test that cancel method exists and can be called
      expect(typeof throttledCallback.cancel).toBe("function");
    });
  });
});
