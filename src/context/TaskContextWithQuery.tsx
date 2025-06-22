import React, { createContext, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Task, TaskCategory, TaskStatus, Notification, Remark } from "@/types";
import {
  useTasks,
  useTasksByCategory,
  useTasksByUser,
  useNotifications,
  useUnreadNotifications,
  useRemarks,
  useCreateTask,
  useUpdateTaskStatus,
  useAssignTask,
  useAddRemark,
  useRespondToRemark,
  useMarkNotificationRead,
  QUERY_KEYS,
} from "@/hooks/useQuery";
import { useAuth } from "@/context/AuthContext";
import { activityService } from "@/services/activityService";
import { wsClient } from "@/services/taskService";

interface TaskContextType {
  // Data
  tasks: Task[] | undefined;
  notifications: Notification[] | undefined;
  remarks: Remark[] | undefined;

  // Loading states
  isTasksLoading: boolean;
  isNotificationsLoading: boolean;
  isRemarksLoading: boolean;

  // Methods
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTaskStatus: (
    taskId: string,
    status: TaskStatus,
    remarks?: string,
    actualTime?: number,
  ) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  addRemark: (remark: Partial<Remark>) => Promise<void>;
  respondToRemark: (remarkId: string, response: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;

  // Getters
  getTasksByCategory: (category: TaskCategory) => Task[] | undefined;
  getTasksByUser: (userId: string) => Task[] | undefined;
  getUnreadNotifications: (userId: string) => Notification[] | undefined;

  // Refresh methods
  refreshTasks: () => void;
  refreshNotifications: () => void;
  refreshRemarks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isOnline } = useAuth();
  const queryClient = useQueryClient();

