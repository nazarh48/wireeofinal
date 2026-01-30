// Basic project PDF generator: delegates to generateProductPDF for now
export const generateProjectPDF = async (project, options = {}) => {
  // If project has products, reuse generateProductPDF
  if (project && Array.isArray(project.products)) {
    return generateProductPDF(project.products, { ...options, projectName: project.name || options.projectName });
  }
  throw new Error('No products found in project for PDF export.');
};
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Helper function to load image
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback for failed images
      const fallback = new Image();
      fallback.width = 200;
      fallback.height = 150;
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, 200, 150);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Image not available", 100, 75);
      const fallbackImg = new Image();
      fallbackImg.src = canvas.toDataURL();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = reject;
    };
    img.src = src;
  });
};

// Helper function to render edited product on canvas
const renderEditedProduct = async (
  product,
  canvasWidth = 800,
  canvasHeight = 600,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  try {
    // Load base image
    const baseImg = await loadImage(product.baseImageUrl || product.image);
    ctx.drawImage(baseImg, 0, 0, canvasWidth, canvasHeight);

    // Load and render all edited elements
    if (
      product.edits &&
      product.edits.elements &&
      product.edits.elements.length > 0
    ) {
      const imageElements = product.edits.elements.filter(
        (el) => el.type === "image" && el.src,
      );

      // Load all images first
      const imagePromises = imageElements.map((element) =>
        loadImage(element.src),
      );
      const loadedImages = await Promise.all(imagePromises);

      // Render all elements
      product.edits.elements.forEach((element, idx) => {
        if (element.type === "text") {
          ctx.save();
          ctx.translate(element.x || 0, element.y || 0);
          ctx.rotate(((element.rotation || 0) * Math.PI) / 180);
          ctx.font = `${element.fontWeight || "normal"} ${element.fontSize || 24}px ${element.fontFamily || "Arial"}`;
          ctx.fillStyle = element.color || "#000000";
          ctx.textBaseline = "top";
          ctx.fillText(element.text || "", 0, 0);
          ctx.restore();
        } else if (element.type === "icon") {
          ctx.save();
          ctx.translate(element.x || 0, element.y || 0);
          ctx.rotate(((element.rotation || 0) * Math.PI) / 180);
          ctx.font = `${element.fontSize || 48}px Arial`;
          ctx.fillStyle = element.color || "#000000";
          ctx.textBaseline = "top";
          ctx.fillText(element.text || "", 0, 0);
          ctx.restore();
        } else if (element.type === "image" && element.src) {
          const imgIndex = imageElements.indexOf(element);
          if (imgIndex >= 0 && loadedImages[imgIndex]) {
            ctx.save();
            ctx.translate(element.x || 0, element.y || 0);
            ctx.rotate(((element.rotation || 0) * Math.PI) / 180);
            ctx.drawImage(
              loadedImages[imgIndex],
              0,
              0,
              element.width || 100,
              element.height || 100,
            );
            ctx.restore();
          }
        }
      });
    }

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error rendering edited product:", error);
    // Return a placeholder
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Preview not available", canvasWidth / 2, canvasHeight / 2);
    return canvas.toDataURL("image/png");
  }
};

