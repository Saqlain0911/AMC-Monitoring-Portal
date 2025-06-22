import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import {
  taskService,
  notificationService,
  remarkService,
} from "@/services/taskService";
import {
  Task,
  TaskCategory,
  TaskStatus,
  Notification,
  Remark,
  User,
} from "@/types";

// Query keys for caching
export const QUERY_KEYS = {
  // Auth
  currentUser: ["auth", "currentUser"],
  allUsers: ["auth", "allUsers"],

  // Tasks
  tasks: ["tasks"],
  tasksByCategory: (category: TaskCategory) => ["tasks", "category", category],
  tasksByUser: (userId: string) => ["tasks", "user", userId],
  taskById: (taskId: string) => ["tasks", "detail", taskId],
  taskStats: (userId?: string) => ["tasks", "stats", userId],

  // Notifications
  notifications: (userId: string) => ["notifications", userId],
  unreadNotifications: (userId: string) => ["notifications", "unread", userId],

  // Remarks
  remarks: (filters?: Record<string, unknown>) => ["remarks", filters],
} as const;

// Auth hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: authService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on auth errors
      if (
        (error as { status?: number })?.status === 401 ||
        (error as { status?: number })?.status === 403
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useAllUsers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.allUsers,
    queryFn: authService.getAllUsers,
    enabled: user?.role === "admin", // Only fetch for admins
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Task hooks
export const useTasks = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks, filters],
    queryFn: () => taskService.getTasks(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTasksByCategory = (category: TaskCategory) => {
  return useQuery({
    queryKey: QUERY_KEYS.tasksByCategory(category),
    queryFn: () => taskService.getTasksByCategory(category),
    staleTime: 30 * 1000,
  });
};

export const useTasksByUser = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.tasksByUser(userId),
    queryFn: () => taskService.getTasksByUser(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};

export const useTaskById = (taskId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.taskById(taskId),
    queryFn: () => taskService.getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useTaskStats = (userId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.taskStats(userId),
    queryFn: () => taskService.getTaskStatistics(userId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Notification hooks
export const useNotifications = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.notifications(userId),
    queryFn: () => notificationService.getNotifications(userId),
    enabled: !!userId,
    staleTime: 15 * 1000, // 15 seconds
  });
};

export const useUnreadNotifications = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.unreadNotifications(userId),
    queryFn: () => notificationService.getUnreadNotifications(userId),
    enabled: !!userId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
};

// Remark hooks
export const useRemarks = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: QUERY_KEYS.remarks(filters),
    queryFn: () => remarkService.getRemarks(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Mutation hooks for data modification
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasksByCategory(newTask.category),
      });
      if (newTask.assignedTo) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tasksByUser(newTask.assignedTo),
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskStats() });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Record<string, unknown>;
    }) => taskService.updateTask(taskId, data),
    onSuccess: (updatedTask, { taskId }) => {
      // Update specific task cache
      queryClient.setQueryData(QUERY_KEYS.taskById(taskId), updatedTask);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasksByCategory(updatedTask.category),
      });
      if (updatedTask.assignedTo) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tasksByUser(updatedTask.assignedTo),
        });
      }
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      statusData,
    }: {
      taskId: string;
      statusData: Record<string, unknown>;
    }) => taskService.updateTaskStatus(taskId, statusData),
    onSuccess: (updatedTask, { taskId }) => {
      // Update specific task cache
      queryClient.setQueryData(QUERY_KEYS.taskById(taskId), updatedTask);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasksByCategory(updatedTask.category),
      });
      if (updatedTask.assignedTo) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tasksByUser(updatedTask.assignedTo),
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskStats() });
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      taskService.assignTask(taskId, userId),
    onSuccess: (updatedTask, { taskId, userId }) => {
      // Update specific task cache
      queryClient.setQueryData(QUERY_KEYS.taskById(taskId), updatedTask);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasksByUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.unreadNotifications(userId),
      });
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markNotificationRead,
    onSuccess: (_, notificationId) => {
      // Invalidate notification queries
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};

export const useAddRemark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: remarkService.addRemark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remarks"] });
    },
  });
};

export const useRespondToRemark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      remarkId,
      response,
    }: {
      remarkId: string;
      response: string;
    }) => remarkService.respondToRemark(remarkId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remarks"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      // Update current user cache
      queryClient.setQueryData(QUERY_KEYS.currentUser, updatedUser);
      // Invalidate all users cache for admin views
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
  });
};

// Custom hook for optimistic updates
export const useOptimisticTaskUpdate = () => {
  const queryClient = useQueryClient();

  const updateTaskOptimistically = (taskId: string, updates: Partial<Task>) => {
    // Update the task in cache immediately
    queryClient.setQueryData(
      QUERY_KEYS.taskById(taskId),
      (oldTask: Task | undefined) =>
        oldTask ? { ...oldTask, ...updates } : undefined,
    );

    // Update tasks in list queries
    queryClient.setQueriesData(
      { queryKey: QUERY_KEYS.tasks },
      (oldData: unknown) => {
        const data = oldData as { tasks?: Task[] };
        if (!data?.tasks) return oldData;

        return {
          ...data,
          tasks: data.tasks.map((task: Task) =>
            task.id === taskId ? { ...task, ...updates } : task,
          ),
        };
      },
    );
  };

  return { updateTaskOptimistically };
};
