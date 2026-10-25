import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import { expandBounds, initialBounds, rulerCells, zoomAtOrigin } from './canvas-geometry';

/** Native two-axis scrolling and React Flow share one camera in world coordinates. */
export function CanvasViewport({ children }: { children: ReactNode }) {
  const scroll = useRef<HTMLDivElement>(null), viewport = useViewport(), { getViewport, setViewport } = useReactFlow();
  const [bounds, setBounds] = useState(initialBounds);
  const [size, setSize] = useState({ width: 1, height: 1 });
  useEffect(() => {
    const element=scroll.current!;
    let pinchDistance=0, pinchZoom=1;
    const wheel=(event:WheelEvent)=>{if(!event.ctrlKey)return;event.preventDefault();event.stopImmediatePropagation();const camera=getViewport();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?element.clientHeight:1);void setViewport(zoomAtOrigin(camera,camera.zoom*Math.exp(-delta*.002)));};
    const distance=(event:TouchEvent)=>Math.hypot(event.touches[0].clientX-event.touches[1].clientX,event.touches[0].clientY-event.touches[1].clientY);
    const start=(event:TouchEvent)=>{if(event.touches.length!==2)return;pinchDistance=distance(event);pinchZoom=getViewport().zoom;event.preventDefault();event.stopImmediatePropagation();};
    const move=(event:TouchEvent)=>{if(event.touches.length!==2||!pinchDistance)return;event.preventDefault();event.stopImmediatePropagation();void setViewport(zoomAtOrigin(getViewport(),pinchZoom*distance(event)/pinchDistance));};
    const end=()=>{pinchDistance=0;};
    element.addEventListener('wheel',wheel,{capture:true,passive:false});element.addEventListener('touchstart',start,{capture:true,passive:false});element.addEventListener('touchmove',move,{capture:true,passive:false});element.addEventListener('touchend',end);element.addEventListener('touchcancel',end);
    return()=>{element.removeEventListener('wheel',wheel,true);element.removeEventListener('touchstart',start,true);element.removeEventListener('touchmove',move,true);element.removeEventListener('touchend',end);element.removeEventListener('touchcancel',end);};
  },[getViewport,setViewport]);
  const synced = useRef({ x: -1, y: -1 });
  useLayoutEffect(() => {
    const element = scroll.current!;
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    measure(); const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const element = scroll.current!;
    const x = -viewport.x / viewport.zoom, y = -viewport.y / viewport.zoom;
    const next = expandBounds(bounds, x, y, size.width / viewport.zoom, size.height / viewport.zoom);
    if (Object.keys(bounds).some(key => bounds[key as keyof typeof bounds] !== next[key as keyof typeof next])) { setBounds(next); return; }
    synced.current = { x: (x - bounds.minX) * viewport.zoom, y: (y - bounds.minY) * viewport.zoom };
    element.scrollLeft = synced.current.x; element.scrollTop = synced.current.y;
    // Native scroll offsets may be rounded to physical pixels.
    synced.current = { x: element.scrollLeft, y: element.scrollTop };
  }, [bounds, viewport.x, viewport.y, viewport.zoom, size.width, size.height]);
  return <div className="plc-scroll-viewport" ref={scroll} tabIndex={0} role="region" aria-label="Scrollable PLC workspace" onScroll={event => {
    const element = event.currentTarget;
    if (Math.abs(element.scrollLeft - synced.current.x) < 1 && Math.abs(element.scrollTop - synced.current.y) < 1) return;
    synced.current = { x: element.scrollLeft, y: element.scrollTop };
    void setViewport({ x: -element.scrollLeft - bounds.minX * viewport.zoom, y: -element.scrollTop - bounds.minY * viewport.zoom, zoom: viewport.zoom });
  }}><div className="plc-scroll-plane" style={{ width: (bounds.maxX - bounds.minX) * viewport.zoom, height: (bounds.maxY - bounds.minY) * viewport.zoom }}><div className="plc-flow-viewport" style={{ width: size.width, height: size.height }}>{children}</div></div></div>;
}

export function CanvasRulers() {
  const ref = useRef<HTMLDivElement>(null), viewport = useViewport();
  const [size, setSize] = useState({ width: 1, height: 1 });
  useLayoutEffect(() => {
    const element = ref.current!.parentElement!;
    const measure = () => setSize({ width: Math.max(0, element.clientWidth - 58), height: Math.max(0, element.clientHeight - 62) });
    measure(); const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const columns = rulerCells(viewport.x, viewport.zoom, size.width), rows = rulerCells(viewport.y, viewport.zoom, size.height, true);
  return <div className="plc-dynamic-rulers" ref={ref}>
    {(['top', 'bottom'] as const).map(edge => <div key={edge} className={'plc-ruler plc-ruler-' + edge} aria-label={edge === 'top' ? 'PLC drawing columns' : undefined} aria-hidden={edge === 'bottom'}>{columns.map(cell => <span key={cell.index} style={{ left: cell.position, width: cell.size }}>{cell.label}</span>)}</div>)}
    {(['left', 'right'] as const).map(edge => <div key={edge} className={'plc-ruler plc-ruler-' + edge} aria-label={edge === 'left' ? 'PLC drawing rows' : undefined} aria-hidden={edge === 'right'}>{rows.map(cell => <span key={cell.index} style={{ top: cell.position, height: cell.size }}>{cell.label}</span>)}</div>)}
  </div>;
}
