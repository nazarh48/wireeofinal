import dotenv from "dotenv";

dotenv.config();

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
};
