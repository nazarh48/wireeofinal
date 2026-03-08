export const generateProjectPDF = async (project, options = {}) => {
  // If project has products, reuse generateProductPDF
  if (project && Array.isArray(project.products)) {
    return generateProductPDF(project.products, { ...options, projectName: project.name || options.projectName, configurationNumber: project.configurationNumber || options.configurationNumber });
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
  } else if (element.type === "mdiIcon" && element.pathData) {
    drawWithRotation(() => {
      const iconW = element.width ?? 34;
      const iconH = element.height ?? 34;
      const sx = iconW / 24;
      const sy = iconH / 24;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sx, sy);
      if (typeof Path2D !== "undefined") {
        const p = new Path2D(element.pathData);
        const fillColor = element.fill ?? element.color ?? "#111827";
        const strokeColor = element.stroke ?? "transparent";
        if (fillColor && fillColor !== "transparent") {
          ctx.fillStyle = fillColor;
          ctx.fill(p);
        }
        if (strokeColor && strokeColor !== "transparent") {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = Math.max(0.5, (element.strokeWidth ?? 1) / Math.max(sx, sy));
          ctx.stroke(p);
        }
      }
      ctx.restore();
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

// Product images are rendered at a higher internal resolution than their displayed size
// so the PDF stays sharp while still fitting multiple configured terminals per page.
const PDF_PRODUCT_THUMB_WIDTH = 720;
const PDF_PRODUCT_THUMB_HEIGHT = 540;
const PDF_PRODUCT_IMAGE_DISPLAY_WIDTH_PX = 180;
const PDF_PRODUCT_IMAGE_DISPLAY_HEIGHT_PX = 135;
const PDF_PRODUCT_ROW_MIN_HEIGHT_PX = 170;
const PDF_FIRST_PAGE_PRODUCT_COUNT = 3;
const PDF_FOLLOWING_PAGE_PRODUCT_COUNT = 4;
const PDF_SUMMARY_ROWS_PER_PAGE = 14;
const PDF_JPEG_QUALITY = 0.95;

// Editor canvas coordinate space. Must match Konva editor / EditedProductPreview
// so element positions and backgrounds line up exactly.
const EDITOR_CANVAS_WIDTH = 800;
const EDITOR_CANVAS_HEIGHT = 600;

// Helper function to render edited product on canvas (base image + all overlays).
// Element coordinates are in editor space (EDITOR_CANVAS_WIDTH x EDITOR_CANVAS_HEIGHT). When output size differs (e.g. thumbnail 120x90), we scale so the rectangle/overlays appear in the same relative position as in the web view.
const renderEditedProduct = async (
  product,
  canvasWidth = EDITOR_CANVAS_WIDTH,
  canvasHeight = EDITOR_CANVAS_HEIGHT,
  asJpeg = false,
  jpegQuality = PDF_JPEG_QUALITY,
) => {
  // Use the same configurator canvas + background sizing as KonvaCanvasEditor
  const cfg = product?.edits?.configuration || {};
  const editorCanvasWidth = cfg.canvasWidth || EDITOR_CANVAS_WIDTH;
  const editorCanvasHeight = cfg.canvasHeight || EDITOR_CANVAS_HEIGHT;
  const backgroundWidth = cfg.backgroundWidth || editorCanvasWidth;
  const backgroundHeight = cfg.backgroundHeight || editorCanvasHeight;

  const w = Math.max(1, canvasWidth || editorCanvasWidth);
  const h = Math.max(1, canvasHeight || editorCanvasHeight);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  if (!ensureCanvasReady(canvas)) throw new Error("[PDF] Canvas initialization failed");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("[PDF] Canvas context creation failed");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Optional Layer 2 – custom background uploaded in configurator (same data used in editor & previews)
  const backgroundImageDataUrl = cfg.backgroundImage || null;

  // Prefer the same base image order as EditedProductPreview / editor canvas
  // so the PDF visual matches Projects/editor exactly.
  const originalImageUrl =
    product.baseDeviceImageUrl ||
    product.configuratorImageUrl ||
    product.baseImageUrl ||
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) : null);
  if (!originalImageUrl || typeof originalImageUrl !== "string") {
    console.warn("[PDF] renderEditedProduct: no base image URL for product", product?.id ?? product?._instanceId);
  }
  try {
    const [baseImg, bgImg] = await Promise.all([
      originalImageUrl ? loadImage(originalImageUrl) : Promise.resolve(null),
      backgroundImageDataUrl ? loadImage(backgroundImageDataUrl) : Promise.resolve(null),
    ]);
    // Scale from editor coordinate space (canvasWidth x canvasHeight)
    // into the requested output size, preserving relative positions.
    const scaleX = w / editorCanvasWidth;
    const scaleY = h / editorCanvasHeight;
    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw custom background using the same sizing as the editor:
    // (0,0) with width/height = backgroundWidth/backgroundHeight.
    if (bgImg) {
      try {
        ctx.drawImage(bgImg, 0, 0, backgroundWidth, backgroundHeight);
      } catch (e) {
        // Ignore background draw errors; continue with base image and elements
      }
    }

    // Draw base image fitted in editor canvas space (editorCanvasWidth x editorCanvasHeight)
    // to avoid distortion, matching KonvaCanvasEditor / EditedProductPreview.
    if (baseImg) {
      const iw = baseImg.naturalWidth || baseImg.width || editorCanvasWidth;
      const ih = baseImg.naturalHeight || baseImg.height || editorCanvasHeight;
      const fitScale = Math.min(editorCanvasWidth / iw, editorCanvasHeight / ih);
      const drawW = iw * fitScale;
      const drawH = ih * fitScale;
      const bx = (editorCanvasWidth - drawW) / 2;
      const by = (editorCanvasHeight - drawH) / 2;
      ctx.drawImage(baseImg, 0, 0, iw, ih, bx, by, drawW, drawH);
    }
    if (product.edits?.elements?.length > 0) {
      const imageElements = product.edits.elements.filter((el) => el.type === "image" && el.src);
      const loadedImages = await Promise.all(imageElements.map((el) => loadImage(el.src)));
      product.edits.elements.forEach((element) => {
        drawElementOnContext(ctx, element, loadedImages, imageElements);
      });
    }
    ctx.restore();
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

function chunkProductsForPages(products) {
  const pages = [];
  const firstPageProducts = products.slice(0, PDF_FIRST_PAGE_PRODUCT_COUNT);

  if (firstPageProducts.length) {
    pages.push(firstPageProducts);
  }

  for (
    let index = PDF_FIRST_PAGE_PRODUCT_COUNT;
    index < products.length;
    index += PDF_FOLLOWING_PAGE_PRODUCT_COUNT
  ) {
    pages.push(products.slice(index, index + PDF_FOLLOWING_PAGE_PRODUCT_COUNT));
  }

  return pages;
}

function chunkSummaryRows(products) {
  const pages = [];

  for (let index = 0; index < products.length; index += PDF_SUMMARY_ROWS_PER_PAGE) {
    pages.push(products.slice(index, index + PDF_SUMMARY_ROWS_PER_PAGE));
  }

  return pages;
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

async function capturePageAndAddToPdf(pdf, pageDiv, isFirstPage) {
  document.body.appendChild(pageDiv);
  await waitForRender(2);
  await waitForImagesInElement(pageDiv, 10000);
  try {
    const width = Math.max(1, pageDiv.offsetWidth || PDF_PAGE_WIDTH_PX);
    const height = Math.max(1, pageDiv.offsetHeight || 1122);
    const canvas = await html2canvas(pageDiv, {
      scale: 3,
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
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm, undefined, "FAST");
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
      companyName: companyNameOption = "",
      configurationNumber,
    } = options || {};

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const configNumber = configurationNumber || `CFG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
    const reportDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const reportYear = new Date().getFullYear();
    const accentColor = "#0f766e";
    const accentSoft = "#ecfdf5";
    const accentBorder = "#99f6e4";
    const slateSoft = "#f8fafc";
    const slateBorder = "#e2e8f0";
    const textMuted = "#64748b";
    const footerLegal = "The current terms and conditions of sale and delivery can always be found on our website at: wireeo.com/terms";
    const footerCompany = `WIREEO • Professional Electrical Configuration Systems • www.wireeo.com • ${reportYear}`;
    const resolveUserName = (account) => {
      if (!account || typeof account !== "object") return "—";
      const fullName = [account.firstName, account.lastName]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
        .join(" ");
      return (
        fullName ||
        account.name ||
        account.fullName ||
        account.displayName ||
        account.customerName ||
        account.companyName ||
        account.company ||
        "—"
      );
    };
    const resolveUserCompany = (account) =>
      account?.companyName ||
      account?.company ||
      account?.businessName ||
      account?.organization ||
      "";
    const resolveUserCustomerNumber = (account) =>
      account?.customerNumber ||
      account?.customerNr ||
      account?.customerNo ||
      account?.customerId ||
      account?.accountNumber ||
      account?._id ||
      account?.id ||
      "—";
    const resolveUserPhone = (account) =>
      account?.phone ||
      account?.tel ||
      account?.telephone ||
      account?.mobile ||
      account?.mobileNumber ||
      account?.phoneNumber ||
      "—";
    const resolveUserEmail = (account) =>
      account?.email ||
      account?.mail ||
      account?.emailAddress ||
      "—";
    const resolveUserAddress = (account) => {
      if (!account || typeof account !== "object") return "—";
      if (typeof account.address === "string" && account.address.trim()) {
        return account.address.trim();
      }
      const address = account.address && typeof account.address === "object" ? account.address : null;
      const addressLine = [
        address?.street,
        address?.street2,
        address?.zip,
        address?.postalCode,
        address?.city,
        address?.country,
      ]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
        .join(", ");
      return addressLine || "—";
    };
    const pdfUser = {
      name: resolveUserName(user),
      company: resolveUserCompany(user),
      customerNumber: resolveUserCustomerNumber(user),
      phone: resolveUserPhone(user),
      email: resolveUserEmail(user),
      address: resolveUserAddress(user),
    };

    const addText = (parent, text, fontSize = 11, color = "#1f2937", marginBottom = 4) => {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.display = "block";
      el.style.fontSize = `${fontSize}px`;
      el.style.color = color;
      el.style.margin = `0 0 ${marginBottom}px 0`;
      el.style.lineHeight = "1.4";
      parent.appendChild(el);
      return el;
    };

    const buildPillBadgeDataUrl = (label) => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="34" viewBox="0 0 150 34">
          <rect x="0.75" y="0.75" width="148.5" height="32.5" rx="16.25" fill="#ffffff" stroke="${accentBorder}" stroke-width="1.5"/>
          <text
            x="75"
            y="17"
            fill="${accentColor}"
            font-family="Segoe UI, Roboto, Arial, sans-serif"
            font-size="11"
            font-weight="700"
            letter-spacing="0.33"
            text-anchor="middle"
            dominant-baseline="middle"
          >${label}</text>
        </svg>
      `;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    };

    const addBrandHeader = (parent) => {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "18px";
      wrapper.style.border = `1px solid ${accentBorder}`;
      wrapper.style.borderRadius = "20px";
      wrapper.style.backgroundColor = accentSoft;
      wrapper.style.boxSizing = "border-box";
      wrapper.style.overflow = "hidden";

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.tableLayout = "fixed";

      const tr = document.createElement("tr");
      const leftTd = document.createElement("td");
      leftTd.style.padding = "20px 16px 20px 28px";
      leftTd.style.verticalAlign = "middle";
      leftTd.style.width = "auto";

      const leftTable = document.createElement("table");
      leftTable.style.borderCollapse = "collapse";
      leftTable.style.tableLayout = "fixed";

      const logoImg = document.createElement("img");
      logoImg.src = `${window.location.origin}/assets/Logowireeo.png`;
      logoImg.alt = "Wireeo";
      logoImg.style.height = "48px";
      logoImg.style.width = "auto";
      logoImg.style.maxWidth = "160px";
      logoImg.style.display = "block";
      logoImg.onerror = () => { logoImg.style.display = "none"; };

      const sep = document.createElement("span");
      sep.style.display = "block";
      sep.style.width = "1px";
      sep.style.height = "36px";
      sep.style.backgroundColor = accentBorder;
      sep.style.margin = "0 auto";

      const titleMain = document.createElement("div");
      titleMain.textContent = companyNameOption || "WIREEO";
      titleMain.style.display = "block";
      titleMain.style.fontSize = "19px";
      titleMain.style.fontWeight = "700";
      titleMain.style.letterSpacing = "0.05em";
      titleMain.style.color = "#0f172a";
      titleMain.style.lineHeight = "1.25";
      titleMain.style.margin = "0 0 3px 0";

      const titleSub = document.createElement("div");
      titleSub.textContent = "Configured terminal report";
      titleSub.style.display = "block";
      titleSub.style.fontSize = "11px";
      titleSub.style.color = textMuted;
      titleSub.style.lineHeight = "1.3";
      titleSub.style.margin = "0";

      const leftRow = document.createElement("tr");

      const logoCell = document.createElement("td");
      logoCell.style.verticalAlign = "middle";
      logoCell.style.width = "160px";
      logoCell.appendChild(logoImg);

      const dividerCell = document.createElement("td");
      dividerCell.style.verticalAlign = "middle";
      dividerCell.style.width = "33px";
      dividerCell.style.padding = "0 16px";
      dividerCell.style.boxSizing = "border-box";
      dividerCell.appendChild(sep);

      const titleCell = document.createElement("td");
      titleCell.style.verticalAlign = "middle";
      titleCell.style.textAlign = "center";
      titleCell.appendChild(titleMain);
      titleCell.appendChild(titleSub);

      leftRow.appendChild(logoCell);
      leftRow.appendChild(dividerCell);
      leftRow.appendChild(titleCell);
      leftTable.appendChild(leftRow);
      leftTd.appendChild(leftTable);

      const rightTd = document.createElement("td");
      rightTd.style.padding = "20px 28px 20px 12px";
      rightTd.style.verticalAlign = "middle";
      rightTd.style.textAlign = "right";
      rightTd.style.width = "200px";

      const rightTable = document.createElement("table");
      rightTable.style.borderCollapse = "collapse";
      rightTable.style.marginLeft = "auto";

      const reportChip = document.createElement("img");
      reportChip.src = buildPillBadgeDataUrl("Customer Report");
      reportChip.alt = "Customer Report";
      reportChip.style.display = "block";
      reportChip.style.width = "150px";
      reportChip.style.height = "34px";
      reportChip.style.margin = "0";

      const generatedText = document.createElement("div");
      generatedText.textContent = reportDate;
      generatedText.style.display = "block";
      generatedText.style.fontSize = "10px";
      generatedText.style.color = textMuted;
      generatedText.style.lineHeight = "1.2";
      generatedText.style.textAlign = "center";
      generatedText.style.margin = "8px 0 0 0";

      const chipRow = document.createElement("tr");
      const chipCell = document.createElement("td");
      chipCell.style.verticalAlign = "middle";
      chipCell.appendChild(reportChip);
      chipRow.appendChild(chipCell);

      const dateRow = document.createElement("tr");
      const dateCell = document.createElement("td");
      dateCell.style.verticalAlign = "middle";
      dateCell.appendChild(generatedText);
      dateRow.appendChild(dateCell);

      rightTable.appendChild(chipRow);
      rightTable.appendChild(dateRow);
      rightTd.appendChild(rightTable);

      tr.appendChild(leftTd);
      tr.appendChild(rightTd);
      table.appendChild(tr);
      wrapper.appendChild(table);
      parent.appendChild(wrapper);
    };

    const addHighlightStrip = (parent, items) => {
      const outer = document.createElement("div");
      outer.style.marginBottom = "18px";

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "separate";
      table.style.borderSpacing = "0";
      table.style.tableLayout = "fixed";

      const tr = document.createElement("tr");

      items.forEach(({ label, value }, idx) => {
        const td = document.createElement("td");
        td.style.verticalAlign = "top";
        td.style.width = `${100 / items.length}%`;
        if (idx > 0) td.style.paddingLeft = "12px";

        const cardTable = document.createElement("table");
        cardTable.style.width = "100%";
        cardTable.style.height = "76px";
        cardTable.style.borderCollapse = "separate";
        cardTable.style.borderSpacing = "0";
        cardTable.style.tableLayout = "fixed";
        cardTable.style.border = `1px solid ${slateBorder}`;
        cardTable.style.borderRadius = "16px";
        cardTable.style.backgroundColor = "#ffffff";
        cardTable.style.overflow = "hidden";

        const cardRow = document.createElement("tr");
        const cardCell = document.createElement("td");
        cardCell.style.verticalAlign = "middle";
        cardCell.style.padding = "0 18px";
        cardCell.style.boxSizing = "border-box";
        cardCell.style.textAlign = "left";

        const cardLabel = document.createElement("div");
        cardLabel.textContent = label;
        cardLabel.style.display = "block";
        cardLabel.style.width = "100%";
        cardLabel.style.fontSize = "9px";
        cardLabel.style.fontWeight = "700";
        cardLabel.style.letterSpacing = "0.08em";
        cardLabel.style.textTransform = "uppercase";
        cardLabel.style.color = textMuted;
        cardLabel.style.margin = "0 0 7px 0";
        cardLabel.style.lineHeight = "1.15";
        cardLabel.style.textAlign = "left";

        const cardValue = document.createElement("div");
        cardValue.textContent = value;
        cardValue.style.display = "block";
        cardValue.style.width = "100%";
        cardValue.style.fontSize = "14px";
        cardValue.style.fontWeight = "700";
        cardValue.style.color = "#0f172a";
        cardValue.style.lineHeight = "1.25";
        cardValue.style.wordBreak = "break-word";
        cardValue.style.margin = "0";
        cardValue.style.textAlign = "left";

        cardCell.appendChild(cardLabel);
        cardCell.appendChild(cardValue);
        cardRow.appendChild(cardCell);
        cardTable.appendChild(cardRow);
        td.appendChild(cardTable);
        tr.appendChild(td);
      });

      table.appendChild(tr);
      outer.appendChild(table);
      parent.appendChild(outer);
    };

    const addSectionHeading = (parent, title, subtitle = "") => {
      const block = document.createElement("div");
      block.style.marginBottom = "12px";

      const heading = document.createElement("div");
      heading.textContent = title;
      heading.style.fontSize = "16px";
      heading.style.fontWeight = "700";
      heading.style.color = "#0f172a";
      heading.style.marginBottom = subtitle ? "4px" : "0";

      block.appendChild(heading);

      if (subtitle) {
        const description = document.createElement("div");
        description.textContent = subtitle;
        description.style.fontSize = "10px";
        description.style.color = textMuted;
        block.appendChild(description);
      }

      parent.appendChild(block);
    };

    const addCustomerCard = (parent) => {
      const card = document.createElement("table");
      card.style.width = "100%";
      card.style.borderCollapse = "separate";
      card.style.borderSpacing = "0";
      card.style.tableLayout = "fixed";
      card.style.borderRadius = "18px";
      card.style.border = `1px solid ${slateBorder}`;
      card.style.backgroundColor = slateSoft;
      card.style.marginBottom = "18px";
      card.style.overflow = "hidden";

      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.style.padding = "18px 20px";
      cell.style.verticalAlign = "top";

      addText(cell, "Customer", 10, textMuted, 6).style.fontWeight = "700";
      addText(cell, pdfUser.name, 12, "#0f172a", 3).style.fontWeight = "700";
      if (pdfUser.company && pdfUser.company !== pdfUser.name) {
        addText(cell, pdfUser.company, 11, "#334155", 3);
      }
      addText(cell, `Customer Nr.: ${pdfUser.customerNumber}`, 11, "#334155", 3);
      addText(cell, `Tel.: ${pdfUser.phone}`, 11, "#334155", 3);
      addText(cell, `E-Mail: ${pdfUser.email}`, 11, "#334155", 3);
      addText(cell, pdfUser.address, 11, "#334155", 0);

      row.appendChild(cell);
      card.appendChild(row);
      parent.appendChild(card);
    };

    const addGeneratedByCard = (parent) => {
      const card = document.createElement("table");
      card.style.width = "100%";
      card.style.borderCollapse = "separate";
      card.style.borderSpacing = "0";
      card.style.tableLayout = "fixed";
      card.style.borderRadius = "18px";
      card.style.border = `1px solid ${slateBorder}`;
      card.style.backgroundColor = "#ffffff";
      card.style.marginBottom = "18px";
      card.style.overflow = "hidden";

      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.style.padding = "18px 20px";
      cell.style.verticalAlign = "top";

      addText(cell, "Generated by customer account", 10, textMuted, 6).style.fontWeight = "700";
      addText(cell, pdfUser.name, 12, "#0f172a", 3).style.fontWeight = "700";
      addText(cell, `E-Mail: ${pdfUser.email}`, 11, "#334155", 3);
      addText(cell, `Tel.: ${pdfUser.phone}`, 11, "#334155", 3);
      addText(cell, `Customer Nr.: ${pdfUser.customerNumber}`, 11, "#334155", 3);
      addText(cell, `This PDF was generated on ${reportDate}.`, 11, "#334155", 0);

      row.appendChild(cell);
      card.appendChild(row);
      parent.appendChild(card);
    };

    const addUserIntroSection = (parent) => {
      addCustomerCard(parent);
    };

    const addPageFooter = (parent, currentPage, totalPages) => {
      const divider = document.createElement("div");
      divider.style.height = "1px";
      divider.style.backgroundColor = slateBorder;
      divider.style.marginBottom = "10px";
      parent.appendChild(divider);

      addText(parent, footerLegal, 9, "#6b7280", 8);
      addText(parent, footerCompany, 8, "#9ca3af", 16);

      const pageNum = document.createElement("div");
      pageNum.style.textAlign = "center";
      pageNum.style.fontSize = "10px";
      pageNum.style.color = "#9ca3af";
      pageNum.textContent = `-- ${currentPage} of ${totalPages} --`;
      parent.appendChild(pageNum);
    };

    const createProductTable = (productsForPage, startIndex, productThumbs) => {
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "separate";
      table.style.borderSpacing = "0 10px";
      table.style.fontSize = "10px";
      table.style.marginBottom = "24px";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["Image", "Item No./Items", "Description", "Piece"].forEach((thText) => {
        const th = document.createElement("th");
        th.textContent = thText;
        th.style.textAlign = "left";
        th.style.padding = "0 12px 8px";
        th.style.borderBottom = `2px solid ${accentColor}`;
        th.style.color = "#0f172a";
        th.style.fontWeight = "700";
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      productsForPage.forEach((product, idx) => {
        const globalIndex = startIndex + idx;
        const tr = document.createElement("tr");
        tr.style.minHeight = `${PDF_PRODUCT_ROW_MIN_HEIGHT_PX}px`;
        tr.style.backgroundColor = "#ffffff";

        const imgTd = document.createElement("td");
        imgTd.style.padding = "12px";
        imgTd.style.verticalAlign = "middle";
        imgTd.style.width = "190px";
        imgTd.style.minWidth = "190px";
        imgTd.style.boxSizing = "border-box";
        imgTd.style.borderTop = `1px solid ${slateBorder}`;
        imgTd.style.borderBottom = `1px solid ${slateBorder}`;
        imgTd.style.borderLeft = `1px solid ${slateBorder}`;
        imgTd.style.borderTopLeftRadius = "16px";
        imgTd.style.borderBottomLeftRadius = "16px";
        imgTd.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : slateSoft;

        const thumbUrl = productThumbs[globalIndex];
        const imageFrame = document.createElement("div");
        imageFrame.style.width = `${PDF_PRODUCT_IMAGE_DISPLAY_WIDTH_PX}px`;
        imageFrame.style.height = `${PDF_PRODUCT_IMAGE_DISPLAY_HEIGHT_PX}px`;
        imageFrame.style.backgroundColor = "#ffffff";
        imageFrame.style.border = `1px solid ${slateBorder}`;
        imageFrame.style.borderRadius = "14px";
        imageFrame.style.overflow = "hidden";
        imageFrame.style.boxSizing = "border-box";

        if (thumbUrl) {
          const img = document.createElement("img");
          img.src = thumbUrl;
          img.alt = product?.name || "";
          img.loading = "eager";
          img.style.width = `${PDF_PRODUCT_IMAGE_DISPLAY_WIDTH_PX}px`;
          img.style.height = `${PDF_PRODUCT_IMAGE_DISPLAY_HEIGHT_PX}px`;
          img.style.objectFit = "contain";
          img.style.display = "block";
          img.style.backgroundColor = "#ffffff";
          imageFrame.appendChild(img);
        } else {
          const placeholder = document.createElement("div");
          placeholder.style.width = `${PDF_PRODUCT_IMAGE_DISPLAY_WIDTH_PX}px`;
          placeholder.style.height = `${PDF_PRODUCT_IMAGE_DISPLAY_HEIGHT_PX}px`;
          placeholder.style.backgroundColor = "#f3f4f6";
          placeholder.style.textAlign = "center";
          placeholder.style.lineHeight = `${PDF_PRODUCT_IMAGE_DISPLAY_HEIGHT_PX}px`;
          placeholder.style.fontSize = "9px";
          placeholder.style.color = "#9ca3af";
          placeholder.textContent = "No image";
          imageFrame.appendChild(placeholder);
        }
        imgTd.appendChild(imageFrame);
        tr.appendChild(imgTd);

        const itemNo = document.createElement("td");
        itemNo.style.padding = "12px";
        itemNo.style.verticalAlign = "middle";
        itemNo.style.minHeight = `${PDF_PRODUCT_ROW_MIN_HEIGHT_PX}px`;
        itemNo.style.borderTop = `1px solid ${slateBorder}`;
        itemNo.style.borderBottom = `1px solid ${slateBorder}`;
        itemNo.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : slateSoft;
        itemNo.textContent = product?.name || product?.sku || "—";
        tr.appendChild(itemNo);

        const desc = document.createElement("td");
        desc.style.padding = "12px";
        desc.style.verticalAlign = "middle";
        desc.style.minHeight = `${PDF_PRODUCT_ROW_MIN_HEIGHT_PX}px`;
        desc.style.fontSize = "10px";
        desc.style.borderTop = `1px solid ${slateBorder}`;
        desc.style.borderBottom = `1px solid ${slateBorder}`;
        desc.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : slateSoft;
        const cfg = product?.edits?.configuration || {};
        const productCode = product?.productCode || product?.sku || product?.id || "—";
        const descLines = [
          product?.name || "—",
          `Code: ${productCode}`,
         
          `Individual labelling: ${cfg.individualLabeling || cfg.individualLabel || "—"}`,
          `Floor: ${cfg.floor || "—"}`,
          `Room: ${cfg.room || "—"}`,
          `Processing: ${cfg.processingType || "Print"}`,
          "1x incl. Processing fee",
          `Filename: ${product?.sku || product?.id || "—"}`,
          "1x",
          "Item",
          String(globalIndex + 1).padStart(2, "0"),
        ].filter(Boolean);
        desc.textContent = descLines.join("\n");
        desc.style.whiteSpace = "pre-line";
        desc.style.lineHeight = "1.35";
        tr.appendChild(desc);

        const piece = document.createElement("td");
        piece.style.padding = "12px";
        piece.style.verticalAlign = "middle";
        piece.style.minHeight = `${PDF_PRODUCT_ROW_MIN_HEIGHT_PX}px`;
        piece.style.borderTop = `1px solid ${slateBorder}`;
        piece.style.borderBottom = `1px solid ${slateBorder}`;
        piece.style.borderRight = `1px solid ${slateBorder}`;
        piece.style.borderTopRightRadius = "16px";
        piece.style.borderBottomRightRadius = "16px";
        piece.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : slateSoft;
        piece.textContent = "1x";
        tr.appendChild(piece);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      return table;
    };

    const createSummaryTable = (productsForPage, startIndex) => {
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "separate";
      table.style.borderSpacing = "0";
      table.style.fontSize = "10px";
      table.style.marginBottom = "24px";
      table.style.border = `1px solid ${slateBorder}`;
      table.style.borderRadius = "16px";
      table.style.overflow = "hidden";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["Item No.", "Item", "Type", "Quantity", "Single Quantity", "File"].forEach((thText) => {
        const th = document.createElement("th");
        th.textContent = thText;
        th.style.textAlign = "left";
        th.style.padding = "10px 12px";
        th.style.backgroundColor = accentSoft;
        th.style.color = "#0f172a";
        th.style.fontWeight = "700";
        th.style.borderBottom = `1px solid ${slateBorder}`;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      productsForPage.forEach((product, idx) => {
        const cfg = product?.edits?.configuration || {};
        const globalIndex = startIndex + idx;
        const tr = document.createElement("tr");
        if (idx !== productsForPage.length - 1) {
          tr.style.borderBottom = `1px solid ${slateBorder}`;
        }

        const cells = [
          product?.name || product?.sku || "—",
          `${String(globalIndex + 1).padStart(2, "0")} | ${cfg.individualLabeling || cfg.individualLabel || "No label"} | Floor ${cfg.floor || "—"} | ${cfg.room || "—"}`,
          product?.category || product?.productType || "—",
          `${cfg.quantity || 1}x`,
          "1x",
          product?.sku || product?.id || "—",
        ];

        cells.forEach((cellText) => {
          const td = document.createElement("td");
          td.textContent = cellText;
          td.style.padding = "10px 12px";
          td.style.color = "#334155";
          td.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : slateSoft;
          td.style.borderBottom =
            idx === productsForPage.length - 1 ? "none" : `1px solid ${slateBorder}`;
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      return table;
    };

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
            if (!ctx) {
              return renderEditedProduct(
                product,
                PDF_PRODUCT_THUMB_WIDTH,
                PDF_PRODUCT_THUMB_HEIGHT,
                true,
                PDF_JPEG_QUALITY,
              );
            }

            // Match Projects tab behaviour: keep aspect ratio and center
            // the edited image on a neutral background instead of stretching.
            ctx.fillStyle = "#f3f4f6";
            ctx.fillRect(0, 0, c.width, c.height);

            const iw = img.naturalWidth || img.width || PDF_PRODUCT_THUMB_WIDTH;
            const ih = img.naturalHeight || img.height || PDF_PRODUCT_THUMB_HEIGHT;
            const scale = Math.min(c.width / iw, c.height / ih);
            const drawW = iw * scale;
            const drawH = ih * scale;
            const dx = (c.width - drawW) / 2;
            const dy = (c.height - drawH) / 2;

            ctx.drawImage(img, 0, 0, iw, ih, dx, dy, drawW, drawH);

            return c.toDataURL("image/jpeg", PDF_JPEG_QUALITY);
          }).catch(() =>
            renderEditedProduct(
              product,
              PDF_PRODUCT_THUMB_WIDTH,
              PDF_PRODUCT_THUMB_HEIGHT,
              true,
              PDF_JPEG_QUALITY,
            ),
          );
        }
        const imgFromArr = Array.isArray(product?.images) && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) : null;
        const hasImage = product?.baseDeviceImageUrl || product?.configuratorImageUrl || product?.baseImageUrl || product?.image || imgFromArr;
        if (!hasImage) return Promise.resolve(null);
        if (process.env.NODE_ENV !== "production") {
          console.info("[PDF] Item", idx, "instanceId:", product._instanceId, "productId:", product.id, "using renderEditedProduct (no editedImage)");
        }
        return renderEditedProduct(product, PDF_PRODUCT_THUMB_WIDTH, PDF_PRODUCT_THUMB_HEIGHT, true, PDF_JPEG_QUALITY).catch(() => null);
      }),
    );

    const productPages = chunkProductsForPages(safeProducts);
    const summaryPages = chunkSummaryRows(safeProducts);
    const totalPages = productPages.length + summaryPages.length;

    for (let pageIndex = 0; pageIndex < productPages.length; pageIndex += 1) {
      const pageProducts = productPages[pageIndex];
      const page = createPageWrapper();
      page.style.padding = "40px 50px 50px";

      addBrandHeader(page);
      addHighlightStrip(page, [
        { label: "Configuration", value: configNumber },
        { label: "Project", value: projectName || "—" },
        { label: "Configured terminals", value: String(safeProducts.length) },
      ]);

      if (pageIndex === 0) {
        addUserIntroSection(page);
        addText(page, "Please give this printout to your specialist partner with your order.", 11, "#1f2937", 14);
      } 

      addText(page, `Date: ${reportDate}`, 11, "#1f2937", 14);

      const pageStartIndex =
        pageIndex === 0
          ? 0
          : PDF_FIRST_PAGE_PRODUCT_COUNT + (pageIndex - 1) * PDF_FOLLOWING_PAGE_PRODUCT_COUNT;

      page.appendChild(createProductTable(pageProducts, pageStartIndex, productThumbUrls));
      addPageFooter(page, pageIndex + 1, totalPages);

      await capturePageAndAddToPdf(pdf, page, pageIndex === 0);
    }

    for (let summaryPageIndex = 0; summaryPageIndex < summaryPages.length; summaryPageIndex += 1) {
      const page = createPageWrapper();
      page.style.padding = "40px 50px 50px";

      addBrandHeader(page);
      addHighlightStrip(page, [
        { label: "Configuration", value: configNumber },
        { label: "Project", value: projectName || "—" },
        { label: "Summary page", value: `${summaryPageIndex + 1} / ${summaryPages.length}` },
      ]);
      addSectionHeading(page, "Products Table", "A compact list of all configured terminals included in this report.");

      const pageStartIndex = summaryPageIndex * PDF_SUMMARY_ROWS_PER_PAGE;
      page.appendChild(createSummaryTable(summaryPages[summaryPageIndex], pageStartIndex));
      addPageFooter(page, productPages.length + summaryPageIndex + 1, totalPages);

      await capturePageAndAddToPdf(pdf, page, false);
    }

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
