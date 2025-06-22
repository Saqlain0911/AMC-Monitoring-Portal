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
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

const UserRemarks = () => {
  const { remarks, addRemark, getTasksByUser } = useTask();
  const { user } = useAuth();
  const [newRemark, setNewRemark] = useState({
    message: "",
    type: "feedback" as "feedback" | "issue" | "suggestion",
    taskId: "",
  });

  if (!user) return null;

  const userTasks = getTasksByUser(user.id);
  const userRemarks = remarks.filter((r) => r.userId === user.id);

  const handleSubmitRemark = () => {
    if (newRemark.message.trim()) {
      addRemark({
        ...newRemark,
        userId: user.id,
        taskId: newRemark.taskId === "none" ? undefined : newRemark.taskId,
      });
      setNewRemark({
        message: "",
        type: "feedback",
        taskId: "",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case "issue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "suggestion":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "feedback":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Feedback
          </Badge>
        );
      case "issue":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Issue
          </Badge>
        );
      case "suggestion":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Suggestion
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Remarks & Feedback
          </h1>
          <p className="text-gray-600 mt-1">
            Share your feedback, report issues, and provide suggestions to the
            admin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit New Remark */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit New Remark
              </CardTitle>
              <CardDescription>
                Share your thoughts, report problems, or suggest improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newRemark.type}
                    onValueChange={(
                      value: "feedback" | "issue" | "suggestion",
                    ) => setNewRemark((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">General Feedback</SelectItem>
                      <SelectItem value="issue">Report Issue</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskId">Related Task (Optional)</Label>
                  <Select
                    value={newRemark.taskId || "none"}
                    onValueChange={(value) =>
                      setNewRemark((prev) => ({
                        ...prev,
                        taskId: value === "none" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific task</SelectItem>
                      {userTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newRemark.message}
                  onChange={(e) =>
                    setNewRemark((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Type your feedback, issue description, or suggestion here..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmitRemark} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Submit Remark
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Feedback</p>
                  <p className="text-gray-600">
                    Share your general thoughts and experiences
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Issues</p>
                  <p className="text-gray-600">
                    Report problems, bugs, or obstacles
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Suggestions</p>
                  <p className="text-gray-600">
                    Propose improvements or new features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Remarks</span>
                <Badge variant="secondary">{userRemarks.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Responded</span>
                <Badge variant="secondary">
                  {userRemarks.filter((r) => r.adminResponse).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary">
                  {userRemarks.filter((r) => !r.adminResponse).length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Previous Remarks */}
      <Card>
        <CardHeader>
          <CardTitle>Your Previous Remarks</CardTitle>
          <CardDescription>
            View your submitted feedback and admin responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRemarks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No remarks yet
              </h3>
              <p className="text-gray-600">
                Submit your first remark using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userRemarks
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((remark) => (
                  <div
                    key={remark.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(remark.type)}
                        {getTypeBadge(remark.type)}
                        {remark.taskId && (
                          <Badge variant="outline" className="text-xs">
                            Task:{" "}
                            {userTasks.find((t) => t.id === remark.taskId)
                              ?.title || "Unknown"}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>
                          {format(new Date(remark.createdAt), "MMM dd, yyyy")}
                        </p>
                        <p>{format(new Date(remark.createdAt), "h:mm a")}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm">{remark.message}</p>
                    </div>

                    {remark.adminResponse ? (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Admin Response
                          </span>
                          {remark.respondedAt && (
                            <span className="text-xs text-blue-600">
                              {format(
                                new Date(remark.respondedAt),
                                "MMM dd, h:mm a",
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-blue-700">
                          {remark.adminResponse}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Awaiting Admin Response
                          </span>
                        </div>
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

export default UserRemarks;
