import mongoose from "mongoose";
import { config } from "../config/index.js";
import { User } from "../models/User.js";

async function seed() {
  await mongoose.connect(config.mongoose.uri);
  const exists = await User.findOne({ email: "admin@wireeo.com" });
  if (exists) {
    console.log("Admin user already exists");
    await mongoose.disconnect();
    return;
  }
  await User.create({
    name: "Admin",
    email: "admin@wireeo.com",
    password: "admin123",
    role: "admin",
    status: "active",
  });
  console.log("Created admin user: admin@wireeo.com / admin123");
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
