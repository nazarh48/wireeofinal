import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import { apiService, getImageUrl } from "../../services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function featuresToText(initial) {
  const raw = initial?.features;
  if (Array.isArray(raw)) return raw.join("\n");
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.join("\n");
      }
    } catch {
      // not JSON, fall through
    }
    return raw;
  }
  return "";
}

const DEFAULT_WHY_INTRO_TITLE = "Why Choose Our Solution";
const DEFAULT_WHY_INTRO_SUBTITLE =
  "Designed to optimize access management through security, efficiency, and full operational visibility.";

const DEFAULT_WHY_ITEMS = [
  {
    title: "Seamless Access Flow",
    desc: "Eliminates bottlenecks with instant validation and smooth entry processes.",
    icon: "Seamless Access Flow.png",
  },
  {
    title: "Advanced Access Protection",
    desc: "Ensures controlled access, protected data, and compliance with modern security standards.",
    icon: "Advanced Access Protection.png",
  },
  {
    title: "Centralized Multi-Site Control",
    desc: "Enables unified management of multiple locations from a single interface.",
    icon: "Centralized Multi-Site Control.png",
  },
  {
    title: "Effortless Integration",
    desc: "Connects seamlessly with existing infrastructure and business systems.",
    icon: "Effortless Integration.png",
  },
  {
    title: "Actionable Real-Time Insights",
    desc: "Transforms operational data into clear reports and performance indicators.",
    icon: "Actionable Real-Time Insights.png",
  },
  {
    title: "Reliable Ongoing Support",
    desc: "Provides continuous technical guidance to ensure uninterrupted operations.",
    icon: "Reliable Ongoing Support.png",
  },
];

