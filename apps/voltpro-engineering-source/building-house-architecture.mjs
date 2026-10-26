import {wallsFromRooms,nearestWall,mountOnWall,addOpening,wallLength,projectToWall,routeWireOnArchitecture,refreshAttachedGeometry} from './building-architecture.mjs';
import {catalogItem} from './building-catalog.mjs';
export function addHouseArchitecture(doc){
 const old=structuredClone(doc.rooms),g=doc.gridMillimetres,at=(x,y)=>({x:7+x*1000/g,y:6+y*1000/g});
 const layouts={'Living Room':[0,0,10,4],'Kitchen':[0,6,5,3],'Guest WC':[8,4,2,2.5],'Utility Room':[6,6.5,4,2.5],'Master Bedroom':[0,0,5,4],'Bedroom 2':[5,0,5,3],'Bathroom':[6,6.5,4,2.5],'Hallway':[0,6,5,3]};
 for(const room of doc.rooms){const [x,y,w,h]=layouts[room.name];Object.assign(room,{...at(x,y),width:w*1000/g,height:h*1000/g,areaBasis:'wall-centreline reference'});}
 for(const node of doc.nodes){const room=doc.rooms.find(r=>r.name===node.room),previous=old.find(r=>r.name===node.room);if(room&&previous){node.x=room.x+(node.x-previous.x)/previous.width*room.width;node.y=room.y+(node.y-previous.y)/previous.height*room.height;}}
 const spaces=[[1,0,4,8,2,'Entrance hall / stair circulation'],[1,5,6,1,3,'Utility passage'],[1,6,6,2,.5,'Utility landing'],[2,0,4,5,2,'Stair landing'],[2,5,3,5,3.5,'First-floor circulation'],[2,5,6.5,1,2.5,'Bathroom passage']];
 doc.spaces=spaces.map(([floor,x,y,w,h,name],i)=>({id:'SPACE-'+(i+1),floor,...at(x,y),width:w*1000/g,height:h*1000/g,name}));
 doc.floorOutlines=[1,2].map(floor=>({id:'OUTLINE-'+floor,floor,...at(0,0),width:50,height:45,name:'Assumed 10 × 9 m footprint'}));
 doc.walls=wallsFromRooms([...doc.rooms,...doc.spaces,...doc.floorOutlines],{prefix:'HOUSE-WALL'});
 for(const wall of doc.walls){const exterior=(wall.a.x===7&&wall.b.x===7)||(wall.a.x===57&&wall.b.x===57)||(wall.a.y===6&&wall.b.y===6)||(wall.a.y===51&&wall.b.y===51);wall.thicknessMM=exterior?240:100;wall.classification=exterior?'exterior-assumed':'partition-assumed';wall.heightMM=2800;}
 doc.openings=[];
 function opening(floor,x,y,type,widthMM,{hinge='start',swing=1}={}){const hit=nearestWall(doc,at(x,y),floor,5);if(!hit)throw Error('Opening has no wall at '+x+','+y);return addOpening(doc,{id:(type==='door'?'DOOR-':'WINDOW-')+(doc.openings.length+1),wallId:hit.wall.id,type,offsetMM:hit.offsetMM-widthMM/2,widthMM,heightMM:type==='door'?2100:1200,sillMM:type==='door'?0:900,hinge,swing});}
 const doors=new Map();
 for(const [floor,x,y,name,width]of [[1,0,5.2,'Entrance',1000],[1,4.5,4,'Living Room',900],[1,2.5,6,'Kitchen',900],[1,8,5.2,'Guest WC',800],[1,7,6.5,'Utility Room',900],[2,2.5,4,'Master Bedroom',900],[2,7.5,3,'Bedroom 2',900],[2,8,6.5,'Bathroom',900],[2,2.5,6,'Hallway',900]])doors.set(name,opening(floor,x,y,'door',width));
 for(const [floor,x,y,width]of [[1,2,0,1600],[1,7,0,1600],[1,0,7.5,1200],[1,10,5.2,600],[1,8,9,1200],[2,2.5,0,1600],[2,7.5,0,1600],[2,10,7.75,900],[2,0,7.5,1200]])opening(floor,x,y,'window',width);
 doc.stairs=[1,2].map(floor=>({id:'STAIRS-'+floor,floor,...at(1,4.2),length:17.5,width:5,steps:16,up:floor===1}));
 doc.dimensions=[1,2].flatMap(floor=>[{id:'DIM-W-'+floor,floor,a:at(0,0),b:at(10,0),offsetMM:-600},{id:'DIM-H-'+floor,floor,a:at(0,0),b:at(0,9),offsetMM:600}]);
 const board=doc.nodes.find(n=>n.tag==='ZK1'),utility=doc.rooms.find(r=>r.name==='Utility Room');const boardHit=nearestWall(doc,at(9.2,9),1,5);mountOnWall(doc,board,boardHit.wall,boardHit.offsetMM,-1);board.mountingHeight=1500;
 const occupied=new Map();
 function freeOffset(wall,desired){const len=wallLength(wall,g),obstacles=doc.openings.filter(o=>o.wallId===wall.id),used=occupied.get(wall.id)||[];for(let delta=0;delta<=len;delta+=200)for(const sign of delta?[1,-1]:[1]){const value=Math.max(200,Math.min(len-200,desired+delta*sign));if(!obstacles.some(o=>value>o.offsetMM-150&&value<o.offsetMM+o.widthMM+150)&&!used.some(v=>Math.abs(v-value)<450)){used.push(value);occupied.set(wall.id,used);return value;}}throw Error('No unobstructed mounting location on '+wall.id);}
 for(const node of doc.nodes){if(node===board)continue;const item=catalogItem(node.type),room=doc.rooms.find(r=>r.name===node.room);
  if(item.category==='protection'){node.inBoard=true;node.boardId=board.id;node.floor=1;node.x=board.x;node.y=board.y;continue;}
  if(node.type==='ceiling-light'){node.roomAnchor={roomId:room.id,u:.5,v:.5};node.x=room.x+room.width/2;node.y=room.y+room.height/2;node.mountingHeight=2600;continue;}
  let hit;
  if(node.type==='wall-switch'||node.type==='two-way-switch'){
   const door=doors.get(node.room),wall=doc.walls.find(w=>w.id===door?.wallId);hit=wall?{wall,offsetMM:door.offsetMM+door.widthMM+250}:nearestWall(doc,node,node.floor);
   if(node.tag==='S-STAIR-BOTTOM')hit=nearestWall(doc,at(4.8,4),1);
  }else{const siblings=doc.nodes.filter(n=>n.room===node.room&&catalogItem(n.type)?.category===item.category&&!n.inBoard),index=siblings.indexOf(node),target={x:room.x+room.width*(index+1)/(siblings.length+1),y:room.y+room.height};hit=nearestWall(doc,target,node.floor);}
  if(hit){const centre={x:room.x+room.width/2,y:room.y+room.height/2},dx=hit.wall.b.x-hit.wall.a.x,dy=hit.wall.b.y-hit.wall.a.y,side=(-dy*(centre.x-hit.wall.a.x)+dx*(centre.y-hit.wall.a.y))>=0?1:-1;mountOnWall(doc,node,hit.wall,freeOffset(hit.wall,hit.offsetMM),side);node.mountingHeight=node.type.includes('switch')?1100:300;}
 }
 let switchIndex=0;for(const node of doc.nodes)if(['wall-switch','two-way-switch'].includes(node.type))node.tag='S'+(++switchIndex);
 refreshAttachedGeometry(doc);
 doc.risers=[{id:'RISER-1',name:'Assumed utility/stair services riser',...at(5.5,6.7),fromFloor:1,toFloor:2,verticalRiseM:null}];
 doc.circuits=doc.nodes.filter(n=>/^F\d+$/.test(n.tag)).map(n=>({id:n.tag,label:n.name.replace(/^F\d+ - /,''),boardId:board.id,overcurrentDeviceId:n.id,rcdId:n.protectiveDeviceId,voltage:n.tag==='F1'?400:230,phases:n.tag==='F1'?3:1,neutralRequired:true,requiresRCD:true,minimumSectionMM2:['F8','F9'].includes(n.tag)?1.5:2.5,powerFactor:null,demandFactor:null,conductorTemperatureC:null,reactanceOhmPerKm:null,maxVoltageDropPercent:null,faultKA:null}));
 for(const wire of doc.wires){const from=doc.nodes.find(n=>n.id===wire.from),to=doc.nodes.find(n=>n.id===wire.to);if(from.inBoard&&to.inBoard){wire.internalBoardId=board.id;delete wire.routePoints;continue;}wire.routingHeightMM=2500;if(from.floor!==to.floor)wire.riserId='RISER-1';routeWireOnArchitecture(doc,wire);}
 doc.designNotes=doc.designNotes.filter(n=>!n.startsWith('Rooms:')&&!n.startsWith('Routes use')).concat([
  'Architectural draft assumption: both storeys use a 10 × 9 m reference footprint. Requested room reference areas are retained; 20 m² ground-floor and 30 m² first-floor circulation are added. These are centreline reference areas; clear/net areas depend on verified wall construction.',
  'Exterior walls are provisionally 240 mm, partitions 100 mm, wall height 2.8 m. Doors, windows and a 16-step staircase are editable assumed geometry, not an approved architectural/escape design.',
  'Socket/switch mounting heights (300/1100 mm), board height (1500 mm), luminaire height (2600 mm) and wall-route height (2500 mm) are editable draft assumptions, not universal regulatory requirements.',
  'Wall routes follow the connected wall graph; riser plan portions are drawn on both floors. The surveyed vertical rise is still missing. Panel-internal wiring is not treated as measured building cable.',
  'Lighting power factors, demand factors, verified cable ampacity, fault level, conductor temperature, reactance and voltage-drop criteria are not invented. Complete circuit data before sizing/protection review.'
 ]).slice(0,40);
 return doc;
}
