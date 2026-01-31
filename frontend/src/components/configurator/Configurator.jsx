import { useEffect, useState, useRef } from 'react';
import useStore from '../../store/useStore';
import KonvaCanvasEditor from './KonvaCanvasEditor';
import EnhancedToolbar from './EnhancedToolbar';
import LayerPanel from './LayerPanel';
import { getStageDataURL } from './utils/exportUtils';

const Configurator = ({ navigate, isFromProjects, instanceId }) => {
  const { configurator, markProductAsEdited, saveProductEdits, setProduct, fetchCollection, fetchProjects } = useStore();
  const currentProductId = configurator.product?.id;
  const editingInstanceId = configurator.editingInstanceId || instanceId;
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const stageRef = useRef();

  const isFromSelection = window.location.search.includes('from=selection');
  const isFromCollection = window.location.search.includes('from=collection');
  
  const getRangeIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('rangeId');
  };
  const rangeId = getRangeIdFromUrl();

  // Save edits when product changes or component unmounts (per-instance: include editedImage when instanceId)
  useEffect(() => {
    return () => {
      if (currentProductId && configurator.elements.length > 0) {
        let editedImageDataURL = null;
        if (editingInstanceId && stageRef?.current) {
          editedImageDataURL = getStageDataURL(stageRef, { mimeType: 'image/png', pixelRatio: 2 });
        }
        saveProductEdits(currentProductId, editingInstanceId || undefined, editedImageDataURL);
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
        saveProductEdits(currentProductId, editingInstanceId || undefined);
        setTimeout(() => {
          setSaveStatus('✓ Saved');
          setTimeout(() => setSaveStatus(''), 2000);
          setIsSaving(false);
        }, 500);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [currentProductId, configurator.elements.length, saveProductEdits, editingInstanceId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('Saving...');
    
    if (currentProductId) {
      let editedImageDataURL = null;
      if (editingInstanceId && stageRef?.current) {
        editedImageDataURL = getStageDataURL(stageRef, { mimeType: 'image/png', pixelRatio: 2 });
      }
      saveProductEdits(currentProductId, editingInstanceId || undefined, editedImageDataURL);
      markProductAsEdited(currentProductId);
    }
    
    setTimeout(async () => {
      setSaveStatus('✓ Saved Successfully');
      
      // Refetch ALL data sources to ensure changes show in all tabs
      await Promise.all([
        fetchCollection(),
        fetchProjects()
      ]);
      
      setTimeout(() => {
        // Determine which tab to return to
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
      }, 500);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-b border-indigo-700/50 shadow-2xl flex-shrink-0 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                  {configurator.product?.name || 'Design Studio'}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-200">Premium Canvas Editor</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Keyboard Shortcuts */}
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-2 hover:bg-indigo-800 rounded-lg text-indigo-200 hover:text-white transition-all"
              title="Keyboard Shortcuts"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            {/* Save Status */}
            <div className="text-right hidden sm:block">
              {saveStatus && (
                <p className={`text-sm font-medium transition-all ${
                  saveStatus.includes('✓') ? 'text-green-400' : 'text-amber-300'
                }`}>
                  {saveStatus}
                </p>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold text-sm sm:text-base flex items-center gap-2 flex-shrink-0"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Saving</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Save & Exit</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Panel */}
        {showShortcuts && (
          <div className="mt-4 bg-indigo-800/30 backdrop-blur-sm rounded-lg p-3 border border-indigo-600/30 max-w-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-indigo-100">
              <div><span className="font-semibold text-indigo-300">Delete</span> - Remove selected</div>
              <div><span className="font-semibold text-indigo-300">Ctrl+Z</span> - Undo</div>
              <div><span className="font-semibold text-indigo-300">Ctrl+Shift+Z</span> - Redo</div>
              <div><span className="font-semibold text-indigo-300">Ctrl+C</span> - Copy</div>
              <div><span className="font-semibold text-indigo-300">Ctrl+V</span> - Paste</div>
              <div><span className="font-semibold text-indigo-300">Shift+click</span> - Multi-select</div>
              <div><span className="font-semibold text-indigo-300">Arrows</span> - Move (Shift = 10px)</div>
              <div><span className="font-semibold text-indigo-300">Ctrl+wheel</span> - Zoom</div>
              <div><span className="font-semibold text-indigo-300">Space+drag</span> - Pan</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden gap-0">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden flex flex-col">
          <EnhancedToolbar stageRef={stageRef} canvasWidth={800} canvasHeight={600} />
        </div>

        {/* Canvas Section */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-hidden min-h-0 relative">
            <KonvaCanvasEditor ref={stageRef} />
            
            {/* Elements Counter */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-medium border border-white/10 z-10 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{configurator.elements.length} objects</span>
              </div>
              {(configurator.selectedElementIds?.length > 0) && (
                <div className="text-xs text-indigo-200 mt-1">
                  {configurator.selectedElementIds.length} selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers */}
        <div className="w-64 bg-white border-l border-gray-200 flex-shrink-0 overflow-hidden">
          <LayerPanel />
        </div>
      </div>
    </div>
  );
};

export default Configurator;