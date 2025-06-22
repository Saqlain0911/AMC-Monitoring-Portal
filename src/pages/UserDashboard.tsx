import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import TaskCard from "@/components/TaskCard";
import DeadlineAlert, { getDeadlineStatus } from "@/components/DeadlineAlert";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  Calendar,
  Trophy,
  Target,
  Zap,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  differenceInHours,
} from "date-fns";

const UserDashboard = () => {
  const { tasks, getTasksByUser, getUnreadNotifications, updateTaskStatus } =
    useTask();
  const { user } = useAuth();

  if (!user) return null;

  const userTasks = getTasksByUser(user.id);
  const unreadNotifications = getUnreadNotifications(user.id);

  // Calculate user statistics
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const pendingTasks = userTasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = userTasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const overdueTasks = userTasks.filter(
    (t) =>
      isPast(new Date(t.dueDate)) &&
      !isToday(new Date(t.dueDate)) &&
      t.status !== "completed",
  ).length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today's tasks
  const todayTasks = userTasks.filter(
    (task) => isToday(new Date(task.dueDate)) && task.status !== "completed",
  );

  // Critical tasks (overdue or due very soon)
  const criticalTasks = userTasks.filter((task) => {
    const status = getDeadlineStatus(task.dueDate, task.status);
    return status.urgency === "overdue" || status.urgency === "critical";
  });

  // Upcoming tasks (tomorrow and beyond)
  const upcomingTasks = userTasks
    .filter(
      (task) =>
        new Date(task.dueDate) > new Date() && !isToday(new Date(task.dueDate)),
    )
    .slice(0, 5);

  // Recent completed tasks
  const recentCompleted = userTasks
    .filter((t) => t.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.completedAt || 0).getTime() -
        new Date(a.completedAt || 0).getTime(),
    )
    .slice(0, 3);

  const handleTaskStatusChange = (taskId: string, status: any) => {
    updateTaskStatus(taskId, status);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to tackle today's tasks? Let's get started!
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/user/tasks">View All Tasks</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/user/history">Task History</Link>
          </Button>
        </div>
      </div>

      {/* Critical Deadline Alerts */}
      {criticalTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Critical Deadline Alerts
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {criticalTasks.map((task) => (
              <DeadlineAlert
                key={task.id}
                task={task}
                showAlert={true}
                className="animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completionRate}%
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inProgressTasks}
            </div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {overdueTasks > 0 ? "Overdue Tasks" : "Notifications"}
            </CardTitle>
            {overdueTasks > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <Bell className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${overdueTasks > 0 ? "text-red-600" : "text-orange-600"}`}
            >
              {overdueTasks > 0 ? overdueTasks : unreadNotifications.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks > 0 ? "Need immediate attention" : "Unread alerts"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Today's Priority Tasks
                  </CardTitle>
                  <CardDescription>
                    Focus on these tasks to stay on schedule
                  </CardDescription>
                </div>
                {todayTasks.length > 0 && (
                  <DeadlineAlert
                    task={todayTasks[0]}
                    className="animate-pulse"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-600">
                    You have no tasks due today. Great job!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleTaskStatusChange}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Completed
                </span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pending
                </span>
                <span className="font-medium">{pendingTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-blue-600" />
                  In Progress
                </span>
                <span className="font-medium">{inProgressTasks}</span>
              </div>
              {overdueTasks > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-red-600" />
                    Overdue
                  </span>
                  <span className="font-medium text-red-600">
                    {overdueTasks}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks with Deadline Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-600">No upcoming tasks</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-gray-600">
                          {isTomorrow(new Date(task.dueDate))
                            ? "Tomorrow"
                            : format(new Date(task.dueDate), "MMM dd")}
                        </p>
                      </div>
                      <DeadlineAlert task={task} className="text-xs" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCompleted.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Complete some tasks to see achievements
                </p>
              ) : (
                <div className="space-y-2">
                  {recentCompleted.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{task.title}</p>
                        <p className="text-xs text-gray-600">
                          {task.completedAt &&
                            format(
                              new Date(task.completedAt),
                              "MMM dd, h:mm a",
                            )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
