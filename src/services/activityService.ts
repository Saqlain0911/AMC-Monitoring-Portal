import { api } from "./api";

// Activity types that we want to track
export type ActivityType =
  | "login"
  | "logout"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_assigned"
  | "profile_updated"
  | "password_changed"
  | "remark_added"
  | "notification_read"
  | "file_uploaded"
  | "dashboard_viewed"
  | "report_generated"
  | "user_registered";

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  sessionId?: string;
}

export interface ActivityFilters {
  userId?: string;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ActivityResponse {
  activities: UserActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Activity service for tracking user actions
export const activityService = {
  // Log a new activity
  logActivity: async (activity: {
    task_id?: number;
    action: string;
    description: string;
    old_value?: string;
    new_value?: string;
  }): Promise<UserActivity> => {
    try {
      const response = await api.post<{
        activity: UserActivity;
        message: string;
      }>("/activities", activity);
      return response.activity;
    } catch (error) {
      // Don't throw errors for activity logging to avoid disrupting user experience
      console.error("Failed to log activity:", error);
      throw error;
    }
  },

  // Get activities with filters
  getActivities: async (
    filters: ActivityFilters = {},
  ): Promise<ActivityResponse> => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/activities${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await api.get<ActivityResponse>(endpoint);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      throw error;
    }
  },

  // Get user-specific activities
  getUserActivities: async (
    userId: string,
    filters: Omit<ActivityFilters, "userId"> = {},
  ): Promise<ActivityResponse> => {
    return activityService.getActivities({ ...filters, userId });
  },

  // Get activity statistics
  getActivityStats: async (
    userId?: string,
  ): Promise<{
    totalActivities: number;
    todayActivities: number;
    weekActivities: number;
    monthActivities: number;
    mostActiveDay: string;
    activityBreakdown: Record<ActivityType, number>;
  }> => {
    try {
      const endpoint = userId
        ? `/activities/stats?userId=${userId}`
        : "/activities/stats";
      return await api.get(endpoint);
    } catch (error) {
      console.error("Failed to fetch activity statistics:", error);
      throw error;
    }
  },

  // Bulk log activities (for offline sync)
  bulkLogActivities: async (
    activities: Array<{
      type: ActivityType;
      description: string;
      metadata?: Record<string, unknown>;
      timestamp: string;
    }>,
  ): Promise<UserActivity[]> => {
    try {
      return await api.post<UserActivity[]>("/activities/bulk", { activities });
    } catch (error) {
      console.error("Failed to bulk log activities:", error);
      throw error;
    }
  },

  // Delete old activities (admin only)
  cleanupActivities: async (
    olderThanDays: number,
  ): Promise<{ deletedCount: number }> => {
    try {
      return await api.delete(
        `/activities/cleanup?olderThanDays=${olderThanDays}`,
      );
    } catch (error) {
      console.error("Failed to cleanup activities:", error);
      throw error;
    }
  },
};

// Helper function to generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Activity tracker hook for easy usage in components
export const useActivityTracker = () => {
  const logActivity = async (
    type: ActivityType,
    description: string,
    metadata?: Record<string, unknown>,
  ) => {
    try {
      await activityService.logActivity({ type, description, metadata });
    } catch (error) {
      // Silently fail - we don't want activity logging to break the app
      console.warn("Activity logging failed:", error);
    }
  };

  // Specific activity loggers
  const trackLogin = (userId: string) =>
    logActivity("login", `User logged in`, { userId });

  const trackLogout = (userId: string) =>
    logActivity("logout", `User logged out`, { userId });

  const trackTaskCreated = (taskId: string, taskTitle: string) =>
    logActivity("task_created", `Created task: ${taskTitle}`, {
      taskId,
      taskTitle,
    });

  const trackTaskCompleted = (
    taskId: string,
    taskTitle: string,
    duration?: number,
  ) =>
    logActivity("task_completed", `Completed task: ${taskTitle}`, {
      taskId,
      taskTitle,
      duration,
    });

  const trackTaskAssigned = (
    taskId: string,
    taskTitle: string,
    assignedTo: string,
  ) =>
    logActivity("task_assigned", `Assigned task: ${taskTitle}`, {
      taskId,
      taskTitle,
      assignedTo,
    });

  const trackProfileUpdate = (changes: string[]) =>
    logActivity("profile_updated", `Updated profile`, { changes });

  const trackRemarkAdded = (remarkId: string, type: string) =>
    logActivity("remark_added", `Added ${type} remark`, { remarkId, type });

  const trackDashboardView = () =>
    logActivity("dashboard_viewed", "Viewed dashboard");

  const trackReportGenerated = (reportType: string) =>
    logActivity("report_generated", `Generated ${reportType} report`, {
      reportType,
    });

  return {
    logActivity,
    trackLogin,
    trackLogout,
    trackTaskCreated,
    trackTaskCompleted,
    trackTaskAssigned,
    trackProfileUpdate,
    trackRemarkAdded,
    trackDashboardView,
    trackReportGenerated,
  };
};

// Offline activity queue for when backend is not available
export class OfflineActivityQueue {
  private queue: Array<{
    type: ActivityType;
    description: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
  }> = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem("offline_activities");
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load offline activity queue:", error);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem("offline_activities", JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to save offline activity queue:", error);
    }
  }

  private setupOnlineListener() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  async addActivity(
    type: ActivityType,
    description: string,
    metadata?: Record<string, unknown>,
  ) {
    const activity = {
      type,
      description,
      metadata,
      timestamp: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        await activityService.logActivity(activity);
      } catch (error) {
        // If online but request fails, add to queue
        this.queue.push(activity);
        this.saveQueue();
      }
    } else {
      // Add to offline queue
      this.queue.push(activity);
      this.saveQueue();
    }
  }

  private async syncQueue() {
    if (this.queue.length === 0) return;

    try {
      await activityService.bulkLogActivities(this.queue);
      this.queue = [];
      this.saveQueue();
      console.log("Offline activities synced successfully");
    } catch (error) {
      console.error("Failed to sync offline activities:", error);
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

// Global offline activity queue instance
export const offlineActivityQueue = new OfflineActivityQueue();

// Auto-track page views
export const setupPageViewTracking = () => {
  const trackPageView = () => {
    const path = window.location.pathname;
    const activity = useActivityTracker();

    // Track different page views
    if (path.includes("/dashboard")) {
      activity.trackDashboardView();
    } else if (path.includes("/tasks")) {
      activity.logActivity("dashboard_viewed", "Viewed tasks page", {
        page: "tasks",
      });
    } else if (path.includes("/reports")) {
      activity.logActivity("dashboard_viewed", "Viewed reports page", {
        page: "reports",
      });
    } else if (path.includes("/profile")) {
      activity.logActivity("dashboard_viewed", "Viewed profile page", {
        page: "profile",
      });
    }
  };

  // Track initial page load
  trackPageView();

  // Track navigation changes (for SPAs)
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      trackPageView();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};
