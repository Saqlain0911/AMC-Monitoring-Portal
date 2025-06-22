# AMC Portal Deployment Guide

## 🚀 Production Deployment Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- SSL certificates (for HTTPS)
- Domain name configured
- Reverse proxy (nginx recommended)

### 1. Environment Setup

#### Backend Environment Configuration

Create `backend/.env` with production values:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security (CHANGE THESE VALUES)
JWT_SECRET=your-ultra-secure-256-bit-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# Database
DATABASE_PATH=./database/database.sqlite

# CORS (Update with your domain)
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# File Uploads
UPLOAD_MAX_SIZE=10485760
UPLOAD_MAX_FILES=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Configuration

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BUILDER_API_KEY=your-builder-io-api-key
VITE_NODE_ENV=production
```

### 2. Installation & Build

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize production database
npm run init-db

# Run data migration (if needed)
npm run migrate

# Run production initialization
node initialize-production.js
```

#### Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Build for production
npm run build
```

### 3. Security Configuration

#### SSL Certificate Setup

```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/amc-portal`:

```nginx
# Frontend (React App)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /path/to/amc-portal/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API (Optional separate subdomain)
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/amc-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Process Management

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "amc-portal-backend",
      script: "server.js",
      cwd: "./backend",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "500M",
      restart_delay: 1000,
    },
  ],
};
```

Start the application:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 5. Database Management

#### Backup Strategy

Create automated backup script `backup-database.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/path/to/amc-portal/backend/database/database.sqlite"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
cp $DB_PATH "$BACKUP_DIR/database_backup_$DATE.sqlite"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "database_backup_*.sqlite" -mtime +30 -delete

echo "Database backup completed: database_backup_$DATE.sqlite"
```

Schedule with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-database.sh
```

### 6. Monitoring & Logging

#### Log Rotation

Create `/etc/logrotate.d/amc-portal`:

```
/path/to/amc-portal/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    sharedscripts
    postrotate
        pm2 reload amc-portal-backend
    endscript
}
```

#### Health Check Script

Create `health-check.sh`:

```bash
#!/bin/bash
HEALTH_URL="https://api.yourdomain.com/health"
SLACK_WEBHOOK="your-slack-webhook-url"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response != "200" ]; then
    echo "Health check failed with status: $response"

    # Send alert to Slack (optional)
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"AMC Portal health check failed with status: '$response'"}' \
        $SLACK_WEBHOOK

    exit 1
else
    echo "Health check passed"
fi
```

Schedule health checks:

```bash
# Check every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

### 7. Builder.io Configuration

1. **Get API Key:**

   - Login to Builder.io dashboard
   - Go to Account Settings → API Keys
   - Copy Public API Key

2. **Update Environment:**

   ```env
   VITE_BUILDER_API_KEY=your-actual-builder-api-key
   ```

3. **Create Content:**
   - Create page models in Builder.io dashboard
   - Set URL targeting for /home, /admin/builder, /user/builder

### 8. Performance Optimization

#### Enable HTTP/2 and Compression

Add to nginx configuration:

```nginx
# Enable HTTP/2
listen 443 ssl http2;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

#### Database Optimization

For high-traffic scenarios, consider:

```bash
# SQLite optimization settings
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000000;
PRAGMA temp_store = MEMORY;
```

### 9. Security Checklist

- [ ] SSL certificates installed and configured
- [ ] Default passwords changed
- [ ] JWT secret keys updated
- [ ] CORS origins configured for production domains
- [ ] Rate limiting enabled
- [ ] Security headers added
- [ ] Database file permissions restricted
- [ ] Log files secured
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Regular security updates scheduled

### 10. Post-Deployment Verification

#### Health Checks

```bash
# Test backend health
curl https://api.yourdomain.com/health

# Test frontend
curl https://yourdomain.com

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-new-password"}'
```

#### Performance Testing

```bash
# Install Apache Bench for load testing
sudo apt install apache2-utils

# Test with 100 concurrent requests
ab -n 1000 -c 100 https://yourdomain.com/

# Test API endpoint
ab -n 500 -c 50 https://api.yourdomain.com/health
```

### 11. Maintenance & Updates

#### Update Process

1. **Backup database before updates**
2. **Test updates in staging environment**
3. **Use PM2 for zero-downtime deployment:**

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install

# Rebuild frontend
npm run build

# Reload backend with PM2
pm2 reload amc-portal-backend
```

#### Monitoring Commands

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs amc-portal-backend

# Monitor system resources
pm2 monit

# Restart if needed
pm2 restart amc-portal-backend
```

### 12. Troubleshooting

#### Common Issues

1. **502 Bad Gateway:**

   - Check if backend is running: `pm2 status`
   - Check nginx configuration: `sudo nginx -t`
   - Check logs: `pm2 logs`

2. **Database Locked:**

   - Stop application: `pm2 stop amc-portal-backend`
   - Check for zombie processes: `ps aux | grep node`
   - Restart: `pm2 start amc-portal-backend`

3. **High Memory Usage:**
   - Monitor with: `pm2 monit`
   - Check logs for memory leaks
   - Restart with: `pm2 restart amc-portal-backend`

#### Log Locations

- **Backend Logs:** `/path/to/amc-portal/backend/logs/`
- **PM2 Logs:** `~/.pm2/logs/`
- **Nginx Logs:** `/var/log/nginx/`
- **System Logs:** `/var/log/syslog`

### 13. Emergency Procedures

#### Rollback Process

```bash
# Stop current version
pm2 stop amc-portal-backend

# Restore database backup
cp /path/to/backups/database_backup_YYYYMMDD.sqlite \
   /path/to/amc-portal/backend/database/database.sqlite

# Checkout previous version
git checkout previous-stable-commit

# Rebuild and restart
npm run build
pm2 start amc-portal-backend
```

#### Contact Information

- **System Administrator:** [Your contact info]
- **Technical Support:** [Support contact]
- **Emergency Escalation:** [Emergency contact]

---

This deployment guide provides comprehensive instructions for setting up AMC Portal in a production environment with proper security, monitoring, and maintenance procedures.
