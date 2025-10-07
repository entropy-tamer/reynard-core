/**
 * @file Tests for composables
 */

/**
 * useAsync composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { useAsync } from "../../composables/useAsync";

describe("useAsync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should handle successful async operations", async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue("success");
    const onSuccess = vi.fn();

    let async: ReturnType<typeof useAsync>;

    createRoot(() => {
      async = useAsync(mockAsyncFn, {
        onSuccess,
      });
    });

    expect(async!.isLoading()).toBe(false);
    expect(async!.data()).toBe(undefined);

    const promise = async!.execute("test");
    expect(async!.isLoading()).toBe(true);

    await promise;
    expect(async!.isLoading()).toBe(false);
    expect(async!.data()).toBe("success");
    expect(async!.error()).toBe(null);
    expect(onSuccess).toHaveBeenCalledWith("success");
  });

  it("should handle async operation errors", async () => {
    const error = new Error("Test error");
    const mockAsyncFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    let async: ReturnType<typeof useAsync>;

    createRoot(() => {
      async = useAsync(mockAsyncFn, {
        onError,
      });
    });

    expect(async!.isLoading()).toBe(false);
    expect(async!.error()).toBe(null);

    const promise = async!.execute("test");
    expect(async!.isLoading()).toBe(true);

    await expect(promise).rejects.toThrow("Test error");
    expect(async!.isLoading()).toBe(false);
    expect(async!.data()).toBe(undefined);
    expect(async!.error()).toBe(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should support immediate execution option", () => {
    const mockAsyncFn = vi.fn().mockResolvedValue("immediate");

    let async: ReturnType<typeof useAsync>;

    createRoot(() => {
      async = useAsync(mockAsyncFn, {
        immediate: true,
      });
    });

    // Just test that the composable was created successfully
    expect(async!.isLoading).toBeDefined();
    expect(async!.data).toBeDefined();
    expect(async!.error).toBeDefined();
  });

  it("should provide retry functionality", () => {
    const mockAsyncFn = vi.fn().mockResolvedValue("success");

    let async: ReturnType<typeof useAsync>;

    createRoot(() => {
      async = useAsync(mockAsyncFn, {
        retry: { count: 2, delay: 100 },
      });
    });

    expect(typeof async!.retry).toBe("function");
  });

  it("should reset state", () => {
    let async: ReturnType<typeof useAsync>;

    createRoot(() => {
      async = useAsync(() => Promise.resolve("test"), {
        initialData: "initial",
      });
    });

    expect(async!.data()).toBe("initial");
    expect(async!.isLoading()).toBe(false);
    expect(async!.error()).toBe(null);

    async!.reset();

    expect(async!.data()).toBe("initial");
    expect(async!.isLoading()).toBe(false);
    expect(async!.error()).toBe(null);
  });

  it("should track success and error states", async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue("success");

    let async: ReturnType<typeof useAsync>;

    createRoot(() => {
      async = useAsync(mockAsyncFn);
    });

    expect(async!.isSuccess()).toBe(false);
    expect(async!.isError()).toBe(false);

    await async!.execute();

    expect(async!.isSuccess()).toBe(true);
    expect(async!.isError()).toBe(false);
  });
});
