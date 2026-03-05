import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { IconSolutions, IconPencil } from "../../components/admin/AdminIcons";
import { apiService, getImageUrl } from "../../services/api";

const DEFAULT_ITEMS = [
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

function WhyChooseForm({ solution, initial, onSubmit, onCancel, loading }) {
  const [introTitle, setIntroTitle] = useState(
    initial?.introTitle || "Why Choose Our Solution"
  );
  const [introSubtitle, setIntroSubtitle] = useState(
    initial?.introSubtitle ||
      "Designed to optimize access management through security, efficiency, and full operational visibility."
  );
  const [items, setItems] = useState(
    Array.isArray(initial?.items) && initial.items.length
      ? initial.items
      : DEFAULT_ITEMS
  );

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const base = next[index] || { title: "", desc: "", icon: "", order: index };
      next[index] = {
        ...base,
        [field]: value,
        order: base.order ?? index,
      };
      return next;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { title: "", desc: "", icon: "", order: prev.length },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadIcon = async (index, file) => {
    if (!solution?._id || !file) return;
    try {
      const fd = new FormData();
      fd.append("icon", file);
      const res = await apiService.solutionWhyChoose.uploadIcon(solution._id, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const iconPath = res?.iconPath || "";
      if (!iconPath) return;
      setItems((prev) => {
        const next = [...prev];
        const base =
          next[index] || { title: "", desc: "", icon: "", order: index };
        next[index] = { ...base, icon: iconPath };
        return next;
      });
    } catch {
      // ignore upload errors here; saving config will still work with text icons
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedItems = (items || [])
      .map((it, idx) => ({
        title: (it.title || "").trim(),
        desc: (it.desc || "").trim(),
        icon: (it.icon || "").trim(),
        order:
          typeof it.order === "number"
            ? it.order
            : Number.isFinite(Number(it.order))
            ? Number(it.order)
            : idx,
      }))
      .filter((it) => it.title || it.desc || it.icon);

    onSubmit({
      introTitle: introTitle.trim() || "Why Choose Our Solution",
      introSubtitle:
        introSubtitle.trim() ||
        "Designed to optimize access management through security, efficiency, and full operational visibility.",
      items: trimmedItems,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
      <div>
        <p className="text-sm text-slate-600 mb-2">
          Editing why-choose cards for:
        </p>
        <p className="text-base font-semibold text-slate-900">
          {solution?.title || "—"}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Section title
        </label>
        <input
          type="text"
          value={introTitle}
          onChange={(e) => setIntroTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Section subtitle
        </label>
        <textarea
          value={introSubtitle}
          onChange={(e) => setIntroSubtitle(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Cards ({items.length})
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-medium"
          >
            Add card
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item, index) => {
            const iconPath = item.icon || "";
            const hasUploadsPath =
              typeof iconPath === "string" && iconPath.startsWith("/uploads/");
            const previewSrc = iconPath
              ? hasUploadsPath
                ? getImageUrl(iconPath)
                : ""
              : "";
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Card {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-xs text-slate-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={item.title || ""}
                        onChange={(e) =>
                          updateItem(index, "title", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={item.desc || ""}
                        onChange={(e) =>
                          updateItem(index, "desc", e.target.value)
                        }
                        rows={2}
                        className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Icon filename (optional)
                      </label>
                      <input
                        type="text"
                        value={iconPath}
                        onChange={(e) =>
                          updateItem(index, "icon", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Seamless Access Flow.png or /uploads/solutions/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Icon image preview
                    </label>
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
                          No upload yet
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
                              handleUploadIcon(index, file);
                            }
                          }}
                        />
                      </label>
                      {iconPath && (
                        <button
                          type="button"
                          onClick={() => updateItem(index, "icon", "")}
                          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-500 hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
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

export default function SolutionWhyChooseManagement() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSolution, setEditingSolution] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiService.solutions.list({});
        if (!cancelled) {
          setSolutions(res?.solutions || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load solutions");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openEditor = async (solution) => {
    setEditingSolution(solution);
    setModalLoading(true);
    setEditingConfig(null);
    try {
      const res = await apiService.solutionWhyChoose.getForSolution(solution._id);
      setEditingConfig(res?.config || null);
    } catch {
      setEditingConfig(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSave = async (payload) => {
    if (!editingSolution) return;
    setModalLoading(true);
    setError("");
    try {
      const res = await apiService.solutionWhyChoose.upsertForSolution(
        editingSolution._id,
        payload
      );
      setEditingConfig(res?.config || payload);
      setEditingSolution(null);
    } catch (e) {
      setError(e?.message || "Failed to save why-choose configuration");
    } finally {
      setModalLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-900">
            Solution – Why Choose
          </h1>
          <p className="text-slate-600 mt-1">
            Configure the intro and cards for the &quot;Why Choose Our
            Solution&quot; section on each solution detail page.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : solutions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-2">No solutions yet.</p>
            <p className="text-sm">
              Create a solution first under the <strong>Solutions</strong> menu.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {solutions.map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <IconSolutions className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{s.title}</p>
                    <p className="text-xs text-slate-500">
                      Status:{" "}
                      <span className="font-medium">{s.status || "active"}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor(s)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <IconPencil className="w-4 h-4" />
                  Edit cards
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!editingSolution} onClose={() => setEditingSolution(null)}>
        {editingSolution && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Edit &quot;Why Choose&quot; section
            </h2>
            {modalLoading && !editingConfig ? (
              <div className="p-4 text-center text-slate-500">Loading…</div>
            ) : (
              <WhyChooseForm
                solution={editingSolution}
                initial={editingConfig || undefined}
                onSubmit={handleSave}
                onCancel={() => setEditingSolution(null)}
                loading={modalLoading}
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

