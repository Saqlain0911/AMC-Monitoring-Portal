#!/usr/bin/env node

/**
 * Production Database Initialization Script
 * This script sets up the database and performs initial data migration
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import database from "./database/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeProduction() {
  console.log("🚀 Starting AMC Portal Production Initialization...");

  try {
    // 1. Create necessary directories
    console.log("📁 Creating directories...");
    const dirs = ["uploads", "logs", "database"];

    dirs.forEach((dir) => {
      const dirPath = join(__dirname, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } else {
        console.log(`✅ Directory exists: ${dir}`);
      }
    });

    // 2. Initialize database
    console.log("🗄️  Initializing database...");
    await database.initialize();
    console.log("✅ Database initialized successfully");

    // 3. Check if database has data
    const userCount = await database.get("SELECT COUNT(*) as count FROM users");

    if (userCount.count === 0) {
      console.log("📊 Database is empty, running data migration...");

      // Import and run migration
      const { runMigration } = await import("./migrate-mock-data.js");
      await runMigration();

      console.log("✅ Data migration completed");
    } else {
      console.log(
        `✅ Database has ${userCount.count} users, skipping migration`,
      );
    }

    // 4. Verify database integrity
    console.log("🔍 Verifying database integrity...");
    const tables = await database.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    const expectedTables = [
      "users",
      "tasks",
      "activities",
      "notifications",
      "attachments",
      "comments",
      "user_sessions",
      "token_blacklist",
    ];

    const existingTables = tables.map((t) => t.name);
    const missingTables = expectedTables.filter(
      (t) => !existingTables.includes(t),
    );

    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(", ")}`);
    } else {
      console.log("✅ All required tables present");
    }

    // 5. Create default admin user if none exists
    const adminUser = await database.get(`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `);

    if (!adminUser) {
      console.log("👤 Creating default admin user...");
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await database.run(
        `
        INSERT INTO users (username, password, role, full_name, email)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          "admin",
          hashedPassword,
          "admin",
          "System Administrator",
          "admin@amcportal.com",
        ],
      );

      console.log("✅ Default admin user created");
      console.log("⚠️  Default password: admin123 (CHANGE IMMEDIATELY)");
    }

    // 6. Database statistics
    console.log("\n📊 Database Statistics:");
    const stats = await Promise.all([
      database.get("SELECT COUNT(*) as count FROM users"),
      database.get("SELECT COUNT(*) as count FROM tasks"),
      database.get("SELECT COUNT(*) as count FROM activities"),
      database.get("SELECT COUNT(*) as count FROM notifications"),
    ]);

    console.log(`   Users: ${stats[0].count}`);
    console.log(`   Tasks: ${stats[1].count}`);
    console.log(`   Activities: ${stats[2].count}`);
    console.log(`   Notifications: ${stats[3].count}`);

    console.log("\n🎉 Production initialization completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Change default admin password");
    console.log("   2. Configure environment variables");
    console.log("   3. Set up SSL certificates");
    console.log("   4. Configure reverse proxy");
    console.log("   5. Set up monitoring and logging");
  } catch (error) {
    console.error("❌ Production initialization failed:", error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeProduction();
}

export { initializeProduction };
