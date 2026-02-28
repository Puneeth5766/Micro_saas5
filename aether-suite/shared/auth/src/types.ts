import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      subscriptionStatus: "free" | "pro" | "cancelled";
      usageCredits: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    subscriptionStatus?: "free" | "pro" | "cancelled";
    usageCredits?: number;
  }
}
