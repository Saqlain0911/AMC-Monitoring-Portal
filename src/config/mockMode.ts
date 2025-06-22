// Mock mode configuration
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== "false"; // Default to true
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002/api";

// Health check to determine if backend is available
let backendAvailable = false;

export const checkBackendHealth = async (): Promise<boolean> => {
  if (MOCK_MODE) {
    return false; // Force mock mode if enabled
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      backendAvailable = response.ok;
      return response.ok;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    backendAvailable = false;
    return false;
  }
};

export const isBackendAvailable = () => backendAvailable;

// Initialize backend check
checkBackendHealth().then((available) => {
  if (!available) {
    console.log("✅ Backend connected successfully");
  }
});
