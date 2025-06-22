import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { notificationValidation } from "../middleware/validation.js";
import database from "../database/database.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
router.get("/", notificationValidation.query, async (req, res) => {
  try {
    const {
      read_status,
      type,
      page = 1,
      limit = 20,
      include_expired = false,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query for user's notifications
    let query = `
      SELECT
        n.*,
        t.title as task_title
      FROM notifications n
      LEFT JOIN tasks t ON n.related_task_id = t.id
      WHERE n.user_id = ?
    `;

    const params = [req.user.id];

    // Apply filters
    if (read_status !== undefined) {
      query += " AND n.read_status = ?";
      params.push(read_status === "true" ? 1 : 0);
    }

    if (type) {
      query += " AND n.type = ?";
      params.push(type);
    }

    // Exclude expired notifications unless requested
    if (include_expired !== "true") {
      query +=
        " AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)";
    }

    // Add ordering and pagination
    query += " ORDER BY n.timestamp DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const notifications = await database.all(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM notifications n
      WHERE n.user_id = ?
    `;
    const countParams = [req.user.id];

    if (read_status !== undefined) {
      countQuery += " AND n.read_status = ?";
      countParams.push(read_status === "true" ? 1 : 0);
    }
    if (type) {
      countQuery += " AND n.type = ?";
      countParams.push(type);
    }
    if (include_expired !== "true") {
      countQuery +=
        " AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)";
    }

    const { total } = await database.get(countQuery, countParams);

    // Get unread count
    const { unread_count } = await database.get(
      `SELECT COUNT(*) as unread_count
       FROM notifications
       WHERE user_id = ? AND read_status = FALSE
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
      [req.user.id],
    );

    res.json({
      notifications,
      unread_count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      error: "Failed to fetch notifications",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * GET /api/notifications/unread
 * Get only unread notifications for the authenticated user
 */
router.get("/unread", async (req, res) => {
  try {
    const notifications = await database.all(
      `
      SELECT
        n.*,
        t.title as task_title
      FROM notifications n
      LEFT JOIN tasks t ON n.related_task_id = t.id
      WHERE n.user_id = ?
      AND n.read_status = FALSE
      AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)
      ORDER BY n.timestamp DESC
    `,
      [req.user.id],
    );

    res.json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Get unread notifications error:", error);
    res.status(500).json({
      error: "Failed to fetch unread notifications",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * PUT /api/notifications/:id
 * Mark a specific notification as read
 */
router.put("/:id", notificationValidation.update, async (req, res) => {
  try {
    const { id } = req.params;
    const { read_status } = req.body;

    // Get notification to verify ownership
    const notification = await database.get(
      "SELECT * FROM notifications WHERE id = ?",
      [id],
    );

    if (!notification) {
      return res.status(404).json({
        error: "Not Found",
        message: "Notification not found",
        statusCode: 404,
      });
    }

    // Check if user owns this notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        error: "Access Forbidden",
        message: "You don't have permission to modify this notification",
        statusCode: 403,
      });
    }

    // Update notification
    await database.run(
      "UPDATE notifications SET read_status = ? WHERE id = ?",
      [read_status !== undefined ? (read_status ? 1 : 0) : 1, id],
    );

    // Get updated notification
    const updatedNotification = await database.get(
      `
      SELECT
        n.*,
        t.title as task_title
      FROM notifications n
      LEFT JOIN tasks t ON n.related_task_id = t.id
      WHERE n.id = ?
    `,
      [id],
    );

    res.json({
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Update notification error:", error);
    res.status(500).json({
      error: "Failed to update notification",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.put("/mark-all-read", async (req, res) => {
  try {
    const result = await database.run(
      `UPDATE notifications
       SET read_status = TRUE
       WHERE user_id = ? AND read_status = FALSE`,
      [req.user.id],
    );

    res.json({
      message: "All notifications marked as read",
      updated_count: result.changes,
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      error: "Failed to mark notifications as read",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete("/:id", notificationValidation.delete, async (req, res) => {
  try {
    const { id } = req.params;

    // Get notification to verify ownership
    const notification = await database.get(
      "SELECT * FROM notifications WHERE id = ?",
      [id],
    );

    if (!notification) {
      return res.status(404).json({
        error: "Not Found",
        message: "Notification not found",
        statusCode: 404,
      });
    }

    // Check if user owns this notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        error: "Access Forbidden",
        message: "You don't have permission to delete this notification",
        statusCode: 403,
      });
    }

    // Delete notification
    await database.run("DELETE FROM notifications WHERE id = ?", [id]);

    res.json({
      message: "Notification deleted successfully",
      deleted_notification: {
        id: notification.id,
        title: notification.title,
      },
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      error: "Failed to delete notification",
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * POST /api/notifications (Admin only)
 * Create a new notification for a user
 */
router.post(
  "/",
  requireRole("admin"),
  notificationValidation.create,
  async (req, res) => {
    try {
      const {
        user_id,
        title,
        message,
        type = "info",
        action_url,
        related_task_id,
        expires_at,
      } = req.body;

      // Validation is now handled by middleware

      // Validate user exists
      const user = await database.get("SELECT id FROM users WHERE id = ?", [
        user_id,
      ]);
      if (!user) {
        return res.status(404).json({
          error: "Not Found",
          message: "User not found",
          statusCode: 404,
        });
      }

      // Validate task exists if provided
      if (related_task_id) {
        const task = await database.get("SELECT id FROM tasks WHERE id = ?", [
          related_task_id,
        ]);
        if (!task) {
          return res.status(404).json({
            error: "Not Found",
            message: "Related task not found",
            statusCode: 404,
          });
        }
      }

      // Create notification
      const result = await database.run(
        `
      INSERT INTO notifications (
        user_id, title, message, type, action_url, related_task_id, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
        [
          user_id,
          title,
          message,
          type,
          action_url,
          related_task_id,
          expires_at,
        ],
      );

      // Get the created notification
      const notification = await database.get(
        `
      SELECT
        n.*,
        u.username,
        u.full_name,
        t.title as task_title
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN tasks t ON n.related_task_id = t.id
      WHERE n.id = ?
    `,
        [result.id],
      );

      res.status(201).json({
        message: "Notification created successfully",
        notification,
      });
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(500).json({
        error: "Failed to create notification",
        message: error.message,
        statusCode: 500,
      });
    }
  },
);

/**
 * DELETE /api/notifications/cleanup-expired (Admin only)
 * Clean up expired notifications
 */
router.delete("/cleanup-expired", requireRole("admin"), async (req, res) => {
  try {
    const result = await database.run(
      "DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP",
    );

    res.json({
      message: "Expired notifications cleaned up",
      deleted_count: result.changes,
    });
  } catch (error) {
    console.error("Cleanup expired notifications error:", error);
    res.status(500).json({
      error: "Failed to cleanup expired notifications",
      message: error.message,
      statusCode: 500,
    });
  }
});

export default router;
