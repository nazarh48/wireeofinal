import { useEffect, useRef, useState } from 'react';
import useStore from '../../store/useStore';
import KonvaCanvasEditor from './KonvaCanvasEditor';
import ConfiguratorToolRail from './ConfiguratorToolRail';
import ConfiguratorPropertiesPanel from './ConfiguratorPropertiesPanel';
import ConfiguratorActionBar from './ConfiguratorActionBar';

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;
const DEFAULT_PROCESSING_TYPE = 'Colour printing';

const hasPersistedEdits = (edits) => {
  if (!edits) return false;

  const hasElements = Array.isArray(edits.elements) && edits.elements.length > 0;
  const hasEditedImage = Boolean(edits.editedImage);
  const configuration = edits.configuration || {};
  const hasConfigData =
    Boolean(configuration.backgroundImage) ||
    Boolean(configuration.backgroundFileName) ||
    Boolean(configuration.lastModified) ||
    Boolean(configuration.individualLabeling?.trim?.()) ||
    Boolean(configuration.room?.trim?.()) ||
    String(configuration.floor ?? '1') !== '1' ||
    (configuration.processingType || DEFAULT_PROCESSING_TYPE) !== DEFAULT_PROCESSING_TYPE ||
    Number(configuration.canvasWidth || DEFAULT_CANVAS_WIDTH) !== DEFAULT_CANVAS_WIDTH ||
    Number(configuration.canvasHeight || DEFAULT_CANVAS_HEIGHT) !== DEFAULT_CANVAS_HEIGHT;

  return hasElements || hasEditedImage || hasConfigData;
};

const Configurator = ({ navigate, isFromProjects, instanceId }) => {
  const {
    configurator,
    productEdits,
    editsByInstanceId,
    markProductAsEdited,
    saveProductEdits,
    fetchCollection,
    fetchProjects,
  } = useStore();
  const currentProductId = configurator.product?.id;
  const editingInstanceId = configurator.editingInstanceId || instanceId;
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [canvasInfo, setCanvasInfo] = useState(null);
  const stageRef = useRef();

  const isFromSelection = window.location.search.includes('from=selection');
  const isFromCollection = window.location.search.includes('from=collection');

  const getRangeIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('rangeId');
  };
  const rangeId = getRangeIdFromUrl();
  const existingEdits = editingInstanceId
    ? editsByInstanceId[editingInstanceId] || null
    : (currentProductId ? productEdits[currentProductId] || null : null);
  const hasPersistableState =
    Boolean(currentProductId) &&
    (
      (Array.isArray(configurator.elements) && configurator.elements.length > 0) ||
      Boolean(configurator.configuration?.lastModified) ||
      Boolean(configurator.configuration?.backgroundImage) ||
      hasPersistedEdits(existingEdits)
    );

  // Save edits when product changes or component unmounts.
  // Keep this lightweight (no editedImage snapshot) to avoid large payload failures.
  useEffect(() => {
    return () => {
      if (currentProductId && hasPersistableState) {
        saveProductEdits(currentProductId, editingInstanceId || undefined);
      }
    };
  }, [currentProductId, saveProductEdits, editingInstanceId, hasPersistableState]);

  // Auto-save edits periodically (elements/config only; editedImage generated on explicit Save)
  useEffect(() => {
    if (!currentProductId) return;

    const autoSaveInterval = setInterval(() => {
      if (hasPersistableState) {
        setIsSaving(true);
        setSaveStatus('Auto-saving...');
        saveProductEdits(currentProductId, editingInstanceId || undefined)
          .then((ok) => {
            setSaveStatus(ok ? '✓ Saved' : 'Save failed');
          })
          .catch(() => {
            setSaveStatus('Save failed');
          })
          .finally(() => {
            setTimeout(() => setSaveStatus(''), 2000);
            setIsSaving(false);
          });
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [currentProductId, saveProductEdits, editingInstanceId, hasPersistableState]);

  const navigateBack = () => {
    if (isFromSelection) {
      const selectionUrl = rangeId
        ? `/products/ranges?tab=selection&rangeId=${rangeId}`
        : '/products/ranges?tab=selection';
      navigate(selectionUrl);
    } else if (isFromCollection) {
      navigate('/products/ranges?tab=collection');
    } else if (isFromProjects) {
      navigate('/products/ranges?tab=projects');
    } else {
      navigate('/products/ranges?tab=collection');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('Saving...');

    if (currentProductId) {
      const ok = await saveProductEdits(currentProductId, editingInstanceId || undefined);
      if (!ok) {
        setSaveStatus('Save failed');
        setIsSaving(false);
        return;
      }
      if (!editingInstanceId) {
        markProductAsEdited(currentProductId);
      }
    }

    setTimeout(async () => {
      setSaveStatus('✓ Saved Successfully');

      // Refetch sequentially so editsByInstanceId is never overwritten by a parallel run (preserves all instance edits).
      await fetchCollection();
      await fetchProjects();

      setTimeout(() => navigateBack(), 500);
    }, 500);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.30)]">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/90 px-3">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-800">
            {configurator.product?.name || 'Configurator'}
          </h1>
          <div className="text-xs text-teal-700/80">
            {saveStatus || 'Editing'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={navigateBack}
            className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 rounded-lg bg-teal-600 px-3 text-xs font-medium text-white transition-colors hover:bg-teal-700 disabled:bg-teal-300"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <div className="w-52 min-h-0 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-[#f0f7f2] 2xl:w-56">
          <ConfiguratorToolRail />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <KonvaCanvasEditor
              ref={stageRef}
              onCanvasInfo={(info) => setCanvasInfo(info)}
            />
          </div>
          <ConfiguratorActionBar stageRef={stageRef} canvasInfo={canvasInfo} />
        </div>

        <div className="w-52 min-h-0 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-[#f0f7f2] 2xl:w-56">
          <ConfiguratorPropertiesPanel canvasInfo={canvasInfo} />
        </div>
      </div>
    </div>
  );
};

export default Configurator;