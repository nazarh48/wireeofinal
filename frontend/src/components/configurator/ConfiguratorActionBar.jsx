import useStore from '../../store/useStore';
import {
  exportLayerPng,
  exportFullCompositionPng,
  exportConfigJson,
  exportConfiguratorPdf,
} from '../../services/exportService';

const ConfiguratorActionBar = ({ stageRef, canvasInfo }) => {
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

  const selectedIds = configurator.selectedElementIds || [];
  const history = configurator.history || [];
  const historyIndex = configurator.historyIndex ?? -1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedIds.length > 0;

  const product = configurator.product || null;
  const canExport = Boolean(stageRef?.current && product);
  const backgroundCustomizable =
    product?.backgroundCustomizable === true ||
    product?.backgroundCustomizable === 'true';

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
    <div className="h-20 bg-[#f0f7f2] border-t border-teal-200 flex items-center justify-between gap-4 px-4">
      {/* Editing controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
        >
          Redo
        </button>
        <button
          onClick={duplicateSelection}
          disabled={!hasSelection}
          className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
        >
          Duplicate
        </button>
        <button
          onClick={() => selectedIds.forEach((id) => bringToFront(id))}
          disabled={!hasSelection}
          className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
        >
          Bring to top
        </button>
        <button
          onClick={deleteSelected}
          disabled={!hasSelection}
          className="h-8 px-3 text-xs border border-red-200 bg-red-50 text-red-700 disabled:opacity-40 hover:bg-red-100"
        >
          Delete
        </button>
        <button
          onClick={rotateSelection}
          disabled={!hasSelection}
          className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
        >
          Rotate
        </button>
      </div>

      {/* Layer exports, background tools & dimensions */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportLayerPng(stageRef.current, '.base-layer', 'layer1-device.png')}
            disabled={!canExport}
            className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
          >
            Layer 1 PNG
          </button>
          {backgroundCustomizable && (
            <button
              onClick={() => exportLayerPng(stageRef.current, '.background-layer', 'layer2-background.png')}
              disabled={!canExport}
              className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
            >
              Layer 2 PNG
            </button>
          )}
          <button
            onClick={() => exportLayerPng(stageRef.current, '.mask-layer', 'layer3-engraving-mask.png')}
            disabled={!canExport}
            className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
          >
            Layer 3 PNG
          </button>
          <button
            onClick={() => exportLayerPng(stageRef.current, '.user-layer', 'layer4-user.png')}
            disabled={!canExport}
            className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
          >
            Layer 4 PNG
          </button>
          <button
            onClick={() => exportFullCompositionPng(stageRef.current, 'composition.png')}
            disabled={!canExport}
            className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
          >
            Full PNG
          </button>
          <button
            onClick={() => {
              const config = {
                version: 'editor-v2',
                exportedAt: new Date().toISOString(),
                productId: product?.id,
                productName: product?.name,
                processingType: configurator.configuration?.processingType,
                elements: configurator.elements || [],
                configuration: configurator.configuration || {},
              };
              exportConfigJson(config, 'configuration.json');
            }}
            disabled={!product}
            className="h-8 px-3 text-xs border border-teal-200 bg-white disabled:opacity-40 hover:bg-teal-50 text-teal-800"
          >
            JSON
          </button>
          <button
            onClick={() => {
              const pdfConfig = {
                capabilityType: configurator.configuration?.processingType || 'Colour printing',
                elements: configurator.elements || [],
                configurationCode: configurator.configuration?.id,
                backgroundFileName: configurator.configuration?.backgroundFileName || '',
              };
              exportConfiguratorPdf({
                stage: stageRef.current,
                device: product || { name: 'Product' },
                config: pdfConfig,
              });
            }}
            disabled={!canExport}
            className="h-8 px-3 text-xs border border-teal-200 bg-teal-600 text-white disabled:opacity-40 hover:bg-teal-700"
          >
            PDF
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {backgroundCustomizable ? (
            <>
              <label className="h-8 px-3 text-xs border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 cursor-pointer flex items-center">
                <span>Upload background</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === 'string' ? reader.result : null;
                      if (result) {
                        updateConfiguratorConfiguration({
                          backgroundImage: result,
                          backgroundFileName: file.name,
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                onClick={() =>
                  updateConfiguratorConfiguration({
                    backgroundImage: null,
                    backgroundFileName: '',
                  })
                }
                className="h-8 px-3 text-xs border border-teal-200 bg-white hover:bg-teal-50 text-teal-800"
              >
                Clear background
              </button>
            </>
          ) : (
            <span className="text-[10px] text-[#9ca3af] italic">
              This product is not available for background customization.
            </span>
          )}

          <div className="flex items-center gap-1 text-[10px] text-[#4b5563]">
            <span className="font-semibold mr-1">Layers:</span>
            <span className="px-2 py-0.5 border border-[#d1d5db] rounded bg-white">1 · Device photo</span>
            <span className={`px-2 py-0.5 border border-[#d1d5db] rounded ${backgroundCustomizable ? 'bg-teal-50' : 'bg-white'}`}>
              2 · Background
            </span>
            <span className="px-2 py-0.5 border border-[#d1d5db] rounded">
              3 · Engraving zone
            </span>
            <span className="px-2 py-0.5 border border-[#d1d5db] rounded">
              4 · Icons &amp; text
            </span>
            {canvasInfo && (
              <>
                <span className="ml-2 h-3 w-px bg-[#d1d5db]" />
                <span className="px-2 py-0.5 border border-[#e5e7eb] rounded bg-white text-[#6b7280]">
                  Base photo: {canvasInfo.baseImageWidth || 0} × {canvasInfo.baseImageHeight || 0} px
                </span>
                <span className="px-2 py-0.5 border border-[#e5e7eb] rounded bg-white text-[#6b7280]">
                  Editor window: {canvasInfo.canvasWidth} × {canvasInfo.canvasHeight} px
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
