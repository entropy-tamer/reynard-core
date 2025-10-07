/**
 * Test setup for core package
 * Provides mocks for optional dependencies
 */
import { vi } from "vitest";
// Mock the optional i18n system - it should gracefully handle missing i18n
vi.mock("reynard-i18n", () => {
    // Simulate i18n not being available by throwing an error
    throw new Error("Module not found");
});
// Mock console methods to avoid noise in tests
globalThis.console = {
    ...globalThis.console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
};
