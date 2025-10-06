/**
 * useClickOutside composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { useClickOutside } from "../../composables/useClickOutside";

describe("useClickOutside", () => {
  beforeEach(() => {
    // Mock DOM methods
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create composable with required methods", () => {
    const callback = vi.fn();

    let clickOutside: ReturnType<typeof useClickOutside>;

    createRoot(() => {
      clickOutside = useClickOutside({ onOutsideClick: callback });
    });

    expect(clickOutside!.isOutside).toBeDefined();
    expect(clickOutside!.setTargetRef).toBeDefined();
    expect(clickOutside!.targetRef).toBeDefined();
  });

  it("should handle target ref setting", () => {
    const callback = vi.fn();
    const mockElement = document.createElement("div");

    let clickOutside: ReturnType<typeof useClickOutside>;

    createRoot(() => {
      clickOutside = useClickOutside({ onOutsideClick: callback });
    });

    // Should be able to set target ref
    clickOutside!.setTargetRef(mockElement);
    expect(clickOutside!.targetRef()).toBe(mockElement);
  });

  it("should handle null target ref", () => {
    const callback = vi.fn();

    let clickOutside: ReturnType<typeof useClickOutside>;

    createRoot(() => {
      clickOutside = useClickOutside({ onOutsideClick: callback });
    });

    // Should be able to set null target ref
    clickOutside!.setTargetRef(null);
    expect(clickOutside!.targetRef()).toBe(null);
  });

  it("should provide isOutside signal", () => {
    const callback = vi.fn();

    let clickOutside: ReturnType<typeof useClickOutside>;

    createRoot(() => {
      clickOutside = useClickOutside({ onOutsideClick: callback });
    });

    // Should have isOutside signal
    expect(typeof clickOutside!.isOutside).toBe("function");
    expect(clickOutside!.isOutside()).toBe(false);
  });
});
