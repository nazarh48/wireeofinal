import useStore from '../../store/useStore';

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
  const backgroundCustomizable =
    product?.backgroundCustomizable === true ||
    product?.backgroundCustomizable === 'true';
  const hasBackground = Boolean(configurator.configuration?.backgroundImage);

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

          {backgroundCustomizable ? (
            <>
              <label className="flex h-7 cursor-pointer items-center rounded-lg border border-teal-200 bg-white px-3 text-[11px] text-teal-800 transition-colors hover:bg-teal-50">
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
                onClick={() => {
                  if (!hasBackground) return;
                  const confirmed = window.confirm(
                    'Remove the current background from this configuration?',
                  );
                  if (!confirmed) return;

                  updateConfiguratorConfiguration({
                    backgroundImage: null,
                    backgroundFileName: '',
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
