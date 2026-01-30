import { useState, useEffect } from "react";
import { useCatalogStore } from "../../store/catalogStore";
import { useAdminStore } from "../../store/adminStore";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

function ProductForm({ initial, ranges, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [rangeId, setRangeId] = useState(initial?.rangeId ?? (ranges[0]?.id ?? ""));
  const [configurable, setConfigurable] = useState(!!initial?.configurable);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [error, setError] = useState("");
  const [imagesFiles, setImagesFiles] = useState([]);
  const [previews, setPreviews] = useState(() => {
    const imgs = Array.isArray(initial?.images) ? initial.images : [];
    if (imgs.length) return imgs;
    return initial?.baseImageUrl ? [initial.baseImageUrl] : [];
  });

  useEffect(() => {
    return () => {
      // revoke object URLs
      previews.forEach((u) => {
        if (typeof u === "string" && u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const t = name.trim();
    if (!t) {
      setError("Name is required.");
      return;
    }
    if (!rangeId) {
      setError("Please select a range.");
      return;
    }
    if (!initial && imagesFiles.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }
    onSubmit({
      name: t,
      description: description.trim(),
      rangeId,
      configurable,
      status,
      imagesFiles,
    });
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
          placeholder="Product name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Short description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Range *</label>
        <select
          value={rangeId}
          onChange={(e) => setRangeId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Select range</option>
          {ranges.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Product images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            // cleanup existing blob urls
            previews.forEach((u) => {
              if (typeof u === "string" && u.startsWith("blob:")) URL.revokeObjectURL(u);
            });
            setImagesFiles(files);
            setPreviews(files.map((f) => URL.createObjectURL(f)));
          }}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {previews.slice(0, 6).map((src, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img src={src} alt="" className="w-full h-20 object-cover" />
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Upload up to 10 images. If you don’t select new images while editing, existing images stay unchanged.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="configurable"
          checked={configurable}
          onChange={(e) => setConfigurable(e.target.checked)}
          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
        />
        <label htmlFor="configurable" className="text-sm font-medium text-slate-700">
          Configurable (can be used in configurator, collections, projects, PDF)
        </label>
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

export default function ProductsManagement() {
  const ranges = useCatalogStore((s) => s.adminRanges || []);
  const products = useCatalogStore((s) => s.adminProducts || []);
  const getAdminRangeById = useCatalogStore((s) => s.getAdminRangeById);
  const loadAdminCatalog = useCatalogStore((s) => s.loadAdminCatalog);
  const createProduct = useCatalogStore((s) => s.createProduct);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const logActivity = useAdminStore((s) => s.logActivity);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminCatalog();
  }, [loadAdminCatalog]);

  const activeRanges = (ranges || []).filter((r) => r.status === "active");

  const handleCreate = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const p = await createProduct(payload);
      if (p) logActivity({ type: "product_created", label: `Product "${p.name}" created`, meta: { id: p._id || p.id } });
      setShowCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editing) return;
    setLoading(true);
    setError("");
    try {
      await updateProduct(editing.id, payload);
      logActivity({ type: "product_updated", label: `Product "${payload.name}" updated`, meta: { id: editing.id } });
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    setLoading(true);
    setError("");
    try {
      await deleteProduct(product.id);
      logActivity({ type: "product_deleted", label: `Product "${product.name}" deleted`, meta: { id: product.id } });
      setDeleting(null);
    } catch (e) {
      setError(e?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {error && !deleting && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-600 mt-1">Create, edit, and delete products. Assign range and type (configurable / normal).</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={activeRanges.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconPlus className="w-5 h-5" />
          Add product
        </button>
      </div>

      {activeRanges.length === 0 && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 text-amber-800 text-sm">
          Create at least one <strong>active</strong> range before adding products.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No products yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              disabled={activeRanges.length === 0}
              className="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
            >
              Create your first product
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {products.map((p) => {
              const range = getAdminRangeById ? getAdminRangeById(p.rangeId) : null;
              return (
                <li key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4 min-w-0">
                    {p.baseImageUrl ? (
                      <img
                        src={p.baseImageUrl}
                        alt=""
                        className="w-14 h-14 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 text-xs">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="text-sm text-slate-500 truncate">{p.description || "—"}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400">{range?.name ?? "—"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${p.configurable ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-600"}`}>
                          {p.configurable ? "Configurable" : "Normal"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${p.status === "active" ? "bg-emerald-100 text-emerald-800" : p.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditing(p)}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      aria-label="Edit"
                    >
                      <IconPencil />
                    </button>
                    <button
                      onClick={() => setDeleting(p)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label="Delete"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create product</h2>
        <ProductForm
          ranges={activeRanges}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={loading}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit product</h2>
        {editing && (
          <ProductForm
            initial={editing}
            ranges={ranges || []}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            loading={loading}
          />
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => !loading && setDeleting(null)}>
        {deleting && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delete product</h2>
            <p className="text-slate-700 mb-4">
              Delete &quot;{deleting.name}&quot;? This cannot be undone.
            </p>
            {error && <div className="mb-4 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleting)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Delete"}
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
