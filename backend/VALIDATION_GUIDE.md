# 🔒 API Request Validation Guide

## ✅ **Validation Status: COMPLETE**

All API endpoints now include comprehensive request validation using **express-validator** middleware.

---

## 📋 **Validation Overview**

### **✅ What's Validated:**

- **Data Types** - Ensures correct types (string, integer, boolean, etc.)
- **Required Fields** - Validates mandatory fields are present
- **String Lengths** - Enforces minimum and maximum character limits
- **Enum Values** - Validates against allowed options (status, priority, role)
- **Email Formats** - Validates proper email format
- **Date Formats** - Ensures valid ISO 8601 dates
- **Number Ranges** - Validates integer and float ranges
- **Special Characters** - Prevents injection attacks
- **File Types** - Validates allowed file extensions and sizes

### **🛡️ Security Features:**

- **SQL Injection Prevention** - Input sanitization
- **XSS Protection** - HTML encoding and validation
- **Type Safety** - Strict type checking
- **Length Limits** - Prevents buffer overflow attacks
- **Format Validation** - Regex pattern matching for usernames, etc.

---

## 🔐 **Authentication Validation**

### **POST /api/auth/register**

```typescript
// Required validations:
{
  username: string (3-50 chars, alphanumeric + dots/hyphens/underscores only),
  password: string (min 8 chars, must include uppercase, lowercase, number, special char),
  role?: "admin" | "user",
  email?: valid email format,
  full_name?: string (1-100 chars),
  phone?: valid phone number,
  department?: string (1-50 chars)
}

// Example error response:
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "statusCode": 400,
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "value": "weakpass"
    }
  ]
}
```

### **POST /api/auth/login**

```typescript
// Required validations:
{
  username: string (3-50 chars, alphanumeric + dots/hyphens/underscores only),
  password: string (min 6 chars)
}
```

---

## 📋 **Task Validation**

### **POST /api/tasks**

```typescript
// Required validations:
{
  title: string (required, 1-200 chars),
  description?: string (max 2000 chars),
  status?: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold",
  priority?: "low" | "medium" | "high" | "urgent",
  assigned_to?: integer (positive),
  due_date?: ISO 8601 date string,
  estimated_hours?: float (0-1000),
  tags?: string (max 500 chars),
  location?: string (max 100 chars),
  equipment_id?: string (max 50 chars)
}

// Example validation errors:
{
  "errors": [
    {
      "field": "title",
      "message": "Title is required",
      "value": ""
    },
    {
      "field": "assigned_to",
      "message": "Assigned user ID must be a positive integer",
      "value": "invalid"
    },
    {
      "field": "status",
      "message": "Status must be one of: pending, in_progress, completed, cancelled, on_hold",
      "value": "invalid_status"
    }
  ]
}
```

### **PUT /api/tasks/:id**

```typescript
// ID validation:
params: {
  id: integer (positive) // Task ID must be a positive integer
}

// Body validation (all fields optional for updates):
{
  title?: string (1-200 chars),
  description?: string (max 2000 chars),
  status?: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold",
  priority?: "low" | "medium" | "high" | "urgent",
  assigned_to?: integer (positive),
  due_date?: ISO 8601 date string,
  estimated_hours?: float (0-1000),
  actual_hours?: float (0-1000),
  tags?: string (max 500 chars),
  location?: string (max 100 chars),
  equipment_id?: string (max 50 chars)
}
```

### **GET /api/tasks (Query Parameters)**

```typescript
// Query validation:
{
  page?: integer (min 1),
  limit?: integer (1-100),
  status?: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold",
  priority?: "low" | "medium" | "high" | "urgent",
  assigned_to?: integer (positive),
  created_by?: integer (positive)
}
```

### **GET /api/tasks/:id**

```typescript
// ID validation:
params: {
  id: integer(positive); // Task ID must be a positive integer
}
```

---

## 📊 **Activity Validation**

### **POST /api/activities**

```typescript
// Required validations:
{
  action: string (required, 1-100 chars),
  description?: string (max 1000 chars),
  task_id?: integer (positive),
  old_value?: string (max 500 chars),
  new_value?: string (max 500 chars)
}
```

### **GET /api/activities (Query Parameters)**

