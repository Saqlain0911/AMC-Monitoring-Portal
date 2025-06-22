// API Configuration and base utilities
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002/api";

// Request configuration
interface RequestConfig extends RequestInit {
  timeout?: number;
}

// Custom fetch wrapper with error handling and auth
const apiRequest = async <T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> => {
  const { timeout = 10000, ...fetchConfig } = config;

  // Get auth token from localStorage
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchConfig.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return {} as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }
      if (error instanceof ApiError) {
        throw error;
      }
    }

    throw new ApiError("Network error occurred", 0, error);
  }
};

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API methods
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: "DELETE" }),
};

// File upload helper
export const uploadFile = async (
  file: File,
  endpoint: string,
): Promise<unknown> => {
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : null;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(
      `Upload failed: ${response.statusText}`,
      response.status,
    );
  }

  return response.json();
};

// Health check utility
export const healthCheck = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  try {
    return await api.get("/health");
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};

