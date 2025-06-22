import { TaskCategory } from "@/types";

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  estimatedTime: number; // in minutes
  frequency?: string;
}

export const DAILY_TASKS: TaskDefinition[] = [
  {
    id: "dt-001",
    title: "AV Check",
    description: "Check audio and video equipment functionality",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 9:00 AM",
  },
  {
    id: "dt-002",
    title: "OS Update and Activation",
    description: "Check and install operating system updates",
    category: "daily",
    estimatedTime: 30,
    frequency: "Daily at 10:00 AM",
  },
  {
    id: "dt-003",
    title: "MS Office Activation",
    description: "Verify Microsoft Office licensing and activation status",
    category: "daily",
    estimatedTime: 10,
    frequency: "Daily at 11:00 AM",
  },
  {
    id: "dt-004",
    title: "Hardware Status Check",
    description: "Check CPU, Monitor, Keyboard functionality",
    category: "daily",
    estimatedTime: 20,
    frequency: "Daily at 2:00 PM",
  },
  {
    id: "dt-005",
    title: "Network Connectivity",
    description: "Test internet and internal network connectivity",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 3:00 PM",
  },
  {
    id: "dt-006",
    title: "Cameras and Recordings",
    description: "Check surveillance cameras and recording systems",
    category: "daily",
    estimatedTime: 25,
    frequency: "Daily at 4:00 PM",
  },
  {
    id: "dt-007",
    title: "UPS Check",
    description: "Verify UPS battery status and functionality",
    category: "daily",
    estimatedTime: 10,
    frequency: "Daily at 5:00 PM",
  },
  {
    id: "dt-008",
    title: "AC Operational Status",
    description: "Check air conditioning system operation",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 6:00 PM",
  },
  {
    id: "dt-009",
    title: "Biometric Check (Morning)",
    description: "Test biometric systems functionality - Morning Check",
    category: "daily",
    estimatedTime: 10,
    frequency: "Daily at 9:30 AM",
  },
  {
    id: "dt-010",
    title: "Biometric Check (Evening)",
    description: "Test biometric systems functionality - Evening Check",
    category: "daily",
    estimatedTime: 10,
    frequency: "Daily at 6:30 PM",
  },
  {
    id: "dt-011",
    title: "Surveillance System Check",
    description: "Verify surveillance system operations and alerts",
    category: "daily",
    estimatedTime: 20,
    frequency: "Daily at 7:00 PM",
  },
  {
    id: "dt-012",
    title: "VC Setup Working",
    description: "Test video conferencing equipment and connectivity",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 8:00 AM",
  },
  {
    id: "dt-013",
    title: "Printers/Scanners Status",
    description: "Check printer and scanner functionality",
    category: "daily",
    estimatedTime: 15,
    frequency: "Daily at 1:00 PM",
  },
  {
    id: "dt-014",
    title: "Respond to Complaints",
    description: "Address and respond to user complaints and issues",
    category: "daily",
    estimatedTime: 60,
    frequency: "As needed throughout the day",
  },
];

export const WEEKLY_TASKS: TaskDefinition[] = [
  {
    id: "wt-001",
    title: "VC Room Inspection",
    description: "Complete inspection of video conferencing rooms",
    category: "weekly",
    estimatedTime: 45,
    frequency: "Every Monday at 10:00 AM",
  },
  {
    id: "wt-002",
    title: "Software Applications Check",
    description: "Verify PDF readers, VLC, and other important applications",
    category: "weekly",
    estimatedTime: 30,
    frequency: "Every Tuesday at 2:00 PM",
  },
  {
    id: "wt-003",
    title: "Cable Inspection",
    description: "Inspect cables, fiber, power cables, network switches",
    category: "weekly",
    estimatedTime: 60,
    frequency: "Every Wednesday at 9:00 AM",
  },
  {
    id: "wt-004",
    title: "Server Room HDD Status",
    description: "Check server room hard disk drive status and health",
    category: "weekly",
    estimatedTime: 30,
    frequency: "Every Thursday at 11:00 AM",
  },
  {
    id: "wt-005",
    title: "Server Operations Check",
    description: "Verify all server operations and performance",
    category: "weekly",
    estimatedTime: 45,
    frequency: "Every Thursday at 3:00 PM",
  },
  {
    id: "wt-006",
    title: "Cleaning of Server Room",
    description: "Clean server room and all endpoints",
    category: "weekly",
    estimatedTime: 90,
    frequency: "Every Friday at 4:00 PM",
  },
  {
    id: "wt-007",
    title: "Unauthorized Device Check",
    description: "Scan for and remove unauthorized devices from network",
    category: "weekly",
    estimatedTime: 30,
    frequency: "Every Friday at 2:00 PM",
  },
];

export const MONTHLY_TASKS: TaskDefinition[] = [
  {
    id: "mt-001",
    title: "Firewall Check",
    description:
      "Comprehensive firewall security audit and configuration review",
    category: "monthly",
    estimatedTime: 120,
    frequency: "First Monday of every month",
  },
  {
    id: "mt-002",
    title: "Backup and Recovery",
    description: "Test backup systems and recovery procedures",
    category: "monthly",
    estimatedTime: 180,
    frequency: "Second Tuesday of every month",
  },
  {
    id: "mt-003",
    title: "Security Assessment",
    description: "Complete security vulnerability assessment",
    category: "monthly",
    estimatedTime: 240,
    frequency: "Third Wednesday of every month",
  },
  {
    id: "mt-004",
    title: "Performance Optimization",
    description: "System performance analysis and optimization",
    category: "monthly",
    estimatedTime: 180,
    frequency: "Fourth Thursday of every month",
  },
];

export const ALL_TASK_DEFINITIONS = [
  ...DAILY_TASKS,
  ...WEEKLY_TASKS,
  ...MONTHLY_TASKS,
];

export const getTaskDefinitionsByCategory = (
  category: TaskCategory,
): TaskDefinition[] => {
  switch (category) {
    case "daily":
      return DAILY_TASKS;
    case "weekly":
      return WEEKLY_TASKS;
    case "monthly":
      return MONTHLY_TASKS;
    default:
      return [];
  }
};
