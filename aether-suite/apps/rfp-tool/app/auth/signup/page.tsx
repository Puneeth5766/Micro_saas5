"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Card, Input } from "@aether/ui";
import { signupAction } from "../actions";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  function onSubmit(values: SignupFormValues): void {
    setServerError(null);
    startTransition(async () => {
      const result = await signupAction(values);
      if (result.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-0">
      <Card className="w-full" padding="lg" shadow="lg" border>
        <Card.Header>
          <h1 className="text-2xl font-semibold text-text-primary">Create your account</h1>
          <p className="text-sm text-text-secondary">Start using Aether AI in minutes.</p>
        </Card.Header>

        <Card.Body className="space-y-4">
          {serverError && <Alert variant="error" title="Sign-up failed" description={serverError} />}

          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Input
              label="Full name"
              required
              placeholder="Alex Morgan"
              error={form.formState.errors.name?.message}
              {...form.register("name")}
            />
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
            <Input
              label="Confirm password"
              type="password"
              required
              placeholder="••••••••"
              error={form.formState.errors.confirmPassword?.message}
              {...form.register("confirmPassword")}
            />
            <Button type="submit" className="w-full" loading={isPending}>
              Create account
            </Button>
          </form>
        </Card.Body>

        <Card.Footer className="justify-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </Card.Footer>
      </Card>
    </main>
  );
}
