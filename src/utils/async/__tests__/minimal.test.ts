/**
 * Minimal test without complex setup
 */

import { describe, it, expect } from "vitest";

describe("Minimal Test", () => {
  it("should work with basic functionality", () => {
    expect(1 + 1).toBe(2);
  });

  it("should work with async", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });
});
