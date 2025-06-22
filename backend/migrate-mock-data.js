#!/usr/bin/env node

// Mock Data Migration Script for AMC Portal
// Migrates data from frontend mockDataService.ts to SQLite database

import database from "./database/database.js";
import bcrypt from "bcrypt";

// Mock data structures (extracted from frontend)
const MOCK_USERS = [
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

const MOCK_CREDENTIALS = {
  "admin@amc.com": "admin123",
  "john@amc.com": "john123",
  "jane@amc.com": "jane123",
  "mike@amc.com": "mike123",
  "sarah@amc.com": "sarah123",
};

// Task definitions (from frontend)
const DAILY_TASKS = [
  {
    id: "dt-001",
    title: "AV Check",
    description: "Check audio and video equipment functionality",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 9:00 AM",
  },
  {
    id: "dt-002",
    title: "OS Update and Activation",
    description: "Check and install operating system updates",
    category: "daily",
    estimatedTime: 30,
    frequency: "Daily at 10:00 AM",
  },
  {
    id: "dt-003",
    title: "MS Office Activation",
    description: "Verify Microsoft Office licensing and activation status",
    category: "daily",
    estimatedTime: 10,
    frequency: "Daily at 11:00 AM",
  },
  {
    id: "dt-004",
    title: "Hardware Status Check",
    description: "Check CPU, Monitor, Keyboard functionality",
    category: "daily",
    estimatedTime: 20,
    frequency: "Daily at 2:00 PM",
  },
  {
    id: "dt-005",
    title: "Network Connectivity",
    description: "Test internet and internal network connectivity",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 3:00 PM",
  },
  {
    id: "dt-006",
    title: "Cameras and Recordings",
    description: "Check surveillance cameras and recording systems",
    category: "daily",
    estimatedTime: 25,
    frequency: "Daily at 4:00 PM",
  },
  {
    id: "dt-007",
    title: "UPS Check",
    description: "Verify UPS battery status and functionality",
    category: "daily",
    estimatedTime: 10,
    frequency: "Daily at 5:00 PM",
  },
  {
    id: "dt-008",
    title: "AC Operational Status",
    description: "Check air conditioning system operation",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 6:00 PM",
  },
];

const WEEKLY_TASKS = [
  {
    id: "wt-001",
    title: "VC Room Inspection",
    description: "Complete inspection of video conferencing rooms",
    category: "weekly",
    estimatedTime: 45,
    frequency: "Every Monday at 10:00 AM",
  },
  {
    id: "wt-002",
    title: "Software Applications Check",
    description: "Verify PDF readers, VLC, and other important applications",
    category: "weekly",
    estimatedTime: 30,
    frequency: "Every Tuesday at 2:00 PM",
  },
  {
    id: "wt-003",
    title: "Cable Inspection",
    description: "Inspect cables, fiber, power cables, network switches",
    category: "weekly",
    estimatedTime: 60,
    frequency: "Every Wednesday at 9:00 AM",
  },
];

const MONTHLY_TASKS = [
  {
    id: "mt-001",
    title: "Firewall Check",
    description:
      "Comprehensive firewall security audit and configuration review",
    category: "monthly",
    estimatedTime: 120,
    frequency: "First Monday of every month",
  },
  {
    id: "mt-002",
    title: "Backup and Recovery",
    description: "Test backup systems and recovery procedures",
    category: "monthly",
    estimatedTime: 180,
    frequency: "Second Tuesday of every month",
  },
];

// Generate mock tasks based on task definitions
function generateMockTasks() {
  const allTaskDefs = [...DAILY_TASKS, ...WEEKLY_TASKS, ...MONTHLY_TASKS];
  return allTaskDefs.slice(0, 15).map((def, index) => {
    const statusOptions = ["pending", "in_progress", "completed", "on_hold"];
    const status =
      index % 4 === 0
        ? "completed"
        : index % 3 === 0
          ? "in_progress"
          : "pending";

    const priorityOptions = ["low", "medium", "high", "urgent"];
    const priority =
      index % 3 === 0 ? "high" : index % 2 === 0 ? "medium" : "low";

    // Create due dates (some past, some future)
    const daysOffset = index % 5 === 0 ? -2 : index % 3 === 0 ? 1 : 3;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOffset);

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 7));

    return {
      id: `task-${index + 1}`,
      title: def.title,
      description: def.description,
      category: def.category,
      status: status,
      priority: priority,
      assignedTo: (index % 4) + 2, // Assign to users 2-5
      assignedBy: 1, // Admin assigns all tasks
      dueDate: dueDate.toISOString(),
      createdAt: createdDate.toISOString(),
      estimatedTime: def.estimatedTime,
      completedAt: status === "completed" ? new Date().toISOString() : null,
      frequency: def.frequency,
      equipment_id: index % 3 === 0 ? `EQ-${index + 1}` : null,
      location:
        index % 2 === 0 ? "Server Room" : index % 3 === 0 ? "Office" : null,
    };
  });
}

