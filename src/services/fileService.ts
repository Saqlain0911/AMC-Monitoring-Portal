import { api, ApiError } from "./api";

export interface FileUploadResponse {
  id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface TaskWithFiles {
  task: Record<string, unknown>;
  attachments: FileUploadResponse[];
  newAttachments?: FileUploadResponse[];
}

// File service for handling file uploads and attachments
export const fileService = {
  // Upload files when creating a task
  createTaskWithFiles: async (
    taskData: Record<string, unknown>,
    files?: FileList | File[],
  ): Promise<TaskWithFiles> => {
    try {
      const formData = new FormData();

      // Add task data
      Object.entries(taskData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add files
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      // Get auth token
      const user = localStorage.getItem("user");
      const token = user ? JSON.parse(user).token : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/tasks`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create task with files:", error);
      throw error;
    }
  },

  // Upload files when updating a task
  updateTaskWithFiles: async (
    taskId: string,
    taskData: Record<string, unknown>,
    files?: FileList | File[],
  ): Promise<TaskWithFiles> => {
    try {
      const formData = new FormData();

      // Add task data
      Object.entries(taskData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add files
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      // Get auth token
      const user = localStorage.getItem("user");
      const token = user ? JSON.parse(user).token : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update task with files:", error);
      throw error;
    }
  },

  // Get file download URL
  getFileUrl: (filePath: string): string => {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    // Remove '/api' from base URL for file serving
    const fileBaseUrl = baseUrl.replace("/api", "");
    return `${fileBaseUrl}/uploads/${filePath}`;
  },

  // Download file
  downloadFile: async (filePath: string, fileName: string): Promise<void> => {
    try {
      const fileUrl = fileService.getFileUrl(filePath);

      // Get auth token
      const user = localStorage.getItem("user");
      const token = user ? JSON.parse(user).token : null;

      const response = await fetch(fileUrl, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
      throw error;
    }
  },

  // Validate file before upload
  validateFile: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      // Text
      "text/plain",
      "text/csv",
      // Archives
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size must be less than 10MB",
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          "File type not allowed. Please upload images, documents, text files, or archives.",
      };
    }

    return { valid: true };
  },

  // Validate multiple files
  validateFiles: (
    files: FileList | File[],
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const maxFiles = 5;

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed per upload`);
    }

    Array.from(files).forEach((file, index) => {
      const validation = fileService.validateFile(file);
      if (!validation.valid) {
        errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Format file size for display
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Get file icon based on file type
  getFileIcon: (fileType: string): string => {
    if (fileType.startsWith("image/")) return "📷";
    if (fileType === "application/pdf") return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📊";
    if (fileType.includes("powerpoint") || fileType.includes("presentation"))
      return "📋";
    if (fileType.startsWith("text/")) return "📃";
    if (
      fileType.includes("zip") ||
      fileType.includes("rar") ||
      fileType.includes("7z")
    )
      return "📦";
    return "📁";
  },
};
