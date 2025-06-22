# 🔄 Mock Data Migration Mapping

## Overview

This document describes how the mock data from your React frontend (`mockDataService.ts`) is mapped to the SQLite database tables.

---

## 📊 Field Mapping Details

### **1. USERS Table Mapping**

| Frontend Field | Database Column | Transformation                             | Notes                         |
| -------------- | --------------- | ------------------------------------------ | ----------------------------- |
| `id` (string)  | `id` (INTEGER)  | String ID mapped to auto-increment INTEGER | ID mapping stored for FK refs |
| `name`         | `full_name`     | Direct copy                                |                               |
| `email`        | `email`         | Direct copy                                |                               |
| `role`         | `role`          | Direct copy ("admin" \| "user")            |                               |
| `post`         | `department`    | Stored in department field                 |                               |
| `department`   | `department`    | Direct copy                                |                               |
| `joinDate`     | `created_at`    | Converted to ISO timestamp                 |                               |
| `email`        | `username`      | Username extracted from email (before @)   | For login compatibility       |
| (credentials)  | `password`      | Hashed with bcrypt (salt rounds: 12)       | From MOCK_CREDENTIALS         |

**Sample Mapping:**

```javascript
// Frontend Mock Data
{
  id: "1",
  name: "Admin User",
  email: "admin@amc.com",
  role: "admin",
  post: "System Administrator",
  department: "IT",
  joinDate: "2023-01-01"
}

// Database Record
{
  id: 1,
  username: "admin",
  password: "$2b$12$...", // bcrypt hash of "admin123"
  role: "admin",
  email: "admin@amc.com",
  full_name: "Admin User",
  department: "IT",
  created_at: "2023-01-01T00:00:00.000Z"
}
```

### **2. TASKS Table Mapping**

| Frontend Field  | Database Column   | Transformation                                  | Notes                 |
| --------------- | ----------------- | ----------------------------------------------- | --------------------- |
| `id` (string)   | `id` (INTEGER)    | String ID mapped to auto-increment INTEGER      | ID mapping stored     |
| `title`         | `title`           | Direct copy                                     |                       |
| `description`   | `description`     | Direct copy                                     |                       |
| `category`      | `tags`            | Stored as JSON array with frequency             |                       |
| `status`        | `status`          | Mapped: "in-progress" → "in_progress"           |                       |
| `priority`      | `priority`        | Direct copy ("low", "medium", "high", "urgent") |                       |
| `assignedTo`    | `assigned_to`     | String ID converted to INTEGER via mapping      | FK to users(id)       |
| `assignedBy`    | `created_by`      | String ID converted to INTEGER via mapping      | FK to users(id)       |
| `dueDate`       | `due_date`        | Direct copy (ISO timestamp)                     |                       |
| `createdAt`     | `created_at`      | Direct copy (ISO timestamp)                     |                       |
| `completedAt`   | `completed_at`    | Direct copy (ISO timestamp or null)             |                       |
| `estimatedTime` | `estimated_hours` | Converted from minutes to hours (÷ 60)          | Minutes → Hours       |
| `frequency`     | `tags`            | Combined with category in JSON array            | From task definitions |
| (generated)     | `location`        | Generated (Server Room, Office, null)           | Sample locations      |
| (generated)     | `equipment_id`    | Generated (EQ-1, EQ-2, etc.)                    | Sample equipment IDs  |

**Sample Mapping:**

```javascript
// Frontend Mock Data
{
  id: "task-1",
  title: "AV Check",
  description: "Check audio and video equipment functionality",
  category: "daily",
  status: "in-progress",
  priority: "medium",
  assignedTo: "2",
  assignedBy: "1",
  dueDate: "2024-06-22T09:00:00.000Z",
  estimatedTime: 15
}

// Database Record
{
  id: 1,
  title: "AV Check",
  description: "Check audio and video equipment functionality",
  status: "in_progress",
  priority: "medium",
  assigned_to: 2,
  created_by: 1,
  due_date: "2024-06-22T09:00:00.000Z",
  estimated_hours: 0.25,
  tags: '["daily", "Daily at 9:00 AM"]',
  location: "Server Room",
  equipment_id: "EQ-1"
}
```

### **3. ACTIVITIES Table Mapping**

| Frontend Field | Database Column | Transformation                                | Notes                                  |
| -------------- | --------------- | --------------------------------------------- | -------------------------------------- |
| (generated)    | `id`            | Auto-increment INTEGER                        | New IDs generated                      |
| (calculated)   | `task_id`       | Randomly assigned to migrated tasks           | FK to tasks(id), null for user actions |
| (calculated)   | `user_id`       | Randomly assigned to migrated users           | FK to users(id)                        |
| (generated)    | `action`        | Generated actions (login, task_created, etc.) | System activity types                  |
| (generated)    | `description`   | Generated descriptions for actions            | Human-readable activity descriptions   |
| (generated)    | `timestamp`     | Generated timestamps (last 7 days)            | Random times in past week              |
| (null)         | `old_value`     | Set to null                                   | Not used in mock data                  |
| (null)         | `new_value`     | Set to null                                   | Not used in mock data                  |