// Generate mock notifications
function generateMockNotifications() {
  return [
    {
      id: "notif-1",
      title: "New Task Assigned",
      message: "AV Check task has been assigned to you",
      type: "info",
      priority: "medium",
      userId: 2,
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      related_task_id: 1,
    },
    {
      id: "notif-2",
      title: "Task Reminder",
      message: "Network Connectivity check is due in 1 hour",
      type: "warning",
      priority: "high",
      userId: 2,
      read: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      related_task_id: 5,
    },
    {
      id: "notif-3",
      title: "Task Completed",
      message: "Hardware Status Check has been completed",
      type: "success",
      priority: "low",
      userId: 3,
      read: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      related_task_id: 4,
    },
    {
      id: "notif-4",
      title: "System Alert",
      message: "Server room temperature is above normal",
      type: "error",
      priority: "high",
      userId: 1,
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "notif-5",
      title: "Task Overdue",
      message: "UPS Check task is overdue",
      type: "warning",
      priority: "high",
      userId: 4,
      read: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      related_task_id: 7,
    },
  ];
}

// Generate mock activities
function generateMockActivities() {
  const activities = [];
  const actions = [
    "user_login",
    "user_logout",
    "task_created",
    "task_updated",
    "task_completed",
    "task_assigned",
    "notification_sent",
    "user_registered",
  ];

  const descriptions = {
    user_login: "User logged into the system",
    user_logout: "User logged out of the system",
    task_created: "New task was created",
    task_updated: "Task status was updated",
    task_completed: "Task was marked as completed",
    task_assigned: "Task was assigned to user",
    notification_sent: "Notification was sent to user",
    user_registered: "New user registered in the system",
  };

  // Generate activities for the last 7 days
  for (let i = 0; i < 25; i++) {
    const randomUser = Math.floor(Math.random() * 5) + 1;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomTask =
      randomAction.includes("task") && Math.random() > 0.3
        ? Math.floor(Math.random() * 15) + 1
        : null;

    const activityDate = new Date();
    activityDate.setTime(
      activityDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    );

    activities.push({
      id: i + 1,
      task_id: randomTask,
      user_id: randomUser,
      action: randomAction,
      description: descriptions[randomAction],
      timestamp: activityDate.toISOString(),
      old_value: null,
      new_value: null,
    });
  }

  return activities;
}

// Migration functions
class MockDataMigrator {
  constructor() {
    this.userIdMapping = new Map(); // Maps old string IDs to new integer IDs
    this.taskIdMapping = new Map(); // Maps old string IDs to new integer IDs
  }

