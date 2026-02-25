const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/**
 * Compute bounding box of non-transparent pixels in an image.
 * Works as a data-driven "allowed zone" derived from the mask image (Layer 3).
 *
 * For performance, the scan is done on a downscaled canvas.
 */
export function computeMaskBoundsFromImage(img, stageWidth, stageHeight, opts = {}) {
  if (!img || !stageWidth || !stageHeight) return null;

  const maxScanSize = Math.max(32, opts.maxScanSize || 256);
  const alphaThreshold = opts.alphaThreshold ?? 8;

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return null;

  const scale = Math.min(1, maxScanSize / Math.max(iw, ih));
  const sw = Math.max(1, Math.round(iw * scale));
  const sh = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(img, 0, 0, sw, sh);

  let data;
  try {
    data = ctx.getImageData(0, 0, sw, sh).data;
  } catch {
    // Cross-origin images without CORS headers can block pixel reads.
    // In that case, we cannot compute bounds from pixels.
    return null;
  }

  let minX = sw, minY = sh, maxX = -1, maxY = -1;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const a = data[(y * sw + x) * 4 + 3];
      if (a > alphaThreshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  // Scale scan coords to stage coords (we render mask stretched to stage dimensions).
  const x = (minX / sw) * stageWidth;
  const y = (minY / sh) * stageHeight;
  const width = ((maxX - minX + 1) / sw) * stageWidth;
  const height = ((maxY - minY + 1) / sh) * stageHeight;

  return { x, y, width, height };
}

export function clampDragPosition(pos, bounds, nodeSize) {
  if (!bounds) return pos;
  const w = Math.max(1, nodeSize?.width || 1);
  const h = Math.max(1, nodeSize?.height || 1);
  const minX = bounds.x;
  const minY = bounds.y;
  const maxX = bounds.x + bounds.width - w;
  const maxY = bounds.y + bounds.height - h;
  return {
    x: clamp(pos.x, minX, maxX),
    y: clamp(pos.y, minY, maxY),
  };
}

