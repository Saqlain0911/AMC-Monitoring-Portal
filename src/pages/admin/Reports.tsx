import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTask } from "@/context/TaskContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  FileText,
  Download,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

const Reports = () => {
  const { tasks } = useTask();
  const [timeRange, setTimeRange] = useState<string>("30days");

  // Filter tasks based on time range
  const getFilteredTasks = () => {
    const now = new Date();
    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);

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

  // Calculate key metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const pendingTasks = filteredTasks.filter(
    (t) => t.status === "pending",
  ).length;
  const overdueTasks = filteredTasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed",
  ).length;
  const complianceRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Daily completion trend
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTasks = filteredTasks.filter((task) => {
      const taskDate = new Date(task.completedAt || task.createdAt);
      return format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });

    return {
      date: format(date, "MMM dd"),
      completed: dayTasks.filter((t) => t.status === "completed").length,
      created: dayTasks.length,
      compliance:
        dayTasks.length > 0
          ? Math.round(
              (dayTasks.filter((t) => t.status === "completed").length /
                dayTasks.length) *
                100,
            )
          : 0,
    };
  });

  // Category breakdown
  const categoryData = [
    {
      category: "Daily",
      total: filteredTasks.filter((t) => t.category === "daily").length,
      completed: filteredTasks.filter(
        (t) => t.category === "daily" && t.status === "completed",
      ).length,
      pending: filteredTasks.filter(
        (t) => t.category === "daily" && t.status === "pending",
      ).length,
      overdue: filteredTasks.filter(
        (t) =>
          t.category === "daily" &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed",
      ).length,
    },
    {
      category: "Weekly",
      total: filteredTasks.filter((t) => t.category === "weekly").length,
      completed: filteredTasks.filter(
        (t) => t.category === "weekly" && t.status === "completed",
      ).length,
      pending: filteredTasks.filter(
        (t) => t.category === "weekly" && t.status === "pending",
      ).length,
      overdue: filteredTasks.filter(
        (t) =>
          t.category === "weekly" &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed",
      ).length,
    },
    {
      category: "Monthly",
      total: filteredTasks.filter((t) => t.category === "monthly").length,
      completed: filteredTasks.filter(
        (t) => t.category === "monthly" && t.status === "completed",
      ).length,
      pending: filteredTasks.filter(
        (t) => t.category === "monthly" && t.status === "pending",
      ).length,
      overdue: filteredTasks.filter(
        (t) =>
          t.category === "monthly" &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed",
      ).length,
    },
  ];

  // Priority distribution
  const priorityData = [
    {
      name: "High",
      value: filteredTasks.filter((t) => t.priority === "high").length,
      color: "#ef4444",
    },
    {
      name: "Medium",
      value: filteredTasks.filter((t) => t.priority === "medium").length,
      color: "#f59e0b",
    },
    {
      name: "Low",
      value: filteredTasks.filter((t) => t.priority === "low").length,
      color: "#10b981",
    },
  ];

  // Status distribution
  const statusData = [
    { name: "Completed", value: completedTasks, color: "#10b981" },
    { name: "Pending", value: pendingTasks, color: "#f59e0b" },
    {
      name: "In Progress",
      value: filteredTasks.filter((t) => t.status === "in-progress").length,
      color: "#3b82f6",
    },
    { name: "Overdue", value: overdueTasks, color: "#ef4444" },
  ];

  // Performance by time (weekly averages)
  const weeklyPerformance = Array.from({ length: 4 }, (_, i) => {
    const weekStart = subDays(new Date(), (3 - i + 1) * 7);
    const weekEnd = subDays(new Date(), (3 - i) * 7);
    const weekTasks = filteredTasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    return {
      week: `Week ${i + 1}`,
      tasks: weekTasks.length,
      completed: weekTasks.filter((t) => t.status === "completed").length,
      compliance:
        weekTasks.length > 0
          ? Math.round(
              (weekTasks.filter((t) => t.status === "completed").length /
                weekTasks.length) *
                100,
            )
          : 0,
    };
  });

  // Mock incident data
  const incidentData = [
    { type: "Network", count: 3, severity: "high" },
    { type: "Hardware", count: 7, severity: "medium" },
    { type: "Software", count: 2, severity: "high" },
    { type: "Security", count: 1, severity: "high" },
    { type: "Environmental", count: 4, severity: "low" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into system performance and compliance
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
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              {complianceRate}% completion rate
            </p>
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
            <p className="text-xs text-muted-foreground">Awaiting action</p>
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
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {complianceRate}%
            </div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Task Completion Trend</CardTitle>
                <CardDescription>
                  Tasks created and completed over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Created"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.8}
                      name="Completed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>
                  Current breakdown of all task statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Compliance Trend</CardTitle>
                <CardDescription>
                  Task completion compliance over the last 4 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Compliance Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="compliance"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>
                  Task breakdown by priority levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Performance by Category</CardTitle>
              <CardDescription>
                Detailed breakdown of tasks across daily, weekly, and monthly
                categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reports</CardTitle>
                <CardDescription>
                  Types and frequency of reported incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Summary</CardTitle>
                <CardDescription>
                  Recent incident logs and their severity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {incidentData.map((incident, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          incident.severity === "high"
                            ? "bg-red-500"
                            : incident.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{incident.type}</p>
                        <p className="text-sm text-gray-600">
                          {incident.count} incidents
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {incident.severity} priority
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
