import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import ModernChart from "@/components/charts/ModernChart";
import DeadlineAlert, { getDeadlineStatus } from "@/components/DeadlineAlert";
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Bell,
  BarChart3,
  Settings,
  TrendingUp,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow } from "date-fns";

const AdminDashboard = () => {
  const { tasks, notifications, getTasksByUser } = useTask();
  const { user } = useAuth();

  // Calculate overall statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed",
  ).length;

  // Get critical deadline tasks
  const criticalTasks = tasks.filter((task) => {
    const status = getDeadlineStatus(task.dueDate, task.status);
    return status.urgency === "overdue" || status.urgency === "critical";
  });

  // Today's tasks across all users
  const todayTasks = tasks.filter((task) => isToday(new Date(task.dueDate)));

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mock users for activity
  const mockUsers = [
    { id: "2", name: "John Doe", post: "IT Technician", active: true },
    { id: "3", name: "Jane Smith", post: "Network Engineer", active: true },
    { id: "4", name: "Mike Johnson", post: "System Admin", active: false },
    {
      id: "5",
      name: "Sarah Wilson",
      post: "Security Specialist",
      active: true,
    },
  ];

  const activeUsers = mockUsers.filter((u) => u.active).length;

  // Data for charts
  const taskCompletionData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Completed Tasks",
        data: [12, 19, 15, 17, 14, 22, 18],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
      {
        label: "Total Tasks",
        data: [15, 22, 18, 20, 17, 25, 21],
        borderColor: "rgb(156, 163, 175)",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
      },
    ],
  };

  const taskStatusData = {
    labels: ["Completed", "In Progress", "Pending", "Overdue"],
    datasets: [
      {
        data: [completedTasks, inProgressTasks, pendingTasks, overdueTasks],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(156, 163, 175, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "white",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of system performance and task management
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/admin/tasks">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Critical Deadline Alerts */}
      {criticalTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Deadline Alerts ({criticalTasks.length})
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {criticalTasks.slice(0, 3).map((task) => (
              <DeadlineAlert
                key={task.id}
                task={task}
                showAlert={true}
                className="animate-pulse"
              />
            ))}
            {criticalTasks.length > 3 && (
              <div className="text-sm text-red-600 text-center">
                +{criticalTasks.length - 3} more critical tasks require
                attention
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingTasks}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {overdueTasks > 0 ? "Overdue Tasks" : "Active Users"}
            </CardTitle>
            {overdueTasks > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <Users className="h-4 w-4 text-blue-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${overdueTasks > 0 ? "text-red-600" : "text-blue-600"}`}
            >
              {overdueTasks > 0 ? overdueTasks : activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks > 0
                ? "Need immediate attention"
                : "Currently online"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
              <CardDescription>
                Daily task completion over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModernChart type="line" data={taskCompletionData} />
            </CardContent>
          </Card>

          {/* Task Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>
                Current breakdown of all tasks by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModernChart type="doughnut" data={taskStatusData} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tasks Due Today</span>
                <span className="font-medium">{todayTasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed Today</span>
                <span className="font-medium text-green-600">
                  {
                    tasks.filter(
                      (t) =>
                        t.status === "completed" &&
                        t.completedAt &&
                        isToday(new Date(t.completedAt)),
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <span className="font-medium text-blue-600">
                  {inProgressTasks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Unread Notifications</span>
                <span className="font-medium text-orange-600">
                  {unreadNotifications}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks with Deadline Status */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-gray-600">
                          {task.assignedTo
                            ? `Assigned to User ${task.assignedTo}`
                            : "Unassigned"}
                        </p>
                      </div>
                      <DeadlineAlert task={task} className="text-xs" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Health</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Network Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Stable</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backup Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-orange-600">In Progress</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
