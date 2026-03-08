import { useEffect, useMemo, useState } from 'react';
import useStore from '../../store/useStore';
import { useIconStore } from '../../stores/useIconStore';
import { getImageUrl } from '../../services/api';
import { buildColoredSvgDataUrl, isSvgAssetUrl } from '../../utils/svgIconColor';

const quickActions = [
  { id: 'icons', label: 'Symbols and icons' },
  { id: 'text', label: 'Text field' },
  { id: 'counter', label: 'Counter' },
  { id: 'image', label: 'Own picture' },
];

const roomOptions = [
  'Storage room',
  'Dressing room',
  'Workspace',
  'Bathroom',
  'Office',
  'Gallery',
  'Dining Room',
  'Hallway',
  'Garage',
  'Cellar',
  'Building Services Room',
  'Utility Room',
  'Heating System Room',
  'Hobby Room',
  'Kitchen',
  'Bedroom',
  'Living Room',
];

const DEFAULT_PROCESSING_OPTIONS = ['Colour printing', 'Laser engraving', 'UV print'];

const DEFAULT_LIBRARY_ICON_SIZE = 96;
const MIN_LIBRARY_ICON_SIZE = 32;
const DEFAULT_LIBRARY_ICON_COLOR = '#111827';

const loadImageAsset = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Missing image source'));
      return;
    }

    const primary = new window.Image();
    primary.crossOrigin = 'anonymous';
    primary.onload = () => resolve(primary);
    primary.onerror = () => {
      const fallback = new window.Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      fallback.src = src;
    };
    primary.src = src;
  });

