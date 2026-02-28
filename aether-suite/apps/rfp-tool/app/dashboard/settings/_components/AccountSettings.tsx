"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, ConfirmDialog, Input, Tabs, toast } from "@aether/ui";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long.")
});

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

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type AccountSettingsUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  subscriptionStatus: "free" | "pro" | "cancelled";
  usageCredits: number;
  provider: "google" | "email";
};

type ProfileActionState = {
  success: boolean;
  message: string;
  name?: string;
};

type AccountSettingsProps = {
  user: AccountSettingsUser;
  updateProfileAction: (input: { name: string }) => Promise<ProfileActionState>;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

export function AccountSettings({ user, updateProfileAction }: AccountSettingsProps) {
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name }
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const initials = useMemo(() => getInitials(user.name), [user.name]);

  const providerLabel = user.provider === "google" ? "Google" : "Email";

  function onSaveProfile(values: ProfileFormValues): void {
    startProfileTransition(async () => {
      const result = await updateProfileAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (result.name) {
        profileForm.reset({ name: result.name });
      }
    });
  }

  function onChangePassword(values: PasswordFormValues): void {
    startPasswordTransition(async () => {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok || !data.success) {
        toast.error(data.error ?? "Unable to update password.");
        return;
      }

      toast.success("Password changed successfully.");
      passwordForm.reset();
    });
  }

  function onDeleteAccount(): Promise<void> {
    return new Promise((resolve) => {
      startDeleteTransition(async () => {
        const response = await fetch("/api/user/delete", { method: "DELETE" });
        const data = (await response.json()) as { error?: string; success?: boolean };

        if (!response.ok || !data.success) {
          toast.error(data.error ?? "Unable to delete account.");
          resolve();
          return;
        }

        toast.success("Account deleted.");
        await signOut({ callbackUrl: "/" });
        resolve();
      });
    });
  }

  const tabs = [
    {
      value: "profile",
      label: "Profile",
      content: (
        <Card border padding="lg" className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-surface-alt">
                {user.image ? (
                  <Image src={user.image} alt={`${user.name} avatar`} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-text-primary">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">{user.name}</p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>
            <Badge variant="info" size="sm">
              {providerLabel} auth
            </Badge>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
            <Input
              label="Display name"
              placeholder="Your name"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register("name")}
            />
            <Input label="Email" value={user.email} readOnly disabled hint="Email cannot be changed here." />

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" loading={profilePending}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>
      )
    },
    ...(user.provider === "email"
      ? [
          {
            value: "security",
            label: "Security",
            content: (
              <Card border padding="lg" className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Change Password</h2>
                  <p className="text-sm text-text-secondary">Use a strong password with at least 8 characters.</p>
                </div>

                <form className="grid gap-4" onSubmit={passwordForm.handleSubmit(onChangePassword)} noValidate>
                  <Input
                    type="password"
                    label="Current password"
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register("currentPassword")}
                  />
                  <Input
                    type="password"
                    label="New password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register("newPassword")}
                  />
                  <Input
                    type="password"
                    label="Confirm new password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    {...passwordForm.register("confirmPassword")}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" loading={passwordPending}>
                      Save password
                    </Button>
                  </div>
                </form>
              </Card>
            )
          }
        ]
      : []),
    {
      value: "danger",
      label: "Danger Zone",
      content: (
        <Card border padding="lg" className="space-y-4 border-danger/50">
          <div>
            <h2 className="text-base font-semibold text-danger">Delete account</h2>
            <p className="text-sm text-text-secondary">
              This will permanently remove your account and usage history. This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="danger" onClick={() => setDeleteOpen(true)} loading={deletePending}>
              Delete account
            </Button>
          </div>

          <ConfirmDialog
            open={isDeleteOpen}
            onClose={setDeleteOpen}
            title="Delete account?"
            description="This permanently deletes your profile and usage logs. Continue?"
            confirmLabel="Yes, delete"
            cancelLabel="Cancel"
            variant="danger"
            onConfirm={onDeleteAccount}
          />
        </Card>
      )
    }
  ];

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Account settings</h1>
        <p className="text-sm text-text-secondary">Manage your profile, security, and account lifecycle.</p>
      </header>

      <Tabs items={tabs} variant="boxed" />
    </section>
  );
}
