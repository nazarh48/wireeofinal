import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/Modal";
import { apiService, getImageUrl } from "../../services/api";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";

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
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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
      setError("Please upload an icon image.");
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
              const f = e.target.files?.[0] || null;
              if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : (initial?.file_path ? getImageUrl(initial.file_path) : ""));
            }}
          />
        </label>
        {preview && (
          <div className="mt-3 flex items-start gap-2">
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
              <img src={preview} alt="" className="w-full h-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => {
                if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
                setFile(null);
                setPreview(initial?.file_path ? getImageUrl(initial.file_path) : "");
              }}
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

