export const GRID_MM = 200;
export const GRID_PX = 24;
export const PLAN_COLUMNS = 80;
export const PLAN_ROWS = 42;

export function snapGrid(pixel, cellSize = GRID_PX) {
  if (!Number.isFinite(pixel) || !Number.isFinite(cellSize) || cellSize <= 0) throw new TypeError("Grid coordinates and cell size must be finite; cell size must be positive.");
  return Math.round(pixel / cellSize);
}

export function columnLabel(index) {
  if (!Number.isInteger(index) || index < 1) throw new RangeError("Column index starts at 1.");
  let value = index, label = "";
  while (value > 0) {
    value--;
    label = String.fromCharCode(65 + value % 26) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

export function routeOrthogonal(start, end) {
  for (const point of [start, end]) {
    if (!Number.isInteger(point?.x) || !Number.isInteger(point?.y)) throw new TypeError("Wire endpoints must use integer grid coordinates.");
  }
  if (start.x === end.x || start.y === end.y) return [start, end];
  const midX = Math.round((start.x + end.x) / 2);
  return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
}
