import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from "react-konva";
import { Box } from "@mui/material";
import { getImageUrl } from "../../services/api";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { useCanvasStore } from "../../stores/useCanvasStore";
import { clampDragPosition, computeMaskBoundsFromImage } from "./LayerManager";

function useHtmlImage(src) {
  const [img, setImg] = useState(null);

  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null);
    image.src = src;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  return img;
}

const KonvaUrlImage = React.memo(function KonvaUrlImage({ src, ...rest }) {
  const img = useHtmlImage(src);
  if (!img) return null;
  return <KonvaImage image={img} {...rest} />;
});

export const ConfiguratorCanvas = forwardRef(function ConfiguratorCanvas(
  { width, height },
  stageRef
) {
  const device = useDeviceStore((s) => s.device);
  const isCustomizationDisabled = useDeviceStore((s) => s.isCustomizationDisabled());

  const elements = useCanvasStore((s) => s.elements);
  const backgroundImage = useCanvasStore((s) => s.backgroundImage);
  const selectedElementId = useCanvasStore((s) => s.selectedElementId);
  const selectElement = useCanvasStore((s) => s.selectElement);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const setAllowedZone = useCanvasStore((s) => s.setAllowedZone);

  const internalStageRef = useRef(null);
  const resolvedStageRef = stageRef || internalStageRef;

  const transformerRef = useRef(null);
  const nodeRefs = useRef({});

  const baseImg = useHtmlImage(device?.layer1_image || "");
  const customBgImg = useHtmlImage(backgroundImage || "");
  const defaultBgImg = useHtmlImage(device?.layer2_image || "");
  const maskImg = useHtmlImage(device?.layer3_image || "");

  const [maskBounds, setMaskBounds] = useState(null);

  useEffect(() => {
    if (!maskImg || !width || !height) {
      setMaskBounds(null);
      setAllowedZone(null);
      return;
    }
    const bounds = computeMaskBoundsFromImage(maskImg, width, height);
    setMaskBounds(bounds);
    setAllowedZone(bounds);
  }, [maskImg, width, height, setAllowedZone]);

  // Attach transformer to selected node.
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const node = selectedElementId ? nodeRefs.current[selectedElementId] : null;
    if (node) tr.nodes([node]);
    else tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedElementId, elements.length]);

  const canEdit = !isCustomizationDisabled && Boolean(maskBounds);

  const dragBoundFunc = useCallback(
    function (pos) {
      if (!maskBounds) return pos;
      // `this` is the Konva node being dragged.
      const node = this;
      const w = Math.abs(node.width() * (node.scaleX?.() ?? 1));
      const h = Math.abs(node.height() * (node.scaleY?.() ?? 1));
      return clampDragPosition(pos, maskBounds, { width: w, height: h });
    },
    [maskBounds]
  );

  const rafByIdRef = useRef({});
  const scheduleUpdate = useCallback(
    (id, partial) => {
      if (!id) return;
      const prev = rafByIdRef.current[id];
      if (prev) cancelAnimationFrame(prev);
      rafByIdRef.current[id] = requestAnimationFrame(() => {
        updateElement(id, partial);
        rafByIdRef.current[id] = null;
      });
    },
    [updateElement]
  );

  const handleStagePointerDown = useCallback(
    (e) => {
      if (e.target === e.target.getStage()) clearSelection();
    },
    [clearSelection]
  );

  const safeWidth = Math.max(1, width || 1);
  const safeHeight = Math.max(1, height || 1);

  const maskOpacity = useMemo(() => (maskImg ? 0.35 : 0), [maskImg]);

  return (
    <Box
      sx={{
        width: safeWidth,
        height: safeHeight,
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "relative",
      }}
      data-configurator-preview
    >
      <Stage
        ref={resolvedStageRef}
        width={safeWidth}
        height={safeHeight}
        onMouseDown={handleStagePointerDown}
        onTouchStart={handleStagePointerDown}
      >
        {/* Layer 1: Base device image (locked) */}
        <Layer name="base-layer" listening={false}>
          {baseImg ? (
            <KonvaImage image={baseImg} x={0} y={0} width={safeWidth} height={safeHeight} />
          ) : null}
        </Layer>

        {/* Layer 2: Background image (locked) */}
        <Layer name="background-layer" listening={false}>
          {customBgImg ? (
            <KonvaImage image={customBgImg} x={0} y={0} width={safeWidth} height={safeHeight} />
          ) : defaultBgImg ? (
            <KonvaImage image={defaultBgImg} x={0} y={0} width={safeWidth} height={safeHeight} />
          ) : null}
        </Layer>

        {/* Layer 3: Allowed zone overlay/mask (locked) */}
        <Layer name="mask-layer" listening={false} opacity={maskOpacity}>
          {maskImg ? (
            <KonvaImage image={maskImg} x={0} y={0} width={safeWidth} height={safeHeight} />
          ) : null}
        </Layer>

        {/* Layer 4: User elements */}
        <Layer name="user-layer" listening={canEdit}>
          {elements.map((el) => {
            const isSelected = el.id === selectedElementId;
            const common = {
              x: el.x,
              y: el.y,
              rotation: el.rotation || 0,
              draggable: canEdit,
              dragBoundFunc,
              onClick: () => selectElement(el.id),
              onTap: () => selectElement(el.id),
              onDragMove: (e) => {
                scheduleUpdate(el.id, { x: e.target.x(), y: e.target.y() });
              },
              onDragEnd: (e) => {
                updateElement(el.id, { x: e.target.x(), y: e.target.y() });
              },
              onTransformEnd: (e) => {
                const node = e.target;
                const w = Math.abs(node.width() * (node.scaleX?.() ?? 1));
                const h = Math.abs(node.height() * (node.scaleY?.() ?? 1));
                const clampedPos = maskBounds
                  ? clampDragPosition({ x: node.x(), y: node.y() }, maskBounds, { width: w, height: h })
                  : { x: node.x(), y: node.y() };
                node.position(clampedPos);
                const next = {
                  x: clampedPos.x,
                  y: clampedPos.y,
                  rotation: node.rotation(),
                  scaleX: node.scaleX(),
                  scaleY: node.scaleY(),
                };
                updateElement(el.id, next);
              },
              ref: (node) => {
                if (node) nodeRefs.current[el.id] = node;
                else delete nodeRefs.current[el.id];
              },
              opacity: canEdit ? 1 : 0.55,
              stroke: isSelected ? "#1976d2" : undefined,
            };

            if (el.type === "icon") {
              return (
                <KonvaUrlImage
                  key={el.id}
                  {...common}
                  src={getImageUrl(el.src)}
                  width={el.width}
                  height={el.height}
                  scaleX={el.scaleX ?? 1}
                  scaleY={el.scaleY ?? 1}
                  perfectDrawEnabled={false}
                />
              );
            }

            if (el.type === "text") {
              return (
                <KonvaText
                  key={el.id}
                  {...common}
                  text={el.text || ""}
                  width={el.width || 240}
                  height={el.height || 40}
                  fontSize={el.fontSize || 22}
                  fill={el.fill || "#111827"}
                  scaleX={el.scaleX ?? 1}
                  scaleY={el.scaleY ?? 1}
                />
              );
            }

            return null;
          })}

          <Transformer
            name="transformer"
            ref={transformerRef}
            rotateEnabled={canEdit}
            enabledAnchors={
              canEdit
                ? [
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "middle-left",
                    "middle-right",
                    "top-center",
                    "bottom-center",
                  ]
                : []
            }
            boundBoxFunc={(oldBox, newBox) => {
              // Prevent disappearing
              if (newBox.width < 10 || newBox.height < 10) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </Box>
  );
});

