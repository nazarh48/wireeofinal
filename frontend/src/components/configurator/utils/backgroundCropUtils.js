const loadImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Missing background image source'));
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load background image'));
    img.src = src;
  });

export const getCenteredBackgroundCropPlacement = ({
  canvasWidth,
  canvasHeight,
  baseImageWidth,
  baseImageHeight,
  targetWidth,
  targetHeight,
}) => {
  const baseW = baseImageWidth || canvasWidth;
  const baseH = baseImageHeight || canvasHeight;
  const baseX = (canvasWidth - baseW) / 2;
  const baseY = (canvasHeight - baseH) / 2;

  return {
    x: baseX + (baseW - targetWidth) / 2,
    y: baseY + (baseH - targetHeight) / 2,
  };
};

export const cropBackgroundToFrame = async ({
  imageSrc,
  backgroundX,
  backgroundY,
  backgroundWidth,
  backgroundHeight,
  cropX,
  cropY,
  targetWidth,
  targetHeight,
}) => {
  const img = await loadImage(imageSrc);
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  if (!imgW || !imgH) {
    throw new Error('Invalid source image dimensions');
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No canvas context');
  }

  const radius = Math.max(8, Math.min(36, Math.round(Math.min(targetWidth, targetHeight) * 0.06)));

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(targetWidth - radius, 0);
  ctx.quadraticCurveTo(targetWidth, 0, targetWidth, radius);
  ctx.lineTo(targetWidth, targetHeight - radius);
  ctx.quadraticCurveTo(targetWidth, targetHeight, targetWidth - radius, targetHeight);
  ctx.lineTo(radius, targetHeight);
  ctx.quadraticCurveTo(0, targetHeight, 0, targetHeight - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  // Draw relative to the crop frame so repeating the crop keeps the same result.
  ctx.drawImage(
    img,
    backgroundX - cropX,
    backgroundY - cropY,
    backgroundWidth,
    backgroundHeight,
  );
  ctx.restore();

  return canvas.toDataURL('image/png');
};
