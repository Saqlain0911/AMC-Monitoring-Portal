import express from "express";
import bcrypt from "bcrypt";
import { generateToken, storeSession } from "../middleware/auth.js";
import JWTService from "../services/jwtService.js";
import { authValidation } from "../middleware/validation.js";
import database from "../database/database.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", authValidation.register, async (req, res) => {
  try {
    const {
      username,
      password,
      role = "user",
      email,
      full_name,
      phone,
      department,
    } = req.body;

    // Validation is now handled by middleware

    // Check if username already exists
    const existingUser = await database.get(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email],
    );

    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "Username or email already exists",
        statusCode: 409,
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await database.run(
      `INSERT INTO users (username, password, role, email, full_name, phone, department)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, role, email, full_name, phone, department],
    );

    // Get the created user (without password)
    const newUser = await database.get(
      "SELECT id, username, role, email, full_name, phone, department, created_at FROM users WHERE id = ?",
      [result.id],
    );

    // Generate JWT tokens
    const tokenPair = JWTService.generateTokenPair(newUser);

    // Store session
    await storeSession(newUser.id, tokenPair.accessToken, req);

    // Log activity
    await database.run(
      "INSERT INTO activities (task_id, user_id, action, description) VALUES (?, ?, ?, ?)",
      [
        null,
        newUser.id,
        "user_registered",
        `User ${username} registered with role ${role}`,
      ],
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
      tokenType: tokenPair.tokenType,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration Failed",
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post("/login", authValidation.login, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation is now handled by middleware

    // Find user by username or email
    const user = await database.get(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username],
    );

    if (!user) {
      return res.status(401).json({
        error: "Authentication Failed",
        message: "Invalid username or password",
        statusCode: 401,
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: "Account Disabled",
        message:
          "Your account has been disabled. Please contact an administrator.",
        statusCode: 401,
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Authentication Failed",
        message: "Invalid username or password",
        statusCode: 401,
      });
    }

    // Generate JWT tokens
    const tokenPair = JWTService.generateTokenPair(user);

    // Store session
    await storeSession(user.id, tokenPair.accessToken, req);

    // Update last login
    await database.run(
      "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id],
    );

    // Log activity
    await database.run(
      "INSERT INTO activities (task_id, user_id, action, description) VALUES (?, ?, ?, ?)",
      [null, user.id, "user_login", `User ${user.username} logged in`],
    );

    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
      tokenType: tokenPair.tokenType,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login Failed",
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Refresh token is required",
        statusCode: 400,
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await JWTService.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Refresh token has been revoked",
        statusCode: 401,
      });
    }

    // Refresh the access token
    const newTokenPair = await JWTService.refreshAccessToken(refreshToken);

    res.json({
      message: "Token refreshed successfully",
      token: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
      expiresIn: newTokenPair.expiresIn,
      tokenType: newTokenPair.tokenType,
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token Expired",
        message: "Refresh token has expired. Please login again.",
        statusCode: 401,
      });
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.type === "InvalidTokenType"
    ) {
      return res.status(401).json({
        error: "Invalid Token",
        message: "Invalid refresh token",
        statusCode: 401,
      });
    }

    res.status(500).json({
      error: "Token Refresh Failed",
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const { refreshToken } = req.body;

    // Blacklist both access and refresh tokens
    if (token) {
      await JWTService.blacklistToken(token, "logout");
    }

    if (refreshToken) {
      await JWTService.blacklistToken(refreshToken, "logout");
    }

    // Mark session as inactive in database
    if (token) {
      const tokenHash = token.slice(-20);
      await database.run(
        "UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ?",
        [tokenHash],
      );
    }

    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout Failed",
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access Denied",
        message: "No token provided",
        statusCode: 401,
      });
    }

    // Verify token and get user info
    const decoded = JWTService.verifyAccessToken(token);

    // Get current user from database
    const user = await database.get(
      "SELECT id, username, role, email, full_name, phone, department, created_at, is_active FROM users WHERE id = ?",
      [decoded.id],
    );

    if (!user) {
      return res.status(404).json({
        error: "User Not Found",
        message: "User no longer exists",
        statusCode: 404,
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: "Account Disabled",
        message: "User account has been disabled",
        statusCode: 401,
      });
    }

    res.json({
      user,
      authenticated: true,
    });
  } catch (error) {
    console.error("Get user info error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token Expired",
        message: "Please login again",
        statusCode: 401,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid Token",
        message: "Please login again",
        statusCode: 401,
      });
    }

    res.status(500).json({
      error: "Failed to get user info",
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify token validity
 */
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: "No token provided",
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await JWTService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        valid: false,
        message: "Token has been revoked",
      });
    }

    // Verify token
    const decoded = JWTService.verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await database.get(
      "SELECT id, is_active FROM users WHERE id = ?",
      [decoded.id],
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        valid: false,
        message: "User no longer exists or is disabled",
      });
    }

    res.json({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        email: decoded.email,
      },
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        valid: false,
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        valid: false,
        message: "Invalid token",
      });
    }

    res.status(500).json({
      valid: false,
      message: "Token verification failed",
    });
  }
});

export default router;
