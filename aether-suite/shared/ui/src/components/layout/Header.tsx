"use client";

import type { ReactNode } from "react";
import { Dropdown, type DropdownItem } from "../Dropdown";

export interface HeaderProps {
  title: ReactNode;
  onMenuToggle?: () => void;
  onNotificationsClick?: () => void;
  userName: string;
  userAvatar?: ReactNode;
  profileHref?: string;
  billingHref?: string;
  onLogout?: () => void;
}

export function Header({
  title,
  onMenuToggle,
  onNotificationsClick,
  userName,
  userAvatar,
  profileHref = "/profile",
  billingHref = "/billing",
  onLogout
}: HeaderProps) {
  const items: DropdownItem[] = [
    { label: "Profile", onClick: () => (window.location.href = profileHref) },
    { label: "Billing", onClick: () => (window.location.href = billingHref) },
    { separator: true },
    { label: "Logout", destructive: true, onClick: onLogout }
  ];

  return (
    <header className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6" aria-label="Page header">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-surface lg:hidden"
          onClick={onMenuToggle}
        >
          ☰
        </button>
        <div className="truncate text-base font-semibold text-text-primary lg:text-lg">{title}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Open notifications"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-surface"
          onClick={onNotificationsClick}
        >
          🔔
        </button>

        <Dropdown
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm text-text-primary hover:bg-surface"
              aria-label="Open user menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-alt text-xs font-semibold">
                {userAvatar ?? userName.slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden max-w-24 truncate sm:inline">{userName}</span>
            </button>
          }
          items={items}
        />
      </div>
    </header>
  );
}
