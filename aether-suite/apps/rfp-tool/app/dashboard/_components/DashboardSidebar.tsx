"use client";

import { Sidebar, type SidebarItem } from "@aether/ui";

const dashboardItems: SidebarItem[] = [
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Analytics", href: "/dashboard/analytics" },
];

export function DashboardSidebar({ userName }: { userName: string }) {
  return (
    <Sidebar
      items={dashboardItems}
      userName={userName}
      settingsHref="/dashboard/settings"
      brand={<p className="text-sm font-semibold text-text-primary">RFP Dashboard</p>}
    />
  );
}
