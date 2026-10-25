export const RULER_STEP = 100;
export const initialBounds = { minX: 0, minY: 0, maxX: RULER_STEP * 10001, maxY: RULER_STEP * 702 };
export function rowLabel(index: number): string {
  const negative = index < 0;
  let n = negative ? -index : index + 1, label = '';
  while (n > 0) { n--; label = String.fromCharCode(65 + n % 26) + label; n = Math.floor(n / 26); }
  return (negative ? '−' : '') + label;
}
export function rulerCells(offset: number, zoom: number, size: number, letters = false) {
  const step = RULER_STEP, first = Math.max(0,Math.floor(-offset / (step * zoom)));
  return Array.from({ length: Math.ceil(size / (step * zoom)) + 2 }, (_, i) => {
    const index = first + i;
    return { index, position: index * step * zoom + offset, size: step * zoom, label: letters ? rowLabel(index) : String(index) };
  }).filter(cell => cell.index >= 0 && cell.index <= (letters ? 701 : 10000));
}

export function boundsForNodes(nodes: {position:{x:number;y:number}}[]) {
  const minX=Math.min(0,...nodes.map(node=>node.position.x<0?Math.floor((node.position.x-60)/RULER_STEP)*RULER_STEP:0));
  const minY=Math.min(0,...nodes.map(node=>node.position.y<0?Math.floor((node.position.y-40)/RULER_STEP)*RULER_STEP:0));
  return {minX,minY,maxX:minX+initialBounds.maxX,maxY:minY+initialBounds.maxY};
}
export function zoomAtOrigin(viewport:{x:number;y:number;zoom:number},zoom:number,origin={minX:0,minY:0}) {
  const nextZoom=Math.max(.25,Math.min(2.5,zoom));
  return {x:viewport.x+origin.minX*(viewport.zoom-nextZoom),y:viewport.y+origin.minY*(viewport.zoom-nextZoom),zoom:nextZoom};
}

export function worksheetCamera(viewport:{x:number;y:number;zoom:number},width:number,height:number,bounds=initialBounds){const zoom=Math.max(.25,Math.min(2.5,viewport.zoom));return {x:Math.min(-bounds.minX*zoom,Math.max(width-bounds.maxX*zoom,viewport.x))||0,y:Math.min(-bounds.minY*zoom,Math.max(height-bounds.maxY*zoom,viewport.y))||0,zoom};}
