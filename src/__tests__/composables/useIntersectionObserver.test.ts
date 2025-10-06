/**
 * useIntersectionObserver composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { useIntersectionObserver } from "../../composables/useIntersectionObserver";

describe("useIntersectionObserver", () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create composable with required methods", () => {
    const callback = vi.fn();

    let observer: ReturnType<typeof useIntersectionObserver>;

    createRoot(() => {
      observer = useIntersectionObserver(callback);
    });

    expect(observer!.isIntersecting).toBeDefined();
    expect(observer!.setTargetRef).toBeDefined();
    expect(observer!.targetRef).toBeDefined();
  });

  it("should provide isIntersecting signal", () => {
    const callback = vi.fn();

    let observer: ReturnType<typeof useIntersectionObserver>;

    createRoot(() => {
      observer = useIntersectionObserver(callback);
    });

    expect(typeof observer!.isIntersecting).toBe("function");
    expect(observer!.isIntersecting()).toBe(false);
  });

  it("should provide setTargetRef function", () => {
    const callback = vi.fn();

    let observer: ReturnType<typeof useIntersectionObserver>;

    createRoot(() => {
      observer = useIntersectionObserver(callback);
    });

    expect(typeof observer!.setTargetRef).toBe("function");
  });

  it("should provide targetRef signal", () => {
    const callback = vi.fn();

    let observer: ReturnType<typeof useIntersectionObserver>;

    createRoot(() => {
      observer = useIntersectionObserver(callback);
    });

    expect(typeof observer!.targetRef).toBe("function");
    expect(observer!.targetRef()).toBe(null);
  });

  it("should handle target ref setting", () => {
    const callback = vi.fn();
    const mockElement = document.createElement("div");

    let observer: ReturnType<typeof useIntersectionObserver>;

    createRoot(() => {
      observer = useIntersectionObserver(callback);
    });

    observer!.setTargetRef(mockElement);
    expect(observer!.targetRef()).toBe(mockElement);
  });
});
