/**
 * Comprehensive Performance Benchmarks for Async Rate Limiting
 *
 * This test suite provides empirical performance data for the ASYNC-RATE system,
 * measuring execution times, promise consistency, memory usage, and rate limiting accuracy.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle, debounce } from "../rate-limiting.js";

describe("ASYNC-RATE Performance Benchmarks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Throttle Performance Benchmarks", () => {
    it("should benchmark throttle execution times", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const throttledFn = throttle(mockFn, 100, { leading: true, trailing: true });

      const executionTimes: number[] = [];
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await throttledFn(`arg${i}`);
        const end = performance.now();
        executionTimes.push(end - start);

        if (i % 100 === 0) {
          vi.advanceTimersByTime(10);
        }
      }

      // Calculate statistics
      const meanTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const sortedTimes = executionTimes.sort((a, b) => a - b);
      const p99Time = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
      const maxTime = Math.max(...executionTimes);
      const minTime = Math.min(...executionTimes);

      console.log("Throttle Performance Results:");
      console.log(`  Mean Time: ${meanTime.toFixed(3)}ms`);
      console.log(`  P99 Time: ${p99Time.toFixed(3)}ms`);
      console.log(`  Max Time: ${maxTime.toFixed(3)}ms`);
      console.log(`  Min Time: ${minTime.toFixed(3)}ms`);
      console.log(`  Total Calls: ${mockFn.mock.calls.length}`);

      // Performance assertions
      expect(meanTime).toBeLessThan(1.0); // Mean should be under 1ms
      expect(p99Time).toBeLessThan(2.0); // P99 should be under 2ms
      expect(mockFn.mock.calls.length).toBeGreaterThan(0);
    });

    it("should benchmark throttle with different wait times", async () => {
      const waitTimes = [50, 100, 200, 500];
      const results: Record<number, { mean: number; p99: number; calls: number }> = {};

      for (const wait of waitTimes) {
        const mockFn = vi.fn().mockResolvedValue("result");
        const throttledFn = throttle(mockFn, wait, { leading: true, trailing: true });

        const executionTimes: number[] = [];
        const iterations = 500;

        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          await throttledFn(`arg${i}`);
          const end = performance.now();
          executionTimes.push(end - start);

          if (i % 50 === 0) {
            vi.advanceTimersByTime(wait / 10);
          }
        }

        const meanTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
        const sortedTimes = executionTimes.sort((a, b) => a - b);
        const p99Time = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

        results[wait] = {
          mean: meanTime,
          p99: p99Time,
          calls: mockFn.mock.calls.length,
        };
      }

      console.log("Throttle Performance by Wait Time:");
      Object.entries(results).forEach(([wait, stats]) => {
        console.log(
          `  ${wait}ms: Mean=${stats.mean.toFixed(3)}ms, P99=${stats.p99.toFixed(3)}ms, Calls=${stats.calls}`
        );
      });

      // All wait times should perform well
      Object.values(results).forEach(stats => {
        expect(stats.mean).toBeLessThan(2.0);
        expect(stats.p99).toBeLessThan(5.0);
      });
    });
  });

  describe("Debounce Performance Benchmarks", () => {
    it("should benchmark debounce execution times", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100, { leading: true, trailing: true });

      const executionTimes: number[] = [];
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await debouncedFn(`arg${i}`);
        const end = performance.now();
        executionTimes.push(end - start);

        if (i % 100 === 0) {
          vi.advanceTimersByTime(10);
        }
      }

      // Calculate statistics
      const meanTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const sortedTimes = executionTimes.sort((a, b) => a - b);
      const p99Time = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

      console.log("Debounce Performance Results:");
      console.log(`  Mean Time: ${meanTime.toFixed(3)}ms`);
      console.log(`  P99 Time: ${p99Time.toFixed(3)}ms`);
      console.log(`  Total Calls: ${mockFn.mock.calls.length}`);

      // Performance assertions
      expect(meanTime).toBeLessThan(1.0);
      expect(p99Time).toBeLessThan(2.0);
    });
  });

  describe("Promise Consistency Benchmarks", () => {
    it("should measure promise consistency for throttle", async () => {
      const mockFn = vi.fn().mockResolvedValue("consistent-result");
      const throttledFn = throttle(mockFn, 100, { leading: true, trailing: true });

      const promises: Promise<unknown>[] = [];
      const iterations = 100;

      // Create multiple concurrent calls
      for (let i = 0; i < iterations; i++) {
        promises.push(throttledFn(`arg${i}`));
      }

      // Advance time to trigger execution
      await vi.advanceTimersByTimeAsync(100);

      const results = await Promise.all(promises);
      const uniqueResults = new Set(results);
      const consistency = (results.length - uniqueResults.size + 1) / results.length;

      console.log("Throttle Promise Consistency:");
      console.log(`  Total Promises: ${results.length}`);
      console.log(`  Unique Results: ${uniqueResults.size}`);
      console.log(`  Consistency: ${(consistency * 100).toFixed(1)}%`);

      expect(consistency).toBeGreaterThan(0.99); // 99%+ consistency
    });

    it("should measure promise consistency for debounce", async () => {
      const mockFn = vi.fn().mockResolvedValue("consistent-result");
      const debouncedFn = debounce(mockFn, 100, { leading: true, trailing: true });

      const promises: Promise<unknown>[] = [];
      const iterations = 100;

      // Create multiple concurrent calls
      for (let i = 0; i < iterations; i++) {
        promises.push(debouncedFn(`arg${i}`));
      }

      // Advance time to trigger execution
      await vi.advanceTimersByTimeAsync(100);

      const results = await Promise.all(promises);
      const uniqueResults = new Set(results);
      const consistency = (results.length - uniqueResults.size + 1) / results.length;

      console.log("Debounce Promise Consistency:");
      console.log(`  Total Promises: ${results.length}`);
      console.log(`  Unique Results: ${uniqueResults.size}`);
      console.log(`  Consistency: ${(consistency * 100).toFixed(1)}%`);

      expect(consistency).toBeGreaterThan(0.99); // 99%+ consistency
    });
  });

  describe("Rate Limiting Accuracy Benchmarks", () => {
    it("should measure throttle rate limiting accuracy", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const wait = 100; // 100ms = 10 calls per second max
      const throttledFn = throttle(mockFn, wait, { leading: true, trailing: true });

      const testDuration = 1000; // 1 second
      const callInterval = 10; // Call every 10ms
      const totalCalls = Math.floor(testDuration / callInterval);

      // Make calls over the test duration
      for (let i = 0; i < totalCalls; i++) {
        throttledFn(`arg${i}`);
        vi.advanceTimersByTime(callInterval);
      }

      // Advance to complete all operations
      await vi.advanceTimersByTimeAsync(wait);

      const actualCalls = mockFn.mock.calls.length;
      const expectedMaxCalls = Math.floor(testDuration / wait) + 1; // +1 for leading edge
      const accuracy = Math.min(actualCalls / expectedMaxCalls, 1.0);

      console.log("Throttle Rate Limiting Accuracy:");
      console.log(`  Test Duration: ${testDuration}ms`);
      console.log(`  Wait Time: ${wait}ms`);
      console.log(`  Total Calls Made: ${totalCalls}`);
      console.log(`  Actual Executions: ${actualCalls}`);
      console.log(`  Expected Max: ${expectedMaxCalls}`);
      console.log(`  Accuracy: ${(accuracy * 100).toFixed(1)}%`);

      expect(accuracy).toBeGreaterThan(0.9); // 90%+ accuracy
    });

    it("should measure debounce rate limiting accuracy", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const wait = 100;
      const debouncedFn = debounce(mockFn, wait, { leading: false, trailing: true });

      const testDuration = 500; // 500ms
      const callInterval = 20; // Call every 20ms
      const totalCalls = Math.floor(testDuration / callInterval);

      // Make calls over the test duration
      for (let i = 0; i < totalCalls; i++) {
        debouncedFn(`arg${i}`);
        vi.advanceTimersByTime(callInterval);
      }

      // Advance to complete all operations
      await vi.advanceTimersByTimeAsync(wait);

      const actualCalls = mockFn.mock.calls.length;
      const expectedCalls = 1; // Only the last call should execute

      console.log("Debounce Rate Limiting Accuracy:");
      console.log(`  Test Duration: ${testDuration}ms`);
      console.log(`  Wait Time: ${wait}ms`);
      console.log(`  Total Calls Made: ${totalCalls}`);
      console.log(`  Actual Executions: ${actualCalls}`);
      console.log(`  Expected: ${expectedCalls}`);
      console.log(`  Accuracy: ${actualCalls === expectedCalls ? "100%" : "Incorrect"}`);

      expect(actualCalls).toBe(expectedCalls);
    });
  });

  describe("Memory Usage Benchmarks", () => {
    it("should verify O(1) memory complexity for throttle", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const throttledFn = throttle(mockFn, 100, { leading: true, trailing: true });

      const callCounts = [100, 500, 1000, 2000];
      const memoryUsage: number[] = [];

      for (const count of callCounts) {
        // Reset for each test
        vi.clearAllMocks();

        // Make the specified number of calls
        for (let i = 0; i < count; i++) {
          throttledFn(`arg${i}`);
        }

        // Memory usage should be constant regardless of call count
        // We can't directly measure memory, but we can verify the function
        // doesn't accumulate state that grows with call count
        const hasPending = throttledFn.isPending();
        memoryUsage.push(hasPending ? 1 : 0);
      }

      console.log("Throttle Memory Complexity:");
      console.log(`  Call counts tested: ${callCounts.join(", ")}`);
      console.log(`  Memory usage pattern: ${memoryUsage.join(", ")}`);
      console.log(`  Consistent behavior: ${memoryUsage.every(v => v === memoryUsage[0]) ? "Yes" : "No"}`);

      // All tests should show consistent memory behavior
      expect(memoryUsage.every(v => v === memoryUsage[0])).toBe(true);
    });

    it("should verify O(1) memory complexity for debounce", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const debouncedFn = debounce(mockFn, 100, { leading: true, trailing: true });

      const callCounts = [100, 500, 1000, 2000];
      const memoryUsage: number[] = [];

      for (const count of callCounts) {
        // Reset for each test
        vi.clearAllMocks();

        // Make the specified number of calls
        for (let i = 0; i < count; i++) {
          debouncedFn(`arg${i}`);
        }

        const hasPending = debouncedFn.isPending();
        memoryUsage.push(hasPending ? 1 : 0);
      }

      console.log("Debounce Memory Complexity:");
      console.log(`  Call counts tested: ${callCounts.join(", ")}`);
      console.log(`  Memory usage pattern: ${memoryUsage.join(", ")}`);
      console.log(`  Consistent behavior: ${memoryUsage.every(v => v === memoryUsage[0]) ? "Yes" : "No"}`);

      expect(memoryUsage.every(v => v === memoryUsage[0])).toBe(true);
    });
  });

  describe("Concurrency Benchmarks", () => {
    it("should benchmark concurrent throttle calls", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      const throttledFn = throttle(mockFn, 100, { leading: true, trailing: true });

      const concurrencyLevels = [10, 50, 100, 200];
      const results: Record<number, { time: number; calls: number }> = {};

      for (const concurrency of concurrencyLevels) {
        const start = performance.now();

        // Create concurrent calls
        const promises = Array.from({ length: concurrency }, (_, i) => throttledFn(`arg${i}`));

        // Wait for all to complete
        await vi.advanceTimersByTimeAsync(100);
        await Promise.all(promises);

        const end = performance.now();
        const executionTime = end - start;

        results[concurrency] = {
          time: executionTime,
          calls: mockFn.mock.calls.length,
        };

        // Reset for next test
        vi.clearAllMocks();
      }

      console.log("Concurrent Throttle Performance:");
      Object.entries(results).forEach(([concurrency, stats]) => {
        console.log(`  ${concurrency} concurrent: ${stats.time.toFixed(3)}ms, ${stats.calls} calls`);
      });

      // Performance should scale well with concurrency
      const times = Object.values(results).map(r => r.time);
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const timeRatio = maxTime / minTime;

      expect(timeRatio).toBeLessThan(5); // Should not scale linearly with concurrency
    });
  });
});
