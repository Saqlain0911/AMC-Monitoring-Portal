import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  uploadMultiple,
  handleUploadError,
  getFilesInfo,
} from "../middleware/upload.js";
import { taskValidation } from "../middleware/validation.js";
import database from "../database/database.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/tasks
 * Get all tasks with optional filtering
 */
router.get("/", taskValidation.query, async (req, res) => {
  try {
    const {
      status,
      assigned_to,
      created_by,
      priority,
      page = 1,
      limit = 20,
    } = req.query;
    const offset = (page - 1) * limit;

    // Build dynamic query
    let query = `
      SELECT
        t.*,
        creator.username as created_by_username,
        creator.full_name as created_by_name,
        assignee.username as assigned_to_username,
        assignee.full_name as assigned_to_name,
        (SELECT COUNT(*) FROM attachments WHERE task_id = t.id) as attachment_count,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE 1=1
    `;

    const params = [];

    // Apply filters
    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    if (assigned_to) {
      query += " AND t.assigned_to = ?";
      params.push(assigned_to);
    }

    if (created_by) {
      query += " AND t.created_by = ?";
      params.push(created_by);
    }

    if (priority) {
      query += " AND t.priority = ?";
      params.push(priority);
    }

    // If user is not admin, only show tasks they created or are assigned to
    if (req.user.role !== "admin") {
      query += " AND (t.created_by = ? OR t.assigned_to = ?)";
      params.push(req.user.id, req.user.id);
    }

    // Add ordering and pagination
    query += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const tasks = await database.all(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM tasks t WHERE 1=1";
    const countParams = [];

    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }
    if (assigned_to) {
      countQuery += " AND assigned_to = ?";
      countParams.push(assigned_to);
    }
    if (created_by) {
      countQuery += " AND created_by = ?";
      countParams.push(created_by);
    }
    if (priority) {
      countQuery += " AND priority = ?";
      countParams.push(priority);
    }
    if (req.user.role !== "admin") {
      countQuery += " AND (created_by = ? OR assigned_to = ?)";
      countParams.push(req.user.id, req.user.id);
    }

    const { total } = await database.get(countQuery, countParams);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      error: "Failed to fetch tasks",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * GET /api/tasks/:id
 * Get specific task by ID with attachments and comments
 */
router.get("/:id", taskValidation.getById, async (req, res) => {
  try {
    const { id } = req.params;

    // Get task with user details
    const task = await database.get(
      `
      SELECT
        t.*,
        creator.username as created_by_username,
        creator.full_name as created_by_name,
        assignee.username as assigned_to_username,
        assignee.full_name as assigned_to_name
      FROM tasks t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE t.id = ?
    `,
      [id],
    );

    if (!task) {
      return res.status(404).json({
        error: "Not Found",
        message: "Task not found",
        statusCode: 404,
      });
    }

    // Check permissions
    if (
      req.user.role !== "admin" &&
      task.created_by !== req.user.id &&
      task.assigned_to !== req.user.id
    ) {
      return res.status(403).json({
        error: "Access Forbidden",
        message: "You don't have permission to view this task",
        statusCode: 403,
      });
    }

    // Get attachments
    const attachments = await database.all(
      `
      SELECT
        a.*,
        u.username as uploaded_by_username,
        u.full_name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.task_id = ?
      ORDER BY a.uploaded_at DESC
    `,
      [id],
    );

    // Get comments
    const comments = await database.all(
      `
      SELECT
        c.*,
        u.username,
        u.full_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `,
      [id],
    );

    res.json({
      task,
      attachments,
      comments,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      error: "Failed to fetch task",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * POST /api/tasks
 * Create new task with optional file uploads
 */
router.post(
  "/",
  uploadMultiple,
  handleUploadError,
  taskValidation.create,
  async (req, res) => {
    try {
      const {
        title,
        description,
        status = "pending",
        assigned_to,
        priority = "medium",
        due_date,
        tags,
        location,
        equipment_id,
      } = req.body;

      // Validation is now handled by middleware

      // Validate assigned_to user exists
      if (assigned_to) {
        const assignee = await database.get(
          "SELECT id FROM users WHERE id = ?",
          [assigned_to],
        );
        if (!assignee) {
          return res.status(400).json({
            error: "Validation Error",
            message: "Assigned user not found",
            statusCode: 400,
          });
        }
      }

      // Create task
      const taskResult = await database.run(
        `
      INSERT INTO tasks (
        title, description, status, assigned_to, created_by,
        priority, due_date, tags, location, equipment_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
          title,
          description,
          status,
          assigned_to,
          req.user.id,
          priority,
          due_date,
          tags,
          location,
          equipment_id,
        ],
      );

      const taskId = taskResult.id;

      // Handle file uploads
      const attachments = [];
      if (req.files && req.files.length > 0) {
        const filesInfo = getFilesInfo(req.files);

        for (const file of filesInfo) {
          const attachmentResult = await database.run(
            `
          INSERT INTO attachments (
            task_id, file_name, file_path, file_size, file_type, uploaded_by
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
            [
              taskId,
              file.originalName,
              file.path,
              file.size,
              file.mimetype,
              req.user.id,
            ],
          );

          attachments.push({
            id: attachmentResult.id,
            file_name: file.originalName,
            file_size: file.size,
            file_type: file.mimetype,
          });
        }
      }

      // Log activity
      await database.run(
        "INSERT INTO activities (task_id, user_id, action, description) VALUES (?, ?, ?, ?)",
        [taskId, req.user.id, "task_created", `Task "${title}" created`],
      );

      // Create notification for assigned user
      if (assigned_to && assigned_to !== req.user.id) {
        await database.run(
          `
        INSERT INTO notifications (
          user_id, title, message, type, related_task_id
        ) VALUES (?, ?, ?, ?, ?)
      `,
          [
            assigned_to,
            "New Task Assigned",
            `You have been assigned a new task: "${title}"`,
            "info",
            taskId,
          ],
        );
      }

      // Get the created task with user details
      const createdTask = await database.get(
        `
      SELECT
        t.*,
        creator.username as created_by_username,
        creator.full_name as created_by_name,
        assignee.username as assigned_to_username,
        assignee.full_name as assigned_to_name
      FROM tasks t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE t.id = ?
    `,
        [taskId],
      );

      res.status(201).json({
        message: "Task created successfully",
        task: createdTask,
        attachments,
      });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({
        error: "Failed to create task",
        message: error.message,
        statusCode: 500,
      });
    }
  },
);

/**
 * PUT /api/tasks/:id
 * Update existing task with optional file uploads
 */
router.put(
  "/:id",
  uploadMultiple,
  handleUploadError,
  taskValidation.update,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        status,
        assigned_to,
        priority,
        due_date,
        tags,
        location,
        equipment_id,
      } = req.body;

      // Get existing task
      const existingTask = await database.get(
        "SELECT * FROM tasks WHERE id = ?",
        [id],
      );

      if (!existingTask) {
        return res.status(404).json({
          error: "Not Found",
          message: "Task not found",
          statusCode: 404,
        });
      }

      // Check permissions
      if (
        req.user.role !== "admin" &&
        existingTask.created_by !== req.user.id &&
        existingTask.assigned_to !== req.user.id
      ) {
        return res.status(403).json({
          error: "Access Forbidden",
          message: "You don't have permission to update this task",
          statusCode: 403,
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = [
          "pending",
          "in_progress",
          "completed",
          "cancelled",
          "on_hold",
        ];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            error: "Validation Error",
            message: `Status must be one of: ${validStatuses.join(", ")}`,
            statusCode: 400,
          });
        }
      }

      // Validate priority if provided
      if (priority) {
        const validPriorities = ["low", "medium", "high", "urgent"];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({
            error: "Validation Error",
            message: `Priority must be one of: ${validPriorities.join(", ")}`,
            statusCode: 400,
          });
        }
      }

      // Build update query
      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push("title = ?");
        params.push(title);
      }
      if (description !== undefined) {
        updates.push("description = ?");
        params.push(description);
      }
      if (status !== undefined) {
        updates.push("status = ?");
        params.push(status);

        // Set completed_at if status is completed
        if (status === "completed") {
          updates.push("completed_at = CURRENT_TIMESTAMP");
        }
      }
      if (assigned_to !== undefined) {
        updates.push("assigned_to = ?");
        params.push(assigned_to);
      }
      if (priority !== undefined) {
        updates.push("priority = ?");
        params.push(priority);
      }
      if (due_date !== undefined) {
        updates.push("due_date = ?");
        params.push(due_date);
      }
      if (tags !== undefined) {
        updates.push("tags = ?");
        params.push(tags);
      }
      if (location !== undefined) {
        updates.push("location = ?");
        params.push(location);
      }
      if (equipment_id !== undefined) {
        updates.push("equipment_id = ?");
        params.push(equipment_id);
      }

      if (updates.length === 0 && (!req.files || req.files.length === 0)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "No updates provided",
          statusCode: 400,
        });
      }

      // Update task if there are field updates
      if (updates.length > 0) {
        updates.push("updated_at = CURRENT_TIMESTAMP");
        params.push(id);

        await database.run(
          `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`,
          params,
        );
      }

      // Handle new file uploads
      const newAttachments = [];
      if (req.files && req.files.length > 0) {
        const filesInfo = getFilesInfo(req.files);

        for (const file of filesInfo) {
          const attachmentResult = await database.run(
            `
          INSERT INTO attachments (
            task_id, file_name, file_path, file_size, file_type, uploaded_by
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
            [
              id,
              file.originalName,
              file.path,
              file.size,
              file.mimetype,
              req.user.id,
            ],
          );

          newAttachments.push({
            id: attachmentResult.id,
            file_name: file.originalName,
            file_size: file.size,
            file_type: file.mimetype,
          });
        }
      }

      // Log activity
      const changes = Object.keys(req.body).filter(
        (key) => req.body[key] !== undefined,
      );
      if (changes.length > 0 || newAttachments.length > 0) {
        const changeDescription =
          changes.length > 0
            ? `Updated fields: ${changes.join(", ")}`
            : "Added attachments";

        await database.run(
          "INSERT INTO activities (task_id, user_id, action, description) VALUES (?, ?, ?, ?)",
          [id, req.user.id, "task_updated", changeDescription],
        );
      }

      // Create notifications for status changes
      if (status && status !== existingTask.status) {
        const notificationUsers = [
          existingTask.created_by,
          existingTask.assigned_to,
        ].filter((userId) => userId && userId !== req.user.id);

        for (const userId of [...new Set(notificationUsers)]) {
          await database.run(
            `
          INSERT INTO notifications (
            user_id, title, message, type, related_task_id
          ) VALUES (?, ?, ?, ?, ?)
        `,
            [
              userId,
              "Task Status Updated",
              `Task "${existingTask.title}" status changed to ${status}`,
              "info",
              id,
            ],
          );
        }
      }

      // Get updated task
      const updatedTask = await database.get(
        `
      SELECT
        t.*,
        creator.username as created_by_username,
        creator.full_name as created_by_name,
        assignee.username as assigned_to_username,
        assignee.full_name as assigned_to_name
      FROM tasks t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE t.id = ?
    `,
        [id],
      );

      res.json({
        message: "Task updated successfully",
        task: updatedTask,
        newAttachments,
      });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({
        error: "Failed to update task",
        message: error.message,
        statusCode: 500,
      });
    }
  },
);

/**
 * DELETE /api/tasks/:id
 * Delete task (admin only or task creator)
 */
router.delete("/:id", taskValidation.delete, async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing task
    const existingTask = await database.get(
      "SELECT * FROM tasks WHERE id = ?",
      [id],
    );

    if (!existingTask) {
      return res.status(404).json({
        error: "Not Found",
        message: "Task not found",
        statusCode: 404,
      });
    }

    // Check permissions (admin or task creator)
    if (req.user.role !== "admin" && existingTask.created_by !== req.user.id) {
      return res.status(403).json({
        error: "Access Forbidden",
        message: "You don't have permission to delete this task",
        statusCode: 403,
      });
    }

    // Delete task (cascade will handle related records)
    await database.run("DELETE FROM tasks WHERE id = ?", [id]);

    // Log activity
    await database.run(
      "INSERT INTO activities (task_id, user_id, action, description) VALUES (?, ?, ?, ?)",
      [
        null,
        req.user.id,
        "task_deleted",
        `Task "${existingTask.title}" deleted`,
      ],
    );

    res.json({
      message: "Task deleted successfully",
      deletedTask: {
        id: existingTask.id,
        title: existingTask.title,
      },
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      error: "Failed to delete task",
      message: error.message,
      statusCode: 500,
    });
  }
});

export default router;
