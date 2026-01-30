import { Stage, Layer, Image, Text, Transformer, Rect, Circle, Line, Path } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import useStore from '../../store/useStore';
import CanvasControls from './CanvasControls';

const ConfiguratorCanvas = () => {
  const { configurator, updateElement, selectElement, clearSelection, deleteElement, addElement, setActiveTool, undo, redo } = useStore();
  const [images, setImages] = useState({});
  const [selectedShape, setSelectedShape] = useState(null);
  const transformerRef = useRef();
  const stageRef = useRef();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [shapeStart, setShapeStart] = useState(null);
  const [showGuides, setShowGuides] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  const [gridOpacity, setGridOpacity] = useState(0.15);
  const GRID_SIZE = 20;

  useEffect(() => {
    // Load base product image
    if (configurator.product?.baseImageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = configurator.product.baseImageUrl;
      img.onload = () => {
        setImages(prev => ({ ...prev, base: img }));
      };
      img.onerror = () => {
        console.error(`Failed to load base image: ${configurator.product.baseImageUrl}`);
        // Try without crossOrigin
        const imgFallback = new window.Image();
        imgFallback.src = configurator.product.baseImageUrl;
        imgFallback.onload = () => {
          setImages(prev => ({ ...prev, base: imgFallback }));
        };
        imgFallback.onerror = () => {
          console.error(`Failed to load base image (fallback): ${configurator.product.baseImageUrl}`);
        };
      };
    }

    // Load uploaded images
    configurator.elements
      .filter(el => el.type === 'image' && el.src)
      .forEach(element => {
        if (!images[element.id]) {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = element.src;
          img.onload = () => {
            setImages(prev => ({ ...prev, [element.id]: img }));
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${element.src}`);
          };
        }
      });
  }, [configurator.product, configurator.elements]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (transformerRef.current && selectedShape) {
      transformerRef.current.nodes([selectedShape]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current && !selectedShape) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedShape]);

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    if (stageRef.current) {
      stageRef.current.scaleX(1);
      stageRef.current.scaleY(1);
      stageRef.current.x(0);
      stageRef.current.y(0);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && configurator.selectedElementId) {
        e.preventDefault();
        deleteElement(configurator.selectedElementId);
        clearSelection();
        setSelectedShape(null);
      }
      // Zoom with keyboard
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '0') {
          e.preventDefault();
          handleZoomReset();
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        }
      }
      // Toggle grid
      if (e.key === 'g' || e.key === 'G') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setShowGrid(!showGrid);
        }
      }
      // Duplicate with Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (configurator.selectedElementId) {
          const selectedElement = configurator.elements.find(el => el.id === configurator.selectedElementId);
          if (selectedElement) {
            addElement({
              ...selectedElement,
              x: (selectedElement.x || 0) + 20,
              y: (selectedElement.y || 0) + 20,
            });
          }
        }
      }
      // Undo with Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo with Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [configurator.selectedElementId, configurator.elements, showGrid, deleteElement, clearSelection, addElement]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (e) => {
    if (configurator.activeTool !== 'select') return;
    e.cancelBubble = true;
    const shape = e.target;
    // Don't select if clicking on stage/background
    if (shape.getClassName() === 'Stage' || shape.getClassName() === 'Layer') {
      handleDeselect();
      return;
    }
    setSelectedShape(shape);
    selectElement(shape.id());
  };

  const handleDeselect = () => {
    setSelectedShape(null);
    clearSelection();
  };

  // Drawing handlers for shapes and free draw
  const handleMouseDown = (e) => {
    if (configurator.activeTool === 'select') return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    
    const x = snapToGrid ? Math.round(point.x / GRID_SIZE) * GRID_SIZE : point.x;
    const y = snapToGrid ? Math.round(point.y / GRID_SIZE) * GRID_SIZE : point.y;

    if (configurator.activeTool === 'pen') {
      setIsDrawing(true);
      setDrawingPath([`M ${x} ${y}`]);
    } else if (['rectangle', 'circle', 'line'].includes(configurator.activeTool)) {
      setShapeStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (configurator.activeTool === 'pen' && isDrawing) {
      const stage = e.target.getStage();
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (!point) return;
      
      const x = snapToGrid ? Math.round(point.x / GRID_SIZE) * GRID_SIZE : point.x;
      const y = snapToGrid ? Math.round(point.y / GRID_SIZE) * GRID_SIZE : point.y;
      setDrawingPath(prev => [...prev, `L ${x} ${y}`]);
    }
  };

  const handleMouseUp = (e) => {
    if (configurator.activeTool === 'pen' && isDrawing) {
      if (drawingPath.length > 1) {
        addElement({
          type: 'pen',
          points: drawingPath.join(' '),
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
        });
      }
      setIsDrawing(false);
      setDrawingPath([]);
      setActiveTool('select');
    } else if (shapeStart && ['rectangle', 'circle', 'line'].includes(configurator.activeTool)) {
      const stage = e.target.getStage();
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (!point) return;
      
      const endX = snapToGrid ? Math.round(point.x / GRID_SIZE) * GRID_SIZE : point.x;
      const endY = snapToGrid ? Math.round(point.y / GRID_SIZE) * GRID_SIZE : point.y;
      
      const width = Math.abs(endX - shapeStart.x);
      const height = Math.abs(endY - shapeStart.y);
      const x = Math.min(shapeStart.x, endX);
      const y = Math.min(shapeStart.y, endY);

      if (width > 5 || height > 5) {
        addElement({
          type: configurator.activeTool,
          x,
          y,
          width: width || 10,
          height: height || 10,
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
        });
      }
      setShapeStart(null);
      setActiveTool('select');
    }
  };

  const handleDragEnd = (e) => {
    const shape = e.target;
    let x = shape.x();
    let y = shape.y();
    
    // Snap to grid if enabled
    if (snapToGrid) {
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
      shape.x(x);
      shape.y(y);
    }
    
    updateElement(shape.id(), {
      x,
      y,
    });
  };

  const handleTransformEnd = (e) => {
    const shape = e.target;
    let x = shape.x();
    let y = shape.y();
    let width = shape.width() * shape.scaleX();
    let height = shape.height() * shape.scaleY();
    
    // Snap to grid if enabled
    if (snapToGrid) {
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
      width = Math.round(width / GRID_SIZE) * GRID_SIZE;
      height = Math.round(height / GRID_SIZE) * GRID_SIZE;
      shape.x(x);
      shape.y(y);
      shape.width(width);
      shape.height(height);
    }
    
    updateElement(shape.id(), {
      x,
      y,
      width,
      height,
      rotation: shape.rotation(),
    });
    shape.scaleX(1);
    shape.scaleY(1);
  };

  const renderElement = (element) => {
    const commonProps = {
      key: element.id,
      id: element.id,
      draggable: configurator.activeTool === 'select',
      onClick: configurator.activeTool === 'select' ? handleSelect : undefined,
      onTap: configurator.activeTool === 'select' ? handleSelect : undefined,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
      opacity: element.opacity !== undefined ? element.opacity : 1,
    };

    if (element.type === 'text') {
      return (
        <Text
          {...commonProps}
          text={element.text || ''}
          fontSize={element.fontSize || 24}
          fontFamily={element.fontFamily || 'Arial'}
          fontStyle={element.fontWeight || 'normal'}
          fill={element.color || '#000000'}
          x={element.x || 0}
          y={element.y || 0}
          width={element.width || 200}
          height={element.height || 50}
          rotation={element.rotation || 0}
          align="left"
          verticalAlign="top"
        />
      );
    } else if (element.type === 'icon') {
      const iconSize = element.fontSize || 48;
      return (
        <Text
          {...commonProps}
          text={element.text || ''}
          fontSize={iconSize}
          fontFamily="'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Arial Unicode MS', 'Segoe UI Symbol', Arial, sans-serif"
          fill={element.color || '#000000'}
          x={element.x || 0}
          y={element.y || 0}
          width={element.width || iconSize}
          height={element.height || iconSize}
          rotation={element.rotation || 0}
          align="center"
          verticalAlign="middle"
          listening={true}
          perfectDrawEnabled={false}
          hitStrokeWidth={10}
        />
      );
    } else if (element.type === 'image' && images[element.id]) {
      return (
        <Image
          {...commonProps}
          image={images[element.id]}
          x={element.x || 0}
          y={element.y || 0}
          width={element.width || 100}
          height={element.height || 100}
          rotation={element.rotation || 0}
        />
      );
    } else if (element.type === 'rectangle') {
      return (
        <Rect
          {...commonProps}
          x={element.x || 0}
          y={element.y || 0}
          width={element.width || 100}
          height={element.height || 100}
          rotation={element.rotation || 0}
          fill={element.fill || '#000000'}
          stroke={element.stroke || '#000000'}
          strokeWidth={element.strokeWidth || 2}
        />
      );
    } else if (element.type === 'circle') {
      const radius = Math.min(element.width || 50, element.height || 50) / 2;
      return (
        <Circle
          {...commonProps}
          x={(element.x || 0) + radius}
          y={(element.y || 0) + radius}
          radius={radius}
          rotation={element.rotation || 0}
          fill={element.fill || '#000000'}
          stroke={element.stroke || '#000000'}
          strokeWidth={element.strokeWidth || 2}
        />
      );
    } else if (element.type === 'line') {
      return (
        <Line
          {...commonProps}
          points={[
            element.x || 0,
            element.y || 0,
            (element.x || 0) + (element.width || 100),
            (element.y || 0) + (element.height || 0),
          ]}
          stroke={element.stroke || element.fill || '#000000'}
          strokeWidth={element.strokeWidth || 2}
          lineCap="round"
          lineJoin="round"
        />
      );
    } else if (element.type === 'pen' && element.points) {
      // Convert points array to SVG path string
      const pathData = Array.isArray(element.points) 
        ? element.points.join(' ')
        : element.points;
      return (
        <Path
          {...commonProps}
          data={pathData}
          stroke={element.stroke || element.fill || '#000000'}
          strokeWidth={element.strokeWidth || 2}
          fill={element.fill || 'transparent'}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    return null;
  };

  // Fixed canvas dimensions (internal coordinate system)
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;


  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: (stage.getPointerPosition().x - stage.x()) / oldScale,
      y: (stage.getPointerPosition().y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.5, Math.min(3, newScale));
    
    setScale(clampedScale);
    setPosition({
      x: stage.getPointerPosition().x - mousePointTo.x * clampedScale,
      y: stage.getPointerPosition().y - mousePointTo.y * clampedScale,
    });
  };

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null;
    const lines = [];
    for (let i = 0; i < CANVAS_WIDTH / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_HEIGHT]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    for (let i = 0; i < CANVAS_HEIGHT / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * GRID_SIZE, CANVAS_WIDTH, i * GRID_SIZE]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    return lines;
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Canvas Toolbar */}
      <CanvasControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
      />

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden bg-gray-200 relative">
        <div className="w-full h-full overflow-auto p-6">
          <div className="inline-block bg-white shadow-2xl border-4 border-gray-400" style={{ 
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            minWidth: CANVAS_WIDTH,
            minHeight: CANVAS_HEIGHT
          }}>
            <Stage
              ref={stageRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              scaleX={scale}
              scaleY={scale}
              x={position.x}
              y={position.y}
              onClick={configurator.activeTool === 'select' ? handleDeselect : undefined}
              onTap={configurator.activeTool === 'select' ? handleDeselect : undefined}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              draggable={configurator.activeTool === 'select'}
              onDragEnd={(e) => {
                setPosition({
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              className="bg-white"
              style={{ cursor: configurator.activeTool === 'pen' ? 'crosshair' : configurator.activeTool === 'select' ? 'move' : 'crosshair' }}
            >
              <Layer>
                {/* Base product image - rendered first as background */}
                {images.base && (
                  <Image
                    image={images.base}
                    x={0}
                    y={0}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    listening={false}
                  />
                )}

                {/* Grid - render after background */}
                {renderGrid()}

                {/* Render elements */}
                {configurator.elements.map((element) => renderElement(element))}

                {/* Temporary drawing preview for free draw */}
                {isDrawing && drawingPath.length > 0 && (
                  <Path
                    data={drawingPath.join(' ')}
                    stroke="#000000"
                    strokeWidth={2}
                    lineCap="round"
                    lineJoin="round"
                    listening={false}
                  />
                )}

                {/* Temporary shape preview */}
                {shapeStart && ['rectangle', 'circle', 'line'].includes(configurator.activeTool) && (
                  (() => {
                    const stage = stageRef.current;
                    if (!stage) return null;
                    const point = stage.getPointerPosition();
                    if (!point) return null;
                    const endX = snapToGrid ? Math.round(point.x / GRID_SIZE) * GRID_SIZE : point.x;
                    const endY = snapToGrid ? Math.round(point.y / GRID_SIZE) * GRID_SIZE : point.y;
                    const width = Math.abs(endX - shapeStart.x);
                    const height = Math.abs(endY - shapeStart.y);
                    const x = Math.min(shapeStart.x, endX);
                    const y = Math.min(shapeStart.y, endY);

                    if (configurator.activeTool === 'rectangle') {
                      return (
                        <Rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dash={[5, 5]}
                          listening={false}
                        />
                      );
                    } else if (configurator.activeTool === 'circle') {
                      const radius = Math.min(width, height) / 2;
                      return (
                        <Circle
                          x={x + radius}
                          y={y + radius}
                          radius={radius}
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dash={[5, 5]}
                          listening={false}
                        />
                      );
                    } else if (configurator.activeTool === 'line') {
                      return (
                        <Line
                          points={[shapeStart.x, shapeStart.y, endX, endY]}
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dash={[5, 5]}
                          lineCap="round"
                          listening={false}
                        />
                      );
                    }
                    return null;
                  })()
                )}

                {/* Transformer for selected element */}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Limit resize
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    // Snap to grid if enabled
                    if (snapToGrid) {
                      const snappedWidth = Math.round(newBox.width / GRID_SIZE) * GRID_SIZE;
                      const snappedHeight = Math.round(newBox.height / GRID_SIZE) * GRID_SIZE;
                      return {
                        ...newBox,
                        width: snappedWidth,
                        height: snappedHeight,
                      };
                    }
                    return newBox;
                  }}
                  borderEnabled={true}
                  borderStroke="#3b82f6"
                  borderStrokeWidth={2}
                  anchorFill="#3b82f6"
                  anchorStroke="#ffffff"
                  anchorStrokeWidth={2}
                  anchorSize={8}
                  rotateEnabled={true}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
                />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorCanvas;