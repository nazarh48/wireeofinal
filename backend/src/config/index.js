import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from backend root (parent of src/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoose: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/wireeo",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "wireeo-jwt-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : ["http://localhost:5173", "http://localhost:3000"],
  },
  app: {
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
  email: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT || "587",
    secure: process.env.MAIL_SECURE === "true",
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
  },
};
