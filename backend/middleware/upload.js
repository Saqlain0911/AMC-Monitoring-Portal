import multer from "multer";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, "..", "uploads");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory:", uploadsDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Organize files by date
    const dateFolder = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const dayUploadsDir = join(uploadsDir, dateFolder);

    if (!existsSync(dayUploadsDir)) {
      mkdirSync(dayUploadsDir, { recursive: true });
    }

    cb(null, dayUploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const name = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${name}_${uniqueSuffix}${ext}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    // Images
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",

    // Documents
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      ".pptx",

    // Text files
    "text/plain": ".txt",
    "text/csv": ".csv",

    // Compressed files
    "application/zip": ".zip",
    "application/x-rar-compressed": ".rar",
    "application/x-7z-compressed": ".7z",
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed. Allowed types: ${Object.values(allowedTypes).join(", ")}`,
      ),
      false,
    );
  }
};

// Configure multer with enhanced options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5, // Maximum 5 files per request
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100, // Field name size limit
    headerPairs: 2000, // Max header pairs
  },
  preservePath: false, // Don't preserve file path
});

// Middleware configurations
export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 5);
export const uploadFields = upload.fields([
  { name: "documents", maxCount: 3 },
  { name: "images", maxCount: 3 },
]);

// Handle multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File Too Large",
        message: "File size must be less than 10MB",
        statusCode: 400,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too Many Files",
        message: "Maximum 5 files allowed per upload",
        statusCode: 400,
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Unexpected Field",
        message: "Unexpected file field in upload",
        statusCode: 400,
      });
    }
  }

  if (err.message.includes("File type not allowed")) {
    return res.status(400).json({
      error: "Invalid File Type",
      message: err.message,
      statusCode: 400,
    });
  }

  // Other upload errors
  if (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      error: "Upload Failed",
      message: "Failed to upload file",
      statusCode: 500,
    });
  }

  next();
};

// Helper function to get file info with validation
export const getFileInfo = (file) => {
  if (!file) return null;

  // Validate file exists and has required properties
  if (!file.filename || !file.path || !file.originalname) {
    throw new Error("Invalid file object - missing required properties");
  }

  // Log file upload for debugging
  console.log(
    `📁 File uploaded: ${file.originalname} (${file.size} bytes) -> ${file.path}`,
  );

  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    destination: file.destination,
    uploadDate: new Date().toISOString(),
  };
};

// Helper function to get multiple files info
export const getFilesInfo = (files) => {
  if (!files) return [];

  if (Array.isArray(files)) {
    return files.map(getFileInfo);
  }

  // Handle files object (from upload.fields())
  const allFiles = [];
  Object.keys(files).forEach((fieldName) => {
    files[fieldName].forEach((file) => {
      allFiles.push({
        ...getFileInfo(file),
        fieldName,
      });
    });
  });

  return allFiles;
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  getFileInfo,
  getFilesInfo,
};
