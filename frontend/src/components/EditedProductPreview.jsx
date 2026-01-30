import { Stage, Layer, Image, Text } from 'react-konva';
import { useEffect, useState } from 'react';

const EditedProductPreview = ({ product, edits, width = 300, height = 200 }) => {
  const [images, setImages] = useState({});
  const [baseImage, setBaseImage] = useState(null);

  useEffect(() => {
    // Load base product image
    if (product?.baseImageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = product.baseImageUrl;
      img.onload = () => {
        setBaseImage(img);
      };
    }

    // Load edited images
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
  }, [product, edits]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderElement = (element) => {
    if (element.type === 'text') {
      return (
        <Text
          key={element.id}
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
        />
      );
    } else if (element.type === 'icon') {
      return (
        <Text
          key={element.id}
          text={element.text || ''}
          fontSize={element.fontSize || 48}
          fontFamily="'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Arial Unicode MS', Arial, sans-serif"
          fill={element.color || '#000000'}
          x={element.x || 0}
          y={element.y || 0}
          width={element.width || 60}
          height={element.height || 60}
          rotation={element.rotation || 0}
          align="center"
          verticalAlign="middle"
        />
      );
    } else if (element.type === 'image' && images[element.id]) {
      return (
        <Image
          key={element.id}
          image={images[element.id]}
          x={element.x || 0}
          y={element.y || 0}
          width={element.width || 100}
          height={element.height || 100}
          rotation={element.rotation || 0}
        />
      );
    }
    return null;
  };

  if (!edits || !edits.elements || edits.elements.length === 0) {
    // Show base product image if no edits
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

  // Calculate scale to fit preview
  const canvasWidth = 600;
  const canvasHeight = 400;
  const scaleX = width / canvasWidth;
  const scaleY = height / canvasHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm" style={{ width, height }}>
      <Stage width={width} height={height} scaleX={scale} scaleY={scale}>
        <Layer>
          {/* Base product image */}
          {baseImage && (
            <Image
              image={baseImage}
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
