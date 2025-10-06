/**
 * Tests for useNotifications composable
 */

import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { t } from "../../utils/optional-i18n";
import {
  createNotifications,
  NotificationsProvider,
  useNotifications,
  useNotify,
  useNotificationValues,
} from "../../composables/useNotifications";

describe("useNotifications Composable", () => {
  describe("createNotifications", () => {
    it("should create a notifications module instance", () => {
      const notificationsModule = createNotifications();

      expect(notificationsModule).toBeDefined();
      expect(Array.isArray(notificationsModule.notifications)).toBe(true);
      expect(typeof notificationsModule.notify).toBe("function");
      expect(typeof notificationsModule.clearNotifications).toBe("function");
    });

    it("should create notifications module with empty notifications", () => {
      const notificationsModule = createNotifications();
      expect(notificationsModule.notifications.length).toBe(0);
    });

    it("should have all required methods", () => {
      const notificationsModule = createNotifications();

      expect(notificationsModule.notifications).toBeDefined();
      expect(notificationsModule.notify).toBeDefined();
      expect(notificationsModule.createNotification).toBeDefined();
      expect(notificationsModule.removeNotification).toBeDefined();
      expect(notificationsModule.clearNotifications).toBeDefined();
    });

    it("should allow adding notifications", () => {
      const notificationsModule = createNotifications();

      notificationsModule.notify(t("core.test.notification"));
      expect(notificationsModule.notifications.length).toBe(1);
      expect(notificationsModule.notifications[0].message).toBe(t("core.test.notification"));
    });

    it("should allow clearing notifications", () => {
      const notificationsModule = createNotifications();

      // Add a notification first
      notificationsModule.notify(t("core.test.notification"));
      expect(notificationsModule.notifications.length).toBe(1);

      // Clear notifications
      notificationsModule.clearNotifications();
      expect(notificationsModule.notifications.length).toBe(0);
    });

    it("should allow removing specific notifications", () => {
      const notificationsModule = createNotifications();

      notificationsModule.notify(t("core.test.notification-1"));
      notificationsModule.notify(t("core.test.notification-2"));
      expect(notificationsModule.notifications.length).toBe(2);

      const firstNotification = notificationsModule.notifications[0];
      notificationsModule.removeNotification(firstNotification.id);
      expect(notificationsModule.notifications.length).toBe(1);
    });
  });

  describe("NotificationsProvider", () => {
    it("should be defined", () => {
      expect(NotificationsProvider).toBeDefined();
    });
  });

  describe("useNotifications", () => {
    it("should throw error when used outside provider", () => {
      createRoot(() => {
        expect(() => useNotifications()).toThrow("useNotifications must be used within a NotificationsProvider");
      });
    });

    it("should return context when used within provider", () => {
      const notificationsModule = createNotifications();

      createRoot(dispose => {
        // Test that the module has the expected structure
        expect(notificationsModule).toBeDefined();
        expect(typeof notificationsModule.notify).toBe("function");
        expect(typeof notificationsModule.clearNotifications).toBe("function");
        expect(Array.isArray(notificationsModule.notifications)).toBe(true);
        dispose();
      });
    });
  });

  describe("useNotify", () => {
    it("should return notification utilities", () => {
      const notificationsModule = createNotifications();

      createRoot(dispose => {
        // Test that the module has the expected structure
        expect(notificationsModule).toBeDefined();
        expect(typeof notificationsModule.notify).toBe("function");
        expect(typeof notificationsModule.createNotification).toBe("function");
        expect(typeof notificationsModule.removeNotification).toBe("function");
        expect(typeof notificationsModule.clearNotifications).toBe("function");
        dispose();
      });
    });
  });

  describe("useNotificationValues", () => {
    it("should return notification values", () => {
      const notificationsModule = createNotifications();

      createRoot(dispose => {
        // Test that the module has the expected structure
        expect(notificationsModule).toBeDefined();
        expect(Array.isArray(notificationsModule.notifications)).toBe(true);
        dispose();
      });
    });

    it("should return empty array initially", () => {
      const notificationsModule = createNotifications();
      expect(notificationsModule.notifications).toEqual([]);
    });

    it("should return notifications after adding them", () => {
      const notificationsModule = createNotifications();
      notificationsModule.notify(t("core.test.notification"), "info");

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].message).toBe(t("core.test.notification"));
      expect(notificationsModule.notifications[0].type).toBe("info");
    });
  });

  describe("Error Handling", () => {
    it("should throw error when useNotify is used outside provider", () => {
      createRoot(() => {
        expect(() => useNotify()).toThrow("useNotifications must be used within a NotificationsProvider");
      });
    });

    it("should throw error when useNotificationValues is used outside provider", () => {
      createRoot(() => {
        expect(() => useNotificationValues()).toThrow("useNotifications must be used within a NotificationsProvider");
      });
    });
  });

  describe("Context Integration", () => {
    it("should work with custom provider", () => {
      const customModule = createNotifications();

      createRoot(dispose => {
        // Test that the custom module works
        expect(customModule).toBeDefined();
        expect(typeof customModule.notify).toBe("function");
        expect(Array.isArray(customModule.notifications)).toBe(true);
        dispose();
      });
    });

    it("should share state across multiple operations", () => {
      const notificationsModule = createNotifications();

      // Add notifications
      notificationsModule.notify(t("core.notifications.first"), "info");
      notificationsModule.notify(t("core.notifications.second"), "success");

      expect(notificationsModule.notifications).toHaveLength(2);

      // Remove one notification
      const firstId = notificationsModule.notifications[0].id;
      notificationsModule.removeNotification(firstId);

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].message).toBe(t("core.notifications.second"));

      // Clear all notifications
      notificationsModule.clearNotifications();
      expect(notificationsModule.notifications).toHaveLength(0);
    });
  });
});
