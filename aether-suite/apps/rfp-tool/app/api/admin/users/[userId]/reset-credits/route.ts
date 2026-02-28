import { auth } from "@/auth";
import { connectDB, User } from "@aether/db";
import { NextResponse } from "next/server";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdmin(session: Awaited<ReturnType<typeof auth>>): boolean {
  const sessionUser = session?.user as ({ email?: string | null; isAdmin?: boolean } & Record<string, unknown>) | undefined;
  const email = sessionUser?.email?.toLowerCase();
  const inAllowList = !!email && getAdminEmails().includes(email);
  return Boolean(sessionUser?.isAdmin) || inAllowList;
}

export async function POST(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();

  if (!session?.user || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  try {
    await connectDB();

    const updated = await User.findByIdAndUpdate(userId, { $set: { usageCredits: 0 } }, { new: true })
      .select("_id usageCredits")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.info("[admin] usage credits reset", {
      adminEmail: session.user.email,
      targetUserId: userId,
      usageCredits: updated.usageCredits,
      action: "reset_credits",
    });

    return NextResponse.json({ success: true, userId: String(updated._id), usageCredits: updated.usageCredits });
  } catch (error: unknown) {
    console.error("[admin] failed to reset credits", error);
    return NextResponse.json({ error: "Unable to reset credits" }, { status: 500 });
  }
}
