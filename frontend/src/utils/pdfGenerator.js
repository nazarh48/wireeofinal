// Basic project PDF generator: delegates to generateProductPDF for now
export const generateProjectPDF = async (project, options = {}) => {
  // If project has products, reuse generateProductPDF
  if (project && Array.isArray(project.products)) {
    return generateProductPDF(project.products, { ...options, projectName: project.name || options.projectName });
  }
  throw new Error('No products found in project for PDF export.');
};
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ensureCanvasReady,
  waitForRender,
  waitForImagesInElement,
  ensureNoZeroSizeCanvases,
} from "./canvasPatternUtils.js";

const FALLBACK_CANVAS_WIDTH = 200;
const FALLBACK_CANVAS_HEIGHT = 150;

// Helper function to load image; throws clear error with path if image is missing/fails.
// Fallback placeholder uses a canvas with guaranteed non-zero dimensions to avoid createPattern errors.
const loadImage = (src) => {
  if (!src || typeof src !== "string") {
    const err = new Error(`[PDF] Image path is missing or invalid: ${String(src)}`);
    if (process.env.NODE_ENV !== "production") console.error("[PDF]", err.message);
    return Promise.reject(err);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      const err = new Error(`[PDF] Image failed to load: ${src}`);
      if (process.env.NODE_ENV !== "production") console.error("[PDF]", err.message);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(FALLBACK_CANVAS_WIDTH, 1);
      canvas.height = Math.max(FALLBACK_CANVAS_HEIGHT, 1);
      if (!ensureCanvasReady(canvas)) {
        reject(err);
        return;
      }
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Image not available", canvas.width / 2, canvas.height / 2);
      let dataUrl;
      try {
        dataUrl = canvas.toDataURL("image/png");
      } catch (e) {
        reject(err);
        return;
      }
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => reject(err);
      fallbackImg.src = dataUrl;
    };
    img.src = src;
  });
};

// Stroke style for shapes: visible on all backgrounds (red, 4px)
const SHAPE_STROKE = "#ff0000";
const SHAPE_STROKE_WIDTH = 4;

// Helper: draw one element on 2D context (including rectangle, circle, line, arrow, pen)
function drawElementOnContext(ctx, element, loadedImages, imageElements) {
  const x = element.x ?? 0;
  const y = element.y ?? 0;
  const w = element.width ?? 100;
  const h = element.height ?? 100;
  const rot = ((element.rotation ?? 0) * Math.PI) / 180;
  const stroke = element.stroke ?? element.fill ?? SHAPE_STROKE;
  const fill = element.fill ?? "transparent";
  const strokeWidth = element.strokeWidth ?? 2;

  const drawWithRotation = (draw) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.translate(-x, -y);
    draw();
    ctx.restore();
  };

  if (element.type === "text") {
    drawWithRotation(() => {
      ctx.font = `${element.fontWeight || "normal"} ${element.fontSize || 24}px ${element.fontFamily || "Arial"}`;
      ctx.fillStyle = element.color || "#000000";
      ctx.textBaseline = "top";
      ctx.fillText(element.text || "", x, y);
    });
  } else if (element.type === "icon" || element.type === "sticker") {
    drawWithRotation(() => {
      ctx.font = `${element.fontSize || 48}px Arial`;
      ctx.fillStyle = element.color || "#000000";
      ctx.textBaseline = "top";
      ctx.fillText(element.text || element.emoji || "", x, y);
    });
  } else if (element.type === "image" && element.src) {
    const imgIndex = imageElements.indexOf(element);
    if (imgIndex >= 0 && loadedImages[imgIndex]) {
      drawWithRotation(() => {
        ctx.drawImage(loadedImages[imgIndex], x, y, w, h);
      });
    }
  } else if (element.type === "rectangle") {
    drawWithRotation(() => {
      if (fill && fill !== "transparent") {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, strokeWidth);
      ctx.strokeRect(x, y, w, h);
    });
  } else if (element.type === "circle") {
    const r = Math.min(w, h) / 2;
    const cx = x + r;
    const cy = y + r;
    drawWithRotation(() => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, strokeWidth);
      ctx.stroke();
      if (fill && fill !== "transparent") {
        ctx.fillStyle = fill;
        ctx.fill();
      }
    });
  } else if (element.type === "line") {
    drawWithRotation(() => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, strokeWidth);
      ctx.stroke();
    });
  } else if (element.type === "arrow" && element.points && element.points.length >= 4) {
    const pts = element.points;
    drawWithRotation(() => {
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.closePath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, strokeWidth);
      ctx.stroke();
      if (fill && fill !== "transparent") {
        ctx.fillStyle = fill;
        ctx.fill();
      }
    });
  } else if ((element.type === "pen" || element.type === "path") && (element.points || element.data)) {
    const raw = element.points || element.data;
    const str = Array.isArray(raw) ? raw.join(" ") : String(raw);
    drawWithRotation(() => {
      const commands = str.trim().split(/\s+/);
      let i = 0;
      ctx.beginPath();
      while (i < commands.length) {
        const cmd = commands[i];
        if (cmd === "M" && i + 2 < commands.length) {
          ctx.moveTo(Number(commands[i + 1]), Number(commands[i + 2]));
          i += 3;
        } else if (cmd === "L" && i + 2 < commands.length) {
          ctx.lineTo(Number(commands[i + 1]), Number(commands[i + 2]));
          i += 3;
        } else {
          i++;
        }
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, strokeWidth);
      ctx.stroke();
    });
  }
}

