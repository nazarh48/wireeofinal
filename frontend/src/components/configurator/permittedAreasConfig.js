// Simple, declarative configuration of permitted drawing areas for products
// inside the Graphic Configurator canvas.
//
// Coordinates are in editor space (800 x 600), see KonvaCanvasEditor CANVAS_WIDTH/HEIGHT.
// Each entry maps a product id (string) to an array of rectangles:
//   { x, y, width, height }
//
// For now we provide a sensible default centre area; you can override for
// specific products by adding their ids here.

export const DEFAULT_PERMITTED_AREAS = [
  {
    // Centre rectangle, leaving a margin all around (blocked border)
    x: 80,
    y: 40,
    width: 640,
    height: 520,
  },
];

// Example for product‑specific configuration:
// export const PRODUCT_PERMITTED_AREAS = {
//   'your-product-id-here': [
//     { x: 60, y: 40, width: 320, height: 520 },
//     { x: 420, y: 40, width: 320, height: 520 },
//   ],
// };

export const PRODUCT_PERMITTED_AREAS = {};

export function getPermittedAreasForProduct(productId) {
  if (!productId) return DEFAULT_PERMITTED_AREAS;
  return PRODUCT_PERMITTED_AREAS[productId] || DEFAULT_PERMITTED_AREAS;
}

