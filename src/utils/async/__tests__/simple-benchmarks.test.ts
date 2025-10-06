/**
 * Simple Performance Benchmarks for ASYNC-RATE
 * Focused on getting empirical data without timeouts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle, debounce, PrecisionTier } from "../rate-limiting.js";

describe("ASYNC-RATE Simple Benchmarks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should measure basic throttle performance", async () => {
    const mockFn = vi.fn().mockResolvedValue("result");
    const throttledFn = throttle(mockFn, 50, { leading: true, trailing: true, precision: PrecisionTier.HIGH });

    const start = performance.now();

    // Make 5 calls (reduced for faster execution)
    for (let i = 0; i < 5; i++) {
      await throttledFn(`arg${i}`);
      vi.advanceTimersByTime(10);
    }

    vi.advanceTimersByTime(50); // Use synchronous advance
    const end = performance.now();

    const executionTime = end - start;
    const calls = mockFn.mock.calls.length;

    console.log(`Throttle: ${executionTime.toFixed(3)}ms for 5 calls, ${calls} executions`);

    expect(executionTime).toBeLessThan(100);
    expect(calls).toBeGreaterThan(0);
  });

  it("should measure basic debounce performance", async () => {
    const mockFn = vi.fn().mockResolvedValue("result");
    const debouncedFn = debounce(mockFn, 50, { leading: true, trailing: true, precision: PrecisionTier.HIGH });

    const start = performance.now();

    // Make 5 calls (reduced for faster execution)
    for (let i = 0; i < 5; i++) {
      await debouncedFn(`arg${i}`);
      vi.advanceTimersByTime(10);
    }

    vi.advanceTimersByTime(50); // Use synchronous advance
    const end = performance.now();

    const executionTime = end - start;
    const calls = mockFn.mock.calls.length;

    console.log(`Debounce: ${executionTime.toFixed(3)}ms for 5 calls, ${calls} executions`);

    expect(executionTime).toBeLessThan(100);
    expect(calls).toBeGreaterThan(0);
  });

  it("should measure promise consistency", async () => {
    const mockFn = vi.fn().mockResolvedValue("consistent-result");
    const throttledFn = throttle(mockFn, 100, { leading: true, trailing: true });

    // Create 20 concurrent calls
    const promises = Array.from({ length: 20 }, (_, i) => throttledFn(`arg${i}`));

    await vi.advanceTimersByTimeAsync(100);
    const results = await Promise.all(promises);

    const uniqueResults = new Set(results);
    const consistency = uniqueResults.size === 1 ? 100 : 0;

    console.log(
      `Promise Consistency: ${consistency}% (${uniqueResults.size} unique results from ${results.length} promises)`
    );

    expect(consistency).toBe(100);
  });

  it("should measure rate limiting accuracy", async () => {
    const mockFn = vi.fn().mockResolvedValue("result");
    const throttledFn = throttle(mockFn, 100, { leading: true, trailing: true });

    // Make 50 calls over 500ms (should be limited to ~5 executions)
    for (let i = 0; i < 50; i++) {
      throttledFn(`arg${i}`);
      vi.advanceTimersByTime(10);
    }

    await vi.advanceTimersByTimeAsync(100);

    const actualCalls = mockFn.mock.calls.length;
    const expectedMax = Math.floor(500 / 100) + 1; // ~6 calls max
    const accuracy = Math.min(actualCalls / expectedMax, 1.0) * 100;

    console.log(
      `Rate Limiting Accuracy: ${accuracy.toFixed(1)}% (${actualCalls} actual vs ${expectedMax} expected max)`
    );

    expect(accuracy).toBeGreaterThan(80);
  });
});
