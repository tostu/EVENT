import { MongoConnection } from "./mongo.ts";
import "$std/dotenv/load.ts";

const MONGO_URI = Deno.env.get("MONGO_URI");
if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined");
}

const mongo = MongoConnection.getInstance();
await mongo.connect({ uri: MONGO_URI });

addEventListener("unload", async () => {
  console.log("🧹 Cleaning up...");
  await mongo.disconnect();
});
