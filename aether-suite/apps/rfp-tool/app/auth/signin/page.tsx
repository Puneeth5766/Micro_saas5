"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Card, Input } from "@aether/ui";
import { credentialsSignInAction } from "../actions";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

type SignInFormValues = z.infer<typeof signInSchema>;

const errorMap: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthSignin: "Unable to sign in with Google right now.",
  OAuthAccountNotLinked: "Use the provider you originally signed in with."
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const paramError = searchParams.get("error") ?? "";
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Aether AI";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  function onSubmit(values: SignInFormValues): void {
    setServerError(null);
    startTransition(async () => {
      const result = await credentialsSignInAction({ ...values, callbackUrl });
      if (result.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-0">
      <Card className="w-full" padding="lg" shadow="lg" border>
        <Card.Header>
          <h1 className="text-2xl font-semibold text-text-primary">Sign in to {appName}</h1>
          <p className="text-sm text-text-secondary">Use your account to continue to your dashboard.</p>
        </Card.Header>

        <Card.Body className="space-y-4">
          {(paramError || serverError) && (
            <Alert
              variant="error"
              title="Sign-in failed"
              description={serverError ?? errorMap[paramError] ?? "Unable to sign in. Please try again."}
            />
          )}

          <a href={`/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block">
            <Button className="w-full" size="lg">
              Continue with Google
            </Button>
          </a>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-text-muted">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Input
              label="Email"
              type="email"
              required
              placeholder="you@company.com"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />
            <Button type="submit" className="w-full" loading={isPending}>
              Sign in with email
            </Button>
          </form>
        </Card.Body>

        <Card.Footer className="justify-center">
          <p className="text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </Card.Footer>
      </Card>
    </main>
  );
}
