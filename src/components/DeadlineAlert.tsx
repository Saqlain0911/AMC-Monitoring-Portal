import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Task } from "@/types";
import { AlertTriangle, Clock, CheckCircle, Calendar, Zap } from "lucide-react";
import {
  format,
  differenceInHours,
  differenceInDays,
  isPast,
  isToday,
  isTomorrow,
} from "date-fns";

interface DeadlineAlertProps {
  task: Task;
  showAlert?: boolean;
  className?: string;
}

export const getDeadlineStatus = (dueDate: string, status: string) => {
  const due = new Date(dueDate);
  const now = new Date();

  // If task is completed, return success
  if (status === "completed") {
    return {
      type: "success" as const,
      priority: "green",
      message: "Completed",
      urgency: "completed",
    };
  }

  // If task is overdue
  if (isPast(due) && !isToday(due)) {
    const daysOverdue = Math.abs(differenceInDays(now, due));
    return {
      type: "danger" as const,
      priority: "red",
      message: `Overdue by ${daysOverdue} day${daysOverdue > 1 ? "s" : ""}`,
      urgency: "overdue",
    };
  }

  // If task is due today
  if (isToday(due)) {
    const hoursLeft = differenceInHours(due, now);
    if (hoursLeft <= 2) {
      return {
        type: "danger" as const,
        priority: "red",
        message: `Due in ${Math.max(0, hoursLeft)} hours`,
        urgency: "critical",
      };
    }
    return {
      type: "warning" as const,
      priority: "orange",
      message: "Due today",
      urgency: "today",
    };
  }

  // If task is due tomorrow
  if (isTomorrow(due)) {
    return {
      type: "warning" as const,
      priority: "orange",
      message: "Due tomorrow",
      urgency: "tomorrow",
    };
  }

  // If task is due within 3 days
  const daysLeft = differenceInDays(due, now);
  if (daysLeft <= 3) {
    return {
      type: "warning" as const,
      priority: "orange",
      message: `Due in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
      urgency: "soon",
    };
  }

  // If task has plenty of time
  return {
    type: "info" as const,
    priority: "green",
    message: `Due in ${daysLeft} days`,
    urgency: "normal",
  };
};

const DeadlineAlert: React.FC<DeadlineAlertProps> = ({
  task,
  showAlert = false,
  className = "",
}) => {
  const deadlineStatus = getDeadlineStatus(task.dueDate, task.status);

  const getIcon = () => {
    switch (deadlineStatus.urgency) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "overdue":
      case "critical":
        return <Zap className="h-4 w-4" />;
      case "today":
      case "tomorrow":
      case "soon":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getBadgeClasses = () => {
    const baseClasses = "flex items-center gap-1 font-medium";
    switch (deadlineStatus.priority) {
      case "red":
        return `${baseClasses} bg-red-100 text-red-800 border-red-200 hover:bg-red-200`;
      case "orange":
        return `${baseClasses} bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200`;
      case "green":
        return `${baseClasses} bg-green-100 text-green-800 border-green-200 hover:bg-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
    }
  };

  const getAlertClasses = () => {
    switch (deadlineStatus.priority) {
      case "red":
        return "border-red-200 bg-red-50";
      case "orange":
        return "border-orange-200 bg-orange-50";
      case "green":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (
    showAlert &&
    (deadlineStatus.urgency === "overdue" ||
      deadlineStatus.urgency === "critical" ||
      deadlineStatus.urgency === "today")
  ) {
    return (
      <Alert className={`${getAlertClasses()} ${className}`}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <AlertDescription className="font-medium">
            <span className="text-sm">
              {deadlineStatus.urgency === "overdue"
                ? "⚠️ "
                : deadlineStatus.urgency === "critical"
                  ? "🚨 "
                  : "⏰ "}
              {task.title} - {deadlineStatus.message}
            </span>
            <div className="text-xs mt-1 text-muted-foreground">
              Due: {format(new Date(task.dueDate), "MMM dd, yyyy 'at' h:mm a")}
            </div>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <Badge className={`${getBadgeClasses()} ${className}`}>
      {getIcon()}
      <span className="text-xs">{deadlineStatus.message}</span>
    </Badge>
  );
};

export default DeadlineAlert;
