# AMC Portal Backend Integration Guide

## Overview

This document outlines the complete backend integration implementation for the AMC Monitoring Portal, including user activity tracking, data persistence, and real-time updates.

## Architecture

### Frontend Stack

- **React 18** with TypeScript
- **React Query (TanStack Query)** for state management and caching
- **React Router 6** for navigation
- **Tailwind CSS** with shadcn/ui components
- **WebSocket** for real-time updates

### Backend Requirements

The frontend is designed to work with a REST API backend that provides:

- User authentication with JWT tokens
- Task management CRUD operations
- Real-time notifications
- User activity tracking
- File upload capabilities

## Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Environment
VITE_NODE_ENV=development

# Optional configurations
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/change-password
GET  /api/auth/users (admin only)
POST /api/auth/upload-avatar
```

### Task Management Endpoints

```
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
PATCH  /api/tasks/:id/assign
DELETE /api/tasks/:id
GET    /api/tasks/stats
```

### Notification Endpoints

```
GET    /api/notifications
GET    /api/notifications/unread
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
```

### Activity Tracking Endpoints

```
POST   /api/activities
GET    /api/activities
GET    /api/activities/stats
POST   /api/activities/bulk
DELETE /api/activities/cleanup
```

### Remarks Endpoints

```
GET    /api/remarks
POST   /api/remarks
PATCH  /api/remarks/:id/respond
DELETE /api/remarks/:id
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  post: string;
  department: string;
  joinDate: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Task Model

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  category: "daily" | "weekly" | "monthly";
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  assignedBy: string;
  dueDate: string;
  estimatedTime: number;
  actualTime?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### Activity Model

```typescript
interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
}

type ActivityType =
  | "login"
  | "logout"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_assigned"
  | "profile_updated"
  | "password_changed"
  | "remark_added"
  | "notification_read"
  | "file_uploaded"
  | "dashboard_viewed"
  | "report_generated"
  | "user_registered";
```

## Features

### 1. Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (admin/user)
- Automatic token refresh
- Offline authentication fallback
- Activity tracking for all auth events

### 2. Task Management

- CRUD operations for tasks
- Category-based organization (daily/weekly/monthly)
- Deadline-based priority system
- Real-time task updates via WebSocket
- Task assignment and status tracking
- Smart due date generation

### 3. User Activity Tracking

- Comprehensive activity logging
- Activity types for all user actions
- Offline activity queue with sync
- Activity statistics and analytics
- Admin activity monitoring

### 4. Real-time Updates

- WebSocket connection for live updates
- Automatic reconnection with exponential backoff
- Real-time notifications
- Live task status changes
- Cross-user collaboration updates

### 5. Offline Support

- Offline data caching
- Offline activity queue
- Fallback to localStorage
- Automatic sync when online
- Network status detection

### 6. Data Persistence

- React Query for intelligent caching
- Optimistic updates
- Background data synchronization
- Error handling and retry logic
- Cache invalidation strategies

## Key Service Files

### API Layer

- `src/services/api.ts` - Base API configuration
- `src/services/authService.ts` - Authentication operations
- `src/services/taskService.ts` - Task and notification operations
- `src/services/activityService.ts` - Activity tracking

### React Query Integration

- `src/hooks/useQuery.ts` - Custom query hooks
- `src/providers/QueryProvider.tsx` - Query client configuration

### Updated Contexts

- `src/context/AuthContext.tsx` - Enhanced with backend integration
- `src/context/TaskContextWithQuery.tsx` - React Query implementation

## Usage Examples

### Authentication

```typescript
const { login, logout, user, isLoading } = useAuth();

// Login
const handleLogin = async () => {
  const success = await login(email, password, role);
  if (success) {
    // Automatically tracks login activity
    navigate("/dashboard");
  }
};
```

### Task Management

```typescript
const { tasks, createTask, updateTaskStatus } = useTask();
const createTaskMutation = useCreateTask();

// Create task with automatic activity tracking
const handleCreateTask = async (taskData) => {
  await createTaskMutation.mutateAsync(taskData);
  // Activity automatically logged
};
```

### Activity Tracking

```typescript
const activityTracker = useActivityTracker();

// Manual activity logging
await activityTracker.logActivity(
  "report_generated",
  "Generated monthly report",
  { reportType: "monthly", filters: {...} }
);

// Predefined activity trackers
await activityTracker.trackTaskCompleted(taskId, taskTitle, duration);
```

## Error Handling

### API Error Handling

- Custom `ApiError` class with status codes
- Automatic retry logic for network errors
- Graceful degradation for offline scenarios
- User-friendly error messages

### Query Error Handling

- Global error boundary
- Query-specific error states
- Automatic error recovery
- Error reporting integration ready

## Performance Optimizations

### Caching Strategy

- Smart cache invalidation
- Background data updates
- Optimistic UI updates
- Stale-while-revalidate pattern

### Network Optimization

- Request deduplication
- Parallel query execution
- Intelligent refetch timing
- Bandwidth-aware loading

## Security Features

### Token Management

- Secure token storage
- Automatic token refresh
- Token expiration handling
- Secure logout

### Activity Monitoring

- Session tracking
- IP address logging
- User agent tracking
- Suspicious activity detection

## Development Setup

### 1. Install Dependencies

All required dependencies are already included in `package.json`.

### 2. Environment Configuration

```bash
cp .env.example .env
# Update API URLs in .env file
```

### 3. Backend Requirements

The backend should implement the API endpoints listed above. A sample Node.js/Express backend structure is recommended.

### 4. WebSocket Server

Set up WebSocket server for real-time updates:

```javascript
// Sample WebSocket events
ws.emit("TASK_UPDATED", { taskId, changes });
ws.emit("TASK_ASSIGNED", { taskId, userId });
ws.emit("NOTIFICATION_CREATED", { userId, notification });
```

## Testing

### API Integration Testing

```bash
npm run test:api
```

### E2E Testing

```bash
npm run test:e2e
```

## Deployment

### Environment Variables

Set production environment variables:

```bash
VITE_API_BASE_URL=https://api.yourcompany.com/api
VITE_WS_URL=wss://api.yourcompany.com
VITE_NODE_ENV=production
```

### Build

```bash
npm run build
```

## Monitoring & Analytics

### Activity Analytics

- User engagement metrics
- Task completion rates
- System usage patterns
- Performance monitoring

### Error Tracking

Ready for integration with services like:

- Sentry for error tracking
- DataDog for performance monitoring
- Custom analytics dashboard
