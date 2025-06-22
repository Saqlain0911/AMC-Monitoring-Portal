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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import AlertBadge from "@/components/AlertBadge";
import {
  Bell,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Volume2,
  VolumeX,
  Trash2,
  MarkAsUnread,
} from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

const UserNotifications = () => {
  const { notifications, getUnreadNotifications, markNotificationRead } =
    useTask();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [notificationSettings, setNotificationSettings] = useState({
    taskReminders: true,
    taskAssignments: true,
    systemAlerts: true,
    emailNotifications: false,
    soundNotifications: true,
  });

  if (!user) return null;

  const userNotifications = notifications.filter((n) => n.userId === user.id);
  const unreadNotifications = getUnreadNotifications(user.id);

  // Filter notifications
  const filteredNotifications = userNotifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || notification.type === selectedType;
    const matchesPriority =
      selectedPriority === "all" || notification.priority === selectedPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce(
    (groups: any, notification) => {
      const date = new Date(notification.createdAt);
      let dateKey: string;

      if (isToday(date)) {
        dateKey = "Today";
      } else if (isYesterday(date)) {
        dateKey = "Yesterday";
      } else {
        const daysAgo = differenceInDays(new Date(), date);
        if (daysAgo <= 7) {
          dateKey = `${daysAgo} days ago`;
        } else {
          dateKey = format(date, "MMM dd, yyyy");
        }
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
      return groups;
    },
    {},
  );

  // Statistics
  const totalNotifications = userNotifications.length;
  const unreadCount = unreadNotifications.length;
  const highPriorityCount = userNotifications.filter(
    (n) => n.priority === "high" && !n.read,
  ).length;
  const todayCount = userNotifications.filter((n) =>
    isToday(new Date(n.createdAt)),
  ).length;

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach((notification) => {
      markNotificationRead(notification.id);
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task-assigned":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "task-reminder":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "task-overdue":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "system-alert":
        return <Info className="h-5 w-5 text-indigo-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "task-assigned":
        return "Task Assigned";
      case "task-reminder":
        return "Reminder";
      case "task-overdue":
        return "Overdue";
      case "system-alert":
        return "System Alert";
      default:
        return type;
    }
  };

  const getRelativeTime = (date: string) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - notificationDate.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your tasks and system alerts
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotifications}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {highPriorityCount}
            </div>
            <p className="text-xs text-muted-foreground">Urgent items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayCount}</div>
            <p className="text-xs text-muted-foreground">Received today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="settings">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
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
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="task-assigned">
                        Task Assigned
                      </SelectItem>
                      <SelectItem value="task-reminder">Reminders</SelectItem>
                      <SelectItem value="task-overdue">Overdue</SelectItem>
                      <SelectItem value="system-alert">
                        System Alerts
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={selectedPriority}
                    onValueChange={setSelectedPriority}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedType("all");
                      setSelectedPriority("all");
                    }}
                    className="w-full"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Notifications ({filteredNotifications.length})
              </CardTitle>
              <CardDescription>
                Your recent notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedNotifications).length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600">
                    No notifications match your current filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedNotifications).map(
                    ([dateGroup, notifications]: [string, any]) => (
                      <div key={dateGroup}>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">
                          {dateGroup}
                        </h3>
                        <div className="space-y-3">
                          {notifications.map((notification: any) => (
                            <div
                              key={notification.id}
                              className={`border rounded-lg p-4 transition-colors ${
                                !notification.read
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {notification.title}
                                    </h4>
                                    <AlertBadge
                                      priority={notification.priority}
                                    />
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {getTypeLabel(notification.type)}
                                    </Badge>
                                    {!notification.read && (
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      {getRelativeTime(notification.createdAt)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {!notification.read && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleMarkAsRead(notification.id)
                                          }
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Mark as Read
                                        </Button>
                                      )}
                                      <Button size="sm" variant="ghost">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications ({unreadCount})</CardTitle>
              <CardDescription>
                Notifications that require your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-600">
                    You have no unread notifications.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border rounded-lg p-4 bg-blue-50 border-blue-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <AlertBadge priority={notification.priority} />
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              New
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {getRelativeTime(notification.createdAt)}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark as Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Task Assignments</p>
                      <p className="text-sm text-gray-600">
                        Get notified when new tasks are assigned to you
                      </p>
                    </div>
                    <Button
                      variant={
                        notificationSettings.taskAssignments
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          taskAssignments: !prev.taskAssignments,
                        }))
                      }
                    >
                      {notificationSettings.taskAssignments
                        ? "Enabled"
                        : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Task Reminders</p>
                      <p className="text-sm text-gray-600">
                        Receive reminders for upcoming and overdue tasks
                      </p>
                    </div>
                    <Button
                      variant={
                        notificationSettings.taskReminders
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          taskReminders: !prev.taskReminders,
                        }))
                      }
                    >
                      {notificationSettings.taskReminders
                        ? "Enabled"
                        : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Alerts</p>
                      <p className="text-sm text-gray-600">
                        Important system updates and maintenance notices
                      </p>
                    </div>
                    <Button
                      variant={
                        notificationSettings.systemAlerts
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          systemAlerts: !prev.systemAlerts,
                        }))
                      }
                    >
                      {notificationSettings.systemAlerts
                        ? "Enabled"
                        : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {notificationSettings.soundNotifications ? (
                        <Volume2 className="h-5 w-5 text-blue-600" />
                      ) : (
                        <VolumeX className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">Sound Notifications</p>
                        <p className="text-sm text-gray-600">
                          Play sound for new notifications
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        notificationSettings.soundNotifications
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          soundNotifications: !prev.soundNotifications,
                        }))
                      }
                    >
                      {notificationSettings.soundNotifications ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <Button
                      variant={
                        notificationSettings.emailNotifications
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          emailNotifications: !prev.emailNotifications,
                        }))
                      }
                    >
                      {notificationSettings.emailNotifications
                        ? "Enabled"
                        : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserNotifications;
