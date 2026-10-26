// Geometry uses the document grid as model coordinates; thickness/opening dimensions are millimetres.
const EPS=1e-7;
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const pointKey=(p)=>`${Math.round(p.x*1e6)/1e6},${Math.round(p.y*1e6)/1e6}`;
export function wallLength(wall,grid=200){return distance(wall.a,wall.b)*grid;}
export function isHorizontal(wall){return Math.abs(wall.a.y-wall.b.y)<EPS;}
export function projectToWall(point,wall,grid=200){
 const dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y,den=dx*dx+dy*dy;
 const t=den?Math.max(0,Math.min(1,((point.x-wall.a.x)*dx+(point.y-wall.a.y)*dy)/den)):0;
 const p={x:wall.a.x+t*dx,y:wall.a.y+t*dy};return {...p,t,offsetMM:t*Math.sqrt(den)*grid,distanceMM:distance(point,p)*grid};
}
export function nearestWall(doc,point,floor,maxDistanceMM=Infinity){
 let found=null;for(const wall of doc.walls||[]){if(wall.floor!==floor)continue;const hit=projectToWall(point,wall,doc.gridMillimetres);if(hit.distanceMM<=maxDistanceMM&&(!found||hit.distanceMM<found.distanceMM))found={...hit,wall};}return found;
}
export function wallsFromRooms(rooms,{grid=200,thicknessMM=200,prefix='WALL'}={}){
 const lines=[];for(const room of rooms){const {x,y,width:w,height:h}=room,roomId=room.id;for(const [a,b]of [[{x,y},{x:x+w,y}],[{x:x+w,y},{x:x+w,y:y+h}],[{x:x+w,y:y+h},{x,y:y+h}],[{x,y:y+h},{x,y}]])lines.push({a:{x:Math.round(a.x*1e7)/1e7,y:Math.round(a.y*1e7)/1e7},b:{x:Math.round(b.x*1e7)/1e7,y:Math.round(b.y*1e7)/1e7},floor:room.floor||1,roomId});}
 const walls=[];
 for(const floor of [...new Set(lines.map(l=>l.floor))])for(const horizontal of [true,false]){
  const relevant=lines.filter(l=>l.floor===floor&&isHorizontal(l)===horizontal),coords=[...new Set(relevant.map(l=>horizontal?l.a.y:l.a.x))];
  for(const c of coords){const group=relevant.filter(l=>Math.abs((horizontal?l.a.y:l.a.x)-c)<EPS),axis=p=>horizontal?p.x:p.y;
   const stops=[...new Set(group.flatMap(l=>[axis(l.a),axis(l.b)]))].sort((a,b)=>a-b);
   for(let i=1;i<stops.length;i++){const lo=stops[i-1],hi=stops[i],mid=(lo+hi)/2,owners=group.filter(l=>mid>=Math.min(axis(l.a),axis(l.b))-EPS&&mid<=Math.max(axis(l.a),axis(l.b))+EPS).map(l=>l.roomId);
    if(!owners.length||hi-lo<EPS)continue;walls.push({id:`${prefix}-${walls.length+1}`,floor,a:horizontal?{x:lo,y:c}:{x:c,y:lo},b:horizontal?{x:hi,y:c}:{x:c,y:hi},thicknessMM,heightMM:2800,classification:'unverified',roomIds:[...new Set(owners)]});
   }
  }
 }
 return walls;
}
export function architectureErrors(doc){
 const errors=[],ids=new Set(),grid=doc.gridMillimetres,validFloor=f=>Number.isInteger(f)&&f>=1&&f<=doc.metadata.floors;
 for(const key of ['spaces','floorOutlines'])for(const item of doc[key]||[])if(!item.id||!validFloor(item.floor)||![item.x,item.y,item.width,item.height].every(Number.isFinite)||item.x<1||item.y<0||item.width<=0||item.height<=0)errors.push(key+': invalid rectangular geometry/floor.');
 for(const r of doc.risers||[]){if(!r.id||ids.has(r.id)||![r.x,r.y].every(Number.isFinite)||r.x<1||r.y<0||!validFloor(r.fromFloor)||!validFloor(r.toFloor)||r.fromFloor>=r.toFloor||(r.verticalRiseM!=null&&(!Number.isFinite(r.verticalRiseM)||r.verticalRiseM<=0)))errors.push('Invalid riser geometry/floors.');ids.add(r.id);}
 for(const wall of doc.walls||[]){
  if(!wall.id||ids.has(wall.id))errors.push('Wall identity is missing or duplicated.');ids.add(wall.id);
  if(!wall.a||!wall.b||![wall.a.x,wall.a.y,wall.b.x,wall.b.y].every(Number.isFinite)||wall.a.x<1||wall.b.x<1||wall.a.y<0||wall.b.y<0||wallLength(wall,grid)<50||(!isHorizontal(wall)&&Math.abs(wall.a.x-wall.b.x)>EPS))errors.push(`${wall.id}: wall must be a non-zero horizontal or vertical segment.`);
  if(!Number.isInteger(wall.floor)||wall.floor<1||wall.floor>doc.metadata.floors)errors.push(`${wall.id}: invalid floor.`);
  if(!Number.isFinite(wall.thicknessMM)||wall.thicknessMM<50||wall.thicknessMM>1000||!Number.isFinite(wall.heightMM)||wall.heightMM<1000)errors.push(`${wall.id}: invalid wall thickness/height.`);
 }
 for(let i=0;i<(doc.walls||[]).length;i++)for(let j=i+1;j<doc.walls.length;j++){const a=doc.walls[i],b=doc.walls[j];if(a.floor!==b.floor||!a.a||!a.b||!b.a||!b.b||isHorizontal(a)!==isHorizontal(b))continue;const h=isHorizontal(a),same=Math.abs((h?a.a.y:a.a.x)-(h?b.a.y:b.a.x))<EPS;if(same){const p=h?'x':'y';if(Math.min(Math.max(a.a[p],a.b[p]),Math.max(b.a[p],b.b[p]))-Math.max(Math.min(a.a[p],a.b[p]),Math.min(b.a[p],b.b[p]))>EPS)errors.push(`${a.id}: overlaps wall ${b.id}; merge or trim the geometry.`);}}
 for(const opening of doc.openings||[]){
  if(!opening.id||ids.has(opening.id))errors.push('Opening identity is missing or duplicated.');ids.add(opening.id);
  const wall=(doc.walls||[]).find(w=>w.id===opening.wallId);
  if(!wall){errors.push(`${opening.id}: host wall does not exist.`);continue;}
  if(!['door','window'].includes(opening.type)||![opening.offsetMM,opening.widthMM,opening.heightMM,opening.sillMM].every(Number.isFinite)||opening.offsetMM<0||opening.widthMM<200||opening.offsetMM+opening.widthMM>wallLength(wall,grid)+EPS||opening.heightMM<200||opening.sillMM<0||opening.heightMM+opening.sillMM>wall.heightMM+EPS)errors.push(`${opening.id}: opening does not fit the host wall.`);
  for(const other of doc.openings||[])if(other.id>opening.id&&other.wallId===opening.wallId&&Math.min(opening.offsetMM+opening.widthMM,other.offsetMM+other.widthMM)>Math.max(opening.offsetMM,other.offsetMM)+EPS)errors.push(`${opening.id}: overlaps opening ${other.id}.`);
 }
 for(const stair of doc.stairs||[])if(!validFloor(stair.floor)||![stair.x,stair.y,stair.length,stair.width].every(Number.isFinite)||stair.length<=0||stair.width<=0||!Number.isInteger(stair.steps)||stair.steps<3||stair.steps>40)errors.push(`${stair.id}: invalid staircase geometry.`);
 for(const dim of doc.dimensions||[]){if(!dim.id||ids.has(dim.id))errors.push('Dimension identity is missing or duplicated.');ids.add(dim.id);if(!validFloor(dim.floor)||!dim.a||!dim.b||![dim.a.x,dim.a.y,dim.b.x,dim.b.y,dim.offsetMM].every(Number.isFinite)||distance(dim.a,dim.b)<EPS)errors.push(`${dim.id}: invalid dimension geometry.`);}
 for(const node of doc.nodes||[])if(node.wallId){const wall=(doc.walls||[]).find(w=>w.id===node.wallId);if(!wall||wall.floor!==(node.floor||1)||!Number.isFinite(node.wallOffsetMM)||node.wallOffsetMM<0||node.wallOffsetMM>wallLength(wall,grid))errors.push(`${node.id}: wall mounting reference is invalid.`);else{const t=node.wallOffsetMM/wallLength(wall,grid),p={x:wall.a.x+t*(wall.b.x-wall.a.x),y:wall.a.y+t*(wall.b.y-wall.a.y)};if(distance(node,p)>EPS)errors.push(`${node.id}: equipment position disagrees with its wall mounting offset.`);}}
 return errors;
}
export function mountOnWall(doc,node,wall,offsetMM,side=1){
 const len=wallLength(wall,doc.gridMillimetres);if(offsetMM<0||offsetMM>len)throw Error('Mounting offset is outside the wall.');
 const t=offsetMM/len;node.wallId=wall.id;node.wallOffsetMM=offsetMM;node.wallSide=side<0?-1:1;node.floor=wall.floor;node.x=wall.a.x+(wall.b.x-wall.a.x)*t;node.y=wall.a.y+(wall.b.y-wall.a.y)*t;node.rotation=isHorizontal(wall)?0:90;
}
export function addOpening(doc,{id,wallId,type,offsetMM,widthMM=900,heightMM=2100,sillMM=0,hinge='start',swing=1}){
 const opening={id,wallId,type,offsetMM,widthMM,heightMM,sillMM,hinge,swing};doc.openings.push(opening);const errors=architectureErrors(doc);if(errors.length){doc.openings.pop();throw Error(errors.join(' '));}return opening;
}
export function editWall(doc,id,next){
 const backup=structuredClone({walls:doc.walls,rooms:doc.rooms,nodes:doc.nodes}),target=doc.walls.find(w=>w.id===id);if(!target)throw Error('Wall not found.');
 try{
  const floorWalls=doc.walls.filter(w=>w.floor===target.floor),vertices=new Map(),edges=[];
  for(const wall of floorWalls){const a=pointKey(wall.a),b=pointKey(wall.b);vertices.set(a,{...wall.a});vertices.set(b,{...wall.b});edges.push({a,b,h:isHorizontal(wall)});}
  const changes={x:new Map(),y:new Map()};
  for(const [old,p]of [[pointKey(target.a),next.a],[pointKey(target.b),next.b]])for(const axis of ['x','y']){const todo=[old],seen=new Set();while(todo.length){const key=todo.pop();if(seen.has(key))continue;seen.add(key);if(changes[axis].has(key)&&Math.abs(changes[axis].get(key)-p[axis])>EPS)throw Error('Conflicting junction geometry.');changes[axis].set(key,p[axis]);for(const edge of edges)if((axis==='x'&&!edge.h)||(axis==='y'&&edge.h)){if(edge.a===key)todo.push(edge.b);if(edge.b===key)todo.push(edge.a);}}}
  for(const wall of floorWalls)for(const end of ['a','b']){const key=pointKey(wall[end]);wall[end]={x:changes.x.get(key)??wall[end].x,y:changes.y.get(key)??wall[end].y};}
  Object.assign(target,{thicknessMM:next.thicknessMM??target.thicknessMM,heightMM:next.heightMM??target.heightMM});
  for(const node of doc.nodes)if(node.wallId){const wall=doc.walls.find(w=>w.id===node.wallId);if(wall)mountOnWall(doc,node,wall,node.wallOffsetMM,node.wallSide);}
  for(const room of doc.rooms){const owned=doc.walls.filter(w=>w.roomIds?.includes(room.id));if(owned.length){const points=owned.flatMap(w=>[w.a,w.b]);room.x=Math.min(...points.map(p=>p.x));room.y=Math.min(...points.map(p=>p.y));room.width=Math.max(...points.map(p=>p.x))-room.x;room.height=Math.max(...points.map(p=>p.y))-room.y;}}
  for(const node of doc.nodes)if(node.roomAnchor){const room=doc.rooms.find(r=>r.id===node.roomAnchor.roomId);if(room){node.x=room.x+room.width*node.roomAnchor.u;node.y=room.y+room.height*node.roomAnchor.v;}}
  const errors=architectureErrors(doc);if(errors.length)throw Error(errors.join(' '));
 }catch(error){Object.assign(doc,backup);throw error;}
}
function intersection(a,b){const ah=isHorizontal(a),bh=isHorizontal(b);if(ah===bh)return null;const h=ah?a:b,v=ah?b:a,p={x:v.a.x,y:h.a.y};return p.x>=Math.min(h.a.x,h.b.x)-EPS&&p.x<=Math.max(h.a.x,h.b.x)+EPS&&p.y>=Math.min(v.a.y,v.b.y)-EPS&&p.y<=Math.max(v.a.y,v.b.y)+EPS?p:null;}
export function routeOnWalls(doc,from,to,{heightMM=null}={}){
 if((from.floor||1)!==(to.floor||1))throw Error('Use a riser for a cross-floor route.');
 const walls=(doc.walls||[]).filter(w=>w.floor===(from.floor||1));if(!walls.length)throw Error('Draw connected walls before requesting a wall route.');
 const s=nearestWall(doc,from,from.floor||1),t=nearestWall(doc,to,to.floor||1),cuts=new Map(walls.map(w=>[w.id,[w.a,w.b]]));cuts.get(s.wall.id).push({x:s.x,y:s.y});cuts.get(t.wall.id).push({x:t.x,y:t.y});
 for(let i=0;i<walls.length;i++)for(let j=i+1;j<walls.length;j++){const p=intersection(walls[i],walls[j]);if(p){cuts.get(walls[i].id).push(p);cuts.get(walls[j].id).push(p);}for(const q of [walls[j].a,walls[j].b])if(projectToWall(q,walls[i],doc.gridMillimetres).distanceMM<EPS)cuts.get(walls[i].id).push(q);for(const q of [walls[i].a,walls[i].b])if(projectToWall(q,walls[j],doc.gridMillimetres).distanceMM<EPS)cuts.get(walls[j].id).push(q);}
 const graph=new Map(),positions=new Map();function connect(a,b,cost){const ak=pointKey(a),bk=pointKey(b);positions.set(ak,a);positions.set(bk,b);if(!graph.has(ak))graph.set(ak,[]);if(!graph.has(bk))graph.set(bk,[]);graph.get(ak).push([bk,cost]);graph.get(bk).push([ak,cost]);}
 for(const wall of walls){const horizontal=isHorizontal(wall),pts=[...new Map(cuts.get(wall.id).map(p=>[pointKey(p),p])).values()].sort((a,b)=>horizontal?a.x-b.x:a.y-b.y);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],oa=projectToWall(a,wall,doc.gridMillimetres).offsetMM,ob=projectToWall(b,wall,doc.gridMillimetres).offsetMM;
   const blocked=heightMM!==null&&(doc.openings||[]).some(o=>o.wallId===wall.id&&heightMM>=o.sillMM&&heightMM<=o.sillMM+o.heightMM&&Math.min(Math.max(oa,ob),o.offsetMM+o.widthMM)>Math.max(Math.min(oa,ob),o.offsetMM)+EPS);
   if(!blocked)connect(a,b,distance(a,b));
 }}
 const start=pointKey(s),end=pointKey(t),cost=new Map([[start,0]]),previous=new Map(),queue=new Set(graph.keys());
 while(queue.size){let current=null;for(const key of queue)if(cost.has(key)&&(current===null||cost.get(key)<cost.get(current)))current=key;if(current===null)break;queue.delete(current);if(current===end)break;for(const [next,length]of graph.get(current)||[]){const value=cost.get(current)+length;if(value<(cost.get(next)??Infinity)){cost.set(next,value);previous.set(next,current);}}}
 if(!cost.has(end))throw Error('No connected wall path at this routing height. Add a wall junction, adjust the height or draw a reviewed manual route.');
 const keys=[end];while(keys[0]!==start){const p=previous.get(keys[0]);if(!p)throw Error('Disconnected route.');keys.unshift(p);}
 const path=[{x:from.x,y:from.y},...keys.map(k=>positions.get(k)||{x:s.x,y:s.y}),{x:to.x,y:to.y}];
 return path.filter((p,i)=>i===0||distance(p,path[i-1])>EPS);
}
export function routeWireOnArchitecture(doc,wire){
 const from=doc.nodes.find(n=>n.id===wire.from),to=doc.nodes.find(n=>n.id===wire.to);if(!from||!to)throw Error('Route endpoints are missing.');
 if((from.floor||1)===(to.floor||1)){wire.routePoints=routeOnWalls(doc,from,to,{heightMM:wire.routingHeightMM??null});delete wire.segments;}
 else{const riser=(doc.risers||[]).find(r=>r.id===wire.riserId);if(!riser)throw Error('Select a riser before routing between floors.');const low={x:riser.x,y:riser.y,floor:from.floor||1},high={...low,floor:to.floor||1};wire.segments=[{floor:low.floor,points:routeOnWalls(doc,from,low,{heightMM:wire.routingHeightMM??null})},{floor:high.floor,points:routeOnWalls(doc,high,to,{heightMM:wire.routingHeightMM??null})}];delete wire.routePoints;}
 wire.routeMode='wall';return wire;
}
export function routeGeometryErrors(doc,wire){if(!wire.routePoints&&!wire.segments)return [];const from=doc.nodes.find(n=>n.id===wire.from),to=doc.nodes.find(n=>n.id===wire.to);if(!from||!to)return ['Route endpoint missing.'];const segments=wire.segments||[{floor:from.floor||1,points:wire.routePoints||[from,to]}],errors=[];for(const segment of segments){if(!Array.isArray(segment.points)||segment.points.length<2||segment.points.length>200){errors.push('Invalid route point count.');continue;}for(let i=1;i<segment.points.length;i++){const a=segment.points[i-1],b=segment.points[i];if(![a.x,a.y,b.x,b.y].every(Number.isFinite)||a.x<1||b.x<1||a.y<0||b.y<0||(Math.abs(a.x-b.x)>EPS&&Math.abs(a.y-b.y)>EPS))errors.push('Cable routes must have finite, non-negative orthogonal points.');}}
 for(const segment of segments)if(!Number.isInteger(segment.floor)||segment.floor<1||segment.floor>doc.metadata.floors)errors.push('Invalid route floor.');
 if(wire.segments){const riser=(doc.risers||[]).find(r=>r.id===wire.riserId);if(segments.length!==2||!riser||segments[0].floor!==(from.floor||1)||segments[1].floor!==(to.floor||1)||Math.min(from.floor||1,to.floor||1)<riser.fromFloor||Math.max(from.floor||1,to.floor||1)>riser.toFloor||distance(segments[0]?.points?.at(-1)||{},riser||{})>EPS||distance(segments[1]?.points?.[0]||{},riser||{})>EPS)errors.push('Cross-floor routes must join the declared riser on both floors.');}
 const a=segments[0]?.points?.[0],last=segments.at(-1)?.points?.at(-1);if(a&&last&&(distance(a,from)>EPS||distance(last,to)>EPS))errors.push('Cable route does not meet its equipment endpoints.');return errors;}

