import useStore from '../../store/useStore';

const ConfiguratorActionBar = () => {
  const {
    configurator,
    undo,
    redo,
    copyElements,
    pasteElementsAt,
    bringToFront,
    deleteSelected,
    updateElement,
  } = useStore();

  const selectedIds = configurator.selectedElementIds || [];
  const history = configurator.history || [];
  const historyIndex = configurator.historyIndex ?? -1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedIds.length > 0;

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
    <div className="h-14 bg-[#f0f7f2] border-t border-teal-200 flex items-center justify-center gap-2 px-4">
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
  );
};

export default ConfiguratorActionBar;
