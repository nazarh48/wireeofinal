export function slugify(value, fallback = "item") {
  const raw = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const slug = raw
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || fallback;
}

export async function createUniqueSlug(
  Model,
  sourceValue,
  {
    excludeId = null,
    field = "slug",
    fallback = "item",
    extraFilter = {},
  } = {},
) {
  const baseSlug = slugify(sourceValue, fallback);

  let suffix = 0;
  while (suffix < 1000) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const existing = await Model.findOne({
      ...extraFilter,
      [field]: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select("_id")
      .lean();

    if (!existing) return candidate;
    suffix += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}
