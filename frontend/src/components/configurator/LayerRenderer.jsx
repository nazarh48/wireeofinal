import { useState } from 'react';
import useStore from '../../store/useStore';

const LayerRenderer = ({ layer }) => {
  const { updateConfiguratorLayers } = useStore();
  const [selectedVariant, setSelectedVariant] = useState(layer.selectedVariant || '');

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    // Update layer in store
    updateConfiguratorLayers(/* updated layers */);
  };

  const handleVisibilityToggle = () => {
    // Toggle visibility
  };

  return (
    <div className="border rounded p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">{layer.name}</h4>
        <input
          type="checkbox"
          checked={layer.visible}
          onChange={handleVisibilityToggle}
        />
      </div>

      {layer.variants && (
        <div>
          <label className="block text-sm font-medium mb-1">Variant</label>
          <select
            value={selectedVariant}
            onChange={(e) => handleVariantChange(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {layer.variants.map(variant => (
              <option key={variant} value={variant}>{variant}</option>
            ))}
          </select>
        </div>
      )}

      {layer.type === 'color' && (
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="color"
            value={layer.color || '#000000'}
            onChange={() => {/* update color */}}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default LayerRenderer;