export function rebuildRoomWalls(doc){
 const old=doc.walls||[],free=old.filter(w=>!w.roomIds?.length),rooms=[...doc.rooms,...(doc.spaces||[]),...(doc.floorOutlines||[])];
 const made=wallsFromRooms(rooms),used=new Set(free.map(w=>w.id));let next=1;
 const same=(a,b)=>a.floor===b.floor&&((distance(a.a,b.a)<EPS&&distance(a.b,b.b)<EPS)||(distance(a.a,b.b)<EPS&&distance(a.b,b.a)<EPS));
 for(const wall of made){const previous=old.find(w=>same(w,wall));if(previous&&!used.has(previous.id)){Object.assign(wall,{id:previous.id,thicknessMM:previous.thicknessMM,heightMM:previous.heightMM,classification:previous.classification});}else{while(used.has('ARCH-'+next)||old.some(w=>w.id==='ARCH-'+next))next++;wall.id='ARCH-'+next++;}used.add(wall.id);}
 const nextWalls=[...made,...free];
 for(const opening of doc.openings||[]){const host=old.find(w=>w.id===opening.wallId);if(!host)continue;const t=opening.offsetMM/wallLength(host,doc.gridMillimetres),point={x:host.a.x+(host.b.x-host.a.x)*t,y:host.a.y+(host.b.y-host.a.y)*t};const replacement=nextWalls.find(w=>w.floor===host.floor&&isHorizontal(w)===isHorizontal(host)&&projectToWall(point,w,doc.gridMillimetres).distanceMM<EPS&&projectToWall(point,w,doc.gridMillimetres).offsetMM+opening.widthMM<=wallLength(w,doc.gridMillimetres)+EPS);if(!replacement)throw Error('The room change would split an existing door/window. Move or remove that opening first.');opening.wallId=replacement.id;opening.offsetMM=projectToWall(point,replacement,doc.gridMillimetres).offsetMM;}
 doc.walls=nextWalls;
 for(const node of doc.nodes)if(node.wallId){const host=old.find(w=>w.id===node.wallId),replacement=nextWalls.find(w=>w.floor===(node.floor||1)&&(!host||isHorizontal(w)===isHorizontal(host))&&projectToWall(node,w,doc.gridMillimetres).distanceMM<10);if(!replacement)throw Error('Room change would detach mounted equipment. Reposition that equipment first.');mountOnWall(doc,node,replacement,projectToWall(node,replacement,doc.gridMillimetres).offsetMM,node.wallSide);}
 for(const dim of doc.dimensions||[])if(dim.wallId&&!nextWalls.some(w=>w.id===dim.wallId)){const wall=old.find(w=>w.id===dim.wallId);if(wall){dim.a={...wall.a};dim.b={...wall.b};}delete dim.wallId;}
}
export function refreshAttachedGeometry(doc){
 for(const node of doc.nodes)if(node.wallId){const wall=doc.walls.find(w=>w.id===node.wallId);if(wall)mountOnWall(doc,node,wall,node.wallOffsetMM,node.wallSide);}
 for(const node of doc.nodes)if(node.inBoard&&node.boardId){const board=doc.nodes.find(n=>n.id===node.boardId);if(board){node.x=board.x;node.y=board.y;node.floor=board.floor;}}
 for(const node of doc.nodes)if(node.roomAnchor&&!node.wallId){const room=doc.rooms.find(r=>r.id===node.roomAnchor.roomId);if(room){node.x=room.x+room.width*node.roomAnchor.u;node.y=room.y+room.height*node.roomAnchor.v;}}
}
export function refreshWireRoutes(doc){
 for(const wire of doc.wires){if(wire.internalBoardId)continue;const from=doc.nodes.find(n=>n.id===wire.from),to=doc.nodes.find(n=>n.id===wire.to);if(!from||!to)continue;
  try{if(wire.routeMode==='wall')routeWireOnArchitecture(doc,wire);else if(wire.routePoints){const middle=wire.routePoints.slice(1,-1),points=[{x:from.x,y:from.y}];for(const point of [...middle,to]){const last=points.at(-1);if(Math.abs(last.x-point.x)>EPS&&Math.abs(last.y-point.y)>EPS)points.push({x:point.x,y:last.y});points.push({x:point.x,y:point.y});}wire.routePoints=points;}
   delete wire.routingError;
  }catch(error){wire.routingError=error.message;}
 }
}
