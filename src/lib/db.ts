import { MongoClient, type Db } from "mongodb";
import type { DbFailure } from "./types";

const DB_NAME = process.env.MONGODB_DB || "srimurugan";

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

function uri() {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error("MONGODB_URI is not set.");
  }
  return value;
}

export async function getDb(): Promise<Db> {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri(), {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    globalForMongo._mongoClientPromise = client.connect().catch((error) => {
      globalForMongo._mongoClientPromise = undefined;
      throw error;
    });
  }
  const client = await globalForMongo._mongoClientPromise;
  return client.db(DB_NAME);
}

let schemaReady: Promise<void> | null = null;

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = await getDb();
      const entries = db.collection("entries");
      await entries.createIndex({ txnDate: -1, _id: -1 });
      await entries.createIndex({ kind: 1 });
      await entries.createIndex({ customerName: 1 });
      await db.collection<{ _id: string; openingBalance: number; updatedAt: Date }>("settings").updateOne(
        { _id: "opening" },
        { $setOnInsert: { openingBalance: 0, updatedAt: new Date() } },
        { upsert: true },
      );
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export function dbFailure(error: unknown): DbFailure {
  const err = error as { code?: number | string; message?: string; name?: string };
  const message = err.message || "";
  if (!process.env.MONGODB_URI || message.includes("MONGODB_URI is not set")) {
    return {
      message:
        "MongoDB is not configured. Set MONGODB_URI for the srimurugan database before opening the books.",
    };
  }
  if (message.includes("not allowed") || message.includes("not authorized")) {
    return {
      message:
        "MongoDB signed in, but this user cannot read or write the srimurugan database. In Atlas, open Database Access, edit the srimurugan user, and grant readWrite on srimurugan.",
    };
  }
  if (
    message.includes("bad auth") ||
    message.includes("Authentication failed") ||
    err.code === 18
  ) {
    return {
      message:
        "MongoDB refused the login. Check the username and password in MONGODB_URI.",
    };
  }
  if (
    err.name === "MongoServerSelectionError" ||
    message.includes("ENOTFOUND") ||
    message.includes("querySrv") ||
    message.includes("timed out")
  ) {
    return {
      message:
        "Could not reach the MongoDB cluster. Confirm the connection string and that Atlas allows access from 0.0.0.0/0 so Vercel can connect.",
    };
  }
  return {
    message: "The books could not be opened. Check the MongoDB connection and try again.",
  };
}

export async function loadOrFail<T>(load: () => Promise<T>) {
  try {
    const data = await load();
    return { data, failure: null as DbFailure | null };
  } catch (error) {
    return { data: null as T | null, failure: dbFailure(error) };
  }
}
