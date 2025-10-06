/**
 * Notifications module tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createNotificationsModule } from "../../modules/notifications";
import { t } from "../../utils/optional-i18n";

describe("Notifications Module", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createNotificationsModule", () => {
    it("should create notifications module with empty state", () => {
      const notificationsModule = createNotificationsModule();

      expect(notificationsModule.notifications).toEqual([]);
      expect(typeof notificationsModule.notify).toBe("function");
      expect(typeof notificationsModule.createNotification).toBe("function");
      expect(typeof notificationsModule.removeNotification).toBe("function");
      expect(typeof notificationsModule.clearNotifications).toBe("function");
    });

    it("should add notification with notify method", () => {
      const notificationsModule = createNotificationsModule();

      const id = notificationsModule.notify(t("core.test.message"), "success");

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0]).toMatchObject({
        id,
        message: t("core.test.message"),
        type: "success",
        icon: "success",
      });
    });

    it("should add notification with default type and duration", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify(t("core.notifications.default-message"));

      expect(notificationsModule.notifications[0]).toMatchObject({
        message: t("core.notifications.default-message"),
        type: "info",
        icon: "info",
        duration: 5000,
      });
    });

    it("should replace grouped notifications", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify(t("core.notifications.first-message"), "info", {
        group: "test-group",
      });
      notificationsModule.notify(t("core.notifications.second-message"), "info", {
        group: "test-group",
      });

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].message).toBe(t("core.notifications.second-message"));
    });

    it("should auto-dismiss notifications with duration", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify(t("core.notifications.auto-dismiss"), "success");
      expect(notificationsModule.notifications).toHaveLength(1);

      // Fast forward past the auto-dismiss duration
      vi.advanceTimersByTime(4100);

      expect(notificationsModule.notifications).toHaveLength(0);
    });

    it("should not auto-dismiss error notifications", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify(t("core.notifications.error-message"), "error");
      expect(notificationsModule.notifications).toHaveLength(1);

      // Fast forward, error should still be there
      vi.advanceTimersByTime(10000);

      expect(notificationsModule.notifications).toHaveLength(1);
    });

    it("should remove notification by id", () => {
      const notificationsModule = createNotificationsModule();

      const id1 = notificationsModule.notify("Message 1");
      const id2 = notificationsModule.notify("Message 2");

      expect(notificationsModule.notifications).toHaveLength(2);

      notificationsModule.removeNotification(id1);

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].id).toBe(id2);
    });

    it("should clear notifications by group", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Group A message", "info", {
        group: "group-a",
      });
      notificationsModule.notify("Group B message", "info", {
        group: "group-b",
      });
      notificationsModule.notify(t("core.notifications.no-group-message"));

      expect(notificationsModule.notifications).toHaveLength(3);

      notificationsModule.clearNotifications("group-a");

      expect(notificationsModule.notifications).toHaveLength(2);
      expect(notificationsModule.notifications.every(n => n.group !== "group-a")).toBe(true);
    });

    it("should clear all notifications when no group specified", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Message 1");
      notificationsModule.notify("Message 2");
      notificationsModule.notify("Message 3");

      expect(notificationsModule.notifications).toHaveLength(3);

      notificationsModule.clearNotifications();

      expect(notificationsModule.notifications).toHaveLength(0);
    });

    it("should update notification progress", () => {
      const notificationsModule = createNotificationsModule();

      const id = notificationsModule.notify(t("core.notifications.upload-progress"), "info", {
        progress: 50,
      });

      expect(notificationsModule.notifications[0].progress).toBe(50);

      notificationsModule.updateNotification(id, { progress: 75 });

      expect(notificationsModule.notifications[0].progress).toBe(75);
    });

    it("should clamp progress values between 0 and 100", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify(t("core.notifications.progress-test"), "info", { progress: 150 });
      expect(notificationsModule.notifications[0].progress).toBe(100);

      notificationsModule.notify(t("core.notifications.progress-test-2"), "info", { progress: -10 });
      expect(notificationsModule.notifications[1].progress).toBe(0);
    });

    it("should create notification with custom duration", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify(t("core.notifications.custom-duration"), "info", { duration: 1000 });

      expect(notificationsModule.notifications[0].duration).toBe(1000);

      // Should auto-dismiss after 1 second
      vi.advanceTimersByTime(1100);
      expect(notificationsModule.notifications).toHaveLength(0);
    });

    it("should handle global notification container when available", () => {
      const notificationsModule = createNotificationsModule();

      // Mock global notification container
      const mockContainer = {
        removeNotification: vi.fn(),
        removeNotificationByGroup: vi.fn(),
        clearAllNotifications: vi.fn(),
      };

      (window as any).__notificationContainer = mockContainer;

      const id = notificationsModule.notify(t("core.test.message"));

      // Test removeNotification with global container
      notificationsModule.removeNotification(id);
      expect(mockContainer.removeNotification).toHaveBeenCalledWith(id);

      // Test clearNotifications with group
      notificationsModule.clearNotifications("test-group");
      expect(mockContainer.removeNotificationByGroup).toHaveBeenCalledWith("test-group");

      // Test clearNotifications without group
      notificationsModule.clearNotifications();
      expect(mockContainer.clearAllNotifications).toHaveBeenCalled();

      // Cleanup
      delete (window as any).__notificationContainer;
    });

    it("should fallback to internal state when global container not available", () => {
      const notificationsModule = createNotificationsModule();

      // Ensure no global container
      delete (window as any).__notificationContainer;

      const id = notificationsModule.notify(t("core.test.message"));
      expect(notificationsModule.notifications).toHaveLength(1);

      // Test removeNotification fallback
      notificationsModule.removeNotification(id);
      expect(notificationsModule.notifications).toHaveLength(0);

      // Add notifications for clear tests
      notificationsModule.notify(t("core.notifications.group-message"), "info", {
        group: "test-group",
      });
      notificationsModule.notify(t("core.notifications.regular-message"));

      // Test clearNotifications with group fallback
      notificationsModule.clearNotifications("test-group");
      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].group).toBeUndefined();

      // Test clearNotifications without group fallback
      notificationsModule.clearNotifications();
      expect(notificationsModule.notifications).toHaveLength(0);
    });

    it("should handle createNotification with auto-dismiss", () => {
      const notificationsModule = createNotificationsModule();

      const id = notificationsModule.createNotification({
        message: t("core.notifications.created-notification"),
        type: "success",
        duration: 2000,
      });

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].id).toBe(id);
      expect(notificationsModule.notifications[0].duration).toBe(2000);

      // Should auto-dismiss after 2 seconds
      vi.advanceTimersByTime(2100);
      expect(notificationsModule.notifications).toHaveLength(0);
    });

    it("should handle createNotification with grouped notifications", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.createNotification({
        message: t("core.notifications.first-grouped"),
        type: "info",
        group: "test-group",
      });

      notificationsModule.createNotification({
        message: t("core.notifications.second-grouped"),
        type: "info",
        group: "test-group",
      });

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].message).toBe(t("core.notifications.second-grouped"));
    });
  });
});
