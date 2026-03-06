const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS || 500);

export function requestTiming(req, res, next) {
  const startHr = process.hrtime.bigint();
  const startTime = Date.now();

  const done = () => {
    const durationMs = Number(process.hrtime.bigint() - startHr) / 1e6;
    const level = durationMs >= SLOW_REQUEST_MS ? "warn" : "info";
    const logPayload = {
      type: "http",
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(1)),
      contentLength: Number(res.getHeader("Content-Length") || 0) || undefined,
      timestamp: new Date(startTime).toISOString(),
    };
    // eslint-disable-next-line no-console
    console[level]("[PERF][http]", logPayload);
  };

  res.once("finish", done);
  res.once("close", done);

  next();
}

