/**
 * Editor migration: map old canvas editor data format to Konva node schema.
 * Ensures existing saved designs load correctly with id, type, attrs, zIndex, locked, visible.
 */

const DEFAULT_Z_INDEX = 0;
const DEFAULT_VISIBLE = true;
const DEFAULT_LOCKED = false;

/**
 * Normalize a single element from legacy format to Konva node schema.
 * Legacy: { id, type, x, y, width, height, rotation, fill, stroke, text, ... }
 * New: same flat shape but with guaranteed zIndex, locked, visible; attrs can be used by consumers.
 *
 * @param {Record<string, unknown>} element - Raw element from API or saved state
 * @param {number} [index] - Array index (used for generating id if missing)
 * @returns {Record<string, unknown>} Normalized element (flat: id, type, x, y, zIndex, locked, visible, ...)
 */
export function normalizeElement(element, index = 0) {
  if (!element || typeof element !== 'object') return null;

  const id = element.id ?? `elem_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}`;
  const type = element.type || 'rectangle';
  const zIndex = element.zIndex ?? DEFAULT_Z_INDEX;
  const visible = element.visible !== false;
  const locked = element.locked === true;

  // Preserve all existing props (x, y, width, height, fill, stroke, text, etc.)
  const { id: _i, type: _t, zIndex: _z, locked: _l, visible: _v, attrs, ...rest } = element;

  // If element already has attrs, merge attrs into flat rest; otherwise rest is already flat
  const flatAttrs = attrs && typeof attrs === 'object' ? { ...attrs, ...rest } : { ...rest };

  return {
    id,
    type,
    zIndex,
    locked,
    visible,
    ...flatAttrs,
  };
}

/**
 * Normalize full elements array from saved/API format.
 * Used when loading product edits so old designs still work.
 *
 * @param {unknown} elements - Array of elements (or undefined/null)
 * @returns {Record<string, unknown>[]} Normalized array
 */
export function normalizeElements(elements) {
  if (!Array.isArray(elements)) return [];
  return elements.map((el, i) => normalizeElement(el, i)).filter(Boolean);
}

/**
 * Convert normalized element back to a shape suitable for persistence (optional).
 * Keeps flat format for backward compatibility with backend canvasData.
 *
 * @param {Record<string, unknown>} node - Normalized editor node
 * @returns {Record<string, unknown>} Serializable element
 */
export function toSerializable(node) {
  if (!node || typeof node !== 'object') return node;
  const { attrs, ...rest } = node;
  const flat = attrs && typeof attrs === 'object' ? { ...rest, ...attrs } : rest;
  return flat;
}
