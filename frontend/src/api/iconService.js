import { apiService } from "../services/api";

export async function fetchIconCategories({ activeOnly = true } = {}) {
  const res = await apiService.iconCategories.list(
    activeOnly ? { is_active: true } : undefined
  );
  const categories = Array.isArray(res?.categories) ? res.categories : [];
  return categories;
}

export async function fetchIconsByCategoryId(
  categoryId,
  { activeOnly = true } = {}
) {
  const params = {
    category_id: categoryId,
    ...(activeOnly ? { is_active: true } : {}),
  };
  const res = await apiService.icons.list(params);
  const icons = Array.isArray(res?.icons) ? res.icons : [];
  return icons;
}

export async function fetchAllIcons({ activeOnly = true } = {}) {
  const params = activeOnly ? { is_active: true } : {};
  const res = await apiService.icons.list(params);
  const icons = Array.isArray(res?.icons) ? res.icons : [];
  return icons;
}

