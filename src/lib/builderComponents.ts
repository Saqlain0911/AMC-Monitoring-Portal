// import { builder } from "@builder.io/react";
import { Builder } from '@builder.io/react';

// Import UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import Custom AMC Components
import TaskCard from "@/components/TaskCard";
import DeadlineAlert from "@/components/DeadlineAlert";
import AlertBadge from "@/components/AlertBadge";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";

/**
 * Register all AMC Portal components with Builder.io
 * This allows these components to be used in the Builder.io visual editor
 */
export function registerAMCComponents() {
  // UI Components - Basic Elements
  Builder.registerComponent(Button, {
    name: "Button",
    inputs: [
      {
        name: "children",
        type: "string",
        defaultValue: "Click me",
        helperText: "Button text content",
      },
      {
        name: "variant",
        type: "string",
        enum: [
          "default",
          "destructive",
          "outline",
          "secondary",
          "ghost",
          "link",
        ],
        defaultValue: "default",
        helperText: "Button style variant",
      },
      {
        name: "size",
        type: "string",
        enum: ["default", "sm", "lg", "icon"],
        defaultValue: "default",
        helperText: "Button size",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: false,
        helperText: "Disable the button",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(Card, {
    name: "Card",
    inputs: [
      {
        name: "children",
        type: "blocks",
        defaultValue: [],
        helperText: "Card content",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(CardHeader, {
    name: "CardHeader",
    inputs: [
      {
        name: "children",
        type: "blocks",
        defaultValue: [],
        helperText: "Header content",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(CardTitle, {
    name: "CardTitle",
    inputs: [
      {
        name: "children",
        type: "string",
        defaultValue: "Card Title",
        helperText: "Title text",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(CardDescription, {
    name: "CardDescription",
    inputs: [
      {
        name: "children",
        type: "string",
        defaultValue: "Card description",
        helperText: "Description text",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(CardContent, {
    name: "CardContent",
    inputs: [
      {
        name: "children",
        type: "blocks",
        defaultValue: [],
        helperText: "Content blocks",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(CardFooter, {
    name: "CardFooter",
    inputs: [
      {
        name: "children",
        type: "blocks",
        defaultValue: [],
        helperText: "Footer content",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(Badge, {
    name: "Badge",
    inputs: [
      {
        name: "children",
        type: "string",
        defaultValue: "Badge",
        helperText: "Badge text",
      },
      {
        name: "variant",
        type: "string",
        enum: ["default", "secondary", "destructive", "outline"],
        defaultValue: "default",
        helperText: "Badge style variant",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  // Form Components
  builder.registerComponent(Input, {
    name: "Input",
    inputs: [
      {
        name: "type",
        type: "string",
        enum: ["text", "email", "password", "number", "tel", "url"],
        defaultValue: "text",
        helperText: "Input type",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: "Enter text...",
        helperText: "Placeholder text",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: false,
        helperText: "Disable the input",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(Label, {
    name: "Label",
    inputs: [
      {
        name: "children",
        type: "string",
        defaultValue: "Label",
        helperText: "Label text",
      },
      {
        name: "htmlFor",
        type: "string",
        helperText: "Associated input ID",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(Textarea, {
    name: "Textarea",
    inputs: [
      {
        name: "placeholder",
        type: "string",
        defaultValue: "Enter your message...",
        helperText: "Placeholder text",
      },
      {
        name: "rows",
        type: "number",
        defaultValue: 3,
        helperText: "Number of rows",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: false,
        helperText: "Disable the textarea",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(Checkbox, {
    name: "Checkbox",
    inputs: [
      {
        name: "checked",
        type: "boolean",
        defaultValue: false,
        helperText: "Checked state",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: false,
        helperText: "Disable the checkbox",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(Switch, {
    name: "Switch",
    inputs: [
      {
        name: "checked",
        type: "boolean",
        defaultValue: false,
        helperText: "Checked state",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: false,
        helperText: "Disable the switch",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  // Layout Components
  builder.registerComponent(Separator, {
    name: "Separator",
    inputs: [
      {
        name: "orientation",
        type: "string",
        enum: ["horizontal", "vertical"],
        defaultValue: "horizontal",
        helperText: "Separator orientation",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(Progress, {
    name: "Progress",
    inputs: [
      {
        name: "value",
        type: "number",
        defaultValue: 50,
        helperText: "Progress value (0-100)",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  // Complex Components
  builder.registerComponent(Tabs, {
    name: "Tabs",
    inputs: [
      {
        name: "defaultValue",
        type: "string",
        defaultValue: "tab1",
        helperText: "Default active tab",
      },
      {
        name: "children",
        type: "blocks",
        defaultValue: [],
        helperText: "Tab content",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(TabsList, {
    name: "TabsList",
    inputs: [
      {
        name: "children",
        type: "blocks",
        defaultValue: [],
        helperText: "Tab triggers",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(TabsTrigger, {
    name: "TabsTrigger",
    inputs: [
      {
        name: "value",
        type: "string",
        required: true,
        helperText: "Tab value identifier",
      },
      {
        name: "children",
        type: "string",
        defaultValue: "Tab",
        helperText: "Tab label",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: false,
        helperText: "Disable the tab",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(TabsContent, {
    name: "TabsContent",
    inputs: [
      {
        name: "value",
        type: "string",
        required: true,
        helperText: "Tab value identifier",
      },
      {
        name: "children",
        type: "blocks",
        defaultValue: [],
        helperText: "Tab content",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  // AMC-Specific Components
  builder.registerComponent(TaskCard, {
    name: "TaskCard",
    inputs: [
      {
        name: "task",
        type: "object",
        required: true,
        defaultValue: {
          id: "1",
          title: "Sample Task",
          description: "This is a sample task for demonstration",
          status: "pending",
          priority: "medium",
          category: "maintenance",
          dueDate: new Date().toISOString(),
          estimatedTime: 30,
          assignedTo: "1",
        },
        subFields: [
          {
            name: "id",
            type: "string",
            helperText: "Task ID",
          },
          {
            name: "title",
            type: "string",
            helperText: "Task title",
          },
          {
            name: "description",
            type: "string",
            helperText: "Task description",
          },
          {
            name: "status",
            type: "string",
            enum: ["pending", "in-progress", "completed", "overdue"],
            helperText: "Task status",
          },
          {
            name: "priority",
            type: "string",
            enum: ["low", "medium", "high", "urgent"],
            helperText: "Task priority",
          },
          {
            name: "category",
            type: "string",
            helperText: "Task category",
          },
          {
            name: "dueDate",
            type: "date",
            helperText: "Due date",
          },
          {
            name: "estimatedTime",
            type: "number",
            helperText: "Estimated time in minutes",
          },
        ],
      },
      {
        name: "showAssignee",
        type: "boolean",
        defaultValue: false,
        helperText: "Show assignee information",
      },
      {
        name: "compact",
        type: "boolean",
        defaultValue: false,
        helperText: "Use compact layout",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(DeadlineAlert, {
    name: "DeadlineAlert",
    inputs: [
      {
        name: "task",
        type: "object",
        required: true,
        defaultValue: {
          id: "1",
          dueDate: new Date().toISOString(),
          status: "pending",
        },
        subFields: [
          {
            name: "id",
            type: "string",
            helperText: "Task ID",
          },
          {
            name: "dueDate",
            type: "date",
            helperText: "Due date",
          },
          {
            name: "status",
            type: "string",
            enum: ["pending", "in-progress", "completed", "overdue"],
            helperText: "Task status",
          },
        ],
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  builder.registerComponent(AlertBadge, {
    name: "AlertBadge",
    inputs: [
      {
        name: "count",
        type: "number",
        defaultValue: 0,
        helperText: "Alert count",
      },
      {
        name: "variant",
        type: "string",
        enum: ["default", "secondary", "destructive", "outline"],
        defaultValue: "destructive",
        helperText: "Badge variant",
      },
      {
        name: "className",
        type: "string",
        helperText: "Additional CSS classes",
      },
    ],
  });

  console.log("✅ AMC Portal components registered with Builder.io");
}

export default registerAMCComponents;
