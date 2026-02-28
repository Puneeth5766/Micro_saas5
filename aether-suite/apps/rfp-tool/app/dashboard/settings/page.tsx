import { requireServerUser } from "@aether/auth";
import { connectDB, User } from "@aether/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AccountSettings } from "./_components/AccountSettings";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long.")
});

type ProfileActionState = {
  success: boolean;
  message: string;
  name?: string;
};

async function updateProfileAction(input: { name: string }): Promise<ProfileActionState> {
  "use server";

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid name."
    };
  }

  const sessionUser = await requireServerUser();
  await connectDB();

  const updated = await User.findByIdAndUpdate(
    sessionUser.id,
    { $set: { name: parsed.data.name } },
    { new: true }
  )
    .select("name")
    .lean();

  if (!updated) {
    return { success: false, message: "User not found." };
  }

  revalidatePath("/dashboard/settings");

  return {
    success: true,
    message: "Profile updated successfully.",
    name: updated.name
  };
}

export default async function SettingsPage() {
  const user = await requireServerUser();
  await connectDB();

  const dbUser = await User.findById(user.id).select("provider").lean();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <AccountSettings
        user={{
          ...user,
          provider: dbUser?.provider === "google" ? "google" : "email"
        }}
        updateProfileAction={updateProfileAction}
      />
    </main>
  );
}
