const normalizeText = (value) => String(value || "").trim().toLowerCase();

export const normalizeProcessingType = (value) => normalizeText(value);

export const hasPrintingLayer = (configuration = {}) => {
  const type = normalizeProcessingType(configuration.processingType);
  return !type || type.includes("print") || type.includes("colour");
};

export const hasLaserLayer = (configuration = {}) => {
  const type = normalizeProcessingType(configuration.processingType);
  return type.includes("laser");
};

export const buildLayerPreviewEdits = (edits, mode = "complete") => {
  const safeEdits = edits || {};
  const configuration = { ...(safeEdits.configuration || {}) };
  const elements = Array.isArray(safeEdits.elements) ? safeEdits.elements : [];

  if (mode === "background") {
    return {
      ...safeEdits,
      configuration,
      elements: [],
    };
  }

  if (mode === "printing") {
    return {
      ...safeEdits,
      configuration: {
        ...configuration,
        backgroundImage: null,
      },
      elements: hasPrintingLayer(configuration) ? elements : [],
    };
  }

  if (mode === "laser") {
    return {
      ...safeEdits,
      configuration: {
        ...configuration,
        backgroundImage: null,
      },
      elements: hasLaserLayer(configuration) ? elements : [],
    };
  }

  return {
    ...safeEdits,
    configuration,
    elements,
  };
};

export const buildLayerPreviewProduct = (product, mode = "complete") => {
  const safeProduct = product || {};

  if (mode === "complete") {
    return safeProduct;
  }

  return {
    ...safeProduct,
    editedImage: null,
    baseDeviceImageUrl: "",
    configuratorImageUrl: "",
    baseImageUrl: "",
  };
};
