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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Plus,
  Send,
  Users,
  Filter,
  Search,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

type NotificationUrgency = "critical" | "urgent" | "normal";

const AdminNotifications = () => {
  const { notifications, getUnreadNotifications, addNotification } = useTask();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system-alert" as
      | "task-assigned"
      | "task-reminder"
      | "task-overdue"
      | "system-alert",
    urgency: "normal" as NotificationUrgency,
    targetUser: "all",
  });

  // Mock users for targeting
  const mockUsers = [
    { id: "all", name: "All Users" },
    { id: "2", name: "John Doe" },
    { id: "3", name: "Jane Smith" },
    { id: "4", name: "Mike Johnson" },
    { id: "5", name: "Sarah Wilson" },
  ];

  // Convert old priority to new urgency system
  const getNotificationUrgency = (priority: string): NotificationUrgency => {
    switch (priority) {
      case "high":
        return "critical";
      case "medium":
        return "urgent";
      case "low":
      default:
        return "normal";
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const notificationUrgency = getNotificationUrgency(notification.priority);
    const matchesUrgency =
      selectedUrgency === "all" || notificationUrgency === selectedUrgency;

    return matchesSearch && matchesUrgency;
  });

  // Statistics
  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter(
    (n) => getNotificationUrgency(n.priority) === "critical",
  ).length;
  const todayCount = notifications.filter((n) => {
    const today = new Date().toDateString();
    return new Date(n.createdAt).toDateString() === today;
  }).length;

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      alert("Please fill in both title and message");
      return;
    }

    // Convert urgency back to priority for compatibility
    const priorityMap = {
      critical: "high",
      urgent: "medium",
      normal: "low",
    };

    // Create notifications for target users
    if (newNotification.targetUser === "all") {
      // Send to all users
      mockUsers.forEach((user) => {
        if (user.id !== "all") {
          const notification = {
            id: `notif-${Date.now()}-${user.id}`,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type,
            priority: priorityMap[newNotification.urgency],
            userId: user.id,
            read: false,
            createdAt: new Date().toISOString(),
          };

          // Add to notifications context
          addNotification(notification);
        }
      });
    } else {
      // Send to specific user
      const notification = {
        id: `notif-${Date.now()}`,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        priority: priorityMap[newNotification.urgency],
        userId: newNotification.targetUser,
        read: false,
        createdAt: new Date().toISOString(),
      };

      // Add to notifications context
      addNotification(notification);
    }

    // Reset form
    setNewNotification({
      title: "",
      message: "",
      type: "system-alert",
      urgency: "normal",
      targetUser: "all",
    });
    setIsCreateDialogOpen(false);

    // Show success message
    alert(
      `Notification sent successfully to ${newNotification.targetUser === "all" ? "all users" : "selected user"}!`,
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task-assigned":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "task-reminder":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "task-overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "system-alert":
        return <Info className="h-4 w-4 text-indigo-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "task-assigned":
        return "Task Assigned";
      case "task-reminder":
        return "Task Reminder";
      case "task-overdue":
        return "Task Overdue";
      case "system-alert":
        return "System Alert";
      default:
        return type;
    }
  };

  const getUrgencyBadge = (urgency: NotificationUrgency) => {
    const baseClasses = "flex items-center gap-1 font-medium text-xs";
    switch (urgency) {
      case "critical":
        return (
          <Badge
            className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}
          >
            <Zap className="h-3 w-3" />
            Critical
          </Badge>
        );
      case "urgent":
        return (
          <Badge
            className={`${baseClasses} bg-orange-100 text-orange-800 border-orange-200`}
          >
            <AlertTriangle className="h-3 w-3" />
            Urgent
          </Badge>
        );
      case "normal":
        return (
          <Badge
            className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}
          >
            <Info className="h-3 w-3" />
            Normal
          </Badge>
        );
      default:
        return (
          <Badge
            className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}
          >
            <Info className="h-3 w-3" />
            Normal
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notification Management
          </h1>
          <p className="text-gray-600 mt-1">
            Send and manage notifications for all users based on urgency levels
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to users with appropriate urgency level.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newNotification.title}
                      onChange={(e) =>
                        setNewNotification((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Notification title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value: any) =>
                        setNewNotification((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system-alert">
                          System Alert
                        </SelectItem>
                        <SelectItem value="task-reminder">
                          Task Reminder
                        </SelectItem>
                        <SelectItem value="task-assigned">
                          Task Assignment
                        </SelectItem>
                        <SelectItem value="task-overdue">
                          Task Overdue
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) =>
                      setNewNotification((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Enter the notification message..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={newNotification.urgency}
                      onValueChange={(value: NotificationUrgency) =>
                        setNewNotification((prev) => ({
                          ...prev,
                          urgency: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">
                          🚨 Critical - Immediate action required
                        </SelectItem>
                        <SelectItem value="urgent">
                          ⚠️ Urgent - Needs attention soon
                        </SelectItem>
                        <SelectItem value="normal">
                          ℹ️ Normal - Standard notification
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Users</Label>
                    <Select
                      value={newNotification.targetUser}
                      onValueChange={(value) =>
                        setNewNotification((prev) => ({
                          ...prev,
                          targetUser: value,
                        }))
                      }
                    >
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
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">
                    Urgency Level Guidelines:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      <strong>Critical:</strong> System outages, security
                      alerts, immediate safety concerns
                    </li>
                    <li>
                      <strong>Urgent:</strong> Overdue tasks, deadline
                      reminders, important updates
                    </li>
                    <li>
                      <strong>Normal:</strong> Task assignments, general
                      information, routine updates
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateNotification}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Immediate action needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayCount}</div>
            <p className="text-xs text-muted-foreground">Sent today</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Urgency Level</Label>
              <Select
                value={selectedUrgency}
                onValueChange={setSelectedUrgency}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="urgent">Urgent Only</SelectItem>
                  <SelectItem value="normal">Normal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedUrgency("all");
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recent Notifications ({filteredNotifications.length})
          </CardTitle>
          <CardDescription>
            Manage and track all system notifications by urgency level
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600">
                Create your first notification to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((notification) => {
                  const urgency = getNotificationUrgency(notification.priority);
                  return (
                    <div
                      key={notification.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {notification.title}
                              </h4>
                              {getUrgencyBadge(urgency)}
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              {!notification.read && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  Unread
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="text-xs text-gray-500">
                              Sent{" "}
                              {format(
                                new Date(notification.createdAt),
                                "MMM dd, yyyy h:mm a",
                              )}{" "}
                              • User:{" "}
                              {mockUsers.find(
                                (u) => u.id === notification.userId,
                              )?.name || "Unknown"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            Resend
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
