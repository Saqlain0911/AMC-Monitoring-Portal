import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import database from "./database/database.js";

// Import routes
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import activityRoutes from "./routes/activities.js";
import notificationRoutes from "./routes/notifications.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize database
let dbInitialized = false;

async function initializeDatabase() {
  try {
    await database.initialize();
    dbInitialized = true;
    console.log("🗄️  Database connection established");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("combined"));

// CORS configuration - Allow requests from frontend
app.use(
  cors({
    origin: [
      "http://localhost:8080", // Vite dev server
      "http://localhost:3000", // Alternative frontend port
      "http://localhost:5173", // Alternative Vite port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically
app.use("/uploads", express.static(join(__dirname, "uploads")));

// Database check middleware
app.use((req, res, next) => {
  if (!dbInitialized && !req.path.includes("/health")) {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "Database is not ready",
      statusCode: 503,
    });
  }
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  const dbStats = dbInitialized ? await database.getStats() : null;

  res.status(200).json({
    status: "OK",
    message: "AMC Portal Backend Server is running",
    timestamp: new Date().toISOString(),
    port: PORT,
    database: {
      connected: dbInitialized,
      stats: dbStats,
    },
  });
});

// Database status endpoint
app.get("/api/database/status", async (req, res) => {
  try {
    const stats = await database.getStats();
    res.json({
      status: "connected",
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Database Error",
      message: error.message,
      statusCode: 500,
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// Basic API routes placeholder
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to AMC Portal API",
    version: "1.0.0",
    database: dbInitialized ? "connected" : "disconnected",
    endpoints: {
      health: "/health",
      api: "/api",
      database: "/api/database/status",
      // Authentication
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
      logout: "POST /api/auth/logout",
      profile: "GET /api/auth/me",
      // Tasks
      tasks: "GET /api/tasks",
      task_detail: "GET /api/tasks/:id",
      create_task: "POST /api/tasks",
      update_task: "PUT /api/tasks/:id",
      delete_task: "DELETE /api/tasks/:id",
      // Activities
      activities: "GET /api/activities",
      activity_summary: "GET /api/activities/summary",
      task_activities: "GET /api/activities/task/:taskId",
      // Notifications
      notifications: "GET /api/notifications",
      unread_notifications: "GET /api/notifications/unread",
      mark_read: "PUT /api/notifications/:id",
      mark_all_read: "PUT /api/notifications/mark-all-read",
      // File uploads
      uploads: "Access uploaded files at /uploads/YYYY-MM-DD/filename",
    },
  });
});

// Test database endpoint
app.get("/api/test/database", async (req, res) => {
  try {
    // Test database connection with a simple query
    const result = await database.get("SELECT COUNT(*) as total FROM users");

    res.json({
      message: "Database connection test successful",
      userCount: result.total,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Database Test Failed",
      message: error.message,
      statusCode: 500,
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    statusCode: err.status || 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log("🛑 Received shutdown signal. Closing database connection...");

  try {
    await database.close();
    console.log("✅ Database connection closed successfully");
  } catch (error) {
    console.error("❌ Error closing database:", error);
  }

  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 AMC Portal Backend Server started successfully!`);
      console.log(`📡 Server is running on http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log(
        `🗄️  Database test: http://localhost:${PORT}/api/test/database`,
      );
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
