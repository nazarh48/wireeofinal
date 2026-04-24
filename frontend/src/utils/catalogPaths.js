import { slugifyValue } from "./slugify";

export function getRangeIdentifier(range) {
  if (!range) return "";
  return range.slug || slugifyValue(range.name, range.id || "");
}

export function getProductIdentifier(product) {
  if (!product) return "";
  return product.slug || slugifyValue(product.name, product.id || "");
}

export function getPublicRangesPath() {
  return "/products/ranges";
}

export function getPublicRangePath(range) {
  const identifier = getRangeIdentifier(range);
  return identifier ? `/products/ranges/${encodeURIComponent(identifier)}` : getPublicRangesPath();
}

export function getPublicProductPath(product) {
  const identifier = getProductIdentifier(product);
  return identifier ? `/products/${encodeURIComponent(identifier)}` : "/products";
}

export function getConfiguratorHubPath(params = { tab: "selection" }) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `/products/ranges?${query}` : "/products/ranges";
}
