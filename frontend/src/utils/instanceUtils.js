/**
 * instanceUtils.js – Product Instance Identity Management
 *
 * Architecture:
 *   Base catalog product  – identified by `id` / `_id` (MongoDB ObjectId, immutable)
 *   Product instance      – identified by `instanceId` (string, unique per editable copy)
 *
 * Core rules enforced here:
 *   1. Every editable copy of a product MUST carry a unique `instanceId`.
 *   2. Edit state is keyed by instanceId, NEVER by base product id.
 *   3. Duplicating a product creates a brand-new instanceId + deep-cloned edits snapshot.
 *   4. Adding the same catalog product N times produces N independent instances.
 *   5. Legacy records may use `_instanceId` (underscore prefix); normalizers migrate them.
 */

const INSTANCE_ID_PREFIX = "inst_";

/**
 * Generate a globally unique instance id.
 */
export const generateInstanceId = () =>
  `${INSTANCE_ID_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

/**
 * Extract the instanceId from any product-like object.
 * Supports both `instanceId` (current) and `_instanceId` (legacy) fields.
 * Returns null if neither is present.
 */
export const getInstanceId = (item) => {
  if (!item) return null;
  return item.instanceId || item._instanceId || null;
};

/**
 * Ensure an item has an `instanceId` field.
 * Returns a new object; never mutates the original.
 * Migrates legacy `_instanceId` to `instanceId` if needed.
 * Generates a fresh id if none exists (e.g. old DB records).
 */
export const ensureInstanceId = (item) => {
  if (!item) return item;
  const existing = getInstanceId(item);
  if (existing) {
    if (item.instanceId === existing) return item; // already canonical, no change
    // Normalize legacy field
    const { _instanceId: _removed, ...rest } = item;
    return { ...rest, instanceId: existing };
  }
  // Legacy record with no instance id – generate a transient one.
  // Callers should persist this id if the record is saved back to the DB.
  console.warn(
    "[instanceUtils] Product instance missing instanceId, generating transient one.",
    item?.id || item?._id,
  );
  return { ...item, instanceId: generateInstanceId() };
};

/**
 * Deep-clone a product instance and assign it a brand-new instanceId.
 * Used when duplicating: the clone is fully independent from the source –
 * future edits on either copy will not affect the other.
 */
export const cloneProductInstance = (item) => {
  if (!item) return null;
  const cloned = JSON.parse(JSON.stringify(item));
  cloned.instanceId = generateInstanceId();
  delete cloned._instanceId; // remove legacy field
  return cloned;
};

/**
 * Normalize a product item that comes from the API response.
 * Guarantees `instanceId` is present and the legacy `_instanceId` field is removed.
 */
export const normalizePersistedProduct = (item) => {
  if (!item) return item;
  return ensureInstanceId(item);
};

/**
 * Extract a safe edit snapshot for an instance, in priority order:
 *   1. editsByInstanceId[instanceId]   – live in-memory edits (most current)
 *   2. item.edits                       – edits embedded in the item (e.g. from project snapshot)
 * Never falls back to productEdits[productId] – that map is shared across instances.
 *
 * @param {object} item           – product instance object with instanceId
 * @param {object} editsByInstanceId – from Zustand store
 * @returns {{ elements: array, configuration: object } | null}
 */
export const resolveInstanceEdits = (item, editsByInstanceId = {}) => {
  const instanceId = getInstanceId(item);
  if (instanceId) {
    const live = editsByInstanceId[instanceId];
    if (live) {
      return {
        elements: live.elements || [],
        configuration: live.configuration || {},
      };
    }
  }
  if (item?.edits?.elements || item?.edits?.configuration) {
    return {
      elements: item.edits.elements || [],
      configuration: item.edits.configuration || {},
    };
  }
  return null;
};

/**
 * Resolve the editedImage for an instance, in priority order:
 *   1. editsByInstanceId[instanceId].editedImage
 *   2. item.editedImage
 */
export const resolveInstanceEditedImage = (item, editsByInstanceId = {}) => {
  const instanceId = getInstanceId(item);
  if (instanceId) {
    const live = editsByInstanceId[instanceId];
    if (live?.editedImage) return live.editedImage;
  }
  return item?.editedImage ?? null;
};
