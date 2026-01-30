/**
 * Export utilities for Konva Canvas Editor
 * Supports PNG, JPG, SVG, and JSON exports
 */

/**
 * Export canvas as PNG
 */
export const exportAsPNG = (stageRef, filename = 'canvas.png') => {
  if (!stageRef?.current) return;
  
  const dataURL = stageRef.current.toDataURL({
    mimeType: 'image/png',
    quality: 1,
    pixelRatio: 2, // Higher quality
  });
  
  downloadFile(dataURL, filename);
};

/**
 * Export canvas as JPG
 */
export const exportAsJPG = (stageRef, filename = 'canvas.jpg', quality = 0.9) => {
  if (!stageRef?.current) return;
  
  const dataURL = stageRef.current.toDataURL({
    mimeType: 'image/jpeg',
    quality,
    pixelRatio: 2,
  });
  
  downloadFile(dataURL, filename);
};

/**
 * Export canvas as SVG
 */
export const exportAsSVG = (stageRef, elements, canvasWidth, canvasHeight, filename = 'canvas.svg') => {
  if (!stageRef?.current) return;
  
  const stage = stageRef.current;
  const svg = stage.toSVG();
  
  // Create SVG with proper dimensions
  const svgString = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${svg}
</svg>`;
  
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
};

/**
 * Export canvas as JSON template
 */
export const exportAsJSON = (elements, configuration, filename = 'canvas-template.json') => {
  const template = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    elements: elements.map(el => {
      // Remove internal properties that shouldn't be exported
      const { id, ...exportable } = el;
      return exportable;
    }),
    configuration: configuration || {},
    metadata: {
      elementCount: elements.length,
      canvasWidth: 800,
      canvasHeight: 600,
    },
  };
  
  const jsonString = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
};

/**
 * Import JSON template
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target.result);
        resolve(template);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Helper to download file
 */
const downloadFile = (dataURL, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
