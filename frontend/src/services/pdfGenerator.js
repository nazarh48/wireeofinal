import { jsPDF } from "jspdf";

function summarizeConfig(config) {
  const elements = Array.isArray(config?.elements) ? config.elements : [];
  const icons = elements.filter((e) => e.type === "icon");
  const texts = elements.filter((e) => e.type === "text");

  const iconNames = Array.from(
    new Set(
      icons
        .map((i) => (i?.name ? String(i.name).trim() : ""))
        .filter(Boolean)
    )
  );

  const textValues = texts
    .map((t) => (t?.text ? String(t.text).trim() : ""))
    .filter(Boolean);

  return {
    iconNames,
    textValues,
  };
}

/**
 * Structured single-page configurator PDF.
 * Uses jsPDF for predictable client-side generation.
 */
export async function generateConfiguratorPdf({ device, config, previewDataUrl }) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const margin = 40;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const { iconNames, textValues } = summarizeConfig(config);
  const capabilityType = config?.capabilityType || "—";
  const configurationCode = config?.configurationCode || config?.id || "—";
  const backgroundFileName = config?.backgroundFileName || "";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(device?.name || "Device configuration", margin, margin);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Configuration code: ${configurationCode}`, margin, margin + 18);
  doc.text(`Capability type: ${capabilityType}`, margin, margin + 32);
  doc.text(
    `Background file: ${
      backgroundFileName ? backgroundFileName : "None / default device background"
    }`,
    margin,
    margin + 46,
    { maxWidth: pageW - margin * 2 }
  );
  doc.text(`Selected icons: ${iconNames.length ? iconNames.join(", ") : "None"}`, margin, margin + 66, {
    maxWidth: pageW - margin * 2,
  });
  doc.text(`Entered text: ${textValues.length ? textValues.join(", ") : "None"}`, margin, margin + 82, {
    maxWidth: pageW - margin * 2,
  });

  if (previewDataUrl) {
    const imgW = pageW - margin * 2;
    const imgH = Math.min(420, pageH - (margin + 110) - margin);
    doc.setDrawColor(220);
    doc.rect(margin, margin + 100, imgW, imgH);
    doc.addImage(previewDataUrl, "PNG", margin, margin + 100, imgW, imgH, undefined, "FAST");
  }

  return doc.output("blob");
}

