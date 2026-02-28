import type { PropsWithChildren } from "react";

export * from "./components";
export { cn } from "./utils/cn";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">{title}</h1>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </header>
      <section className="rounded-lg border border-border bg-surface p-6 shadow-lg">{children}</section>
    </main>
  );
}
