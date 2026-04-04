/**
 * Normalise values from multipart/form-data (multer + busboy).
 * Some proxies or clients duplicate keys; busboy may expose the last value or an array.
 */

export function firstFormValue(raw) {
  if (raw === undefined || raw === null) return undefined;
  if (Array.isArray(raw)) {
    for (let i = raw.length - 1; i >= 0; i--) {
      const v = firstFormValue(raw[i]);
      if (v !== undefined && v !== "") return v;
    }
    return undefined;
  }
  if (typeof raw === "object" && !(raw instanceof Date) && !Buffer.isBuffer(raw)) {
    return undefined;
  }
  return raw;
}

/** Boolean from FormData: undefined if absent / empty / unknown. */
export function parseBoolFromForm(v) {
  const x = firstFormValue(v);
  if (x === undefined || x === null || x === "") return undefined;
  if (typeof x === "boolean") return x;
  if (typeof x === "number" && Number.isFinite(x)) return x !== 0;
  const s = String(x).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return undefined;
}

export function parseBoolFromFormLoose(v, fallback = false) {
  const b = parseBoolFromForm(v);
  return b === undefined ? fallback : b;
}

/** Positive integer for pixel fields; undefined if missing or invalid. */
export function parsePositiveIntFromForm(v) {
  const x = firstFormValue(v);
  if (x === undefined || x === null || x === "") return undefined;
  if (typeof x === "number" && Number.isFinite(x)) {
    const r = Math.trunc(x);
    return r > 0 ? r : undefined;
  }
  const s = String(x).trim().replace(/,/g, "");
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function parseTrimmedString(v) {
  const x = firstFormValue(v);
  if (x === undefined || x === null) return undefined;
  return String(x).trim();
}

/**
 * All scalar product fields from req.body after multipart parsing.
 * Does not include file blobs or JSON blobs (existingImages, fileLabels, etc.).
 */
export function parseProductFormBody(body) {
  const b = body || {};
  return {
    name: parseTrimmedString(b.name),
    productCode: parseTrimmedString(b.productCode),
    description: parseTrimmedString(b.description),
    technicalDetails: parseTrimmedString(b.technicalDetails),
    range: firstFormValue(b.range),
    baseImageUrl: parseTrimmedString(b.baseImageUrl),
    configuratorImageUrl: parseTrimmedString(b.configuratorImageUrl),
    baseDeviceImageUrl: parseTrimmedString(b.baseDeviceImageUrl),
    engravingMaskImageUrl: parseTrimmedString(b.engravingMaskImageUrl),
    printAreaBackgroundImageUrl: parseTrimmedString(b.printAreaBackgroundImageUrl),
    isConfigurable: parseBoolFromForm(b.isConfigurable),
    status: parseTrimmedString(b.status),
    featured: parseBoolFromForm(b.featured),
    printingEnabled: parseBoolFromForm(b.printingEnabled),
    laserEnabled: parseBoolFromForm(b.laserEnabled),
    backgroundCustomizable: parseBoolFromForm(b.backgroundCustomizable),
    backgroundEnabled: parseBoolFromForm(b.backgroundEnabled),
    iconsTextEnabled: parseBoolFromForm(b.iconsTextEnabled),
    photoCroppingEnabled: parseBoolFromForm(b.photoCroppingEnabled),
    photoCroppingHeightPx: parsePositiveIntFromForm(b.photoCroppingHeightPx),
    photoCroppingWidthPx: parsePositiveIntFromForm(b.photoCroppingWidthPx),
  };
}
