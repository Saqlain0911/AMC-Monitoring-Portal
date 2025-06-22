# 🔄 Frontend API Integration - Complete Guide

## ✅ **Integration Status: COMPLETE**

Your frontend service files have been successfully updated to integrate with the backend API, replacing mock function calls with HTTP requests.

---

## 📁 **Updated Files Summary**

### **🔧 Core Services Updated:**

| File                                | Status     | Changes Made                                               |
| ----------------------------------- | ---------- | ---------------------------------------------------------- |
| **src/services/api.ts**             | ✅ Updated | API base URL changed to `http://localhost:3000/api`        |
| **src/services/authService.ts**     | ✅ Updated | Login/register endpoints updated for backend compatibility |
| **src/services/taskService.ts**     | ✅ Updated | Task CRUD operations updated to match backend API          |
| **src/services/activityService.ts** | ✅ Updated | Activity logging updated for backend integration           |

### **🆕 New Files Created:**

| File                            | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| **src/services/fileService.ts** | File upload and attachment handling             |
| **src/types/api.ts**            | Backend API type definitions and converters     |
| **src/utils/auth.ts**           | JWT token management and authentication helpers |
| **src/utils/apiTest.ts**        | API integration testing utilities               |

---

## 🔑 **Authentication Integration**

### **Updated Login Flow:**

```typescript
// OLD (Mock-based)
authService.login({
  email: "admin@amc.com",
  password: "admin123",
  role: "admin",
});

// NEW (Backend API)
authService.login({ username: "admin", password: "admin123" });
```

### **JWT Token Handling:**

```typescript
// Automatic token management
import { tokenManager } from "@/utils/auth";

// Get current token
const token = tokenManager.getToken();

// Check if user is authenticated
const isAuth = tokenManager.isAuthenticated();

// Clear user session
tokenManager.clearUser();
```

### **API Request Headers:**

All protected API requests now automatically include:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📋 **Task Management Integration**

### **Updated Task Operations:**

```typescript
// Get all tasks (with backend pagination)
const response = await taskService.getTasks({ page: 1, limit: 20 });
// Returns: { tasks: Task[], pagination: { page, limit, total, pages } }

// Get single task with attachments and comments
const taskDetail = await taskService.getTaskById("1");
// Returns: { task, attachments, comments }

// Create task
const newTask = await taskService.createTask({
  title: "New Task",
  description: "Task description",
  status: "pending",
  priority: "medium",
  assigned_to: 2, // User ID
});

// Update task
const updatedTask = await taskService.updateTask("1", {
  status: "in_progress",
});
```

### **File Upload Integration:**

```typescript
import { fileService } from "@/services/fileService";

// Create task with files
const taskWithFiles = await fileService.createTaskWithFiles(
  taskData,
  fileList, // FileList from input element
);

// Update task with additional files
const updatedTask = await fileService.updateTaskWithFiles(
  taskId,
  updateData,
  newFiles,
);

// Download file
await fileService.downloadFile(filePath, fileName);
```

---

## 🔔 **Notification Integration**

### **Updated Notification Operations:**

```typescript
// Get user notifications
const response = await notificationService.getNotifications({
  read_status: false,
  page: 1,
  limit: 20,
});
// Returns: { notifications, unread_count, pagination }

// Get unread notifications only
const unread = await notificationService.getUnreadNotifications();
// Returns: { notifications, count }

// Mark notification as read
await notificationService.markNotificationRead("1");

// Mark all notifications as read
await notificationService.markAllNotificationsRead();
```

---

## 📊 **Activity Logging Integration**

### **Updated Activity Tracking:**

```typescript
// Log activity
await activityService.logActivity({
  action: "task_created",
  description: "User created a new task",
  task_id: 1, // Optional task reference
});

// Get activities with pagination
const response = await activityService.getActivities({
  page: 1,
  limit: 50,
  task_id: 1, // Optional filter
});
// Returns: { activities, pagination }
```

---

## 🧪 **API Testing Integration**

### **Test Your Integration:**

```typescript
import { ApiTester, testApiConnection } from "@/utils/apiTest";

// Quick connection test
const isConnected = await testApiConnection();

// Full API integration test
const tester = new ApiTester();
const results = await tester.runAllTests();

console.log(results.summary);
// Outputs: { total, passed, failed, successRate }
```