  async migrateUsers() {
    console.log("🔄 Migrating users...");

    try {
      for (const user of MOCK_USERS) {
        // Hash password
        const password = MOCK_CREDENTIALS[user.email] || "defaultpass123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Map frontend role to database role
        const role = user.role === "admin" ? "admin" : "user";

        // Create username from email (before @)
        const username = user.email.split("@")[0];

        const result = await database.run(
          `
          INSERT INTO users (
            username, password, role, email, full_name, phone, department, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            username,
            hashedPassword,
            role,
            user.email,
            user.name,
            null, // phone not in mock data
            user.department,
            new Date(user.joinDate).toISOString(),
          ],
        );

        // Store ID mapping
        this.userIdMapping.set(user.id, result.id);
        console.log(
          `   ✅ Migrated user: ${user.name} (${user.id} → ${result.id})`,
        );
      }

      console.log(`✅ Successfully migrated ${MOCK_USERS.length} users`);
    } catch (error) {
      console.error("❌ User migration failed:", error);
      throw error;
    }
  }

  async migrateTasks() {
    console.log("\n🔄 Migrating tasks...");

    try {
      const mockTasks = generateMockTasks();

      for (const task of mockTasks) {
        // Map user IDs
        const assignedTo = this.userIdMapping.get(task.assignedTo.toString());
        const createdBy = this.userIdMapping.get(task.assignedBy.toString());

        // Map priority
        const priorityMap = {
          low: "low",
          medium: "medium",
          high: "high",
          urgent: "urgent",
        };

        // Map status
        const statusMap = {
          pending: "pending",
          "in-progress": "in_progress",
          completed: "completed",
          overdue: "on_hold", // Map overdue to on_hold for now
        };

        const result = await database.run(
          `
          INSERT INTO tasks (
            title, description, status, priority, assigned_to, created_by,
            due_date, completed_at, estimated_hours, tags, location, equipment_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            task.title,
            task.description,
            statusMap[task.status] || "pending",
            priorityMap[task.priority] || "medium",
            assignedTo,
            createdBy,
            task.dueDate,
            task.completedAt,
            Math.round((task.estimatedTime / 60) * 100) / 100, // Convert minutes to hours
            JSON.stringify([task.category, task.frequency]), // Store as JSON
            task.location,
            task.equipment_id,
          ],
        );

        // Store ID mapping
        this.taskIdMapping.set(task.id, result.id);
        console.log(
          `   ✅ Migrated task: ${task.title} (${task.id} → ${result.id})`,
        );
      }

      console.log(`✅ Successfully migrated ${mockTasks.length} tasks`);
    } catch (error) {
      console.error("❌ Task migration failed:", error);
      throw error;
    }
  }

  async migrateNotifications() {
    console.log("\n🔄 Migrating notifications...");

    try {
      const mockNotifications = generateMockNotifications();

      for (const notification of mockNotifications) {
        // Map user ID
        const userId = this.userIdMapping.get(notification.userId.toString());

        // Map task ID if exists
        const relatedTaskId = notification.related_task_id
          ? this.taskIdMapping.get(`task-${notification.related_task_id}`)
          : null;

        // Map type
        const typeMap = {
          "task-assigned": "info",
          "task-reminder": "warning",
          "task-overdue": "warning",
          "system-alert": "error",
        };

        const result = await database.run(
          `
          INSERT INTO notifications (
            user_id, title, message, type, read_status, related_task_id, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            userId,
            notification.title,
            notification.message,
            notification.type,
            notification.read ? 1 : 0,
            relatedTaskId,
            notification.createdAt,
          ],
        );

        console.log(
          `   ✅ Migrated notification: ${notification.title} (→ ${result.id})`,
        );
      }

      console.log(
        `✅ Successfully migrated ${mockNotifications.length} notifications`,
      );
    } catch (error) {
      console.error("❌ Notification migration failed:", error);
      throw error;
    }
  }

  async migrateActivities() {
    console.log("\n🔄 Migrating activities...");

    try {
      const mockActivities = generateMockActivities();

      for (const activity of mockActivities) {
        // Map user ID
        const userId = this.userIdMapping.get(activity.user_id.toString());

        // Map task ID if exists
        const taskId = activity.task_id
          ? this.taskIdMapping.get(`task-${activity.task_id}`)
          : null;

        // Skip if taskId is null (to avoid NOT NULL constraint error)
        if (taskId == null) {
          console.warn(
            `   ⚠️  Skipping activity "${activity.action}" (id: ${activity.id}) because task_id is null`
          );
          continue;
        }

        const result = await database.run(
          `
          INSERT INTO activities (
            task_id, user_id, action, description, timestamp, old_value, new_value
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            taskId,
            userId,
            activity.action,
            activity.description,
            activity.timestamp,
            activity.old_value,
            activity.new_value,
          ],
        );

        console.log(
          `   ✅ Migrated activity: ${activity.action} (→ ${result.id})`,
        );
      }

      console.log(
        `✅ Successfully migrated activities with valid task_id`,
      );
    } catch (error) {
      console.error("❌ Activity migration failed:", error);
      throw error;
    }
  }

