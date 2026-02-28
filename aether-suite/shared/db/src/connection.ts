import mongoose from "mongoose";
import { env } from "@aether/config";

type MongooseGlobal = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  eventsBound: boolean;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  __aetherMongoose?: MongooseGlobal;
};

const cached: MongooseGlobal = globalWithMongoose.__aetherMongoose ?? {
  conn: null,
  promise: null,
  eventsBound: false,
};

if (!globalWithMongoose.__aetherMongoose) {
  globalWithMongoose.__aetherMongoose = cached;
}

function bindConnectionEvents(): void {
  if (cached.eventsBound) {
    return;
  }

  mongoose.connection.on("connected", () => {
    console.info("[db] MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("[db] MongoDB connection error", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  cached.eventsBound = true;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    bindConnectionEvents();

    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        autoIndex: env.NODE_ENV !== "production",
      })
      .catch((error: unknown) => {
        cached.promise = null;
        console.error("[db] Failed to connect to MongoDB", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: unknown) {
    console.error("[db] Unable to establish MongoDB connection", error);
    throw error;
  }
}
