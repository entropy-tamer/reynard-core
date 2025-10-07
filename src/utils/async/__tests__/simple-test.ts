/**
 * @file Tests for __tests__
 */

/**
 * Simple test to isolate the issue
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Simple Test", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should work with basic async function", async () => {
    const mockFn = vi.fn().mockResolvedValue("result");

    // Test basic async function
    const result = await mockFn("test");
    expect(result).toBe("result");
    expect(mockFn).toHaveBeenCalledWith("test");
  });

  it("should work with setTimeout", () => {
    const mockFn = vi.fn();

    setTimeout(mockFn, 100);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalled();
  });
});
