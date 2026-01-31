/**
 * Safe canvas and pattern helpers to avoid "createPattern: width or height of 0" errors
 * during export/preview when canvas or image sources are not yet ready.
 */

const MIN_CANVAS_WIDTH = 1;
const MIN_CANVAS_HEIGHT = 1;

/**
 * Ensures a canvas element has valid dimensions (at least minW x minH).
 * Use before drawing or using as pattern source.
 * @param {HTMLCanvasElement} canvas
 * @param {number} [minW=1]
 * @param {number} [minH=1]
 * @returns {boolean} true if canvas is ready (width and height >= min)
 */
export function ensureCanvasReady(canvas, minW = MIN_CANVAS_WIDTH, minH = MIN_CANVAS_HEIGHT) {
  if (!canvas || typeof canvas.width !== "number" || typeof canvas.height !== "number") {
    return false;
  }
  const w = Math.max(0, canvas.width);
  const h = Math.max(0, canvas.height);
  if (w < minW || h < minH) {
    return false;
  }
  return true;
}

/**
 * Ensures an image is ready for use as pattern source (loaded and has natural dimensions).
 * @param {HTMLImageElement} img
 * @returns {Promise<boolean>} resolves true when ready
 */
export function ensureImageReady(img) {
  if (!img) return Promise.resolve(false);
  if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const onDone = () => {
      img.removeEventListener("load", onDone);
      img.removeEventListener("error", onDone);
      resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
    };
    img.addEventListener("load", onDone);
    img.addEventListener("error", onDone);
    if (img.complete) {
      onDone();
    }
  });
}

/**
 * Safe createPattern: only calls ctx.createPattern when source has valid dimensions.
 * Returns null and uses fallback fill if source is invalid (avoids crash).
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement|HTMLImageElement} source
 * @param {string} [repetition='repeat']
 * @param {string} [fallbackFill='transparent'] fallback fill style if pattern cannot be created
 * @returns {CanvasPattern|null} pattern or null; if null, caller should use fallbackFill
 */
export function safeCreatePattern(ctx, source, repetition = "repeat", fallbackFill = "transparent") {
  if (!ctx || !source) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[canvasPatternUtils] safeCreatePattern: missing ctx or source");
    }
    return null;
  }
  let valid = false;
  if (source instanceof HTMLCanvasElement) {
    valid = ensureCanvasReady(source);
  } else if (source instanceof HTMLImageElement) {
    valid = source.complete && source.naturalWidth > 0 && source.naturalHeight > 0;
  }
  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[canvasPatternUtils] safeCreatePattern: source has no valid dimensions", source);
    }
    return null;
  }
  try {
    const pattern = ctx.createPattern(source, repetition);
    return pattern;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[canvasPatternUtils] createPattern failed, using fallback:", e.message);
    }
    return null;
  }
}

/**
 * Wait for next paint so that layout and canvas dimensions are committed.
 * Call before exporting or capturing DOM that contains canvases.
 * @param {number} [frames=2] number of requestAnimationFrame cycles
 * @returns {Promise<void>}
 */
export function waitForRender(frames = 2) {
  let count = 0;
  return new Promise((resolve) => {
    function tick() {
      count += 1;
      if (count >= frames) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/**
 * Wait for all img elements inside a container to load (or error).
 * Prevents html2canvas from seeing 0-size image/canvas and triggering createPattern errors.
 * @param {HTMLElement} container - element that may contain img descendants
 * @param {number} [timeoutMs=15000] - max wait per image
 * @returns {Promise<void>}
 */
export function waitForImagesInElement(container, timeoutMs = 15000) {
  if (!container || !container.querySelectorAll) return Promise.resolve();
  const imgs = Array.from(container.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        const done = () => {
          clearTimeout(tid);
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        const tid = setTimeout(done, timeoutMs);
        img.addEventListener("load", done);
        img.addEventListener("error", done);
        if (img.complete) done();
      });
    }),
  ).then(() => {});
}

/**
 * Ensure no canvas inside the container has 0 width or height (avoids createPattern crash).
 * Sets any such canvas to 1x1 so html2canvas never receives a 0-size canvas.
 * @param {HTMLElement} container
 */
export function ensureNoZeroSizeCanvases(container) {
  if (!container || !container.querySelectorAll) return;
  const canvases = container.querySelectorAll("canvas");
  canvases.forEach((canvas) => {
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = 1;
      canvas.height = 1;
      if (process.env.NODE_ENV !== "production") {
        console.warn("[canvasPatternUtils] Fixed 0-size canvas in container");
      }
    }
  });
}
