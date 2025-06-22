import { Task, User, Notification, Remark, TaskCategory } from "@/types";
import { ALL_TASK_DEFINITIONS } from "@/data/taskDefinitions";
import { getDefaultDueDate } from "@/utils/dateUtils";

// Mock users data
export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@amc.com",
    role: "admin",
    post: "System Administrator",
    department: "IT",
    joinDate: "2023-01-01",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@amc.com",
    role: "user",
    post: "IT Technician",
    department: "IT",
    joinDate: "2023-03-15",
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@amc.com",
    role: "user",
    post: "Network Engineer",
    department: "IT",
    joinDate: "2023-02-10",
  },
  {
    id: "4",
    name: "Mike Johnson",
    email: "mike@amc.com",
    role: "user",
    post: "System Administrator",
    department: "IT",
    joinDate: "2023-01-05",
  },
  {
    id: "5",
    name: "Sarah Wilson",
    email: "sarah@amc.com",
    role: "user",
    post: "Security Specialist",
    department: "Security",
    joinDate: "2023-04-20",
  },
];

// Mock credentials
export const MOCK_CREDENTIALS: Record<string, string> = {
  "admin@amc.com": "admin123",
  "john@amc.com": "john123",
  "jane@amc.com": "jane123",
  "mike@amc.com": "mike123",
  "sarah@amc.com": "sarah123",
};

// Generate mock tasks
export const generateMockTasks = (): Task[] => {
  return ALL_TASK_DEFINITIONS.slice(0, 10).map((def, index) => {
    const status =
      index % 4 === 0
        ? "completed"
        : index % 3 === 0
          ? "in-progress"
          : "pending";

    const dueDate = getDefaultDueDate(def.category);

    return {
      id: `task-${index + 1}`,
      title: def.title,
      description: def.description,
      category: def.category,
      status: status,
      priority: index % 3 === 0 ? "high" : index % 2 === 0 ? "medium" : "low",
      assignedTo: index < 5 ? "2" : "3",
      assignedBy: "1",
      dueDate: dueDate.toISOString(),
      createdAt: new Date().toISOString(),
      estimatedTime: def.estimatedTime,
      completedAt: index % 4 === 0 ? new Date().toISOString() : undefined,
    };
  });
};

