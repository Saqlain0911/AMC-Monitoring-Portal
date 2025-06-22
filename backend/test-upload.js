#!/usr/bin/env node

// File upload testing utility
import FormData from "form-data";
import fetch from "node-fetch";
import { createReadStream, writeFileSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:3000";
let authToken = "";

// Create a test file for upload
function createTestFile() {
  const testContent = `Test file content created at ${new Date().toISOString()}
This is a test file for upload testing.
It contains multiple lines of text to test file upload functionality.

File details:
- Created: ${new Date()}
- Purpose: Testing file upload to AMC Portal API
- Size: This file is small for testing purposes
`;

  const testFilePath = join(process.cwd(), "test-file.txt");
  writeFileSync(testFilePath, testContent);
  console.log("📝 Created test file:", testFilePath);
  return testFilePath;
}

// Login to get auth token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const result = await response.json();

    if (result.token) {
      authToken = result.token;
      console.log("✅ Login successful, token acquired");
      return true;
    } else {
      console.error("❌ Login failed:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return false;
  }
}

// Test file upload with task creation
async function testTaskWithFileUpload() {
  try {
    console.log("\n🔍 Testing task creation with file upload...");

    const testFilePath = createTestFile();
    const form = new FormData();

    // Add task data
    form.append("title", "Test Task with File Upload");
    form.append(
      "description",
      "This task was created to test file upload functionality",
    );
    form.append("status", "pending");
    form.append("priority", "medium");

    // Add file
    form.append("files", createReadStream(testFilePath));

    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (response.status === 201 && result.task) {
      console.log("✅ Task created successfully with file upload!");
      console.log(`📋 Task ID: ${result.task.id}`);
      console.log(`📁 Attachments: ${result.attachments?.length || 0}`);
      return result.task.id;
    } else {
      console.log("❌ Task creation failed");
      return null;
    }
  } catch (error) {
    console.error("❌ Upload test error:", error.message);
    return null;
  }
}

// Test file upload with task update
async function testTaskUpdateWithFileUpload(taskId) {
  try {
    console.log(
      `\n🔍 Testing task update with file upload (Task ID: ${taskId})...`,
    );

    const testFilePath = createTestFile();
    const form = new FormData();

    // Add update data
    form.append(
      "description",
      "Updated task description with new file attachment",
    );
    form.append("status", "in_progress");

    // Add another file
    form.append("files", createReadStream(testFilePath));

    const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (response.status === 200) {
      console.log("✅ Task updated successfully with file upload!");
      console.log(`📁 New attachments: ${result.newAttachments?.length || 0}`);
    } else {
      console.log("❌ Task update failed");
    }
  } catch (error) {
    console.error("❌ Update test error:", error.message);
  }
}

// Test getting task with attachments
async function testGetTaskWithAttachments(taskId) {
  try {
    console.log(
      `\n🔍 Testing get task with attachments (Task ID: ${taskId})...`,
    );

    const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log("Task:", JSON.stringify(result.task, null, 2));
    console.log("Attachments:", JSON.stringify(result.attachments, null, 2));

    if (response.status === 200 && result.attachments) {
      console.log(
        `✅ Retrieved task with ${result.attachments.length} attachments`,
      );

      // Test file access
      for (const attachment of result.attachments) {
        const fileUrl = `${BASE_URL}/uploads/${attachment.file_path.split("/").slice(-2).join("/")}`;
        console.log(`📁 File URL: ${fileUrl}`);
      }
    }
  } catch (error) {
    console.error("❌ Get task error:", error.message);
  }
}

// Test large file upload (should fail)
async function testLargeFileUpload() {
  try {
    console.log("\n🔍 Testing large file upload (should fail)...");

    // Create a large test content (11MB, should exceed 10MB limit)
    const largeContent = "A".repeat(11 * 1024 * 1024);
    const largeFilePath = join(process.cwd(), "large-test-file.txt");
    writeFileSync(largeFilePath, largeContent);

    const form = new FormData();
    form.append("title", "Test with Large File");
    form.append("description", "This should fail due to file size limit");
    form.append("files", createReadStream(largeFilePath));

    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (response.status === 400) {
      console.log("✅ Large file correctly rejected!");
    } else {
      console.log("❌ Large file should have been rejected");
    }
  } catch (error) {
    console.error("❌ Large file test error:", error.message);
  }
}

// Test invalid file type upload
async function testInvalidFileType() {
  try {
    console.log("\n🔍 Testing invalid file type upload (should fail)...");

    // Create a file with invalid extension
    const invalidFilePath = join(process.cwd(), "test.exe");
    writeFileSync(invalidFilePath, "This is not really an executable");

    const form = new FormData();
    form.append("title", "Test with Invalid File");
    form.append("description", "This should fail due to invalid file type");
    form.append("files", createReadStream(invalidFilePath));

    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (response.status === 400) {
      console.log("✅ Invalid file type correctly rejected!");
    } else {
      console.log("❌ Invalid file type should have been rejected");
    }
  } catch (error) {
    console.error("❌ Invalid file test error:", error.message);
  }
}

// Run all tests
async function runFileUploadTests() {
  console.log("🧪 Starting File Upload Tests...\n");

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("❌ Cannot continue tests without authentication");
    return;
  }

  // Step 2: Test task creation with file upload
  const taskId = await testTaskWithFileUpload();

  if (taskId) {
    // Step 3: Test task update with file upload
    await testTaskUpdateWithFileUpload(taskId);

    // Step 4: Test getting task with attachments
    await testGetTaskWithAttachments(taskId);
  }

  // Step 5: Test error conditions
  await testLargeFileUpload();
  await testInvalidFileType();

  console.log("\n✅ File Upload Tests completed!");
  console.log("\n📝 Summary:");
  console.log("- File uploads are configured with multer");
  console.log("- Files are saved to uploads/YYYY-MM-DD/ directory");
  console.log("- uploaded_by field is set from JWT token");
  console.log("- File size limit: 10MB per file");
  console.log("- Max files per request: 5");
  console.log("- Supported file types: Images, Documents, Text, Archives");
}

// Check if form-data is installed
try {
  import("form-data");
} catch (error) {
  console.log("❌ form-data package not found. Installing...");
  console.log("Run: npm install form-data");
  process.exit(1);
}

// Run tests
runFileUploadTests().catch(console.error);
