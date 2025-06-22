import sqlite3 from "sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enable verbose mode for debugging
sqlite3.verbose();

class Database {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize() {
    try {
      // Create database file in the database directory
      const dbPath = join(__dirname, "database.sqlite");

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error("Error opening database:", err.message);
          throw err;
        }
        console.log("✅ Connected to SQLite database at:", dbPath);
      });

      // Enable foreign keys
      await this.run("PRAGMA foreign_keys = ON");

      // Create tables using schema file
      await this.createTables();

      this.isConnected = true;
      console.log("✅ Database initialized successfully");

      return this.db;
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  /**
   * Create all tables from schema file
   */
  async createTables() {
    try {
      const schemaPath = join(__dirname, "schema.sql");
      const schema = readFileSync(schemaPath, "utf8");

      // Parse and execute SQL statements properly
      await this.executeSQLSchema(schema);

      console.log("✅ Database tables created successfully");
    } catch (error) {
      console.error("❌ Error creating tables:", error);
      throw error;
    }
  }

  /**
   * Execute SQL schema with proper parsing
   */
  async executeSQLSchema(schema) {
    // Remove comments and empty lines
    const cleanedSchema = schema
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith("--");
      })
      .join("\n");

    // Split by semicolon but be careful with triggers
    const parts = cleanedSchema.split(";");
    const statements = [];
    let currentStatement = "";

    for (let i = 0; i < parts.length; i++) {
      currentStatement += parts[i];

      // Check if we're in a trigger (has CREATE TRIGGER and END)
      const isCompleteTrigger =
        currentStatement.includes("CREATE TRIGGER") &&
        currentStatement.includes("END");

      // Check if it's a regular statement (not a trigger)
      const isRegularStatement = !currentStatement.includes("CREATE TRIGGER");

      if (isCompleteTrigger || isRegularStatement) {
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = "";
      } else {
        currentStatement += ";"; // Add back the semicolon for incomplete triggers
      }
    }

    console.log(`🔨 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await this.run(statement);

        // Log progress for major operations
        if (statement.includes("CREATE TABLE")) {
          const tableName = statement.match(/CREATE TABLE.*?(\w+)/)?.[1];
          console.log(`✅ Created table: ${tableName}`);
        } else if (statement.includes("CREATE TRIGGER")) {
          const triggerName = statement.match(/CREATE TRIGGER.*?(\w+)/)?.[1];
          console.log(`✅ Created trigger: ${triggerName}`);
        } else if (statement.includes("INSERT")) {
          console.log(`✅ Inserted sample data`);
        }
      } catch (error) {
        // Skip errors for existing objects
        if (error.message.includes("already exists")) {
          console.log(`ℹ️  Skipped existing object in statement ${i + 1}`);
        } else {
          console.warn(
            `⚠️  SQL Warning (statement ${i + 1}): ${error.message}`,
          );
          // Continue with other statements, don't fail completely
        }
      }
    }
  }

  /**
   * Create tables using simplified schema (without triggers)
   */
  async createTablesSimple() {
    try {
      const schemaPath = join(__dirname, "schema-simple.sql");
      const schema = readFileSync(schemaPath, "utf8");

      // Simple split by semicolon for basic statements
      const statements = schema
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      console.log(`🔨 Executing ${statements.length} SQL statements...`);

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          await this.run(statement);
          if (statement.includes("CREATE TABLE")) {
            const tableName = statement.match(/CREATE TABLE.*?(\w+)/)?.[1];
            console.log(`✅ Created table: ${tableName}`);
          }
        } catch (error) {
          // Skip errors for existing tables
          if (!error.message.includes("already exists")) {
            console.warn(
              `⚠️  SQL Warning (statement ${i + 1}): ${error.message}`,
            );
          }
        }
      }

      console.log("✅ Database tables created successfully");
    } catch (error) {
      console.error("❌ Error creating tables:", error);
      throw error;
    }
  }

  /**
   * Execute a SQL statement (INSERT, UPDATE, DELETE, etc.)
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error("SQL Error:", err.message);
          console.error("SQL Statement:", sql);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Get a single row
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error("SQL Error:", err.message);
          console.error("SQL Statement:", sql);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get multiple rows
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("SQL Error:", err.message);
          console.error("SQL Statement:", sql);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute multiple statements in a transaction
   */
  async transaction(queries) {
    try {
      await this.run("BEGIN TRANSACTION");

      const results = [];
      for (const query of queries) {
        const result = await this.run(query.sql, query.params);
        results.push(result);
      }

      await this.run("COMMIT");
      return results;
    } catch (error) {
      await this.run("ROLLBACK");
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error("Error closing database:", err.message);
            reject(err);
          } else {
            console.log("✅ Database connection closed");
            this.isConnected = false;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Check if database is connected
   */
  isReady() {
    return this.isConnected && this.db;
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const tables = [
        "users",
        "tasks",
        "activities",
        "notifications",
        "attachments",
        "comments",
      ];
      const stats = {};

      for (const table of tables) {
        const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result.count;
      }

      return stats;
    } catch (error) {
      console.error("Error getting database stats:", error);
      return {};
    }
  }

  /**
   * Reset database (for development/testing)
   */
  async reset() {
    try {
      const tables = [
        "user_sessions",
        "comments",
        "attachments",
        "notifications",
        "activities",
        "tasks",
        "users",
      ];

      for (const table of tables) {
        await this.run(`DELETE FROM ${table}`);
      }

      // Reset auto-increment counters
      for (const table of tables) {
        await this.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
      }

      console.log("✅ Database reset successfully");
    } catch (error) {
      console.error("❌ Error resetting database:", error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

export default database;
