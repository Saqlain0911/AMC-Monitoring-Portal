// API response types that match the backend
export interface ApiUser {
  id: number;
  username: string;
  role: "admin" | "user";
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ApiTask {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to?: number;
  created_by: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string;
  location?: string;
  equipment_id?: string;
  // Joined data
  created_by_username?: string;
  created_by_name?: string;
  assigned_to_username?: string;
  assigned_to_name?: string;
  attachment_count?: number;
  comment_count?: number;
}

export interface ApiActivity {
  id: number;
  task_id?: number;
  user_id: number;
  action: string;
  description?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
  // Joined data
  username?: string;
  full_name?: string;
  task_title?: string;
}

export interface ApiNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read_status: boolean;
  action_url?: string;
  related_task_id?: number;
  timestamp: string;
  expires_at?: string;
  // Joined data
  task_title?: string;
}

export interface ApiAttachment {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: number;
  uploaded_at: string;
  description?: string;
  // Joined data
  uploaded_by_username?: string;
  uploaded_by_name?: string;
}

export interface ApiComment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  // Joined data
  username?: string;
  full_name?: string;
}

// API Response wrappers
export interface LoginResponse {
  message: string;
  user: ApiUser;
  token: string;
  expiresIn: string;
}

export interface TasksResponse {
  tasks: ApiTask[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TaskDetailResponse {
  task: ApiTask;
  attachments: ApiAttachment[];
  comments: ApiComment[];
}

export interface NotificationsResponse {
  notifications: ApiNotification[];
  unread_count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ActivitiesResponse {
  activities: ApiActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Type converters from API types to frontend types
export const convertApiUserToUser = (apiUser: ApiUser) => ({
  id: apiUser.id.toString(),
  name: apiUser.full_name,
  email: apiUser.email,
  role: apiUser.role as "admin" | "user",
  post: apiUser.department || "",
  department: apiUser.department || "",
  joinDate: apiUser.created_at.split("T")[0],
  avatar: undefined,
});

export const convertApiTaskToTask = (apiTask: ApiTask) => ({
  id: apiTask.id.toString(),
  title: apiTask.title,
  description: apiTask.description,
  category: getTaskCategory(apiTask.tags),
  status: convertApiStatusToFrontend(apiTask.status),
  priority: apiTask.priority as "low" | "medium" | "high",
  assignedTo: apiTask.assigned_to?.toString(),
  assignedBy: apiTask.created_by.toString(),
  dueDate: apiTask.due_date || new Date().toISOString(),
  createdAt: apiTask.created_at,
  completedAt: apiTask.completed_at,
  estimatedTime: Math.round((apiTask.estimated_hours || 0) * 60), // Convert hours to minutes
  actualTime: Math.round((apiTask.actual_hours || 0) * 60),
  remarks: "",
  attachments: [],
});

export const convertApiNotificationToNotification = (
  apiNotification: ApiNotification,
) => ({
  id: apiNotification.id.toString(),
  title: apiNotification.title,
  message: apiNotification.message,
  type: mapNotificationType(apiNotification.type),
  priority: "medium" as "low" | "medium" | "high",
  userId: apiNotification.user_id.toString(),
  read: apiNotification.read_status,
  createdAt: apiNotification.timestamp,
});

// Helper functions
function getTaskCategory(tags?: string): "daily" | "weekly" | "monthly" {
  if (!tags) return "daily";
  try {
    const tagArray = JSON.parse(tags);
    if (tagArray.includes("daily")) return "daily";
    if (tagArray.includes("weekly")) return "weekly";
    if (tagArray.includes("monthly")) return "monthly";
  } catch {
    // Ignore parsing errors
  }
  return "daily";
}

function convertApiStatusToFrontend(
  status: string,
): "pending" | "in-progress" | "completed" | "overdue" {
  switch (status) {
    case "in_progress":
      return "in-progress";
    case "completed":
      return "completed";
    case "on_hold":
      return "overdue"; // Map on_hold to overdue for frontend
    default:
      return "pending";
  }
}

function mapNotificationType(
  type: string,
): "task-assigned" | "task-reminder" | "task-overdue" | "system-alert" {
  switch (type) {
    case "info":
      return "task-assigned";
    case "warning":
      return "task-reminder";
    case "error":
      return "system-alert";
    case "success":
      return "task-assigned";
    default:
      return "task-assigned";
  }
}
