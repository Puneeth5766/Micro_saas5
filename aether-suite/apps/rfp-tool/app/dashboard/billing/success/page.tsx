import Link from "next/link";
import { requireServerUser } from "@aether/auth";
import { connectDB, User } from "@aether/db";
import { Button, Card, StatCard } from "@aether/ui";

export default async function BillingSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const user = await requireServerUser();
  const params = await searchParams;

  await connectDB();
  const dbUser = await User.findById(user.id).select("usageCredits").lean();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Card border padding="lg" className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Payment confirmed! Credits added.</h1>
          <p className="text-sm text-text-secondary">Session: {params.session_id ?? "Unavailable"}</p>
        </div>

        <StatCard label="Updated Credits" value={dbUser?.usageCredits ?? user.usageCredits} />

        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </Card>
    </main>
  );
}
