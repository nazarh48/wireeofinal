import mongoose from "mongoose";
import { config } from "./index.js";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoose.uri);
    console.log("MongoDB connected:", config.mongoose.uri);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});
