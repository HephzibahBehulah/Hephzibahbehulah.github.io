(()=>{'use strict';
function route(a,b,opts={}){const grid=Number(opts.grid||10),sx=Math.round(a.x/grid)*grid,sy=Math.round(a.y/grid)*grid,tx=Math.round(b.x/grid)*grid,ty=Math.round(b.y/grid)*grid;const mid=opts.prefer==='vertical'?{x:sx,y:ty}:{x:tx,y:sy};const pts=[{x:sx,y:sy},mid,{x:tx,y:ty}];const segments=[];for(let i=1;i<pts.length;i++){if(pts[i-1].x===pts[i].x&&pts[i-1].y===pts[i].y)continue;segments.push({x1:pts[i-1].x,y1:pts[i-1].y,x2:pts[i].x,y2:pts[i].y,orientation:pts[i-1].x===pts[i].x?'v':'h'})}return segments}
function reroute(wire,positions,opts={}){const a=positions[wire.from],b=positions[wire.to];if(!a||!b)throw Error('Missing endpoint geometry');return {...wire,segments:route(a,b,opts)}}
window.VoltProWireRouter={route,reroute};
})();