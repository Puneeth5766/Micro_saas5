import { AnalyticsEvent, User, connectDB } from "@aether/db";
import { Card } from "@aether/ui";
import { UsersTable, type AdminUserRow } from "../_components/UsersTable";

const PAGE_SIZE = 50;

interface UsersPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  await connectDB();

  const [users, totalUsers] = await Promise.all([
    User.find({})
      .select("name email subscriptionStatus usageCredits createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    User.countDocuments({}),
  ]);

  const userIds = users.map((user) => String(user._id));

  const generationRows =
    userIds.length > 0
      ? await AnalyticsEvent.aggregate<{ userId: string; totalGenerations: number }>([
          {
            $match: {
              userId: { $in: userIds },
              productId: "rfp-tool",
              event: "ai_generate_completed",
            },
          },
          {
            $group: {
              _id: "$userId",
              totalGenerations: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              userId: "$_id",
              totalGenerations: 1,
            },
          },
        ])
      : [];

  const generationMap = new Map(generationRows.map((row) => [row.userId, row.totalGenerations]));

  const rows: AdminUserRow[] = users.map((user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    plan:
      user.subscriptionStatus === "pro"
        ? "pro"
        : user.subscriptionStatus === "pay_per_use"
          ? "pay_per_use"
          : "free",
    credits: user.usageCredits,
    totalGenerations: generationMap.get(String(user._id)) ?? 0,
    joinedDate: new Date(user.createdAt).toISOString().slice(0, 10),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Users</h1>
        <p className="text-sm text-text-secondary">Manage users, plan status, and usage.</p>
      </div>

      <Card border className="p-5">
        <p className="mb-4 text-sm text-text-secondary">
          Showing {rows.length} users (page {page}) of {Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))}.
        </p>
        <UsersTable rows={rows} />
      </Card>
    </div>
  );
}
