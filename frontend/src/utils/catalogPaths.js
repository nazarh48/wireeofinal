import { slugifyValue } from "./slugify";

export function getRangeIdentifier(range) {
  if (!range) return "";
  return range.id || range.slug || slugifyValue(range.name, "");
}

export function getProductIdentifier(product) {
  if (!product) return "";
  return product.id || product.slug || slugifyValue(product.name, "");
}

export function getPublicRangesPath() {
  return "/products/ranges";
}

export function getPublicRangePath(range) {
  const identifier = getRangeIdentifier(range);
  if (!identifier) return getPublicRangesPath();
  return range?.id
    ? `/products/range/${encodeURIComponent(identifier)}`
    : `/products/ranges/${encodeURIComponent(identifier)}`;
}

export function getPublicProductPath(product) {
  const identifier = getProductIdentifier(product);
  if (!identifier) return "/products";
  return product?.id
    ? `/products/detail/${encodeURIComponent(identifier)}`
    : `/products/${encodeURIComponent(identifier)}`;
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
