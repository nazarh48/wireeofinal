import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/Modal";
import { apiService, getImageUrl } from "../../services/api";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";

const PRESET_ICON_LIBRARY = [
  {
    id: "warning-triangle",
    name: "Warning triangle",
    tags: ["safety", "warning", "general"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.7 19.2a1.2 1.2 0 0 0 1.04 1.8h16.52a1.2 1.2 0 0 0 1.04-1.8L12 3Z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>',
  },
  {
    id: "high-voltage",
    name: "High voltage",
    tags: ["electrical", "power", "warning"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111827"><path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z"/></svg>',
  },
  {
    id: "light-bulb",
    name: "Light bulb",
    tags: ["electrical", "lighting", "general"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.2 14.6A6.5 6.5 0 1 1 15.8 14.6c-.8.72-1.3 1.72-1.4 2.8h-4.8c-.1-1.08-.6-2.08-1.4-2.8Z"/></svg>',
  },
  {
    id: "plug",
    name: "Power plug",
    tags: ["electrical", "power", "connector"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7V3"/><path d="M15 7V3"/><path d="M8 7h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V7Z"/><path d="M12 14v7"/><path d="M10 21h4"/></svg>',
  },
  {
    id: "shield-check",
    name: "Shield check",
    tags: ["security", "safety", "general"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z"/><path d="m9.5 12.5 1.8 1.8 3.7-4"/></svg>',
  },
  {
    id: "camera-cctv",
    name: "CCTV camera",
    tags: ["security", "camera", "monitoring"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-4 6 3-9 4-6-3Z"/><path d="M9 13v3"/><path d="M14 11l4 8"/><path d="M18 19h3"/><path d="M6 14h5"/></svg>',
  },
  {
    id: "fire",
    name: "Fire",
    tags: ["fire", "safety", "emergency"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111827"><path d="M12.1 2.6c.4 2.2-.5 3.8-1.7 5.2-1.1 1.2-2.3 2.4-2.3 4.2 0 1.7 1.2 3.2 2.9 3.5-.6-.7-.9-1.5-.9-2.4 0-2.2 1.7-3.4 3-4.7 1-1 1.9-2.2 1.7-4.1 2.5 1.9 4.2 4.9 4.2 8.1 0 4-3.1 7.1-7 7.1S5 16.4 5 12.5c0-3.9 2.8-7.5 7.1-9.9Z"/></svg>',
  },
  {
    id: "wifi",
    name: "Wi-Fi",
    tags: ["network", "communication", "general"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9a11 11 0 0 1 14 0"/><path d="M8.5 12.5a6 6 0 0 1 7 0"/><path d="M12 18h.01"/></svg>',
  },
  {
    id: "arrow-right",
    name: "Arrow right",
    tags: ["arrows", "direction", "general"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  },
  {
    id: "location-pin",
    name: "Location pin",
    tags: ["map", "general", "location"],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>',
  },
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getPresetPreviewUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function sanitizeFilename(value) {
  return String(value || "icon")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "icon";
}

function createPresetFile(preset) {
  return new File([preset.svg], `${sanitizeFilename(preset.name)}.svg`, {
    type: "image/svg+xml",
  });
}

function getPresetIconsForCategory(categoryName) {
  const normalizedCategory = normalizeText(categoryName);
  if (!normalizedCategory) return PRESET_ICON_LIBRARY.slice(0, 8);

  const matching = PRESET_ICON_LIBRARY.filter((preset) =>
    preset.tags.some(
      (tag) =>
        normalizedCategory.includes(tag) ||
        tag.includes(normalizedCategory)
    )
  );

  if (matching.length >= 6) return matching;

  const fallback = PRESET_ICON_LIBRARY.filter(
    (preset) => !matching.some((item) => item.id === preset.id)
  );

  return [...matching, ...fallback].slice(0, 8);
}

function coerceId(x) {
  return x?.id || x?._id || x;
}

function CategoryForm({ initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(
    initial?.is_active !== undefined ? !!initial.is_active : true
  );
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const n = name.trim();
    if (!n) {
      setError("Name is required.");
      return;
    }
    onSubmit({
      name: n,
      order: Number(order) || 0,
      is_active: !!isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Category name *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder="e.g. Safety"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Order
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
          />
          <span className="text-sm font-medium text-slate-700">Active</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function IconForm({ categories, initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    initial?.category_id ? String(initial.category_id) : String(coerceId(categories[0]) || "")
  );
  const [isActive, setIsActive] = useState(
    initial?.is_active !== undefined ? !!initial.is_active : true
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    initial?.file_path ? getImageUrl(initial.file_path) : ""
  );
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [error, setError] = useState("");

  const activeCategory = useMemo(
    () => categories.find((category) => String(coerceId(category)) === String(categoryId)),
    [categories, categoryId]
  );

  const presetIcons = useMemo(
    () => getPresetIconsForCategory(activeCategory?.name),
    [activeCategory?.name]
  );

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!selectedPresetId) return;
    setSelectedPresetId("");
    setFile(null);
    resetPreview(initial?.file_path ? getImageUrl(initial.file_path) : "");
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetPreview = (nextValue) => {
    if (preview && preview.startsWith("blob:") && preview !== nextValue) {
      URL.revokeObjectURL(preview);
    }
    setPreview(nextValue);
  };

  const handleFileChange = (nextFile) => {
    setSelectedPresetId("");
    setFile(nextFile);
    resetPreview(nextFile ? URL.createObjectURL(nextFile) : (initial?.file_path ? getImageUrl(initial.file_path) : ""));
  };

  const handlePresetSelect = (preset) => {
    setSelectedPresetId(preset.id);
    setFile(createPresetFile(preset));
    resetPreview(getPresetPreviewUrl(preset.svg));
    if (!name.trim() || !initial) {
      setName(preset.name);
    }
  };

  const handleRemoveSelection = () => {
    setSelectedPresetId("");
    setFile(null);
    resetPreview(initial?.file_path ? getImageUrl(initial.file_path) : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const n = name.trim();
    if (!n) {
      setError("Name is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }
    // For create: file is required. For update: file optional.
    if (!initial && !file) {
      setError("Please upload an icon image or select a related icon.");
      return;
    }
    onSubmit({
      name: n,
      category_id: categoryId,
      is_active: !!isActive,
      file: file || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Icon name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g. Warning sign"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            {categories.map((c) => {
              const id = coerceId(c);
              return (
                <option key={id} value={id}>
                  {c.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
        />
        <span className="text-sm font-medium text-slate-700">Active</span>
      </label>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Icon file {initial ? "(optional)" : "*"}
        </label>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
          <span className="text-sm text-slate-500 mt-1">Click to upload icon image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFileChange(e.target.files?.[0] || null);
            }}
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">
          You can upload your own file or pick one of the related icons below.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Related icons {activeCategory?.name ? `for ${activeCategory.name}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                Selecting one will save it into the editor icon library just like an uploaded file.
              </p>
            </div>
            {selectedPresetId && (
              <button
                type="button"
                onClick={handleRemoveSelection}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {presetIcons.map((preset) => {
              const presetPreview = getPresetPreviewUrl(preset.svg);
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-teal-500 bg-white ring-2 ring-teal-200"
                      : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40"
                  }`}
                >
                  <div className="h-16 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <img src={presetPreview} alt={preset.name} className="w-9 h-9 object-contain" />
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-700 truncate">{preset.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {preview && (
          <div className="mt-3 flex items-start gap-2">
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
              <img src={preview} alt="" className="w-full h-full object-contain" />
            </div>
            <button
              type="button"
              onClick={handleRemoveSelection}
              className="mt-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function IconLibraryManagement() {
  const [tab, setTab] = useState("categories"); // categories | icons
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [icons, setIcons] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("");

  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);

  const [showCreateIcon, setShowCreateIcon] = useState(false);
  const [editIcon, setEditIcon] = useState(null);
  const [deleteIcon, setDeleteIcon] = useState(null);

  const activeCategoriesSorted = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories]);

  const fetchCategories = async () => {
    const res = await apiService.iconCategories.list();
    const list = Array.isArray(res?.categories) ? res.categories : [];
    setCategories(list);
    if (!activeCategoryId) {
      const first = list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
      const id = first ? coerceId(first) : "";
      setActiveCategoryId(id ? String(id) : "");
    }
    return list;
  };

  const fetchIcons = async (categoryId) => {
    if (!categoryId) {
      setIcons([]);
      return [];
    }
    const res = await apiService.icons.list({ category_id: categoryId });
    const list = Array.isArray(res?.icons) ? res.icons : [];
    setIcons(list);
    return list;
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchCategories()
      .catch((e) => setError(e?.message || "Failed to load icon categories"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab !== "icons") return;
    setLoading(true);
    setError("");
    fetchIcons(activeCategoryId)
      .catch((e) => setError(e?.message || "Failed to load icons"))
      .finally(() => setLoading(false));
  }, [tab, activeCategoryId]);

  const handleCreateCategory = async (payload) => {
    setLoading(true);
    setError("");
    try {
      await apiService.iconCategories.create(payload);
      setShowCreateCategory(false);
      await fetchCategories();
    } catch (e) {
      setError(e?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (payload) => {
    if (!editCategory) return;
    setLoading(true);
    setError("");
    try {
      await apiService.iconCategories.update(coerceId(editCategory), payload);
      setEditCategory(null);
      await fetchCategories();
    } catch (e) {
      setError(e?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    setLoading(true);
    setError("");
    try {
      await apiService.iconCategories.remove(coerceId(deleteCategory));
      setDeleteCategory(null);
      const list = await fetchCategories();
      const first = list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
      setActiveCategoryId(first ? String(coerceId(first)) : "");
      setIcons([]);
    } catch (e) {
      setError(e?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIcon = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("category_id", payload.category_id);
      formData.append("is_active", String(!!payload.is_active));
      if (payload.file) formData.append("file", payload.file);
      await apiService.icons.create(formData, {});
      setShowCreateIcon(false);
      await fetchIcons(activeCategoryId);
    } catch (e) {
      setError(e?.message || "Failed to create icon");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIcon = async (payload) => {
    if (!editIcon) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (payload.name != null) formData.append("name", payload.name);
      if (payload.category_id != null) formData.append("category_id", payload.category_id);
      if (payload.is_active != null) formData.append("is_active", String(!!payload.is_active));
      if (payload.file) formData.append("file", payload.file);
      await apiService.icons.update(coerceId(editIcon), formData, {});
      setEditIcon(null);
      await fetchIcons(activeCategoryId);
    } catch (e) {
      setError(e?.message || "Failed to update icon");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIcon = async () => {
    if (!deleteIcon) return;
    setLoading(true);
    setError("");
    try {
      await apiService.icons.remove(coerceId(deleteIcon));
      setDeleteIcon(null);
      await fetchIcons(activeCategoryId);
    } catch (e) {
      setError(e?.message || "Failed to delete icon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Icon Library</h1>
          <p className="text-slate-600 mt-1">Manage icon categories and upload icons for the configurator.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 p-3">
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "categories" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => setTab("icons")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "icons" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Icons
          </button>

          <div className="flex-1" />

          {tab === "categories" ? (
            <button
              onClick={() => setShowCreateCategory(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              <IconPlus className="w-5 h-5" />
              Add category
            </button>
          ) : (
            <button
              onClick={() => setShowCreateIcon(true)}
              disabled={!activeCategoriesSorted.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              <IconPlus className="w-5 h-5" />
              Add icon
            </button>
          )}
        </div>

        {tab === "categories" ? (
          <div className="p-4">
            {loading && categories.length === 0 ? (
              <div className="text-slate-500 text-sm">Loading…</div>
            ) : activeCategoriesSorted.length === 0 ? (
              <div className="text-slate-500 text-sm">No icon categories yet.</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {activeCategoriesSorted.map((c) => (
                  <li key={coerceId(c)} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${c.is_active ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs text-slate-500">Order: {c.order ?? 0}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">ID: {String(coerceId(c))}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditCategory(c)}
                        className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                        aria-label="Edit"
                      >
                        <IconPencil />
                      </button>
                      <button
                        onClick={() => setDeleteCategory(c)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Delete"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-sm font-semibold text-slate-700">Category</div>
              <select
                value={activeCategoryId}
                onChange={(e) => setActiveCategoryId(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {activeCategoriesSorted.map((c) => (
                  <option key={coerceId(c)} value={String(coerceId(c))}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {loading && icons.length === 0 ? (
              <div className="text-slate-500 text-sm">Loading…</div>
            ) : icons.length === 0 ? (
              <div className="text-slate-500 text-sm">No icons in this category.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {icons.map((ic) => (
                  <div
                    key={coerceId(ic)}
                    className="border border-slate-200 rounded-xl p-3 bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-square rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
                      <img
                        src={getImageUrl(ic.file_path)}
                        alt={ic.name || ""}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{ic.name}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${ic.is_active ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                          {ic.is_active ? "Active" : "Inactive"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditIcon(ic)}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                            aria-label="Edit icon"
                          >
                            <IconPencil />
                          </button>
                          <button
                            onClick={() => setDeleteIcon(ic)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            aria-label="Delete icon"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category modals */}
      <Modal open={showCreateCategory} onClose={() => setShowCreateCategory(false)} size="xl" scrollable>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Create icon category</h2>
        <p className="text-sm text-slate-500 mb-5">Categories power the configurator sidebar tabs.</p>
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCreateCategory(false)}
          loading={loading}
        />
      </Modal>

      <Modal open={!!editCategory} onClose={() => setEditCategory(null)} size="xl" scrollable>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Edit icon category</h2>
        <p className="text-sm text-slate-500 mb-5">{editCategory?.name}</p>
        {editCategory && (
          <CategoryForm
            initial={editCategory}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditCategory(null)}
            loading={loading}
          />
        )}
      </Modal>

      <Modal open={!!deleteCategory} onClose={() => !loading && setDeleteCategory(null)}>
        {deleteCategory && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delete category</h2>
            <p className="text-slate-700 mb-4">Delete &quot;{deleteCategory.name}&quot;? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCategory}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteCategory(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Icon modals */}
      <Modal open={showCreateIcon} onClose={() => setShowCreateIcon(false)} size="xl" scrollable>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Upload icon</h2>
        <p className="text-sm text-slate-500 mb-5">Upload an icon for the configurator (PNG/SVG-as-image).</p>
        <IconForm
          categories={activeCategoriesSorted}
          onSubmit={handleCreateIcon}
          onCancel={() => setShowCreateIcon(false)}
          loading={loading}
        />
      </Modal>

      <Modal open={!!editIcon} onClose={() => setEditIcon(null)} size="xl" scrollable>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Edit icon</h2>
        <p className="text-sm text-slate-500 mb-5">{editIcon?.name}</p>
        {editIcon && (
          <IconForm
            categories={activeCategoriesSorted}
            initial={editIcon}
            onSubmit={handleUpdateIcon}
            onCancel={() => setEditIcon(null)}
            loading={loading}
          />
        )}
      </Modal>

      <Modal open={!!deleteIcon} onClose={() => !loading && setDeleteIcon(null)}>
        {deleteIcon && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delete icon</h2>
            <p className="text-slate-700 mb-4">Delete &quot;{deleteIcon.name}&quot;? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteIcon}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteIcon(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

