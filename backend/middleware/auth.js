import jwt from "jsonwebtoken";
import database from "../database/database.js";

// JWT Configuration
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "amc-portal-super-secret-key-change-in-production-2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Generate JWT access token for user
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    type: "access",
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "amc-portal",
    audience: "amc-portal-users",
    algorithm: "HS256",
  });
};

/**
 * Generate JWT refresh token for user
 */
export const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    type: "refresh",
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "amc-portal",
    audience: "amc-portal-users",
    algorithm: "HS256",
  });
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "amc-portal",
      audience: "amc-portal-users",
      algorithms: ["HS256"],
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Decode JWT token without verification (for expired token info)
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

/**
 * Verify JWT token middleware
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Access Denied",
        message: "No token provided",
        statusCode: 401,
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check token type
    if (decoded.type !== "access") {
      return res.status(401).json({
        error: "Invalid Token",
        message: "Invalid token type",
        statusCode: 401,
      });
    }

    // Check if user still exists
    const user = await database.get(
      "SELECT id, username, role, email, full_name, is_active FROM users WHERE id = ?",
      [decoded.id],
    );

    if (!user) {
      return res.status(401).json({
        error: "Access Denied",
        message: "User not found",
        statusCode: 401,
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: "Access Denied",
        message: "User account is disabled",
        statusCode: 401,
      });
    }

    // Add user info to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
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

    console.error("Authentication error:", error);
    return res.status(500).json({
      error: "Authentication Error",
      message: "Internal server error",
      statusCode: 500,
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Access Denied",
        message: "Authentication required",
        statusCode: 401,
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access Forbidden",
        message: `Insufficient permissions. Required role: ${allowedRoles.join(" or ")}`,
        statusCode: 403,
      });
    }

    next();
  };
};

/**
 * Store session in database (optional for session management)
 */
export const storeSession = async (userId, token, req) => {
  try {
    const tokenHash = jwt.decode(token).jti || token.slice(-20); // Use last 20 chars as hash
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await database.run(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        tokenHash,
        expiresAt.toISOString(),
        req.ip || req.connection.remoteAddress,
        req.get("User-Agent") || "Unknown",
      ],
    );

    return tokenHash;
  } catch (error) {
    console.error("Error storing session:", error);
    // Don't fail the request if session storage fails
    return null;
  }
};

/**
 * Cleanup expired sessions
 */
export const cleanupExpiredSessions = async () => {
  try {
    const result = await database.run(
      "DELETE FROM user_sessions WHERE expires_at < ? OR is_active = FALSE",
      [new Date().toISOString()],
    );

    console.log(`Cleaned up ${result.changes} expired sessions`);
    return result.changes;
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    return 0;
  }
};

export default {
  generateToken,
  authenticateToken,
  requireRole,
  storeSession,
  cleanupExpiredSessions,
};
