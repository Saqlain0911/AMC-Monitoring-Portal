import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import TaskCard from "@/components/TaskCard";
import AlertBadge from "@/components/AlertBadge";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isToday,
  isTomorrow,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
} from "date-fns";

const UserSchedule = () => {
  const { getTasksByUser, updateTaskStatus } = useTask();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  if (!user) return null;

  const userTasks = getTasksByUser(user.id);

  // Filter tasks based on view mode and selected date
  const getTasksForDate = (date: Date) => {
    return userTasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  const getTasksForWeek = (weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart);
    return userTasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
  };

  const getTasksForMonth = (month: Date) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return userTasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });
  };

  // Get week days
  const getWeekDays = (weekStart: Date) => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const handleTaskStatusChange = (taskId: string, status: any) => {
    updateTaskStatus(taskId, status);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  const todayTasks = getTasksForDate(new Date());
  const tomorrowTasks = getTasksForDate(addDays(new Date(), 1));
  const weekTasks = getTasksForWeek(startOfWeek(currentWeek));
  const overdueTasks = userTasks.filter(
    (task) =>
      new Date(task.dueDate) < startOfDay(new Date()) &&
      task.status !== "completed",
  );

  // Statistics for quick view
  const todayStats = {
    total: todayTasks.length,
    completed: todayTasks.filter((t) => t.status === "completed").length,
    pending: todayTasks.filter((t) => t.status === "pending").length,
    inProgress: todayTasks.filter((t) => t.status === "in-progress").length,
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM dd");
  };

  const getTasksByTimeOfDay = (
    tasks: any[],
    timeSlot: "morning" | "afternoon" | "evening",
  ) => {
    // For demo purposes, we'll distribute tasks across time slots based on task type
    return tasks.filter((task, index) => {
      if (timeSlot === "morning")
        return task.category === "daily" || index % 3 === 0;
      if (timeSlot === "afternoon")
        return task.category === "weekly" || index % 3 === 1;
      if (timeSlot === "evening")
        return task.category === "monthly" || index % 3 === 2;
      return false;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-1">
            Plan and organize your tasks efficiently
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {todayStats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {todayStats.completed}
            </div>
            <p className="text-xs text-muted-foreground">Finished today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList>
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="month">Month View</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md"
                />
              </CardContent>
            </Card>

            {/* Day Schedule */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{getDateLabel(selectedDate)}</CardTitle>
                  <CardDescription>
                    {getTasksForDate(selectedDate).length} tasks scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {["morning", "afternoon", "evening"].map((timeSlot) => {
                      const tasks = getTasksByTimeOfDay(
                        getTasksForDate(selectedDate),
                        timeSlot as any,
                      );
                      return (
                        <div key={timeSlot} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <h3 className="font-medium capitalize">
                              {timeSlot}
                            </h3>
                            <Badge variant="outline" className="ml-auto">
                              {tasks.length} tasks
                            </Badge>
                          </div>
                          {tasks.length === 0 ? (
                            <p className="text-sm text-gray-500 ml-6">
                              No tasks scheduled
                            </p>
                          ) : (
                            <div className="space-y-2 ml-6">
                              {tasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  compact
                                  onStatusChange={handleTaskStatusChange}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
          {/* Week Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Week of {format(startOfWeek(currentWeek), "MMM dd, yyyy")}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(new Date())}
                  >
                    This Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {getWeekDays(startOfWeek(currentWeek)).map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const isSelectedDay = isSameDay(day, selectedDate);
                  const isTodayDay = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelectedDay
                          ? "border-blue-500 bg-blue-50"
                          : isTodayDay
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-center mb-2">
                        <p className="text-xs font-medium text-gray-600">
                          {format(day, "EEE")}
                        </p>
                        <p
                          className={`text-lg font-bold ${isTodayDay ? "text-green-600" : "text-gray-900"}`}
                        >
                          {format(day, "d")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : task.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{dayTasks.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Details */}
          {getTasksForDate(selectedDate).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tasks for {getDateLabel(selectedDate)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTasksForDate(selectedDate).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleTaskStatusChange}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="month" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>
                Task distribution for {format(selectedDate, "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md w-full"
                components={{
                  Day: ({ date, displayMonth, ...props }) => {
                    const dayTasks = getTasksForDate(date);
                    const hasOverdue = dayTasks.some(
                      (task) =>
                        new Date(task.dueDate) < new Date() &&
                        task.status !== "completed",
                    );

                    // Filter out non-DOM props
                    const { className, ...buttonProps } = props;

                    return (
                      <div className="relative">
                        <button {...buttonProps} className={className}>
                          {format(date, "d")}
                        </button>
                        {dayTasks.length > 0 && (
                          <div
                            className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                              hasOverdue ? "bg-red-500" : "bg-blue-500"
                            }`}
                          />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Month Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Tasks:</span>
                    <span className="font-medium">
                      {getTasksForMonth(selectedDate).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed:</span>
                    <span className="font-medium text-green-600">
                      {
                        getTasksForMonth(selectedDate).filter(
                          (t) => t.status === "completed",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending:</span>
                    <span className="font-medium text-yellow-600">
                      {
                        getTasksForMonth(selectedDate).filter(
                          (t) => t.status === "pending",
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Daily:</span>
                    <span className="font-medium">
                      {
                        getTasksForMonth(selectedDate).filter(
                          (t) => t.category === "daily",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Weekly:</span>
                    <span className="font-medium">
                      {
                        getTasksForMonth(selectedDate).filter(
                          (t) => t.category === "weekly",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly:</span>
                    <span className="font-medium">
                      {
                        getTasksForMonth(selectedDate).filter(
                          (t) => t.category === "monthly",
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productivity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Completion Rate:</span>
                    <span className="font-medium">
                      {getTasksForMonth(selectedDate).length > 0
                        ? Math.round(
                            (getTasksForMonth(selectedDate).filter(
                              (t) => t.status === "completed",
                            ).length /
                              getTasksForMonth(selectedDate).length) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">On Time:</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Daily:</span>
                    <span className="font-medium">
                      {Math.round(getTasksForMonth(selectedDate).length / 30)}{" "}
                      tasks
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSchedule;
