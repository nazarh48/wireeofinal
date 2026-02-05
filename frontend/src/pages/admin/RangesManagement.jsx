import { useState, useEffect } from "react";
import { useCatalogStore } from "../../store/catalogStore";
import { useAdminStore } from "../../store/adminStore";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import { getImageUrl } from "../../services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function RangeForm({ initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const t = name.trim();
    if (!t) {
      setError("Name is required.");
      return;
    }
    onSubmit({ name: t, description: description.trim(), status }, imageFile || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Range name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Short description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700"
        />
        {initial?.image && !imageFile && (
          <p className="text-xs text-slate-500 mt-1">Current image is set. Choose a new file to replace.</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function RangesManagement() {
  const ranges = useCatalogStore((s) => s.adminRanges);
  const products = useCatalogStore((s) => s.adminProducts);
  const loadAdminCatalog = useCatalogStore((s) => s.loadAdminCatalog);
  const createRange = useCatalogStore((s) => s.createRange);
  const updateRange = useCatalogStore((s) => s.updateRange);
  const deleteRange = useCatalogStore((s) => s.deleteRange);
  const logActivity = useAdminStore((s) => s.logActivity);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminCatalog();
  }, [loadAdminCatalog]);

  const productCountByRange = ranges.reduce((acc, r) => {
    acc[r.id] = products.filter((p) => p.rangeId === r.id).length;
    return acc;
  }, {});

  const handleCreate = async (payload, imageFile) => {
    setLoading(true);
    setError("");
    try {
      const r = await createRange(payload, imageFile);
      if (r) logActivity({ type: "range_created", label: `Range "${r.name}" created`, meta: { id: r.id } });
      setShowCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create range");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload, imageFile) => {
    if (!editing) return;
    setLoading(true);
    setError("");
    try {
      await updateRange(editing.id, payload, imageFile);
      logActivity({ type: "range_updated", label: `Range "${payload.name}" updated`, meta: { id: editing.id } });
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update range");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (range) => {
    if (!window.confirm(`Delete range "${range.name}"? This will also remove ${productCountByRange[range.id] ?? 0} product(s).`)) return;
    setLoading(true);
    setError("");
    try {
      await deleteRange(range.id);
      logActivity({ type: "range_deleted", label: `Range "${range.name}" deleted`, meta: { id: range.id } });
      setDeleting(null);
    } catch (e) {
      setError(e?.message || "Failed to delete range");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ranges Management</h1>
          <p className="text-slate-600 mt-1">Create, edit, and delete product ranges</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <IconPlus className="w-5 h-5" />
          Add range
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {ranges.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No ranges yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Create your first range
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {ranges.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  {r.image ? (
                    <img
                      src={getImageUrl(r.image)}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-xs">No img</div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{r.name}</p>
                  <p className="text-sm text-slate-500">{r.description || "—"}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${r.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {productCountByRange[r.id] ?? 0} product(s)
                    </span>
                  </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(r)}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    aria-label="Edit"
                  >
                    <IconPencil />
                  </button>
                  <button
                    onClick={() => setDeleting(r)}
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create range</h2>
        <RangeForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={loading} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit range</h2>
        <RangeForm
          initial={editing ?? undefined}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
          loading={loading}
        />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)}>
        {deleting && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delete range</h2>
            <p className="text-slate-700 mb-4">
              Delete &quot;{deleting.name}&quot;? This will also remove {productCountByRange[deleting.id] ?? 0} product(s).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleting)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleting(null)}
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
