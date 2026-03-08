const SVG_GRAPHIC_SELECTORS = [
  'path',
  'circle',
  'ellipse',
  'rect',
  'polygon',
  'polyline',
  'line',
];

export function isSvgAssetUrl(src) {
  const value = String(src || '').trim().toLowerCase();
  return value.includes('image/svg+xml') || /\.svg([?#]|$)/.test(value);
}

export function colorizeSvgMarkup(svgMarkup, fillColor = '#111827', strokeColor = fillColor) {
  if (!svgMarkup || typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return svgMarkup || '';
  }

  try {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
    const root = doc.documentElement;

    if (!root || root.nodeName === 'parsererror') return svgMarkup;

    const rootFill = root.getAttribute('fill');
    const rootStroke = root.getAttribute('stroke');
    const rootHasVisibleFill = rootFill && rootFill !== 'none' && rootFill !== 'transparent';
    const rootHasVisibleStroke = rootStroke && rootStroke !== 'none' && rootStroke !== 'transparent';

    if (rootHasVisibleFill) root.setAttribute('fill', fillColor);
    if (rootHasVisibleStroke) root.setAttribute('stroke', strokeColor);

    SVG_GRAPHIC_SELECTORS.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((node) => {
        const fill = node.getAttribute('fill');
        const stroke = node.getAttribute('stroke');
        const hasVisibleFill = fill && fill !== 'none' && fill !== 'transparent';
        const hasVisibleStroke = stroke && stroke !== 'none' && stroke !== 'transparent';

        if (hasVisibleFill) node.setAttribute('fill', fillColor);
        if (hasVisibleStroke) node.setAttribute('stroke', strokeColor);

        if (!hasVisibleFill && !hasVisibleStroke && !rootHasVisibleFill && !rootHasVisibleStroke) {
          node.setAttribute('fill', fillColor);
        }
      });
    });

    return new window.XMLSerializer().serializeToString(root);
  } catch {
    return svgMarkup;
  }
}

export function buildColoredSvgDataUrl(svgMarkup, fillColor = '#111827', strokeColor = fillColor) {
  const coloredMarkup = colorizeSvgMarkup(svgMarkup, fillColor, strokeColor);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(coloredMarkup)}`;
}