// Generate mock notifications
export const generateMockNotifications = (): Notification[] => {
  return [
    {
      id: "notif-1",
      title: "New Task Assigned",
      message: "AV Check task has been assigned to you",
      type: "task-assigned",
      priority: "medium",
      userId: "2",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif-2",
      title: "Task Reminder",
      message: "Network Connectivity check is due in 1 hour",
      type: "task-reminder",
      priority: "high",
      userId: "2",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];
};

// Generate mock remarks
export const generateMockRemarks = (): Remark[] => {
  return [
    {
      id: "remark-1",
      userId: "2",
      taskId: "task-1",
      message:
        "The AV system in conference room A is not responding. I've tried basic troubleshooting but it still doesn't work.",
      type: "issue",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      adminResponse:
        "Thank you for reporting this. I've contacted the AV vendor and they will visit tomorrow morning to fix the issue.",
      respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "remark-2",
      userId: "3",
      message:
        "I think we should implement automated backup verification instead of manual checks every month.",
      type: "suggestion",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "remark-3",
      userId: "4",
      taskId: "task-3",
      message:
        "The server room temperature monitoring is working well. No issues to report this week.",
      type: "feedback",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// LocalStorage availability check
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// In-memory storage fallback
let inMemoryUsersData: User[] | null = null;
let inMemoryTasksData: Task[] | null = null;
let inMemoryActivitiesData: unknown[] | null = null;
let inMemoryRemarksData: unknown[] | null = null;
let inMemoryCredentialsData: Record<string, string> | null = null;

// Check data size (approximate)
const getDataSize = (data: unknown): number => {
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
};

// Maximum localStorage size check (5MB limit is common)
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Mock data storage utilities
export const mockDataService = {
  // Initialize storage and check status
  initializeStorage: (): void => {
    const hasLocalStorage = isLocalStorageAvailable();
    console.log(
      `📦 Storage Status: ${hasLocalStorage ? "localStorage available" : "In-memory storage only"}`,
    );

    if (!hasLocalStorage) {
      console.log(
        "ℹ️ Running in limited storage mode (private browsing or storage disabled)",
      );
    }
  },
  // Users
  getUsers: (): User[] => {
    // Try localStorage first
    if (isLocalStorageAvailable()) {
      const stored = localStorage.getItem("amc_users");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // If parsing fails, fall back to in-memory or default
        }
      }
    }

    // Fall back to in-memory storage
    if (inMemoryUsersData) {
      return inMemoryUsersData;
    }

    // Return default mock data
    return MOCK_USERS;
  },

  saveUsers: (users: User[]): void => {
    // Validate input
    if (!Array.isArray(users)) {
      console.warn(
        "Invalid users data: expected array, falling back to in-memory storage",
      );
      return;
    }

    // Create a clean copy of users to avoid circular references
    const cleanUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      post: user.post,
      department: user.department,
      joinDate: user.joinDate,
      avatar: user.avatar,
    }));

    // First, always save to in-memory storage as backup
    inMemoryUsersData = [...cleanUsers];

    // Try to save to localStorage if available
    if (isLocalStorageAvailable()) {
      try {
        const serializedData = JSON.stringify(cleanUsers);

        // Check data size before attempting to save
        if (getDataSize(cleanUsers) > MAX_STORAGE_SIZE) {
          console.warn(
            "User data too large for localStorage, using in-memory storage only",
          );
          return;
        }

        localStorage.setItem("amc_users", serializedData);
        console.log("✅ Users data saved successfully to localStorage");
      } catch (error) {
        console.warn(
          "Failed to save users to localStorage, using in-memory storage:",
          error,
        );

        // Try to clear potentially corrupted data
        try {
          localStorage.removeItem("amc_users");
        } catch (clearError) {
          console.warn("Could not clear localStorage:", clearError);
        }
      }
    } else {
      console.log("🔄 localStorage not available, using in-memory storage");
    }
  },

  // Tasks
  getTasks: (): Task[] => {
    // Try localStorage first
    if (isLocalStorageAvailable()) {
      const stored = localStorage.getItem("amc_tasks");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Parsing failed, continue to fallback
        }
      }
    }

    // Try in-memory storage
    if (inMemoryTasksData) {
      return inMemoryTasksData;
    }

    // Generate and save default data
    const mockTasks = generateMockTasks();
    mockDataService.saveTasks(mockTasks);
    return mockTasks;
  },

  saveTasks: (tasks: Task[]): void => {
    if (!Array.isArray(tasks)) {
      console.warn("Invalid tasks data: expected array");
      return;
    }

    // Save to in-memory storage as backup
    inMemoryTasksData = [...tasks];

    // Try localStorage if available
    if (isLocalStorageAvailable()) {
      try {
        if (getDataSize(tasks) > MAX_STORAGE_SIZE) {
          console.warn(
            "Tasks data too large for localStorage, using in-memory storage only",
          );
          return;
        }
        localStorage.setItem("amc_tasks", JSON.stringify(tasks));
      } catch (error) {
        console.warn(
          "Failed to save tasks to localStorage, using in-memory storage:",
          error,
        );
        try {
          localStorage.removeItem("amc_tasks");
        } catch (clearError) {
          console.warn("Could not clear localStorage:", clearError);
        }
      }
    }
  },

  // Notifications
  getNotifications: (): Notification[] => {
    const stored = localStorage.getItem("amc_notifications");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        const mockNotifications = generateMockNotifications();
        mockDataService.saveNotifications(mockNotifications);
        return mockNotifications;
      }
    }
    const mockNotifications = generateMockNotifications();
    mockDataService.saveNotifications(mockNotifications);
    return mockNotifications;
  },

  saveNotifications: (notifications: Notification[]): void => {
    localStorage.setItem("amc_notifications", JSON.stringify(notifications));
  },

  // Remarks
  getRemarks: (): Remark[] => {
    const stored = localStorage.getItem("amc_remarks");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        const mockRemarks = generateMockRemarks();
        mockDataService.saveRemarks(mockRemarks);
        return mockRemarks;
      }
    }
    const mockRemarks = generateMockRemarks();
    mockDataService.saveRemarks(mockRemarks);
    return mockRemarks;
  },

  saveRemarks: (remarks: Remark[]): void => {
    localStorage.setItem("amc_remarks", JSON.stringify(remarks));
  },

  // Credentials
  getCredentials: (): Record<string, string> => {
    const stored = localStorage.getItem("amc_credentials");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return MOCK_CREDENTIALS;
      }
    }
    return MOCK_CREDENTIALS;
  },

  saveCredentials: (credentials: Record<string, string>): void => {
    localStorage.setItem("amc_credentials", JSON.stringify(credentials));
  },

  // Initialize all mock data
  initializeMockData: (): void => {
    if (!localStorage.getItem("amc_users")) {
      mockDataService.saveUsers(MOCK_USERS);
    }
    if (!localStorage.getItem("amc_credentials")) {
      mockDataService.saveCredentials(MOCK_CREDENTIALS);
    }
    // Tasks, notifications, and remarks are initialized when accessed
  },
};

// Initialize mock data on import
mockDataService.initializeMockData();
