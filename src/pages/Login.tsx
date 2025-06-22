import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User, AlertCircle, Monitor } from "lucide-react";
import { UserRole } from "@/types";
import MockModeBanner from "@/components/MockModeBanner";

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    post: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(
      loginData.email,
      loginData.password,
      selectedRole,
    );

    if (success) {
      navigate(
        selectedRole === "admin" ? "/admin/dashboard" : "/user/dashboard",
      );
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedRole === "admin") {
      setError(
        "Admin signup is not allowed. Please contact system administrator.",
      );
      return;
    }

    const success = await signup(signupData, signupData.password);

    if (success) {
      navigate("/user/dashboard");
    } else {
      setError(
        "Signup failed. Email may already exist. Please try a different email or use the login tab.",
      );
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
    setLoginData({ email: "", password: "" });
    if (role === "admin") {
      setActiveTab("login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <MockModeBanner />
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Monitor className="h-10 w-10 text-indigo-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">AMC Portal</h1>
          </div>
          <p className="text-gray-600">Monitoring & Maintenance System</p>
        </div>

        {/* Role Selection */}
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Select Your Role</CardTitle>
            <CardDescription>
              Choose how you want to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={selectedRole === "admin" ? "default" : "outline"}
                className="h-20 flex-col gap-2"
                onClick={() => handleRoleChange("admin")}
              >
                <Shield className="h-6 w-6" />
                <span>Admin</span>
              </Button>
              <Button
                variant={selectedRole === "user" ? "default" : "outline"}
                className="h-20 flex-col gap-2"
                onClick={() => handleRoleChange("user")}
              >
                <User className="h-6 w-6" />
                <span>User</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Login/Signup Forms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedRole === "admin" ? (
                <Shield className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
              {selectedRole === "admin" ? "Admin Access" : "User Access"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRole === "admin" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    placeholder="admin@amc.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter admin password"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In as Admin"}
                </Button>
              </form>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-md">
                    <p>Use your existing account credentials to sign in.</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                        placeholder="your.email@amc.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-password">Password</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-md">
                    <p>
                      Create a new user account. If you already have an account,
                      use the Login tab instead.
                    </p>
                  </div>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        value={signupData.name}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                        placeholder="your.email@amc.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-post">Post/Position</Label>
                      <Input
                        id="signup-post"
                        value={signupData.post}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            post: e.target.value,
                          }))
                        }
                        required
                        placeholder="e.g., IT Technician"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-department">Department</Label>
                      <Select
                        onValueChange={(value) =>
                          setSignupData((prev) => ({
                            ...prev,
                            department: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IT">
                            Information Technology
                          </SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Administration">
                            Administration
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                        placeholder="Create a password"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
