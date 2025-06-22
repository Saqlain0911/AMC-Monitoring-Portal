import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Login from "./pages/Login";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import TaskManagement from "./pages/admin/TaskManagement";
import TaskMonitor from "./pages/admin/TaskMonitor";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminRemarks from "./pages/admin/AdminRemarks";
import EquipmentMaintenance from "./pages/admin/EquipmentMaintenance";
import UserTasks from "./pages/user/UserTasks";
import TaskHistory from "./pages/user/TaskHistory";
import UserRemarks from "./pages/user/UserRemarks";
import UserSchedule from "./pages/user/UserSchedule";
import UserNotifications from "./pages/user/UserNotifications";
import UserReports from "./pages/user/UserReports";
import AdminProfile from "./pages/admin/AdminProfile";
import UserProfile from "./pages/user/UserProfile";
import NotFound from "./pages/NotFound";

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: "admin" | "user";
}) => {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Main App Router
const AppRouter = () => {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AMC Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="monitor" element={<TaskMonitor />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="maintenance" element={<EquipmentMaintenance />} />
        <Route path="remarks" element={<AdminRemarks />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRole="user">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="tasks" element={<UserTasks />} />
        <Route path="history" element={<TaskHistory />} />
        <Route path="schedule" element={<UserSchedule />} />
        <Route path="remarks" element={<UserRemarks />} />
        <Route path="notifications" element={<UserNotifications />} />
        <Route path="reports" element={<UserReports />} />
        <Route path="profile" element={<UserProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TaskProvider>
            <AppRouter />
          </TaskProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
