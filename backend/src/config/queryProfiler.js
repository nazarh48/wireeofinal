import mongoose from "mongoose";

const SLOW_QUERY_MS = Number(process.env.SLOW_QUERY_MS || 200);

function attachSlowQueryLogging(schema) {
  const ops = [
    "count",
    "countDocuments",
    "find",
    "findOne",
    "findOneAndUpdate",
    "findOneAndDelete",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
    "aggregate",
  ];

  ops.forEach((op) => {
    schema.pre(op, function () {
      this.__perfStartHr = process.hrtime.bigint();
    });

    schema.post(op, function () {
      if (!this.__perfStartHr) return;
      const elapsedMs = Number(process.hrtime.bigint() - this.__perfStartHr) / 1e6;
      if (elapsedMs < SLOW_QUERY_MS) return;

      const modelName = this.model?.modelName || this.constructor?.modelName || "UnknownModel";
      const base = {
        type: "db",
        model: modelName,
        op,
        durationMs: Number(elapsedMs.toFixed(1)),
      };

      try {
        if (op === "aggregate" && typeof this.pipeline === "function") {
          // eslint-disable-next-line no-console
          console.warn("[PERF][db]", {
            ...base,
            pipeline: this.pipeline(),
          });
        } else {
          const query = typeof this.getQuery === "function" ? this.getQuery() : undefined;
          const options = typeof this.getOptions === "function" ? this.getOptions() : undefined;
          // eslint-disable-next-line no-console
          console.warn("[PERF][db]", {
            ...base,
            query,
            options,
          });
        }
      } catch {
        // Guard against any unexpected serialization issues
        // eslint-disable-next-line no-console
        console.warn("[PERF][db]", base);
      }
    });
  });
}

mongoose.plugin(attachSlowQueryLogging);

