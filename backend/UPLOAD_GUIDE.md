# 📁 File Upload Configuration Guide

## ✅ Current Multer Configuration

Your file upload system is **already fully configured** and working! Here's how it's set up:

### 🔧 **Multer Configuration** (`backend/middleware/upload.js`)

**Storage Configuration:**

- ✅ Files saved to `uploads/` directory
- ✅ Organized by date: `uploads/YYYY-MM-DD/filename`
- ✅ Unique filename generation with timestamp
- ✅ Original filename preservation with sanitization

**File Limits:**

- ✅ **10MB** maximum file size per file
- ✅ **5 files** maximum per request
- ✅ **Multiple file types** supported

**Supported File Types:**

- 📷 **Images**: JPG, PNG, GIF, WebP
- 📄 **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- 📝 **Text**: TXT, CSV
- 📦 **Archives**: ZIP, RAR, 7Z

### 🛡️ **JWT Token Integration**

**Authentication:**

- ✅ `authenticateToken` middleware applied to all task routes
- ✅ User ID extracted from JWT token: `req.user.id`
- ✅ `uploaded_by` field automatically set from JWT token

### 📋 **Task Routes with File Upload**

#### **POST /api/tasks** - Create Task with Files

```javascript
// Route configuration
router.post("/", uploadMultiple, handleUploadError, async (req, res) => {
  // File handling code:
  if (req.files && req.files.length > 0) {
    const filesInfo = getFilesInfo(req.files);

    for (const file of filesInfo) {
      await database.run(
        `
        INSERT INTO attachments (
          task_id, file_name, file_path, file_size, file_type, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          taskId,
          file.originalName,
          file.path, // Full file path
          file.size,
          file.mimetype,
          req.user.id, // ✅ JWT token user ID
        ],
      );
    }
  }
});
```

#### **PUT /api/tasks/:id** - Update Task with Files

```javascript
// Route configuration
router.put("/:id", uploadMultiple, handleUploadError, async (req, res) => {
  // Same file handling as POST route
  // uploaded_by field set to req.user.id from JWT token
});
```

### 🗃️ **Database Schema**

**Attachments Table:**

```sql
CREATE TABLE attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,      -- Original filename
    file_path TEXT NOT NULL,      -- Full path to uploaded file
    file_size INTEGER,            -- File size in bytes
    file_type TEXT,               -- MIME type
    uploaded_by INTEGER NOT NULL, -- ✅ User ID from JWT token
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### 🧪 **Testing File Uploads**

#### **Method 1: Using curl**

```bash
# 1. Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 2. Create task with file upload
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Task with File" \
  -F "description=Testing file upload" \
  -F "files=@/path/to/your/file.pdf" \
  -F "files=@/path/to/your/image.jpg"

# 3. Update task with additional files
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "description=Updated with new files" \
  -F "files=@/path/to/another/file.txt"
```

#### **Method 2: Using the Test Script**

```bash
cd backend
node test-upload.js
```

#### **Method 3: Using HTML Test Page**

1. Start your backend: `npm run dev`
2. Open: `http://localhost:3000/test.html`
3. Login with admin credentials
4. Test file upload functionality

### 📊 **File Upload Flow**

```
1. 🔐 JWT Authentication
   ↓
2. 📁 Multer File Processing
   ↓
3. 💾 Save to uploads/YYYY-MM-DD/
   ↓
4. 🗃️ Store metadata in database
   ↓ (uploaded_by = req.user.id)
5. ✅ Return success response
```

### 🛡️ **Security Features**

- ✅ **File type validation** - Only allowed types accepted
- ✅ **File size limits** - 10MB per file maximum
- ✅ **JWT authentication** - Only authenticated users can upload
- ✅ **User tracking** - All uploads tracked by user ID
- ✅ **Path sanitization** - Prevents directory traversal
- ✅ **Unique naming** - Prevents filename conflicts

### 📁 **File Organization**

```
backend/
├── uploads/
│   ├── 2024-06-21/
│   │   ├── document_1719234567890-123456789.pdf
│   │   ├── image_1719234567891-234567890.jpg
│   │   └── text_1719234567892-345678901.txt
│   ├── 2024-06-22/
│   │   └── ... (files for today)
│   └── ...
```

### 🌐 **File Access**

**Static File Serving:**

- Files accessible at: `http://localhost:3000/uploads/YYYY-MM-DD/filename`
- Configured in `server.js`: `app.use("/uploads", express.static(join(__dirname, "uploads")))`

### ✅ **Verification Checklist**

- [x] ✅ Multer configured for POST /api/tasks
- [x] ✅ Multer configured for PUT /api/tasks/:id
- [x] ✅ Files saved to uploads/ directory
- [x] ✅ uploaded_by field set from JWT token (req.user.id)
- [x] ✅ File type validation implemented
- [x] ✅ File size limits enforced
- [x] ✅ Error handling implemented
- [x] ✅ Database integration complete
- [x] ✅ Static file serving configured

## 🎯 **Your file upload system is production-ready!**

All requirements have been implemented:

- ✅ Multer handles file uploads for both POST and PUT routes
- ✅ Files are saved to uploads/ directory with date organization
- ✅ uploaded_by field is automatically set from JWT token
- ✅ Comprehensive error handling and validation
- ✅ Security measures implemented
