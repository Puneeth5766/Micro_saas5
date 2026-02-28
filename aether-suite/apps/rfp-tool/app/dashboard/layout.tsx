import { requireServerUser } from "@aether/auth";
import { AppShell } from "@aether/ui";
import { DashboardSidebar } from "./_components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireServerUser();

  return <AppShell sidebar={<DashboardSidebar userName={user.name} />}>{children}</AppShell>;
}
