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
import { getPermittedAreasForProduct } from './permittedAreasConfig';
import { computeMaskBoundsFromImage, clampDragPosition } from '../ConfiguratorV2/LayerManager';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;
const MOVE_STEP = 1;
const MOVE_STEP_SHIFT = 10;
const MIN_CANVAS_PADDING = 80;

const loadCanvasImage = (src, onLoad, onError) => {
  if (!src) {
    onError?.();
    return;
  }

  const primary = new window.Image();
  primary.crossOrigin = 'anonymous';
  primary.onload = () => onLoad(primary);
  primary.onerror = () => {
    const fallback = new window.Image();
    fallback.onload = () => onLoad(fallback);
    fallback.onerror = () => onError?.();
    fallback.src = src;
  };
  primary.src = src;
};

const KonvaCanvasEditor = forwardRef(({ onCanvasInfo }, ref) => {
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
    setBackgroundSelected,
    updateConfiguratorConfiguration,
  } = useStore();

  const stageRef = useRef();
  const viewportRef = useRef(null);
  const transformerRef = useRef();
  const backgroundTransformerRef = useRef();
  const backgroundNodeRef = useRef(null);
  const shapeRefs = useRef({});
  const layerRef = useRef();
  const imageSrcByIdRef = useRef({});

  // Layered images for V2-style configurator
  const [baseImage, setBaseImage] = useState(null);           // Layer 1 – device/base photo
  const [defaultBgImage, setDefaultBgImage] = useState(null); // Layer 2 – default background (unused when empty)
  const [customBgImage, setCustomBgImage] = useState(null);   // Layer 2 – user-uploaded background
  const [maskImage, setMaskImage] = useState(null);           // Layer 3 – engraving mask
  const [maskBounds, setMaskBounds] = useState(null);         // Allowed zone derived from mask

  const [images, setImages] = useState({});
  const [baseImageSize, setBaseImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [shapeStart, setShapeStart] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const permittedAreas = getPermittedAreasForProduct(
    configurator.product?.id,
  );

  const canvasWidth = configurator.configuration?.canvasWidth || CANVAS_WIDTH;
  const canvasHeight = configurator.configuration?.canvasHeight || CANVAS_HEIGHT;
  const backgroundWidth = configurator.configuration?.backgroundWidth || canvasWidth;
  const backgroundHeight = configurator.configuration?.backgroundHeight || canvasHeight;
  const backgroundX = configurator.configuration?.backgroundX ?? 0;
  const backgroundY = configurator.configuration?.backgroundY ?? 0;

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (!canvasWidth || !canvasHeight) return;

    const availableW = viewport.clientWidth - 8;
    const availableH = viewport.clientHeight - 8;
    if (availableW <= 0 || availableH <= 0) return;

    const nextScale = Math.max(0.2, Math.min(4, Math.min(availableW / canvasWidth, availableH / canvasHeight)));
    setScale(nextScale);
    setPosition({
      x: (canvasWidth - canvasWidth * nextScale) / 2,
      y: (canvasHeight - canvasHeight * nextScale) / 2,
    });
  }, [canvasWidth, canvasHeight]);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
    fitToScreen,
  }), [fitToScreen]);

  // Derive product-layer image URLs (normalized in useStore.normalizeProduct)
  const product = configurator.product || {};
  const asBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
  const isPrintingProduct = product?.printingEnabled === true || product?.printingEnabled === 'true';

  // Background customization is a printing-only feature. When admin disables it,
  // don't allow selection/dragging of the background layer.
  const canCustomizeBackground = isPrintingProduct
    ? (product?.backgroundEnabled !== undefined
      ? asBool(product?.backgroundEnabled)
      : asBool(product?.backgroundCustomizable))
    : false;

  // Icons/text editing is also printing-only.
  const iconsTextEnabled = isPrintingProduct
    ? (product?.iconsTextEnabled !== undefined ? asBool(product?.iconsTextEnabled) : true)
    : true;
  const lockIconsTextEditing = isPrintingProduct && !iconsTextEnabled;

  const isIconOrTextElement = (el) =>
    !!el && (
      el.type === 'text' ||
      el.type === 'icon' ||
      el.type === 'mdiIcon' ||
      ((el.type === 'image' || el.type === 'sticker') && el.iconId)
    );
  // Layer 1: ALWAYS prefer the dedicated base device image uploaded in Admin.
  // Fallbacks (configurator/baseImageUrl) are kept only as safety nets.
  const layer1Src =
    product.baseDeviceImageUrl ||
    product.baseImageUrl ||
    product.configuratorImageUrl ||
    "";

  // Layer 2: by default, no background image. It is only shown when the user
  // uploads a custom background in the editor (backgroundImageDataUrl).
  // This keeps the 4-layer model aligned with the spec:
  // - Layer 1: device photo (admin)
  // - Layer 2: user background (frontend)
  const layer2DefaultSrc = "";
  const maskSrc = product.engravingMaskImageUrl || '';
  const backgroundImageDataUrl = configurator.configuration?.backgroundImage || null;

  // Load base device image (Layer 1), default background (Layer 2), mask (Layer 3),
  // and any element images (user layer).
  useEffect(() => {
    // Layer 1 – base device image
    if (layer1Src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = layer1Src;
      img.onload = () => {
        setBaseImage(img);
        const nextSize = {
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
        };
        setBaseImageSize(nextSize);
        if (typeof onCanvasInfo === 'function') {
          onCanvasInfo({
            canvasWidth,
            canvasHeight,
            baseImageWidth: nextSize.width,
            baseImageHeight: nextSize.height,
          });
        }
      };
      img.onerror = () => {
        const fallback = new window.Image();
        fallback.src = layer1Src;
        fallback.onload = () => {
          setBaseImage(fallback);
          const nextSize = {
            width: fallback.naturalWidth || fallback.width || 0,
            height: fallback.naturalHeight || fallback.height || 0,
          };
          setBaseImageSize(nextSize);
          if (typeof onCanvasInfo === 'function') {
            onCanvasInfo({
              canvasWidth,
              canvasHeight,
              baseImageWidth: nextSize.width,
              baseImageHeight: nextSize.height,
            });
          }
        };
      };
    } else {
      setBaseImage(null);
      setBaseImageSize({ width: 0, height: 0 });
    }

    // Layer 2 – default background (from product)
    if (layer2DefaultSrc) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = layer2DefaultSrc;
      img.onload = () => setDefaultBgImage(img);
      img.onerror = () => {
        const fallback = new window.Image();
        fallback.src = layer2DefaultSrc;
        fallback.onload = () => setDefaultBgImage(fallback);
      };
    } else {
      setDefaultBgImage(null);
    }

    // Layer 3 – engraving mask image
    if (maskSrc) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = maskSrc;
      img.onload = () => setMaskImage(img);
      img.onerror = () => setMaskImage(null);
    } else {
      setMaskImage(null);
    }

    // User layer – image elements
    configurator.elements
      .filter((el) => el.type === 'image' && el.src)
      .forEach((element) => {
        const currentSrc = imageSrcByIdRef.current[element.id];
        if (currentSrc !== element.src) {
          loadCanvasImage(
            element.src,
            (img) => {
              imageSrcByIdRef.current[element.id] = element.src;
              setImages((prev) => ({ ...prev, [element.id]: img }));
            },
            () => setImages((prev) => {
              delete imageSrcByIdRef.current[element.id];
              if (!prev[element.id]) return prev;
              const next = { ...prev };
              delete next[element.id];
              return next;
            })
          );
        }
      });

    const activeImageIds = new Set(
      configurator.elements
        .filter((el) => el.type === 'image' && el.src)
        .map((el) => el.id)
    );

    Object.keys(imageSrcByIdRef.current).forEach((id) => {
      if (!activeImageIds.has(id)) delete imageSrcByIdRef.current[id];
    });

    setImages((prev) => {
      const next = { ...prev };
      let changed = false;

      Object.keys(next).forEach((id) => {
        if (!activeImageIds.has(id)) {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [layer1Src, layer2DefaultSrc, maskSrc, configurator.elements, canvasWidth, canvasHeight]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load user-uploaded background (Layer 2 – custom)
  useEffect(() => {
    if (!backgroundImageDataUrl) {
      setCustomBgImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = backgroundImageDataUrl;
    img.onload = () => setCustomBgImage(img);
    img.onerror = () => setCustomBgImage(null);
  }, [backgroundImageDataUrl]);

  // Keep canvas info in sync when canvas size changes (e.g. Fit to screen).
  useEffect(() => {
    if (typeof onCanvasInfo !== 'function') return;
    if (!baseImageSize.width || !baseImageSize.height) return;
    onCanvasInfo({
      canvasWidth,
      canvasHeight,
      baseImageWidth: baseImageSize.width,
      baseImageHeight: baseImageSize.height,
    });
  }, [canvasWidth, canvasHeight, baseImageSize.width, baseImageSize.height, onCanvasInfo]);

  // Keep canvas slightly larger than base device image so editing has breathing room.
  // Also prevents canvas shrink from implicitly "resizing" perceived product area.
  useEffect(() => {
    const baseW = baseImageSize.width || 0;
    const baseH = baseImageSize.height || 0;
    if (!baseW || !baseH) return;
    const minW = baseW + MIN_CANVAS_PADDING;
    const minH = baseH + MIN_CANVAS_PADDING;
    if (canvasWidth >= minW && canvasHeight >= minH) return;
    updateConfiguratorConfiguration({
      canvasWidth: Math.max(canvasWidth, minW),
      canvasHeight: Math.max(canvasHeight, minH),
    });
  }, [baseImageSize.width, baseImageSize.height, canvasWidth, canvasHeight, updateConfiguratorConfiguration]);

  // Allowed zone for dragging/resizing:
  // For this editor we want users to be able to place elements anywhere
  // inside the visible canvas, so we always treat the whole canvas as allowed.
  useEffect(() => {
    if (!canvasWidth || !canvasHeight) {
      setMaskBounds(null);
      return;
    }
    setMaskBounds({
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    });
  }, [canvasWidth, canvasHeight]);

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

  // Attach a dedicated transformer to the background image when background is selected.
  useEffect(() => {
    const tr = backgroundTransformerRef.current;
    const node = backgroundNodeRef.current;
    if (!tr) return;
    if (
      configurator.backgroundSelected &&
      canCustomizeBackground &&
      node &&
      selectedIds.length === 0
    ) {
      tr.nodes([node]);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [configurator.backgroundSelected, canCustomizeBackground, selectedIds.length, backgroundImageDataUrl, defaultBgImage]);

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
      setBackgroundSelected(false);
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
  }, [configurator.activeTool, clearSelection, getStagePoint, isSpaceDown, position, setBackgroundSelected]);

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
        const selectable = lockIconsTextEditing
          ? inside.filter((el) => !isIconOrTextElement(el))
          : inside;
        setSelectedElements(selectable.map((el) => el.id));
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
  }, [configurator.activeTool, configurator.elements, isPanning, isDrawing, drawingPath, shapeStart, selectionRect, setSelectedElements, addElement, setActiveTool, getStagePoint, lockIconsTextEditing]);

  const handleShapeClick = useCallback((e, id) => {
    e.cancelBubble = true;
    if (configurator.activeTool !== 'select') return;
    setBackgroundSelected(false);

    const clicked = configurator.elements.find((el) => el.id === id);
    if (lockIconsTextEditing && isIconOrTextElement(clicked)) return;

    if (e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey) {
      const ids = configurator.selectedElementIds || [];
      if (ids.includes(id)) removeFromSelection(id);
      else addToSelection(id);
    } else {
      selectElement(id);
    }
  }, [configurator.activeTool, configurator.selectedElementIds, configurator.elements, selectElement, addToSelection, removeFromSelection, setBackgroundSelected, lockIconsTextEditing]);

  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage() && configurator.activeTool === 'select') {
      clearSelection();
      setBackgroundSelected(false);
    }
  }, [configurator.activeTool, clearSelection, setBackgroundSelected]);

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
    const el = configurator.elements.find((elem) => elem.id === id);
    const width = el?.width ?? shape.width();
    const height = el?.height ?? shape.height();

    const size = { width, height };

    // Prefer mask-derived allowed zone; fall back to static permittedAreas config.
    let nextPos = { x, y };
    if (maskBounds) {
      nextPos = clampDragPosition(nextPos, maskBounds, size);
    } else if (permittedAreas && permittedAreas.length > 0) {
      const area = permittedAreas[0];
      nextPos = {
        x: Math.min(
          Math.max(nextPos.x, area.x),
          area.x + area.width - width,
        ),
        y: Math.min(
          Math.max(nextPos.y, area.y),
          area.y + area.height - height,
        ),
      };
    }

    shape.x(nextPos.x);
    shape.y(nextPos.y);
    updateElement(id, { x: nextPos.x, y: nextPos.y });
  }, [snapToGrid, updateElement, configurator.elements, maskBounds, permittedAreas]);

  const handleTransformEnd = useCallback((e, id) => {
    const shape = e.target;
    const currentElement = configurator.elements.find((elem) => elem.id === id);

    if (lockIconsTextEditing && isIconOrTextElement(currentElement)) return;

    if (currentElement?.type === 'mdiIcon') {
      let x = shape.x();
      let y = shape.y();
      let width = Math.max(8, (currentElement.width ?? 34) * shape.scaleX());
      let height = Math.max(8, (currentElement.height ?? 34) * shape.scaleY());
      const rotation = shape.rotation();

      if (snapToGrid) {
        x = Math.round(x / GRID_SIZE) * GRID_SIZE;
        y = Math.round(y / GRID_SIZE) * GRID_SIZE;
        width = Math.max(8, Math.round(width / GRID_SIZE) * GRID_SIZE);
        height = Math.max(8, Math.round(height / GRID_SIZE) * GRID_SIZE);
      }

      shape.scaleX(1);
      shape.scaleY(1);
      shape.x(x);
      shape.y(y);
      updateElement(id, { x, y, width, height, rotation });
      return;
    }

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

    let rect = { x, y, width, height };
    if (maskBounds) {
      const clampedPos = clampDragPosition({ x: rect.x, y: rect.y }, maskBounds, {
        width: rect.width,
        height: rect.height,
      });
      rect = { ...rect, ...clampedPos };
    } else if (permittedAreas && permittedAreas.length > 0) {
      const area = permittedAreas[0];
      const nx = Math.min(
        Math.max(rect.x, area.x),
        area.x + area.width - rect.width,
      );
      const ny = Math.min(
        Math.max(rect.y, area.y),
        area.y + area.height - rect.height,
      );
      rect = { ...rect, x: nx, y: ny };
    }

    shape.x(rect.x);
    shape.y(rect.y);
    shape.width(rect.width);
    shape.height(rect.height);
    updateElement(id, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      rotation,
    });
  }, [snapToGrid, updateElement, permittedAreas, configurator.elements, maskBounds, lockIconsTextEditing]);


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
        const allIds = configurator.elements
          .filter((el) => !lockIconsTextEditing || !isIconOrTextElement(el))
          .map((el) => el.id);
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
  }, [selectedIds, configurator.elements, deleteSelected, undo, redo, copyElements, pasteElements, updateElement, saveToHistory, setSelectedElements, lockIconsTextEditing]);

  const setShapeRef = useCallback((id, node) => {
    if (node) shapeRefs.current[id] = node;
    else delete shapeRefs.current[id];
  }, []);

  const renderElement = (element) => {
    const isSelected = selectedIds.includes(element.id);
    const canDrag =
      configurator.activeTool === 'select' &&
      !element.locked &&
      (!lockIconsTextEditing || !isIconOrTextElement(element));
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
      const fontWeight = element.fontWeight || 'normal';
      const fontStyle = element.fontStyle || 'normal';
      const mergedFontStyle = fontWeight === 'bold' && fontStyle === 'italic'
        ? 'bold italic'
        : fontWeight === 'bold'
          ? 'bold'
          : fontStyle === 'italic'
            ? 'italic'
            : 'normal';
      return (
        <Text
          {...common}
          text={element.text || ''}
          fontSize={element.fontSize || 24}
          fontFamily={element.fontFamily || 'Arial'}
          fontStyle={mergedFontStyle}
          fill={element.color || '#000000'}
          x={element.x ?? 0}
          y={element.y ?? 0}
          width={element.width ?? 200}
          height={element.height ?? 50}
          rotation={element.rotation ?? 0}
          align={element.align || 'left'}
          verticalAlign="top"
          listening={true}
          hitStrokeWidth={20}
          perfectDrawEnabled={false}
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
          hitStrokeWidth={20}
          perfectDrawEnabled={false}
        />
      );
    }
    if (element.type === 'mdiIcon' && element.pathData) {
      const w = element.width ?? 34;
      const h = element.height ?? 34;
      return (
        <Path
          {...common}
          data={element.pathData}
          x={element.x ?? 0}
          y={element.y ?? 0}
          scaleX={w / 24}
          scaleY={h / 24}
          rotation={element.rotation ?? 0}
          fill={element.fill ?? element.color ?? '#111827'}
          stroke={element.stroke ?? 'transparent'}
          strokeWidth={element.strokeWidth ?? 1}
          listening={true}
          hitStrokeWidth={12}
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
          listening={true}
          hitStrokeWidth={16}
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
    for (let i = 0; i <= canvasWidth / GRID_SIZE; i++) {
      lines.push(
        <Line key={`v-${i}`} points={[i * GRID_SIZE, 0, i * GRID_SIZE, canvasHeight]} stroke="#e5e7eb" strokeWidth={0.5} listening={false} />
      );
    }
    for (let i = 0; i <= canvasHeight / GRID_SIZE; i++) {
      lines.push(
        <Line key={`h-${i}`} points={[0, i * GRID_SIZE, canvasWidth, i * GRID_SIZE]} stroke="#e5e7eb" strokeWidth={0.5} listening={false} />
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
    <div className="flex h-full w-full flex-col bg-slate-100">
      <CanvasControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((g) => !g)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid((s) => !s)}
        zoomLabel={`${Math.round(scale * 100)}%`}
      />
      <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(226,232,240,0.9)_45%,_rgba(203,213,225,0.95))]">
        <div ref={viewportRef} className="flex h-full w-full items-start justify-center overflow-auto p-1.5 sm:p-2">
          <div
            className="inline-block rounded-[20px] border border-slate-300 bg-white p-1.5 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.55)]"
            style={{ width: canvasWidth, minWidth: canvasWidth }}
          >
            <Stage
              ref={stageRef}
              width={canvasWidth}
              height={canvasHeight}
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
              {/* Layer 2 – background image (default or custom upload).
                  Drawn FIRST so it sits behind the device photo. */}
              <Layer name="background-layer">
                {customBgImage && (
                  <Image
                    ref={(node) => {
                      backgroundNodeRef.current = node || null;
                    }}
                    image={customBgImage}
                    x={backgroundX}
                    y={backgroundY}
                    width={backgroundWidth}
                    height={backgroundHeight}
                    listening={canCustomizeBackground}
                    draggable={configurator.backgroundSelected && canCustomizeBackground}
                    onDragEnd={(e) => {
                      const node = e.target;
                      updateConfiguratorConfiguration({
                        backgroundX: node.x(),
                        backgroundY: node.y(),
                      });
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX() || 1;
                      const scaleY = node.scaleY() || 1;
                      const nextWidth = Math.max(10, (node.width() || backgroundWidth) * scaleX);
                      const nextHeight = Math.max(10, (node.height() || backgroundHeight) * scaleY);
                      node.scaleX(1);
                      node.scaleY(1);
                      updateConfiguratorConfiguration({
                        backgroundX: node.x(),
                        backgroundY: node.y(),
                        backgroundWidth: nextWidth,
                        backgroundHeight: nextHeight,
                      });
                    }}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      if (!canCustomizeBackground) return;
                      if (configurator.activeTool !== 'select') return;
                      clearSelection();
                      setBackgroundSelected(true);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      if (!canCustomizeBackground) return;
                      if (configurator.activeTool !== 'select') return;
                      clearSelection();
                      setBackgroundSelected(true);
                    }}
                  />
                )}
                {!customBgImage && defaultBgImage && (
                  <Image
                    ref={(node) => {
                      backgroundNodeRef.current = node || null;
                    }}
                    image={defaultBgImage}
                    x={backgroundX}
                    y={backgroundY}
                    width={backgroundWidth}
                    height={backgroundHeight}
                    listening={canCustomizeBackground}
                    draggable={configurator.backgroundSelected && canCustomizeBackground}
                    onDragEnd={(e) => {
                      const node = e.target;
                      updateConfiguratorConfiguration({
                        backgroundX: node.x(),
                        backgroundY: node.y(),
                      });
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX() || 1;
                      const scaleY = node.scaleY() || 1;
                      const nextWidth = Math.max(10, (node.width() || backgroundWidth) * scaleX);
                      const nextHeight = Math.max(10, (node.height() || backgroundHeight) * scaleY);
                      node.scaleX(1);
                      node.scaleY(1);
                      updateConfiguratorConfiguration({
                        backgroundX: node.x(),
                        backgroundY: node.y(),
                        backgroundWidth: nextWidth,
                        backgroundHeight: nextHeight,
                      });
                    }}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      if (!canCustomizeBackground) return;
                      if (configurator.activeTool !== 'select') return;
                      clearSelection();
                      setBackgroundSelected(true);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      if (!canCustomizeBackground) return;
                      if (configurator.activeTool !== 'select') return;
                      clearSelection();
                      setBackgroundSelected(true);
                    }}
                  />
                )}
                {configurator.backgroundSelected && canCustomizeBackground && selectedIds.length === 0 && (
                  <Transformer
                    ref={backgroundTransformerRef}
                    name="background-transformer"
                    rotateEnabled={false}
                    keepRatio={false}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
                    borderStroke="#0d9488"
                    borderStrokeWidth={2}
                    anchorFill="#0d9488"
                    anchorStroke="#fff"
                    anchorStrokeWidth={2}
                    anchorSize={8}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 10 || newBox.height < 10) return oldBox;
                      return newBox;
                    }}
                  />
                )}
              </Layer>

              {/* Layer 1 – base device image (locked) – drawn above background */}
              <Layer name="base-layer">
                {baseImage && (() => {
                  const iw = baseImageSize.width || baseImage.width || CANVAS_WIDTH;
                  const ih = baseImageSize.height || baseImage.height || canvasHeight;
                  // Product image stays at its intrinsic dimensions; canvas size changes
                  // must not change device size.
                  const drawW = iw;
                  const drawH = ih;
                  const x = (canvasWidth - drawW) / 2;
                  const y = (canvasHeight - drawH) / 2;
                  return (
                    <Image image={baseImage} x={x} y={y} width={drawW} height={drawH} listening={false} />
                  );
                })()}
              </Layer>

              {/* Layer 3 – mask overlay / allowed zone */}
              <Layer name="mask-layer">
                {maskImage && (
                  <Image
                    image={maskImage}
                    x={0}
                    y={0}
                    width={canvasWidth}
                    height={canvasHeight}
                    opacity={0.35}
                    listening={false}
                  />
                )}
              </Layer>

              {/* Grid & guides */}
              <Layer>
                {renderGrid()}
              </Layer>

              {/* Layer 4 – user personalization layer (icons, text, shapes) */}
              <Layer ref={layerRef} name="user-layer">
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
                    return <Rect x={x} y={y} width={w} height={h} fill="transparent" stroke="#0d9488" strokeWidth={2} dash={[5, 5]} listening={false} />;
                  }
                  if (configurator.activeTool === 'circle') {
                    const r = Math.min(w, h) / 2;
                    return <Circle x={x + r} y={y + r} radius={r} fill="transparent" stroke="#0d9488" strokeWidth={2} dash={[5, 5]} listening={false} />;
                  }
                  if (configurator.activeTool === 'line') {
                    return <Line points={[shapeStart.x, shapeStart.y, p.x, p.y]} stroke="#0d9488" strokeWidth={2} dash={[5, 5]} listening={false} />;
                  }
                  if (configurator.activeTool === 'arrow') {
                    const pts = createArrowPoints(shapeStart.x, shapeStart.y, p.x, p.y);
                    return <Line points={pts} stroke="#0d9488" fill="#0d9488" strokeWidth={2} dash={[5, 5]} closed listening={false} />;
                  }
                  return null;
                })()}
                {rect && (
                  <Rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill="rgba(13, 148, 136, 0.1)"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dash={[4, 4]}
                    listening={false}
                  />
                )}
                {/* Only mount Transformer when something is selected so it doesn't block clicks on shapes */}
                {selectedIds.length > 0 && (
                  <Transformer
                    ref={transformerRef}
                    name="transformer"
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
                    borderStroke="#0d9488"
                    borderStrokeWidth={2}
                    anchorFill="#0d9488"
                    anchorStroke="#fff"
                    anchorStrokeWidth={2}
                    anchorSize={8}
                    rotateEnabled={true}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
                  />
                )}
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