  // Main data queries
  const {
    data: tasksResponse,
    isLoading: isTasksLoading,
    refetch: refetchTasks,
  } = useTasks();

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
  } = useNotifications(user?.id || "");

  const {
    data: remarks,
    isLoading: isRemarksLoading,
    refetch: refetchRemarks,
  } = useRemarks();

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskStatusMutation = useUpdateTaskStatus();
  const assignTaskMutation = useAssignTask();
  const addRemarkMutation = useAddRemark();
  const respondToRemarkMutation = useRespondToRemark();
  const markNotificationReadMutation = useMarkNotificationRead();

  // WebSocket setup for real-time updates
  useEffect(() => {
    if (user && isOnline) {
      const handleWebSocketMessage = (data: any) => {
        switch (data.type) {
          case "TASK_UPDATED":
            // Invalidate task queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.tasksByUser(user.id),
            });
            break;
          case "TASK_ASSIGNED":
            // Invalidate user tasks and notifications
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.tasksByUser(data.userId),
            });
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.unreadNotifications(data.userId),
            });
            break;
          case "NOTIFICATION_CREATED":
            // Invalidate notifications
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.notifications(data.userId),
            });
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.unreadNotifications(data.userId),
            });
            break;
          case "REMARK_ADDED":
          case "REMARK_RESPONDED":
            // Invalidate remarks
            queryClient.invalidateQueries({ queryKey: ["remarks"] });
            break;
          default:
            console.log("Unknown WebSocket message type:", data.type);
        }
      };

      wsClient.connect(user.id, handleWebSocketMessage);

      return () => {
        wsClient.disconnect();
      };
    }
  }, [user, isOnline, queryClient]);

  // Context methods
  const createTask = async (taskData: Partial<Task>) => {
    try {
      await createTaskMutation.mutateAsync({
        title: taskData.title || "",
        description: taskData.description || "",
        category: taskData.category || "daily",
        estimatedTime: taskData.estimatedTime || 30,
        dueDate: taskData.dueDate || new Date().toISOString(),
        assignedTo: taskData.assignedTo,
      });

      // Track activity
      await activityService.logActivity({
        type: "task_created",
        description: `Created task: ${taskData.title || "New Task"}`,
        metadata: {
          taskId: taskData.title || "task",
          taskTitle: taskData.title || "New Task",
        },
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    status: TaskStatus,
    remarks?: string,
    actualTime?: number,
  ) => {
    try {
      const result = await updateTaskStatusMutation.mutateAsync({
        taskId,
        statusData: {
          status,
          remarks,
          actualTime,
        },
      });

      // Track activity based on status
      if (status === "completed") {
        await activityTracker.trackTaskCompleted(
          taskId,
          result.title,
          actualTime,
        );
      } else {
        await activityTracker.logActivity(
          "task_updated",
          `Updated task status to ${status}`,
          { taskId, status, remarks, actualTime },
        );
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      throw error;
    }
  };

  const assignTask = async (taskId: string, userId: string) => {
    try {
      const result = await assignTaskMutation.mutateAsync({ taskId, userId });

      // Track activity
      await activityTracker.trackTaskAssigned(taskId, result.title, userId);
    } catch (error) {
      console.error("Failed to assign task:", error);
      throw error;
    }
  };

  const addRemark = async (remarkData: Partial<Remark>) => {
    try {
      const result = await addRemarkMutation.mutateAsync({
        message: remarkData.message || "",
        type: remarkData.type || "feedback",
        taskId: remarkData.taskId,
      });

      // Track activity
      await activityTracker.trackRemarkAdded(
        result.id,
        remarkData.type || "feedback",
      );
    } catch (error) {
      console.error("Failed to add remark:", error);
      throw error;
    }
  };

  const respondToRemark = async (remarkId: string, response: string) => {
    try {
      await respondToRemarkMutation.mutateAsync({ remarkId, response });

      // Track activity
      await activityTracker.logActivity("remark_added", "Responded to remark", {
        remarkId,
        responseLength: response.length,
      });
    } catch (error) {
      console.error("Failed to respond to remark:", error);
      throw error;
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await markNotificationReadMutation.mutateAsync(notificationId);

      // Track activity
      await activityTracker.logActivity(
        "notification_read",
        "Marked notification as read",
        { notificationId },
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  };

  // Getter methods
  const getTasksByCategory = (category: TaskCategory) => {
    const tasks = tasksResponse?.tasks;
    return tasks?.filter((task) => task.category === category);
  };

  const getTasksByUser = (userId: string) => {
    const tasks = tasksResponse?.tasks;
    return tasks?.filter((task) => task.assignedTo === userId);
  };

  const getUnreadNotifications = (userId: string) => {
    return notifications?.filter(
      (notif) => notif.userId === userId && !notif.read,
    );
  };

  // Refresh methods
  const refreshTasks = () => {
    refetchTasks();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
  };

  const refreshNotifications = () => {
    refetchNotifications();
    if (user) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications(user.id),
      });
    }
  };

  const refreshRemarks = () => {
    refetchRemarks();
    queryClient.invalidateQueries({ queryKey: ["remarks"] });
  };

  // Handle offline/online state changes
  useEffect(() => {
    if (isOnline) {
      // Refresh data when coming back online
      refreshTasks();
      refreshNotifications();
      refreshRemarks();
    }
  }, [isOnline]);

  return (
    <TaskContext.Provider
      value={{
        // Data
        tasks: tasksResponse?.tasks,
        notifications,
        remarks,

        // Loading states
        isTasksLoading,
        isNotificationsLoading,
        isRemarksLoading,

        // Methods
        createTask,
        updateTaskStatus,
        assignTask,
        addRemark,
        respondToRemark,
        markNotificationRead,

        // Getters
        getTasksByCategory,
        getTasksByUser,
        getUnreadNotifications,

        // Refresh methods
        refreshTasks,
        refreshNotifications,
        refreshRemarks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

// Hook for task statistics
export const useTaskStatistics = (userId?: string) => {
  const { tasks } = useTask();

  const stats = React.useMemo(() => {
    if (!tasks) return null;

    const userTasks = userId
      ? tasks.filter((task) => task.assignedTo === userId)
      : tasks;

    const total = userTasks.length;
    const completed = userTasks.filter(
      (task) => task.status === "completed",
    ).length;
    const inProgress = userTasks.filter(
      (task) => task.status === "in-progress",
    ).length;
    const pending = userTasks.filter(
      (task) => task.status === "pending",
    ).length;
    const overdue = userTasks.filter(
      (task) =>
        new Date(task.dueDate) < new Date() && task.status !== "completed",
    ).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }, [tasks, userId]);

  return stats;
};

// Hook for deadline alerts
export const useDeadlineAlerts = (userId?: string) => {
  const { tasks } = useTask();

  const alerts = React.useMemo(() => {
    if (!tasks) return [];

    const userTasks = userId
      ? tasks.filter((task) => task.assignedTo === userId)
      : tasks;

    const now = new Date();
    const criticalThreshold = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const urgentThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return userTasks
      .filter((task) => task.status !== "completed")
      .map((task) => {
        const dueDate = new Date(task.dueDate);
        let urgency: "critical" | "urgent" | "normal" = "normal";

        if (dueDate < now) {
          urgency = "critical"; // Overdue
        } else if (dueDate < criticalThreshold) {
          urgency = "critical"; // Due within 2 hours
        } else if (dueDate < urgentThreshold) {
          urgency = "urgent"; // Due within 24 hours
        }

        return {
          task,
          urgency,
          timeUntilDue: dueDate.getTime() - now.getTime(),
        };
      })
      .filter((alert) => alert.urgency !== "normal")
      .sort((a, b) => {
        // Sort by urgency first, then by time until due
        if (a.urgency !== b.urgency) {
          return a.urgency === "critical" ? -1 : 1;
        }
        return a.timeUntilDue - b.timeUntilDue;
      });
  }, [tasks, userId]);

  return alerts;
};
