import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.js";
import { Range } from "../models/Range.js";
import { Project } from "../models/Project.js";

async function logExplain(label, cursor) {
  try {
    const explained = await cursor.explain("executionStats");
    // eslint-disable-next-line no-console
    console.log(`\n[PERF][db-explain] ${label}`);
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          queryPlanner: explained.queryPlanner,
          executionStats: explained.executionStats,
        },
        null,
        2,
      ),
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[PERF][db-explain] Failed for ${label}:`, err?.message || err);
  }
}

async function main() {
  await connectDB();

  await logExplain(
    "Product list (normal, active, newest first)",
    Product.find({ productType: "normal", status: "active" }).sort({
      createdAt: -1,
    }),
  );

  await logExplain(
    "Range list (status=active, newest first)",
    Range.find({ status: "active" }).sort({ createdAt: -1 }),
  );

  const perfUserId = process.env.PERF_USER_ID;
  if (perfUserId && mongoose.Types.ObjectId.isValid(perfUserId)) {
    await logExplain(
      "Project list for PERF_USER_ID (createdBy, newest first)",
      Project.find({ createdBy: perfUserId }).sort({ createdAt: -1 }),
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(
      "\n[PERF][db-explain] Skipping Project query; set PERF_USER_ID to a valid ObjectId to include it.",
    );
  }

  await mongoose.connection.close();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[PERF][db-explain] Script failed:", err?.message || err);
    process.exit(1);
  });

