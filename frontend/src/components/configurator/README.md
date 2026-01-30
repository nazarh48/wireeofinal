# Enhanced Konva.js Canvas Editor

A comprehensive, feature-rich canvas editor built with React, Konva.js, and Zustand for state management.

## Features

### ✅ Core Editing Features
- **Full Image Editing**: Upload, scale, move, and position multiple images
- **Text Tools**: Add, edit, and style text with multiple fonts and colors
- **Shape Tools**: Rectangle, Circle, Line, Arrow, and Free Draw (Pen)
- **Stickers & Emojis**: Extensive library of emojis, stickers, and cliparts organized by categories
- **Icons**: Add custom icons and symbols

### ✅ Color & Styling
- **Color Pickers**: Fill color, stroke color, text color, background color
- **Font Options**: Multiple font families, sizes, weights
- **Opacity Control**: Adjust transparency for all elements
- **Stroke Width**: Customizable stroke width for shapes and lines

### ✅ Object Manipulation
- **Resize**: Drag handles to resize objects
- **Rotate**: Rotate objects with rotation handles
- **Drag & Drop**: Move objects around the canvas
- **Grouping**: Group multiple objects together (store action available)
- **Layer Management**: Full layer panel with visibility and ordering controls

### ✅ Canvas Controls
- **Zoom In/Out**: Mouse wheel or controls (0.5x to 3x)
- **Pan**: Drag canvas to navigate
- **Grid**: Toggle grid overlay (G key)
- **Snap to Grid**: Align objects to grid automatically
- **Fit to Screen**: Zoom to fit canvas

### ✅ Export & Import
- **PNG Export**: High-quality PNG export
- **JPG Export**: JPEG export with quality control
- **SVG Export**: Vector format export
- **JSON Template**: Save and load canvas templates as JSON

### ✅ History & Undo/Redo
- **Undo/Redo**: Full history support (Ctrl+Z / Ctrl+Y)
- **History Limit**: Last 50 states saved
- **Auto-save**: Automatic saving of edits

### ✅ Layer Panel
- **Object List**: View all canvas objects
- **Selection**: Click to select objects
- **Layer Ordering**: Bring to front, send to back, bring forward, send backward
- **Group Management**: Expand/collapse groups
- **Quick Actions**: Delete, duplicate from layer panel

### ✅ Keyboard Shortcuts
- `Delete` / `Backspace`: Delete selected element
- `Ctrl+Z`: Undo
- `Ctrl+Y` / `Ctrl+Shift+Z`: Redo
- `Ctrl+D`: Duplicate selected element
- `Ctrl+A`: Select all (future feature)
- `Ctrl+0`: Reset zoom
- `Ctrl++`: Zoom in
- `Ctrl+-`: Zoom out
- `G`: Toggle grid

## Component Structure

```
configurator/
├── Configurator.jsx          # Main container component
├── EnhancedCanvas.jsx         # Enhanced canvas with all shape types
├── EnhancedToolbar.jsx        # Comprehensive toolbar with all tools
├── LayerPanel.jsx            # Layer management panel
├── CanvasControls.jsx         # Zoom, pan, grid controls
└── utils/
    ├── exportUtils.js        # Export/import functions
    ├── shapeUtils.js         # Shape drawing utilities
    └── stickers.js           # Stickers and emojis library
```

## Usage

The editor is integrated into the main Configurator component:

```jsx
import Configurator from './components/configurator/Configurator';

<Configurator navigate={navigate} isFromProjects={isFromProjects} />
```

## State Management

The editor uses Zustand store (`useStore.js`) with the following key actions:

- `addElement(element)`: Add new element to canvas
- `updateElement(id, updates)`: Update element properties
- `deleteElement(id)`: Remove element
- `selectElement(id)`: Select element
- `setActiveTool(tool)`: Set active drawing tool
- `undo()` / `redo()`: History navigation
- `groupElements(ids)`: Group multiple elements
- `ungroupElements(groupId)`: Ungroup elements
- `importTemplate(template)`: Import JSON template
- `exportAsPNG/JPG/SVG/JSON()`: Export functions

## Element Types

Supported element types:
- `text`: Text elements
- `image`: Image elements
- `rectangle`: Rectangles
- `circle`: Circles
- `line`: Lines
- `arrow`: Arrow shapes
- `pen`: Free-drawn paths
- `icon`: Icon elements
- `sticker`: Sticker/emoji elements
- `group`: Grouped elements

## Export Formats

### PNG
- High quality (2x pixel ratio)
- Full canvas export
- Transparent background support

### JPG
- Configurable quality (default 0.9)
- 2x pixel ratio for sharpness
- RGB format

### SVG
- Vector format
- Scalable without quality loss
- Includes all elements and styling

### JSON Template
- Complete canvas state
- Includes all elements and configuration
- Can be imported to restore canvas

## Performance

- Optimized rendering with Konva Layer batching
- Efficient image loading and caching
- History limited to 50 states
- Grid rendering optimized for large canvases

## Responsive Design

- Works on large and medium screens
- Sidebar panels are collapsible
- Touch-friendly controls
- Adaptive toolbar layout

## Future Enhancements

Potential additions:
- Image cropping
- Filters and effects
- More shape types (polygons, stars)
- Text on path
- Advanced grouping features
- Copy/paste
- Multi-select with selection box
- Alignment tools
- Distribution tools

## Dependencies

- `react`: ^18.2.0
- `react-konva`: ^18.2.0
- `konva`: ^9.2.0
- `zustand`: ^4.3.0

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes

- Canvas dimensions: 800x600 (configurable)
- Grid size: 20px (configurable)
- Maximum zoom: 3x
- Minimum zoom: 0.5x
- History limit: 50 states
