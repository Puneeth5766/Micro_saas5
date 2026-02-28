import { withAuth } from "@aether/auth";
import { connectDB, User } from "@aether/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long.")
});

export const PATCH = withAuth(async (request, context) => {
  const json = (await request.json()) as { name?: string };
  const parsed = profileSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(
    context.user.id,
    { $set: { name: parsed.data.name } },
    { new: true }
  )
    .select("name")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, name: user.name });
});
