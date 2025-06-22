// API Integration Testing Utilities

import { authService } from "@/services/authService";
import { taskService } from "@/services/taskService";
import { notificationService } from "@/services/taskService";
import { activityService } from "@/services/activityService";

export interface ApiTestResult {
  endpoint: string;
  success: boolean;
  error?: string;
  data?: unknown;
  duration: number;
}

export class ApiTester {
  private results: ApiTestResult[] = [];
  private authToken: string | null = null;

  // Test authentication endpoints
  async testAuth(): Promise<ApiTestResult[]> {
    const authTests: ApiTestResult[] = [];

    // Test login
    const loginResult = await this.testEndpoint("Login", async () => {
      const response = await authService.login({
        username: "admin",
        password: "admin123",
      });

      this.authToken = response.token;
      return response;
    });
    authTests.push(loginResult);

    // Test get current user
    if (loginResult.success) {
      const userResult = await this.testEndpoint(
        "Get Current User",
        async () => {
          return await authService.getCurrentUser();
        },
      );
      authTests.push(userResult);
    }

    // Test logout
    const logoutResult = await this.testEndpoint("Logout", async () => {
      return await authService.logout();
    });
    authTests.push(logoutResult);

    return authTests;
  }

  // Test task endpoints
  async testTasks(): Promise<ApiTestResult[]> {
    const taskTests: ApiTestResult[] = [];

    // Ensure we're logged in
    if (!this.authToken) {
      await authService.login({
        username: "admin",
        password: "admin123",
      });
    }

    // Test get tasks
    const getTasksResult = await this.testEndpoint("Get Tasks", async () => {
      return await taskService.getTasks();
    });
    taskTests.push(getTasksResult);

    // Test create task
    const createTaskResult = await this.testEndpoint(
      "Create Task",
      async () => {
        return await taskService.createTask({
          title: "API Test Task",
          description: "This task was created by the API integration test",
          status: "pending",
          priority: "medium",
        });
      },
    );
    taskTests.push(createTaskResult);

    // Test get task by ID
    if (createTaskResult.success && createTaskResult.data?.id) {
      const getTaskResult = await this.testEndpoint(
        "Get Task by ID",
        async () => {
          return await taskService.getTaskById(createTaskResult.data.id);
        },
      );
      taskTests.push(getTaskResult);

      // Test update task
      const updateTaskResult = await this.testEndpoint(
        "Update Task",
        async () => {
          return await taskService.updateTask(createTaskResult.data.id, {
            description: "Updated description from API test",
            status: "in_progress",
          });
        },
      );
      taskTests.push(updateTaskResult);

      // Test delete task
      const deleteTaskResult = await this.testEndpoint(
        "Delete Task",
        async () => {
          return await taskService.deleteTask(createTaskResult.data.id);
        },
      );
      taskTests.push(deleteTaskResult);
    }

    return taskTests;
  }

  // Test notification endpoints
  async testNotifications(): Promise<ApiTestResult[]> {
    const notificationTests: ApiTestResult[] = [];

    // Ensure we're logged in
    if (!this.authToken) {
      await authService.login({
        username: "admin",
        password: "admin123",
      });
    }

    // Test get notifications
    const getNotificationsResult = await this.testEndpoint(
      "Get Notifications",
      async () => {
        return await notificationService.getNotifications();
      },
    );
    notificationTests.push(getNotificationsResult);

    // Test get unread notifications
    const getUnreadResult = await this.testEndpoint(
      "Get Unread Notifications",
      async () => {
        return await notificationService.getUnreadNotifications();
      },
    );
    notificationTests.push(getUnreadResult);

    // Test mark all as read
    const markAllReadResult = await this.testEndpoint(
      "Mark All Notifications Read",
      async () => {
        return await notificationService.markAllNotificationsRead();
      },
    );
    notificationTests.push(markAllReadResult);

    return notificationTests;
  }