  async addMigrationComment() {
    console.log("\n📝 Adding migration comments...");

    try {
      // Add some sample comments to tasks
      const sampleComments = [
        {
          task_id: 1,
          user_id: this.userIdMapping.get("2"),
          comment:
            "Completed AV check. Found issue with microphone in Conference Room A. Will schedule repair.",
        },
        {
          task_id: 1,
          user_id: this.userIdMapping.get("1"),
          comment:
            "Thanks for the update. Please create a separate task for the microphone repair.",
        },
        {
          task_id: 4,
          user_id: this.userIdMapping.get("3"),
          comment: "All hardware is functioning normally. No issues detected.",
        },
        {
          task_id: 7,
          user_id: this.userIdMapping.get("4"),
          comment: "UPS battery level is at 95%. System is working properly.",
        },
      ];

      for (const comment of sampleComments) {
        const result = await database.run(
          `
          INSERT INTO comments (task_id, user_id, comment)
          VALUES (?, ?, ?)
        `,
          [comment.task_id, comment.user_id, comment.comment],
        );

        console.log(`   ✅ Added comment to task ${comment.task_id}`);
      }

      console.log(`✅ Successfully added ${sampleComments.length} comments`);
    } catch (error) {
      console.error("❌ Comment migration failed:", error);
      throw error;
    }
  }

  async generateMigrationReport() {
    console.log("\n📊 MIGRATION REPORT");
    console.log("=" + "=".repeat(50));

    try {
      const stats = await database.getStats();

      console.log("\n📈 Database Statistics After Migration:");
      Object.entries(stats).forEach(([table, count]) => {
        console.log(`   ${table}: ${count} records`);
      });

      console.log("\n🔄 ID Mappings:");
      console.log("   User ID Mappings:");
      for (const [oldId, newId] of this.userIdMapping) {
        const user = MOCK_USERS.find((u) => u.id === oldId);
        console.log(`      ${user?.name} (${oldId} → ${newId})`);
      }

      console.log("\n   Task ID Mappings:");
      for (const [oldId, newId] of this.taskIdMapping) {
        console.log(`      ${oldId} → ${newId}`);
      }

      console.log("\n✅ MIGRATION COMPLETED SUCCESSFULLY!");
      console.log("\nNext Steps:");
      console.log("1. Update frontend to use new API endpoints");
      console.log("2. Test authentication with migrated users");
      console.log("3. Verify task assignments and notifications");
      console.log(
        "4. Update frontend user interface to match new data structure",
      );
    } catch (error) {
      console.error("❌ Report generation failed:", error);
    }
  }
}

// Main migration function
async function runMigration() {
  console.log("🚀 AMC Portal Mock Data Migration");
  console.log("=" + "=".repeat(50));
  console.log("Migrating mock data from frontend to SQLite database...\n");

  try {
    // Initialize database
    await database.initialize();

    // Clear existing data (optional - comment out to preserve existing data)
    console.log("🗑️  Clearing existing data...");
    await database.reset();

    // Create migrator instance
    const migrator = new MockDataMigrator();

    // Run migrations in order
    await migrator.migrateUsers();
    await migrator.migrateTasks();
    await migrator.migrateNotifications();
    await migrator.migrateActivities();
    await migrator.addMigrationComment();

    // Generate report
    await migrator.generateMigrationReport();
  } catch (error) {
    console.error("\n❌ MIGRATION FAILED:", error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(console.error);
}

export default {
  runMigration,
  MockDataMigrator,
  MOCK_USERS,
  generateMockTasks,
  generateMockNotifications,
  generateMockActivities,
};
