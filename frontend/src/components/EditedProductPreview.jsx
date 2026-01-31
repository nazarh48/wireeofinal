import { Stage, Layer, Image, Text, Rect, Circle, Line, Path } from 'react-konva';
import { useEffect, useState } from 'react';

const EditedProductPreview = ({ product, edits, width = 300, height = 200 }) => {
  const [images, setImages] = useState({});
  const [baseImage, setBaseImage] = useState(null);

  // When editedImage is present (exact baked bitmap), show it so preview matches PDF
  const editedImageUrl = product?.editedImage?.value || null;

  useEffect(() => {
    if (editedImageUrl) return;
    if (product?.baseImageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = product.baseImageUrl;
      img.onload = () => {
        setBaseImage(img);
      };
    }

    if (edits?.elements) {
      edits.elements
        .filter(el => el.type === 'image' && el.src)
        .forEach(element => {
          if (!images[element.id]) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = element.src;
            img.onload = () => {
              setImages(prev => ({ ...prev, [element.id]: img }));
            };
          }
        });
    }
  }, [product, edits, editedImageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

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
      return (
        <Text
          key={element.id}
          text={element.text || ''}
          fontSize={element.fontSize || 24}
          fontFamily={element.fontFamily || 'Arial'}
          fontStyle={element.fontWeight || 'normal'}
          fill={element.color || '#000000'}
          x={x}
          y={y}
          width={element.width ?? 200}
          height={element.height ?? 50}
          rotation={rot}
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

  if (editedImageUrl) {
    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ width, height }}>
        <img
          src={editedImageUrl}
          alt={product?.name || 'Edited'}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (!edits || !edits.elements || edits.elements.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ width, height }}>
        {baseImage ? (
          <img
            src={product?.baseImageUrl}
            alt={product?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No preview</span>
          </div>
        )}
      </div>
    );
  }

  // Same coordinate space as editor (800x600) so element positions and rectangle overlay match
  const canvasWidth = 800;
  const canvasHeight = 600;
  const scaleX = width / canvasWidth;
  const scaleY = height / canvasHeight;

  return (
    <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm" style={{ width, height }}>
      <Stage width={width} height={height} scaleX={scaleX} scaleY={scaleY}>
        <Layer>
          {/* Base product image */}
          {baseImage && (
            <Image
              image={baseImage}
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
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
