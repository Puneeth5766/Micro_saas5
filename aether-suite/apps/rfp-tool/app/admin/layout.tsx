import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell, Badge, PageContainer } from "@aether/ui";
import { AdminSidebar } from "./_components/AdminSidebar";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdmin(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.toLowerCase());
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <AppShell
      sidebar={<AdminSidebar userName={session.user.name ?? "Admin"} />}
      header={
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-text-primary">RFP Tool Admin</p>
            <Badge variant="danger" size="sm">
              Admin
            </Badge>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
            Back to App
          </Link>
        </div>
      }
    >
      <PageContainer>{children}</PageContainer>
    </AppShell>
  );
}
