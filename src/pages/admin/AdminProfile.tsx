import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Lock, Mail, Calendar, Building2 } from "lucide-react";

interface ProfileFormData {
  name: string;
  email: string;
  post: string;
  department: string;
  avatar?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminProfile: React.FC = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user?.name || "",
    email: user?.email || "",
    post: user?.post || "",
    department: user?.department || "",
    avatar: user?.avatar || "",
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("profile");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const success = await updateProfile(profileData);

      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    const success = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
    );

    if (success) {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully changed.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast({
        title: "Password Change Failed",
        description: "Current password is incorrect.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfileData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.role === "admin" ? "Administrator" : "User"}
                  </p>
                  <div className="mt-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      Position/Post
                    </Label>
                    <Input
                      id="post"
                      value={profileData.post}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          post: e.target.value,
                        }))
                      }
                      placeholder="Enter your position"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      placeholder="Enter your department"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Join Date
                  </Label>
                  <Input
                    value={new Date(user.joinDate).toLocaleDateString()}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Change your password and manage security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    <Lock className="h-4 w-4 inline mr-2" />
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Include numbers and letters</li>
                    <li>• Avoid common passwords</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfile;
