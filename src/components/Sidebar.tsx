import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Monitor,
  MessageSquare,
  Bell,
  History,
  FileText,
  Wrench,
  User,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: ("admin" | "user")[];
}

const adminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Task Management",
    href: "/admin/tasks",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    name: "Task Monitor",
    href: "/admin/monitor",
    icon: Monitor,
    roles: ["admin"],
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    name: "Maintenance",
    href: "/admin/maintenance",
    icon: Wrench,
    roles: ["admin"],
  },
  {
    name: "Remarks",
    href: "/admin/remarks",
    icon: MessageSquare,
    roles: ["admin"],
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    roles: ["admin"],
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: User,
    roles: ["admin"],
  },
];

const userNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/user/dashboard",
    icon: LayoutDashboard,
    roles: ["user"],
  },
  {
    name: "My Tasks",
    href: "/user/tasks",
    icon: ClipboardList,
    roles: ["user"],
  },
  {
    name: "Task History",
    href: "/user/history",
    icon: History,
    roles: ["user"],
  },
  {
    name: "Remarks",
    href: "/user/remarks",
    icon: MessageSquare,
    roles: ["user"],
  },
  {
    name: "Notifications",
    href: "/user/notifications",
    icon: Bell,
    roles: ["user"],
  },
  {
    name: "Reports",
    href: "/user/reports",
    icon: FileText,
    roles: ["user"],
  },
  {
    name: "Profile",
    href: "/user/profile",
    icon: User,
    roles: ["user"],
  },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const navItems = user.role === "admin" ? adminNavItems : userNavItems;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Monitor className="h-8 w-8 text-indigo-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">
          AMC Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )
              }
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-700">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.post}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
