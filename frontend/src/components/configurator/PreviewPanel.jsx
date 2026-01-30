import { useState } from 'react';
import useStore from '../../store/useStore';

const PreviewPanel = () => {
  const { configurator, validateConfiguration } = useStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const isValid = validateConfiguration();
    if (!isValid) {
      alert('Please fix validation errors before exporting');
      return;
    }

    setIsExporting(true);
    try {
      const products = [
        {
          ...configurator.product,
          edits: {
            elements: configurator.elements || [],
            configuration: configurator.configuration || {},
          },
          configurable: true,
        },
      ];
      window.dispatchEvent(new CustomEvent("generatePdf", { detail: { products } }));
      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getLayerDisplayValue = (layer) => {
    const selectedValue = configurator.configuration?.layers?.[layer.id];
    if (!selectedValue) return 'Not selected';

    if (layer.type === 'variant') {
      const variant = layer.variants?.find(v => v.id === selectedValue);
      return variant?.name || selectedValue;
    } else if (layer.type === 'color') {
      return selectedValue;
    } else if (layer.type === 'upload') {
      return 'Custom image uploaded';
    }

    return selectedValue;
  };

  return (
    <div className="flex-1 bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Configuration Status */}
        <div className="bg-white rounded-xl shadow-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Configuration Preview</h3>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              configurator.configuration?.isValid
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                configurator.configuration?.isValid ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {configurator.configuration?.isValid ? 'Valid Configuration' : 'Invalid Configuration'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {configurator.layers?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Layers Configured</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {configurator.textElements?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Text Elements</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {configurator.configuration?.id ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">Configuration Saved</div>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {configurator.validationErrors?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 className="text-lg font-semibold text-red-900">Validation Errors</h4>
            </div>
            <ul className="space-y-2">
              {configurator.validationErrors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-red-700">{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Layer Configuration Summary */}
        <div className="bg-white rounded-xl shadow-premium p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Graphic Layers</h4>
          <div className="space-y-4">
            {configurator.layers?.map(layer => (
              <div key={layer.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium text-gray-900">{layer.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{layer.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{getLayerDisplayValue(layer)}</div>
                  <div className="text-sm text-gray-500">Order: {layer.order || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text Elements Summary */}
        <div className="bg-white rounded-xl shadow-premium p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Text Elements</h4>
          <div className="space-y-4">
            {configurator.textElements?.map(textElement => {
              const config = configurator.configuration?.textElements?.[textElement.id] || {};
              const textValue = config.value || textElement.defaultValue || '';

              return (
                <div key={textElement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">{textElement.label}</h5>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {textValue.length}/{textElement.maxLength}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div
                      className={`text-base text-[${config.color || textElement.color}] font-['${config.font || textElement.font}'] text-${config.alignment || textElement.alignment}`}
                    >
                      {textValue || 'No text entered'}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Font: {config.font || textElement.font}</span>
                    <span>Align: {config.alignment || textElement.alignment}</span>
                    <span>Color: {config.color || textElement.color}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-white rounded-xl shadow-premium p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Configuration Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Product Information</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{configurator.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{configurator.product?.configuratorModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Range:</span>
                  <span className="font-medium capitalize">{configurator.product?.range}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Configuration Info</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium font-mono text-xs">{configurator.configuration?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Modified:</span>
                  <span className="font-medium">
                    {configurator.configuration?.lastModified
                      ? new Date(configurator.configuration.lastModified).toLocaleString()
                      : 'Not saved'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    configurator.configuration?.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {configurator.configuration?.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-premium p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleExportPDF}
              disabled={!configurator.configuration?.isValid || isExporting}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="flex-1 bg-white border-2 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;