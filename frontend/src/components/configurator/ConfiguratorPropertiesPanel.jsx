import { useState } from 'react';
import useStore from '../../store/useStore';
import { buildColoredSvgDataUrl, isSvgAssetUrl } from '../../utils/svgIconColor';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Verdana', 'Georgia', 'Tahoma'];

const ConfiguratorPropertiesPanel = ({ canvasInfo }) => {
  const {
    configurator,
    updateElement,
    setSelectedElements,
    updateConfiguratorConfiguration,
  } = useStore();
  const [counterSettings, setCounterSettings] = useState({
    prefix: 'Prefix_',
    format: '0000',
    suffix: '_Suffix',
    start: '1',
    step: '1',
    end: '1',
    quantity: '1',
  });

  const selectedIds = configurator.selectedElementIds || [];
  const selectedElement = selectedIds.length > 0
    ? configurator.elements.find((el) => el.id === selectedIds[0])
    : null;

  const backgroundSelected = configurator.backgroundSelected;
  const effectiveCanvasWidth = configurator.configuration?.canvasWidth || CANVAS_WIDTH;
  const effectiveCanvasHeight = configurator.configuration?.canvasHeight || CANVAS_HEIGHT;
  const backgroundWidth = configurator.configuration?.backgroundWidth || effectiveCanvasWidth;
  const backgroundHeight = configurator.configuration?.backgroundHeight || effectiveCanvasHeight;
  const colorizableImageSource = selectedElement?.originalSrc || selectedElement?.src || '';
  const canColorizeSelectedImage =
    selectedElement?.type === 'image' &&
    (selectedElement?.svgMarkup || isSvgAssetUrl(colorizableImageSource));
  const supportsColorControls =
    selectedElement &&
    (
      selectedElement.type === 'text' ||
      selectedElement.type === 'mdiIcon' ||
      selectedElement.type === 'rectangle' ||
      selectedElement.type === 'circle' ||
      selectedElement.type === 'line' ||
      selectedElement.type === 'arrow' ||
      selectedElement.type === 'pen' ||
      canColorizeSelectedImage
    );

  const applyToSelected = (updates) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => updateElement(id, updates));
  };

  const handleCanvasDimensionChange = (key, value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    updateConfiguratorConfiguration({
      [key]: numeric,
    });
  };

  const align = (mode) => {
    if (!selectedElement) return;
    if (mode === 'left') applyToSelected({ x: 0 });
    if (mode === 'center') applyToSelected({ x: (CANVAS_WIDTH - (selectedElement.width || 120)) / 2 });
    if (mode === 'right') applyToSelected({ x: CANVAS_WIDTH - (selectedElement.width || 120) });
    if (mode === 'top') applyToSelected({ y: 0 });
    if (mode === 'middle') applyToSelected({ y: (CANVAS_HEIGHT - (selectedElement.height || 50)) / 2 });
    if (mode === 'bottom') applyToSelected({ y: CANVAS_HEIGHT - (selectedElement.height || 50) });
  };

  const updateSelectedSvgIcon = async (changes) => {
    if (!selectedElement || !canColorizeSelectedImage) return;

    let svgMarkup = selectedElement.svgMarkup || '';
    if (!svgMarkup) {
      try {
        const response = await fetch(colorizableImageSource);
        if (!response.ok) return;
        svgMarkup = await response.text();
      } catch {
        return;
      }
    }

    const nextFill = changes.fill ?? selectedElement.fill ?? '#111827';
    const nextStroke = changes.stroke ?? selectedElement.stroke ?? nextFill;

    applyToSelected({
      ...changes,
      svgMarkup,
      isColorizableIcon: true,
      originalSrc: selectedElement.originalSrc || colorizableImageSource,
      src: buildColoredSvgDataUrl(svgMarkup, nextFill, nextStroke),
    });
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="px-4 py-3 border-b border-teal-200/60">
        <div className="text-[10px] uppercase tracking-wide text-teal-700/70">Properties</div>
        <div className="text-xs text-teal-800/80 mt-0.5">
          {selectedElement ? `${selectedIds.length} selected` : 'Select an object'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selectedElement && !backgroundSelected && (
          <>
            <div className="text-sm text-[#8b9199]">
              Click an element on canvas to edit position, style and alignment.
            </div>

            <div className="mt-4 space-y-3 rounded-md border border-[#cfd3d9] bg-white p-3">
              <div className="text-xs font-semibold text-[#4b5563]">Canvas</div>
              <div className="text-[11px] text-[#6b7280] mb-1">
                Editor art board size (in pixels).
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-[#77808a]">
                  Width
                  <input
                    type="number"
                    value={Math.round(effectiveCanvasWidth)}
                    onChange={(e) => handleCanvasDimensionChange('canvasWidth', e.target.value)}
                    className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                    min={50}
                  />
                </label>
                <label className="text-xs text-[#77808a]">
                  Height
                  <input
                    type="number"
                    value={Math.round(effectiveCanvasHeight)}
                    onChange={(e) => handleCanvasDimensionChange('canvasHeight', e.target.value)}
                    className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                    min={50}
                  />
                </label>
              </div>
              {canvasInfo && (
                <div className="mt-2 text-[11px] text-[#6b7280] space-y-1">
                  <div>
                    <span className="font-semibold">Base photo:</span>{' '}
                    {canvasInfo.baseImageWidth || 0} × {canvasInfo.baseImageHeight || 0} px
                  </div>
                  <div>
                    <span className="font-semibold">Editor window:</span>{' '}
                    {canvasInfo.canvasWidth || effectiveCanvasWidth} ×{' '}
                    {canvasInfo.canvasHeight || effectiveCanvasHeight} px
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {backgroundSelected && !selectedElement && (
          <div className="space-y-3 rounded-md border border-[#cfd3d9] bg-white p-3">
            <div className="text-xs font-semibold text-[#4b5563]">Background image</div>
            <div className="text-[11px] text-[#6b7280] mb-1">
              Adjust the size of the uploaded background within the canvas.
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#77808a]">
                Width
                <input
                  type="number"
                  value={Math.round(backgroundWidth)}
                  onChange={(e) => handleCanvasDimensionChange('backgroundWidth', e.target.value)}
                  className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                  min={10}
                />
              </label>
              <label className="text-xs text-[#77808a]">
                Height
                <input
                  type="number"
                  value={Math.round(backgroundHeight)}
                  onChange={(e) => handleCanvasDimensionChange('backgroundHeight', e.target.value)}
                  className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                  min={10}
                />
              </label>
            </div>
          </div>
        )}

        {selectedElement && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#77808a]">
                X
                <input
                  type="number"
                  value={Math.round(selectedElement.x || 0)}
                  onChange={(e) => applyToSelected({ x: Number(e.target.value) })}
                  className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                />
              </label>
              <label className="text-xs text-[#77808a]">
                Y
                <input
                  type="number"
                  value={Math.round(selectedElement.y || 0)}
                  onChange={(e) => applyToSelected({ y: Number(e.target.value) })}
                  className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#77808a]">
                Width
                <input
                  type="number"
                  value={Math.round(selectedElement.width || 120)}
                  onChange={(e) => applyToSelected({ width: Number(e.target.value) })}
                  className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                />
              </label>
              <label className="text-xs text-[#77808a]">
                Height
                <input
                  type="number"
                  value={Math.round(selectedElement.height || 50)}
                  onChange={(e) => applyToSelected({ height: Number(e.target.value) })}
                  className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                />
              </label>
            </div>

            <label className="text-xs text-[#77808a] block">
              Rotation
              <div className="flex gap-2 mt-1">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedElement.rotation || 0}
                  onChange={(e) => applyToSelected({ rotation: Number(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={Math.round(selectedElement.rotation || 0)}
                  onChange={(e) => applyToSelected({ rotation: Number(e.target.value) })}
                  className="w-16 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                />
              </div>
            </label>

            {selectedElement.type === 'text' && (
              <>
                <label className="text-xs text-[#77808a] block">
                  Text
                  <input
                    type="text"
                    value={selectedElement.text || ''}
                    onChange={(e) => applyToSelected({ text: e.target.value })}
                    className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-[#77808a]">
                    Font
                    <select
                      value={selectedElement.fontFamily || 'Arial'}
                      onChange={(e) => applyToSelected({ fontFamily: e.target.value })}
                      className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                    >
                      {fontFamilies.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-[#77808a]">
                    Size
                    <input
                      type="number"
                      value={selectedElement.fontSize || 24}
                      onChange={(e) => applyToSelected({ fontSize: Number(e.target.value) })}
                      className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-sm"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => applyToSelected({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`h-8 w-8 border text-sm ${selectedElement.fontWeight === 'bold' ? 'bg-[#dde8f3] border-[#9db6cd]' : 'bg-white border-[#cfd3d9]'}`}
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    onClick={() => applyToSelected({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`h-8 w-8 border text-sm italic ${selectedElement.fontStyle === 'italic' ? 'bg-[#dde8f3] border-[#9db6cd]' : 'bg-white border-[#cfd3d9]'}`}
                    title="Italic"
                  >
                    I
                  </button>
                  <button onClick={() => applyToSelected({ align: 'left' })} className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs">L</button>
                  <button onClick={() => applyToSelected({ align: 'center' })} className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs">C</button>
                  <button onClick={() => applyToSelected({ align: 'right' })} className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs">R</button>
                </div>
              </>
            )}

            {selectedElement.type === 'mdiIcon' && (
              <label className="text-xs text-[#77808a] block">
                Icon size
                <input
                  type="range"
                  min="14"
                  max="120"
                  value={selectedElement.width || 34}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    applyToSelected({ width: size, height: size });
                  }}
                  className="w-full mt-2"
                />
              </label>
            )}

            {supportsColorControls && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-[#77808a]">
                  {selectedElement.type === 'text' ? 'Text Color' : 'Fill Color'}
                  <input
                    type="color"
                    value={selectedElement.fill || selectedElement.color || '#000000'}
                    onChange={(e) => {
                      const nextColor = e.target.value;

                      if (selectedElement.type === 'text') {
                        applyToSelected({ color: nextColor });
                        return;
                      }

                      if (canColorizeSelectedImage) {
                        updateSelectedSvgIcon({ fill: nextColor });
                        return;
                      }

                      applyToSelected({ fill: nextColor });
                    }}
                    className="w-full mt-1 h-8 border border-[#cfd3d9] bg-white"
                  />
                </label>
                <label className="text-xs text-[#77808a]">
                  Stroke Color
                  <input
                    type="color"
                    value={selectedElement.stroke || '#000000'}
                    onChange={(e) => {
                      const nextStroke = e.target.value;

                      if (canColorizeSelectedImage) {
                        updateSelectedSvgIcon({ stroke: nextStroke });
                        return;
                      }

                      applyToSelected({ stroke: nextStroke });
                    }}
                    className="w-full mt-1 h-8 border border-[#cfd3d9] bg-white"
                  />
                </label>
              </div>
            )}

            <div>
              <div className="text-xs text-[#77808a] mb-2">Alignment</div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => align('left')} className="h-8 border border-[#cfd3d9] bg-white text-xs hover:bg-[#f9fbfd]">Left</button>
                <button onClick={() => align('center')} className="h-8 border border-[#cfd3d9] bg-white text-xs hover:bg-[#f9fbfd]">Center</button>
                <button onClick={() => align('right')} className="h-8 border border-[#cfd3d9] bg-white text-xs hover:bg-[#f9fbfd]">Right</button>
                <button onClick={() => align('top')} className="h-8 border border-[#cfd3d9] bg-white text-xs hover:bg-[#f9fbfd]">Top</button>
                <button onClick={() => align('middle')} className="h-8 border border-[#cfd3d9] bg-white text-xs hover:bg-[#f9fbfd]">Middle</button>
                <button onClick={() => align('bottom')} className="h-8 border border-[#cfd3d9] bg-white text-xs hover:bg-[#f9fbfd]">Bottom</button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e1e3e7] space-y-2">
              <div className="text-xs text-[#77808a]">Counter / Numbering</div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={counterSettings.prefix}
                  onChange={(e) => setCounterSettings((p) => ({ ...p, prefix: e.target.value }))}
                  className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs"
                  placeholder="Prefix"
                />
                <input
                  value={counterSettings.format}
                  onChange={(e) => setCounterSettings((p) => ({ ...p, format: e.target.value }))}
                  className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs"
                  placeholder="Format"
                />
                <input
                  value={counterSettings.suffix}
                  onChange={(e) => setCounterSettings((p) => ({ ...p, suffix: e.target.value }))}
                  className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs"
                  placeholder="Suffix"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <input
                  value={counterSettings.start}
                  onChange={(e) => setCounterSettings((p) => ({ ...p, start: e.target.value }))}
                  className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs"
                  placeholder="Start"
                />
                <input
                  value={counterSettings.step}
                  onChange={(e) => setCounterSettings((p) => ({ ...p, step: e.target.value }))}
                  className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs"
                  placeholder="Step"
                />
                <input
                  value={counterSettings.end}
                  onChange={(e) => setCounterSettings((p) => ({ ...p, end: e.target.value }))}
                  className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs"
                  placeholder="End"
                />
                <input
                  value={counterSettings.quantity}
                  onChange={(e) => setCounterSettings((p) => ({ ...p, quantity: e.target.value }))}
                  className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs"
                  placeholder="Qty"
                />
              </div>
              <button
                onClick={() => applyToSelected({
                  prefix: counterSettings.prefix,
                  format: counterSettings.format,
                  suffix: counterSettings.suffix,
                  counterStart: Number(counterSettings.start) || 1,
                  counterStep: Number(counterSettings.step) || 1,
                  counterEnd: Number(counterSettings.end) || 1,
                  quantity: Number(counterSettings.quantity) || 1,
                })}
                className="h-8 px-3 border border-[#cfd3d9] bg-white hover:bg-[#f8fafc] text-xs text-[#5f6772]"
              >
                Apply numbering options
              </button>
            </div>

            <div className="pt-2 border-t border-[#e1e3e7]">
              <button
                onClick={() => setSelectedElements([])}
                className="w-full h-8 border border-[#cfd3d9] bg-white hover:bg-[#f9fbfd] text-xs text-[#5f6772]"
              >
                Clear selection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfiguratorPropertiesPanel;
