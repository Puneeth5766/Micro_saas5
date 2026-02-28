"use client";

import { Sidebar, type SidebarItem } from "@aether/ui";

const sidebarItems: SidebarItem[] = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "AI Usage", href: "/admin/ai-usage" },
  { label: "Revenue", href: "/admin/revenue" },
  { label: "Events", href: "/admin/events" },
  { label: "System", href: "/admin/system" },
];

export interface AdminSidebarProps {
  userName: string;
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  return (
    <Sidebar
      items={sidebarItems}
      userName={userName}
      settingsHref="/dashboard/settings"
      brand={<p className="text-sm font-semibold text-text-primary">RFP Admin</p>}
    />
  );
}
