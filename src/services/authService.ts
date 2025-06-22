import { User, UserRole } from "@/types";
import { api, ApiError } from "./api";

// API types for authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: "admin" | "user";
  phone?: string;
  department?: string;
}

export interface SignupResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  name?: string;
  post?: string;
  department?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Authentication service methods
export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials,
      );

      // Store token and user data
      if (response.token) {
        const userData = { ...response.user, token: response.token };
        localStorage.setItem("user", JSON.stringify(userData));
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error(
            "Invalid credentials. Please check your username and password.",
          );
        }
        if (error.status === 403) {
          throw new Error("Access denied. Please contact your administrator.");
        }
      }
      throw error;
    }
  },

  // Register new user
  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    try {
      const response = await api.post<SignupResponse>(
        "/auth/register",
        userData,
      );

      // Store token and user data
      if (response.token) {
        const userWithToken = { ...response.user, token: response.token };
        localStorage.setItem("user", JSON.stringify(userWithToken));
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error(
            "Username or email already exists. Please use different credentials.",
          );
        }
        if (error.status === 400) {
          throw new Error(
            "Invalid registration data. Please check all fields.",
          );
        }
      }
      throw error;
    }
  },

  // Refresh authentication token
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await api.post<LoginResponse>("/auth/refresh", {
        refreshToken,
      });

      // Update stored tokens
      if (response.token) {
        const userData = { ...response.user, token: response.token };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      return response;
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
    }
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileRequest): Promise<User> => {
    try {
      const response = await api.put<User>("/auth/profile", profileData);

      // Update stored user data
      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const updatedUser = { ...userData, ...response };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error("Invalid profile data. Please check all fields.");
        }
      }
      throw error;
    }
  },

  // Change password
  changePassword: async (
    passwordData: ChangePasswordRequest,
  ): Promise<void> => {
    try {
      await api.put("/auth/change-password", passwordData);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error("Current password is incorrect.");
        }
        if (error.status === 422) {
          throw new Error("New password does not meet requirements.");
        }
      }
      throw error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    try {
      return await api.get<User[]>("/auth/users");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
      }
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<{ user: User }>("/auth/me");
      return response.user;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          // Token expired, clear local storage
          localStorage.removeItem("user");
          localStorage.removeItem("refreshToken");
          throw new Error("Session expired. Please login again.");
        }
      }
      throw error;
    }
  },

  // Upload profile avatar
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await api.post<{ avatarUrl: string }>(
        "/auth/upload-avatar",
        formData,
        {
          headers: {
            // Don't set Content-Type for FormData, let browser set it
            "Content-Type": undefined as unknown as string,
          },
        },
      );

      // Update stored user data with new avatar URL
      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const updatedUser = { ...userData, avatar: response.avatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 413) {
          throw new Error("File too large. Please choose a smaller image.");
        }
        if (error.status === 415) {
          throw new Error("Invalid file type. Please upload an image file.");
        }
      }
      throw error;
    }
  },
};

// Token validation helper
export const isTokenValid = (): boolean => {
  const user = localStorage.getItem("user");
  if (!user) return false;

  try {
    const userData = JSON.parse(user);
    if (!userData.token) return false;

    // You could decode the JWT token here to check expiration
    // For now, we'll assume it's valid if it exists
    return true;
  } catch {
    return false;
  }
};

// Auto-refresh token utility
export const setupTokenRefresh = () => {
  // Refresh token 5 minutes before expiration
  const REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes

  const refreshInterval = setInterval(async () => {
    if (isTokenValid()) {
      try {
        await authService.refreshToken();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
        clearInterval(refreshInterval);
      }
    } else {
      clearInterval(refreshInterval);
    }
  }, REFRESH_INTERVAL);

  return () => clearInterval(refreshInterval);
};
