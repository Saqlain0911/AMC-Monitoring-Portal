#!/usr/bin/env node

// Simple API testing script
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";
let authToken = "";

// Test functions
async function testEndpoint(
  method,
  endpoint,
  data = null,
  includeAuth = false,
) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (includeAuth && authToken) {
      options.headers["Authorization"] = `Bearer ${authToken}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    console.log(`\n🔍 Testing: ${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(result, null, 2));

    return { response, result };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log("🧪 Starting API Tests...\n");

  // 1. Test health check
  await testEndpoint("GET", "/health");

  // 2. Test API info
  await testEndpoint("GET", "/api");

  // 3. Test database
  await testEndpoint("GET", "/api/test/database");

  // 4. Test login with default admin user
  console.log("\n🔐 Testing Authentication...");
  const loginResult = await testEndpoint("POST", "/api/auth/login", {
    username: "admin",
    password: "admin123",
  });

  if (loginResult && loginResult.result.token) {
    authToken = loginResult.result.token;
    console.log("✅ Login successful! Token acquired.");

    // 5. Test authenticated endpoints
    console.log("\n📋 Testing Protected Endpoints...");

    await testEndpoint("GET", "/api/auth/me", null, true);
    await testEndpoint("GET", "/api/tasks", null, true);
    await testEndpoint("GET", "/api/activities", null, true);
    await testEndpoint("GET", "/api/notifications", null, true);

    // 6. Test creating a task
    await testEndpoint(
      "POST",
      "/api/tasks",
      {
        title: "Test Task from API",
        description: "This is a test task created via API",
        status: "pending",
        priority: "medium",
      },
      true,
    );
  } else {
    console.log("❌ Login failed! Cannot test protected endpoints.");
  }

  console.log("\n✅ API Tests completed!");
}

// Run tests
runTests().catch(console.error);
