import { Task, TaskCategory, TaskStatus, Notification, Remark } from "@/types";
import { api, ApiError } from "./api";

// Additional types for task service
interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface TaskWithDetails extends Task {
  attachments: TaskAttachment[];
  comments: TaskComment[];
}

// API types for tasks
export interface CreateTaskRequest {
  title: string;
  description: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  due_date?: string;
  tags?: string;
  location?: string;
  equipment_id?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: TaskCategory;
  estimatedTime?: number;
  dueDate?: string;
  assignedTo?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
  remarks?: string;
  actualTime?: number;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TaskFilters {
  category?: TaskCategory;
  status?: TaskStatus;
  assignedTo?: string;
  assignedBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Task service methods
export const taskService = {
  // Get all tasks with filters
  getTasks: async (filters: TaskFilters = {}): Promise<TasksResponse> => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await api.get<TasksResponse>(endpoint);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      throw error;
    }
  },

  // Get tasks by category
  getTasksByCategory: async (category: TaskCategory): Promise<Task[]> => {
    try {
      const response = await taskService.getTasks({ category });
      return response.tasks;
    } catch (error) {
      console.error(`Failed to fetch ${category} tasks:`, error);
      throw error;
    }
  },

  // Get tasks assigned to a specific user
  getTasksByUser: async (userId: string): Promise<Task[]> => {
    try {
      const response = await taskService.getTasks({ assignedTo: userId });
      return response.tasks;
    } catch (error) {
      console.error(`Failed to fetch tasks for user ${userId}:`, error);
      throw error;
    }
  },

  // Get single task by ID
  getTaskById: async (taskId: string): Promise<TaskWithDetails> => {
    try {
      const response = await api.get<{
        task: Task;
        attachments: TaskAttachment[];
        comments: TaskComment[];
      }>(`/tasks/${taskId}`);
      return {
        ...response.task,
        attachments: response.attachments,
        comments: response.comments,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error("Task not found");
      }
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData: CreateTaskRequest): Promise<Task> => {
    try {
      const response = await api.post<{ task: Task; message: string }>(
        "/tasks",
        taskData,
      );
      return response.task;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error(
            "Invalid task data. Please check all required fields.",
          );
        }
        if (error.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to create tasks.",
          );
        }
      }
      throw error;
    }
  },

  // Update task
  updateTask: async (
    taskId: string,
    taskData: UpdateTaskRequest,
  ): Promise<Task> => {
    try {
      const response = await api.put<{ task: Task; message: string }>(
        `/tasks/${taskId}`,
        taskData,
      );
      return response.task;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error("Task not found");
        }
        if (error.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to update this task.",
          );
        }
      }
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (
    taskId: string,
    statusData: UpdateTaskStatusRequest,
  ): Promise<Task> => {
    try {
      return await api.patch<Task>(`/tasks/${taskId}/status`, statusData);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error("Task not found");
        }
        if (error.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to update this task.",
          );
        }
      }
      throw error;
    }
  },

  // Assign task to user
  assignTask: async (taskId: string, userId: string): Promise<Task> => {
    try {
      return await api.patch<Task>(`/tasks/${taskId}/assign`, {
        assignedTo: userId,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error("Task not found");
        }
        if (error.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to assign tasks.",
          );
        }
      }
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error("Task not found");
        }
        if (error.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to delete this task.",
          );
        }
      }
      throw error;
    }
  },

  // Get task statistics
  getTaskStatistics: async (
    userId?: string,
  ): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    completionRate: number;
  }> => {
    try {
      const endpoint = userId
        ? `/tasks/stats?userId=${userId}`
        : "/tasks/stats";
      return await api.get(endpoint);
    } catch (error) {
      console.error("Failed to fetch task statistics:", error);
      throw error;
    }
  },
};

// Notification service methods
export const notificationService = {
  // Get notifications for current user
  getNotifications: async (params?: {
    read_status?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: Notification[];
    unread_count: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await api.get<{
        notifications: Notification[];
        unread_count: number;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(endpoint);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw error;
    }
  },

  // Get unread notifications
  getUnreadNotifications: async (): Promise<{
    notifications: Notification[];
    count: number;
  }> => {
    try {
      return await api.get<{ notifications: Notification[]; count: number }>(
        "/notifications/unread",
      );
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<void> => {
    try {
      await api.put(`/notifications/${notificationId}`, { read_status: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error("Notification not found");
      }
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (): Promise<void> => {
    try {
      await api.put("/notifications/mark-all-read", {});
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error("Notification not found");
      }
      throw error;
    }
  },
};

// Remarks service methods
export const remarkService = {
  // Get remarks
  getRemarks: async (
    filters: {
      userId?: string;
      taskId?: string;
      type?: string;
    } = {},
  ): Promise<Remark[]> => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/remarks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await api.get<Remark[]>(endpoint);
    } catch (error) {
      console.error("Failed to fetch remarks:", error);
      throw error;
    }
  },

  // Create new remark
  addRemark: async (remarkData: {
    message: string;
    type: "issue" | "suggestion" | "feedback";
    taskId?: string;
  }): Promise<Remark> => {
    try {
      return await api.post<Remark>("/remarks", remarkData);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        throw new Error(
          "Invalid remark data. Please check all required fields.",
        );
      }
      throw error;
    }
  },

  // Respond to remark (admin only)
  respondToRemark: async (
    remarkId: string,
    response: string,
  ): Promise<Remark> => {
    try {
      return await api.patch<Remark>(`/remarks/${remarkId}/respond`, {
        response,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error("Remark not found");
        }
        if (error.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
      }
      throw error;
    }
  },

  // Delete remark
  deleteRemark: async (remarkId: string): Promise<void> => {
    try {
      await api.delete(`/remarks/${remarkId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error("Remark not found");
        }
        if (error.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to delete this remark.",
          );
        }
      }
      throw error;
    }
  },
};

// WebSocket connection for real-time updates
export class TaskWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, onMessage: (data: unknown) => void): void {
    const wsUrl = `${import.meta.env.VITE_WS_URL || "ws://localhost:3001"}/ws?userId=${userId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect(userId, onMessage);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }

  private attemptReconnect(
    userId: string,
    onMessage: (data: unknown) => void,
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        console.log(
          `Attempting to reconnect WebSocket (attempt ${this.reconnectAttempts})`,
        );
        this.connect(userId, onMessage);
      }, delay);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const wsClient = new TaskWebSocketClient();
