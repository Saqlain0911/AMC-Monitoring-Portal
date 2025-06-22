// Authentication utilities for token and user management

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  token: string;
}

// Token management
export const tokenManager = {
  // Get stored token
  getToken: (): string | null => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return null;

      const userData = JSON.parse(user);
      return userData.token || null;
    } catch {
      return null;
    }
  },

  // Get stored user
  getUser: (): StoredUser | null => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return null;

      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  // Store user and token
  setUser: (user: Record<string, unknown>, token: string): void => {
    try {
      const userData = {
        id: (user.id as string | number)?.toString() || (user.id as string),
        name: (user.full_name as string) || (user.name as string),
        email: user.email as string,
        role: user.role,
        token,
      };
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to store user data:", error);
    }
  },

  // Clear stored data
  clearUser: (): void => {
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = tokenManager.getToken();
    return !!token;
  },

  // Check if user has specific role
  hasRole: (role: "admin" | "user"): boolean => {
    const user = tokenManager.getUser();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    return tokenManager.hasRole("admin");
  },

  // Check if token is expired (basic check)
  isTokenExpired: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return true;

    try {
      // Basic JWT token expiry check
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      // If we can't parse the token, consider it expired
      return true;
    }
  },

  // Get user ID
  getUserId: (): string | null => {
    const user = tokenManager.getUser();
    return user?.id || null;
  },

  // Update user data in storage
  updateUser: (updates: Partial<StoredUser>): void => {
    const currentUser = tokenManager.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  },
};

// Request interceptor for adding auth headers
export const addAuthHeader = (
  headers: Record<string, string> = {},
): Record<string, string> => {
  const token = tokenManager.getToken();

  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return headers;
};

// Response interceptor for handling auth errors
export const handleAuthError = (status: number): void => {
  if (status === 401) {
    // Token expired or invalid
    tokenManager.clearUser();

    // Redirect to login page
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
};

// Auto-logout on tab close/refresh
export const setupAutoLogout = (): void => {
  window.addEventListener("beforeunload", () => {
    // Optional: Keep user logged in across browser sessions
    // For now, we'll keep the token in localStorage
  });
};

// Session timeout warning
export const setupSessionWarning = (
  warningMinutes: number = 5,
): (() => void) => {
  let warningTimer: NodeJS.Timeout;
  let logoutTimer: NodeJS.Timeout;

  const resetTimers = () => {
    clearTimeout(warningTimer);
    clearTimeout(logoutTimer);

    if (tokenManager.isAuthenticated() && !tokenManager.isTokenExpired()) {
      // Show warning before logout
      warningTimer = setTimeout(
        () => {
          const confirmStayLoggedIn = confirm(
            "Your session will expire in 5 minutes. Do you want to stay logged in?",
          );

          if (confirmStayLoggedIn) {
            // Refresh the token or extend session
            // For now, just reset the timers
            resetTimers();
          } else {
            // Auto-logout in 5 minutes
            logoutTimer = setTimeout(
              () => {
                tokenManager.clearUser();
                window.location.href = "/login";
              },
              5 * 60 * 1000,
            ); // 5 minutes
          }
        },
        (60 - warningMinutes) * 60 * 1000,
      ); // Show warning 5 minutes before expiry
    }
  };

  // Reset timers on user activity
  const activityEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
  ];

  activityEvents.forEach((event) => {
    document.addEventListener(event, resetTimers, true);
  });

  // Initial timer setup
  resetTimers();

  // Return cleanup function
  return () => {
    clearTimeout(warningTimer);
    clearTimeout(logoutTimer);
    activityEvents.forEach((event) => {
      document.removeEventListener(event, resetTimers, true);
    });
  };
};

// Login redirection helper
export const redirectAfterLogin = (user: StoredUser): void => {
  const redirectPath =
    sessionStorage.getItem("redirectAfterLogin") ||
    (user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");

  sessionStorage.removeItem("redirectAfterLogin");
  window.location.href = redirectPath;
};

// Save current path for post-login redirect
export const saveRedirectPath = (path: string): void => {
  if (path !== "/login") {
    sessionStorage.setItem("redirectAfterLogin", path);
  }
};
