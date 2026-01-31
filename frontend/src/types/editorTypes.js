/**
 * Konva Canvas Editor – type definitions (JSDoc)
 *
 * Node schema: id, type, attrs, zIndex, locked, visible.
 * Attrs hold all Konva-style props (x, y, width, height, rotation, fill, stroke, etc.)
 */

/**
 * @typedef {'text'|'image'|'rectangle'|'circle'|'line'|'arrow'|'pen'|'path'|'icon'|'sticker'|'group'} EditorNodeType
 */

/**
 * @typedef {Object} EditorNodeAttrs
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [rotation]
 * @property {number} [opacity]
 * @property {string} [fill]
 * @property {string} [stroke]
 * @property {number} [strokeWidth]
 * @property {string} [text]
 * @property {number} [fontSize]
 * @property {string} [fontFamily]
 * @property {string} [fontStyle]
 * @property {string} [color]
 * @property {string} [src] - image URL / data URL
 * @property {number[]|string} [points] - for line, arrow, path
 * @property {string} [data] - SVG path data for Path
 * @property {string} [emoji]
 */

/**
 * @typedef {Object} EditorNode
 * @property {string} id
 * @property {EditorNodeType} type
 * @property {EditorNodeAttrs & Record<string, unknown>} [attrs] - flattened; for backward compat we also allow props at top level
 * @property {number} [zIndex]
 * @property {boolean} [locked]
 * @property {boolean} [visible]
 */

/**
 * Normalized element as used in store: flat props (id, type, x, y, ...) for compatibility.
 * zIndex, locked, visible are optional. Old saves have no attrs object; migration flattens to this.
 * @typedef {EditorNode & EditorNodeAttrs} CanvasElement
 */

export default {};
