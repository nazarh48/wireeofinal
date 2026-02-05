import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import { apiService, getImageUrl } from "../../services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function CategoryForm({ initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [color, setColor] = useState(initial?.color ?? "from-blue-500 to-blue-600");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const t = name.trim();
    if (!t) {
      setError("Name is required.");
      return;
    }
    onSubmit(
      {
        name: t,
        slug: slug.trim() || undefined,
        description: description.trim(),
        subtitle: subtitle.trim(),
        icon: icon.trim(),
        image: image.trim(),
        color: color.trim(),
        order: Number(order) || 0,
        status,
      },
      imageFile
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Category name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="url-slug"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji/text)</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Color (Tailwind)</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="from-blue-500 to-blue-600"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (optional)</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="https://... or leave empty and upload below"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Or upload image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
        {initial?.image && !imageFile && (
          <p className="mt-1 text-xs text-slate-500">Current: {initial.image}</p>
        )}
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : initial ? "Update" : "Create"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiService.categories.list({});
      setCategories(res?.categories || []);
    } catch (e) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const buildCategoryFormData = (payload, imageFile) => {
    const fd = new FormData();
    const name = (payload?.name != null ? String(payload.name) : "").trim();
    fd.append("name", name);
    if (payload?.slug) fd.append("slug", String(payload.slug).trim());
    if (payload?.description != null) fd.append("description", String(payload.description).trim());
    if (payload?.subtitle != null) fd.append("subtitle", String(payload.subtitle).trim());
    if (payload?.icon != null) fd.append("icon", String(payload.icon).trim());
    if (payload?.image && !imageFile) fd.append("image", String(payload.image).trim());
    if (payload?.color) fd.append("color", String(payload.color).trim());
    fd.append("order", String(payload?.order ?? 0));
    fd.append("status", payload?.status || "active");
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const handleCreate = async (payload, imageFile) => {
    setSubmitLoading(true);
    setError("");
    try {
      if (imageFile) {
        const fd = buildCategoryFormData(payload, imageFile);
        await apiService.categories.create(fd, {});
      } else {
        await apiService.categories.create(payload);
      }
      await fetchCategories();
      setShowCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create category");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (payload, imageFile) => {
    if (!editing) return;
    setSubmitLoading(true);
    setError("");
    try {
      if (imageFile) {
        const fd = buildCategoryFormData(payload, imageFile);
        await apiService.categories.update(editing._id, fd, {});
      } else {
        await apiService.categories.update(editing._id, payload);
      }
      await fetchCategories();
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update category");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    setSubmitLoading(true);
    setError("");
    try {
      await apiService.categories.remove(cat._id);
      await fetchCategories();
      setDeleting(null);
    } catch (e) {
      setError(e?.message || "Failed to delete category");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Categories</h1>
          <p className="text-slate-600 mt-1">Manage categories shown on the Products page</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <IconPlus className="w-5 h-5" />
          Add category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No categories yet.</p>
            <button onClick={() => setShowCreate(true)} className="text-emerald-600 hover:text-emerald-700 font-medium">
              Create your first category
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {categories.map((c) => (
              <li key={c._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                <div className="flex items-center gap-4 min-w-0">
                  {c.image ? (
                    <img
                      src={getImageUrl(c.image)}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 text-xs">No img</div>
                  )}
                  <div>
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.description || "—"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${c.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {c.status}
                  </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(c)} className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" aria-label="Edit">
                    <IconPencil />
                  </button>
                  <button onClick={() => setDeleting(c)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" aria-label="Delete">
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create category</h2>
        <CategoryForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={submitLoading} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit category</h2>
        <CategoryForm initial={editing ?? undefined} onSubmit={handleUpdate} onCancel={() => setEditing(null)} loading={submitLoading} />
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)}>
        {deleting && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delete category</h2>
            <p className="text-slate-700 mb-4">Delete &quot;{deleting.name}&quot;?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleting)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Delete</button>
              <button onClick={() => setDeleting(null)} className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