function SolutionForm({ initial, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [featuresText, setFeaturesText] = useState(featuresToText(initial));
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [imageFiles, setImageFiles] = useState([]);
  const [fileFiles, setFileFiles] = useState([]);
  const [error, setError] = useState("");
  const [whyConfig, setWhyConfig] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);
  const [whyError, setWhyError] = useState("");

  // Keep textarea in sync when editing different solutions,
  // and always convert any JSON-like value to plain text lines.
  useEffect(() => {
    setFeaturesText(featuresToText(initial));
  }, [initial]);

  useEffect(() => {
    if (!initial?._id) {
      setWhyConfig(null);
      setWhyError("");
      return;
    }
    let cancelled = false;
    setWhyLoading(true);
    setWhyError("");
    apiService.solutionWhyChoose
      .getForSolution(initial._id)
      .then((res) => {
        if (cancelled) return;
        const cfg = res?.config || {};
        const items =
          Array.isArray(cfg.items) && cfg.items.length
            ? cfg.items
            : DEFAULT_WHY_ITEMS;
        setWhyConfig({
          introTitle: cfg.introTitle || DEFAULT_WHY_INTRO_TITLE,
          introSubtitle: cfg.introSubtitle || DEFAULT_WHY_INTRO_SUBTITLE,
          items,
        });
      })
      .catch((e) => {
        if (!cancelled) {
          setWhyError(e?.message || "Failed to load Why Choose section");
          setWhyConfig({
            introTitle: DEFAULT_WHY_INTRO_TITLE,
            introSubtitle: DEFAULT_WHY_INTRO_SUBTITLE,
            items: DEFAULT_WHY_ITEMS,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setWhyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initial?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const t = title.trim();
    if (!t) {
      setError("Title is required.");
      return;
    }
    const features = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title: t,
      description: description.trim(),
      icon: icon.trim(),
      image: image.trim() || undefined,
      features,
      order: Number(order) || 0,
      status,
    };
    onSubmit(payload, imageFiles.length ? imageFiles : null, fileFiles.length ? fileFiles : null);
  };

  const updateWhyItem = (index, field, value) => {
    setWhyConfig((prev) => {
      if (!prev) return prev;
      const items = [...(prev.items || [])];
      const base = items[index] || {
        title: "",
        desc: "",
        icon: "",
        order: index,
      };
      items[index] = {
        ...base,
        [field]: value,
        order:
          typeof base.order === "number" ? base.order : Number(index) || 0,
      };
      return { ...prev, items };
    });
  };

  const handleAddWhyItem = () => {
    setWhyConfig((prev) => {
      const items = prev?.items ? [...prev.items] : [];
      items.push({
        title: "",
        desc: "",
        icon: "",
        order: items.length,
      });
      return {
        ...(prev || {
          introTitle: DEFAULT_WHY_INTRO_TITLE,
          introSubtitle: DEFAULT_WHY_INTRO_SUBTITLE,
        }),
        items,
      };
    });
  };

  const handleRemoveWhyItem = (index) => {
    setWhyConfig((prev) => {
      if (!prev) return prev;
      const items = (prev.items || []).filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  const handleUploadWhyIcon = async (index, file) => {
    if (!initial?._id || !file) return;
    setWhyLoading(true);
    setWhyError("");
    try {
      const fd = new FormData();
      fd.append("icon", file);
      const res = await apiService.solutionWhyChoose.uploadIcon(initial._id, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const iconPath = res?.iconPath || "";
      if (!iconPath) {
        throw new Error("Icon path missing in response");
      }
      setWhyConfig((prev) => {
        if (!prev) return prev;
        const items = [...(prev.items || [])];
        if (!items[index]) {
          items[index] = {
            title: "",
            desc: "",
            icon: iconPath,
            order: index,
          };
        } else {
          items[index] = {
            ...items[index],
            icon: iconPath,
          };
        }
        return { ...prev, items };
      });
    } catch (e) {
      setWhyError(e?.message || "Failed to upload icon");
    } finally {
      setWhyLoading(false);
    }
  };

  const handleSaveWhyConfig = async () => {
    if (!initial?._id || !whyConfig) return;
    setWhyLoading(true);
    setWhyError("");
    try {
      const payload = {
        introTitle:
          (whyConfig.introTitle || "").trim() || DEFAULT_WHY_INTRO_TITLE,
        introSubtitle:
          (whyConfig.introSubtitle || "").trim() ||
          DEFAULT_WHY_INTRO_SUBTITLE,
        items: (whyConfig.items || []).map((item, index) => ({
          title: (item.title || "").trim(),
          desc: (item.desc || "").trim(),
          icon: (item.icon || "").trim(),
          order:
            typeof item.order === "number"
              ? item.order
              : Number.isFinite(Number(item.order))
              ? Number(item.order)
              : index,
        })),
      };
      await apiService.solutionWhyChoose.upsertForSolution(initial._id, payload);
    } catch (e) {
      setWhyError(e?.message || "Failed to save Why Choose section");
    } finally {
      setWhyLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="Solution title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji)</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Features (one per line)</label>
        <textarea
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="Feature 1&#10;Feature 2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Additional images</label>
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Downloadable files</label>
        <input
          type="file"
          name="files"
          multiple
          onChange={(e) => setFileFiles(Array.from(e.target.files || []))}
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

      {initial?._id && (
        <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Why Choose section
              </h3>
              <p className="text-xs text-slate-500">
                Configure the intro and cards for this solution detail page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveWhyConfig}
              disabled={whyLoading || !whyConfig}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {whyLoading ? "Saving…" : "Save Why Choose"}
            </button>
          </div>
          {whyError && (
            <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-xs">
              {whyError}
            </div>
          )}
          {!whyConfig ? (
            <div className="text-sm text-slate-500 py-4">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Section title
                  </label>
                  <input
                    type="text"
                    value={whyConfig.introTitle || ""}
                    onChange={(e) =>
                      setWhyConfig((prev) =>
                        prev
                          ? { ...prev, introTitle: e.target.value }
                          : prev
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Section subtitle
                  </label>
                  <textarea
                    value={whyConfig.introSubtitle || ""}
                    onChange={(e) =>
                      setWhyConfig((prev) =>
                        prev
                          ? { ...prev, introSubtitle: e.target.value }
                          : prev
                      )
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Cards ({whyConfig.items?.length || 0})
                  </p>
                  <button
                    type="button"
                    onClick={handleAddWhyItem}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Add card
                  </button>
                </div>
                <div className="space-y-3">
                  {(whyConfig.items || []).map((item, index) => {
                    const iconPath = item.icon || "";
                    const isUploadPath =
                      typeof iconPath === "string" &&
                      iconPath.startsWith("/uploads/");
                    const previewSrc = iconPath
                      ? isUploadPath
                        ? getImageUrl(iconPath)
                        : getImageUrl(
                            `/uploads/solutions/${iconPath.replace(
                              /^\/+/,
                              ""
                            )}`
                          )
                      : "";
                    return (
                      <div
                        key={index}
                        className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">
                            Card {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWhyItem(index)}
                            className="text-xs text-slate-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                          <div className="md:col-span-2 space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={item.title || ""}
                                onChange={(e) =>
                                  updateWhyItem(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Description
                              </label>
                              <textarea
                                value={item.desc || ""}
                                onChange={(e) =>
                                  updateWhyItem(
                                    index,
                                    "desc",
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Icon image
                            </label>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-20 h-20 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                {previewSrc ? (
                                  // eslint-disable-next-line jsx-a11y/alt-text
                                  <img
                                    src={previewSrc}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-[11px] text-slate-400 text-center px-1">
                                    No icon
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <label className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
                                  Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file =
                                        (e.target.files || [])[0] || null;
                                      if (file) {
                                        handleUploadWhyIcon(index, file);
                                      }
                                    }}
                                  />
                                </label>
                                {iconPath && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateWhyItem(index, "icon", "")
                                    }
                                    className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-500 hover:bg-slate-50"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

export default function SolutionsManagement() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const res = await apiService.solutions.list({});
      setSolutions(res?.solutions || []);
    } catch (e) {
      setError(e?.message || "Failed to load solutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const buildFormData = (payload, imageFiles, fileFiles) => {
    const fd = new FormData();
    fd.append("title", payload.title);
    if (payload.description) fd.append("description", payload.description);
    if (payload.icon) fd.append("icon", payload.icon);
    if (payload.image) fd.append("image", payload.image);
    if (payload.order != null) fd.append("order", String(payload.order));
    if (payload.status) fd.append("status", payload.status);
    if (Array.isArray(payload.features) && payload.features.length)
      fd.append("features", JSON.stringify(payload.features));
    if (imageFiles && imageFiles.length) imageFiles.forEach((f) => fd.append("images", f));
    if (fileFiles && fileFiles.length) fileFiles.forEach((f) => fd.append("files", f));
    return fd;
  };

  const handleCreate = async (payload, imageFiles, fileFiles) => {
    setSubmitLoading(true);
    setError("");
    try {
      const fd = buildFormData(payload, imageFiles, fileFiles);
      await apiService.solutions.create(fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchSolutions();
      setShowCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create solution");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (payload, imageFiles, fileFiles) => {
    if (!editing) return;
    setSubmitLoading(true);
    setError("");
    try {
      const fd = buildFormData(payload, imageFiles, fileFiles);
      await apiService.solutions.update(editing._id, fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchSolutions();
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Failed to update solution");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (sol) => {
    setSubmitLoading(true);
    setError("");
    try {
      await apiService.solutions.remove(sol._id);
      await fetchSolutions();
      setDeleting(null);
    } catch (e) {
      setError(e?.message || "Failed to delete solution");
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
          <h1 className="text-2xl font-bold text-slate-900">Solutions</h1>
          <p className="text-slate-600 mt-1">Manage solutions under the Solutions menu</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <IconPlus className="w-5 h-5" />
          Add solution
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : solutions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No solutions yet.</p>
            <button onClick={() => setShowCreate(true)} className="text-emerald-600 hover:text-emerald-700 font-medium">
              Create your first solution
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {solutions.map((s) => {
              const firstImage =
                Array.isArray(s.images) && s.images[0]
                  ? (s.images[0].url || s.images[0])
                  : null;
              const imgSrc = getImageUrl(firstImage || s.image || "");

              return (
                <li key={s._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
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
                      <p className="font-medium text-slate-900">{s.title}</p>
                      <p className="text-sm text-slate-500 line-clamp-1">{s.description || "—"}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${s.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(s)}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      aria-label="Edit"
                    >
                      <IconPencil />
                    </button>
                    <button
                      onClick={() => setDeleting(s)}
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
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create solution</h2>
        <SolutionForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={submitLoading} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit solution</h2>
        <SolutionForm initial={editing ?? undefined} onSubmit={handleUpdate} onCancel={() => setEditing(null)} loading={submitLoading} />
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)}>
        {deleting && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delete solution</h2>
            <p className="text-slate-700 mb-4">Delete &quot;{deleting.title}&quot;?</p>
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
