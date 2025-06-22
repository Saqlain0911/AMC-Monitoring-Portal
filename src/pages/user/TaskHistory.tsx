import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import TaskCard from "@/components/TaskCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Download,
} from "lucide-react";
import {
  format,
  subDays,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

const TaskHistory = () => {
  const { getTasksByUser } = useTask();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7days");

  if (!user) return null;

  const userTasks = getTasksByUser(user.id);
  const completedTasks = userTasks.filter((t) => t.status === "completed");

  // Filter tasks based on criteria
  const filteredTasks = completedTasks.filter((task) => {
    // Search filter
    if (
      searchTerm &&
      !task.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && task.category !== selectedCategory) {
      return false;
    }

    // Time range filter
    if (timeRange !== "all" && task.completedAt) {
      const taskDate = new Date(task.completedAt);
      const now = new Date();

      switch (timeRange) {
        case "7days":
          return isAfter(taskDate, subDays(now, 7));
        case "30days":
          return isAfter(taskDate, subDays(now, 30));
        case "thisweek":
          return (
            isAfter(taskDate, startOfWeek(now)) &&
            isBefore(taskDate, endOfWeek(now))
          );
        case "thismonth":
          return (
            isAfter(taskDate, startOfMonth(now)) &&
            isBefore(taskDate, endOfMonth(now))
          );
        default:
          return true;
      }
    }

    return true;
  });

  // Calculate statistics
  const totalCompleted = filteredTasks.length;
  const totalTimeSpent = filteredTasks.reduce(
    (acc, task) => acc + (task.actualTime || 0),
    0,
  );
  const averageTime =
    totalCompleted > 0 ? Math.round(totalTimeSpent / totalCompleted) : 0;
  const onTimeCompletions = filteredTasks.filter(
    (task) => new Date(task.completedAt || 0) <= new Date(task.dueDate),
  ).length;
  const onTimeRate =
    totalCompleted > 0
      ? Math.round((onTimeCompletions / totalCompleted) * 100)
      : 0;

  // Chart data for daily completion trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTasks = filteredTasks.filter((task) => {
      if (!task.completedAt) return false;
      const taskDate = new Date(task.completedAt);
      return format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });

    return {
      date: format(date, "MMM dd"),
      completed: dayTasks.length,
      totalTime: dayTasks.reduce(
        (acc, task) => acc + (task.actualTime || 0),
        0,
      ),
    };
  });

  // Category completion stats
  const categoryStats = ["daily", "weekly", "monthly"].map((category) => {
    const categoryTasks = filteredTasks.filter((t) => t.category === category);
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1),
      completed: categoryTasks.length,
      avgTime:
        categoryTasks.length > 0
          ? Math.round(
              categoryTasks.reduce(
                (acc, task) => acc + (task.actualTime || 0),
                0,
              ) / categoryTasks.length,
            )
          : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task History</h1>
          <p className="text-gray-600 mt-1">
            Review your completed tasks and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalCompleted}
            </div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(totalTimeSpent / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTimeSpent} minutes total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {averageTime}m
            </div>
            <p className="text-xs text-muted-foreground">Per task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {onTimeRate}%
            </div>
            <p className="text-xs text-muted-foreground">Completed on time</p>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="thisweek">This week</SelectItem>
                  <SelectItem value="thismonth">This month</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setTimeRange("7days");
                }}
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Completion Trend</CardTitle>
            <CardDescription>
              Your task completion over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Tasks Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Completion stats by task category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="completed"
                  fill="#3b82f6"
                  name="Completed Tasks"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Completed Tasks ({filteredTasks.length})</CardTitle>
              <CardDescription>
                Detailed list of your completed tasks
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No completed tasks found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or complete some tasks to see them
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks
                .sort(
                  (a, b) =>
                    new Date(b.completedAt || 0).getTime() -
                    new Date(a.completedAt || 0).getTime(),
                )
                .map((task) => (
                  <div key={task.id} className="space-y-2">
                    <TaskCard task={task} compact />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 px-3">
                      <div>
                        <span className="font-medium">Completed:</span>{" "}
                        {task.completedAt &&
                          format(
                            new Date(task.completedAt),
                            "MMM dd, yyyy h:mm a",
                          )}
                      </div>
                      <div>
                        <span className="font-medium">Time Taken:</span>{" "}
                        {task.actualTime || 0} minutes
                      </div>
                      <div>
                        <span className="font-medium">Estimated:</span>{" "}
                        {task.estimatedTime} minutes
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={
                            new Date(task.completedAt || 0) <=
                            new Date(task.dueDate)
                              ? "default"
                              : "destructive"
                          }
                        >
                          {new Date(task.completedAt || 0) <=
                          new Date(task.dueDate)
                            ? "On Time"
                            : "Late"}
                        </Badge>
                      </div>
                    </div>
                    {task.remarks && (
                      <div className="px-3 py-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Remarks:</span>{" "}
                        {task.remarks}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskHistory;
