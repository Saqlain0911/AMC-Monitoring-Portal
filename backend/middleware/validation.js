import { body, param, query, validationResult } from "express-validator";

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid input data",
      statusCode: 400,
      errors: formattedErrors,
    });
  }

  next();
};

/**
 * Common validation rules
 */
export const commonValidations = {
  // User ID validation
  userId: param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),

  // Task ID validation
  taskId: param("id")
    .isInt({ min: 1 })
    .withMessage("Task ID must be a positive integer"),

  // Activity ID validation
  activityId: param("id")
    .isInt({ min: 1 })
    .withMessage("Activity ID must be a positive integer"),

  // Notification ID validation
  notificationId: param("id")
    .isInt({ min: 1 })
    .withMessage("Notification ID must be a positive integer"),

  // Pagination validation
  page: query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  limit: query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  // Date validation
  date: (field) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO 8601 date`),

  // Optional string validation
  optionalString: (field, minLength = 1, maxLength = 1000) =>
    body(field)
      .optional()
      .isString()
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(
        `${field} must be a string between ${minLength} and ${maxLength} characters`,
      ),

  // Required string validation
  requiredString: (field, minLength = 1, maxLength = 1000) =>
    body(field)
      .notEmpty()
      .withMessage(`${field} is required`)
      .isString()
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(
        `${field} must be a string between ${minLength} and ${maxLength} characters`,
      ),
};

/**
 * Authentication validation rules
 */
export const authValidation = {
  // Login validation
  login: [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters")
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage(
        "Username can only contain letters, numbers, dots, hyphens, and underscores",
      ),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    handleValidationErrors,
  ],

  // Registration validation
  register: [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters")
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage(
        "Username can only contain letters, numbers, dots, hyphens, and underscores",
      ),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Role must be either 'admin' or 'user'"),

    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("full_name")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Full name must be between 1 and 100 characters"),

    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),

    body("department")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Department must be between 1 and 50 characters"),

    handleValidationErrors,
  ],

  // Profile update validation
  updateProfile: [
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("full_name")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Full name must be between 1 and 100 characters"),

    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),

    body("department")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Department must be between 1 and 50 characters"),

    handleValidationErrors,
  ],

  // Change password validation
  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isString()
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    handleValidationErrors,
  ],
};

/**
 * Task validation rules
 */
export const taskValidation = {
  // Create task validation
  create: [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),

    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Description must not exceed 2000 characters"),

    body("status")
      .optional()
      .isIn(["pending", "in_progress", "completed", "cancelled", "on_hold"])
      .withMessage(
        "Status must be one of: pending, in_progress, completed, cancelled, on_hold",
      ),

    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Priority must be one of: low, medium, high, urgent"),

    body("assigned_to")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Assigned user ID must be a positive integer"),

    body("due_date")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date"),

    body("estimated_hours")
      .optional()
      .isFloat({ min: 0, max: 1000 })
      .withMessage("Estimated hours must be between 0 and 1000"),

    body("tags")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Tags must not exceed 500 characters"),

    body("location")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location must not exceed 100 characters"),

    body("equipment_id")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Equipment ID must not exceed 50 characters"),

    handleValidationErrors,
  ],

  // Update task validation
  update: [
    commonValidations.taskId,

    body("title")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),

    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Description must not exceed 2000 characters"),

    body("status")
      .optional()
      .isIn(["pending", "in_progress", "completed", "cancelled", "on_hold"])
      .withMessage(
        "Status must be one of: pending, in_progress, completed, cancelled, on_hold",
      ),

    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Priority must be one of: low, medium, high, urgent"),

    body("assigned_to")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Assigned user ID must be a positive integer"),

    body("due_date")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date"),

    body("estimated_hours")
      .optional()
      .isFloat({ min: 0, max: 1000 })
      .withMessage("Estimated hours must be between 0 and 1000"),

    body("actual_hours")
      .optional()
      .isFloat({ min: 0, max: 1000 })
      .withMessage("Actual hours must be between 0 and 1000"),

    body("tags")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Tags must not exceed 500 characters"),

    body("location")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location must not exceed 100 characters"),

    body("equipment_id")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Equipment ID must not exceed 50 characters"),

    handleValidationErrors,
  ],

  // Get task by ID validation
  getById: [commonValidations.taskId, handleValidationErrors],

  // Delete task validation
  delete: [commonValidations.taskId, handleValidationErrors],

  // Query parameters validation for task listing
  query: [
    commonValidations.page,
    commonValidations.limit,

    query("status")
      .optional()
      .isIn(["pending", "in_progress", "completed", "cancelled", "on_hold"])
      .withMessage(
        "Status must be one of: pending, in_progress, completed, cancelled, on_hold",
      ),

    query("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Priority must be one of: low, medium, high, urgent"),

    query("assigned_to")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Assigned user ID must be a positive integer"),

    query("created_by")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Created by user ID must be a positive integer"),

    handleValidationErrors,
  ],
};

/**
 * Activity validation rules
 */
export const activityValidation = {
  // Create activity validation
  create: [
    body("task_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Task ID must be a positive integer"),

    body("action")
      .notEmpty()
      .withMessage("Action is required")
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Action must be between 1 and 100 characters"),

    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),

    body("old_value")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Old value must not exceed 500 characters"),

    body("new_value")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("New value must not exceed 500 characters"),

    handleValidationErrors,
  ],

  // Query parameters validation for activity listing
  query: [
    commonValidations.page,
    commonValidations.limit,

    query("task_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Task ID must be a positive integer"),

    query("user_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),

    query("action")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Action must be between 1 and 100 characters"),

    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),

    query("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),

    handleValidationErrors,
  ],

  // Get activities by task ID
  getByTaskId: [
    param("taskId")
      .isInt({ min: 1 })
      .withMessage("Task ID must be a positive integer"),

    handleValidationErrors,
  ],
};

/**
 * Notification validation rules
 */
export const notificationValidation = {
  // Create notification validation (admin only)
  create: [
    body("user_id")
      .notEmpty()
      .withMessage("User ID is required")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),

    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),

    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),

    body("type")
      .optional()
      .isIn(["info", "warning", "error", "success"])
      .withMessage("Type must be one of: info, warning, error, success"),

    body("action_url")
      .optional()
      .isURL()
      .withMessage("Action URL must be a valid URL"),

    body("related_task_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Related task ID must be a positive integer"),

    body("expires_at")
      .optional()
      .isISO8601()
      .withMessage("Expires at must be a valid ISO 8601 date"),

    handleValidationErrors,
  ],

  // Update notification validation
  update: [
    commonValidations.notificationId,

    body("read_status")
      .optional()
      .isBoolean()
      .withMessage("Read status must be a boolean"),

    handleValidationErrors,
  ],

  // Get notification by ID validation
  getById: [commonValidations.notificationId, handleValidationErrors],

  // Delete notification validation
  delete: [commonValidations.notificationId, handleValidationErrors],

  // Query parameters validation for notification listing
  query: [
    commonValidations.page,
    commonValidations.limit,

    query("read_status")
      .optional()
      .isBoolean()
      .withMessage("Read status must be a boolean"),

    query("type")
      .optional()
      .isIn(["info", "warning", "error", "success"])
      .withMessage("Type must be one of: info, warning, error, success"),

    query("include_expired")
      .optional()
      .isBoolean()
      .withMessage("Include expired must be a boolean"),

    handleValidationErrors,
  ],
};

/**
 * File upload validation (handled by multer, but we can add additional checks)
 */
export const fileValidation = {
  // Validate file metadata for database storage
  metadata: [
    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("File description must not exceed 500 characters"),

    handleValidationErrors,
  ],
};

/**
 * Custom validators
 */
export const customValidators = {
  // Check if user exists
  userExists: async (userId) => {
    // This would be implemented with database check
    // For now, just validate the format
    if (!Number.isInteger(Number(userId)) || Number(userId) < 1) {
      throw new Error("Invalid user ID");
    }
    return true;
  },

  // Check if task exists
  taskExists: async (taskId) => {
    // This would be implemented with database check
    // For now, just validate the format
    if (!Number.isInteger(Number(taskId)) || Number(taskId) < 1) {
      throw new Error("Invalid task ID");
    }
    return true;
  },

  // Validate date range
  dateRange: (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new Error("Start date must be before end date");
      }
    }
    return true;
  },
};

export default {
  handleValidationErrors,
  commonValidations,
  authValidation,
  taskValidation,
  activityValidation,
  notificationValidation,
  fileValidation,
  customValidators,
};
