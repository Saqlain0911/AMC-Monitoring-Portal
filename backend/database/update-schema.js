#!/usr/bin/env node

// Database schema update script to add blacklisted tokens table
import database from "./database.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateSchema() {
  console.log("🔄 Updating database schema for JWT token blacklisting...");

  try {
    await database.initialize();

    // Add blacklisted tokens table
    const addBlacklistSql = `
      -- Add blacklisted tokens table for JWT token management
      CREATE TABLE IF NOT EXISTS blacklisted_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token_id TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          reason TEXT DEFAULT 'logout',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_token_id ON blacklisted_tokens(token_id);
      CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_expires_at ON blacklisted_tokens(expires_at);
    `;

    // Execute the SQL
    const statements = addBlacklistSql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      await database.run(statement);
    }

    console.log("✅ Database schema updated successfully");
    console.log("✅ Blacklisted tokens table created");
    console.log("✅ Indexes created for performance");

    // Verify the table exists
    const tableExists = await database.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='blacklisted_tokens'",
    );

    if (tableExists) {
      console.log("✅ Schema verification successful");
    } else {
      console.log("❌ Schema verification failed");
    }
  } catch (error) {
    console.error("❌ Schema update failed:", error);
  } finally {
    await database.close();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateSchema().catch(console.error);
}

export default updateSchema;
