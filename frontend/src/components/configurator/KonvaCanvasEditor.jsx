/**
 * Konva Canvas Editor – production-ready replacement modeled after Konva sandbox.
 * Features: multi-select, marquee, transformer, zoom/pan, keyboard shortcuts, snapping.
 */

import {
  Stage,
  Layer,
  Image,
  Text,
  Transformer,
  Rect,
  Circle,
  Line,
  Path,
} from 'react-konva';
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import useStore from '../../store/useStore';
import CanvasControls from './CanvasControls';
import { createArrowPoints } from './utils/shapeUtils';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;
const MOVE_STEP = 1;
const MOVE_STEP_SHIFT = 10;

const KonvaCanvasEditor = forwardRef((props, ref) => {
  const {
    configurator,
    updateElement,
    selectElement,
    setSelectedElements,
    addToSelection,
    removeFromSelection,
    clearSelection,
    deleteSelected,
    addElement,
    setActiveTool,
    undo,
    redo,
    copyElements,
    pasteElements,
    saveToHistory,
  } = useStore();

  const stageRef = useRef();
  const transformerRef = useRef();
  const shapeRefs = useRef({});
  const layerRef = useRef();

  const [images, setImages] = useState({});
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [shapeStart, setShapeStart] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);

  useImperativeHandle(ref, () => stageRef.current);

  // Load images
  useEffect(() => {
    if (configurator.product?.baseImageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = configurator.product.baseImageUrl;
      img.onload = () => setImages((prev) => ({ ...prev, base: img }));
      img.onerror = () => {
        const fallback = new window.Image();
        fallback.src = configurator.product.baseImageUrl;
        fallback.onload = () => setImages((prev) => ({ ...prev, base: fallback }));
      };
    }
    configurator.elements
      .filter((el) => el.type === 'image' && el.src)
      .forEach((element) => {
        if (!images[element.id]) {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = element.src;
          img.onload = () => setImages((prev) => ({ ...prev, [element.id]: img }));
        }
      });
  }, [configurator.product?.baseImageUrl, configurator.elements]); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach transformer to selected nodes
  const selectedIds = configurator.selectedElementIds || [];
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current) return;
    const nodes = selectedIds
      .map((id) => shapeRefs.current[id])
      .filter(Boolean);
    transformerRef.current.nodes(nodes);
    layerRef.current.batchDraw();
  }, [selectedIds]);

  const getStagePoint = useCallback((evt) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    const x = (pos.x - stage.x()) / scale;
    const y = (pos.y - stage.y()) / scale;
    return snapToGrid
      ? {
          x: Math.round(x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(y / GRID_SIZE) * GRID_SIZE,
        }
      : { x, y };
  }, [scale, snapToGrid]);

  const handleStageMouseDown = useCallback((e) => {
    if (e.target !== e.target.getStage()) return;
    const point = getStagePoint(e);
    if (!point) return;

    if (isSpaceDown || e.evt.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.evt.clientX - position.x, y: e.evt.clientY - position.y });
      return;
    }

    if (configurator.activeTool === 'select') {
      clearSelection();
      setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
      return;
    }
    if (configurator.activeTool === 'pen') {
      setIsDrawing(true);
      setDrawingPath([`M ${point.x} ${point.y}`]);
      return;
    }
    if (['rectangle', 'circle', 'line', 'arrow'].includes(configurator.activeTool)) {
      setShapeStart(point);
    }
  }, [configurator.activeTool, clearSelection, getStagePoint, isSpaceDown, position]);

  const handleStageMouseMove = useCallback((e) => {
    if (isPanning) {
      setPosition({
        x: e.evt.clientX - panStart.x,
        y: e.evt.clientY - panStart.y,
      });
      return;
    }
    if (configurator.activeTool === 'pen' && isDrawing) {
      const point = getStagePoint(e);
      if (point) setDrawingPath((prev) => [...prev, `L ${point.x} ${point.y}`]);
      return;
    }
    if (configurator.activeTool === 'select' && selectionRect != null) {
      const point = getStagePoint(e);
      if (point) {
        setSelectionRect((prev) => ({
          ...prev,
          width: point.x - prev.x,
          height: point.y - prev.y,
        }));
      }
    }
  }, [isPanning, panStart, configurator.activeTool, isDrawing, selectionRect, getStagePoint]);

  const handleStageMouseUp = useCallback((e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (e.target !== e.target.getStage()) return;

    if (configurator.activeTool === 'select' && selectionRect) {
      const rect = {
        x: Math.min(selectionRect.x, selectionRect.x + selectionRect.width),
        y: Math.min(selectionRect.y, selectionRect.y + selectionRect.height),
        width: Math.abs(selectionRect.width),
        height: Math.abs(selectionRect.height),
      };
      if (rect.width > 5 || rect.height > 5) {
        const inside = configurator.elements.filter((el) => {
          const ex = el.x ?? 0;
          const ey = el.y ?? 0;
          const ew = el.width ?? 0;
          const eh = el.height ?? 50;
          return (
            ex < rect.x + rect.width &&
            ex + ew > rect.x &&
            ey < rect.y + rect.height &&
            ey + eh > rect.y
          );
        });
        setSelectedElements(inside.map((el) => el.id));
      }
      setSelectionRect(null);
      return;
    }

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
      return;
    }
    if (shapeStart && ['rectangle', 'circle', 'line', 'arrow'].includes(configurator.activeTool)) {
      const point = getStagePoint(e);
      if (point) {
        const w = Math.abs(point.x - shapeStart.x);
        const h = Math.abs(point.y - shapeStart.y);
        if (w > 5 || h > 5) {
          const x = Math.min(shapeStart.x, point.x);
          const y = Math.min(shapeStart.y, point.y);
          if (configurator.activeTool === 'arrow') {
            const pts = createArrowPoints(shapeStart.x, shapeStart.y, point.x, point.y);
            addElement({ type: 'arrow', points: pts, stroke: '#000000', fill: '#000000', strokeWidth: 2, opacity: 1 });
          } else {
            addElement({
              type: configurator.activeTool,
              x, y, width: w || 10, height: h || 10,
              fill: '#000000', stroke: '#000000', strokeWidth: 2, opacity: 1,
            });
          }
        }
      }
      setShapeStart(null);
      setActiveTool('select');
    }
  }, [configurator.activeTool, configurator.elements, isPanning, isDrawing, drawingPath, shapeStart, selectionRect, setSelectedElements, addElement, setActiveTool, getStagePoint]);

  const handleShapeClick = useCallback((e, id) => {
    e.cancelBubble = true;
    if (configurator.activeTool !== 'select') return;

    if (e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey) {
      const ids = configurator.selectedElementIds || [];
      if (ids.includes(id)) removeFromSelection(id);
      else addToSelection(id);
    } else {
      selectElement(id);
    }
  }, [configurator.activeTool, configurator.selectedElementIds, selectElement, addToSelection, removeFromSelection]);

  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage() && configurator.activeTool === 'select') {
      clearSelection();
    }
  }, [configurator.activeTool, clearSelection]);

  const handleDragEnd = useCallback((e, id) => {
    const shape = e.target;
    let x = shape.x();
    let y = shape.y();
    if (snapToGrid) {
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
      shape.x(x);
      shape.y(y);
    }
    updateElement(id, { x, y });
  }, [snapToGrid, updateElement]);

  const handleTransformEnd = useCallback((e, id) => {
    const shape = e.target;
    let x = shape.x();
    let y = shape.y();
    let width = shape.width() * shape.scaleX();
    let height = shape.height() * shape.scaleY();
    const rotation = shape.rotation();
    if (snapToGrid) {
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
      width = Math.max(5, Math.round(width / GRID_SIZE) * GRID_SIZE);
      height = Math.max(5, Math.round(height / GRID_SIZE) * GRID_SIZE);
      shape.x(x);
      shape.y(y);
      shape.width(width);
      shape.height(height);
    }
    shape.scaleX(1);
    shape.scaleY(1);
    updateElement(id, { x, y, width, height, rotation });
  }, [snapToGrid, updateElement]);


  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    if (!e.evt.ctrlKey && !e.evt.metaKey) return;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clamped = Math.max(0.5, Math.min(4, newScale));
    setScale(clamped);
    setPosition({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    });
  }, [scale, position]);

  const handleZoomIn = useCallback(() => setScale((s) => Math.min(4, s + 0.1)), []);
  const handleZoomOut = useCallback(() => setScale((s) => Math.max(0.5, s - 0.1)), []);
  const handleZoomReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Keyboard
  useEffect(() => {
    const onKeyDown = (evt) => {
      if (evt.target.tagName === 'INPUT' || evt.target.tagName === 'TEXTAREA') return;
      if (evt.code === 'Space') {
        evt.preventDefault();
        setIsSpaceDown(true);
      }
      if (evt.key === 'Delete' || evt.key === 'Backspace') {
        if (selectedIds.length > 0) {
          evt.preventDefault();
          deleteSelected();
        }
      }
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'z') {
        evt.preventDefault();
        if (evt.shiftKey) redo();
        else undo();
      }
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'y') {
        evt.preventDefault();
        redo();
      }
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'c') {
        evt.preventDefault();
        copyElements();
      }
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'v') {
        evt.preventDefault();
        pasteElements();
      }
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'a') {
        evt.preventDefault();
        const allIds = configurator.elements.map((el) => el.id);
        if (allIds.length > 0) setSelectedElements(allIds);
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evt.key) && selectedIds.length > 0) {
        evt.preventDefault();
        const step = evt.shiftKey ? MOVE_STEP_SHIFT : MOVE_STEP;
        const dx = evt.key === 'ArrowLeft' ? -step : evt.key === 'ArrowRight' ? step : 0;
        const dy = evt.key === 'ArrowUp' ? -step : evt.key === 'ArrowDown' ? step : 0;
        if (dx || dy) {
          saveToHistory();
          selectedIds.forEach((id) => {
            const el = configurator.elements.find((e) => e.id === id);
            if (el) updateElement(id, { x: (el.x ?? 0) + dx, y: (el.y ?? 0) + dy });
          });
        }
      }
    };
    const onKeyUp = (evt) => {
      if (evt.code === 'Space') {
        evt.preventDefault();
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [selectedIds, configurator.elements, deleteSelected, undo, redo, copyElements, pasteElements, updateElement, saveToHistory, setSelectedElements]);

  const setShapeRef = useCallback((id, node) => {
    if (node) shapeRefs.current[id] = node;
    else delete shapeRefs.current[id];
  }, []);

  const renderElement = (element) => {
    const isSelected = selectedIds.includes(element.id);
    const canDrag = configurator.activeTool === 'select' && !element.locked;
    const common = {
      key: element.id,
      id: element.id,
      ref: (node) => setShapeRef(element.id, node),
      draggable: canDrag,
      onClick: (e) => handleShapeClick(e, element.id),
      onTap: (e) => handleShapeClick(e, element.id),
      onDragEnd: (e) => handleDragEnd(e, element.id),
      onTransformEnd: (e) => handleTransformEnd(e, element.id),
      opacity: element.opacity !== undefined ? element.opacity : 1,
      visible: element.visible !== false,
      listening: element.locked ? false : undefined,
    };

    if (element.type === 'text') {
      return (
        <Text
          {...common}
          text={element.text || ''}
          fontSize={element.fontSize || 24}
          fontFamily={element.fontFamily || 'Arial'}
          fontStyle={element.fontWeight || 'normal'}
          fill={element.color || '#000000'}
          x={element.x ?? 0}
          y={element.y ?? 0}
          width={element.width ?? 200}
          height={element.height ?? 50}
          rotation={element.rotation ?? 0}
          align="left"
          verticalAlign="top"
        />
      );
    }
    if (element.type === 'icon' || element.type === 'sticker') {
      const sz = element.fontSize || 48;
      return (
        <Text
          {...common}
          text={element.text || element.emoji || ''}
          fontSize={sz}
          fontFamily="'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif"
          fill={element.color || '#000000'}
          x={element.x ?? 0}
          y={element.y ?? 0}
          width={element.width ?? sz}
          height={element.height ?? sz}
          rotation={element.rotation ?? 0}
          align="center"
          verticalAlign="middle"
          listening={true}
          hitStrokeWidth={10}
        />
      );
    }
    if (element.type === 'image' && images[element.id]) {
      return (
        <Image
          {...common}
          image={images[element.id]}
          x={element.x ?? 0}
          y={element.y ?? 0}
          width={element.width ?? 100}
          height={element.height ?? 100}
          rotation={element.rotation ?? 0}
        />
      );
    }
    if (element.type === 'rectangle') {
      return (
        <Rect
          {...common}
          x={element.x ?? 0}
          y={element.y ?? 0}
          width={element.width ?? 100}
          height={element.height ?? 100}
          rotation={element.rotation ?? 0}
          fill={element.fill ?? '#000000'}
          stroke={element.stroke ?? '#000000'}
          strokeWidth={element.strokeWidth ?? 2}
          cornerRadius={element.cornerRadius ?? 0}
        />
      );
    }
    if (element.type === 'circle') {
      const r = Math.min(element.width ?? 50, element.height ?? 50) / 2;
      return (
        <Circle
          {...common}
          x={(element.x ?? 0) + r}
          y={(element.y ?? 0) + r}
          radius={r}
          rotation={element.rotation ?? 0}
          fill={element.fill ?? '#000000'}
          stroke={element.stroke ?? '#000000'}
          strokeWidth={element.strokeWidth ?? 2}
        />
      );
    }
    if (element.type === 'line') {
      return (
        <Line
          {...common}
          points={[
            element.x ?? 0,
            element.y ?? 0,
            (element.x ?? 0) + (element.width ?? 100),
            (element.y ?? 0) + (element.height ?? 0),
          ]}
          stroke={element.stroke ?? element.fill ?? '#000000'}
          strokeWidth={element.strokeWidth ?? 2}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    if (element.type === 'arrow') {
      return (
        <Line
          {...common}
          points={element.points || []}
          stroke={element.stroke ?? element.fill ?? '#000000'}
          fill={element.fill ?? element.stroke ?? '#000000'}
          strokeWidth={element.strokeWidth ?? 2}
          lineCap="round"
          lineJoin="round"
          closed={true}
        />
      );
    }
    if (element.type === 'pen' && (element.points || element.data)) {
      const data = Array.isArray(element.points) ? element.points.join(' ') : (element.points || element.data);
      return (
        <Path
          {...common}
          data={data}
          stroke={element.stroke ?? element.fill ?? '#000000'}
          strokeWidth={element.strokeWidth ?? 2}
          fill={element.fill ?? 'transparent'}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    return null;
  };

  const renderGrid = () => {
    if (!showGrid) return null;
    const lines = [];
    for (let i = 0; i <= CANVAS_WIDTH / GRID_SIZE; i++) {
      lines.push(
        <Line key={`v-${i}`} points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_HEIGHT]} stroke="#e5e7eb" strokeWidth={0.5} listening={false} />
      );
    }
    for (let i = 0; i <= CANVAS_HEIGHT / GRID_SIZE; i++) {
      lines.push(
        <Line key={`h-${i}`} points={[0, i * GRID_SIZE, CANVAS_WIDTH, i * GRID_SIZE]} stroke="#e5e7eb" strokeWidth={0.5} listening={false} />
      );
    }
    return lines;
  };

  const rect = selectionRect && (selectionRect.width !== 0 || selectionRect.height !== 0)
    ? {
        x: Math.min(selectionRect.x, selectionRect.x + selectionRect.width),
        y: Math.min(selectionRect.y, selectionRect.y + selectionRect.height),
        width: Math.abs(selectionRect.width),
        height: Math.abs(selectionRect.height),
      }
    : null;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <CanvasControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((g) => !g)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid((s) => !s)}
      />
      <div className="flex-1 overflow-hidden bg-gray-200 relative">
        <div className="w-full h-full overflow-auto p-6">
          <div
            className="inline-block bg-white shadow-2xl border-4 border-gray-400"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, minWidth: CANVAS_WIDTH, minHeight: CANVAS_HEIGHT }}
          >
            <Stage
              ref={stageRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              scaleX={scale}
              scaleY={scale}
              x={position.x}
              y={position.y}
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onMouseLeave={handleStageMouseUp}
              onClick={handleStageClick}
              onTap={handleStageClick}
              onWheel={handleWheel}
              style={{ cursor: isPanning ? 'grabbing' : isSpaceDown ? 'grab' : configurator.activeTool === 'pen' ? 'crosshair' : 'default' }}
            >
              <Layer ref={layerRef}>
                {images.base && (
                  <Image image={images.base} x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} listening={false} />
                )}
                {renderGrid()}
                {configurator.elements.map((el) => renderElement(el))}
                {isDrawing && drawingPath.length > 0 && (
                  <Path data={drawingPath.join(' ')} stroke="#000" strokeWidth={2} lineCap="round" lineJoin="round" listening={false} />
                )}
                {shapeStart && ['rectangle', 'circle', 'line', 'arrow'].includes(configurator.activeTool) && stageRef.current && (() => {
                  const pos = stageRef.current.getPointerPosition();
                  if (!pos) return null;
                  const p = { x: (pos.x - position.x) / scale, y: (pos.y - position.y) / scale };
                  const x = Math.min(shapeStart.x, p.x);
                  const y = Math.min(shapeStart.y, p.y);
                  const w = Math.abs(p.x - shapeStart.x);
                  const h = Math.abs(p.y - shapeStart.y);
                  if (configurator.activeTool === 'rectangle') {
                    return <Rect x={x} y={y} width={w} height={h} fill="transparent" stroke="#3b82f6" strokeWidth={2} dash={[5, 5]} listening={false} />;
                  }
                  if (configurator.activeTool === 'circle') {
                    const r = Math.min(w, h) / 2;
                    return <Circle x={x + r} y={y + r} radius={r} fill="transparent" stroke="#3b82f6" strokeWidth={2} dash={[5, 5]} listening={false} />;
                  }
                  if (configurator.activeTool === 'line') {
                    return <Line points={[shapeStart.x, shapeStart.y, p.x, p.y]} stroke="#3b82f6" strokeWidth={2} dash={[5, 5]} listening={false} />;
                  }
                  if (configurator.activeTool === 'arrow') {
                    const pts = createArrowPoints(shapeStart.x, shapeStart.y, p.x, p.y);
                    return <Line points={pts} stroke="#3b82f6" fill="#3b82f6" strokeWidth={2} dash={[5, 5]} closed listening={false} />;
                  }
                  return null;
                })()}
                {rect && (
                  <Rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[4, 4]}
                    listening={false}
                  />
                )}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) return oldBox;
                    if (snapToGrid) {
                      return {
                        ...newBox,
                        width: Math.round(newBox.width / GRID_SIZE) * GRID_SIZE,
                        height: Math.round(newBox.height / GRID_SIZE) * GRID_SIZE,
                      };
                    }
                    return newBox;
                  }}
                  borderStroke="#3b82f6"
                  borderStrokeWidth={2}
                  anchorFill="#3b82f6"
                  anchorStroke="#fff"
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
});

KonvaCanvasEditor.displayName = 'KonvaCanvasEditor';
export default KonvaCanvasEditor;