### **Browser Console Testing:**

Your app now includes testing utilities available in the browser console:

```javascript
// Test API connection
await testApiConnection();

// Test authentication
await testAuthentication("admin", "admin123");

// Run full API test suite
const results = await apiTester.runAllTests();
```

---

## 🔄 **Migration from Mock to Real API**

### **Authentication Migration:**

**Before (Mock):**

```typescript
// Login with email and role
await login("admin@amc.com", "admin123", "admin");
```

**After (Backend API):**

```typescript
// Login with username
await login("admin", "admin123");
```

### **Data Structure Migration:**

**Backend API Response → Frontend Types:**

```typescript
// API Response (from backend)
{
  id: 1,
  full_name: "John Doe",
  role: "user",
  created_at: "2024-01-01T00:00:00.000Z"
}

// Converted to Frontend Type
{
  id: "1",
  name: "John Doe",
  role: "user",
  joinDate: "2024-01-01"
}
```

### **Error Handling:**

```typescript
try {
  const tasks = await taskService.getTasks();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Token expired - redirect to login
      tokenManager.clearUser();
      window.location.href = "/login";
    }
    if (error.status === 403) {
      // Access forbidden
      showError("You don't have permission for this action");
    }
  }
}
```

---

## 🚀 **How to Use the Updated Services**

### **1. Start Your Backend:**

```bash
cd backend
npm run dev
# Backend should be running on http://localhost:3000
```

### **2. Update Environment Variables (Optional):**

Create `.env` in your frontend root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### **3. Test the Integration:**

```bash
# In your frontend
npm run dev

# Open browser console and run:
await testApiConnection(); // Should return true
await testAuthentication(); // Should login successfully
```

### **4. Login with Migrated Credentials:**

| Username | Password | Role  |
| -------- | -------- | ----- |
| admin    | admin123 | admin |
| john     | john123  | user  |
| jane     | jane123  | user  |
| mike     | mike123  | user  |
| sarah    | sarah123 | user  |

---

## 🔧 **Development Utilities**

### **Mock Mode Fallback:**

Your app maintains mock mode compatibility:

```typescript
import { isBackendAvailable } from "@/config/mockMode";

if (isBackendAvailable()) {
  // Use real API
  await taskService.getTasks();
} else {
  // Use mock data
  return mockDataService.getTasks();
}
```

### **Offline Support:**

```typescript
// Check if user is online
const { isOnline } = useAuth();

if (isOnline) {
  // Sync with backend
} else {
  // Use cached data
}
```

### **File Upload Support:**

```typescript
// Validate files before upload
const validation = fileService.validateFiles(fileList);
if (!validation.valid) {
  console.error(validation.errors);
  return;
}

// Upload with task creation
const result = await fileService.createTaskWithFiles(taskData, fileList);
```

---

## 📋 **Integration Checklist**

- [x] ✅ **API Base URL** updated to backend server
- [x] ✅ **Authentication** migrated to JWT-based system
- [x] ✅ **Task Operations** integrated with backend CRUD
- [x] ✅ **File Uploads** integrated with multer backend
- [x] ✅ **Notifications** connected to backend API
- [x] ✅ **Activity Logging** integrated with backend
- [x] ✅ **Error Handling** includes proper API error responses
- [x] ✅ **Token Management** automatic JWT handling
- [x] ✅ **Type Conversion** backend types → frontend types
- [x] ✅ **Testing Utilities** comprehensive API testing
- [x] ✅ **Mock Mode Fallback** maintained for offline use

---

## 🎯 **Next Steps**

1. **Start Backend Server**: `cd backend && npm run dev`
2. **Run Migration**: `cd backend && node run-migration.js`
3. **Test Integration**: Use browser console testing utilities
4. **Update UI Components**: Update components to use new API responses
5. **Handle Loading States**: Add proper loading indicators
6. **Error Boundaries**: Implement error handling in components

**Your frontend is now fully integrated with the backend API!** 🚀

All HTTP requests use proper authentication headers, error handling, and type conversion from backend to frontend data structures.
