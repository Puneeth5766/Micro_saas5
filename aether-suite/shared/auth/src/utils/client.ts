"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { AetherUser } from "./session";

export function useAetherSession() {
  const { data, status } = useSession();

  return {
    user: (data?.user as AetherUser | undefined) ?? null,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated"
  };
}

export function useRequireAuth() {
  const router = useRouter();
  const session = useAetherSession();

  useEffect(() => {
    if (!session.isLoading && !session.isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [router, session.isAuthenticated, session.isLoading]);

  return session;
}

export function useSubscriptionStatus() {
  const { user } = useAetherSession();

  return {
    isPro: user?.subscriptionStatus === "pro",
    isFree: user?.subscriptionStatus === "free",
    credits: user?.usageCredits ?? 0
  };
}
