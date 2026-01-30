import { useState } from 'react';
import useStore from '../../store/useStore';

const Toolbar = () => {
  const { 
    configurator, 
    addElement, 
    updateElement, 
    deleteElement, 
    selectElement,
    setActiveTool,
    undo,
    redo,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
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
  const [selectedTab, setSelectedTab] = useState('shapes');
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [blurEnabled, setBlurEnabled] = useState(false);

  const activeTool = configurator.activeTool || 'select';
  const selectedElement = configurator.elements.find(el => el.id === configurator.selectedElementId);

  const handleToolChange = (tool) => {
    setActiveTool(tool);
  };

  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Trebuchet MS', 'Comic Sans MS'];
  const fontWeights = ['normal', 'bold', '300', '400', '500', '600', '700'];

  // Predefined icons/symbols
  const icons = [
    { name: 'Light', symbol: '💡', category: 'electrical' },
    { name: 'Power', symbol: '⚡', category: 'electrical' },
    { name: 'Switch', symbol: '🔘', category: 'electrical' },
    { name: 'Socket', symbol: '🔌', category: 'electrical' },
    { name: 'Panel', symbol: '📊', category: 'electrical' },
    { name: 'Warning', symbol: '⚠️', category: 'safety' },
    { name: 'Check', symbol: '✓', category: 'general' },
    { name: 'Cross', symbol: '✗', category: 'general' },
    { name: 'Arrow Up', symbol: '↑', category: 'arrows' },
    { name: 'Arrow Down', symbol: '↓', category: 'arrows' },
    { name: 'Arrow Left', symbol: '←', category: 'arrows' },
    { name: 'Arrow Right', symbol: '→', category: 'arrows' },
    { name: 'Star', symbol: '⭐', category: 'general' },
    { name: 'Heart', symbol: '❤️', category: 'general' },
    { name: 'Eye', symbol: '👁️', category: 'general' },
    { name: 'Lock', symbol: '🔒', category: 'general' },
  ];

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
      cornerRadius,
      opacity,
    });
  };

  const handleAddIcon = (symbol) => {
    addElement({
      type: 'icon',
      text: symbol,
      x: 370,
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
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSelected = () => {
    if (configurator.selectedElementId) {
      deleteElement(configurator.selectedElementId);
    }
  };

  const handleDuplicateSelected = () => {
    const element = configurator.elements.find(el => el.id === configurator.selectedElementId);
    if (element) {
      addElement({
        ...element,
        x: (element.x || 0) + 20,
        y: (element.y || 0) + 20,
      });
    }
  };

  const history = configurator.history || [];
  const historyIndex = configurator.historyIndex ?? -1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUpdateSelected = (updates) => {
    if (selectedElement) {
      updateElement(selectedElement.id, updates);
    }
  };

  // Alignment functions
  const alignLeft = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, { x: 0 });
    }
  };
  const alignCenter = () => {
    if (selectedElement) {
      const CANVAS_WIDTH = 800;
      updateElement(selectedElement.id, { x: (CANVAS_WIDTH - (selectedElement.width || 200)) / 2 });
    }
  };
  const alignRight = () => {
    if (selectedElement) {
      const CANVAS_WIDTH = 800;
      updateElement(selectedElement.id, { x: CANVAS_WIDTH - (selectedElement.width || 200) });
    }
  };
  const alignTop = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, { y: 0 });
    }
  };
  const alignMiddle = () => {
    if (selectedElement) {
      const CANVAS_HEIGHT = 600;
      updateElement(selectedElement.id, { y: (CANVAS_HEIGHT - (selectedElement.height || 50)) / 2 });
    }
  };
  const alignBottom = () => {
    if (selectedElement) {
      const CANVAS_HEIGHT = 600;
      updateElement(selectedElement.id, { y: CANVAS_HEIGHT - (selectedElement.height || 50) });
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto bg-gray-50">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Design Tools</h3>
        <p className="text-xs text-gray-500">Professional editing suite</p>
      </div>

      {/* Undo/Redo Controls */}
      <div className="mb-4 flex gap-2">
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
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2">Tools</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleToolChange('select')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'select' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Select Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </button>
          <button
            onClick={() => handleToolChange('text')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'text' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Text Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <button
            onClick={() => handleToolChange('rectangle')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'rectangle' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Rectangle Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
          </button>
          <button
            onClick={() => handleToolChange('circle')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'circle' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Circle Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleToolChange('line')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'line' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Line Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
          </button>
          <button
            onClick={() => handleToolChange('pen')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'pen' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Free Draw Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => handleToolChange('image')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'image' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Image Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => handleToolChange('icon')}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              activeTool === 'icon' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            title="Icon Tool"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Shape Tools Panel */}
      {(activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line') && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Shape Properties</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Fill Color</label>
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Stroke Color</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-8 border border-gray-300 rounded"
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
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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
                  className="w-full h-8 border border-gray-300 rounded"
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
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {fontWeights.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
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

      {/* Free Draw Tool Panel */}
      {activeTool === 'pen' && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Free Draw</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Stroke Color</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-8 border border-gray-300 rounded"
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
            <p className="text-xs text-gray-500">Click and drag on canvas to draw</p>
          </div>
        </div>
      )}

      {/* Icons Tool Panel */}
      {activeTool === 'icon' && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Icon</h4>
          <div className="grid grid-cols-4 gap-2">
            {icons.map((icon) => (
              <button
                key={icon.name}
                onClick={() => handleAddIcon(icon.symbol)}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-2xl transition-all"
                title={icon.name}
              >
                {icon.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload Panel */}
      {activeTool === 'image' && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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

      {/* Selected Element Controls */}
      {selectedElement && (
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-900">Edit Selected</h4>
            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full font-medium">
              {selectedElement.type}
            </span>
          </div>

          {/* Layer Management */}
          <div className="mb-3 pb-3 border-b border-blue-200">
            <label className="text-xs text-gray-600 mb-2 block font-medium">Layer Order</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => bringToFront(selectedElement.id)}
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                title="Bring to Front"
              >
                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </button>
              <button
                onClick={() => sendToBack(selectedElement.id)}
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                title="Send to Back"
              >
                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </button>
              <button
                onClick={() => bringForward(selectedElement.id)}
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                title="Bring Forward"
              >
                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              <button
                onClick={() => sendBackward(selectedElement.id)}
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                title="Send Backward"
              >
                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
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
                    className="w-full h-8 border border-gray-300 rounded bg-white"
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
                  {fontFamilies.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">Font Weight</label>
                <select
                  value={selectedElement.fontWeight || 'normal'}
                  onChange={(e) => handleUpdateSelected({ fontWeight: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                >
                  {fontWeights.map(weight => (
                    <option key={weight} value={weight}>{weight}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Shape Element Controls */}
          {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'line') && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">Fill Color</label>
                <input
                  type="color"
                  value={selectedElement.fill || '#000000'}
                  onChange={(e) => handleUpdateSelected({ fill: e.target.value })}
                  className="w-full h-8 border border-gray-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">Stroke Color</label>
                <input
                  type="color"
                  value={selectedElement.stroke || '#000000'}
                  onChange={(e) => handleUpdateSelected({ stroke: e.target.value })}
                  className="w-full h-8 border border-gray-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">Stroke Width: {selectedElement.strokeWidth || 2}px</label>
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
                <label className="text-xs text-gray-600 mb-1 block font-medium">Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</label>
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

          {/* Icon Element Controls */}
          {selectedElement.type === 'icon' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">Icon Color</label>
                <input
                  type="color"
                  value={selectedElement.color || '#000000'}
                  onChange={(e) => handleUpdateSelected({ color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">Size</label>
                <input
                  type="number"
                  value={selectedElement.fontSize || 48}
                  onChange={(e) => handleUpdateSelected({ fontSize: Number(e.target.value) })}
                  min="12"
                  max="144"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
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

          {/* Size Controls */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <label className="text-xs text-gray-600 mb-2 block font-medium">Size</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Width</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width || 200)}
                  onChange={(e) => handleUpdateSelected({ width: Number(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  min="10"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Height</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height || 50)}
                  onChange={(e) => handleUpdateSelected({ height: Number(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  min="10"
                />
              </div>
            </div>
          </div>

          {/* Alignment Tools */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <label className="text-xs text-gray-600 mb-2 block font-medium">Alignment</label>
            <div className="space-y-2">
              <div className="flex space-x-1">
                <button
                  onClick={alignLeft}
                  className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                  title="Align Left"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                </button>
                <button
                  onClick={alignCenter}
                  className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                  title="Align Center"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-8 6h8" />
                  </svg>
                </button>
                <button
                  onClick={alignRight}
                  className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                  title="Align Right"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-8 6h16" />
                  </svg>
                </button>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={alignTop}
                  className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                  title="Align Top"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
                <button
                  onClick={alignMiddle}
                  className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                  title="Align Middle"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0v8m0-8l-8 8" />
                  </svg>
                </button>
                <button
                  onClick={alignBottom}
                  className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                  title="Align Bottom"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Rotation Control */}
          {(selectedElement.type === 'image' || selectedElement.type === 'text' || selectedElement.type === 'icon' || selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'line') && (
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
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {selectedElement && (
          <button
            onClick={handleDuplicateSelected}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium text-sm flex items-center justify-center gap-2"
            title="Duplicate (Ctrl+D)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </button>
        )}
        <button
          onClick={handleDeleteSelected}
          disabled={!configurator.selectedElementId}
          className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm font-medium text-sm flex items-center justify-center gap-2"
          title="Delete (Del)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>

      {/* Elements List */}
      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
          <span>Elements</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {configurator.elements.length}
          </span>
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {configurator.elements.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">No elements added yet</p>
          ) : (
            configurator.elements.map((element, idx) => (
              <div
                key={element.id}
                onClick={() => selectElement(element.id)}
                className={`p-2 rounded-lg cursor-pointer text-xs transition-all ${
                  element.id === configurator.selectedElementId
                    ? 'bg-blue-100 border-2 border-blue-500 shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">#{idx + 1}</span>
                    {element.type === 'text' && (
                      <>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <span className="truncate max-w-[120px]">"{element.text?.substring(0, 15)}..."</span>
                      </>
                    )}
                    {element.type === 'icon' && (
                      <>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>{element.text}</span>
                      </>
                    )}
                    {element.type === 'image' && (
                      <>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Image</span>
                      </>
                    )}
                    {(element.type === 'rectangle' || element.type === 'circle' || element.type === 'line') && (
                      <>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                        </svg>
                        <span className="capitalize">{element.type}</span>
                      </>
                    )}
                    {element.type === 'pen' && (
                      <>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Free Draw</span>
                      </>
                    )}
                  </div>
                  {element.id === configurator.selectedElementId && (
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
