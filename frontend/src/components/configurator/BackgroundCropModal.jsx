import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Modal to crop the configurator background image.
 * User drags to select a rectangle; Save produces a cropped data URL.
 */
const BackgroundCropModal = ({ isOpen, imageDataUrl, onSave, onClose }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [selection, setSelection] = useState(null); // { startX, startY, endX, endY } in display coords
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [imageSize, setImageSize] = useState({ naturalWidth: 0, naturalHeight: 0, displayWidth: 0, displayHeight: 0 });

  const resetSelection = useCallback(() => {
    setSelection(null);
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (!isOpen) resetSelection();
  }, [isOpen, resetSelection]);

  useEffect(() => {
    if (!imgRef.current || !imageDataUrl) return;
    const img = imgRef.current;
    const onLoad = () => {
      const rect = img.getBoundingClientRect();
      setImageSize({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: rect.width,
        displayHeight: rect.height,
      });
    };
    if (img.complete) onLoad();
    else img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }, [imageDataUrl, isOpen]);

  const getRect = useCallback(() => {
    if (!selection) return null;
    const { startX, startY, endX, endY } = selection;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    return { x, y, w, h };
  }, [selection]);

  const handleMouseDown = useCallback((e) => {
    if (!containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setSelection({ startX: x, startY: y, endX: x, endY: y });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setSelection((prev) => prev ? { ...prev, endX: x, endY: y } : null);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, handleMouseMove, handleMouseUp]);

  const handleSave = useCallback(() => {
    const rect = getRect();
    if (!rect || !imageDataUrl || rect.w < 5 || rect.h < 5) {
      onClose();
      return;
    }
    const { naturalWidth, naturalHeight, displayWidth, displayHeight } = imageSize;
    if (!naturalWidth || !naturalHeight || !displayWidth || !displayHeight) {
      onClose();
      return;
    }
    const scaleX = naturalWidth / displayWidth;
    const scaleY = naturalHeight / displayHeight;
    const sx = Math.max(0, Math.floor(rect.x * scaleX));
    const sy = Math.max(0, Math.floor(rect.y * scaleY));
    let sw = Math.floor(rect.w * scaleX);
    let sh = Math.floor(rect.h * scaleY);
    if (sx + sw > naturalWidth) sw = naturalWidth - sx;
    if (sy + sh > naturalHeight) sh = naturalHeight - sy;
    if (sw < 1 || sh < 1) {
      onClose();
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
      onClose();
    };
    img.src = imageDataUrl;
  }, [getRect, imageDataUrl, imageSize, onSave, onClose]);

  if (!isOpen) return null;

  const rect = getRect();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div className="flex max-h-[90vh] max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 id="crop-modal-title" className="text-sm font-semibold text-slate-800">
            Crop background
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
        <div className="overflow-auto p-4">
          <p className="mb-3 text-xs text-slate-600">
            Drag on the image to select the area to keep. Then click Save.
          </p>
          <div
            ref={containerRef}
            className="relative inline-block max-w-full cursor-crosshair overflow-hidden rounded-lg border border-slate-300 bg-slate-100"
            onMouseDown={handleMouseDown}
            style={{ touchAction: 'none' }}
          >
            <img
              ref={imgRef}
              src={imageDataUrl}
              alt="Background to crop"
              className="block max-h-[60vh] max-w-full select-none object-contain"
              draggable={false}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            />
            {rect && rect.w > 0 && rect.h > 0 && (
              <>
                <div
                  className="absolute border-2 border-teal-500 bg-teal-500/20 pointer-events-none"
                  style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.w,
                    height: rect.h,
                  }}
                />
                <div
                  className="absolute border-2 border-dashed border-white pointer-events-none"
                  style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.w,
                    height: rect.h,
                  }}
                />
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!rect || rect.w < 5 || rect.h < 5}
            className="h-9 rounded-lg bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCropModal;
