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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import ModernChart from "@/components/charts/ModernChart";
import {
  FileText,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
} from "date-fns";

const UserReports = () => {
  const { getTasksByUser } = useTask();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<string>("30days");
  const [reportType, setReportType] = useState<string>("performance");

  if (!user) return null;

  const userTasks = getTasksByUser(user.id);

  // Filter tasks based on time range
  const getFilteredTasks = () => {
    const now = new Date();
    return userTasks.filter((task) => {
      const taskDate = new Date(task.completedAt || task.createdAt);

      switch (timeRange) {
        case "7days":
          return taskDate >= subDays(now, 7);
        case "30days":
          return taskDate >= subDays(now, 30);
        case "90days":
          return taskDate >= subDays(now, 90);
        case "thisweek":
          return taskDate >= startOfWeek(now) && taskDate <= endOfWeek(now);
        case "thismonth":
          return taskDate >= startOfMonth(now) && taskDate <= endOfMonth(now);
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  // Calculate key metrics with NaN protection
  const totalTasks = filteredTasks.length || 0;
  const completedTasks =
    filteredTasks.filter((t) => t.status === "completed").length || 0;
  const pendingTasks =
    filteredTasks.filter((t) => t.status === "pending").length || 0;
  const inProgressTasks =
    filteredTasks.filter((t) => t.status === "in-progress").length || 0;
  const overdueTasks =
    filteredTasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== "completed",
    ).length || 0;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const onTimeCompletions =
    filteredTasks.filter(
      (task) =>
        task.status === "completed" &&
        task.completedAt &&
        new Date(task.completedAt) <= new Date(task.dueDate),
    ).length || 0;
  const onTimeRate =
    completedTasks > 0
      ? Math.round((onTimeCompletions / completedTasks) * 100)
      : 0;

  // Calculate average completion time with safety checks
  const completedTasksWithTime = filteredTasks.filter(
    (t) => t.status === "completed" && t.actualTime && !isNaN(t.actualTime),
  );
  const totalTime = completedTasksWithTime.reduce(
    (acc, task) => acc + (task.actualTime || 0),
    0,
  );
  const avgCompletionTime =
    completedTasksWithTime.length > 0 && totalTime > 0
      ? Math.round(totalTime / completedTasksWithTime.length)
      : 0;

  // Productivity score calculation with NaN protection
  const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
  const productivityScore = Math.round(
    (isNaN(completionRate) ? 0 : completionRate) * 0.4 +
      (isNaN(onTimeRate) ? 0 : onTimeRate) * 0.3 +
      (100 - (isNaN(overdueRate) ? 0 : overdueRate)) * 0.3,
  );

  // Chart data - Daily completion trend
  const dailyCompletionData = {
    labels: Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, "MMM dd");
    }),
    datasets: [
      {
        label: "Completed Tasks",
        data: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return filteredTasks.filter((task) => {
            const taskDate = new Date(task.completedAt || task.createdAt);
            return (
              format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
              task.status === "completed"
            );
          }).length;
        }),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        borderWidth: 2,
      },
      {
        label: "Total Tasks",
        data: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return filteredTasks.filter((task) => {
            const taskDate = new Date(task.createdAt);
            return (
              format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
            );
          }).length;
        }),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  // Task distribution by category
  const categoryData = {
    labels: ["Daily", "Weekly", "Monthly"],
    datasets: [
      {
        data: [
          filteredTasks.filter((t) => t.category === "daily").length,
          filteredTasks.filter((t) => t.category === "weekly").length,
          filteredTasks.filter((t) => t.category === "monthly").length,
        ],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Status distribution
  const statusData = {
    labels: ["Completed", "In Progress", "Pending", "Overdue"],
    datasets: [
      {
        data: [completedTasks, inProgressTasks, pendingTasks, overdueTasks],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Performance over time
  const performanceData = {
    labels: Array.from({ length: 4 }, (_, i) => {
      const weekStart = subDays(new Date(), (3 - i + 1) * 7);
      return `Week ${i + 1}`;
    }),
    datasets: [
      {
        label: "Completion Rate (%)",
        data: Array.from({ length: 4 }, (_, i) => {
          const weekStart = subDays(new Date(), (3 - i + 1) * 7);
          const weekEnd = subDays(new Date(), (3 - i) * 7);
          const weekTasks = filteredTasks.filter((task) => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= weekStart && taskDate <= weekEnd;
          });
          const weekCompleted = weekTasks.filter(
            (t) => t.status === "completed",
          ).length;
          return weekTasks.length > 0
            ? Math.round((weekCompleted / weekTasks.length) * 100)
            : 0;
        }),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  // Time efficiency data with NaN protection
  const timeEfficiencyData = {
    labels: ["Daily", "Weekly", "Monthly"],
    datasets: [
      {
        label: "Estimated Time",
        data: [
          filteredTasks
            .filter((t) => t.category === "daily")
            .reduce((acc, task) => acc + (task.estimatedTime || 0), 0) || 0,
          filteredTasks
            .filter((t) => t.category === "weekly")
            .reduce((acc, task) => acc + (task.estimatedTime || 0), 0) || 0,
          filteredTasks
            .filter((t) => t.category === "monthly")
            .reduce((acc, task) => acc + (task.estimatedTime || 0), 0) || 0,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
      {
        label: "Actual Time",
        data: [
          filteredTasks
            .filter((t) => t.category === "daily")
            .reduce((acc, task) => acc + (task.actualTime || 0), 0) || 0,
          filteredTasks
            .filter((t) => t.category === "weekly")
            .reduce((acc, task) => acc + (task.actualTime || 0), 0) || 0,
          filteredTasks
            .filter((t) => t.category === "monthly")
            .reduce((acc, task) => acc + (task.actualTime || 0), 0) || 0,
        ],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 1,
      },
    ],
  };

  // Helper function to safely convert to number
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  const getPerformanceLevel = (score: number) => {
    const safeScore = safeNumber(score);
    if (safeScore >= 90)
      return {
        level: "Excellent",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (safeScore >= 80)
      return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (safeScore >= 70)
      return {
        level: "Average",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return {
      level: "Needs Improvement",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  };

  const performanceLevel = getPerformanceLevel(safeNumber(productivityScore));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-1">
            Track your progress and performance analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="thisweek">This week</SelectItem>
              <SelectItem value="thismonth">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productivity Score
            </CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeNumber(productivityScore)}
            </div>
            <Badge
              className={`${performanceLevel.bgColor} ${performanceLevel.color} mt-2`}
            >
              {performanceLevel.level}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {safeNumber(completionRate)}%
            </div>
            <Progress value={safeNumber(completionRate)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {safeNumber(onTimeRate)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {safeNumber(onTimeCompletions)} of {safeNumber(completedTasks)}{" "}
              tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgCompletionTime}m
            </div>
            <p className="text-xs text-muted-foreground">Per task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="efficiency">Time Efficiency</TabsTrigger>
          <TabsTrigger value="breakdown">Task Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernChart
              type="line"
              title="Daily Task Completion"
              description="Your daily task completion trend"
              data={dailyCompletionData}
            />

            <ModernChart
              type="line"
              title="Weekly Performance Trend"
              description="Completion rate over the last 4 weeks"
              data={performanceData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function (value: any) {
                        return value + "%";
                      },
                    },
                  },
                },
              }}
            />
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Key insights about your task completion patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {completedTasks}
                  </div>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {inProgressTasks}
                  </div>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {pendingTasks}
                  </div>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {overdueTasks}
                  </div>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernChart
              type="doughnut"
              title="Task Status Distribution"
              description="Breakdown of your current task statuses"
              data={statusData}
            />

            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
                <CardDescription>
                  Key metrics and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Task Average:</span>
                    <span className="font-medium">
                      {Math.round(totalTasks / 30)} tasks/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Productive Day:</span>
                    <span className="font-medium">Monday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Performance Time:</span>
                    <span className="font-medium">10:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Streak Record:</span>
                    <span className="font-medium">7 days</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Schedule complex tasks during peak hours</li>
                    <li>• Maintain your Monday momentum throughout the week</li>
                    <li>
                      • Consider breaking larger tasks into smaller chunks
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernChart
              type="bar"
              title="Time Estimation vs Actual"
              description="How accurate are your time estimates?"
              data={timeEfficiencyData}
            />

            <Card>
              <CardHeader>
                <CardTitle>Time Efficiency Analysis</CardTitle>
                <CardDescription>
                  Your time management performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time Estimation Accuracy:</span>
                    <span className="font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Task Duration:</span>
                    <span className="font-medium">
                      {avgCompletionTime} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Time Saved:</span>
                    <span className="font-medium text-green-600">
                      2.5 hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efficiency Score:</span>
                    <span className="font-medium">Very Good</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Time Management Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• You're consistently finishing tasks early</li>
                    <li>• Consider taking on more challenging tasks</li>
                    <li>• Your estimation skills are above average</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernChart
              type="doughnut"
              title="Tasks by Category"
              description="Distribution of your tasks across categories"
              data={categoryData}
            />

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  How you perform in each task category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["daily", "weekly", "monthly"].map((category) => {
                    const categoryTasks = filteredTasks.filter(
                      (t) => t.category === category,
                    );
                    const categoryCompleted = categoryTasks.filter(
                      (t) => t.status === "completed",
                    ).length;
                    const categoryRate =
                      categoryTasks.length > 0
                        ? Math.round(
                            (categoryCompleted / categoryTasks.length) * 100,
                          )
                        : 0;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {category} Tasks
                          </span>
                          <span className="text-sm text-gray-600">
                            {categoryRate}%
                          </span>
                        </div>
                        <Progress value={categoryRate} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{categoryCompleted} completed</span>
                          <span>{categoryTasks.length} total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Task Breakdown</CardTitle>
              <CardDescription>
                Complete overview of your task statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Completed</th>
                      <th className="text-left p-2">In Progress</th>
                      <th className="text-left p-2">Pending</th>
                      <th className="text-left p-2">Overdue</th>
                      <th className="text-left p-2">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["daily", "weekly", "monthly"].map((category) => {
                      const categoryTasks = filteredTasks.filter(
                        (t) => t.category === category,
                      );
                      const stats = {
                        total: categoryTasks.length,
                        completed: categoryTasks.filter(
                          (t) => t.status === "completed",
                        ).length,
                        inProgress: categoryTasks.filter(
                          (t) => t.status === "in-progress",
                        ).length,
                        pending: categoryTasks.filter(
                          (t) => t.status === "pending",
                        ).length,
                        overdue: categoryTasks.filter(
                          (t) =>
                            new Date(t.dueDate) < new Date() &&
                            t.status !== "completed",
                        ).length,
                      };
                      const successRate =
                        stats.total > 0
                          ? Math.round((stats.completed / stats.total) * 100)
                          : 0;

                      return (
                        <tr key={category} className="border-b">
                          <td className="p-2 font-medium capitalize">
                            {category}
                          </td>
                          <td className="p-2">{stats.total}</td>
                          <td className="p-2 text-green-600">
                            {stats.completed}
                          </td>
                          <td className="p-2 text-blue-600">
                            {stats.inProgress}
                          </td>
                          <td className="p-2 text-yellow-600">
                            {stats.pending}
                          </td>
                          <td className="p-2 text-red-600">{stats.overdue}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                successRate >= 80
                                  ? "default"
                                  : successRate >= 60
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {successRate}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserReports;
