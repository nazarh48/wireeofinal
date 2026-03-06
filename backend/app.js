import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import "./src/config/queryProfiler.js";
import { config } from "./src/config/index.js";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { NewsletterSubscriber } from "./src/models/NewsletterSubscriber.js";
import { authenticateAdmin } from "./src/middleware/auth.js";
import * as newsletterController from "./src/controllers/newsletterController.js";
import { requestTiming } from "./src/middleware/requestTiming.js";

const app = express();

app.set("etag", "strong");

app.use(requestTiming);

app.use(
  compression({
    threshold: 1024,
  }),
);

app.use(cors({ origin: config.cors.origin, credentials: true }));
// Keep a generous body limit for complex canvas payloads.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Newsletter API – mounted first so /api/newsletter/* always works (avoids 404)
const newsletterRouter = express.Router();
newsletterRouter.get("/health", (req, res) => {
  res.json({ ok: true, service: "newsletter" });
});
newsletterRouter.post("/subscribe", async (req, res) => {
  try {
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : "";
    const source = req.body?.source ? String(req.body.source).trim() : "resources";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email required" });
    }
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: "Already subscribed" });
    }
    await NewsletterSubscriber.create({ email, source });
    return res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ success: true, message: "Already subscribed" });
    }
    return res.status(500).json({ success: false, message: err.message || "Subscription failed" });
  }
});
newsletterRouter.get("/subscribers", authenticateAdmin, newsletterController.list);
app.use("/api/newsletter", newsletterRouter);

app.get("/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Serve uploaded files at /uploads (local) and under /api/uploads (deployed behind proxy that only forwards /api)
const uploadsPath = path.join(process.cwd(), "uploads");
const uploadsStaticOptions = {
  maxAge: "30d",
  immutable: true,
};
app.use("/uploads", express.static(uploadsPath, uploadsStaticOptions));
app.use("/api/uploads", express.static(uploadsPath, uploadsStaticOptions));

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

export default app;
