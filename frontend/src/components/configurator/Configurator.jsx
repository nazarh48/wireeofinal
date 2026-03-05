import { useEffect, useRef, useState } from 'react';
import useStore from '../../store/useStore';
import KonvaCanvasEditor from './KonvaCanvasEditor';
import ConfiguratorToolRail from './ConfiguratorToolRail';
import ConfiguratorPropertiesPanel from './ConfiguratorPropertiesPanel';
import ConfiguratorActionBar from './ConfiguratorActionBar';

const Configurator = ({ navigate, isFromProjects, instanceId }) => {
  const { configurator, markProductAsEdited, saveProductEdits, fetchCollection, fetchProjects } = useStore();
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

  // Save edits when product changes or component unmounts.
  // Keep this lightweight (no editedImage snapshot) to avoid large payload failures.
  useEffect(() => {
    return () => {
      if (currentProductId && configurator.elements.length > 0) {
        saveProductEdits(currentProductId, editingInstanceId || undefined);
      }
    };
  }, [currentProductId, saveProductEdits, configurator.elements.length, editingInstanceId]);

  // Auto-save edits periodically (elements/config only; editedImage generated on explicit Save)
  useEffect(() => {
    if (!currentProductId) return;

    const autoSaveInterval = setInterval(() => {
      if (configurator.elements.length > 0) {
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
  }, [currentProductId, configurator.elements.length, saveProductEdits, editingInstanceId]);

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
    <div className="flex flex-col h-full bg-[#e8f5e9] overflow-hidden">
      <div className="h-14 bg-[#f1f8f4] border-b border-teal-200 px-4 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-sm font-medium text-gray-800 truncate">
            {configurator.product?.name || 'Configurator'}
          </h1>
          <div className="text-xs text-teal-600/80">
            {saveStatus || 'Editing'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={navigateBack}
            className="h-9 px-4 text-sm border border-teal-300 bg-white hover:bg-teal-50 text-teal-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-4 text-sm bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-72 flex-shrink-0 min-h-0">
          <ConfiguratorToolRail />
        </div>
        <div className="flex-1 min-w-0 flex flex-col bg-[#e8f0ea]">
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <KonvaCanvasEditor
              ref={stageRef}
              onCanvasInfo={(info) => setCanvasInfo(info)}
            />
          </div>
          <ConfiguratorActionBar stageRef={stageRef} canvasInfo={canvasInfo} />
        </div>
        <div className="w-72 flex-shrink-0 min-h-0">
          <ConfiguratorPropertiesPanel canvasInfo={canvasInfo} />
        </div>
      </div>
    </div>
  );
};

export default Configurator;