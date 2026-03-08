const isPlainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:");

const sanitizePdfElement = (element) => {
  if (!isPlainObject(element)) return element;

  const next = { ...element };

  // Do not persist embedded images in PDF snapshot metadata.
  if (isDataUrl(next.src)) {
    next.src = "";
  }

  return next;
};

export const sanitizePdfEditsSnapshot = (edits) => {
  if (!isPlainObject(edits)) {
    return { elements: [], configuration: {} };
  }

  const configuration = isPlainObject(edits.configuration)
    ? { ...edits.configuration }
    : {};

  // Background data URLs make the stored export document exceed MongoDB limits.
  if (isDataUrl(configuration.backgroundImage)) {
    configuration.backgroundImage = null;
  }

  return {
    elements: Array.isArray(edits.elements)
      ? edits.elements.map(sanitizePdfElement)
      : [],
    configuration,
  };
};
