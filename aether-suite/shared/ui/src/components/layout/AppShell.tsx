import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface AppShellProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  sidebarCollapsed?: boolean;
}

export function AppShell({ sidebar, header, children, sidebarCollapsed = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px]">
        {sidebar ? (
          <aside
            className={cn(
              "sticky top-0 hidden h-screen border-r border-border bg-surface-alt/50 lg:block",
              sidebarCollapsed ? "w-20" : "w-72"
            )}
          >
            {sidebar}
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {header ? <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">{header}</div> : null}
          <main className="flex-1">{children}</main>
        </div>
      </div>

      {sidebar ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:hidden">{sidebar}</div>
      ) : null}
    </div>
  );
}
