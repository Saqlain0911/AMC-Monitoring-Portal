import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus } from "@/types";
import DeadlineAlert from "./DeadlineAlert";
import { Clock, User, Calendar, CheckCircle, Play, Pause } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onViewDetails?: (taskId: string) => void;
  showAssignee?: boolean;
  compact?: boolean;
}

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "in-progress":
      return <Play className="h-4 w-4 text-blue-600" />;
    case "pending":
      return <Pause className="h-4 w-4 text-gray-600" />;
    case "overdue":
      return <Clock className="h-4 w-4 text-red-600" />;
    default:
      return <Pause className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "pending":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onViewDetails,
  showAssignee = false,
  compact = false,
}) => {
  const handleStatusUpdate = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "completed";

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(task.status)}
                <h4 className="font-medium text-sm">{task.title}</h4>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.dueDate), "MMM dd")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimatedTime}m
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DeadlineAlert task={task} className="text-xs" />
              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                {task.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(task.status)}
              {task.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {task.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <DeadlineAlert task={task} />
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace("-", " ")}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
              {isOverdue && (
                <span className="text-red-600 ml-1">(Overdue)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Est. {task.estimatedTime} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {task.category}
            </Badge>
          </div>
          {showAssignee && task.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>User {task.assignedTo}</span>
            </div>
          )}
        </div>

        {task.remarks && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>Remarks:</strong> {task.remarks}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {task.status === "pending" && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate("in-progress")}
              className="flex-1"
            >
              Start Task
            </Button>
          )}

          {task.status === "in-progress" && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate("completed")}
              className="flex-1"
            >
              Complete Task
            </Button>
          )}

          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(task.id)}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
