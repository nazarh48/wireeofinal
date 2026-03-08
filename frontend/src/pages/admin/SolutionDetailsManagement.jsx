import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import { apiService, getImageUrl } from "../../services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function pointsToText(initial) {
  const raw = initial?.points;
  if (!Array.isArray(raw)) return "";
  return raw
    .map((p) => {
      const title = (p?.title || "").trim();
      const desc = (p?.desc || "").trim();
      if (!title && !desc) return "";
      if (!desc) return title;
      return `${title} - ${desc}`;
    })
    .filter(Boolean)
    .join("\n");
}

function DetailForm({ initial, solutions, onSubmit, onCancel, loading }) {
  const [solutionId, setSolutionId] = useState(initial?.solution ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [pointsText, setPointsText] = useState(pointsToText(initial));

  useEffect(() => {
    setSolutionId(initial?.solution ?? "");
    setTitle(initial?.title ?? "");
    setSubtitle(initial?.subtitle ?? "");
    setBody(initial?.body ?? "");
    setImage(initial?.image ?? "");
    setOrder(initial?.order ?? 0);
    setStatus(initial?.status ?? "active");
    setImageFile(null);
    setError("");
    setPointsText(pointsToText(initial));
  }, [initial]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setImagePreview(image?.trim() ? getImageUrl(image.trim()) : "");
    return undefined;
  }, [image, imageFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!solutionId) {
      setError("Please select a solution.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const points = pointsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [first, ...rest] = line.split(" - ");
        const title = (first || "").trim();
        const desc = rest.join(" - ").trim();
        return { title, desc };
      });

    const payload = {
      solution: solutionId,
      title: title.trim(),
      subtitle: subtitle.trim(),
      body: body.trim(),
      image: image.trim() || undefined,
      order: Number(order) || 0,
      status,
      points,
    };

    onSubmit(payload, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Solution *
        </label>
        <select
          value={solutionId}
          onChange={(e) => setSolutionId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select solution…</option>
          {solutions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Subtitle
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Body text
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Points (one per line – use &quot;Title - description&quot; format)
        </label>
        <textarea
          value={pointsText}
          onChange={(e) => setPointsText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder={"Field Infrastructure - Native KNX devices for access control...\nCloud Core - Microsoft Azure–based management platform...\nMobile Interaction - Guest and staff applications..."}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Image preview
        </label>
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt={title || "Section preview"}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                setImagePreview("");
              }}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">
              No image selected
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Image URL (optional)
        </label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Upload image (optional, overrides URL)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile((e.target.files || [])[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700"
        />
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Order
          </label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
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
          {loading ? "Saving…" : initial ? "Update section" : "Create section"}
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

export default function SolutionDetailsManagement() {
  const [solutions, setSolutions] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [solutionsRes, detailsRes] = await Promise.all([
        apiService.solutions.list({}),
        apiService.solutionDetails.list({}),
      ]);
      setSolutions(solutionsRes?.solutions || []);
      setDetails(detailsRes?.details || []);
      setError("");
    } catch (e) {
      setError(e?.message || "Failed to load solution details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const buildFormData = (payload, imageFile) => {
    const fd = new FormData();
    fd.append("solution", payload.solution);
    fd.append("title", payload.title);
    if (payload.subtitle) fd.append("subtitle", payload.subtitle);
    if (payload.body) fd.append("body", payload.body);
    if (Array.isArray(payload.points) && payload.points.length) {
      fd.append("points", JSON.stringify(payload.points));
    }
    if (payload.image) fd.append("image", payload.image);
    if (payload.order != null) fd.append("order", String(payload.order));
    if (payload.status) fd.append("status", payload.status);
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const handleCreate = async (payload, imageFile) => {
    setSubmitLoading(true);
    setError("");
    try {
      const fd = buildFormData(payload, imageFile);
      await apiService.solutionDetails.create(fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchAll();
      setShowCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create section");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (payload, imageFile) => {
    if (!editing) return;
    setSubmitLoading(true);
    setError("");
    try {
      const fd = buildFormData(payload, imageFile);
      await apiService.solutionDetails.update(editing._id, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchAll();
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update section");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (detail) => {
    setSubmitLoading(true);
    setError("");
    try {
      await apiService.solutionDetails.remove(detail._id);
      await fetchAll();
      setDeleting(null);
    } catch (e) {
      setError(e?.message || "Failed to delete section");
    } finally {
      setSubmitLoading(false);
    }
  };

  const solutionById = (id) => solutions.find((s) => s._id === id);

  return (
    <div className="p-6 md:p-8">
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Solution details
          </h1>
          <p className="text-slate-600 mt-1">
            Manage content sections for each solution detail page.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <IconPlus className="w-5 h-5" />
          Add section
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : details.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No sections yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Create your first section
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {details.map((d) => {
              const sol = solutionById(d.solution);
              const imgSrc = d.image ? getImageUrl(d.image) : "";
              return (
                <li
                  key={d._id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {d.title}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {sol ? sol.title : "—"}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                          d.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(d)}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      aria-label="Edit"
                    >
                      <IconPencil />
                    </button>
                    <button
                      onClick={() => setDeleting(d)}
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
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Create section
        </h2>
        <DetailForm
          solutions={solutions}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={submitLoading}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Edit section
        </h2>
        <DetailForm
          initial={editing ?? undefined}
          solutions={solutions}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
          loading={submitLoading}
        />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)}>
        {deleting && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Delete section
            </h2>
            <p className="text-slate-700 mb-4">
              Delete &quot;{deleting.title}&quot;?
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

