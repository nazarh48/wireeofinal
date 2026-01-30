import { useState } from 'react';
import useStore from '../../store/useStore';

const TextEditor = () => {
  const { configurator, updateConfiguration } = useStore();
  const [selectedTextElement, setSelectedTextElement] = useState(null);

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

  return (
    <div className="flex-1 bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-premium p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Text Configuration</h3>
            <p className="text-gray-600">Customize text elements and labels for your product</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Text Elements List */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Text Elements</h4>
              <div className="space-y-3">
                {configurator.textElements
                  ?.filter(text => text.editable !== false)
                  ?.map(textElement => {
                    const config = configurator.configuration?.textElements?.[textElement.id] || {};
                    const currentValue = config.value || textElement.defaultValue || '';

                    return (
                      <div
                        key={textElement.id}
                        onClick={() => setSelectedTextElement(textElement)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedTextElement?.id === textElement.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{textElement.label}</h5>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {currentValue.length}/{textElement.maxLength}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          &quot;{currentValue || 'No text entered'}&quot;
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Font: {config.font || textElement.font}</span>
                          <span>•</span>
                          <span>Align: {config.alignment || textElement.alignment}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Text Editor Panel */}
            <div>
              {selectedTextElement ? (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Edit: {selectedTextElement.label}
                  </h4>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Content
                      </label>
                      <textarea
                        value={
                          configurator.configuration?.textElements?.[selectedTextElement.id]?.value ||
                          selectedTextElement.defaultValue ||
                          ''
                        }
                        onChange={(e) => handleTextChange(selectedTextElement.id, 'value', e.target.value)}
                        maxLength={selectedTextElement.maxLength}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder={`Enter ${selectedTextElement.label.toLowerCase()}...`}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        {(
                          configurator.configuration?.textElements?.[selectedTextElement.id]?.value ||
                          selectedTextElement.defaultValue ||
                          ''
                        ).length}/{selectedTextElement.maxLength} characters
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Family
                        </label>
                        <select
                          value={
                            configurator.configuration?.textElements?.[selectedTextElement.id]?.font ||
                            selectedTextElement.font
                          }
                          onChange={(e) => handleTextChange(selectedTextElement.id, 'font', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Alignment
                        </label>
                        <select
                          value={
                            configurator.configuration?.textElements?.[selectedTextElement.id]?.alignment ||
                            selectedTextElement.alignment
                          }
                          onChange={(e) => handleTextChange(selectedTextElement.id, 'alignment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Text Color
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          '#000000', '#333333', '#666666', '#999999', '#FFFFFF',
                          '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
                          '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'
                        ].map(color => (
                          <button
                            key={color}
                            onClick={() => handleTextChange(selectedTextElement.id, 'color', color)}
                            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 bg-[${color}] ${
                              (
                                configurator.configuration?.textElements?.[selectedTextElement.id]?.color ||
                                selectedTextElement.color
                              ) === color
                                ? 'border-green-500 scale-110'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Preview</h5>
                      <div
                        className={`p-4 bg-white rounded border min-h-[60px] flex items-center justify-center text-lg text-[${configurator.configuration?.textElements?.[selectedTextElement.id]?.color || selectedTextElement.color}] font-['${configurator.configuration?.textElements?.[selectedTextElement.id]?.font || selectedTextElement.font}'] text-${configurator.configuration?.textElements?.[selectedTextElement.id]?.alignment || selectedTextElement.alignment}`}
                      >
                        {configurator.configuration?.textElements?.[selectedTextElement.id]?.value ||
                         selectedTextElement.defaultValue ||
                         'Sample text preview'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Select a Text Element</h4>
                  <p className="text-gray-600">Choose a text element from the list to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;