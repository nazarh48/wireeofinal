import { useState } from 'react';
import useStore from '../../store/useStore';

const LayerPanel = () => {
  const { configurator, selectElement, deleteElement, bringToFront, sendToBack, bringForward, sendBackward } = useStore();
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const getElementIcon = (type) => {
    switch (type) {
      case 'text':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'rectangle':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
        );
      case 'circle':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'line':
      case 'arrow':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      case 'icon':
      case 'sticker':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'group':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  const getElementName = (element) => {
    if (element.type === 'text') {
      return element.text ? `"${element.text.substring(0, 20)}${element.text.length > 20 ? '...' : ''}"` : 'Text';
    }
    if (element.type === 'icon' || element.type === 'sticker') {
      return element.text || element.emoji || 'Icon';
    }
    if (element.type === 'image') {
      return 'Image';
    }
    if (element.type === 'group') {
      return `Group (${element.children?.length || 0})`;
    }
    return element.type ? element.type.charAt(0).toUpperCase() + element.type.slice(1) : 'Element';
  };

  // Group elements by groupId
  const groupedElements = configurator.elements.reduce((acc, el) => {
    if (el.type === 'group') {
      acc.groups[el.id] = el;
    } else if (el.groupId) {
      if (!acc.grouped[el.groupId]) {
        acc.grouped[el.groupId] = [];
      }
      acc.grouped[el.groupId].push(el);
    } else {
      acc.ungrouped.push(el);
    }
    return acc;
  }, { groups: {}, grouped: {}, ungrouped: [] });

  const renderElement = (element, index) => {
    const isSelected = element.id === configurator.selectedElementId;
    const isGroup = element.type === 'group';
    const children = isGroup ? groupedElements.grouped[element.id] || [] : null;
    const isExpanded = isGroup && expandedGroups.has(element.id);

    return (
      <div key={element.id}>
        <div
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all mb-1 ${
            isSelected
              ? 'bg-blue-100 border-2 border-blue-500'
              : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
          }`}
          onClick={() => selectElement(element.id)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isGroup && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroup(element.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div className="text-gray-500 flex-shrink-0">{getElementIcon(element.type)}</div>
            <span className="text-xs font-medium text-gray-700 truncate flex-1">
              {getElementName(element)}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">#{index + 1}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isSelected && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    bringToFront(element.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Bring to Front"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendToBack(element.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Send to Back"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                  className="p-1 hover:bg-red-100 text-red-600 rounded"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        {isGroup && isExpanded && children && (
          <div className="ml-4 mt-1 space-y-1">
            {children.map((child, childIdx) => (
              <div
                key={child.id}
                className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                  child.id === configurator.selectedElementId
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectElement(child.id);
                }}
              >
                <div className="text-gray-400">{getElementIcon(child.type)}</div>
                <span className="truncate flex-1">{getElementName(child)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render groups first, then ungrouped elements
  const allElements = [
    ...Object.values(groupedElements.groups),
    ...groupedElements.ungrouped,
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Layers</h3>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {configurator.elements.length}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Manage canvas objects</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {allElements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No layers yet</p>
            <p className="text-xs mt-1">Add elements to see them here</p>
          </div>
        ) : (
          allElements.map((element, idx) => renderElement(element, idx))
        )}
      </div>
    </div>
  );
};

export default LayerPanel;
