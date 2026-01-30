import useStore from '../../store/useStore';

const CanvasControls = ({ onZoomIn, onZoomOut, onZoomReset, showGrid, onToggleGrid, snapToGrid, onToggleSnap }) => {
  const { configurator } = useStore();

  return (
    <div className="bg-white border-b px-4 py-2 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
          <button
            onClick={onZoomOut}
            className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Zoom Out (Ctrl + -)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button
            onClick={onZoomReset}
            className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white rounded transition-colors min-w-[50px]"
            title="Reset Zoom (Ctrl + 0)"
          >
            100%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Zoom In (Ctrl + +)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* Grid & Snap Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleGrid}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center space-x-1.5 ${
              showGrid ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Toggle Grid (G)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Grid</span>
          </button>
          <button
            onClick={onToggleSnap}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center space-x-1.5 ${
              snapToGrid ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Snap to Grid"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <span>Snap</span>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* View Options */}
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Fit to Screen"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Fit
          </button>
        </div>
      </div>

      {/* Canvas Info */}
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{configurator.elements.length} element{configurator.elements.length !== 1 ? 's' : ''}</span>
        </div>
        {configurator.selectedElementId && (
          <div className="flex items-center space-x-1 text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasControls;
