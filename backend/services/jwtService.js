import jwt from "jsonwebtoken";
import crypto from "crypto";
import database from "../database/database.js";

// JWT Configuration
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "amc-portal-super-secret-key-change-in-production-2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const JWT_ISSUER = "amc-portal";
const JWT_AUDIENCE = "amc-portal-users";

/**
 * JWT Service for comprehensive token management
 */
export class JWTService {
  /**
   * Generate access token for user
   * @param {Object} user - User object with id, username, role, email
   * @returns {String} JWT access token
   */
  static generateAccessToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      type: "access",
      iat: Math.floor(Date.now() / 1000),
      // Add session identifier
      sid: crypto.randomBytes(16).toString("hex"),
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: "HS256",
    });
  }

  /**
   * Generate refresh token for user
   * @param {Object} user - User object with id, username
   * @returns {String} JWT refresh token
   */
  static generateRefreshToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
      // Add unique refresh token identifier
      rid: crypto.randomBytes(16).toString("hex"),
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: "HS256",
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} { accessToken, refreshToken, expiresIn, refreshExpiresIn }
   */
  static generateTokenPair(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
      refreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
      tokenType: "Bearer",
    };
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ["HS256"],
      });
    } catch (error) {
      throw new JWTError(error.message, error.name);
    }
  }

  /**
   * Verify access token specifically
   * @param {String} token - JWT access token
   * @returns {Object} Decoded token payload
   */
  static verifyAccessToken(token) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== "access") {
      throw new JWTError("Invalid token type", "InvalidTokenType");
    }

    return decoded;
  }

  /**
   * Verify refresh token specifically
   * @param {String} token - JWT refresh token
   * @returns {Object} Decoded token payload
   */
  static verifyRefreshToken(token) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== "refresh") {
      throw new JWTError("Invalid token type", "InvalidTokenType");
    }

    return decoded;
  }

  /**
   * Decode token without verification (for expired token info)
   * @param {String} token - JWT token
   * @returns {Object|null} Decoded token or null
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration time
   * @param {String} token - JWT token
   * @returns {Date|null} Expiration date or null
   */
  static getTokenExpiration(token) {
    const decoded = this.decodeToken(token);

    if (decoded && decoded.payload && decoded.payload.exp) {
      return new Date(decoded.payload.exp * 1000);
    }

    return null;
  }

  /**
   * Check if token is expired
   * @param {String} token - JWT token
   * @returns {Boolean} True if expired
   */
  static isTokenExpired(token) {
    const expiration = this.getTokenExpiration(token);

    if (!expiration) {
      return true;
    }

    return new Date() > expiration;
  }

  /**
   * Extract user info from token
   * @param {String} token - JWT token
   * @returns {Object|null} User info or null
   */
  static extractUserFromToken(token) {
    try {
      const decoded = this.verifyAccessToken(token);

      return {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        email: decoded.email,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {String} refreshToken - JWT refresh token
   * @returns {Object} New token pair
   */
  static async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Get user from database to ensure they still exist and are active
      const user = await database.get(
        "SELECT id, username, role, email, full_name, is_active FROM users WHERE id = ?",
        [decoded.id],
      );

      if (!user) {
        throw new JWTError("User not found", "UserNotFound");
      }

      if (!user.is_active) {
        throw new JWTError("User account is disabled", "UserDisabled");
      }

      // Generate new token pair
      return this.generateTokenPair(user);
    } catch (error) {
      throw new JWTError("Failed to refresh token", "RefreshFailed");
    }
  }

  /**
   * Blacklist token (store in database for logout)
   * @param {String} token - JWT token to blacklist
   * @param {String} reason - Reason for blacklisting
   */
  static async blacklistToken(token, reason = "logout") {
    try {
      const decoded = this.decodeToken(token);

      if (decoded && decoded.payload) {
        const expiresAt = new Date(decoded.payload.exp * 1000);

        await database.run(
          "INSERT INTO blacklisted_tokens (token_id, expires_at, reason) VALUES (?, ?, ?)",
          [
            decoded.payload.jti || decoded.payload.sid || token.slice(-20),
            expiresAt.toISOString(),
            reason,
          ],
        );
      }
    } catch (error) {
      console.error("Failed to blacklist token:", error);
      // Don't throw error to avoid breaking logout flow
    }
  }

  /**
   * Check if token is blacklisted
   * @param {String} token - JWT token to check
   * @returns {Boolean} True if blacklisted
   */
  static async isTokenBlacklisted(token) {
    try {
      const decoded = this.decodeToken(token);

      if (!decoded || !decoded.payload) {
        return true;
      }

      const tokenId =
        decoded.payload.jti || decoded.payload.sid || token.slice(-20);

      const blacklisted = await database.get(
        "SELECT id FROM blacklisted_tokens WHERE token_id = ? AND expires_at > ?",
        [tokenId, new Date().toISOString()],
      );

      return !!blacklisted;
    } catch (error) {
      console.error("Failed to check token blacklist:", error);
      return false;
    }
  }

  /**
   * Clean up expired blacklisted tokens
   */
  static async cleanupBlacklistedTokens() {
    try {
      const result = await database.run(
        "DELETE FROM blacklisted_tokens WHERE expires_at < ?",
        [new Date().toISOString()],
      );

      console.log(`Cleaned up ${result.changes} expired blacklisted tokens`);
      return result.changes;
    } catch (error) {
      console.error("Failed to cleanup blacklisted tokens:", error);
      return 0;
    }
  }

  /**
   * Get JWT configuration info
   * @returns {Object} JWT configuration
   */
  static getConfig() {
    return {
      accessTokenExpiry: JWT_EXPIRES_IN,
      refreshTokenExpiry: JWT_REFRESH_EXPIRES_IN,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: "HS256",
    };
  }
}

/**
 * Custom JWT Error class
 */
export class JWTError extends Error {
  constructor(message, type = "JWTError") {
    super(message);
    this.name = type;
    this.type = type;
  }
}

// Export convenience functions
export const generateToken = JWTService.generateAccessToken;
export const generateRefreshToken = JWTService.generateRefreshToken;
export const verifyToken = JWTService.verifyAccessToken;
export const decodeToken = JWTService.decodeToken;

export default JWTService;
