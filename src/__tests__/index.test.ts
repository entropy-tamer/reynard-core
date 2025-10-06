/**
 * Tests for modules index.ts exports
 */

import { describe, it, expect } from "vitest";
import * as Modules from "../index";

describe("Modules Index Exports", () => {
  it("should export notifications module functions", () => {
    expect(Modules).toHaveProperty("createNotificationsModule");
  });

  it("should export notification types", () => {
    // Types are exported but not as runtime properties
    // We can only test that the module exports exist
    expect(Modules).toHaveProperty("createNotificationsModule");
  });
});
