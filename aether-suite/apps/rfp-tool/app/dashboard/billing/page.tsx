import { requireServerUser } from "@aether/auth";
import { connectDB, User } from "@aether/db";
import { BillingDashboard } from "./_components/BillingDashboard";

export default async function BillingPage() {
  const user = await requireServerUser();
  await connectDB();

  const dbUser = await User.findById(user.id).select("subscriptionStatus usageCredits products").lean();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <BillingDashboard
        user={{
          ...user,
          subscriptionStatus: dbUser?.subscriptionStatus ?? user.subscriptionStatus,
          usageCredits: dbUser?.usageCredits ?? user.usageCredits,
          products: dbUser?.products ?? []
        }}
        productId="rfp-tool"
      />
    </main>
  );
}
