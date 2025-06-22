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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import TaskCard from "@/components/TaskCard";
import DeadlineAlert, { getDeadlineStatus } from "@/components/DeadlineAlert";
import { TaskCategory, TaskStatus } from "@/types";
import {
  Search,
  Play,
  CheckCircle,
  Clock,
  Upload,
  Camera,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

const UserTasks = () => {
  const { getTasksByUser, updateTaskStatus } = useTask();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] =
    useState<TaskCategory>("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState({
    remarks: "",
    actualTime: 0,
    issues: "",
  });

  if (!user) return null;

  const userTasks = getTasksByUser(user.id);
  const categoryTasks = userTasks.filter(
    (task) => task.category === selectedCategory,
  );

  // Get critical tasks that need immediate attention
  const criticalTasks = userTasks.filter((task) => {
    const status = getDeadlineStatus(task.dueDate, task.status);
    return status.urgency === "overdue" || status.urgency === "critical";
  });

  const filteredTasks = categoryTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in-progress",
  );
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  const handleStartTask = (taskId: string) => {
    updateTaskStatus(taskId, "in-progress");
  };

  const handleCompleteTask = (task: any) => {
    setSelectedTask(task);
    setCompletionData({
      remarks: "",
      actualTime: task.estimatedTime,
      issues: "",
    });
    setIsCompleteDialogOpen(true);
  };

  const handleSubmitCompletion = () => {
    if (selectedTask) {
      const remarks = `${completionData.remarks}${completionData.issues ? ` | Issues: ${completionData.issues}` : ""}`;
      updateTaskStatus(
        selectedTask.id,
        "completed",
        remarks,
        completionData.actualTime,
      );
      setIsCompleteDialogOpen(false);
      setSelectedTask(null);
    }
  };

  const getTaskStats = (category: TaskCategory) => {
    const tasks = userTasks.filter((t) => t.category === category);
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and complete your assigned tasks
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Total Tasks: {userTasks.length}
          </p>
          <p className="text-sm text-gray-600">
            Completed:{" "}
            {userTasks.filter((t) => t.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Critical Deadline Alerts */}
      {criticalTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <Clock className="h-5 w-5" />
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search your tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Task Categories */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as TaskCategory)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            Daily Tasks
            <Badge variant="secondary">{getTaskStats("daily").total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            Weekly Tasks
            <Badge variant="secondary">{getTaskStats("weekly").total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            Monthly Tasks
            <Badge variant="secondary">{getTaskStats("monthly").total}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Task Content */}
        {(["daily", "weekly", "monthly"] as TaskCategory[]).map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <TaskCategorySection
              category={category}
              pendingTasks={pendingTasks}
              inProgressTasks={inProgressTasks}
              completedTasks={completedTasks}
              onStartTask={handleStartTask}
              onCompleteTask={handleCompleteTask}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Complete Task Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complete Task: {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Please provide details about task completion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualTime">Actual Time (minutes)</Label>
                <Input
                  id="actualTime"
                  type="number"
                  value={completionData.actualTime}
                  onChange={(e) =>
                    setCompletionData((prev) => ({
                      ...prev,
                      actualTime: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Time</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedTask?.estimatedTime} minutes
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Task Completion Notes</Label>
              <Textarea
                id="remarks"
                value={completionData.remarks}
                onChange={(e) =>
                  setCompletionData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                placeholder="Describe what was accomplished, any observations, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues">Issues or Problems Encountered</Label>
              <Textarea
                id="issues"
                value={completionData.issues}
                onChange={(e) =>
                  setCompletionData((prev) => ({
                    ...prev,
                    issues: e.target.value,
                  }))
                }
                placeholder="Report any issues, equipment problems, or obstacles encountered"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <Label>Attachments (Optional)</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Photo</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Screenshot</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">Report</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCompletion}>Mark as Completed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TaskCategorySectionProps {
  category: TaskCategory;
  pendingTasks: any[];
  inProgressTasks: any[];
  completedTasks: any[];
  onStartTask: (taskId: string) => void;
  onCompleteTask: (task: any) => void;
}

const TaskCategorySection: React.FC<TaskCategorySectionProps> = ({
  category,
  pendingTasks,
  inProgressTasks,
  completedTasks,
  onStartTask,
  onCompleteTask,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending ({pendingTasks.length})
          </CardTitle>
          <CardDescription>Tasks waiting to be started</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending {category} tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="space-y-3">
                  <TaskCard task={task} compact />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onStartTask(task.id)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Task
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Progress Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            In Progress ({inProgressTasks.length})
          </CardTitle>
          <CardDescription>Tasks currently being worked on</CardDescription>
        </CardHeader>
        <CardContent>
          {inProgressTasks.length === 0 ? (
            <div className="text-center py-8">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {category} tasks in progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressTasks.map((task) => (
                <div key={task.id} className="space-y-3">
                  <TaskCard task={task} compact />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onCompleteTask(task)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete Task
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completed ({completedTasks.length})
          </CardTitle>
          <CardDescription>Recently completed tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {completedTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No completed {category} tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="space-y-2">
                  <TaskCard task={task} compact />
                  <div className="text-xs text-gray-600 pl-3">
                    Completed:{" "}
                    {task.completedAt &&
                      format(new Date(task.completedAt), "MMM dd, h:mm a")}
                  </div>
                </div>
              ))}
              {completedTasks.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  +{completedTasks.length - 5} more completed
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTasks;
