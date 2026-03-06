const hasPerformance = typeof performance !== "undefined" && typeof performance.now === "function";

function nowMs() {
  return hasPerformance ? performance.now() : Date.now();
}

const DEFAULT_LOG_THRESHOLD_MS = 0;
const DEFAULT_SLOW_THRESHOLD_MS = 400;

export function startSpan(name, meta) {
  return {
    name,
    meta,
    start: nowMs(),
  };
}

export function endSpan(span, extra) {
  if (!span) return;
  const durationMs = nowMs() - span.start;
  const logThreshold = DEFAULT_LOG_THRESHOLD_MS;
  const slowThreshold = DEFAULT_SLOW_THRESHOLD_MS;
  if (durationMs < logThreshold) return;

  const payload = {
    name: span.name,
    durationMs: Number(durationMs.toFixed(1)),
    slow: durationMs >= slowThreshold,
    ...span.meta,
    ...extra,
  };

  const level = durationMs >= slowThreshold ? "warn" : "info";
  // eslint-disable-next-line no-console
  console[level]("[PERF][frontend]", payload);
}

export function attachAxiosPerf(instance, label) {
  if (!instance || typeof instance.interceptors !== "object") return;

  instance.interceptors.request.use((config) => {
    // eslint-disable-next-line no-param-reassign
    config.__perfSpan = startSpan("api", {
      client: label,
      method: (config.method || "get").toUpperCase(),
      url: config.url,
    });
    return config;
  });

  const finalize = (responseOrError, isError) => {
    const config = responseOrError?.config || responseOrError?.response?.config;
    if (!config || !config.__perfSpan) return;
    const status = responseOrError?.status || responseOrError?.response?.status;
    endSpan(config.__perfSpan, {
      status,
      error: isError ? true : undefined,
    });
    // eslint-disable-next-line no-param-reassign
    config.__perfSpan = undefined;
  };

  instance.interceptors.response.use(
    (response) => {
      finalize(response, false);
      return response;
    },
    (error) => {
      finalize(error, true);
      return Promise.reject(error);
    },
  );
}