// Thumbnail size for product images in PDF (smaller = less memory and file size)
const PDF_PRODUCT_THUMB_WIDTH = 120;
const PDF_PRODUCT_THUMB_HEIGHT = 90;
// JPEG quality for embedded images (0.75–0.85 balances size and quality)
const PDF_JPEG_QUALITY = 0.82;

// Must match KonvaCanvasEditor CANVAS_WIDTH / CANVAS_HEIGHT so element coordinates (x, y, width, height) map correctly.
const EDITOR_CANVAS_WIDTH = 800;
const EDITOR_CANVAS_HEIGHT = 600;

// Helper function to render edited product on canvas (base image + all overlays).
// Element coordinates are in editor space (EDITOR_CANVAS_WIDTH x EDITOR_CANVAS_HEIGHT). When output size differs (e.g. thumbnail 120x90), we scale so the rectangle/overlays appear in the same relative position as in the web view.
const renderEditedProduct = async (
  product,
  canvasWidth = 800,
  canvasHeight = 600,
  asJpeg = false,
  jpegQuality = PDF_JPEG_QUALITY,
) => {
  const w = Math.max(1, canvasWidth || 800);
  const h = Math.max(1, canvasHeight || 600);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  if (!ensureCanvasReady(canvas)) throw new Error("[PDF] Canvas initialization failed");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("[PDF] Canvas context creation failed");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const originalImageUrl = product.baseImageUrl || product.image;
  try {
    const baseImg = await loadImage(originalImageUrl);
    ctx.drawImage(baseImg, 0, 0, w, h);
    if (product.edits?.elements?.length > 0) {
      const imageElements = product.edits.elements.filter((el) => el.type === "image" && el.src);
      const loadedImages = await Promise.all(imageElements.map((el) => loadImage(el.src)));
      const scaleX = w / EDITOR_CANVAS_WIDTH;
      const scaleY = h / EDITOR_CANVAS_HEIGHT;
      ctx.save();
      ctx.scale(scaleX, scaleY);
      product.edits.elements.forEach((element) => {
        drawElementOnContext(ctx, element, loadedImages, imageElements);
      });
      ctx.restore();
    }
    if (!ensureCanvasReady(canvas)) throw new Error("[PDF] Edited product canvas has invalid dimensions");
    const mimeType = asJpeg ? "image/jpeg" : "image/png";
    const dataUrl = asJpeg ? canvas.toDataURL(mimeType, jpegQuality) : canvas.toDataURL(mimeType);
    return dataUrl;
  } catch (error) {
    console.error("[PDF] Error rendering edited product:", error);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Preview not available", w / 2, h / 2);
    if (!ensureCanvasReady(canvas)) return "";
    return asJpeg ? canvas.toDataURL("image/jpeg", jpegQuality) : canvas.toDataURL("image/png");
  }
};

