import { useState, useEffect, useRef } from "react";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import { apiService, getImageUrl } from "../../services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/* ─── Image upload with live preview ─────────────────────────── */
function ImageUploadSection({ initial, imageFile, setImageFile, removeImage, setRemoveImage }) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (!removeImage && initial?.image) {
      setPreviewUrl(getImageUrl(initial.image));
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile, removeImage, initial]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setRemoveImage(false);
  };

  const handleRemove = () => {
    setImageFile(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">Image</label>

      {previewUrl ? (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 group">
          <img src={previewUrl} alt="Category preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-800 rounded-lg text-sm font-medium hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-36 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-700 transition-colors">Click to upload image</span>
          <span className="text-xs text-slate-400">PNG, JPG, WEBP up to 10MB</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}

/* ─── Category form ───────────────────────────────────────────── */
function CategoryForm({ initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const t = name.trim();
    if (!t) { setError("Name is required."); return; }

    // Always use FormData so multipart fields (including link) are sent correctly
    const fd = new FormData();
    fd.append("name", t);
    fd.append("description", description.trim());
    fd.append("subtitle", subtitle.trim());
    fd.append("link", link.trim());
    fd.append("order", String(Number(order) || 0));
    fd.append("status", status);

    if (removeImage) {
      fd.append("removeImage", "true");
      fd.append("image", "");
    } else if (imageFile) {
      fd.append("image", imageFile);
    }

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>}

      {/* Name */}
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

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="Short subtitle shown on the card"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="Brief description shown on the card"
        />
      </div>

      {/* Link URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Link URL
          <span className="ml-2 text-xs font-normal text-slate-400">— redirect when clicked on Home page</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </span>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="https://example.com  or  /products"
          />
        </div>
      </div>

      {/* Image upload */}
      <ImageUploadSection
        initial={initial}
        imageFile={imageFile}
        setImageFile={setImageFile}
        removeImage={removeImage}
        setRemoveImage={setRemoveImage}
      />

      {/* Order + Status */}
      <div className="flex gap-4">
        <div className="w-28">
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */
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

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (fd) => {
    setSubmitLoading(true);
    setError("");
    try {
      await apiService.categories.create(fd, {});
      await fetchCategories();
      setShowCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create category");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (fd) => {
    if (!editing) return;
    setSubmitLoading(true);
    setError("");
    try {
      await apiService.categories.update(editing._id, fd, {});
      await fetchCategories();
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update category");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (cat) => {
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
      {error && <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Categories</h1>
          <p className="text-slate-600 mt-1">Manage categories shown on the Home page. Each category can redirect to a custom link.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
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
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-sm text-slate-500 truncate">{c.description || c.subtitle || "—"}</p>
                    {c.link && (
                      <p className="text-xs text-emerald-600 truncate flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {c.link}
                      </p>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${c.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create category</h2>
        <CategoryForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={submitLoading} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit category</h2>
        <CategoryForm initial={editing ?? undefined} onSubmit={handleUpdate} onCancel={() => setEditing(null)} loading={submitLoading} />
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleting} onClose={() => !submitLoading && setDeleting(null)}>
        {deleting && (
          <div className="text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-5">
              <IconTrash className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete category</h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-medium text-slate-800">&quot;{deleting.name}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setDeleting(null)}
                disabled={submitLoading}
                className="px-5 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                disabled={submitLoading}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
