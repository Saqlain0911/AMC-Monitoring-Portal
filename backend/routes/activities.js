import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { activityValidation } from "../middleware/validation.js";
import database from "../database/database.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/activities
 * Get all activity logs with filtering and pagination
 */
router.get("/", activityValidation.query, async (req, res) => {
  try {
    const {
      task_id,
      user_id,
      action,
      page = 1,
      limit = 50,
      start_date,
      end_date,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build dynamic query
    let query = `
      SELECT
        a.*,
        u.username,
        u.full_name,
        t.title as task_title
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN tasks t ON a.task_id = t.id
      WHERE 1=1
    `;

    const params = [];

    // Apply filters
    if (task_id) {
      query += " AND a.task_id = ?";
      params.push(task_id);
    }

    if (user_id) {
      query += " AND a.user_id = ?";
      params.push(user_id);
    }

    if (action) {
      query += " AND a.action = ?";
      params.push(action);
    }

    if (start_date) {
      query += " AND a.timestamp >= ?";
      params.push(start_date);
    }

    if (end_date) {
      query += " AND a.timestamp <= ?";
      params.push(end_date);
    }

    // If user is not admin, only show activities for tasks they're involved with
    if (req.user.role !== "admin") {
      query += ` AND (
        a.user_id = ? OR
        a.task_id IN (
          SELECT id FROM tasks
          WHERE created_by = ? OR assigned_to = ?
        ) OR
        a.task_id IS NULL
      )`;
      params.push(req.user.id, req.user.id, req.user.id);
    }

    // Add ordering and pagination
    query += " ORDER BY a.timestamp DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const activities = await database.all(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM activities a
      LEFT JOIN tasks t ON a.task_id = t.id
      WHERE 1=1
    `;
    const countParams = [];

    if (task_id) {
      countQuery += " AND a.task_id = ?";
      countParams.push(task_id);
    }
    if (user_id) {
      countQuery += " AND a.user_id = ?";
      countParams.push(user_id);
    }
    if (action) {
      countQuery += " AND a.action = ?";
      countParams.push(action);
    }
    if (start_date) {
      countQuery += " AND a.timestamp >= ?";
      countParams.push(start_date);
    }
    if (end_date) {
      countQuery += " AND a.timestamp <= ?";
      countParams.push(end_date);
    }

    if (req.user.role !== "admin") {
      countQuery += ` AND (
        a.user_id = ? OR
        a.task_id IN (
          SELECT id FROM tasks
          WHERE created_by = ? OR assigned_to = ?
        ) OR
        a.task_id IS NULL
      )`;
      countParams.push(req.user.id, req.user.id, req.user.id);
    }

    const { total } = await database.get(countQuery, countParams);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({
      error: "Failed to fetch activities",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * GET /api/activities/summary
 * Get activity summary statistics
 */
router.get("/summary", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get activity counts by action type
    let actionQuery = `
      SELECT
        action,
        COUNT(*) as count
      FROM activities
      WHERE timestamp >= ?
    `;
    const actionParams = [startDate.toISOString()];

    if (req.user.role !== "admin") {
      actionQuery += ` AND (
        user_id = ? OR
        task_id IN (
          SELECT id FROM tasks
          WHERE created_by = ? OR assigned_to = ?
        ) OR
        task_id IS NULL
      )`;
      actionParams.push(req.user.id, req.user.id, req.user.id);
    }

    actionQuery += " GROUP BY action ORDER BY count DESC";

    const actionCounts = await database.all(actionQuery, actionParams);

    // Get daily activity counts
    let dailyQuery = `
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM activities
      WHERE timestamp >= ?
    `;
    const dailyParams = [startDate.toISOString()];

    if (req.user.role !== "admin") {
      dailyQuery += ` AND (
        user_id = ? OR
        task_id IN (
          SELECT id FROM tasks
          WHERE created_by = ? OR assigned_to = ?
        ) OR
        task_id IS NULL
      )`;
      dailyParams.push(req.user.id, req.user.id, req.user.id);
    }

    dailyQuery += " GROUP BY DATE(timestamp) ORDER BY date DESC";

    const dailyActivity = await database.all(dailyQuery, dailyParams);

    // Get most active users
    let userQuery = `
      SELECT
        u.username,
        u.full_name,
        COUNT(*) as activity_count
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.timestamp >= ?
    `;
    const userParams = [startDate.toISOString()];

    if (req.user.role !== "admin") {
      userQuery += ` AND (
        a.user_id = ? OR
        a.task_id IN (
          SELECT id FROM tasks
          WHERE created_by = ? OR assigned_to = ?
        ) OR
        a.task_id IS NULL
      )`;
      userParams.push(req.user.id, req.user.id, req.user.id);
    }

    userQuery += " GROUP BY u.id ORDER BY activity_count DESC LIMIT 10";

    const topUsers = await database.all(userQuery, userParams);

    res.json({
      summary: {
        period_days: parseInt(days),
        start_date: startDate.toISOString(),
        action_counts: actionCounts,
        daily_activity: dailyActivity,
        top_users: topUsers,
      },
    });
  } catch (error) {
    console.error("Get activity summary error:", error);
    res.status(500).json({
      error: "Failed to fetch activity summary",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * GET /api/activities/task/:taskId
 * Get activities for a specific task
 */
router.get(
  "/task/:taskId",
  activityValidation.getByTaskId,
  async (req, res) => {
    try {
      const { taskId } = req.params;

      // Check if task exists and user has permission
      const task = await database.get("SELECT * FROM tasks WHERE id = ?", [
        taskId,
      ]);

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
          message: "You don't have permission to view this task's activities",
          statusCode: 403,
        });
      }

      // Get activities for this task
      const activities = await database.all(
        `
      SELECT
        a.*,
        u.username,
        u.full_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.task_id = ?
      ORDER BY a.timestamp DESC
    `,
        [taskId],
      );

      res.json({
        task_id: parseInt(taskId),
        task_title: task.title,
        activities,
      });
    } catch (error) {
      console.error("Get task activities error:", error);
      res.status(500).json({
        error: "Failed to fetch task activities",
        message: error.message,
        statusCode: 500,
      });
    }
  },
);

/**
 * POST /api/activities
 * Create a new activity log entry (for manual logging)
 */
router.post("/", activityValidation.create, async (req, res) => {
  try {
    const { task_id, action, description, old_value, new_value } = req.body;

    // Validation is now handled by middleware

    // Validate task exists if task_id provided
    if (task_id) {
      const task = await database.get("SELECT * FROM tasks WHERE id = ?", [
        task_id,
      ]);

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
          message: "You don't have permission to log activities for this task",
          statusCode: 403,
        });
      }
    }

    // Create activity
    const result = await database.run(
      `
      INSERT INTO activities (
        task_id, user_id, action, description, old_value, new_value
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [task_id, req.user.id, action, description, old_value, new_value],
    );

    // Get the created activity
    const activity = await database.get(
      `
      SELECT
        a.*,
        u.username,
        u.full_name,
        t.title as task_title
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN tasks t ON a.task_id = t.id
      WHERE a.id = ?
    `,
      [result.id],
    );

    res.status(201).json({
      message: "Activity logged successfully",
      activity,
    });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({
      error: "Failed to create activity",
      message: error.message,
      statusCode: 500,
    });
  }
});

export default router;
