"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  brand?: ReactNode;
  userName: string;
  userAvatar?: ReactNode;
  settingsHref?: string;
}

function isItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item, pathname, collapsed, depth = 0 }: { item: SidebarItem; pathname: string; collapsed: boolean; depth?: number }) {
  const active = isItemActive(pathname, item.href);

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm transition-colors",
          active ? "bg-primary text-white" : "text-text-secondary hover:bg-surface hover:text-text-primary",
          collapsed ? "justify-center" : "gap-2",
          depth > 0 && !collapsed && "ml-6"
        )}
        aria-current={active ? "page" : undefined}
      >
        {item.icon ? <span className="shrink-0 text-current">{item.icon}</span> : null}
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
        {!collapsed && item.badge ? (
          <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs text-text-secondary">{item.badge}</span>
        ) : null}
      </Link>

      {item.children?.length && !collapsed ? (
        <ul className="mt-1 space-y-1">
          {item.children.map((child) => (
            <SidebarLink key={child.href} item={child} pathname={pathname} collapsed={false} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function Sidebar({ items, collapsed = false, brand, userName, userAvatar, settingsHref = "/settings" }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  const isCollapsed = collapsed || !expanded;
  const normalizedPathname = useMemo(() => pathname ?? "/", [pathname]);

  return (
    <nav className={cn("flex h-full flex-col", isCollapsed ? "px-2 py-3" : "px-3 py-4")} aria-label="Sidebar navigation">
      <div className="mb-4 flex items-center justify-between">
        <div className={cn("min-w-0", isCollapsed && "hidden")}>{brand}</div>
        <button
          type="button"
          className="hidden rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:bg-surface lg:block"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <ul className={cn("flex-1 space-y-1 overflow-y-auto", isCollapsed && "space-y-2")}>
        {items.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={normalizedPathname} collapsed={isCollapsed} />
        ))}
      </ul>

      <div className="mt-4 border-t border-border pt-3">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-sm font-semibold text-text-primary">
            {userAvatar ?? userName.slice(0, 2).toUpperCase()}
          </div>
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{userName}</p>
              <Link href={settingsHref} className="text-xs text-text-secondary hover:text-primary">
                Settings
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