const loadTextAsset = async (src) => {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Failed to fetch icon asset: ${response.status}`);
  return response.text();
};

const getProcessingOptionsForProduct = (product) => {
  if (!product) return DEFAULT_PROCESSING_OPTIONS;

  const options = [];

  // Tie options to per‑product capabilities from the admin form
  if (product.printingEnabled !== false) {
    options.push('Colour printing');
  }
  if (product.laserEnabled) {
    options.push('Laser engraving');
  }

  // If nothing explicitly enabled, fall back to defaults
  return options.length ? options : DEFAULT_PROCESSING_OPTIONS;
};

const ConfiguratorToolRail = () => {
  const { configurator, addElement, setActiveTool, updateConfiguratorConfiguration } = useStore();
  const [activeAction, setActiveAction] = useState('icons');
  const [textValue, setTextValue] = useState('');
  const [printMode, setPrintMode] = useState('Colour printing');
  const [individualLabeling, setIndividualLabeling] = useState('');
  const [roomValue, setRoomValue] = useState('');
  const [floorValue, setFloorValue] = useState('1');

  const {
    categories,
    activeCategoryId,
    isLoadingCategories,
    isLoadingIcons,
    loadCategories,
    setActiveCategoryId,
    getActiveIcons,
  } = useIconStore((s) => ({
    categories: s.categories,
    activeCategoryId: s.activeCategoryId,
    isLoadingCategories: s.isLoadingCategories,
    isLoadingIcons: s.isLoadingIcons,
    loadCategories: s.loadCategories,
    setActiveCategoryId: s.setActiveCategoryId,
    getActiveIcons: s.getActiveIcons,
  }));

  const processingOptions = useMemo(
    () => getProcessingOptionsForProduct(configurator.product),
    [configurator.product]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const activeIcons = getActiveIcons();

  useEffect(() => {
    const cfg = configurator.configuration || {};
    setTextValue('');
    setActiveAction('icons');
    const nextProcessing =
      (cfg.processingType && processingOptions.includes(cfg.processingType))
        ? cfg.processingType
        : (processingOptions[0] || 'Colour printing');
    setPrintMode(nextProcessing);
    setIndividualLabeling(cfg.individualLabeling || '');
    setRoomValue(cfg.room || '');
    setFloorValue(String(cfg.floor ?? '1'));
  }, [
    configurator.editingInstanceId,
    configurator.product?.id,
    configurator.configuration?.processingType,
    configurator.configuration?.individualLabeling,
    configurator.configuration?.room,
    configurator.configuration?.floor,
    processingOptions,
  ]);

  const persistConfig = (changes) => {
    updateConfiguratorConfiguration(changes);
  };

  const addTextElement = () => {
    const value = textValue.trim();
    if (!value) return;
    addElement({
      type: 'text',
      text: value,
      x: 260,
      y: 250,
      width: 180,
      height: 42,
      fontSize: 28,
      fontFamily: 'Arial',
      color: '#5f6772',
      opacity: 1,
    });
    setActiveTool('select');
    setTextValue('');
  };

  const addCounterElement = () => {
    addElement({
      type: 'rectangle',
      x: 240,
      y: 240,
      width: 150,
      height: 56,
      fill: 'transparent',
      stroke: '#8f96a3',
      strokeWidth: 2,
      cornerRadius: 6,
      opacity: 1,
    });
    setActiveTool('select');
  };

  const addBackendIcon = async (icon) => {
    if (!icon) return;
    const originalSrc = getImageUrl(icon.file_path);
    const isSvgIcon = isSvgAssetUrl(originalSrc);
    let svgMarkup = '';
    let src = originalSrc;

    if (isSvgIcon) {
      try {
        svgMarkup = await loadTextAsset(originalSrc);
        src = buildColoredSvgDataUrl(
          svgMarkup,
          DEFAULT_LIBRARY_ICON_COLOR,
          DEFAULT_LIBRARY_ICON_COLOR
        );
      } catch {
        svgMarkup = '';
      }
    }

    let width = DEFAULT_LIBRARY_ICON_SIZE;
    let height = DEFAULT_LIBRARY_ICON_SIZE;

    try {
      const image = await loadImageAsset(src);
      const naturalWidth = image.naturalWidth || image.width || DEFAULT_LIBRARY_ICON_SIZE;
      const naturalHeight = image.naturalHeight || image.height || DEFAULT_LIBRARY_ICON_SIZE;
      const scale = Math.min(
        DEFAULT_LIBRARY_ICON_SIZE / naturalWidth,
        DEFAULT_LIBRARY_ICON_SIZE / naturalHeight,
        1
      );

      width = Math.max(MIN_LIBRARY_ICON_SIZE, Math.round(naturalWidth * scale));
      height = Math.max(MIN_LIBRARY_ICON_SIZE, Math.round(naturalHeight * scale));
    } catch {
      // Keep a safe square fallback if metadata cannot be resolved.
    }

    const canvasWidth = Number(configurator.configuration?.canvasWidth) || 800;
    const canvasHeight = Number(configurator.configuration?.canvasHeight) || 600;

    addElement({
      type: 'image',
      src,
      originalSrc,
      svgMarkup: svgMarkup || undefined,
      isColorizableIcon: Boolean(svgMarkup),
      iconId: icon.id || icon._id,
      categoryId: icon.category_id || null,
      iconName: icon.name || '',
      fill: DEFAULT_LIBRARY_ICON_COLOR,
      stroke: DEFAULT_LIBRARY_ICON_COLOR,
      x: Math.max(0, Math.round((canvasWidth - width) / 2)),
      y: Math.max(0, Math.round((canvasHeight - height) / 2)),
      width,
      height,
      opacity: 1,
    });
    setActiveTool('select');
  };

  const uploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      addElement({
        type: 'image',
        src: e.target?.result,
        x: 280,
        y: 190,
        width: 140,
        height: 140,
        opacity: 1,
      });
      setActiveTool('select');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="px-4 pt-4 pb-3 border-b border-teal-200/60">
        <div className="text-sm font-medium text-gray-800">
          {configurator.product?.name || 'Product'}
        </div>
        {/* <div className="text-xs text-teal-600/80 mt-0.5">
          {configurator.product?.description || configurator.product?.category || 'Graphic configurator'}
        </div> */}

        <div className="mt-3 space-y-2">
          <div>
            <label className="text-[10px] uppercase tracking-wide text-teal-700/70">Colour printing</label>
            <select
              value={printMode}
              onChange={(e) => {
                const next = e.target.value;
                setPrintMode(next);
                persistConfig({ processingType: next });
              }}
              className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-xs text-[#5f6772]"
            >
              {processingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-teal-700/70">Individual designation</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <input
                value={individualLabeling}
                onChange={(e) => {
                  const next = e.target.value;
                  setIndividualLabeling(next);
                  persistConfig({ individualLabeling: next });
                }}
                className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs text-[#5f6772]"
                placeholder="Label"
              />
              <div className="col-span-2">
                <select
                  value={roomValue}
                  onChange={(e) => {
                    const next = e.target.value;
                    setRoomValue(next);
                    persistConfig({ room: next });
                  }}
                  className="w-full h-8 px-2 border border-[#cfd3d9] bg-white text-xs text-[#5f6772]"
                >
                  <option value="">Choose a room</option>
                  {roomOptions.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-teal-700/70">Floor</label>
            <select
              value={floorValue}
              onChange={(e) => {
                const next = e.target.value;
                setFloorValue(next);
                persistConfig({ floor: next });
              }}
              className="w-full mt-1 h-8 px-2 border border-[#cfd3d9] bg-white text-xs text-[#5f6772]"
            >
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1.5">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveAction(action.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${activeAction === action.id
                ? 'bg-white border border-teal-300 text-teal-800'
                : 'text-gray-600 hover:bg-teal-50/70'
                }`}
            >
              <span className="w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs leading-none flex-shrink-0">+</span>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {activeAction === 'icons' && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <select
                value={activeCategoryId || 'all'}
                onChange={(e) => setActiveCategoryId(e.target.value)}
                className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs text-[#5f6772]"
              >
                <option value="all">All</option>
                {categories.map((cat) => {
                  const id = cat.id || cat._id;
                  return (
                    <option key={id} value={id}>
                      {cat.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="max-h-64 overflow-y-auto pr-1">
              {isLoadingCategories || isLoadingIcons ? (
                <div className="text-xs text-[#8b9199] py-2">Loading icons…</div>
              ) : !activeIcons || activeIcons.length === 0 ? (
                <div className="text-xs text-[#8b9199] py-2">No icons available.</div>
              ) : (
                <div className="grid grid-cols-7 gap-1.5">
                  {activeIcons.map((icon) => (
                    <button
                      key={icon.id || icon._id}
                      onClick={() => addBackendIcon(icon)}
                      className="h-9 border border-[#d3d6db] rounded bg-white hover:bg-[#f8fafc] flex items-center justify-center"
                      title={icon.name}
                    >
                      <img
                        src={getImageUrl(icon.file_path)}
                        alt={icon.name || ''}
                        className="w-5 h-5 object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeAction === 'text' && (
          <div className="mt-4 space-y-2">
            <input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTextElement()}
              placeholder="Type label..."
              className="w-full h-9 px-3 border border-[#cfd3d9] bg-white text-sm"
            />
            <button
              onClick={addTextElement}
              className="w-full h-9 bg-teal-600 hover:bg-teal-700 text-white text-sm"
            >
              Add text
            </button>
          </div>
        )}

        {activeAction === 'counter' && (
          <div className="mt-4">
            <button
              onClick={addCounterElement}
              className="w-full h-9 bg-white border border-[#cfd3d9] hover:bg-[#f8fafc] text-sm text-[#5f6772]"
            >
              Add counter box
            </button>
          </div>
        )}

        {activeAction === 'image' && (
          <label className="mt-4 flex h-24 border border-dashed border-[#c3c8cf] bg-white hover:bg-[#f9fbfd] cursor-pointer items-center justify-center text-sm text-[#5f6772]">
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            Upload own picture
          </label>
        )}
      </div>
    </div>
  );
};

export default ConfiguratorToolRail;
