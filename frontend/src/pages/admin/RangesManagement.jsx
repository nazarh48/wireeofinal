import { useEffect, useState } from "react";
import { useCatalogStore } from "../../store/catalogStore";
import { useAdminStore } from "../../store/adminStore";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import { getImageUrl } from "../../services/api";
import DashboardHeader from "../../components/admin/DashboardHeader";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function RangeForm({ initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [order, setOrder] = useState(
    initial?.order !== null && initial?.order !== undefined ? String(initial.order) : ""
  );
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setOrder(initial?.order !== null && initial?.order !== undefined ? String(initial.order) : "");
    setStatus(initial?.status ?? "active");
    setImageFile(null);
    setImagePreview(null);
    setError("");
  }, [initial]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedOrder = order.trim();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (trimmedOrder !== "") {
      const parsedOrder = Number(trimmedOrder);
      if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
        setError("Order must be a non-negative whole number.");
        return;
      }
    }

    onSubmit(
      {
        name: trimmedName,
        description: description.trim(),
        order: trimmedOrder === "" ? null : Number(trimmedOrder),
        status,
      },
      imageFile || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          placeholder="Range name"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          placeholder="Short description"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Image</label>
        {imagePreview ? (
          <div className="space-y-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove image
            </button>
          </div>
        ) : initial?.image ? (
          <div className="space-y-2">
            <img
              src={getImageUrl(initial.image)}
              alt="Current"
              className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-emerald-700"
            />
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-emerald-700"
          />
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Display order</label>
        <input
          type="number"
          min="0"
          step="1"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          placeholder="1"
        />
        <p className="mt-1 text-xs text-slate-500">
          Lower numbers show first. Leave blank to place the range after explicitly ordered ones.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
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

  const productCountByRange = ranges.reduce((acc, range) => {
    acc[range.id] = products.filter((product) => product.rangeId === range.id).length;
    return acc;
  }, {});

  const handleCreate = async (payload, imageFile) => {
    setLoading(true);
    setError("");
    try {
      const range = await createRange(payload, imageFile);
      if (range) {
        logActivity({
          type: "range_created",
          label: `Range "${range.name}" created`,
          meta: { id: range.id },
        });
      }
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
      logActivity({
        type: "range_updated",
        label: `Range "${payload.name}" updated`,
        meta: { id: editing.id },
      });
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update range");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (range) => {
    setLoading(true);
    setError("");
    try {
      await deleteRange(range.id);
      logActivity({
        type: "range_deleted",
        label: `Range "${range.name}" deleted`,
        meta: { id: range.id },
      });
      setDeleting(null);
    } catch (e) {
      setError(e?.message || "Failed to delete range");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8">
      <DashboardHeader
        title="Ranges"
        subtitle="Create, edit, and delete product ranges"
        showHomeButton={true}
      />
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ranges Management</h1>
          <p className="mt-1 text-slate-600">Create, edit, and delete product ranges</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          <IconPlus className="h-5 w-5" />
          Add range
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {ranges.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No ranges yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Create your first range
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {ranges.map((range) => (
              <li
                key={range.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  {range.image ? (
                    <img
                      src={getImageUrl(range.image)}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-400">
                      No img
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{range.name}</p>
                    <p className="text-sm text-slate-500">{range.description || "-"}</p>
                    <div className="mt-1 flex gap-2">
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-xs text-sky-700">
                        Order {range.order ?? "Auto"}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          range.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {range.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {productCountByRange[range.id] ?? 0} product(s)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(range)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label="Edit"
                  >
                    <IconPencil />
                  </button>
                  <button
                    onClick={() => setDeleting(range)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
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
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Create range</h2>
        <RangeForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={loading}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Edit range</h2>
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
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Delete range</h2>
            <p className="mb-4 text-slate-700">
              Delete &quot;{deleting.name}&quot;? This will also remove{" "}
              {productCountByRange[deleting.id] ?? 0} product(s).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleting)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
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
