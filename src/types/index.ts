export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  post: string;
  department: string;
  joinDate: string;
  avatar?: string;
}

export type TaskCategory = "daily" | "weekly" | "monthly";

export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";

export type AlertPriority = "high" | "medium" | "low"; // red, orange, green

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: AlertPriority;
  assignedTo?: string;
  assignedBy?: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  estimatedTime: number; // in minutes
  actualTime?: number;
  remarks?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: "photo" | "screenshot" | "report" | "document";
  url: string;
  name: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "task-assigned" | "task-reminder" | "task-overdue" | "system-alert";
  priority: AlertPriority;
  userId: string;
  read: boolean;
  createdAt: string;
}

export interface Remark {
  id: string;
  userId: string;
  taskId?: string;
  message: string;
  type: "feedback" | "issue" | "suggestion";
  createdAt: string;
  adminResponse?: string;
  respondedAt?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  location: string;
  status: "operational" | "maintenance" | "faulty";
  lastServiceDate: string;
  nextServiceDate: string;
  serviceHistory: ServiceRecord[];
}

export interface ServiceRecord {
  id: string;
  date: string;
  type: "routine" | "repair" | "replacement";
  description: string;
  technician: string;
  cost?: number;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  complianceRate: number;
  activeUsers: number;
  criticalAlerts: number;
}

export interface ReportData {
  period: "daily" | "weekly" | "monthly";
  taskCompletion: {
    date: string;
    completed: number;
    total: number;
  }[];
  complianceData: {
    date: string;
    percentage: number;
  }[];
  incidentReports: {
    date: string;
    count: number;
    severity: AlertPriority;
  }[];
}
