import { TaskCategory } from "@/types";

/**
 * Generate appropriate due date based on task category
 */
export const getDefaultDueDate = (category: TaskCategory): Date => {
  const now = new Date();

  switch (category) {
    case "daily":
      // Daily tasks: due tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow;

    case "weekly":
      // Weekly tasks: due within 7 days (random between 3-7 days for variety)
      const weeklyDays = Math.floor(Math.random() * 5) + 3; // 3-7 days
      const weeklyDate = new Date(now);
      weeklyDate.setDate(now.getDate() + weeklyDays);
      return weeklyDate;

    case "monthly":
      // Monthly tasks: due within 15 days (random between 7-15 days for variety)
      const monthlyDays = Math.floor(Math.random() * 9) + 7; // 7-15 days
      const monthlyDate = new Date(now);
      monthlyDate.setDate(now.getDate() + monthlyDays);
      return monthlyDate;

    default:
      // Default to tomorrow if category is unknown
      const defaultDate = new Date(now);
      defaultDate.setDate(now.getDate() + 1);
      return defaultDate;
  }
};

/**
 * Get due date range description for category
 */
export const getDueDateRangeDescription = (category: TaskCategory): string => {
  switch (category) {
    case "daily":
      return "Due tomorrow";
    case "weekly":
      return "Due within 7 days";
    case "monthly":
      return "Due within 15 days";
    default:
      return "Due date varies";
  }
};

/**
 * Generate specific due dates for predefined intervals
 */
export const getExactDueDate = (
  category: TaskCategory,
  daysOffset?: number,
): Date => {
  const now = new Date();
  let targetDays: number;

  if (daysOffset !== undefined) {
    targetDays = daysOffset;
  } else {
    switch (category) {
      case "daily":
        targetDays = 1; // Tomorrow
        break;
      case "weekly":
        targetDays = 7; // Exactly 7 days
        break;
      case "monthly":
        targetDays = 15; // Exactly 15 days
        break;
      default:
        targetDays = 1;
    }
  }

  const dueDate = new Date(now);
  dueDate.setDate(now.getDate() + targetDays);
  return dueDate;
};

/**
 * Format due date for display
 */
export const formatDueDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
