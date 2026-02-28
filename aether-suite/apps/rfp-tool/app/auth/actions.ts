"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../../auth";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  callbackUrl: z.string().optional()
});

const signupSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

export type AuthActionResult = {
  error?: string;
};

export async function credentialsSignInAction(input: z.infer<typeof credentialsSchema>): Promise<AuthActionResult> {
  const parsed = credentialsSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials input." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.callbackUrl ?? "/dashboard"
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }

    throw error;
  }
}

export async function signupAction(input: z.infer<typeof signupSchema>): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid signup input." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3001";

  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password
    }),
    cache: "no-store"
  });

  const json = (await response.json()) as { success?: boolean; error?: string };

  if (!response.ok || !json.success) {
    return { error: json.error ?? "Unable to create account." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard"
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic sign-in failed. Please sign in manually." };
    }

    throw error;
  }
}
