import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useTask } from "@/context/TaskContext";
import TaskCard from "@/components/TaskCard";
import AlertBadge from "@/components/AlertBadge";
import ModernChart from "@/components/charts/ModernChart";
import {
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { format, subDays, isAfter, isBefore } from "date-fns";

const TaskMonitor = () => {
  const { tasks } = useTask();
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7days");

  // Mock users for filtering
  const mockUsers = [
    { id: "all", name: "All Users" },
    { id: "2", name: "John Doe" },
    { id: "3", name: "Jane Smith" },
    { id: "4", name: "Mike Johnson" },
    { id: "5", name: "Sarah Wilson" },
  ];

  // Filter tasks based on selected criteria
  const filteredTasks = tasks.filter((task) => {
    if (selectedUser !== "all" && task.assignedTo !== selectedUser)
      return false;
    if (selectedCategory !== "all" && task.category !== selectedCategory)
      return false;
    if (selectedStatus !== "all" && task.status !== selectedStatus)
      return false;

    // Time range filter
    if (timeRange !== "all") {
      const taskDate = new Date(task.createdAt);
      const daysAgo = parseInt(timeRange.replace("days", ""));
      const cutoffDate = subDays(new Date(), daysAgo);
      if (isBefore(taskDate, cutoffDate)) return false;
    }

    return true;
  });

  // Calculate statistics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const pendingTasks = filteredTasks.filter(
    (t) => t.status === "pending",
  ).length;
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const overdueTasks = filteredTasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed",
  ).length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart data for task completion over time
  const completionTrendData = {
    labels: Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, "MMM dd");
    }),
    datasets: [
      {
        label: "Completed",
        data: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dayTasks = tasks.filter((task) => {
            const taskDate = new Date(task.completedAt || task.createdAt);
            return (
              format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
            );
          });
          return dayTasks.filter((t) => t.status === "completed").length;
        }),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Pending",
        data: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dayTasks = tasks.filter((task) => {
            const taskDate = new Date(task.createdAt);
            return (
              format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
            );
          });
          return dayTasks.filter((t) => t.status === "pending").length;
        }),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "In Progress",
        data: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dayTasks = tasks.filter((task) => {
            const taskDate = new Date(task.createdAt);
            return (
              format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
            );
          });
          return dayTasks.filter((t) => t.status === "in-progress").length;
        }),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  // User performance data
  const userPerformanceData = {
    labels: mockUsers.slice(1).map((user) => user.name.split(" ")[0]),
    datasets: [
      {
        label: "Completed",
        data: mockUsers.slice(1).map((user) => {
          const userTasks = tasks.filter((t) => t.assignedTo === user.id);
          return userTasks.filter((t) => t.status === "completed").length;
        }),
        backgroundColor: "#10b981",
        borderColor: "#10b981",
        borderWidth: 1,
      },
      {
        label: "Pending",
        data: mockUsers.slice(1).map((user) => {
          const userTasks = tasks.filter((t) => t.assignedTo === user.id);
          return userTasks.filter((t) => t.status === "pending").length;
        }),
        backgroundColor: "#f59e0b",
        borderColor: "#f59e0b",
        borderWidth: 1,
      },
      {
        label: "Overdue",
        data: mockUsers.slice(1).map((user) => {
          const userTasks = tasks.filter((t) => t.assignedTo === user.id);
          return userTasks.filter(
            (t) => new Date(t.dueDate) < new Date() && t.status !== "completed",
          ).length;
        }),
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        borderWidth: 1,
      },
    ],
  };

  // Task distribution by category
  const categoryData = {
    labels: ["Daily", "Weekly", "Monthly"],
    datasets: [
      {
        label: "Completed",
        data: [
          filteredTasks.filter(
            (t) => t.category === "daily" && t.status === "completed",
          ).length,
          filteredTasks.filter(
            (t) => t.category === "weekly" && t.status === "completed",
          ).length,
          filteredTasks.filter(
            (t) => t.category === "monthly" && t.status === "completed",
          ).length,
        ],
        backgroundColor: "#10b981",
        borderColor: "#10b981",
        borderWidth: 1,
      },
      {
        label: "Pending",
        data: [
          filteredTasks.filter(
            (t) => t.category === "daily" && t.status === "pending",
          ).length,
          filteredTasks.filter(
            (t) => t.category === "weekly" && t.status === "pending",
          ).length,
          filteredTasks.filter(
            (t) => t.category === "monthly" && t.status === "pending",
          ).length,
        ],
        backgroundColor: "#f59e0b",
        borderColor: "#f59e0b",
        borderWidth: 1,
      },
      {
        label: "Overdue",
        data: [
          filteredTasks.filter(
            (t) =>
              t.category === "daily" &&
              new Date(t.dueDate) < new Date() &&
              t.status !== "completed",
          ).length,
          filteredTasks.filter(
            (t) =>
              t.category === "weekly" &&
              new Date(t.dueDate) < new Date() &&
              t.status !== "completed",
          ).length,
          filteredTasks.filter(
            (t) =>
              t.category === "monthly" &&
              new Date(t.dueDate) < new Date() &&
              t.status !== "completed",
          ).length,
        ],
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        borderWidth: 1,
      },
    ],
  };

  // Priority distribution
  const priorityData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        data: [
          filteredTasks.filter((t) => t.priority === "high").length,
          filteredTasks.filter((t) => t.priority === "medium").length,
          filteredTasks.filter((t) => t.priority === "low").length,
        ],
        backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Monitor</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and analytics for all tasks
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUser("all");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setTimeRange("7days");
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <Progress value={100} className="mt-2" />
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
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inProgressTasks}
            </div>
            <Progress
              value={totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingTasks}
            </div>
            <Progress
              value={totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueTasks}
            </div>
            <Progress
              value={totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="completion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="completion">Completion Trends</TabsTrigger>
          <TabsTrigger value="performance">User Performance</TabsTrigger>
          <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
          <TabsTrigger value="priority">Priority Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="completion">
          <ModernChart
            type="line"
            title="Task Completion Trend"
            description="Daily task completion overview"
            data={completionTrendData}
          />
        </TabsContent>

        <TabsContent value="performance">
          <ModernChart
            type="bar"
            title="User Performance Analysis"
            description="Individual user task completion efficiency"
            data={userPerformanceData}
          />
        </TabsContent>

        <TabsContent value="distribution">
          <ModernChart
            type="bar"
            title="Task Distribution by Category"
            description="Breakdown of tasks across different categories"
            data={categoryData}
          />
        </TabsContent>

        <TabsContent value="priority">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernChart
              type="doughnut"
              title="Priority Distribution"
              description="Task breakdown by priority levels"
              data={priorityData}
            />

            <Card>
              <CardHeader>
                <CardTitle>High Priority Tasks</CardTitle>
                <CardDescription>
                  Tasks requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks
                    .filter((task) => task.priority === "high")
                    .slice(0, 5)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        compact
                        showAssignee
                      />
                    ))}
                  {filteredTasks.filter((task) => task.priority === "high")
                    .length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-600">No high priority tasks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskMonitor;
