import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

let cached: {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
} = (global as any)._mongo || { client: null, promise: null };

if (!cached.promise) {
  const client = new MongoClient(uri);
  cached.promise = client.connect().then((c) => {
    cached.client = c;
    return c;
  });
  (global as any)._mongo = cached;
}

export default cached.promise as Promise<MongoClient>;