// A4 dimensions: 210mm x 297mm. Fixed page width in px for consistent capture (~210mm at 96dpi).
const PDF_PAGE_WIDTH_PX = 794;
const PDF_A4_WIDTH_MM = 210;
const PDF_A4_HEIGHT_MM = 297;

/** Wrapper for one PDF "page" so html2canvas captures without exceeding canvas limits */
function createPageWrapper() {
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.left = "-9999px";
  div.style.top = "0";
  div.style.width = `${PDF_PAGE_WIDTH_PX}px`;
  div.style.minHeight = "1122px";
  div.style.backgroundColor = "#ffffff";
  div.style.fontFamily = "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif";
  div.style.color = "#1f2937";
  div.style.padding = "0";
  div.style.boxSizing = "border-box";
  div.style.lineHeight = "1.6";
  return div;
}

/**
 * Strip gradients and background-image from cloned DOM so html2canvas never calls
 * createPattern with a 0-size canvas (renderBackgroundImage bug).
 * Replaces gradients with solid backgroundColor.
 */
function stripBackgroundsForClone(clonedElement) {
  if (!clonedElement) return;
  const walk = (el) => {
    if (!el || !el.style) return;
    const style = el.style;
    if (style.backgroundImage && style.backgroundImage !== "none") {
      style.backgroundImage = "none";
    }
    if (style.background && (String(style.background).includes("gradient") || String(style.background).includes("url("))) {
      const bg = String(style.background);
      if (bg.includes("#667eea") || bg.includes("667eea")) {
        style.background = "none";
        style.backgroundColor = "#667eea";
      } else if (bg.includes("#764ba2") || bg.includes("764ba2")) {
        style.background = "none";
        style.backgroundColor = "#764ba2";
      } else if (bg.includes("#10b981") || bg.includes("10b981")) {
        style.background = "none";
        style.backgroundColor = "#10b981";
      } else if (bg.includes("rgba(") || bg.includes("rgb(")) {
        style.background = "none";
        style.backgroundColor = "#e5e7eb";
      } else {
        style.background = "none";
        style.backgroundColor = "transparent";
      }
    }
    if (el.children && el.children.length) {
      Array.from(el.children).forEach(walk);
    }
  };
  walk(clonedElement);
}

// Use scale 1.25 and JPEG to reduce PDF size and memory (was scale 2 + PNG).
async function capturePageAndAddToPdf(pdf, pageDiv, isFirstPage) {
  document.body.appendChild(pageDiv);
  await waitForRender(2);
  await waitForImagesInElement(pageDiv, 10000);
  try {
    const width = Math.max(1, pageDiv.offsetWidth || PDF_PAGE_WIDTH_PX);
    const height = Math.max(1, pageDiv.offsetHeight || 1122);
    const canvas = await html2canvas(pageDiv, {
      scale: 1.25,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width,
      height,
      ignoreElements: (el) => el.tagName === "CANVAS",
      onclone(clonedDoc, clonedElement) {
        stripBackgroundsForClone(clonedElement);
        const canvases = clonedElement.querySelectorAll?.("canvas") || [];
        canvases.forEach((el) => el.parentNode?.removeChild(el));
        const imgs = clonedElement.querySelectorAll?.("img") || [];
        imgs.forEach((img) => {
          if (img && (img.naturalWidth === 0 || img.naturalHeight === 0)) img.style.display = "none";
        });
        if (clonedElement.style) {
          clonedElement.style.width = `${width}px`;
          clonedElement.style.minHeight = `${height}px`;
        }
      },
    });
    if (!ensureCanvasReady(canvas)) throw new Error("[PDF] Captured canvas has invalid dimensions");
    const imgData = canvas.toDataURL("image/jpeg", PDF_JPEG_QUALITY);
    const imgWidthMm = PDF_A4_WIDTH_MM;
    let imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
    if (imgHeightMm > PDF_A4_HEIGHT_MM) imgHeightMm = PDF_A4_HEIGHT_MM;
    if (!isFirstPage) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm);
  } catch (error) {
    console.error("[PDF] Error capturing page:", error);
    throw error;
  } finally {
    pageDiv.parentNode?.removeChild(pageDiv);
  }
}

