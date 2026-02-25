import html2canvas from "html2canvas";
import { generateConfiguratorPdf } from "./pdfGenerator";

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function withTemporaryVisibility(nodes, makeVisible, fn) {
  const list = Array.isArray(nodes) ? nodes.filter(Boolean) : [];
  const prev = list.map((n) => n.visible());
  list.forEach((n) => n.visible(makeVisible));
  try {
    return fn();
  } finally {
    list.forEach((n, i) => n.visible(prev[i]));
  }
}

export function exportLayerPng(stage, layerSelector, filename, { pixelRatio = 2 } = {}) {
  if (!stage) return;
  const layer = stage.findOne(layerSelector);
  if (!layer) return;

  const transformer = stage.findOne(".transformer");
  return withTemporaryVisibility([transformer], false, () => {
    const dataUrl = layer.toDataURL({ mimeType: "image/png", pixelRatio });
    downloadDataUrl(dataUrl, filename);
  });
}

export function exportFullCompositionPng(stage, filename, { pixelRatio = 2 } = {}) {
  if (!stage) return;
  const maskLayer = stage.findOne(".mask-layer");
  const transformer = stage.findOne(".transformer");
  return withTemporaryVisibility([maskLayer, transformer], false, () => {
    const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio });
    downloadDataUrl(dataUrl, filename);
  });
}

export function exportConfigJson(config, filename) {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

/**
 * DOM capture (optional) — useful if you wrap the preview in additional DOM overlays.
 */
export async function exportDomAsPng(domNode, filename) {
  if (!domNode) return;
  const canvas = await html2canvas(domNode, {
    useCORS: true,
    scale: 2,
    backgroundColor: "#ffffff",
  });
  const dataUrl = canvas.toDataURL("image/png");
  downloadDataUrl(dataUrl, filename);
}

export async function exportConfiguratorPdf({ stage, device, config }) {
  if (!stage || !device || !config) return;

  const maskLayer = stage.findOne(".mask-layer");
  const transformer = stage.findOne(".transformer");

  const previewDataUrl = withTemporaryVisibility([maskLayer, transformer], false, () =>
    stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 })
  );

  const blob = await generateConfiguratorPdf({
    device,
    config,
    previewDataUrl,
  });
  downloadBlob(blob, `${device.name || "device"}-configuration.pdf`);
}

