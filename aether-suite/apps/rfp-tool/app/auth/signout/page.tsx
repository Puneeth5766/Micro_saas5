"use client";

import { Spinner } from "@aether/ui";
import { useEffect } from "react";
import { signOut } from "../../../auth";

export default function SignOutPage() {
  useEffect(() => {
    void signOut({ redirectTo: "/" });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-6 py-4">
        <Spinner size="md" color="primary" />
        <p className="text-sm text-text-secondary">Signing you out...</p>
      </div>
    </main>
  );
}
