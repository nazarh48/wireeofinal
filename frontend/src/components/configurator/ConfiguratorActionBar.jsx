import { useState } from 'react';
import useStore from '../../store/useStore';
import {
  cropBackgroundToFrame,
  getCenteredBackgroundCropPlacement,
} from './utils/backgroundCropUtils';

const ConfiguratorActionBar = ({ stageRef, canvasInfo, onOpenCrop }) => {
  const {
    configurator,
    undo,
    redo,
    copyElements,
    pasteElementsAt,
    bringToFront,
    deleteSelected,
    updateElement,
    updateConfiguratorConfiguration,
  } = useStore();

  const [isCroppingBackground, setIsCroppingBackground] = useState(false);

  const selectedIds = configurator.selectedElementIds || [];
  const history = configurator.history || [];
  const historyIndex = configurator.historyIndex ?? -1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedIds.length > 0;

  const product = configurator.product || null;
  const asBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
  const isPrintingProduct = product?.printingEnabled === true || product?.printingEnabled === 'true';

  // Printing-only background controls.
  const backgroundEnabled = isPrintingProduct
    ? (product?.backgroundEnabled !== undefined
      ? asBool(product?.backgroundEnabled)
      : asBool(product?.backgroundCustomizable))
    : false;
  const hasBackground = Boolean(configurator.configuration?.backgroundImage);

  // Photo cropping is also printing-only.
  const photoCroppingEnabledExplicit = product?.photoCroppingEnabled !== undefined;
  const photoCroppingEnabled = isPrintingProduct
    ? (photoCroppingEnabledExplicit ? asBool(product?.photoCroppingEnabled) : true)
    : false;

  const cropHeightPx = product?.photoCroppingHeightPx;
  const cropWidthPx = product?.photoCroppingWidthPx;
  const parsedCropHeight = cropHeightPx !== undefined && cropHeightPx !== null ? Number(cropHeightPx) : NaN;
  const parsedCropWidth = cropWidthPx !== undefined && cropWidthPx !== null ? Number(cropWidthPx) : NaN;
  const hasValidCropDims =
    Number.isInteger(parsedCropHeight) && parsedCropHeight > 0 &&
    Number.isInteger(parsedCropWidth) && parsedCropWidth > 0;

  // Backward compatibility:
  // - If photoCroppingEnabled field is missing (legacy product), don't require dims.
  // - Once admin explicitly enables cropping, enforce positive integer dims.
  const requireCropDims = photoCroppingEnabledExplicit && photoCroppingEnabled === true;
  const canCropBackground = backgroundEnabled && photoCroppingEnabled && (!requireCropDims || hasValidCropDims);

  const canvasW = canvasInfo?.canvasWidth ?? configurator.configuration?.canvasWidth ?? 800;
  const canvasH = canvasInfo?.canvasHeight ?? configurator.configuration?.canvasHeight ?? 600;

  const getBackgroundDims = () => {
    const bgW = Number.isFinite(Number(configurator.configuration?.backgroundWidth))
      ? Number(configurator.configuration?.backgroundWidth)
      : canvasW;
    const bgH = Number.isFinite(Number(configurator.configuration?.backgroundHeight))
      ? Number(configurator.configuration?.backgroundHeight)
      : canvasH;
    return { bgW, bgH };
  };

  const getBackgroundPosition = () => {
    const { bgW, bgH } = getBackgroundDims();
    const bgX = Number.isFinite(Number(configurator.configuration?.backgroundX))
      ? Number(configurator.configuration?.backgroundX)
      : (canvasW - bgW) / 2;
    const bgY = Number.isFinite(Number(configurator.configuration?.backgroundY))
      ? Number(configurator.configuration?.backgroundY)
      : (canvasH - bgH) / 2;
    return { bgX, bgY };
  };

  const alignBackgroundCenters = () => {
    if (!hasBackground) return;
    const { bgW, bgH } = getBackgroundDims();
    updateConfiguratorConfiguration({
      backgroundX: (canvasW - bgW) / 2,
      backgroundY: (canvasH - bgH) / 2,
    });
  };

  const fitCanvasToScreen = () => {
    stageRef?.current?.fitToScreen?.();
  };

  const autoCropBackgroundToConfiguredDims = async () => {
    if (!hasBackground) return;
    if (!hasValidCropDims) {
      // Legacy fallback: open the old modal when dims aren't available.
      onOpenCrop?.();
      return;
    }

    const source = configurator.configuration?.backgroundImage;
    const targetW = parsedCropWidth;
    const targetH = parsedCropHeight;

    if (!source || !targetW || !targetH) {
      onOpenCrop?.();
      return;
    }

    setIsCroppingBackground(true);
    try {
      const { bgW, bgH } = getBackgroundDims();
      const { bgX, bgY } = getBackgroundPosition();
      const { x: nextBgX, y: nextBgY } = getCenteredBackgroundCropPlacement({
        canvasWidth: canvasW,
        canvasHeight: canvasH,
        baseImageWidth: canvasInfo?.baseImageWidth,
        baseImageHeight: canvasInfo?.baseImageHeight,
        targetWidth: targetW,
        targetHeight: targetH,
      });
      const croppedDataUrl = await cropBackgroundToFrame({
        imageSrc: source,
        backgroundX: bgX,
        backgroundY: bgY,
        backgroundWidth: bgW,
        backgroundHeight: bgH,
        cropX: nextBgX,
        cropY: nextBgY,
        targetWidth: targetW,
        targetHeight: targetH,
      });

      const prevFileName = configurator.configuration?.backgroundFileName || '';
      const baseName = prevFileName
        ? String(prevFileName).replace(/\.[^/.]+$/, '')
        : 'background';
      const nextFileName = `${baseName}_cropped_${targetW}x${targetH}.png`;

      updateConfiguratorConfiguration({
        backgroundImage: croppedDataUrl,
        backgroundFileName: nextFileName,
        backgroundX: nextBgX,
        backgroundY: nextBgY,
        backgroundWidth: targetW,
        backgroundHeight: targetH,
      });
    } catch (err) {
      // If auto-crop fails (e.g. CORS/tainted canvas), fall back to modal.
      onOpenCrop?.();
    } finally {
      setIsCroppingBackground(false);
    }
  };

  const duplicateSelection = () => {
    if (!hasSelection) return;
    copyElements();
    pasteElementsAt(30, 30);
  };

  const rotateSelection = () => {
    if (!hasSelection) return;
    selectedIds.forEach((id) => {
      const element = configurator.elements.find((el) => el.id === id);
      if (!element) return;
      updateElement(id, { rotation: ((element.rotation || 0) + 15) % 360 });
    });
  };

  return (
    <div className="border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur">
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:opacity-40"
          >
            Redo
          </button>
          <button
            onClick={duplicateSelection}
            disabled={!hasSelection}
            className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:opacity-40"
          >
            Duplicate
          </button>
          <button
            onClick={() => selectedIds.forEach((id) => bringToFront(id))}
            disabled={!hasSelection}
            className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:opacity-40"
          >
            Bring to top
          </button>
          <button
            onClick={deleteSelected}
            disabled={!hasSelection}
            className="h-7 rounded-lg border border-red-200 bg-red-50 px-3 text-[11px] text-red-700 transition-colors hover:bg-red-100 disabled:opacity-40"
          >
            Delete
          </button>
          <button
            onClick={rotateSelection}
            disabled={!hasSelection}
            className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:opacity-40"
          >
            Rotate
          </button>

          <span className="mx-1 h-5 w-px bg-slate-200" />

          {backgroundEnabled ? (
            <>
              {onOpenCrop && photoCroppingEnabled && (
                <button
                  type="button"
                  onClick={autoCropBackgroundToConfiguredDims}
                  disabled={!hasBackground || !canCropBackground || isCroppingBackground}
                  className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title={!canCropBackground ? "Cropping requires valid Height/Width (px) settings." : undefined}
                >
                  {isCroppingBackground ? 'Cropping…' : 'Crop background'}
                </button>
              )}

              {hasBackground && (
                <button
                  type="button"
                  onClick={alignBackgroundCenters}
                  disabled={!hasBackground}
                  className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Align background to the base device image center."
                >
                  Align centers
                </button>
              )}

              <button
                type="button"
                onClick={fitCanvasToScreen}
                disabled={isCroppingBackground}
                className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                title="Fit edited product to screen."
              >
                Fit to screen
              </button>

              <label
                className={`flex h-7 cursor-pointer items-center rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 ${
                  !backgroundEnabled ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <span>Upload background</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!backgroundEnabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!backgroundEnabled) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === 'string' ? reader.result : null;
                      if (result) {
                        // Keep uploaded background fully loaded at its intrinsic dimensions.
                        const img = new window.Image();
                        img.onload = () => {
                          const nextBgW = img.naturalWidth || img.width || canvasW;
                          const nextBgH = img.naturalHeight || img.height || canvasH;
                          const nextBgX = (canvasW - nextBgW) / 2;
                          const nextBgY = (canvasH - nextBgH) / 2;
                          updateConfiguratorConfiguration({
                            backgroundImage: result,
                            backgroundFileName: file.name,
                            backgroundWidth: nextBgW,
                            backgroundHeight: nextBgH,
                            backgroundX: nextBgX,
                            backgroundY: nextBgY,
                          });
                        };
                        img.src = result;
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                onClick={() => {
                  if (!hasBackground) return;
                  const confirmed = window.confirm(
                    'Remove the current background from this configuration?',
                  );
                  if (!confirmed) return;

                  updateConfiguratorConfiguration({
                    backgroundImage: null,
                    backgroundFileName: '',
                    backgroundX: (canvasW - canvasW) / 2,
                    backgroundY: (canvasH - canvasH) / 2,
                  });
                }}
                disabled={!hasBackground}
                className="h-7 rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear background
              </button>
            </>
          ) : (
            <span className="text-[10px] italic text-[#9ca3af]">
              No background customization
            </span>
          )}

          <span className="mx-1 h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-1 text-[10px] text-[#4b5563]">
            {canvasInfo && (
              <>
                <span className="ml-2 h-3 w-px bg-[#d1d5db]" />
                <span className="rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[#6b7280]">
                  Base: {canvasInfo.baseImageWidth || 0} × {canvasInfo.baseImageHeight || 0}
                </span>
                <span className="rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[#6b7280]">
                  Canvas: {canvasInfo.canvasWidth} × {canvasInfo.canvasHeight}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorActionBar;
