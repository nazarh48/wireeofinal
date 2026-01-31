/**
 * Canvas-to-PDF export: high-quality, consistent across browsers.
 * Uses Konva toDataURL / toCanvas with pixelRatio 2–4 for crisp output,
 * then pdf-lib for reliable PDF assembly (multi-page, paper size, orientation).
 *
 * Why pdf-lib: Better reliability and control than jsPDF for image-based PDFs,
 * supports incremental page appends (no memory spikes), and preserves aspect ratio.
 * jsPDF is still used for the multi-product report (html2canvas + layout); this
 * service is for exporting the Konva canvas only.
 */

import { PDFDocument } from 'pdf-lib';

const DEFAULT_PIXEL_RATIO = 2;
const MAX_PIXEL_RATIO = 4;

/**
 * Export a single Konva stage to a high-res image data URL.
 * @param {import('konva').Stage} stage - Konva Stage instance
 * @param {Object} options
 * @param {number} [options.pixelRatio=2] - 2–4 for crisp output
 * @param {string} [options.mimeType='image/png']
 * @param {number} [options.quality]
 * @returns {Promise<string>} data URL
 */
export async function stageToDataURL(stage, options = {}) {
  const pixelRatio = Math.min(MAX_PIXEL_RATIO, Math.max(1, options.pixelRatio ?? DEFAULT_PIXEL_RATIO));
  const mimeType = options.mimeType || 'image/png';
  const quality = options.quality;

  const dataURL = stage.toDataURL({
    pixelRatio,
    mimeType,
    quality,
  });
  return Promise.resolve(dataURL);
}

/**
 * Load an image from data URL and return as Uint8Array for pdf-lib.
 * @param {string} dataUrl
 * @returns {Promise<Uint8Array>}
 */
async function dataURLToUint8Array(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Paper size in points (1/72 inch). pdf-lib uses points.
 */
const PAPER = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
};

/**
 * Export current canvas (single page) to PDF.
 * Preserves aspect ratio; fits canvas into chosen paper with optional scaling.
 *
 * @param {import('konva').Stage} stageRef - Stage ref (stageRef.current)
 * @param {Object} options
 * @param {string} [options.filename='canvas-export.pdf']
 * @param {string} [options.paperSize='A4'] - 'A4' | 'Letter'
 * @param {string} [options.orientation='portrait'] - 'portrait' | 'landscape'
 * @param {number} [options.pixelRatio=2]
 * @param {number} [options.dpi] - optional; used to derive pixelRatio if needed
 * @param {function(string): void} [options.onProgress] - e.g. 'rendering' | 'building'
 * @returns {Promise<void>}
 */
export async function exportCanvasToPDF(stageRef, options = {}) {
  const stage = stageRef?.current ?? stageRef;
  if (!stage || typeof stage.toDataURL !== 'function') throw new Error('Stage ref is required');

  const filename = options.filename || `canvas-export-${Date.now()}.pdf`;
  const paperSize = options.paperSize || 'A4';
  const orientation = options.orientation || 'portrait';
  const pixelRatio = options.pixelRatio ?? DEFAULT_PIXEL_RATIO;
  const onProgress = options.onProgress || (() => {});

  onProgress('rendering');
  const dataURL = await stageToDataURL(stage, {
    pixelRatio,
    mimeType: 'image/png',
  });

  onProgress('building');
  const imgBytes = await dataURLToUint8Array(dataURL);
  const pdfDoc = await PDFDocument.create();
  const pageDims = PAPER[paperSize] || PAPER.A4;
  const width = orientation === 'landscape' ? pageDims.height : pageDims.width;
  const height = orientation === 'landscape' ? pageDims.width : pageDims.height;

  const stageW = stage.width();
  const stageH = stage.height();
  const scale = Math.min(width / stageW, height / stageH);
  const drawWidth = stageW * scale;
  const drawHeight = stageH * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  const page = pdfDoc.addPage([width, height]);
  const pngImage = await pdfDoc.embedPng(imgBytes);
  page.drawImage(pngImage, {
    x,
    y,
    width: drawWidth,
    height: drawHeight,
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple pages (e.g. multiple product canvases) to one PDF.
 * Renders each stage sequentially to avoid memory spikes.
 *
 * @param {Array<{ stage: import('konva').Stage, name?: string }>} pages
 * @param {Object} options - same as exportCanvasToPDF plus:
 * @param {string} [options.filename='multi-page-export.pdf']
 * @returns {Promise<void>}
 */
export async function exportMultiPageToPDF(pages, options = {}) {
  if (!pages || pages.length === 0) throw new Error('At least one page is required');

  const filename = options.filename || `multi-page-export-${Date.now()}.pdf`;
  const paperSize = options.paperSize || 'A4';
  const orientation = options.orientation || 'portrait';
  const pixelRatio = options.pixelRatio ?? DEFAULT_PIXEL_RATIO;
  const onProgress = options.onProgress || (() => {});

  const pdfDoc = await PDFDocument.create();
  const pageDims = PAPER[paperSize] || PAPER.A4;
  const width = orientation === 'landscape' ? pageDims.height : pageDims.width;
  const height = orientation === 'landscape' ? pageDims.width : pageDims.height;

  for (let i = 0; i < pages.length; i++) {
    const { stage: stageOrRef, name } = pages[i];
    const stage = stageOrRef?.current ?? stageOrRef;
    if (!stage) continue;

    onProgress(`page ${i + 1}/${pages.length}`);
    const dataURL = await stageToDataURL(stage, { pixelRatio, mimeType: 'image/png' });
    const imgBytes = await dataURLToUint8Array(dataURL);

    const stageW = stage.width();
    const stageH = stage.height();
    const scale = Math.min(width / stageW, height / stageH);
    const drawWidth = stageW * scale;
    const drawHeight = stageH * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    const page = pdfDoc.addPage([width, height]);
    const pngImage = await pdfDoc.embedPng(imgBytes);
    page.drawImage(pngImage, { x, y, width: drawWidth, height: drawHeight });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
