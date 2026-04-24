import { useState, useEffect, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { useCatalogStore } from "../../store/catalogStore";
import { useAdminStore } from "../../store/adminStore";
import Modal from "../../components/Modal";
import { IconPlus, IconPencil, IconTrash } from "../../components/admin/AdminIcons";
import DashboardHeader from "../../components/admin/DashboardHeader";
import { apiService } from "../../services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

function ProductForm({ initial, ranges, resources, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [productCode, setProductCode] = useState(initial?.productCode ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [technicalDetails, setTechnicalDetails] = useState(initial?.technicalDetails ?? "");
  const [rangeId, setRangeId] = useState(initial?.rangeId ?? (ranges[0]?.id ?? ""));
  const [configurable, setConfigurable] = useState(!!initial?.configurable);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [error, setError] = useState("");
  const [cropFieldErrorHeight, setCropFieldErrorHeight] = useState("");
  const [cropFieldErrorWidth, setCropFieldErrorWidth] = useState("");
  const [imagesFiles, setImagesFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(() => {
    const imgs = Array.isArray(initial?.images) ? initial.images : [];
    if (imgs.length) return imgs;
    return initial?.baseImageUrl ? [initial.baseImageUrl] : [];
  });
  const [configuratorImageFile, setConfiguratorImageFile] = useState(null);
  const [configuratorPreview, setConfiguratorPreview] = useState(initial?.configuratorImageUrl ?? "");
  const [selectedResourceIds, setSelectedResourceIds] = useState(() => {
    if (Array.isArray(initial?.resourceIds) && initial.resourceIds.length > 0) {
      return initial.resourceIds;
    }
    if (Array.isArray(initial?.resources) && initial.resources.length > 0) {
      return initial.resources.map((resource) => resource.id).filter(Boolean);
    }
    return [];
  });
  const [resourceToAdd, setResourceToAdd] = useState("");
  const [baseDeviceImageFile, setBaseDeviceImageFile] = useState(null);
  const [baseDevicePreview, setBaseDevicePreview] = useState(initial?.baseDeviceImageUrl ?? "");
  const [engravingMaskImageFile, setEngravingMaskImageFile] = useState(null);
  const [engravingMaskPreview, setEngravingMaskPreview] = useState(initial?.engravingMaskImageUrl ?? "");
  const [printAreaBackgroundImageFile, setPrintAreaBackgroundImageFile] = useState(null);
  const [printAreaBackgroundPreview, setPrintAreaBackgroundPreview] = useState(initial?.printAreaBackgroundImageUrl ?? "");
  const [printAreaBackgroundImageUrl, setPrintAreaBackgroundImageUrl] = useState(initial?.printAreaBackgroundImageUrl ?? "");
  // Mutually exclusive: either 'printing' or 'laser'
  const [mode, setMode] = useState(
    initial?.laserEnabled === true && initial?.printingEnabled === false ? 'laser' : 'printing'
  );

  const [enableBackground, setEnableBackground] = useState(() => {
    if (!initial) return false; // new products: default unchecked
    if (initial.backgroundEnabled !== undefined) return !!initial.backgroundEnabled;
    return initial.backgroundCustomizable === true || initial.backgroundCustomizable === "true";
  });

  const [enableIconsAndText, setEnableIconsAndText] = useState(() => {
    if (!initial) return false; // new products: default unchecked
    if (initial.iconsTextEnabled !== undefined) return !!initial.iconsTextEnabled;
    // Legacy behaviour: printing products always had icons/text enabled.
    return true;
  });

  const [enablePhotoCropping, setEnablePhotoCropping] = useState(() => {
    if (!initial) return false; // new products: default unchecked
    if (initial.photoCroppingEnabled !== undefined) return !!initial.photoCroppingEnabled;
    return initial.backgroundCustomizable === true || initial.backgroundCustomizable === "true";
  });

  const [photoCroppingHeightPx, setPhotoCroppingHeightPx] = useState(() => {
    if (!initial?.photoCroppingHeightPx) return "";
    return String(initial.photoCroppingHeightPx);
  });

  const [photoCroppingWidthPx, setPhotoCroppingWidthPx] = useState(() => {
    if (!initial?.photoCroppingWidthPx) return "";
    return String(initial.photoCroppingWidthPx);
  });

  const resourceOptions = useMemo(() => {
    const merged = new Map();
    [...(resources || []), ...(initial?.resources || [])].forEach((resource) => {
      if (resource?.id) {
        merged.set(resource.id, resource);
      }
    });
    return Array.from(merged.values());
  }, [initial?.resources, resources]);

  const selectedResources = useMemo(
    () =>
      selectedResourceIds
        .map((resourceId) => resourceOptions.find((resource) => resource.id === resourceId))
        .filter(Boolean),
    [resourceOptions, selectedResourceIds],
  );

  const availableResources = useMemo(
    () =>
      resourceOptions.filter(
        (resource) =>
          resource?.id &&
          !selectedResourceIds.includes(resource.id) &&
          resource.status !== "inactive",
      ),
    [resourceOptions, selectedResourceIds],
  );

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((u) => {
        if (typeof u === "string" && u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
      if (typeof configuratorPreview === "string" && configuratorPreview.startsWith("blob:")) URL.revokeObjectURL(configuratorPreview);
      if (typeof baseDevicePreview === "string" && baseDevicePreview.startsWith("blob:")) URL.revokeObjectURL(baseDevicePreview);
      if (typeof engravingMaskPreview === "string" && engravingMaskPreview.startsWith("blob:")) URL.revokeObjectURL(engravingMaskPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (typeof printAreaBackgroundPreview === "string" && printAreaBackgroundPreview.startsWith("blob:")) {
        URL.revokeObjectURL(printAreaBackgroundPreview);
      }
    };
  }, [printAreaBackgroundPreview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setCropFieldErrorHeight("");
    setCropFieldErrorWidth("");
    const t = name.trim();
    if (!t) {
      setError("Name is required.");
      return;
    }
    if (!rangeId) {
      setError("Please select a range.");
      return;
    }
    const hasGallery = imagesFiles.length > 0 || (initial && Array.isArray(initial.images) && initial.images.length > 0);
    const hasConfigurator = !!configuratorImageFile || !!(initial?.configuratorImageUrl);
    if (!initial && !hasGallery && !hasConfigurator) {
      setError("Please upload at least one gallery image or configurator image.");
      return;
    }

    const heightStr = String(photoCroppingHeightPx ?? "").trim();
    const widthStr = String(photoCroppingWidthPx ?? "").trim();
    const heightOk = /^[1-9]\d*$/.test(heightStr);
    const widthOk = /^[1-9]\d*$/.test(widthStr);

    if (mode === "printing" && enablePhotoCropping) {
      if (!heightOk) {
        setCropFieldErrorHeight(heightStr ? "Height must be a positive integer." : "Height is required.");
        setError("Please fix the photo cropping fields.");
        return;
      }
      if (!widthOk) {
        setCropFieldErrorWidth(widthStr ? "Width must be a positive integer." : "Width is required.");
        setError("Please fix the photo cropping fields.");
        return;
      }
    }

    const hasBrokenResourceReference = selectedResourceIds.some(
      (resourceId) => !resourceOptions.some((resource) => resource.id === resourceId),
    );
    if (hasBrokenResourceReference) {
      setError("One or more selected resources are no longer available. Refresh and try again.");
      return;
    }

    onSubmit({
      name: t,
      productCode: productCode.trim(),
      description: description.trim(),
      technicalDetails: technicalDetails.trim(),
      rangeId,
      configurable,
      status,
      resourceIds: selectedResourceIds,
      imagesFiles,
      existingImages,
      configuratorImageFile: configuratorImageFile || undefined,
      baseDeviceImageFile: baseDeviceImageFile || undefined,
      engravingMaskImageFile: mode === 'laser' ? (engravingMaskImageFile || undefined) : undefined,
      printingEnabled: mode === 'printing',
      laserEnabled: mode === 'laser',
      backgroundCustomizable: mode === 'printing',
      // Printing customization options (admin configurable). Only persisted for printing products.
      ...(mode === "printing"
        ? {
            backgroundEnabled: enableBackground,
            iconsTextEnabled: enableIconsAndText,
            photoCroppingEnabled: enablePhotoCropping,
            photoCroppingHeightPx: heightOk ? Number(heightStr) : undefined,
            photoCroppingWidthPx: widthOk ? Number(widthStr) : undefined,
            ...(enableBackground ? {
              printAreaBackgroundImageFile: printAreaBackgroundImageFile || undefined,
              printAreaBackgroundImageUrl: printAreaBackgroundImageUrl || "",
            } : {}),
          }
        : {}),
    });
  };

  const handleAddResource = () => {
    if (!resourceToAdd) return;
    setSelectedResourceIds((current) =>
      current.includes(resourceToAdd) ? current : [...current, resourceToAdd],
    );
    setResourceToAdd("");
  };

  const moveResource = (index, direction) => {
    setSelectedResourceIds((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
          placeholder="e.g. Cable XYZ 2.5mm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product code</label>
        <input
          type="text"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
          placeholder="e.g. iX3-001"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none transition-shadow"
          placeholder="Short product description"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Technical details</label>
        <textarea
          value={technicalDetails}
          onChange={(e) => setTechnicalDetails(e.target.value)}
          rows={4}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none transition-shadow"
          placeholder="Technical specifications, dimensions, etc."
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Range *</label>
        <select
          value={rangeId}
          onChange={(e) => setRangeId(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-shadow"
        >
          <option value="">Select range</option>
          {ranges.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto (for configurator)</label>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
          <span className="text-sm text-slate-500 mt-1">Click to upload configurator image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (configuratorPreview && configuratorPreview.startsWith("blob:")) URL.revokeObjectURL(configuratorPreview);
              setConfiguratorImageFile(file || null);
              setConfiguratorPreview(file ? URL.createObjectURL(file) : (initial?.configuratorImageUrl ?? ""));
            }}
          />
        </label>
        {(configuratorPreview || configuratorImageFile) && (
          <div className="mt-3 flex items-start gap-2">
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
              <img src={configuratorPreview} alt="" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => {
                if (configuratorPreview && configuratorPreview.startsWith("blob:")) URL.revokeObjectURL(configuratorPreview);
                setConfiguratorImageFile(null);
                setConfiguratorPreview(initial?.configuratorImageUrl ?? "");
              }}
              className="mt-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
        <p className="mt-2 text-xs text-slate-500">Optional. Used in the graphic configurator.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto (for gallery)</label>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
          <span className="text-sm text-slate-500 mt-1">Click to upload or drag and drop (adds to existing)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (!files.length) return;
              const newPreviews = files.map((f) => URL.createObjectURL(f));
              setImagesFiles((prev) => [...prev, ...files]);
              setNewImagePreviews((prev) => [...prev, ...newPreviews]);
              e.target.value = "";
            }}
          />
        </label>
        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {existingImages.map((src, idx) => (
              <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-medium">Saved</span>
                <button
                  type="button"
                  onClick={() => {
                    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-white text-sm font-medium hover:bg-red-500/70"
                  aria-label="Remove existing image"
                >
                  Remove
                </button>
              </div>
            ))}
            {newImagePreviews.map((src, idx) => (
              <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-teal-300 bg-slate-50 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">New</span>
                <button
                  type="button"
                  onClick={() => {
                    if (src.startsWith("blob:")) URL.revokeObjectURL(src);
                    setImagesFiles((prev) => prev.filter((_, i) => i !== idx));
                    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-white text-sm font-medium hover:bg-red-500/70"
                  aria-label="Remove new image"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-500">Up to 10 images for gallery. New uploads are added on top of existing images. Hover any image to remove it.</p>
      </div>
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          id="configurable"
          checked={configurable}
          onChange={(e) => setConfigurable(e.target.checked)}
          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
        />
        <label htmlFor="configurable" className="text-sm font-medium text-slate-700">
          Configurable (use in configurator, collections, projects, PDF)
        </label>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Processing type *</label>
        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === 'printing' ? 'bg-teal-50 border-teal-400' : 'bg-slate-50 border-slate-200 hover:border-teal-300'}`}>
          <input
            type="radio"
            name="processingMode"
            value="printing"
            checked={mode === 'printing'}
            onChange={() => setMode('printing')}
            className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500"
          />
          <div>
            <span className="text-sm font-medium text-slate-700">Printing enabled</span>
            <p className="text-xs text-slate-500 mt-0.5">Background layer + colour printing. Users can add background, icons and text (2 layers).</p>
          </div>
        </label>
        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === 'laser' ? 'bg-teal-50 border-teal-400' : 'bg-slate-50 border-slate-200 hover:border-teal-300'}`}>
          <input
            type="radio"
            name="processingMode"
            value="laser"
            checked={mode === 'laser'}
            onChange={() => setMode('laser')}
            className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500"
          />
          <div>
            <span className="text-sm font-medium text-slate-700">Laser / engraving enabled</span>
            <p className="text-xs text-slate-500 mt-0.5">Icons and text tools only. No background layer. Upload an engraving mask below.</p>
          </div>
        </label>
      </div>

      {mode === "printing" && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="text-sm font-semibold text-slate-800">Print Customization Options</div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="enable-background"
              checked={enableBackground}
              onChange={(e) => setEnableBackground(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor="enable-background" className="text-sm font-medium text-slate-800">
                  Enable Background
                </label>
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[10px] text-slate-700 font-semibold"
                  title="When enabled, users can upload and preview a custom background image in the configurator."
                >
                  i
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Control background upload/preview for printing products.
              </p>
            </div>
          </div>

          {enableBackground && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[10px] text-slate-700 font-semibold" title="Upload a default print area background used in the editor. Crop button will auto-crop to configured dimensions.">
                  i
                </span>
                Print Area Background (used in editor)
              </div>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
                <span className="text-sm text-slate-500">Click to upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (printAreaBackgroundPreview && printAreaBackgroundPreview.startsWith("blob:")) {
                      URL.revokeObjectURL(printAreaBackgroundPreview);
                    }
                    const objectUrl = URL.createObjectURL(file);
                    setPrintAreaBackgroundImageFile(file);
                    setPrintAreaBackgroundPreview(objectUrl);
                    setPrintAreaBackgroundImageUrl(printAreaBackgroundImageUrl || "");

                    // Auto-fill crop dimensions from the uploaded image.
                    const img = new window.Image();
                    img.onload = () => {
                      const naturalW = img.naturalWidth;
                      const naturalH = img.naturalHeight;
                      if (naturalW && naturalH) {
                        setPhotoCroppingWidthPx(String(naturalW));
                        setPhotoCroppingHeightPx(String(naturalH));
                        setCropFieldErrorHeight("");
                        setCropFieldErrorWidth("");
                        // Enable cropping so the auto-filled dimensions are visible/usable.
                        setEnablePhotoCropping(true);
                      }
                    };
                    img.src = objectUrl;
                    e.target.value = "";
                  }}
                />
              </label>

              {(printAreaBackgroundPreview || printAreaBackgroundImageFile) && (
                <div className="mt-3 flex items-start gap-2">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                    <img src={printAreaBackgroundPreview} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (printAreaBackgroundPreview && printAreaBackgroundPreview.startsWith("blob:")) URL.revokeObjectURL(printAreaBackgroundPreview);
                      setPrintAreaBackgroundImageFile(null);
                      setPrintAreaBackgroundPreview("");
                      setPrintAreaBackgroundImageUrl("");
                    }}
                    className="mt-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500">
                Uploading here seeds the full background in the configurator. Clicking “Crop background” will auto-crop (no pop-up) to the configured Height/Width (px).
              </p>
            </div>
          )}

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="enable-icons-text"
              checked={enableIconsAndText}
              onChange={(e) => setEnableIconsAndText(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor="enable-icons-text" className="text-sm font-medium text-slate-800">
                  Enable Icons and Text
                </label>
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[10px] text-slate-700 font-semibold"
                  title="When enabled, users can add icons/symbols and edit text (including alignment and formatting) in the configurator."
                >
                  i
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Control icons/text tools for printing products.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="enable-photo-cropping"
              checked={enablePhotoCropping}
              onChange={(e) => {
                setEnablePhotoCropping(e.target.checked);
                setCropFieldErrorHeight("");
                setCropFieldErrorWidth("");
              }}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor="enable-photo-cropping" className="text-sm font-medium text-slate-800">
                  Enable Photo Cropping
                </label>
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[10px] text-slate-700 font-semibold"
                  title="When enabled, users can crop the uploaded background photo. Height and Width (px) are required."
                >
                  i
                </span>
              </div>

              {enablePhotoCropping ? (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={photoCroppingHeightPx}
                      onChange={(e) => setPhotoCroppingHeightPx(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow ${
                        cropFieldErrorHeight ? "border-red-300 bg-red-50/30" : "border-slate-300 bg-white"
                      }`}
                      placeholder="e.g. 600"
                    />
                    {cropFieldErrorHeight && (
                      <p className="mt-1 text-xs text-red-700">{cropFieldErrorHeight}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={photoCroppingWidthPx}
                      onChange={(e) => setPhotoCroppingWidthPx(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow ${
                        cropFieldErrorWidth ? "border-red-300 bg-red-50/30" : "border-slate-300 bg-white"
                      }`}
                      placeholder="e.g. 800"
                    />
                    {cropFieldErrorWidth && (
                      <p className="mt-1 text-xs text-red-700">{cropFieldErrorWidth}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Crop tools are disabled until enabled.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Base device image (Layer 1)</label>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
          <span className="text-sm text-slate-500 mt-1">Click to upload base device image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (baseDevicePreview && baseDevicePreview.startsWith("blob:")) URL.revokeObjectURL(baseDevicePreview);
              setBaseDeviceImageFile(file || null);
              setBaseDevicePreview(file ? URL.createObjectURL(file) : (initial?.baseDeviceImageUrl ?? ""));
            }}
          />
        </label>
        {(baseDevicePreview || baseDeviceImageFile) && (
          <div className="mt-3 flex items-start gap-2">
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
              <img src={baseDevicePreview} alt="" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => {
                if (baseDevicePreview && baseDevicePreview.startsWith("blob:")) URL.revokeObjectURL(baseDevicePreview);
                setBaseDeviceImageFile(null);
                setBaseDevicePreview(initial?.baseDeviceImageUrl ?? "");
              }}
              className="mt-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
        <p className="mt-2 text-xs text-slate-500">
          This image is used as the locked base layer inside the configurator.
        </p>
      </div>
      {mode === 'laser' && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Engraving mask image (white = allowed, black = forbidden)
          </label>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
            <span className="text-sm text-slate-500 mt-1">Click to upload engraving mask</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (engravingMaskPreview && engravingMaskPreview.startsWith("blob:")) URL.revokeObjectURL(engravingMaskPreview);
                setEngravingMaskImageFile(file || null);
                setEngravingMaskPreview(file ? URL.createObjectURL(file) : (initial?.engravingMaskImageUrl ?? ""));
              }}
            />
          </label>
          {(engravingMaskPreview || engravingMaskImageFile) && (
            <div className="mt-3 flex items-start gap-2">
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                <img src={engravingMaskPreview} alt="" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (engravingMaskPreview && engravingMaskPreview.startsWith("blob:")) URL.revokeObjectURL(engravingMaskPreview);
                  setEngravingMaskImageFile(null);
                  setEngravingMaskPreview(initial?.engravingMaskImageUrl ?? "");
                }}
                className="mt-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Used to validate engraving area in real time and during server-side export. White = allowed, black = forbidden.
          </p>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-shadow"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Documentation Resources
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Upload files once in Resources / Documentation Attachments, then link them here.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {selectedResourceIds.length} linked
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={resourceToAdd}
            onChange={(e) => setResourceToAdd(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Add existing resource</option>
            {availableResources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} {resource.type ? `(${resource.type})` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddResource}
            disabled={!resourceToAdd}
            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Link resource
          </button>
        </div>

        {selectedResources.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm text-slate-500">
            No documentation linked yet.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {selectedResources.map((resource, index) => (
              <li
                key={resource.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{resource.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {resource.type || "Documentation"} {resource.size ? `• ${resource.size}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveResource(index, -1)}
                    disabled={index === 0}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveResource(index, 1)}
                    disabled={index === selectedResources.length - 1}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedResourceIds((current) =>
                        current.filter((resourceId) => resourceId !== resource.id),
                      )
                    }
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    Unlink
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-3 pt-2 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
  const [resources, setResources] = useState([]);

  const loadResources = useCallback(async () => {
    try {
      const response = await apiService.resources.list({});
      const items = response?.resources || response?.materials || [];
      setResources(
        items.map((resource) => ({
          ...resource,
          id: resource._id || resource.id,
          name: resource.name || "",
          type: resource.type || "",
          status: resource.status || "active",
          size: resource.size || "",
        })),
      );
    } catch (e) {
      setError(e?.message || "Failed to load resources");
    }
  }, []);

  useEffect(() => {
    loadAdminCatalog();
    loadResources();
  }, [loadAdminCatalog, loadResources]);

  const activeRanges = (ranges || []).filter((r) => r.status === "active");

  const productRows = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        range: getAdminRangeById ? getAdminRangeById(p.rangeId) : null,
        resourceCount: Array.isArray(p.resourceIds)
          ? p.resourceIds.length
          : Array.isArray(p.resources)
            ? p.resources.length
            : 0,
      })),
    [products, getAdminRangeById],
  );

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
    <div className="p-6 md:p-8 min-h-full bg-slate-50">
      <DashboardHeader 
        title="Products" 
        subtitle="Create, edit, and delete products. Assign ranges, product types, and reusable documentation resources."
        showHomeButton={true}
      />
      {error && !deleting && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-600 mt-1">Create, edit, and delete products. Link shared documentation resources instead of uploading files per product.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={activeRanges.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
            >
              Create your first product
            </button>
          </div>
        ) : (
          <>
            {productRows.length <= 40 ? (
              <ul className="divide-y divide-slate-200">
                {productRows.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                  >
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
                        <p className="text-sm text-slate-500 truncate">
                          {p.description || "—"}
                        </p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {p.productCode && (
                            <span className="text-xs text-teal-600 font-medium">
                              {p.productCode}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {p.range?.name ?? "—"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {p.resourceCount} resources
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              p.configurable
                                ? "bg-teal-100 text-teal-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {p.configurable ? "Configurable" : "Normal"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              p.status === "active"
                                ? "bg-teal-100 text-teal-800"
                                : p.status === "draft"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditing(p)}
                        className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
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
                ))}
              </ul>
            ) : (
              <List
                height={600}
                itemCount={productRows.length}
                itemSize={80}
                width="100%"
              >
                {({ index, style }) => {
                  const p = productRows[index];
                  return (
                    <div
                      style={style}
                      key={p.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 border-b border-slate-200 last:border-b-0"
                    >
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
                          <p className="text-sm text-slate-500 truncate">
                            {p.description || "—"}
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {p.productCode && (
                              <span className="text-xs text-teal-600 font-medium">
                                {p.productCode}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              {p.range?.name ?? "—"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {p.resourceCount} resources
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                p.configurable
                                  ? "bg-teal-100 text-teal-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {p.configurable ? "Configurable" : "Normal"}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                p.status === "active"
                                  ? "bg-teal-100 text-teal-800"
                                  : p.status === "draft"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditing(p)}
                          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
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
                    </div>
                  );
                }}
              </List>
            )}
          </>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} size="xl" scrollable>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Create product</h2>
        <p className="text-sm text-slate-500 mb-5">Add a new product to a range.</p>
        <ProductForm
          ranges={activeRanges}
          resources={resources}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={loading}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} size="xl" scrollable>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Edit product</h2>
        <p className="text-sm text-slate-500 mb-5">{editing?.name && `Editing: ${editing.name}`}</p>
        {editing && (
          <ProductForm
            initial={editing}
            ranges={ranges || []}
            resources={resources}
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
