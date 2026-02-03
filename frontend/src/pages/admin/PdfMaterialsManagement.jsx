import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import { apiService, getImageUrl } from "../../services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function PdfMaterialForm({ initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [photoFile, setPhotoFile] = useState(null);
  const [fileFile, setFileFile] = useState(null);
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
      { name: t, shortDescription: shortDescription.trim(), order: Number(order) || 0, status },
      photoFile,
      fileFile
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
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="PDF material name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Short description</label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700"
        />
        {initial?.photo && !photoFile && (
          <img src={getImageUrl(initial.photo)} alt="" className="mt-2 w-24 h-24 object-cover rounded border" />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">PDF / File</label>
        <input
          type="file"
          onChange={(e) => setFileFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700"
        />
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

export default function PdfMaterialsManagement() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await apiService.pdfMaterials.list({});
      setMaterials(res?.materials || []);
    } catch (e) {
      setError(e?.message || "Failed to load PDF materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const buildFormData = (payload, photoFile, fileFile) => {
    const fd = new FormData();
    fd.append("name", payload.name);
    if (payload.shortDescription) fd.append("shortDescription", payload.shortDescription);
    fd.append("order", String(payload.order ?? 0));
    fd.append("status", payload.status || "active");
    if (photoFile) fd.append("photo", photoFile);
    if (fileFile) fd.append("file", fileFile);
    return fd;
  };

  const handleCreate = async (payload, photoFile, fileFile) => {
    setSubmitLoading(true);
    setError("");
    try {
      const fd = buildFormData(payload, photoFile, fileFile);
      await apiService.pdfMaterials.create(fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchMaterials();
      setShowCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create PDF material");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (payload, photoFile, fileFile) => {
    if (!editing) return;
    setSubmitLoading(true);
    setError("");
    try {
      const fd = buildFormData(payload, photoFile, fileFile);
      await apiService.pdfMaterials.update(editing._id, fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchMaterials();
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update PDF material");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Delete "${m.name}"?`)) return;
    setSubmitLoading(true);
    setError("");
    try {
      await apiService.pdfMaterials.remove(m._id);
      await fetchMaterials();
      setDeleting(null);
    } catch (e) {
      setError(e?.message || "Failed to delete PDF material");
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
          <h1 className="text-2xl font-bold text-slate-900">PDF Materials</h1>
          <p className="text-slate-600 mt-1">Add PDF materials with photo, name, and short description</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <IconPlus className="w-5 h-5" />
          Add PDF material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : materials.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No PDF materials yet.</p>
            <button onClick={() => setShowCreate(true)} className="text-emerald-600 hover:text-emerald-700 font-medium">
              Add your first PDF material
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {materials.map((m) => (
              <li key={m._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  {m.photo && (
                    <img
                      src={getImageUrl(m.photo)}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-500 line-clamp-1">{m.shortDescription || "—"}</p>
                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${m.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(m)} className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" aria-label="Edit">
                    <IconPencil />
                  </button>
                  <button onClick={() => setDeleting(m)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" aria-label="Delete">
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add PDF material</h2>
        <PdfMaterialForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={submitLoading} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit PDF material</h2>
        <PdfMaterialForm initial={editing ?? undefined} onSubmit={handleUpdate} onCancel={() => setEditing(null)} loading={submitLoading} />
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)}>
        {deleting && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delete PDF material</h2>
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
