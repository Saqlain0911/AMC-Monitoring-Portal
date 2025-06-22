import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskCategory, TaskStatus, Notification, Remark } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { isBackendAvailable } from "@/config/mockMode";
import { mockDataService } from "@/services/mockDataService";
import { getDefaultDueDate } from "@/utils/dateUtils";

interface TaskContextType {
  tasks: Task[];
  notifications: Notification[];
  remarks: Remark[];
  isLoading: boolean;
  createTask: (taskData: Partial<Task>) => void;
  updateTaskStatus: (
    taskId: string,
    status: TaskStatus,
    remarks?: string,
    actualTime?: number,
  ) => void;
  assignTask: (taskId: string, userId: string) => void;
  addRemark: (remark: Partial<Remark>) => void;
  respondToRemark: (remarkId: string, response: string) => void;
  markNotificationRead: (notificationId: string) => void;
  addNotification: (notification: Notification) => void;
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTasksByUser: (userId: string) => Task[];
  getUnreadNotifications: (userId: string) => Notification[];
  refreshData: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isOnline } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage/mock data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (tasks.length > 0) {
      mockDataService.saveTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (notifications.length > 0) {
      mockDataService.saveNotifications(notifications);
    }
  }, [notifications]);

  useEffect(() => {
    if (remarks.length > 0) {
      mockDataService.saveRemarks(remarks);
    }
  }, [remarks]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Always use mock data for now since backend is not available
      const tasksData = mockDataService.getTasks();
      const notificationsData = mockDataService.getNotifications();
      const remarksData = mockDataService.getRemarks();

      setTasks(tasksData);
      setNotifications(notificationsData);
      setRemarks(remarksData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = (taskData: Partial<Task>) => {
    const category = taskData.category || "daily";
    const defaultDueDate =
      taskData.dueDate || getDefaultDueDate(category).toISOString();

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || "",
      description: taskData.description || "",
      category: category,
      status: "pending",
      priority: taskData.priority || "medium",
      assignedBy: taskData.assignedBy || user?.id || "1",
      dueDate: defaultDueDate,
      createdAt: new Date().toISOString(),
      estimatedTime: taskData.estimatedTime || 30,
      ...taskData,
    };

    setTasks((prev) => [...prev, newTask]);

    // Create notification for assigned user
    if (newTask.assignedTo) {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        title: "New Task Assigned",
        message: `${newTask.title} has been assigned to you`,
        type: "task-assigned",
        priority: newTask.priority,
        userId: newTask.assignedTo,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, notification]);
    }
  };

  const updateTaskStatus = (
    taskId: string,
    status: TaskStatus,
    remarksText?: string,
    actualTime?: number,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              completedAt:
                status === "completed"
                  ? new Date().toISOString()
                  : task.completedAt,
              remarks: remarksText,
              actualTime,
            }
          : task,
      ),
    );
  };

  const assignTask = (taskId: string, userId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, assignedTo: userId } : task,
      ),
    );

    // Create notification for assigned user
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        title: "Task Assigned",
        message: `${task.title} has been assigned to you`,
        type: "task-assigned",
        priority: task.priority,
        userId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, notification]);
    }
  };

  const addRemark = (remarkData: Partial<Remark>) => {
    const newRemark: Remark = {
      id: `remark-${Date.now()}`,
      userId: remarkData.userId || user?.id || "",
      message: remarkData.message || "",
      type: remarkData.type || "feedback",
      createdAt: new Date().toISOString(),
      ...remarkData,
    };

    setRemarks((prev) => [...prev, newRemark]);
  };

  const respondToRemark = (remarkId: string, response: string) => {
    setRemarks((prev) =>
      prev.map((remark) =>
        remark.id === remarkId
          ? {
              ...remark,
              adminResponse: response,
              respondedAt: new Date().toISOString(),
            }
          : remark,
      ),
    );
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  const getTasksByCategory = (category: TaskCategory) => {
    return tasks.filter((task) => task.category === category);
  };

  const getTasksByUser = (userId: string) => {
    return tasks.filter((task) => task.assignedTo === userId);
  };

  const getUnreadNotifications = (userId: string) => {
    return notifications.filter(
      (notif) => notif.userId === userId && !notif.read,
    );
  };

  const refreshData = () => {
    loadData();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        notifications,
        remarks,
        isLoading,
        createTask,
        updateTaskStatus,
        assignTask,
        addRemark,
        respondToRemark,
        markNotificationRead,
        getTasksByCategory,
        getTasksByUser,
        getUnreadNotifications,
        addNotification,
        refreshData,
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