```typescript
// Query validation:
{
  page?: integer (min 1),
  limit?: integer (1-100),
  task_id?: integer (positive),
  user_id?: integer (positive),
  action?: string (1-100 chars),
  start_date?: ISO 8601 date string,
  end_date?: ISO 8601 date string
}
```

---

## 🔔 **Notification Validation**

### **POST /api/notifications (Admin Only)**

```typescript
// Required validations:
{
  user_id: integer (required, positive),
  title: string (required, 1-200 chars),
  message: string (required, 1-1000 chars),
  type?: "info" | "warning" | "error" | "success",
  action_url?: valid URL,
  related_task_id?: integer (positive),
  expires_at?: ISO 8601 date string
}
```

### **PUT /api/notifications/:id**

```typescript
// ID validation:
params: {
  id: integer (positive) // Notification ID must be a positive integer
}

// Body validation:
{
  read_status?: boolean
}
```

### **GET /api/notifications (Query Parameters)**

```typescript
// Query validation:
{
  page?: integer (min 1),
  limit?: integer (1-100),
  read_status?: boolean,
  type?: "info" | "warning" | "error" | "success",
  include_expired?: boolean
}
```

---

## 🧪 **Testing Validation**

### **Run Validation Tests:**

```bash
# Start backend server
cd backend
npm run dev

# Run validation tests
node test-validation.js
```

### **Manual Testing Examples:**

```bash
# Test invalid task creation
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response:
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "statusCode": 400,
  "errors": [
    {
      "field": "title",
      "message": "Title is required",
      "value": undefined
    }
  ]
}

# Test invalid registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "ab", "password": "weak"}'

# Expected response:
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "statusCode": 400,
  "errors": [
    {
      "field": "username",
      "message": "Username must be between 3 and 50 characters",
      "value": "ab"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "weak"
    }
  ]
}
```

---

## 🔧 **Validation Middleware Architecture**

### **File Structure:**

```
backend/middleware/validation.js
├── handleValidationErrors() - Error handling middleware
├── commonValidations{} - Reusable validation rules
├── authValidation{} - Authentication endpoint validations
├── taskValidation{} - Task endpoint validations
├── activityValidation{} - Activity endpoint validations
├── notificationValidation{} - Notification endpoint validations
├── fileValidation{} - File upload validations
└── customValidators{} - Custom validation functions
```

### **Usage in Routes:**

```javascript
import { taskValidation } from "../middleware/validation.js";

// Apply validation middleware before route handler
router.post("/tasks", taskValidation.create, async (req, res) => {
  // Request has already been validated
  // No need for manual validation checks
});
```

### **Error Response Format:**

```javascript
// Standardized validation error response
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "statusCode": 400,
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message",
      "value": "invalid_value"
    }
  ]
}
```

---

## 🛡️ **Security Validations**

### **Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

### **Username Requirements:**

- 3-50 characters
- Alphanumeric characters only
- Dots (.), hyphens (-), and underscores (\_) allowed
- No spaces or special characters

### **Input Sanitization:**

- HTML encoding for all text inputs
- SQL injection prevention through parameterized queries
- XSS protection through input validation
- Length limits to prevent buffer overflow

### **File Upload Validation:**

- File type restrictions (images, documents, archives)
- File size limits (10MB maximum)
- Maximum 5 files per request
- Filename sanitization

---

## 📈 **Validation Benefits**

### **✅ Data Integrity:**

- Ensures consistent data format
- Prevents corrupted database entries
- Validates business rules

### **🔒 Security:**

- Prevents injection attacks
- Input sanitization
- Type safety enforcement

### **🐛 Error Prevention:**

- Clear error messages for developers
- Prevents 500 errors from invalid data
- Early validation before database operations

### **📚 API Documentation:**

- Self-documenting through validation rules
- Clear requirements for API consumers
- Standardized error responses

---

## 🎯 **Summary**

**✅ All API endpoints now include comprehensive validation:**

- **Authentication** - Secure user registration and login
- **Tasks** - Complete CRUD validation with business rules
- **Activities** - Activity logging validation
- **Notifications** - Notification management validation
- **File Uploads** - File type and size validation

**🛡️ Security Features:**

- SQL injection prevention
- XSS protection
- Input sanitization
- Type safety
- Length limits

**🧪 Testing:**

- Comprehensive validation test suite
- Manual testing examples
- Error response documentation

**Your API is now production-ready with enterprise-grade validation!** 🚀
