export type ScrollBounds = { minX: number; minY: number; maxX: number; maxY: number };
export const initialBounds: ScrollBounds = { minX: 0, minY: 0, maxX: 200 * 10001, maxY: 200 * 702 };
export function expandBounds(bounds: ScrollBounds, x: number, y: number, width: number, height: number): ScrollBounds {
  const step = 5000, margin = 500;
  return {
    minX: Math.min(bounds.minX, Math.floor((x - margin) / step) * step),
    minY: Math.min(bounds.minY, Math.floor((y - margin) / step) * step),
    maxX: Math.max(bounds.maxX, Math.ceil((x + width + margin) / step) * step),
    maxY: Math.max(bounds.maxY, Math.ceil((y + height + margin) / step) * step),
  };
}
export function rowLabel(index: number): string {
  const negative = index < 0;
  let n = negative ? -index : index + 1, label = '';
  while (n > 0) { n--; label = String.fromCharCode(65 + n % 26) + label; n = Math.floor(n / 26); }
  return (negative ? '−' : '') + label;
}
export function rulerCells(offset: number, zoom: number, size: number, letters = false) {
  const step = 200, first = Math.floor(-offset / (step * zoom));
  return Array.from({ length: Math.ceil(size / (step * zoom)) + 2 }, (_, i) => {
    const index = first + i;
    return { index, position: index * step * zoom + offset, size: step * zoom, label: letters ? rowLabel(index) : String(index) };
  }).filter(cell => cell.index >= 0 && cell.index <= (letters ? 701 : 10000));
}

export function zoomAtOrigin(viewport: {x:number;y:number;zoom:number}, zoom: number) {
  return {x:viewport.x,y:viewport.y,zoom:Math.max(.25,Math.min(2.5,zoom))};
}
