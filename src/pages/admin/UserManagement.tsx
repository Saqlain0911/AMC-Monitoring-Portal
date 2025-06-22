import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAllUsers } from "@/context/AuthContext";
import { useTask } from "@/context/TaskContext";
import { ComponentErrorBoundary } from "@/components/ErrorBoundary";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

const UserManagement = () => {
  const { tasks, getTasksByUser } = useTask();
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Load all users on component mount and when localStorage changes
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        // Filter out admin users and add extra fields for display
        const userList = users
          .filter((user) => user.role === "user")
          .map((user) => ({
            ...user,
            lastActive: new Date().toISOString(), // Mock active status
            status: "active", // Mock status
          }));
        setAllUsers(userList);
      } catch (error) {
        console.error("Failed to load users:", error);
        setAllUsers([]);
      }
    };

    loadUsers();

    // Listen for storage changes to update user list in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "amc_users") {
        loadUsers();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(loadUsers, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.post.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getUserStats = (userId: string) => {
    const userTasks = getTasksByUser(userId);
    return {
      total: userTasks.length,
      completed: userTasks.filter((t) => t.status === "completed").length,
      pending: userTasks.filter((t) => t.status === "pending").length,
      overdue: userTasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== "completed",
      ).length,
    };
  };

  const getPerformanceScore = (userId: string) => {
    const stats = getUserStats(userId);
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Inactive
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage users, monitor performance, and assign tasks
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active staff members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allUsers.filter((u) => u.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Users online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Performance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {allUsers.length > 0
                ? Math.round(
                    allUsers.reduce(
                      (acc, user) => acc + getPerformanceScore(user.id),
                      0,
                    ) / allUsers.length,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Task completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Need Attention
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                allUsers.filter((user) => {
                  const stats = getUserStats(user.id);
                  return stats.overdue > 0;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Users with overdue tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user.id);
          const performanceScore = getPerformanceScore(user.id);

          return (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>
                        {user.post} • {user.department}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Join Date:</span>
                    <p className="font-medium">
                      {format(new Date(user.joinDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Active:</span>
                    <p className="font-medium">
                      {format(new Date(user.lastActive), "MMM dd, h:mm a")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Performance:</span>
                    <p className="font-medium text-blue-600">
                      {performanceScore}%
                    </p>
                  </div>
                </div>

                {/* Task Statistics */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">Task Overview</h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {stats.total}
                      </div>
                      <div className="text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">
                        {stats.completed}
                      </div>
                      <div className="text-gray-600">Done</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">
                        {stats.pending}
                      </div>
                      <div className="text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">
                        {stats.overdue}
                      </div>
                      <div className="text-gray-600">Overdue</div>
                    </div>
                  </div>
                </div>

                {/* Performance Alerts */}
                {stats.overdue > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        {stats.overdue} overdue task
                        {stats.overdue > 1 ? "s" : ""} require attention
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const UserManagementWithErrorBoundary = () => (
  <ComponentErrorBoundary componentName="User Management">
    <UserManagement />
  </ComponentErrorBoundary>
);

export default UserManagementWithErrorBoundary;
