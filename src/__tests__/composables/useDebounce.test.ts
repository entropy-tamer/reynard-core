/**
 * @file Tests for composables
 */

/**
 * useDebounce composable tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { useDebounce, useDebouncedCallback } from "../../composables/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("useDebounce", () => {
    it("should return initial value immediately", () => {
      createRoot(dispose => {
        const [value] = createSignal("test");
        const debouncedValue = useDebounce(value, 300);

        expect(debouncedValue()).toBe("test");
        dispose();
      });
    });

    it("should not update immediately after value change", () => {
      createRoot(dispose => {
        const [value, setValue] = createSignal("initial");
        const debouncedValue = useDebounce(value, 300);

        expect(debouncedValue()).toBe("initial");

        setValue("updated");
        expect(debouncedValue()).toBe("initial"); // Should not change immediately

        dispose();
      });
    });

    it("should create a debounced signal with proper type", () => {
      createRoot(dispose => {
        const [numberValue] = createSignal(42);
        const debouncedNumber = useDebounce(numberValue, 100);

        expect(typeof debouncedNumber).toBe("function");
        expect(debouncedNumber()).toBe(42);

        dispose();
      });

      createRoot(dispose => {
        const [objectValue] = createSignal({ count: 0 });
        const debouncedObject = useDebounce(objectValue, 100);

        expect(typeof debouncedObject).toBe("function");
        expect(debouncedObject()).toEqual({ count: 0 });

        dispose();
      });
    });

    it("should handle rapid value changes without errors", () => {
      createRoot(dispose => {
        const [value, setValue] = createSignal("initial");
        const debouncedValue = useDebounce(value, 50);

        // Rapid updates should not throw errors
        expect(() => {
          setValue("update1");
          setValue("update2");
          setValue("update3");
          setValue("update4");
        }).not.toThrow();

        // Value should still be initial immediately after updates
        expect(debouncedValue()).toBe("initial");

        dispose();
      });
    });
  });

  describe("useDebouncedCallback", () => {
    it("should debounce function calls", () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 300);

      debouncedFn("arg1");
      debouncedFn("arg2");
      debouncedFn("arg3");

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenLastCalledWith("arg3");
    });

    it("should call function with latest arguments", () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 200);

      debouncedFn("first", 1);
      debouncedFn("second", 2);
      debouncedFn("third", 3);

      vi.advanceTimersByTime(200);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("third", 3);
    });

    it("should reset timer on each call", () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 300);

      debouncedFn("call1");
      vi.advanceTimersByTime(200);

      debouncedFn("call2");
      vi.advanceTimersByTime(200);

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100); // Total 300ms since last call
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("call2");
    });

    it("should handle functions with no arguments", () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith();
    });

    it("should clear previous timeout when called multiple times", () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 300);

      debouncedFn("first");
      vi.advanceTimersByTime(100);

      debouncedFn("second");
      vi.advanceTimersByTime(100);

      debouncedFn("third");
      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("third");
    });
  });

  describe("useDebounce edge cases", () => {
    it("should handle cleanup when component unmounts", () => {
      createRoot(dispose => {
        const [value, setValue] = createSignal("initial");
        const debouncedValue = useDebounce(value, 100);

        setValue("updated");

        // Dispose before timeout completes
        dispose();

        // Advance time to ensure cleanup worked
        vi.advanceTimersByTime(200);

        // Should not throw errors
        expect(() => dispose()).not.toThrow();
      });
    });

    it("should handle multiple rapid changes and cleanup", () => {
      createRoot(dispose => {
        const [value, setValue] = createSignal("initial");
        const debouncedValue = useDebounce(value, 50);

        // Rapid changes
        setValue("change1");
        setValue("change2");
        setValue("change3");

        // Dispose before any timeout completes
        dispose();

        // Advance time
        vi.advanceTimersByTime(100);

        expect(() => dispose()).not.toThrow();
      });
    });
  });
});
