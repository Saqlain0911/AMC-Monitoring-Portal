#!/usr/bin/env node

// Simple script to run the migration
import migrationScript from "./migrate-mock-data.js";

console.log("🚀 Starting Mock Data Migration...\n");

// Add confirmation prompt
const readline = await import("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

console.log("⚠️  WARNING: This will clear existing data in the database!");
console.log("Make sure you have a backup if needed.\n");

const confirmation = await askQuestion(
  "Do you want to proceed with the migration? (yes/no): ",
);

if (
  confirmation.toLowerCase() === "yes" ||
  confirmation.toLowerCase() === "y"
) {
  rl.close();

  try {
    await migrationScript.runMigration();
    console.log("\n🎉 Migration completed successfully!");
    console.log("\nYou can now:");
    console.log("1. Start your backend server: npm run dev");
    console.log("2. Test the API with migrated data");
    console.log("3. Update your frontend to use the new backend");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
} else {
  console.log("❌ Migration cancelled by user.");
  rl.close();
  process.exit(0);
}
