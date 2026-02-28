import { withAuth } from "@aether/auth";
import { connectDB, User } from "@aether/db";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password.")
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

export const PATCH = withAuth(async (request, context) => {
  const json = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  const parsed = passwordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(context.user.id).select("provider passwordHash");
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.provider !== "email") {
    return NextResponse.json({ error: "Password updates are only available for email accounts." }, { status: 400 });
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "Password record is missing for this account." }, { status: 400 });
  }

  const validCurrentPassword = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!validCurrentPassword) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  user.passwordHash = await hash(parsed.data.newPassword, 12);
  await user.save();

  return NextResponse.json({ success: true });
});
