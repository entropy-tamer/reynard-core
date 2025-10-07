/**
 * @file Tests for composables
 */

/**
 * useIdle composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { useIdle } from "../../composables/useIdle";

describe("useIdle", () => {
  beforeEach(() => {
    // Mock DOM methods
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create composable with required methods", () => {
    let idle: ReturnType<typeof useIdle>;

    createRoot(() => {
      idle = useIdle();
    });

    expect(idle!.isIdle).toBeDefined();
    expect(idle!.idleTime).toBeDefined();
    expect(idle!.reset).toBeDefined();
  });

  it("should provide isIdle signal", () => {
    let idle: ReturnType<typeof useIdle>;

    createRoot(() => {
      idle = useIdle();
    });

    expect(typeof idle!.isIdle).toBe("function");
    expect(idle!.isIdle()).toBe(false);
  });

  it("should provide idleTime signal", () => {
    let idle: ReturnType<typeof useIdle>;

    createRoot(() => {
      idle = useIdle();
    });

    expect(typeof idle!.idleTime).toBe("function");
    expect(idle!.idleTime()).toBe(0);
  });

  it("should provide reset function", () => {
    let idle: ReturnType<typeof useIdle>;

    createRoot(() => {
      idle = useIdle();
    });

    expect(typeof idle!.reset).toBe("function");
  });

  it("should accept custom timeout", () => {
    let idle: ReturnType<typeof useIdle>;

    createRoot(() => {
      idle = useIdle(5000);
    });

    expect(typeof idle!.isIdle).toBe("function");
    expect(typeof idle!.idleTime).toBe("function");
    expect(typeof idle!.reset).toBe("function");
  });
});
