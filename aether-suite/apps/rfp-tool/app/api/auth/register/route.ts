import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB, User } from "@aether/db";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: parsed.data.email }).lean();
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hash(parsed.data.password, 12);

    await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      image: "",
      provider: "email",
      passwordHash,
      subscriptionStatus: "free",
      usageCredits: 0,
      products: []
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
