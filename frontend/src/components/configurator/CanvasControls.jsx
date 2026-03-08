import useStore from '../../store/useStore';

const CanvasControls = ({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  zoomLabel = '100%',
}) => {
  const { configurator } = useStore();

  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="flex min-w-max items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={onZoomOut}
              className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
              title="Zoom Out (Ctrl + -)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={onZoomReset}
              className="min-w-[54px] rounded-lg px-2 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:bg-white"
              title="Reset Zoom (Ctrl + 0)"
            >
              {zoomLabel}
            </button>
            <button
              onClick={onZoomIn}
              className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
              title="Zoom In (Ctrl + +)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>

          <div className="hidden h-6 w-px bg-gray-300 sm:block"></div>

          {/* Grid & Snap Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleGrid}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                showGrid ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
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
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                snapToGrid ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Snap to Grid"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span>Snap</span>
            </button>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            Reset with zoom badge
          </span>
        </div>
      </div>

      {/* Canvas Info */}
      <div className="hidden items-center gap-2 text-[11px] text-gray-500 2xl:flex">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{configurator.elements.length} element{configurator.elements.length !== 1 ? 's' : ''}</span>
        </div>
        {(configurator.selectedElementIds?.length > 0) && (
          <div className="flex items-center space-x-1 text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>{configurator.selectedElementIds.length} selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasControls;