  // Test activity endpoints
  async testActivities(): Promise<ApiTestResult[]> {
    const activityTests: ApiTestResult[] = [];

    // Ensure we're logged in
    if (!this.authToken) {
      await authService.login({
        username: "admin",
        password: "admin123",
      });
    }

    // Test get activities
    const getActivitiesResult = await this.testEndpoint(
      "Get Activities",
      async () => {
        return await activityService.getActivities();
      },
    );
    activityTests.push(getActivitiesResult);

    // Test log activity
    const logActivityResult = await this.testEndpoint(
      "Log Activity",
      async () => {
        return await activityService.logActivity({
          action: "api_test",
          description: "API integration test activity",
        });
      },
    );
    activityTests.push(logActivityResult);

    return activityTests;
  }

  // Run all tests
  async runAllTests(): Promise<{
    auth: ApiTestResult[];
    tasks: ApiTestResult[];
    notifications: ApiTestResult[];
    activities: ApiTestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      successRate: number;
    };
  }> {
    console.log("🧪 Starting API Integration Tests...");

    const authResults = await this.testAuth();
    console.log("✅ Auth tests completed");

    const taskResults = await this.testTasks();
    console.log("✅ Task tests completed");

    const notificationResults = await this.testNotifications();
    console.log("✅ Notification tests completed");

    const activityResults = await this.testActivities();
    console.log("✅ Activity tests completed");

    const allResults = [
      ...authResults,
      ...taskResults,
      ...notificationResults,
      ...activityResults,
    ];

    const summary = {
      total: allResults.length,
      passed: allResults.filter((r) => r.success).length,
      failed: allResults.filter((r) => !r.success).length,
      successRate:
        (allResults.filter((r) => r.success).length / allResults.length) * 100,
    };

    console.log("🎯 API Integration Tests Summary:");
    console.log(`   Total: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${summary.successRate.toFixed(2)}%`);

    return {
      auth: authResults,
      tasks: taskResults,
      notifications: notificationResults,
      activities: activityResults,
      summary,
    };
  }

  // Test a specific endpoint
  private async testEndpoint(
    name: string,
    testFn: () => Promise<unknown>,
  ): Promise<ApiTestResult> {
    const startTime = Date.now();

    try {
      const data = await testFn();
      const duration = Date.now() - startTime;

      return {
        endpoint: name,
        success: true,
        data,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        endpoint: name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
      };
    }
  }

  // Generate test report
  generateReport(results: Record<string, unknown>): string {
    let report = "# API Integration Test Report\n\n";
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    // Summary
    report += `## Summary\n\n`;
    report += `- **Total Tests:** ${(results.summary as { total: number }).total}\n`;
    report += `- **Passed:** ${results.summary.passed}\n`;
    report += `- **Failed:** ${results.summary.failed}\n`;
    report += `- **Success Rate:** ${results.summary.successRate.toFixed(2)}%\n\n`;

    // Detailed results
    const sections = [
      { name: "Authentication", results: results.auth },
      { name: "Tasks", results: results.tasks },
      { name: "Notifications", results: results.notifications },
      { name: "Activities", results: results.activities },
    ];

    sections.forEach((section) => {
      report += `## ${section.name} Tests\n\n`;

      section.results.forEach((result: ApiTestResult) => {
        const status = result.success ? "✅" : "❌";
        report += `${status} **${result.endpoint}** (${result.duration}ms)\n`;

        if (!result.success && result.error) {
          report += `   Error: ${result.error}\n`;
        }

        report += "\n";
      });
    });

    return report;
  }
}

// Utility functions for quick testing
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/health`,
    );
    return response.ok;
  } catch {
    return false;
  }
};

export const testAuthentication = async (
  username: string = "admin",
  password: string = "admin123",
): Promise<boolean> => {
  try {
    await authService.login({ username, password });
    return true;
  } catch {
    return false;
  }
};

// Development helper to run tests in browser console
if (typeof window !== "undefined") {
  const globalWindow = window as Record<string, unknown>;
  globalWindow.apiTester = new ApiTester();
  globalWindow.testApiConnection = testApiConnection;
  globalWindow.testAuthentication = testAuthentication;
}

export { ApiTester };
