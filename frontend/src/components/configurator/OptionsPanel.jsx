import useStore from '../../store/useStore';

const OptionsPanel = ({ activeTab }) => {
  const { configurator, updateConfiguration } = useStore();

  const handleLayerChange = (layerId, value) => {
    updateConfiguration({
      layers: {
        ...configurator.configuration.layers,
        [layerId]: value
      }
    });
  };

  const handleTextChange = (textId, field, value) => {
    updateConfiguration({
      textElements: {
        ...configurator.configuration.textElements,
        [textId]: {
          ...configurator.configuration.textElements[textId],
          [field]: value
        }
      }
    });
  };

  const renderLayerControls = () => {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Graphic Layers</h4>
          <p className="text-sm text-gray-600 mb-6">
            Customize the visual appearance of your product by selecting different options for each layer.
          </p>
        </div>

        {configurator.layers
          ?.filter(layer => layer.editable !== false)
          ?.map(layer => (
            <div key={layer.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">{layer.name}</h5>
                <span className="text-xs text-gray-500 capitalize bg-white px-2 py-1 rounded">
                  {layer.type}
                </span>
              </div>

              {layer.type === 'variant' && layer.variants && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Variant:
                  </label>
                  <select
                    value={configurator.configuration?.layers?.[layer.id] || ''}
                    onChange={(e) => handleLayerChange(layer.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {layer.variants.map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {layer.type === 'color' && layer.colors && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Color:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {layer.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleLayerChange(layer.id, color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 bg-[${color}] ${
                          configurator.configuration?.layers?.[layer.id] === color
                            ? 'border-green-500 scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {layer.type === 'upload' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Custom Image:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      // Handle file upload
                      const file = e.target.files[0];
                      if (file) {
                        // In a real app, upload to server and get URL
                        console.log('File selected:', file.name);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  const renderTextControls = () => {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Text Elements</h4>
          <p className="text-sm text-gray-600 mb-6">
            Customize text labels and messages on your product.
          </p>
        </div>

        {configurator.textElements
          ?.filter(text => text.editable !== false)
          ?.map(textElement => (
            <div key={textElement.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">{textElement.label}</h5>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  Max: {textElement.maxLength} chars
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Content:
                  </label>
                  <textarea
                    value={configurator.configuration?.textElements?.[textElement.id]?.value || ''}
                    onChange={(e) => handleTextChange(textElement.id, 'value', e.target.value)}
                    maxLength={textElement.maxLength}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder={`Enter ${textElement.label.toLowerCase()}...`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {configurator.configuration?.textElements?.[textElement.id]?.value?.length || 0}/{textElement.maxLength} characters
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font:
                    </label>
                    <select
                      value={configurator.configuration?.textElements?.[textElement.id]?.font || textElement.font}
                      onChange={(e) => handleTextChange(textElement.id, 'font', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alignment:
                    </label>
                    <select
                      value={configurator.configuration?.textElements?.[textElement.id]?.alignment || textElement.alignment}
                      onChange={(e) => handleTextChange(textElement.id, 'alignment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['#000000', '#333333', '#666666', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map(color => (
                      <button
                        key={color}
                        onClick={() => handleTextChange(textElement.id, 'color', color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 bg-[${color}] ${
                          configurator.configuration?.textElements?.[textElement.id]?.color === color
                            ? 'border-green-500 scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  const renderPreviewControls = () => {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h4>
          <p className="text-sm text-gray-600 mb-6">
            Review your complete configuration before saving or exporting.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Selected Layers:</h5>
          <div className="space-y-2">
            {configurator.layers?.map(layer => {
              const selectedValue = configurator.configuration?.layers?.[layer.id];
              if (!selectedValue) return null;

              let displayValue = selectedValue;
              if (layer.type === 'variant') {
                const variant = layer.variants?.find(v => v.id === selectedValue);
                displayValue = variant?.name || selectedValue;
              }

              return (
                <div key={layer.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{layer.name}:</span>
                  <span className="font-medium text-gray-900">{displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Text Elements:</h5>
          <div className="space-y-2">
            {configurator.textElements?.map(textElement => {
              const config = configurator.configuration?.textElements?.[textElement.id];
              if (!config?.value) return null;

              return (
                <div key={textElement.id} className="text-sm">
                  <span className="text-gray-600">{textElement.label}:</span>
                  <div className="font-medium text-gray-900 mt-1 p-2 bg-white rounded border">
                    {config.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {configurator.validationErrors?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-medium text-red-900 mb-2">Validation Errors:</h5>
            <ul className="text-sm text-red-700 space-y-1">
              {configurator.validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        {activeTab === 'layers' && renderLayerControls()}
        {activeTab === 'text' && renderTextControls()}
        {activeTab === 'preview' && renderPreviewControls()}
      </div>
    </div>
  );
};

export default OptionsPanel;