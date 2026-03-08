import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useStore from "../../store/useStore";
import EditedProductPreview from "../../components/EditedProductPreview";
import ConfirmDialog from "../../components/ConfirmDialog";
import { IconPdf, IconProjects, IconTrash } from "../../components/admin/AdminIcons";
import { apiService, API_ORIGIN, IMAGE_BASE_URL } from "../../services/api";
import { generateProjectPDF } from "../../utils/pdfGenerator";
import {
  buildLayerPreviewEdits,
  buildLayerPreviewProduct,
} from "../../utils/configurationPreview";

const ROWS_PER_PAGE = 6;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const downloadConfigFile = (row) => {
  const payload = {
    project: {
      id: row.project.id,
      name: row.project.name,
      configurationNumber: row.project.configurationNumber || null,
      ownerName: row.project.ownerName || null,
      ownerEmail: row.project.ownerEmail || null,
      createdAt: row.project.createdAt || null,
    },
    product: {
      id: row.product.id,
      instanceId: row.product._instanceId || null,
      name: row.product.name || null,
      productCode: row.product.productCode || row.product.sku || null,
    },
    edits: row.edits || { elements: [], configuration: {} },
  };

  const safeProject = (row.project.name || "project").replace(/[^\w-]+/g, "-");
  const safeProduct = (row.product.name || "product").replace(/[^\w-]+/g, "-");
  const filename = `${safeProject}_${safeProduct}_configuration.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const normalizeAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  if (path.startsWith("/uploads/")) return `${IMAGE_BASE_URL}${path}`;
  return `${API_ORIGIN}${path}`;
};

const normalizePdfConfigProduct = (item) => {
  const product = item?.product || item || {};
  const instanceId = item?.instanceId || product?._instanceId || null;
  const edits = item?.edits || product?.edits || null;

  return {
    ...product,
    id: product?._id ?? product?.id,
    _instanceId: instanceId,
    baseDeviceImageUrl: normalizeAssetUrl(
      product?.baseDeviceImageUrl ||
      product?.configuratorImageUrl ||
      product?.baseImageUrl ||
      product?.image,
    ),
    baseImageUrl: normalizeAssetUrl(product?.baseImageUrl || product?.image),
    configuratorImageUrl: normalizeAssetUrl(
      product?.configuratorImageUrl ||
      product?.baseImageUrl ||
      product?.image,
    ),
    images: Array.isArray(product?.images)
      ? product.images.map((img) =>
          typeof img === "string"
            ? normalizeAssetUrl(img)
            : img?.url
              ? { ...img, url: normalizeAssetUrl(img.url) }
              : img,
        )
      : [],
    edits: edits
      ? {
          elements: edits.elements || [],
          configuration: edits.configuration || {},
        }
      : null,
  };
};

export default function AdminProjects() {
  const projects = useStore((s) => s.projects);
  const projectsLoading = useStore((s) => s.projectsLoading);
  const fetchProjects = useStore((s) => s.fetchProjects);
  const pdfConfigurations = useStore((s) => s.pdfConfigurations);
  const fetchPdfConfigurations = useStore((s) => s.fetchPdfConfigurations);
  const deletePdfConfiguration = useStore((s) => s.deletePdfConfiguration);
  const deleteProject = useStore((s) => s.deleteProject);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  const [deletingPdfId, setDeletingPdfId] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm }
  const [layerModal, setLayerModal] = useState(null); // { layerName, product, edits, baseDirectUrl }
  const [isDownloadingLayer, setIsDownloadingLayer] = useState(false);
  const modalStageRef = useRef(null);

  useEffect(() => {
    fetchProjects();
    fetchPdfConfigurations();
  }, [fetchProjects, fetchPdfConfigurations]);

  const withProducts = useMemo(
    () => projects.filter((project) => Array.isArray(project.products) && project.products.length > 0),
    [projects],
  );

  const projectRows = useMemo(
    () =>
      withProducts.flatMap((project) =>
        (project.products || []).map((product, index) => ({
          key: `${project.id}_${product._instanceId || product.id || index}`,
          project,
          product,
          edits: product.edits || { elements: [], configuration: {} },
        })),
      ),
    [withProducts],
  );

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return projectRows;

    return projectRows.filter(({ project, product }) => {
      const fields = [
        project.name,
        project.configurationNumber,
        project.ownerName,
        project.ownerEmail,
        product.name,
        product.productCode,
        product.sku,
        product._instanceId,
      ];
      return fields.some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [projectRows, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const pdfConfigByProjectId = useMemo(() => {
    const map = new Map();
    (pdfConfigurations || []).forEach((config) => {
      if (!config?.projectId) return;
      map.set(String(config.projectId), config);
    });
    return map;
  }, [pdfConfigurations]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredRows.slice(start, start + ROWS_PER_PAGE);
  }, [currentPage, filteredRows]);

  const handleDownloadOriginalPdf = async (project) => {
    const config = pdfConfigByProjectId.get(String(project.id));
    if (!config?._id) return;

    setDownloadingPdfId(project.id);
    try {
      const res = await apiService.pdf.getById(config._id);
      const fullConfig = res?.config || res;
      const rawProducts = Array.isArray(fullConfig?.products) ? fullConfig.products : [];

      if (rawProducts.length === 0) {
        throw new Error("No products found in saved PDF configuration.");
      }

      const products = rawProducts.map(normalizePdfConfigProduct);
      await generateProjectPDF(
        {
          ...project,
          name: fullConfig.projectName || project.name,
          configurationNumber: project.configurationNumber || fullConfig.configurationNumber,
          products,
        },
        {},
      );
    } catch (error) {
      console.error("[AdminProjects] Failed to download original PDF:", error);
      window.alert(error?.message || "Failed to download original PDF.");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleDeleteOriginalPdf = (project) => {
    const projectId = String(project?.id);
    const config = pdfConfigByProjectId.get(projectId);
    if (!config?._id) return;

    setConfirmDialog({
      title: "Delete saved PDF",
      message: `Remove the saved PDF configuration for "${project?.name || "this project"}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setDeletingPdfId(projectId);
        try {
          await deletePdfConfiguration(config._id);
        } finally {
          setDeletingPdfId(null);
        }
      },
    });
  };

  const handleDeleteProject = (project) => {
    setConfirmDialog({
      title: "Delete project",
      message: `Permanently delete "${project?.name || "this project"}" and all its data? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setDeletingProjectId(String(project.id));
        try {
          await deleteProject(project.id);
        } finally {
          setDeletingProjectId(null);
        }
      },
    });
  };

  const openLayerModal = (layerName, product, edits, row) => {
    const baseDirectUrl = normalizeAssetUrl(
      row.product.baseDeviceImageUrl ||
      row.product.configuratorImageUrl ||
      row.product.baseImageUrl ||
      ""
    );
    setLayerModal({ layerName, product, edits, baseDirectUrl });
  };

  const handleDownloadLayerImage = async () => {
    if (!layerModal || isDownloadingLayer) return;
    const filename = `${layerModal.layerName.replace(/\s+/g, "-").toLowerCase()}.png`;
    setIsDownloadingLayer(true);
    try {
      if (modalStageRef.current) {
        const dataURL = modalStageRef.current.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (layerModal.baseDirectUrl) {
        try {
          const response = await fetch(layerModal.baseDirectUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch {
          window.open(layerModal.baseDirectUrl, "_blank");
        }
      }
    } finally {
      setIsDownloadingLayer(false);
    }
  };

  const renderPdfActionButtons = (project, originalPdfConfig) => {
    const projectId = String(project?.id);
    const isDownloading = downloadingPdfId === projectId || downloadingPdfId === project?.id;
    const isDeleting = deletingPdfId === projectId || deletingPdfId === project?.id;
    const hasSavedPdf = Boolean(originalPdfConfig?._id);

    if (!hasSavedPdf) return null;

    return (
      <>
        <button
          type="button"
          onClick={() => handleDownloadOriginalPdf(project)}
          disabled={isDownloading || isDeleting}
          title={isDownloading ? "Preparing PDF..." : "Download PDF"}
          aria-label={isDownloading ? "Preparing PDF" : "Download PDF"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDownloading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-b-transparent" />
          ) : (
            <IconPdf className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleDeleteOriginalPdf(project)}
          disabled={isDownloading || isDeleting}
          title={isDeleting ? "Deleting saved PDF..." : "Delete saved PDF"}
          aria-label={isDeleting ? "Deleting saved PDF" : "Delete saved PDF"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-b-transparent" />
          ) : (
            <IconTrash className="h-4 w-4" />
          )}
        </button>
      </>
    );
  };

  return (
    <>
    <ConfirmDialog
      open={Boolean(confirmDialog)}
      title={confirmDialog?.title}
      message={confirmDialog?.message}
      confirmLabel="Delete"
      variant="danger"
      onConfirm={confirmDialog?.onConfirm}
      onCancel={() => setConfirmDialog(null)}
    />

    {layerModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={() => setLayerModal(null)}
      >
        <div
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">{layerModal.layerName}</h2>
            <button
              type="button"
              onClick={() => setLayerModal(null)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center bg-slate-50 p-6">
            <EditedProductPreview
              product={layerModal.product}
              edits={layerModal.edits}
              width={560}
              height={400}
              stageRef={modalStageRef}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setLayerModal(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadLayerImage}
              disabled={isDownloadingLayer}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloadingLayer ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              Download PNG
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="p-6 md:p-8 bg-slate-50 min-h-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">
            Report view for every configured project item, including layer previews and config export.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <IconProjects className="w-5 h-5" />
          Open Projects page
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700">Total projects</span>
            <span className="text-2xl font-bold text-slate-900">{projectsLoading ? "…" : withProducts.length}</span>
            <span className="text-sm text-slate-500">
              {projectsLoading ? "" : `${projectRows.length} configured item${projectRows.length === 1 ? "" : "s"}`}
            </span>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <input
              type="text"
              placeholder="Search project, config #, product, or owner..."
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="hidden md:block text-xs text-slate-500 whitespace-nowrap">
              Page {currentPage} / {totalPages}
            </div>
          </div>
        </div>
        {projectsLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No projects found.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear search
              </button>
            )}
            {!searchTerm && (
              <Link to="/projects" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Go to Projects
              </Link>
            )}
          </div>
        ) : (
          <>
          <div className="hidden xl:block overflow-x-auto">
            <table className="min-w-[1520px] w-full text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-800">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-4 text-left font-semibold align-top">Project Name</th>
                  <th className="px-4 py-4 text-left font-semibold align-top">Configuration Number</th>
                  <th className="px-4 py-4 text-left font-semibold align-top">Configuration Date</th>
                  <th className="px-4 py-4 text-left font-semibold align-top">Configuration Time</th>
                  <th className="px-4 py-4 text-left font-semibold align-top">Complete Photo</th>
                  <th className="px-4 py-4 text-left font-semibold align-top">Printing Layer</th>
                  <th className="px-4 py-4 text-left font-semibold align-top">Background Layer</th>
                  <th className="px-4 py-4 text-left font-semibold align-top">Laser Layer</th>
                  <th className="px-4 py-4 text-center font-semibold align-top whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => {
                  const completeProduct = buildLayerPreviewProduct(row.product, "complete");
                  const completeEdits = buildLayerPreviewEdits(row.edits, "complete");
                  const printingProduct = buildLayerPreviewProduct(row.product, "printing");
                  const printingEdits = buildLayerPreviewEdits(row.edits, "printing");
                  const backgroundProduct = buildLayerPreviewProduct(row.product, "background");
                  const backgroundEdits = buildLayerPreviewEdits(row.edits, "background");
                  const laserProduct = buildLayerPreviewProduct(row.product, "laser");
                  const laserEdits = buildLayerPreviewEdits(row.edits, "laser");
                  const originalPdfConfig = pdfConfigByProjectId.get(String(row.project.id));

                  return (
                    <tr key={row.key} className="border-b border-slate-200 align-top hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{row.project.name || "Untitled project"}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Product: {row.product.name || "Unnamed product"}
                        </div>
                        {(row.project.ownerName || row.project.ownerEmail) && (
                          <div className="mt-1 text-xs text-slate-500">
                            {row.project.ownerName || row.project.ownerEmail}
                            {row.project.ownerName && row.project.ownerEmail ? ` (${row.project.ownerEmail})` : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{row.project.configurationNumber || "—"}</div>
                        <div className="mt-1 text-xs text-slate-500 break-all">
                          File: {row.product._instanceId || row.product.productCode || row.product.sku || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{formatDate(row.project.createdAt)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{formatTime(row.project.createdAt)}</td>
                      <td className="px-4 py-4">
                        <EditedProductPreview product={completeProduct} edits={completeEdits} width={140} height={105} onClick={() => openLayerModal("Complete Photo", completeProduct, completeEdits, row)} />
                      </td>
                      <td className="px-4 py-4">
                        <EditedProductPreview product={printingProduct} edits={printingEdits} width={140} height={105} onClick={() => openLayerModal("Printing Layer", printingProduct, printingEdits, row)} />
                      </td>
                      <td className="px-4 py-4">
                        <EditedProductPreview product={backgroundProduct} edits={backgroundEdits} width={140} height={105} onClick={() => openLayerModal("Background Layer", backgroundProduct, backgroundEdits, row)} />
                      </td>
                      <td className="px-4 py-4">
                        <EditedProductPreview product={laserProduct} edits={laserEdits} width={140} height={105} onClick={() => openLayerModal("Laser Layer", laserProduct, laserEdits, row)} />
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {renderPdfActionButtons(row.project, originalPdfConfig)}
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(row.project)}
                            disabled={deletingProjectId === String(row.project.id)}
                            title={deletingProjectId === String(row.project.id) ? "Deleting project..." : "Delete project"}
                            aria-label={deletingProjectId === String(row.project.id) ? "Deleting project" : "Delete project"}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingProjectId === String(row.project.id) ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-b-transparent" />
                            ) : (
                              <IconTrash className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="xl:hidden p-4 sm:p-6 space-y-4">
            {paginatedRows.map((row) => {
              const completeProduct = buildLayerPreviewProduct(row.product, "complete");
              const completeEdits = buildLayerPreviewEdits(row.edits, "complete");
              const printingProduct = buildLayerPreviewProduct(row.product, "printing");
              const printingEdits = buildLayerPreviewEdits(row.edits, "printing");
              const backgroundProduct = buildLayerPreviewProduct(row.product, "background");
              const backgroundEdits = buildLayerPreviewEdits(row.edits, "background");
              const laserProduct = buildLayerPreviewProduct(row.product, "laser");
              const laserEdits = buildLayerPreviewEdits(row.edits, "laser");
              const originalPdfConfig = pdfConfigByProjectId.get(String(row.project.id));

              return (
                <article key={row.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {row.project.name || "Untitled project"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {row.product.name || "Unnamed product"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.project.configurationNumber || "—"} • {formatDate(row.project.createdAt)} • {formatTime(row.project.createdAt)}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {(row.project.ownerName || row.project.ownerEmail) &&
                        `${row.project.ownerName || row.project.ownerEmail}${
                          row.project.ownerName && row.project.ownerEmail ? ` (${row.project.ownerEmail})` : ""
                        }`}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Complete Photo</p>
                      <EditedProductPreview product={completeProduct} edits={completeEdits} width={280} height={180} onClick={() => openLayerModal("Complete Photo", completeProduct, completeEdits, row)} />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Printing Layer</p>
                      <EditedProductPreview product={printingProduct} edits={printingEdits} width={280} height={180} onClick={() => openLayerModal("Printing Layer", printingProduct, printingEdits, row)} />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Background Layer</p>
                      <EditedProductPreview product={backgroundProduct} edits={backgroundEdits} width={280} height={180} onClick={() => openLayerModal("Background Layer", backgroundProduct, backgroundEdits, row)} />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Laser Layer</p>
                      <EditedProductPreview product={laserProduct} edits={laserEdits} width={280} height={180} onClick={() => openLayerModal("Laser Layer", laserProduct, laserEdits, row)} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    {renderPdfActionButtons(row.project, originalPdfConfig)}
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(row.project)}
                      disabled={deletingProjectId === String(row.project.id)}
                      title={deletingProjectId === String(row.project.id) ? "Deleting project..." : "Delete project"}
                      aria-label={deletingProjectId === String(row.project.id) ? "Deleting project" : "Delete project"}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingProjectId === String(row.project.id) ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-b-transparent" />
                      ) : (
                        <IconTrash className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredRows.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, filteredRows.length)} of {filteredRows.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 text-sm font-medium text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
