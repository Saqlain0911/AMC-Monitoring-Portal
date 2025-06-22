import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      navigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } else {
      // Redirect to login if no user
      navigate("/login");
    }
  }, [user, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">
          Loading AMC Portal...
        </h2>
        <p className="text-gray-600 mt-2">
          Redirecting you to the appropriate dashboard
        </p>
      </div>
    </div>
  );
};

export default Index;
