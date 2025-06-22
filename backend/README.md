# AMC Portal Backend

A Node.js Express.js backend server for the AMC (Asset Management/Maintenance) Portal application.

## Features

- **Express.js** - Fast, unopinionated web framework
- **CORS** - Cross-origin resource sharing enabled
- **Security** - Helmet.js for basic security headers
- **Logging** - Morgan HTTP request logger
- **JSON Support** - Built-in JSON request/response handling
- **Error Handling** - Global error handling middleware
- **Health Checks** - Built-in health check endpoint

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup (Optional)

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development
```

### 3. Start the Server

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

## API Endpoints

### Health Check

- **GET** `/health` - Server health status
- **Response:** JSON with server status and timestamp

### API Info

- **GET** `/api` - API information and available endpoints
- **Response:** JSON with API details

## Server Configuration

### Port

- Default: `3000`
- Configurable via `PORT` environment variable

### CORS Origins

Currently allows requests from:

- `http://localhost:8080` (Vite dev server)
- `http://localhost:3000` (Alternative frontend)
- `http://localhost:5173` (Alternative Vite port)

### JSON Limits

- Request body limit: `10mb`
- URL-encoded limit: `10mb`

## Security Features

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configured for specific origins
- **Request size limits** - Prevents large payload attacks
- **Error handling** - Secure error responses

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

### Adding New Routes

1. Create route files in a `routes/` directory
2. Import and use them in `server.js`

Example:

```javascript
import userRoutes from "./routes/users.js";
app.use("/api/users", userRoutes);
```

## Environment Variables

| Variable   | Default       | Description      |
| ---------- | ------------- | ---------------- |
| `PORT`     | `3000`        | Server port      |
| `NODE_ENV` | `development` | Environment mode |

## Next Steps

This is a basic Express.js server setup. To extend it for the AMC Portal:

1. **Add Database Integration** (SQLite, MongoDB, etc.)
2. **Implement Authentication** (JWT, sessions)
3. **Create API Routes** (users, tasks, reports, etc.)
4. **Add Validation** (request validation middleware)
5. **Set up Testing** (Jest, Mocha, etc.)

## Testing the Server

Once started, you can test the server:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

Expected responses will be JSON with server status and information.