**Generated Activity Types:**

- `user_login` - User logged into the system
- `user_logout` - User logged out of the system
- `task_created` - New task was created
- `task_updated` - Task status was updated
- `task_completed` - Task was marked as completed
- `task_assigned` - Task was assigned to user
- `notification_sent` - Notification was sent to user
- `user_registered` - New user registered in the system

### **4. NOTIFICATIONS Table Mapping**

| Frontend Field | Database Column   | Transformation                               | Notes                  |
| -------------- | ----------------- | -------------------------------------------- | ---------------------- |
| `id` (string)  | `id` (INTEGER)    | String ID mapped to auto-increment INTEGER   | New IDs generated      |
| `userId`       | `user_id`         | String ID converted to INTEGER via mapping   | FK to users(id)        |
| `title`        | `title`           | Direct copy                                  |                        |
| `message`      | `message`         | Direct copy                                  |                        |
| `type`         | `type`            | Mapped notification types                    | See type mapping below |
| `read`         | `read_status`     | Boolean converted to INTEGER (0/1)           |                        |
| `createdAt`    | `timestamp`       | Direct copy (ISO timestamp)                  |                        |
| (calculated)   | `related_task_id` | Linked to migrated task IDs where applicable | FK to tasks(id)        |

**Notification Type Mapping:**

- `task-assigned` → `info`
- `task-reminder` → `warning`
- `task-overdue` → `warning`
- `system-alert` → `error`

**Sample Mapping:**

```javascript
// Frontend Mock Data
{
  id: "notif-1",
  title: "New Task Assigned",
  message: "AV Check task has been assigned to you",
  type: "task-assigned",
  userId: "2",
  read: false,
  createdAt: "2024-06-21T14:00:00.000Z"
}

// Database Record
{
  id: 1,
  user_id: 2,
  title: "New Task Assigned",
  message: "AV Check task has been assigned to you",
  type: "info",
  read_status: 0,
  related_task_id: 1,
  timestamp: "2024-06-21T14:00:00.000Z"
}
```

---

## 🔗 Relationship Mapping

### **Foreign Key Relationships**

1. **tasks.assigned_to** → **users.id**

   - Frontend `assignedTo` (string) mapped to database user ID (integer)

2. **tasks.created_by** → **users.id**

   - Frontend `assignedBy` (string) mapped to database user ID (integer)

3. **activities.task_id** → **tasks.id**

   - Generated activities linked to migrated tasks

4. **activities.user_id** → **users.id**

   - Generated activities linked to migrated users

5. **notifications.user_id** → **users.id**

   - Frontend `userId` (string) mapped to database user ID (integer)

6. **notifications.related_task_id** → **tasks.id**
   - Task-related notifications linked to migrated tasks

### **ID Mapping Strategy**

The migration maintains mapping tables to convert string IDs to integer IDs:

```javascript
// User ID Mapping
userIdMapping: Map {
  "1" => 1,  // Admin User
  "2" => 2,  // John Doe
  "3" => 3,  // Jane Smith
  "4" => 4,  // Mike Johnson
  "5" => 5   // Sarah Wilson
}

// Task ID Mapping
taskIdMapping: Map {
  "task-1" => 1,  // AV Check
  "task-2" => 2,  // OS Update and Activation
  "task-3" => 3,  // MS Office Activation
  // ... etc
}
```

---

## 🚀 Migration Process

### **Migration Steps**

1. **Users Migration**

   - Hash passwords with bcrypt
   - Extract usernames from emails
   - Store ID mappings for foreign key references

2. **Tasks Migration**

   - Use ID mappings for user references
   - Convert time estimates (minutes → hours)
   - Generate additional fields (location, equipment_id)

3. **Notifications Migration**

   - Map user IDs and task IDs
   - Convert boolean read status to integer
   - Link notifications to related tasks

4. **Activities Migration**

   - Generate realistic activity logs
   - Distribute activities across users and tasks
   - Create timestamps spanning last 7 days

5. **Comments Addition**
   - Add sample comments to demonstrate task discussion feature

### **Data Enhancements**

The migration adds fields not present in mock data:

- **Enhanced user info**: phone, department details
- **Task locations**: Server Room, Office, etc.
- **Equipment IDs**: EQ-1, EQ-2, etc.
- **Activity logging**: Comprehensive activity tracking
- **Task comments**: Sample discussion threads

---

## 📋 Migration Results

After successful migration, you'll have:

- ✅ **5 Users** with hashed passwords and proper roles
- ✅ **15 Tasks** with realistic assignments and due dates
- ✅ **5 Notifications** linked to users and tasks
- ✅ **25 Activities** showing system usage patterns
- ✅ **4 Comments** demonstrating task discussions

All data maintains referential integrity with proper foreign key relationships.
