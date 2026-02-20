import { useEffect, useMemo, useState } from 'react';
import useStore from '../../store/useStore';
import { JUNG_ICONS, JUNG_ICON_GROUPS } from './jungIconCatalog';

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

const ConfiguratorToolRail = () => {
  const { configurator, addElement, setActiveTool, updateConfiguratorConfiguration } = useStore();
  const [activeAction, setActiveAction] = useState('icons');
  const [textValue, setTextValue] = useState('');
  const [printMode, setPrintMode] = useState('Colour printing');
  const [individualLabeling, setIndividualLabeling] = useState('');
  const [roomValue, setRoomValue] = useState('');
  const [floorValue, setFloorValue] = useState('1');
  const [iconStyle, setIconStyle] = useState('JUNG Modern');
  const [iconGroup, setIconGroup] = useState('All');

  const filteredIcons = useMemo(() => {
    if (iconGroup === 'All') return JUNG_ICONS;
    return JUNG_ICONS.filter((icon) => icon.group === iconGroup);
  }, [iconGroup]);

  useEffect(() => {
    const cfg = configurator.configuration || {};
    setTextValue('');
    setActiveAction('icons');
    setPrintMode(cfg.processingType || 'Colour printing');
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

  const addIcon = (icon) => {
    addElement({
      type: 'mdiIcon',
      pathData: icon.pathData,
      x: 300,
      y: 110,
      width: 34,
      height: 34,
      fill: '#111827',
      stroke: 'transparent',
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
    <div className="h-full flex flex-col bg-[#f0f7f2] border-r border-teal-200/60">
      <div className="px-4 pt-4 pb-3 border-b border-teal-200/60">
        <div className="text-sm font-medium text-gray-800">
          {configurator.product?.name || 'Product'}
        </div>
        <div className="text-xs text-teal-600/80 mt-0.5">
          {configurator.product?.description || configurator.product?.category || 'Graphic configurator'}
        </div>

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
              <option>Colour printing</option>
              <option>Laser engraving</option>
              <option>UV print</option>
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
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                activeAction === action.id
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
                value={iconStyle}
                onChange={(e) => setIconStyle(e.target.value)}
                className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs text-[#5f6772]"
              >
                <option>JUNG Modern</option>
              </select>
              <select
                value={iconGroup}
                onChange={(e) => setIconGroup(e.target.value)}
                className="h-8 px-2 border border-[#cfd3d9] bg-white text-xs text-[#5f6772]"
              >
                {JUNG_ICON_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div className="max-h-64 overflow-y-auto pr-1">
              <div className="grid grid-cols-7 gap-1.5">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => addIcon(icon)}
                    className="h-9 border border-[#d3d6db] rounded bg-white hover:bg-[#f8fafc] flex items-center justify-center"
                    title={icon.label}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#111827]" fill="currentColor">
                      <path d={icon.pathData} />
                    </svg>
                  </button>
                ))}
              </div>
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