export const generateProductPDF = async (products, options = {}) => {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  if (safeProducts.length === 0) {
    const err = new Error("[PDF] No products available for PDF export. Received: " + (Array.isArray(products) ? products.length : "non-array"));
    console.error(err.message);
    throw err;
  }
  console.info("[PDF] Generating PDF for", safeProducts.length, "product(s). IDs:", safeProducts.map((p) => p.id || p._id).join(", "));

  // NUCLEAR OPTION: Completely remove all canvases from the document during PDF generation
  const allCanvases = document.querySelectorAll("canvas");
  const canvasBackup = [];
  
  console.info("[PDF] Removing", allCanvases.length, "canvases from document for safe PDF generation");
  
  allCanvases.forEach((canvas, index) => {
    if (canvas.parentNode) {
      canvasBackup.push({
        canvas,
        parent: canvas.parentNode,
        nextSibling: canvas.nextSibling,
        index
      });
      canvas.parentNode.removeChild(canvas);
    }
  });

  try {
    const {
      projectName,
      user,
      filenamePrefix = "Wireeo-Customer-Report",
      companyName: companyNameOption = "WIREEO",
    } = options || {};

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const configNumber = `CFG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
    const reportDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const totalPages = 2;

    const addText = (parent, text, fontSize = 11, color = "#1f2937", marginBottom = 4) => {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.fontSize = `${fontSize}px`;
      el.style.color = color;
      el.style.marginBottom = `${marginBottom}px`;
      el.style.lineHeight = "1.4";
      parent.appendChild(el);
      return el;
    };

    const footerLegal = "The current terms and conditions of sale and delivery can always be found on our website at: wireeo.com/terms";
    const footerCompany = "WIREEO • Professional Electrical Configuration Systems • www.wireeo.com • MADE WITH PRECISION";

    // Pre-render product thumbnails: use editedImage.value (exact edited bitmap) when present, else render from base + edits
    const productThumbUrls = await Promise.all(
      safeProducts.map((product, idx) => {
        if (product?.editedImage?.value) {
          const value = product.editedImage.value;
          if (value.startsWith("data:image")) {
            if (process.env.NODE_ENV !== "production") {
              console.info("[PDF] Item", idx, "instanceId:", product._instanceId, "productId:", product.id, "using editedImage (base64)");
            }
            return Promise.resolve(value);
          }
          return loadImage(value).then((img) => {
            const c = document.createElement("canvas");
            c.width = PDF_PRODUCT_THUMB_WIDTH;
            c.height = PDF_PRODUCT_THUMB_HEIGHT;
            const ctx = c.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0, c.width, c.height);
            return c.toDataURL("image/jpeg", 0.8);
          }).catch(() => renderEditedProduct(product, PDF_PRODUCT_THUMB_WIDTH, PDF_PRODUCT_THUMB_HEIGHT, true, 0.8));
        }
        const hasImage = product?.baseImageUrl || product?.image;
        if (!hasImage) return Promise.resolve(null);
        if (process.env.NODE_ENV !== "production") {
          console.info("[PDF] Item", idx, "instanceId:", product._instanceId, "productId:", product.id, "using renderEditedProduct (no editedImage)");
        }
        return renderEditedProduct(product, PDF_PRODUCT_THUMB_WIDTH, PDF_PRODUCT_THUMB_HEIGHT, true, 0.8).catch(() => null);
      }),
    );

    // ========== PAGE 1: Customer Report (company, customer, config, items table with images) ==========
    const page1 = createPageWrapper();
    page1.style.padding = "40px 50px 50px";

    addText(page1, companyNameOption, 18, "#1f2937", 20);
    addText(page1, "Customer:", 10, "#6b7280", 2);
    addText(page1, user?.name || user?.companyName || "—", 12, "#1f2937", 2);
    if (user?.companyName && user?.name) addText(page1, user.companyName, 11, "#374151", 2);
    addText(page1, `Customer Nr.: ${user?.customerNumber || user?.id || "—"}`, 11, "#374151", 2);
    addText(page1, `Tel.: ${user?.phone || user?.tel || "—"}`, 11, "#374151", 2);
    addText(page1, `E-Mail: ${user?.email || "—"}`, 11, "#374151", 2);
    if (user?.address) addText(page1, user.address, 11, "#374151", 16);
    else addText(page1, "—", 11, "#374151", 16);

    addText(page1, "Please give this printout to your specialist partner with your order.", 11, "#1f2937", 20);
    addText(page1, `Configuration number: ${configNumber}`, 11, "#1f2937", 2);
    addText(page1, `Project name: ${projectName || "—"}`, 11, "#1f2937", 2);
    addText(page1, `Date: ${reportDate}`, 11, "#1f2937", 20);

    const table1 = document.createElement("table");
    table1.style.width = "100%";
    table1.style.borderCollapse = "collapse";
    table1.style.fontSize = "11px";
    table1.style.marginBottom = "24px";
    const thead1 = document.createElement("thead");
    const headerRow1 = document.createElement("tr");
    ["Image", "Item No./Items", "Description", "Piece"].forEach((thText) => {
      const th = document.createElement("th");
      th.textContent = thText;
      th.style.textAlign = "left";
      th.style.padding = "10px 12px";
      th.style.borderBottom = "2px solid #1f2937";
      th.style.color = "#1f2937";
      th.style.fontWeight = "700";
      headerRow1.appendChild(th);
    });
    thead1.appendChild(headerRow1);
    table1.appendChild(thead1);
    const tbody1 = document.createElement("tbody");
    safeProducts.forEach((product, idx) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #e5e7eb";
      const imgTd = document.createElement("td");
      imgTd.style.padding = "8px";
      imgTd.style.verticalAlign = "middle";
      imgTd.style.width = "72px";
      const thumbUrl = productThumbUrls[idx];
      if (thumbUrl) {
        const img = document.createElement("img");
        img.src = thumbUrl;
        img.alt = product?.name || "";
        img.loading = "eager";
        img.style.width = "64px";
        img.style.height = "48px";
        img.style.objectFit = "contain";
        img.style.display = "block";
        img.style.backgroundColor = "#f3f4f6";
        imgTd.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.style.width = "64px";
        placeholder.style.height = "48px";
        placeholder.style.backgroundColor = "#f3f4f6";
        placeholder.style.display = "flex";
        placeholder.style.alignItems = "center";
        placeholder.style.justifyContent = "center";
        placeholder.style.fontSize = "9px";
        placeholder.style.color = "#9ca3af";
        placeholder.textContent = "No image";
        imgTd.appendChild(placeholder);
      }
      tr.appendChild(imgTd);
      const itemNo = document.createElement("td");
      itemNo.style.padding = "12px";
      itemNo.style.verticalAlign = "top";
      itemNo.textContent = product?.name || product?.sku || "—";
      tr.appendChild(itemNo);
      const desc = document.createElement("td");
      desc.style.padding = "12px";
      desc.style.verticalAlign = "top";
      const descLines = [
        product?.name || "—",
        product?.description || "",
        "Individual labelling:",
        "Floor:",
        "Room:",
        "Processing: Print",
        "1x incl. Processing fee",
        `Filename: ${product?.sku || product?.id || "—"}`,
        "1x",
        "Item",
        String(idx + 1).padStart(2, "0"),
      ].filter(Boolean);
      desc.textContent = descLines.join("\n");
      desc.style.whiteSpace = "pre-line";
      desc.style.lineHeight = "1.5";
      tr.appendChild(desc);
      const piece = document.createElement("td");
      piece.style.padding = "12px";
      piece.style.verticalAlign = "top";
      piece.textContent = "1x";
      tr.appendChild(piece);
      tbody1.appendChild(tr);
    });
    table1.appendChild(tbody1);
    page1.appendChild(table1);

    addText(page1, footerLegal, 9, "#6b7280", 8);
    addText(page1, footerCompany, 8, "#9ca3af", 16);
    const pageNum1 = document.createElement("div");
    pageNum1.style.textAlign = "center";
    pageNum1.style.fontSize = "10px";
    pageNum1.style.color = "#9ca3af";
    pageNum1.textContent = `-- 1 of ${totalPages} --`;
    page1.appendChild(pageNum1);

    await capturePageAndAddToPdf(pdf, page1, true);

    // ========== PAGE 2: Summary table (Item No. | Item | Price Group | Quantity | Single Quantity | File) ==========
    const page2 = createPageWrapper();
    page2.style.padding = "40px 50px 50px";

    addText(page2, companyNameOption, 18, "#1f2937", 20);
    addText(page2, `Configuration number: ${configNumber}`, 11, "#1f2937", 2);
    addText(page2, `Project name: ${projectName || "—"}`, 11, "#1f2937", 2);
    addText(page2, `Date: ${reportDate}`, 11, "#1f2937", 20);

    const table2 = document.createElement("table");
    table2.style.width = "100%";
    table2.style.borderCollapse = "collapse";
    table2.style.fontSize = "11px";
    table2.style.marginBottom = "24px";
    const thead2 = document.createElement("thead");
    const headerRow2 = document.createElement("tr");
    ["Item No.", "Item", "Price Group", "Quantity", "Single Quantity", "File"].forEach((thText) => {
      const th = document.createElement("th");
      th.textContent = thText;
      th.style.textAlign = "left";
      th.style.padding = "10px 12px";
      th.style.borderBottom = "2px solid #1f2937";
      th.style.color = "#1f2937";
      th.style.fontWeight = "700";
      headerRow2.appendChild(th);
    });
    thead2.appendChild(headerRow2);
    table2.appendChild(thead2);
    const tbody2 = document.createElement("tbody");
    safeProducts.forEach((product, idx) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #e5e7eb";
      const cells = [
        product?.name || product?.sku || "—",
        String(idx + 1).padStart(2, "0"),
        product?.category || "—",
        "1x",
        "1x",
        product?.sku || product?.id || "—",
      ];
      cells.forEach((cellText) => {
        const td = document.createElement("td");
        td.textContent = cellText;
        td.style.padding = "10px 12px";
        tr.appendChild(td);
      });
      tbody2.appendChild(tr);
    });
    table2.appendChild(tbody2);
    page2.appendChild(table2);

    addText(page2, footerLegal, 9, "#6b7280", 8);
    addText(page2, footerCompany, 8, "#9ca3af", 16);
    const pageNum2 = document.createElement("div");
    pageNum2.style.textAlign = "center";
    pageNum2.style.fontSize = "10px";
    pageNum2.style.color = "#9ca3af";
    pageNum2.textContent = `-- 2 of ${totalPages} --`;
    page2.appendChild(pageNum2);

    await capturePageAndAddToPdf(pdf, page2, false);

    const fileName = `${filenamePrefix}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    console.info("[PDF] Saved:", fileName, "pages:", totalPages);
  } catch (error) {
    console.error("[PDF] PDF generation failed:", error);
    throw error;
  } finally {
    // RESTORE ALL CANVASES
    console.info("[PDF] Restoring", canvasBackup.length, "canvases to document");
    canvasBackup.forEach(({ canvas, parent, nextSibling }) => {
      try {
        if (nextSibling && nextSibling.parentNode === parent) {
          parent.insertBefore(canvas, nextSibling);
        } else {
          parent.appendChild(canvas);
        }
      } catch (e) {
        console.warn("[PDF] Failed to restore canvas:", e);
      }
    });
  }
};
