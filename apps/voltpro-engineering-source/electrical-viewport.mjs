export const RULER_COLUMNS = 10001, RULER_ROWS = 702;
export const clampZoom = value => Math.max(.25, Math.min(2.5, value));
export function drawingPoint(clientX, clientY, rect, zoom, cell = 24) {
  return { x: Math.max(1, Math.round((clientX - rect.left) / (cell * zoom)) + 1), y: Math.max(0, Math.round((clientY - rect.top) / (cell * zoom))) };
}
export function visibleTicks(scroll, zoom, size, limit, cell = 24) {
  const spacing = cell * zoom, stride = Math.max(1, Math.ceil(24 / spacing));
  const first = Math.max(0, Math.floor(scroll / spacing / stride) * stride);
  const last = Math.min(limit - 1, Math.ceil((scroll + size) / spacing));
  const ticks = [];
  for (let i = first; i <= last; i += stride) ticks.push({ index: i, position: i * spacing - scroll, size: spacing * stride });
  if (last === limit - 1 && ticks.at(-1)?.index !== last) ticks.push({ index: last, position: last * spacing - scroll, size: spacing });
  return ticks;
}
export function zoomScroll(left, top, oldZoom, nextZoom, anchorX = 0, anchorY = 0) {
  return { left: Math.max(0, (left + anchorX) * nextZoom / oldZoom - anchorX), top: Math.max(0, (top + anchorY) * nextZoom / oldZoom - anchorY) };
}
export function drawingExtent(document, cell = 24) {
  const xs = [RULER_COLUMNS,...(document.walls||[]).flatMap(w=>[w.a.x+12,w.b.x+12]), ...document.nodes.map(n => n.x + 12), ...document.rooms.map(r => r.x + r.width + 12)];
  const ys = [RULER_ROWS,...(document.walls||[]).flatMap(w=>[w.a.y+12,w.b.y+12]), ...document.nodes.map(n => n.y + 12), ...document.rooms.map(r => r.y + r.height + 12)];
  return { width: Math.max(...xs.filter(Number.isFinite)) * cell, height: Math.max(...ys.filter(Number.isFinite)) * cell };
}
