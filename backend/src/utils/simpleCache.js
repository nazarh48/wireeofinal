const store = new Map();

export function getFromCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setInCache(key, value, ttlMs) {
  if (!ttlMs || ttlMs <= 0) return;
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidatePrefix(prefix) {
  if (!prefix) return;
  for (const key of store.keys()) {
    if (typeof key === "string" && key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

