import { Stage, Layer, Image, Text, Rect, Circle, Line, Path } from 'react-konva';
import { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const loadPreviewImage = (src, onLoad, onError) => {
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

const EditedProductPreview = ({ product, edits, width = 300, height = 200, stageRef: externalStageRef, onClick }) => {
  const [images, setImages] = useState({});
  const imageSrcByIdRef = useRef({});
  const [baseImage, setBaseImage] = useState(null);
  const [baseImageSize, setBaseImageSize] = useState({ width: 0, height: 0 });
  const [backgroundImage, setBackgroundImage] = useState(null);
  const containerRef = useRef(null);
  const [resolvedWidth, setResolvedWidth] = useState(width || 300);

  // Keep edited image as fallback only; render from elements first to avoid editor-grid snapshots.
  const editedImageUrl = product?.editedImage?.value || null;
  const hasElements = Array.isArray(edits?.elements) && edits.elements.length > 0;
  const configuration = edits?.configuration || {};
  const backgroundImageDataUrl = configuration.backgroundImage || null;
  const hasBackground = !!backgroundImageDataUrl;

  // Use the same base device image as the editor canvas so previews match exported results.
  // Fallbacks keep behavior safe if baseDeviceImageUrl is not set.
  const baseImageUrl =
    product?.baseDeviceImageUrl ||
    product?.configuratorImageUrl ||
    product?.baseImageUrl;

  useEffect(() => {
    if (editedImageUrl) return;
    let cancelled = false;
    if (baseImageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = baseImageUrl;
      img.onload = () => {
        if (!cancelled && img.src) {
          setBaseImage(img);
          setBaseImageSize({
            width: img.naturalWidth || img.width || 0,
            height: img.naturalHeight || img.height || 0,
          });
        }
      };
    } else {
      setBaseImage(null);
      setBaseImageSize({ width: 0, height: 0 });
    }
    return () => { cancelled = true; setBaseImage(null); setBaseImageSize({ width: 0, height: 0 }); };
  }, [editedImageUrl, baseImageUrl]);

  useEffect(() => {
    if (edits?.elements) {
      edits.elements
        .filter(el => el.type === 'image' && el.src)
        .forEach(element => {
          const currentSrc = imageSrcByIdRef.current[element.id];
          if (currentSrc !== element.src) {
            loadPreviewImage(
              element.src,
              (img) => {
                imageSrcByIdRef.current[element.id] = element.src;
                setImages(prev => ({ ...prev, [element.id]: img }));
              },
              () => {
                setImages((prev) => {
                  delete imageSrcByIdRef.current[element.id];
                  if (!prev[element.id]) return prev;
                  const next = { ...prev };
                  delete next[element.id];
                  return next;
                });
              }
            );
          }
        });

      const activeImageIds = new Set(
        edits.elements
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
    }
  }, [edits, images]);

  // Load user-uploaded background image (same behavior as configurator canvas)
  useEffect(() => {
    if (!backgroundImageDataUrl) {
      setBackgroundImage(null);
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = backgroundImageDataUrl;
    img.onload = () => {
      if (!cancelled) {
        setBackgroundImage(img);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setBackgroundImage(null);
      }
    };
    return () => {
      cancelled = true;
      setBackgroundImage(null);
    };
  }, [backgroundImageDataUrl]);

  useEffect(() => {
    if (width) {
      setResolvedWidth(width);
      return;
    }
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const measured = Math.max(1, Math.floor(entries?.[0]?.contentRect?.width || 0));
      if (measured) setResolvedWidth(measured);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [width]);

  const renderElement = (element) => {
    const x = element.x ?? 0;
    const y = element.y ?? 0;
    const w = element.width ?? 100;
    const h = element.height ?? 50;
    const rot = element.rotation ?? 0;
    const stroke = element.stroke ?? element.fill ?? '#ff0000';
    const strokeWidth = Math.max(1, element.strokeWidth ?? 4);
    const fill = element.fill ?? 'transparent';

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
          key={element.id}
          text={element.text || ''}
          fontSize={element.fontSize || 24}
          fontFamily={element.fontFamily || 'Arial'}
          fontStyle={mergedFontStyle}
          fill={element.color || '#000000'}
          x={x}
          y={y}
          width={element.width ?? 200}
          height={element.height ?? 50}
          rotation={rot}
          align={element.align || 'left'}
        />
      );
    }
    if (element.type === 'icon' || element.type === 'sticker') {
      return (
        <Text
          key={element.id}
          text={element.text || element.emoji || ''}
          fontSize={element.fontSize || 48}
          fontFamily="'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Arial Unicode MS', Arial, sans-serif"
          fill={element.color || '#000000'}
          x={x}
          y={y}
          width={element.width ?? 60}
          height={element.height ?? 60}
          rotation={rot}
          align="center"
          verticalAlign="middle"
        />
      );
    }
    if (element.type === 'mdiIcon' && element.pathData) {
      const iconW = element.width ?? 34;
      const iconH = element.height ?? 34;
      return (
        <Path
          key={element.id}
          data={element.pathData}
          x={x}
          y={y}
          scaleX={iconW / 24}
          scaleY={iconH / 24}
          rotation={rot}
          fill={element.fill ?? '#111827'}
          stroke={element.stroke ?? 'transparent'}
          strokeWidth={element.strokeWidth ?? 1}
        />
      );
    }
    if (element.type === 'image' && images[element.id]) {
      return (
        <Image
          key={element.id}
          image={images[element.id]}
          x={x}
          y={y}
          width={w}
          height={h}
          rotation={rot}
        />
      );
    }
    if (element.type === 'rectangle') {
      return (
        <Rect
          key={element.id}
          x={x}
          y={y}
          width={w}
          height={h}
          rotation={rot}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      );
    }
    if (element.type === 'circle') {
      const r = Math.min(w, h) / 2;
      return (
        <Circle
          key={element.id}
          x={x + r}
          y={y + r}
          radius={r}
          rotation={rot}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      );
    }
    if (element.type === 'line') {
      return (
        <Line
          key={element.id}
          points={[x, y, x + w, y + h]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    if (element.type === 'arrow' && element.points && element.points.length >= 4) {
      return (
        <Line
          key={element.id}
          points={element.points}
          stroke={stroke}
          fill={element.fill ?? stroke}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
          closed
        />
      );
    }
    if ((element.type === 'pen' || element.type === 'path') && (element.points || element.data)) {
      const data = Array.isArray(element.points) ? element.points.join(' ') : (element.points || element.data);
      return (
        <Path
          key={element.id}
          data={data}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={element.fill ?? 'transparent'}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    return null;
  };

  const viewWidth = Math.max(1, width || resolvedWidth || 300);
  const viewHeight = Math.max(1, height || 200);

  // Match KonvaCanvasEditor/editor + PDF renderer:
  // use configurable canvas/background sizes so background width/height adjustments
  // are reflected in collection/projects previews.
  const canvasWidth = configuration.canvasWidth || CANVAS_WIDTH;
  const canvasHeight = configuration.canvasHeight || CANVAS_HEIGHT;
  const backgroundWidth = configuration.backgroundWidth || canvasWidth;
  const backgroundHeight = configuration.backgroundHeight || canvasHeight;
  const backgroundX = configuration.backgroundX ?? 0;
  const backgroundY = configuration.backgroundY ?? 0;

  if (editedImageUrl && !hasElements && !hasBackground) {
    return (
      <div
        ref={containerRef}
        className={`bg-gray-100 rounded-lg overflow-hidden${onClick ? ' cursor-pointer' : ''}`}
        style={{ width: width || '100%', height: viewHeight }}
        onClick={onClick}
      >
        <img
          src={editedImageUrl}
          alt={product?.name || 'Edited'}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (!hasElements && !hasBackground) {
    return (
      <div
        ref={containerRef}
        className={`bg-gray-100 rounded-lg overflow-hidden${onClick ? ' cursor-pointer' : ''}`}
        style={{ width: width || '100%', height: viewHeight }}
        onClick={onClick}
      >
        {baseImage ? (
          <img
            src={baseImageUrl}
            alt={product?.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No preview</span>
          </div>
        )}
      </div>
    );
  }

  const iw = baseImageSize.width || baseImage?.width || canvasWidth;
  const ih = baseImageSize.height || baseImage?.height || canvasHeight;
  // Match editor: base product image is rendered at intrinsic size and centered on canvas.
  const drawW = iw;
  const drawH = ih;
  const baseX = (canvasWidth - drawW) / 2;
  const baseY = (canvasHeight - drawH) / 2;

  // Thumbnail should prioritize showing the full product area (base device) without
  // extra canvas margins. So we scale/position from the base bounds, not full canvas.
  const sourceX = baseImage ? baseX : 0;
  const sourceY = baseImage ? baseY : 0;
  const sourceW = baseImage ? drawW : canvasWidth;
  const sourceH = baseImage ? drawH : canvasHeight;
  const scale = Math.min(viewWidth / Math.max(1, sourceW), viewHeight / Math.max(1, sourceH));
  const offsetX = (viewWidth - sourceW * scale) / 2 - sourceX * scale;
  const offsetY = (viewHeight - sourceH * scale) / 2 - sourceY * scale;

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm${onClick ? ' cursor-pointer' : ''}`}
      style={{ width: width || '100%', height: viewHeight }}
      onClick={onClick}
    >
      <Stage width={viewWidth} height={viewHeight} ref={externalStageRef}>
        <Layer scaleX={scale} scaleY={scale} x={offsetX} y={offsetY}>
          {/* Layer 2 – custom background uploaded in configurator (drawn first, behind device) */}
          {backgroundImage && (
            <Image
              image={backgroundImage}
              x={backgroundX}
              y={backgroundY}
              width={backgroundWidth}
              height={backgroundHeight}
              listening={false}
            />
          )}

          {/* Base product image – fitted to preserve aspect ratio (no distortion) */}
          {baseImage && (
            <Image
              image={baseImage}
              x={baseX}
              y={baseY}
              width={drawW}
              height={drawH}
              listening={false}
            />
          )}

          {/* Render edited elements */}
          {edits.elements.map(renderElement)}
        </Layer>
      </Stage>
    </div>
  );
};

export default EditedProductPreview;
