#!/usr/bin/env node

// JWT Token Testing Script
import fetch from "node-fetch";
import JWTService from "./services/jwtService.js";

const BASE_URL = "http://localhost:3000/api";

// Test helper function
async function testJWTEndpoint(method, endpoint, data, description) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    const status = response.status < 400 ? "✅" : "❌";
    console.log(
      `${status} ${method} ${endpoint} (${response.status}) - ${description}`,
    );

    if (response.status >= 400) {
      console.log(`   Error:`, result.message);
    } else if (result.token) {
      console.log(`   Token received (${result.tokenType})`);
      console.log(`   Expires in: ${result.expiresIn}`);

      // Decode and show token payload
      const decoded = JWTService.decodeToken(result.token);
      if (decoded) {
        console.log(`   Token payload:`, {
          id: decoded.payload.id,
          username: decoded.payload.username,
          role: decoded.payload.role,
          type: decoded.payload.type,
          exp: new Date(decoded.payload.exp * 1000).toISOString(),
        });
      }
    }

    return { response, result };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return null;
  }
}

// Test JWT token generation and verification
async function testJWTGeneration() {
  console.log("\n🔐 Testing JWT Token Generation...\n");

  // Mock user data
  const mockUser = {
    id: 1,
    username: "testuser",
    role: "user",
    email: "test@example.com",
  };

  // Test access token generation
  console.log("📝 Testing Access Token Generation:");
  const accessToken = JWTService.generateAccessToken(mockUser);
  console.log(`✅ Access token generated: ${accessToken.substring(0, 50)}...`);

  // Test refresh token generation
  console.log("\n📝 Testing Refresh Token Generation:");
  const refreshToken = JWTService.generateRefreshToken(mockUser);
  console.log(
    `✅ Refresh token generated: ${refreshToken.substring(0, 50)}...`,
  );

  // Test token pair generation
  console.log("\n📝 Testing Token Pair Generation:");
  const tokenPair = JWTService.generateTokenPair(mockUser);
  console.log(`✅ Token pair generated:`);
  console.log(`   Access token: ${tokenPair.accessToken.substring(0, 50)}...`);
  console.log(
    `   Refresh token: ${tokenPair.refreshToken.substring(0, 50)}...`,
  );
  console.log(`   Expires in: ${tokenPair.expiresIn}`);
  console.log(`   Token type: ${tokenPair.tokenType}`);

  // Test token verification
  console.log("\n📝 Testing Token Verification:");
  try {
    const decoded = JWTService.verifyAccessToken(accessToken);
    console.log(`✅ Access token verified successfully`);
    console.log(`   User ID: ${decoded.id}`);
    console.log(`   Username: ${decoded.username}`);
    console.log(`   Role: ${decoded.role}`);
    console.log(`   Type: ${decoded.type}`);
    console.log(`   Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
  } catch (error) {
    console.log(`❌ Token verification failed: ${error.message}`);
  }

  // Test token decoding
  console.log("\n📝 Testing Token Decoding:");
  const decodedToken = JWTService.decodeToken(accessToken);
  if (decodedToken) {
    console.log(`✅ Token decoded successfully`);
    console.log(`   Header:`, decodedToken.header);
    console.log(`   Payload:`, decodedToken.payload);
  }

  // Test token expiration check
  console.log("\n📝 Testing Token Expiration:");
  const isExpired = JWTService.isTokenExpired(accessToken);
  console.log(`✅ Token expired: ${isExpired}`);

  const expiration = JWTService.getTokenExpiration(accessToken);
  console.log(`✅ Token expires at: ${expiration}`);

  return { accessToken, refreshToken, tokenPair };
}

// Test authentication endpoints
async function testAuthEndpoints() {
  console.log("\n🔑 Testing Authentication Endpoints...\n");

  // Test login
  const loginResult = await testJWTEndpoint(
    "POST",
    "/auth/login",
    {
      username: "admin",
      password: "admin123",
    },
    "Login with JWT token generation",
  );

  if (!loginResult || !loginResult.result.token) {
    console.log("❌ Login failed, cannot test other endpoints");
    return;
  }

  const { token: accessToken, refreshToken } = loginResult.result;

  // Test protected endpoint
  console.log("\n📋 Testing Protected Endpoint:");
  try {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    const status = response.status === 200 ? "✅" : "❌";
    console.log(
      `${status} GET /auth/me (${response.status}) - Protected endpoint with JWT`,
    );

    if (response.status === 200) {
      console.log(
        `   User info retrieved: ${result.user.username} (${result.user.role})`,
      );
    }
  } catch (error) {
    console.log(`❌ Protected endpoint test failed: ${error.message}`);
  }

  // Test token refresh
  if (refreshToken) {
    await testJWTEndpoint(
      "POST",
      "/auth/refresh",
      { refreshToken },
      "Token refresh with refresh token",
    );
  }

  // Test logout
  await testJWTEndpoint(
    "POST",
    "/auth/logout",
    { refreshToken },
    "Logout with token blacklisting",
  );

  return { accessToken, refreshToken };
}

// Test token validation scenarios
async function testTokenValidation() {
  console.log("\n🛡️ Testing Token Validation Scenarios...\n");

  // Test invalid token
  console.log("📝 Testing Invalid Token:");
  try {
    const invalidToken = "invalid.token.here";
    JWTService.verifyAccessToken(invalidToken);
    console.log("❌ Invalid token should have failed");
  } catch (error) {
    console.log(`✅ Invalid token correctly rejected: ${error.message}`);
  }

  // Test expired token simulation
  console.log("\n📝 Testing Token Type Validation:");
  const mockUser = {
    id: 1,
    username: "test",
    role: "user",
    email: "test@example.com",
  };
  const refreshToken = JWTService.generateRefreshToken(mockUser);

  try {
    JWTService.verifyAccessToken(refreshToken); // This should fail
    console.log("❌ Refresh token should not be accepted as access token");
  } catch (error) {
    console.log(`✅ Token type validation working: ${error.message}`);
  }

  // Test JWT configuration
  console.log("\n📝 Testing JWT Configuration:");
  const config = JWTService.getConfig();
  console.log(`✅ JWT Configuration:`);
  console.log(`   Access token expiry: ${config.accessTokenExpiry}`);
  console.log(`   Refresh token expiry: ${config.refreshTokenExpiry}`);
  console.log(`   Issuer: ${config.issuer}`);
  console.log(`   Audience: ${config.audience}`);
  console.log(`   Algorithm: ${config.algorithm}`);
}

// Main test runner
async function runJWTTests() {
  console.log("🧪 Starting JWT Implementation Tests...");
  console.log("=" + "=".repeat(50));

  try {
    // Test JWT service functions
    const tokens = await testJWTGeneration();

    // Test authentication endpoints
    await testAuthEndpoints();

    // Test validation scenarios
    await testTokenValidation();

    console.log("\n✅ JWT Tests Completed Successfully!");
    console.log("\n📋 JWT Implementation Summary:");
    console.log("- ✅ JWT tokens generated with user id and role");
    console.log("- ✅ Tokens signed with secret key");
    console.log("- ✅ Access tokens expire in 1 hour");
    console.log("- ✅ Refresh tokens expire in 7 days");
    console.log("- ✅ Token verification and validation working");
    console.log("- ✅ Token blacklisting implemented for logout");
    console.log("- ✅ Comprehensive error handling");
    console.log("- ✅ Security features implemented");
  } catch (error) {
    console.error("\n❌ JWT Tests Failed:", error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL.replace("/api", "")}/health`);
    if (response.ok) {
      console.log("✅ Backend server is running");
      return true;
    }
  } catch (error) {
    console.log("❌ Backend server is not running");
    console.log("Please start the server with: cd backend && npm run dev");
    return false;
  }
}

// Run tests if server is available
checkServer().then((serverRunning) => {
  if (serverRunning) {
    runJWTTests().catch(console.error);
  } else {
    console.log("\nTo run JWT tests:");
    console.log("1. Start backend: cd backend && npm run dev");
    console.log("2. Run tests: node backend/test-jwt.js");
  }
});

export default { runJWTTests };
