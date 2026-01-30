import { useState } from 'react';
import useStore from '../../store/useStore';
import { STICKERS, getStickersByCategory, getAllCategories } from './utils/stickers';
import { exportAsPNG, exportAsJPG, exportAsSVG, exportAsJSON, importFromJSON } from './utils/exportUtils';

const EnhancedToolbar = ({ stageRef, canvasWidth = 800, canvasHeight = 600 }) => {
  const {
    configurator,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    setActiveTool,
    undo,
    redo,
    importTemplate,
    clearAllElements,
  } = useStore();

  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [opacity, setOpacity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('tools');
  const [stickerCategory, setStickerCategory] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const activeTool = configurator.activeTool || 'select';
  const selectedElement = configurator.elements.find((el) => el.id === configurator.selectedElementId);

  const history = configurator.history || [];
  const historyIndex = configurator.historyIndex ?? -1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Trebuchet MS',
    'Comic Sans MS',
    'Impact',
    'Lucida Console',
    'Tahoma',
    'Palatino',
  ];

  const handleToolChange = (tool) => {
    setActiveTool(tool);
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;
    addElement({
      type: 'text',
      text: textInput,
      x: 300,
      y: 275,
      fontSize,
      color: fontColor,
      fontFamily,
      fontWeight,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
    });
    setTextInput('');
  };

  const handleAddShape = (shapeType) => {
    addElement({
      type: shapeType,
      x: 300,
      y: 250,
      width: 100,
      height: 100,
      rotation: 0,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });
  };

  const handleAddSticker = (sticker) => {
    addElement({
      type: 'sticker',
      emoji: sticker.emoji,
      text: sticker.emoji,
      x: 350,
      y: 270,
      fontSize: 48,
      color: '#000000',
      width: 60,
      height: 60,
      rotation: 0,
      opacity: 1,
    });
  };

  const handleUploadImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      addElement({
        type: 'image',
        src: e.target.result,
        x: 200,
        y: 200,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImportTemplate = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const template = await importFromJSON(file);
      importTemplate(template);
      setShowImportDialog(false);
    } catch (error) {
      alert('Failed to import template: ' + error.message);
    }
  };

  const handleExport = (format) => {
    if (!stageRef?.current) {
      alert('Canvas not ready');
      return;
    }

    const productName = configurator.product?.name || 'canvas';
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'png':
        exportAsPNG(stageRef, `${productName}-${timestamp}.png`);
        break;
      case 'jpg':
        exportAsJPG(stageRef, `${productName}-${timestamp}.jpg`);
        break;
      case 'svg':
        exportAsSVG(stageRef, configurator.elements, canvasWidth, canvasHeight, `${productName}-${timestamp}.svg`);
        break;
      case 'json':
        exportAsJSON(configurator.elements, configurator.configuration, `${productName}-${timestamp}.json`);
        break;
    }
    setShowExportMenu(false);
  };

  const handleUpdateSelected = (updates) => {
    if (selectedElement) {
      updateElement(selectedElement.id, updates);
    }
  };

  const filteredStickers =
    stickerCategory === 'all'
      ? STICKERS
      : getStickersByCategory(stickerCategory);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Tabs */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex">
          <button
            onClick={() => setSelectedTab('tools')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === 'tools'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setSelectedTab('properties')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === 'properties'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setSelectedTab('export')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === 'export'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Export
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tools Tab */}
        {selectedTab === 'tools' && (
          <>
            {/* Undo/Redo */}
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
                Redo
              </button>
            </div>

            {/* Tool Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Drawing Tools</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { tool: 'select', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', label: 'Select' },
                  { tool: 'text', icon: 'M4 6h16M4 12h16M4 18h7', label: 'Text' },
                  { tool: 'rectangle', icon: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z', label: 'Rect' },
                  { tool: 'circle', icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Circle' },
                  { tool: 'line', icon: 'M5 12h14', label: 'Line' },
                  { tool: 'arrow', icon: 'M13 7l5 5m0 0l-5 5m5-5H6', label: 'Arrow' },
                  { tool: 'pen', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', label: 'Pen' },
                  { tool: 'image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Image' },
                ].map(({ tool, icon, label }) => (
                  <button
                    key={tool}
                    onClick={() => handleToolChange(tool)}
                    className={`p-2.5 rounded-lg border-2 transition-all ${
                      activeTool === tool
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                    title={label}
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                    <span className="text-xs mt-1 block">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Tools Panel */}
            {(activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line' || activeTool === 'arrow') && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Shape Properties</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Fill Color</label>
                    <input
                      type="color"
                      value={fillColor}
                      onChange={(e) => setFillColor(e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Stroke Color</label>
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Stroke Width: {strokeWidth}px</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Opacity: {Math.round(opacity * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={() => handleAddShape(activeTool)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Add {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                  </button>
                </div>
              </div>
            )}

            {/* Text Tool Panel */}
            {activeTool === 'text' && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Text</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Font Size</label>
                      <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        min="8"
                        max="144"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Color</label>
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {fontFamilies.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAddText}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Add Text
                  </button>
                </div>
              </div>
            )}

            {/* Stickers Panel */}
            {activeTool === 'sticker' && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Stickers & Emojis</h4>
                <div className="mb-3">
                  <select
                    value={stickerCategory}
                    onChange={(e) => setStickerCategory(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="all">All Categories</option>
                    {getAllCategories().map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {filteredStickers.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => handleAddSticker(sticker)}
                      className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-2xl transition-all"
                      title={sticker.name}
                    >
                      {sticker.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Upload Panel */}
            {activeTool === 'image' && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Upload Image</h4>
                <label className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                </label>
              </div>
            )}
          </>
        )}

        {/* Properties Tab */}
        {selectedTab === 'properties' && selectedElement && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900">Edit Selected</h4>
              <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full font-medium">
                {selectedElement.type}
              </span>
            </div>

            {/* Text Element Controls */}
            {selectedElement.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Text Content</label>
                  <input
                    type="text"
                    value={selectedElement.text || ''}
                    onChange={(e) => handleUpdateSelected({ text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block font-medium">Size</label>
                    <input
                      type="number"
                      value={selectedElement.fontSize || 24}
                      onChange={(e) => handleUpdateSelected({ fontSize: Number(e.target.value) })}
                      min="8"
                      max="144"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block font-medium">Color</label>
                    <input
                      type="color"
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => handleUpdateSelected({ color: e.target.value })}
                      className="w-full h-8 border border-gray-300 rounded bg-white cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Font Family</label>
                  <select
                    value={selectedElement.fontFamily || 'Arial'}
                    onChange={(e) => handleUpdateSelected({ fontFamily: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Shape Element Controls */}
            {(selectedElement.type === 'rectangle' ||
              selectedElement.type === 'circle' ||
              selectedElement.type === 'line' ||
              selectedElement.type === 'arrow') && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Fill Color</label>
                  <input
                    type="color"
                    value={selectedElement.fill || '#000000'}
                    onChange={(e) => handleUpdateSelected({ fill: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Stroke Color</label>
                  <input
                    type="color"
                    value={selectedElement.stroke || '#000000'}
                    onChange={(e) => handleUpdateSelected({ stroke: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">
                    Stroke Width: {selectedElement.strokeWidth || 2}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={selectedElement.strokeWidth || 2}
                    onChange={(e) => handleUpdateSelected({ strokeWidth: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">
                    Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1}
                    onChange={(e) => handleUpdateSelected({ opacity: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Position Controls */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <label className="text-xs text-gray-600 mb-2 block font-medium">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x || 0)}
                    onChange={(e) => handleUpdateSelected({ x: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y || 0)}
                    onChange={(e) => handleUpdateSelected({ y: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Rotation Control */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <label className="text-xs text-gray-600 mb-2 block font-medium">Rotation</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedElement.rotation || 0}
                  onChange={(e) => handleUpdateSelected({ rotation: Number(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={selectedElement.rotation || 0}
                  onChange={(e) => handleUpdateSelected({ rotation: Number(e.target.value) })}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  min="0"
                  max="360"
                />
                <span className="text-xs text-gray-500">°</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {selectedTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Canvas</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleExport('png')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export as PNG
                </button>
                <button
                  onClick={() => handleExport('jpg')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export as JPG
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export as SVG
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Export as JSON Template
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Import Template</h4>
              <label className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTemplate}
                  className="hidden"
                />
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">Import JSON Template</span>
              </label>
            </div>

            <button
              onClick={clearAllElements}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Clear All Elements
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedToolbar;
