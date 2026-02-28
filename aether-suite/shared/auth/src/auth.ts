import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import NextAuth from "next-auth";
import { env } from "@aether/config";
import { connectDB } from "@aether/db";
import { authConfig } from "./config";

let clientPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
  await connectDB();

  if (!clientPromise) {
    const client = new MongoClient(env.MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

const mongoClient = await getMongoClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(mongoClient),
  ...authConfig
});