export const generateProductPDF = async (products, options = {}) => {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  if (safeProducts.length === 0) {
    throw new Error("No products available for PDF export.");
  }
  const {
    reportTitle: reportTitleText = "Customer Product Report",
    projectName,
    user,
    filenamePrefix = "Wireeo-Customer-Report",
  } = options || {};

  // Create a temporary container for the PDF content
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "100%";
  container.style.maxWidth = "900px";
  container.style.backgroundColor = "#ffffff";
  container.style.fontFamily = "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif";
  container.style.color = "#1f2937";
  container.style.padding = "0";
  container.style.boxSizing = "border-box";
  container.style.lineHeight = "1.6";

  // ===== BEAUTIFUL HEADER SECTION =====
  const header = document.createElement("div");
  header.style.position = "relative";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.padding = "60px 50px";
  header.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  header.style.color = "white";
  header.style.boxShadow = "0 20px 60px rgba(102, 126, 234, 0.4)";
  header.style.overflow = "hidden";
  header.style.pageBreakInside = "avoid";

  // Decorative background circles
  const headerDecoLeft = document.createElement("div");
  headerDecoLeft.style.position = "absolute";
  headerDecoLeft.style.top = "-50px";
  headerDecoLeft.style.left = "-50px";
  headerDecoLeft.style.width = "200px";
  headerDecoLeft.style.height = "200px";
  headerDecoLeft.style.background = "rgba(255,255,255,0.1)";
  headerDecoLeft.style.borderRadius = "50%";
  header.appendChild(headerDecoLeft);

  const headerDecoRight = document.createElement("div");
  headerDecoRight.style.position = "absolute";
  headerDecoRight.style.bottom = "-30px";
  headerDecoRight.style.right = "-50px";
  headerDecoRight.style.width = "150px";
  headerDecoRight.style.height = "150px";
  headerDecoRight.style.background = "rgba(255,255,255,0.08)";
  headerDecoRight.style.borderRadius = "50%";
  header.appendChild(headerDecoRight);

  // Premium logo
  const logo = document.createElement("div");
  logo.style.width = "110px";
  logo.style.height = "110px";
  logo.style.backgroundColor = "rgba(255,255,255,0.25)";
  logo.style.borderRadius = "16px";
  logo.style.display = "flex";
  logo.style.alignItems = "center";
  logo.style.justifyContent = "center";
  logo.style.color = "white";
  logo.style.fontSize = "50px";
  logo.style.fontWeight = "bold";
  logo.style.letterSpacing = "3px";
  logo.style.border = "3px solid rgba(255,255,255,0.4)";
  logo.style.position = "relative";
  logo.style.zIndex = "1";
  logo.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)";
  logo.textContent = "⚡";
  header.appendChild(logo);

  // Company info section
  const companyInfo = document.createElement("div");
  companyInfo.style.flex = "1";
  companyInfo.style.marginLeft = "50px";
  companyInfo.style.marginRight = "50px";
  companyInfo.style.position = "relative";
  companyInfo.style.zIndex = "1";

  const companyName = document.createElement("h1");
  companyName.textContent = "WIREEO";
  companyName.style.color = "#ffffff";
  companyName.style.margin = "0";
  companyName.style.fontSize = "56px";
  companyName.style.fontWeight = "900";
  companyName.style.letterSpacing = "4px";
  companyName.style.textShadow = "0 2px 10px rgba(0,0,0,0.2)";
  companyInfo.appendChild(companyName);

  const tagline = document.createElement("p");
  tagline.textContent = "Professional Product Configuration & Design Report";
  tagline.style.color = "rgba(255,255,255,0.95)";
  tagline.style.margin = "10px 0 0 0";
  tagline.style.fontSize = "14px";
  tagline.style.letterSpacing = "1.5px";
  tagline.style.fontWeight = "300";
  tagline.style.textTransform = "uppercase";
  companyInfo.appendChild(tagline);

  const reportTitle = document.createElement("h2");
  reportTitle.textContent = reportTitleText;
  reportTitle.style.color = "#fbbf24";
  reportTitle.style.margin = "16px 0 0 0";
  reportTitle.style.fontSize = "18px";
  reportTitle.style.fontWeight = "600";
  reportTitle.style.letterSpacing = "1px";
  companyInfo.appendChild(reportTitle);

  if (projectName) {
    const projectTitle = document.createElement("h3");
    projectTitle.textContent = `📋 Project: ${projectName}`;
    projectTitle.style.color = "#c7d2fe";
    projectTitle.style.margin = "14px 0 0 0";
    projectTitle.style.fontSize = "16px";
    projectTitle.style.fontWeight = "600";
    projectTitle.style.letterSpacing = "0.5px";
    companyInfo.appendChild(projectTitle);
  }

  header.appendChild(companyInfo);

  // Header stats - right side
  const headerStats = document.createElement("div");
  headerStats.style.display = "flex";
  headerStats.style.flexDirection = "column";
  headerStats.style.gap = "16px";
  headerStats.style.position = "relative";
  headerStats.style.zIndex = "1";

  const dateBox = document.createElement("div");
  dateBox.style.backgroundColor = "rgba(255,255,255,0.18)";
  dateBox.style.padding = "14px 24px";
  dateBox.style.borderRadius = "10px";
  dateBox.style.border = "1px solid rgba(255,255,255,0.3)";
  dateBox.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
  dateBox.style.backdropFilter = "blur(10px)";
  dateBox.textContent = "GENERATED\n" + new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  dateBox.style.fontSize = "13px";
  dateBox.style.fontWeight = "600";
  dateBox.style.textAlign = "center";
  headerStats.appendChild(dateBox);

  const countBox = document.createElement("div");
  countBox.style.backgroundColor = "rgba(255,255,255,0.18)";
  countBox.style.padding = "14px 24px";
  countBox.style.borderRadius = "10px";
  countBox.style.border = "1px solid rgba(255,255,255,0.3)";
  countBox.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
  countBox.style.backdropFilter = "blur(10px)";
  countBox.style.fontSize = "13px";
  countBox.style.fontWeight = "600";
  countBox.style.textAlign = "center";
  countBox.textContent = "TOTAL PRODUCTS\n" + safeProducts.length;
  headerStats.appendChild(countBox);

  header.appendChild(headerStats);
  container.appendChild(header);

  // ===== BEAUTIFUL INFO SECTION =====
  const reportInfo = document.createElement("div");
  reportInfo.style.display = "flex";
  reportInfo.style.justifyContent = "space-between";
  reportInfo.style.padding = "30px 50px";
  reportInfo.style.backgroundColor = "#f8fafc";
  reportInfo.style.borderBottom = "2px solid #e5e7eb";
  reportInfo.style.pageBreakInside = "avoid";

  const leftInfo = document.createElement("div");
  leftInfo.style.flex = "1";

  const timeInfo = document.createElement("div");
  timeInfo.style.fontSize = "13px";
  timeInfo.style.color = "#6b7280";
  timeInfo.style.marginBottom = "8px";
  timeInfo.textContent = `⏰ Generated: ${new Date().toLocaleTimeString()}`;
  leftInfo.appendChild(timeInfo);

  if (user && (user.name || user.email)) {
    const userLine = document.createElement("div");
    userLine.style.fontSize = "13px";
    userLine.style.color = "#374151";
    userLine.style.fontWeight = "500";
    userLine.textContent = `👤 ${user.name || "User"}${user.email ? ` • ${user.email}` : ""}`;
    leftInfo.appendChild(userLine);
  }

  const rightInfo = document.createElement("div");
  rightInfo.style.textAlign = "right";
  const statusBox = document.createElement("div");
  statusBox.style.backgroundColor = "#dcfce7";
  statusBox.style.padding = "10px 18px";
  statusBox.style.borderRadius = "8px";
  statusBox.style.border = "1px solid #86efac";
  statusBox.style.display = "inline-block";
  statusBox.style.fontSize = "13px";
  statusBox.style.fontWeight = "600";
  statusBox.style.color = "#16a34a";
  statusBox.textContent = `✓ ${safeProducts.length} Product${safeProducts.length !== 1 ? "s" : ""} Configured`;
  rightInfo.appendChild(statusBox);

  reportInfo.appendChild(leftInfo);
  reportInfo.appendChild(rightInfo);
  container.appendChild(reportInfo);

  // ===== BEAUTIFUL PRODUCTS SECTION =====
  for (let index = 0; index < safeProducts.length; index++) {
    const product = safeProducts[index];
    const productEdits = Array.isArray(product?.edits?.elements) ? product.edits.elements : [];
    const hasEdits = productEdits.length > 0;

    const productDiv = document.createElement("div");
    productDiv.style.margin = "20px 40px 0 40px";
    productDiv.style.border = "2px solid #e5e7eb";
    productDiv.style.borderRadius = "12px";
    productDiv.style.padding = "20px";
    productDiv.style.backgroundColor = "#ffffff";
    productDiv.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
    productDiv.style.pageBreakInside = "avoid";

    // Gradient top border accent
    const topAccent = document.createElement("div");
    topAccent.style.position = "absolute";
    topAccent.style.top = "0";
    topAccent.style.left = "0";
    topAccent.style.width = "100%";
    topAccent.style.height = "6px";
    topAccent.style.background = "linear-gradient(90deg, #667eea 0%, #764ba2 100%)";
    topAccent.style.borderRadius = "16px 16px 0 0";
    productDiv.style.position = "relative";
    productDiv.appendChild(topAccent);

    // Product header with number badge
    const productHeader = document.createElement("div");
    productHeader.style.display = "flex";
    productHeader.style.alignItems = "center";
    productHeader.style.marginBottom = "25px";
    productHeader.style.marginTop = "10px";
    productHeader.style.paddingBottom = "20px";
    productHeader.style.borderBottom = "2px solid #f3f4f6";
    productHeader.style.gap = "20px";

    // Beautiful product number badge
    const productNumber = document.createElement("div");
    productNumber.style.width = "60px";
    productNumber.style.height = "60px";
    productNumber.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    productNumber.style.borderRadius = "12px";
    productNumber.style.display = "flex";
    productNumber.style.alignItems = "center";
    productNumber.style.justifyContent = "center";
    productNumber.style.color = "white";
    productNumber.style.fontSize = "24px";
    productNumber.style.fontWeight = "bold";
    productNumber.style.flexShrink = "0";
    productNumber.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.35)";
    productNumber.textContent = index + 1;
    productHeader.appendChild(productNumber);

    // Product details
    const headerContent = document.createElement("div");
    headerContent.style.flex = "1";

    const productNameEl = document.createElement("h2");
    productNameEl.textContent = product?.name || "Product";
    productNameEl.style.color = "#1f2937";
    productNameEl.style.margin = "0 0 4px 0";
    productNameEl.style.fontSize = "18px";
    productNameEl.style.fontWeight = "700";
    productNameEl.style.letterSpacing = "-0.5px";
    headerContent.appendChild(productNameEl);

    const productSku = document.createElement("p");
    productSku.textContent = `SKU: ${product?.sku || "N/A"} • Category: ${product?.category || "General"}`;
    productSku.style.color = "#6b7280";
    productSku.style.margin = "0";
    productSku.style.fontSize = "13px";
    productSku.style.fontWeight = "500";
    headerContent.appendChild(productSku);

    productHeader.appendChild(headerContent);

    // Edit badge
    if (hasEdits) {
      const editBadge = document.createElement("div");
      editBadge.style.backgroundColor = "#fef3c7";
      editBadge.style.color = "#d97706";
      editBadge.style.padding = "8px 14px";
      editBadge.style.borderRadius = "8px";
      editBadge.style.border = "1px solid #fcd34d";
      editBadge.style.fontSize = "12px";
      editBadge.style.fontWeight = "600";
      editBadge.style.whiteSpace = "nowrap";
      editBadge.textContent = `✏️ ${productEdits.length} Customization${productEdits.length !== 1 ? "s" : ""}`;
      productHeader.appendChild(editBadge);
    }

    productDiv.appendChild(productHeader);

    // Description
    if (product?.description) {
      const descEl = document.createElement("p");
      descEl.textContent = product.description;
      descEl.style.color = "#4b5563";
      descEl.style.margin = "0 0 12px 0";
      descEl.style.fontSize = "12px";
      descEl.style.lineHeight = "1.5";
      productDiv.appendChild(descEl);
    }

    // Product details in a grid
    const detailsGrid = document.createElement("div");
    detailsGrid.style.display = "grid";
    detailsGrid.style.gridTemplateColumns = "1fr 1fr";
    detailsGrid.style.gap = "20px";
    detailsGrid.style.marginBottom = "25px";
    detailsGrid.style.padding = "20px";
    detailsGrid.style.backgroundColor = "#f9fafb";
    detailsGrid.style.borderRadius = "12px";

    const detailItems = [
      { label: "Price", value: product?.price ? `$${product.price}` : "N/A" },
      { label: "Stock", value: product?.stock !== undefined ? product.stock : "N/A" },
      { label: "Rating", value: product?.rating ? `⭐ ${product.rating}/5` : "N/A" },
      { label: "Status", value: product?.status || "Available" },
    ];

    detailItems.forEach((item) => {
      const detailItem = document.createElement("div");
      const label = document.createElement("div");
      label.textContent = item.label;
      label.style.fontSize = "11px";
      label.style.color = "#9ca3af";
      label.style.fontWeight = "600";
      label.style.textTransform = "uppercase";
      label.style.letterSpacing = "0.5px";
      label.style.marginBottom = "5px";
      detailItem.appendChild(label);

      const value = document.createElement("div");
      value.textContent = item.value;
      value.style.fontSize = "15px";
      value.style.color = "#1f2937";
      value.style.fontWeight = "600";
      detailItem.appendChild(value);

      detailsGrid.appendChild(detailItem);
    });

    productDiv.appendChild(detailsGrid);

    // Product image
    if (product?.image) {
      const imageContainer = document.createElement("div");
      imageContainer.style.marginBottom = "12px";
      imageContainer.style.borderRadius = "10px";
      imageContainer.style.overflow = "hidden";
      imageContainer.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
      imageContainer.style.backgroundColor = "#f3f4f6";
      imageContainer.style.display = "flex";
      imageContainer.style.alignItems = "center";
      imageContainer.style.justifyContent = "center";
      imageContainer.style.minHeight = "200px";

      const img = document.createElement("img");
      img.src = product.image;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "200px";
      img.style.objectFit = "contain";
      img.style.padding = "10px";
      imageContainer.appendChild(img);
      productDiv.appendChild(imageContainer);
    }

    // Customizations section
    if (hasEdits) {
      const customizationsSection = document.createElement("div");
      customizationsSection.style.marginTop = "25px";
      customizationsSection.style.paddingTop = "25px";
      customizationsSection.style.borderTop = "2px solid #f3f4f6";

      const customTitle = document.createElement("h3");
      customTitle.textContent = "✏️ Customizations Applied";
      customTitle.style.color = "#1f2937";
      customTitle.style.margin = "0 0 15px 0";
      customTitle.style.fontSize = "16px";
      customTitle.style.fontWeight = "700";
      customizationsSection.appendChild(customTitle);

      const customList = document.createElement("ul");
      customList.style.margin = "0";
      customList.style.paddingLeft = "20px";
      customList.style.listStyle = "none";

      productEdits.forEach((edit) => {
        const li = document.createElement("li");
        li.style.padding = "10px 0";
        li.style.fontSize = "13px";
        li.style.color = "#4b5563";
        li.style.borderBottom = "1px solid #f3f4f6";
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "10px";

        const icon = document.createElement("span");
        icon.textContent = edit.type === "text" ? "📝" : edit.type === "image" ? "🖼️" : "✨";
        icon.style.fontSize = "14px";
        li.appendChild(icon);

        const content = document.createElement("span");
        if (edit.type === "text") {
          content.textContent = `Text: "${edit.text}" (${edit.fontSize}px, ${edit.color})`;
        } else if (edit.type === "image") {
          content.textContent = `Image added (${edit.width}x${edit.height}px)`;
        } else {
          content.textContent = `${edit.type}: ${edit.text || "Updated"}`;
        }
        li.appendChild(content);

        customList.appendChild(li);
      });

      customizationsSection.appendChild(customList);
      productDiv.appendChild(customizationsSection);
    }

    container.appendChild(productDiv);
  }

  // ===== IMPORTANT INFORMATION SECTION =====
  const infoSection = document.createElement("div");
  infoSection.style.margin = "30px 40px";
  infoSection.style.padding = "20px";
  infoSection.style.backgroundColor = "#ecfdf5";
  infoSection.style.border = "3px solid #10b981";
  infoSection.style.borderRadius = "10px";
  infoSection.style.pageBreakInside = "avoid";
  infoSection.style.pageBreakAfter = "always";

  const infoTitle = document.createElement("h3");
  infoTitle.textContent = "🔧 Important Information";
  infoTitle.style.color = "#065f46";
  infoTitle.style.margin = "0 0 10px 0";
  infoTitle.style.fontSize = "15px";
  infoTitle.style.fontWeight = "700";
  infoSection.appendChild(infoTitle);

  const infoContent = document.createElement("p");
  infoContent.textContent =
    "This product is designed for professional electrical installations. Please ensure proper certification and safety standards are followed during installation. Contact our technical support team for detailed installation guides and specifications.";
  infoContent.style.color = "#047857";
  infoContent.style.margin = "0";
  infoContent.style.fontSize = "12px";
  infoContent.style.lineHeight = "1.6";
  infoSection.appendChild(infoContent);

  container.appendChild(infoSection);

  // ===== BEAUTIFUL FOOTER SECTION WITH CONTACT =====
  const footer = document.createElement("div");
  footer.style.padding = "40px 40px";
  footer.style.backgroundColor = "#1f2937";
  footer.style.color = "white";
  footer.style.pageBreakInside = "avoid";

  // Footer Header
  const footerHeader = document.createElement("div");
  footerHeader.style.textAlign = "center";
  footerHeader.style.marginBottom = "25px";

  const footerTitle = document.createElement("h2");
  footerTitle.textContent = "📞 Contact Information";
  footerTitle.style.margin = "0 0 8px 0";
  footerTitle.style.fontSize = "20px";
  footerTitle.style.fontWeight = "900";
  footerTitle.style.letterSpacing = "1px";
  footerTitle.style.color = "#ffffff";
  footerHeader.appendChild(footerTitle);

  const footerSubtitle = document.createElement("p");
  footerSubtitle.textContent = "Get in Touch With WIREEO Professional Solutions";
  footerSubtitle.style.color = "rgba(255,255,255,0.7)";
  footerSubtitle.style.margin = "0";
  footerSubtitle.style.fontSize = "12px";
  footerSubtitle.style.letterSpacing = "0.5px";
  footerHeader.appendChild(footerSubtitle);

  footer.appendChild(footerHeader);

  // Contact Cards Grid
  const contactGrid = document.createElement("div");
  contactGrid.style.display = "grid";
  contactGrid.style.gridTemplateColumns = "1fr 1fr 1fr";
  contactGrid.style.gap = "20px";
  contactGrid.style.marginBottom = "25px";

  const contactCards = [
    {
      icon: "📱",
      title: "PHONE",
      value: "+1 (555) 123-4567",
    },
    {
      icon: "📧",
      title: "EMAIL",
      value: "info@wireeo.com",
    },
    {
      icon: "🌐",
      title: "WEBSITE",
      value: "www.wireeo.com",
    },
  ];

  contactCards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.style.padding = "18px";
    cardDiv.style.backgroundColor = "#374151";
    cardDiv.style.borderRadius = "10px";
    cardDiv.style.textAlign = "center";
    cardDiv.style.border = "1px solid #4b5563";
    cardDiv.style.transition = "all 0.3s ease";

    const iconEl = document.createElement("div");
    iconEl.textContent = card.icon;
    iconEl.style.fontSize = "28px";
    iconEl.style.marginBottom = "8px";
    cardDiv.appendChild(iconEl);

    const titleEl = document.createElement("h4");
    titleEl.textContent = card.title;
    titleEl.style.margin = "0 0 6px 0";
    titleEl.style.fontSize = "11px";
    titleEl.style.fontWeight = "700";
    titleEl.style.letterSpacing = "1px";
    titleEl.style.textTransform = "uppercase";
    titleEl.style.color = "rgba(255,255,255,0.8)";
    cardDiv.appendChild(titleEl);

    const valueEl = document.createElement("p");
    valueEl.textContent = card.value;
    valueEl.style.margin = "0";
    valueEl.style.fontSize = "12px";
    valueEl.style.fontWeight = "600";
    valueEl.style.color = "#ffffff";
    cardDiv.appendChild(valueEl);

    contactGrid.appendChild(cardDiv);
  });

  footer.appendChild(contactGrid);

  // Divider
  const footerDivider = document.createElement("div");
  footerDivider.style.margin = "20px 0";
  footerDivider.style.height = "1px";
  footerDivider.style.background = "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)";
  footer.appendChild(footerDivider);

  // Footer Info
  const footerInfo = document.createElement("div");
  footerInfo.style.textAlign = "center";


  const footerCompanyInfo = document.createElement("p");
  footerCompanyInfo.textContent = "WIREEO - Professional Electrical Configuration Systems";
  footerCompanyInfo.style.margin = "0 0 8px 0";
  footerCompanyInfo.style.fontSize = "12px";
  footerCompanyInfo.style.fontWeight = "600";
  footerCompanyInfo.style.color = "#ffffff";
  footerInfo.appendChild(footerCompanyInfo);

  const disclaimer = document.createElement("p");
  disclaimer.textContent =
    "© 2026 WIREEO. All rights reserved. This is a confidential document. All specifications and customizations are subject to terms and conditions. For technical support, contact: support@wireeo.com";
  disclaimer.style.margin = "0";
  disclaimer.style.fontSize = "10px";
  disclaimer.style.color = "rgba(255,255,255,0.6)";
  disclaimer.style.lineHeight = "1.5";
  footerInfo.appendChild(disclaimer);

  footer.appendChild(footerInfo);

  container.appendChild(footer);

  // ===== GENERATE PDF =====
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    const fileName = `${filenamePrefix}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

    document.body.removeChild(container);
  } catch (error) {
    console.error("PDF generation error:", error);
    document.body.removeChild(container);
    throw error;
  }
};
