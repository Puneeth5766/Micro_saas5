import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import { env } from "@aether/config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type AuthUserRecord = {
  _id: { toString: () => string };
  email: string;
  name: string;
  image?: string | null;
  passwordHash?: string;
  subscriptionStatus?: "free" | "pro" | "cancelled";
  usageCredits?: number;
};

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error"
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) {
            return null;
          }

          const [{ connectDB, User }] = await Promise.all([import("@aether/db")]);
          await connectDB();

          const user = (await User.findOne({ email: parsed.data.email }).lean()) as AuthUserRecord | null;
          if (!user?.passwordHash) {
            return null;
          }

          const valid = await compare(parsed.data.password, user.passwordHash);
          if (!valid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image ?? null,
            subscriptionStatus: user.subscriptionStatus ?? "free",
            usageCredits: user.usageCredits ?? 0
          };
        } catch {
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.subscriptionStatus =
          ("subscriptionStatus" in user &&
            (user.subscriptionStatus as "free" | "pro" | "cancelled" | undefined)) ||
          "free";
        token.usageCredits =
          ("usageCredits" in user && typeof user.usageCredits === "number" && user.usageCredits) || 0;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.subscriptionStatus = token.subscriptionStatus ?? "free";
        session.user.usageCredits = token.usageCredits ?? 0;
      }

      return session;
    },
    signIn: async ({ user, account }) => {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      try {
        const [{ connectDB, User }] = await Promise.all([import("@aether/db")]);
        await connectDB();

        await User.findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              email: user.email,
              provider: "google",
              name: user.name ?? user.email.split("@")[0],
              image: user.image ?? "",
              subscriptionStatus: "free",
              usageCredits: 0,
              products: []
            },
            $set: {
              name: user.name ?? user.email.split("@")[0],
              image: user.image ?? ""
            }
          },
          { upsert: true, new: true }
        );

        return true;
      } catch {
        return false;
      }
    }
  },
  events: {
    createUser: async ({ user }) => {
      console.info("[auth] New user created", { userId: user.id, email: user.email });
    }
  }
};
