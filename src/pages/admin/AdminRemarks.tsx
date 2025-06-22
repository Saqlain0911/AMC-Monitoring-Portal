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
  MessageSquare,
  Reply,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

const AdminRemarks = () => {
  const { remarks, getTasksByUser, respondToRemark } = useTask();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRemark, setSelectedRemark] = useState<any>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [response, setResponse] = useState("");

  // Mock users for display
  const mockUsers = [
    { id: "2", name: "John Doe", post: "IT Technician" },
    { id: "3", name: "Jane Smith", post: "Network Engineer" },
    { id: "4", name: "Mike Johnson", post: "System Admin" },
    { id: "5", name: "Sarah Wilson", post: "Security Specialist" },
  ];

  const getUserInfo = (userId: string) => {
    return (
      mockUsers.find((u) => u.id === userId) || {
        name: "Unknown User",
        post: "Unknown",
      }
    );
  };

  // Filter remarks
  const filteredRemarks = remarks.filter((remark) => {
    const user = getUserInfo(remark.userId);
    const matchesSearch =
      remark.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || remark.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "responded" && remark.adminResponse) ||
      (selectedStatus === "pending" && !remark.adminResponse);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistics
  const totalRemarks = remarks.length;
  const pendingRemarks = remarks.filter((r) => !r.adminResponse).length;
  const respondedRemarks = remarks.filter((r) => r.adminResponse).length;
  const issueRemarks = remarks.filter((r) => r.type === "issue").length;

  const handleRespond = (remark: any) => {
    setSelectedRemark(remark);
    setResponse("");
    setIsResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (selectedRemark && response.trim()) {
      respondToRemark(selectedRemark.id, response.trim());
      setIsResponseDialogOpen(false);
      setSelectedRemark(null);
      setResponse("");
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
            User Remarks Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and respond to user feedback, issues, and suggestions
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Remarks</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRemarks}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Response
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingRemarks}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {respondedRemarks}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Issues Reported
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {issueRemarks}
            </div>
            <p className="text-xs text-muted-foreground">Critical feedback</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search remarks..."
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
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="issue">Issues</SelectItem>
                  <SelectItem value="suggestion">Suggestions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Response</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedStatus("all");
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remarks List */}
      <Card>
        <CardHeader>
          <CardTitle>User Remarks ({filteredRemarks.length})</CardTitle>
          <CardDescription>Review and respond to user feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRemarks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No remarks found
              </h3>
              <p className="text-gray-600">
                No user remarks match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRemarks
                .sort((a, b) => {
                  // Sort by response status (pending first) then by date
                  if (!a.adminResponse && b.adminResponse) return -1;
                  if (a.adminResponse && !b.adminResponse) return 1;
                  return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                  );
                })
                .map((remark) => {
                  const userInfo = getUserInfo(remark.userId);
                  return (
                    <div
                      key={remark.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(remark.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeBadge(remark.type)}
                              {!remark.adminResponse && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">
                                  Pending Response
                                </Badge>
                              )}
                              {remark.taskId && (
                                <Badge variant="outline" className="text-xs">
                                  Task Related
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {userInfo.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({userInfo.post})
                              </span>
                              <Calendar className="h-4 w-4 text-gray-400 ml-4" />
                              <span className="text-sm text-gray-600">
                                {format(
                                  new Date(remark.createdAt),
                                  "MMM dd, yyyy h:mm a",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!remark.adminResponse && (
                            <Button
                              size="sm"
                              onClick={() => handleRespond(remark)}
                            >
                              <Reply className="mr-2 h-4 w-4" />
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded p-3 ml-7">
                        <p className="text-sm">{remark.message}</p>
                      </div>

                      {remark.adminResponse && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 ml-7">
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
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to User Remark</DialogTitle>
            <DialogDescription>
              Provide a response to help address the user's feedback or resolve
              their issue.
            </DialogDescription>
          </DialogHeader>
          {selectedRemark && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(selectedRemark.type)}
                  {getTypeBadge(selectedRemark.type)}
                  <span className="text-sm text-gray-600">
                    from {getUserInfo(selectedRemark.userId).name}
                  </span>
                </div>
                <p className="text-sm">{selectedRemark.message}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResponseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitResponse}>
              <Reply className="mr-2 h-4 w-4" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRemarks;
