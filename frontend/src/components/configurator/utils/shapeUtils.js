/**
 * Shape utilities for drawing arrows and other complex shapes
 */

/**
 * Create arrow shape points
 */
export const createArrowPoints = (x1, y1, x2, y2, arrowLength = 20, arrowWidth = 10) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  // Calculate arrow head points
  const arrowHeadX = x2 - arrowLength * Math.cos(angle);
  const arrowHeadY = y2 - arrowLength * Math.sin(angle);
  
  const arrowPoint1X = arrowHeadX + arrowWidth * Math.cos(angle + Math.PI / 2);
  const arrowPoint1Y = arrowHeadY + arrowWidth * Math.sin(angle + Math.PI / 2);
  
  const arrowPoint2X = arrowHeadX + arrowWidth * Math.cos(angle - Math.PI / 2);
  const arrowPoint2Y = arrowHeadY + arrowWidth * Math.sin(angle - Math.PI / 2);
  
  return [x1, y1, arrowHeadX, arrowHeadY, x2, y2, arrowPoint1X, arrowPoint1Y, arrowPoint2X, arrowPoint2Y];
};

/**
 * Create star shape points
 */
export const createStarPoints = (x, y, outerRadius, innerRadius, points = 5) => {
  const result = [];
  const angleStep = (Math.PI * 2) / (points * 2);
  
  for (let i = 0; i < points * 2; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    result.push(x + radius * Math.cos(angle));
    result.push(y + radius * Math.sin(angle));
  }
  
  return result;
};

/**
 * Create polygon points
 */
export const createPolygonPoints = (x, y, radius, sides = 6) => {
  const result = [];
  const angleStep = (Math.PI * 2) / sides;
  
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2;
    result.push(x + radius * Math.cos(angle));
    result.push(y + radius * Math.sin(angle));
  }
  
  return result;
};
