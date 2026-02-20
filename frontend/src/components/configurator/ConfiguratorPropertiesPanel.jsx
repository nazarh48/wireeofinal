import { useState } from 'react';
import useStore from '../../store/useStore';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Verdana', 'Georgia', 'Tahoma'];

const ConfiguratorPropertiesPanel = () => {
  const {
    configurator,
    updateElement,
    setSelectedElements,
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

  const applyToSelected = (updates) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => updateElement(id, updates));
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

  return (
    <div className="h-full flex flex-col bg-[#f0f7f2] border-l border-teal-200/60">
      <div className="px-4 py-3 border-b border-teal-200/60">
        <div className="text-[10px] uppercase tracking-wide text-teal-700/70">Properties</div>
        <div className="text-xs text-teal-800/80 mt-0.5">
          {selectedElement ? `${selectedIds.length} selected` : 'Select an object'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selectedElement && (
          <div className="text-sm text-[#8b9199]">
            Click an element on canvas to edit position, style and alignment.
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

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#77808a]">
                Fill / Text Color
                <input
                  type="color"
                  value={selectedElement.fill || selectedElement.color || '#000000'}
                  onChange={(e) => {
                    if (selectedElement.type === 'text') applyToSelected({ color: e.target.value });
                    else applyToSelected({ fill: e.target.value });
                  }}
                  className="w-full mt-1 h-8 border border-[#cfd3d9] bg-white"
                />
              </label>
              <label className="text-xs text-[#77808a]">
                Stroke Color
                <input
                  type="color"
                  value={selectedElement.stroke || '#000000'}
                  onChange={(e) => applyToSelected({ stroke: e.target.value })}
                  className="w-full mt-1 h-8 border border-[#cfd3d9] bg-white"
                />
              </label>
            </div>

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
