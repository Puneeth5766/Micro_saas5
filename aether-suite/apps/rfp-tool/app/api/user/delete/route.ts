import { withAuth } from "@aether/auth";
import { connectDB, UsageLog, User } from "@aether/db";
import { NextResponse } from "next/server";

export const DELETE = withAuth(async (_request, context) => {
  await connectDB();

  const user = await User.findById(context.user.id).select("_id").lean();
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await UsageLog.deleteMany({ userId: user._id });
  await User.deleteOne({ _id: user._id });

  return NextResponse.json({ success: true });
});
