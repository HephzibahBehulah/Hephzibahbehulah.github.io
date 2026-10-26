import {createBuildingDocument,recoverBuildingDocument,validateBuildingDocument} from './building-document.mjs';
import {catalogItem} from './building-catalog.mjs';
import {materialSchedule,reviewInstallation} from './building-tools.mjs';
export function houseDraft(){
 const d=createBuildingDocument({name:'Two-storey detached house · engineering draft',profile:'DE',floors:2,activeFloor:1,drafter:'Electrical Building AI · review required'});
 d.metadata.documentNumber='HOUSE-DRAFT-001';
 d.designNotes=[
  'Floor 1 is the ground floor; Floor 2 is the first floor. Rectangular room dimensions and relative positions are drafting assumptions derived from the requested areas, not surveyed architecture.',
  'Rooms: Living Room 8×5 m; Kitchen 5×3 m; Guest WC 2.5×2 m; Utility Room 5×2 m; Master Bedroom 5×4 m; Bedroom 2 5×3 m; Bathroom 5×2 m; Hallway 5×3 m.',
  'Socket counts are an editable planning allowance: Living 6, Kitchen 4, Utility 2, Master 4, Bedroom 2 4, Hallway 1, washing-machine socket 1. No socket in the Guest WC is assumed.',
  'Lighting input is provisionally 10 W per room (8 rooms). Stove, washing machine and towel-rail nameplates are unknown. These are explicit assumptions, not verified installed loads.',
  'At balanced 400 V, 16 A three-phase capacity is √3×400×16 = 11.09 kVA (11.09 kW only at PF=1). This is circuit capacity, not the unknown stove load.',
  'Requested cable specifications: 3×1.5 mm² lighting, 3×2.5 mm² sockets/bathroom, 5×2.5 mm² stove. Correct sizing is NOT established without installation method, ambient temperature, grouping, fault current, disconnection-time and voltage-drop criteria.',
  'Routes use an assumed wall/corridor orthogonal path. Termination branches, wall openings, bathroom zones, staircase geometry and protective-device selectivity require site-specific engineering.',
  'The vertical riser height, tails, service loops and procurement spare lengths are not supplied. Cross-floor cable quantities are unresolved, so the BOM is not a final procurement quantity.',
  'Missing verified selections: utility-approved Zählerschrank assembly/SLS arrangement, main device breaking duty, SPD type/coordination for the earthing system, exact appliance ratings, bathroom equipment/IP/zone suitability and manufacturer parts.',
  'Documented PE provision is included on each new power route. No physical PE continuity or installation compliance has been tested.'
 ];
 const roomData=[['Living Room',1,1,1,40,25],['Kitchen',1,46,1,25,15],['Guest WC',1,46,21,12.5,10],['Utility Room',1,46,36,25,10],['Master Bedroom',2,1,1,25,20],['Bedroom 2',2,31,1,25,15],['Bathroom',2,1,26,25,10],['Hallway',2,31,26,25,15]];
 d.rooms=roomData.map(([name,floor,x,y,width,height],i)=>({id:'R'+(i+1),name,floor,x,y,width,height}));
 let n=0,w=0;
 function node(type,name,room,x,y,extra={}){const item=catalogItem(type);if(!item)throw Error('Missing component: '+type);const value={id:'E'+(++n),type,name,tag:'',room:room.name,floor:room.floor,x:Math.round(x),y:Math.round(y),voltage:item.defaultVoltage,mountingHeight:0,quantity:1,circuit:'',spec:{},...extra};d.nodes.push(value);return value;}
 const utility=d.rooms.find(r=>r.name==='Utility Room');const board=node('meter-cabinet','Zählerschrank · Utility Room',utility,48,38,{tag:'ZK1'});
 const main=node('mcb-3-C-63','Main circuit breaker · requested 63 A',utility,52,38,{tag:'Q0',boardId:board.id});
 const spd=node('spd-t2','SPD · coordination and type selection unresolved',utility,56,38,{tag:'SPD1',boardId:board.id});
 const rcdStove=node('rccb-4-A-40-30','Kitchen stove · 30 mA RCD',utility,60,38,{tag:'FI1',boardId:board.id});
 const rcdBath=node('rccb-2-A-40-30','Bathroom · 30 mA RCD',utility,64,38,{tag:'FI2',boardId:board.id});
 const rcdGeneral=node('rccb-4-A-63-30','General circuits · 30 mA RCD',utility,68,38,{tag:'FI3',boardId:board.id});
 const circuits=[['F1','Kitchen Stove','mcb-3-B-16',rcdStove],['F2','Bathroom','mcb-1-B-16',rcdBath],['F3','Living sockets','mcb-1-B-16',rcdGeneral],['F4','Master sockets','mcb-1-B-16',rcdGeneral],['F5','Bedroom 2 sockets','mcb-1-B-16',rcdGeneral],['F6','Kitchen sockets','mcb-1-B-16',rcdGeneral],['F7','Utility sockets','mcb-1-B-16',rcdGeneral],['F8','Ground-floor lighting','mcb-1-B-10',rcdGeneral],['F9','First-floor lighting','mcb-1-B-10',rcdGeneral],['F10','Hallway sockets','mcb-1-B-16',rcdGeneral]];
 const breakers=new Map();
 function route(from,to,cableId,circuit,protection,minSection){const cross=from.floor!==to.floor;const corridor=44,wallY=d.rooms.find(r=>r.name===to.room)?.y||to.y;const routePoints=[{x:from.x,y:from.y},{x:corridor,y:from.y},{x:corridor,y:wallY},{x:to.x,y:wallY},{x:to.x,y:to.y}];d.wires.push({id:'W'+(++w),from:from.id,to:to.id,cableId,circuit,protectiveDeviceId:protection?.id||'',pePresent:true,minimumSectionMM2:minSection,runs:1,extraLengthM:0,sparePercent:0,verticalRiseM:cross?null:0,...(!cross?{routePoints}:{} )});}
 for(const [id,name,type,rcd] of circuits){const breaker=node(type,`${id} - ${name}`,utility,48+(breakers.size%6)*4,42+Math.floor(breakers.size/6)*4,{tag:id,circuit:id,boardId:board.id,protectiveDeviceId:rcd.id});breakers.set(id,breaker);}
 // Incomer, protection and SPD connections have no invented cable selection or fault rating.
 for(const to of [rcdStove,rcdBath,rcdGeneral,spd])d.wires.push({id:'W'+(++w),from:main.id,to:to.id,cableId:null,runs:1,pePresent:true,extraLengthM:0,sparePercent:0});
 for(const [id,,,rcd] of circuits)d.wires.push({id:'W'+(++w),from:rcd.id,to:breakers.get(id).id,cableId:null,runs:1,pePresent:true,extraLengthM:0,sparePercent:0});
 const socketCounts={'Living Room':[6,'F3'],'Kitchen':[4,'F6'],'Utility Room':[2,'F7'],'Master Bedroom':[4,'F4'],'Bedroom 2':[4,'F5'],'Hallway':[1,'F10']};
 for(const room of d.rooms){
   const lightCircuit=room.floor===1?'F8':'F9',lightBreaker=breakers.get(lightCircuit);
   const lamp=node('ceiling-light',room.name+' ceiling light',room,room.x+room.width/2,room.y+room.height/2,{tag:'L'+room.id,circuit:lightCircuit,boardId:board.id,protectiveDeviceId:rcdGeneral.id,spec:{loadW:10}});
   const sw=node(room.name==='Hallway'?'two-way-switch':'wall-switch',room.name+' manual lighting switch',room,room.x+2,room.y+2,{tag:'S'+room.id,circuit:lightCircuit,boardId:board.id,protectiveDeviceId:rcdGeneral.id});
   route(lightBreaker,sw,'cable-NYM-J-3-1.5',lightCircuit,lightBreaker,1.5);route(sw,lamp,'cable-NYM-J-3-1.5',lightCircuit,lightBreaker,1.5);
   const sockets=socketCounts[room.name];if(sockets)for(let i=0;i<sockets[0];i++){const socket=node('schuko-socket',`${room.name} socket ${i+1}`,room,room.x+2+i*3,room.y+room.height-2,{tag:'X'+room.id+'-'+(i+1),circuit:sockets[1],boardId:board.id,protectiveDeviceId:rcdGeneral.id});route(breakers.get(sockets[1]),socket,'cable-NYM-J-3-2.5',sockets[1],breakers.get(sockets[1]),2.5);}
 }
 const kitchen=d.rooms.find(r=>r.name==='Kitchen'),bath=d.rooms.find(r=>r.name==='Bathroom'),hall=d.rooms.find(r=>r.name==='Hallway');
 const stove=node('cooker-outlet','Kitchen three-phase stove/oven connection',kitchen,60,10,{tag:'COOKER1',voltage:'400 V AC',circuit:'F1',boardId:board.id,protectiveDeviceId:rcdStove.id});route(breakers.get('F1'),stove,'cable-NYM-J-5-2.5','F1',breakers.get('F1'),2.5);
 const washing=node('schuko-socket','Bathroom washing-machine socket',bath,4,33,{tag:'WM1',circuit:'F2',boardId:board.id,protectiveDeviceId:rcdBath.id});route(breakers.get('F2'),washing,'cable-NYM-J-3-2.5','F2',breakers.get('F2'),2.5);
 const towel=node('heated-towel-rail','Bathroom heated towel rail',bath,20,33,{tag:'HTR1',circuit:'F2',boardId:board.id,protectiveDeviceId:rcdBath.id});route(breakers.get('F2'),towel,'cable-NYM-J-3-2.5','F2',breakers.get('F2'),2.5);
 const bottom=node('two-way-switch','Stair lighting switch · bottom landing',utility,40,34,{tag:'S-STAIR-BOTTOM',circuit:'F9',boardId:board.id,protectiveDeviceId:rcdGeneral.id});
 const top=d.nodes.find(n=>n.room==='Hallway'&&n.type==='two-way-switch');route(bottom,top,'cable-NYM-J-5-2.5','F9',breakers.get('F9'),2.5);
 d.nodes.forEach(item=>{if(!item.tag)item.tag=item.id;});return d;
}
export function checkBuildingProposal(raw){
 if(!raw||JSON.stringify(raw).length>1000000||raw.nodes?.length>500||raw.wires?.length>2000||raw.rooms?.length>300)throw Error('Building proposal exceeds the supported size.');
 const d=recoverBuildingDocument(raw);const report=validateBuildingDocument(d);if(report.errors.length)throw Error(report.errors.join(' '));
 for(const room of d.rooms)if(room.x<1||room.y<0||(room.floor||1)>d.metadata.floors)throw Error('Room coordinates/floor are invalid.');
 for(const node of d.nodes)if(!catalogItem(node.type,d.catalog)||(node.floor||1)<1||(node.floor||1)>d.metadata.floors||node.x>10001||node.y>702)throw Error('Unknown component or floor.');
 for(const wire of d.wires){if(wire.cableId&&catalogItem(wire.cableId,d.catalog)?.kind!=='route')throw Error('Unknown cable specification.');if(wire.routePoints){const first=wire.routePoints[0],last=wire.routePoints.at(-1),from=d.nodes.find(n=>n.id===wire.from),to=d.nodes.find(n=>n.id===wire.to);if(first?.x!==from.x||first?.y!==from.y||last?.x!==to.x||last?.y!==to.y)throw Error('Route geometry does not meet its equipment endpoints.');if(!Array.isArray(wire.routePoints)||wire.routePoints.length>100)throw Error('Invalid orthogonal route.');for(let i=0;i<wire.routePoints.length;i++){const p=wire.routePoints[i],previous=wire.routePoints[i-1];if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<1||p.y<0||(previous&&previous.x!==p.x&&previous.y!==p.y))throw Error('Route is not valid orthogonal geometry.');}}}
 d.designNotes=Array.isArray(raw.designNotes)?raw.designNotes.filter(s=>typeof s==='string').slice(0,40):[];return d;
}
export function houseReport(doc){const structure=validateBuildingDocument(doc),review=reviewInstallation(doc),rows=materialSchedule(doc);return [
 'EDITABLE TWO-STOREY HOUSE DRAFT · not an approved/compliant installation',
 '1. Spatial layout: '+doc.rooms.map(r=>`${r.name}: ${(r.width*r.height*.04).toFixed(1)} m² (Floor ${r.floor})`).join('; '),
 '2. Circuit/board schedule: '+doc.nodes.filter(n=>/^F\d+$/.test(n.tag)).map(n=>n.name).join('; '),
 '3. Design basis: '+(doc.designNotes||[]).join('\n'),
 '4. BOM (measured plan portions; unresolved vertical routes excluded from totals):\n'+rows.map(r=>`Floor ${r.floor}: ${r.name} — ${r.unmeasured?'UNRESOLVED VERTICAL LENGTH':r.quantity.toFixed(2)+' '+r.unit}`).join('\n'),
 '5. DRC log: '+structure.errors.length+' structural errors; '+review.issues.filter(i=>i.level==='error').length+' design-data errors; '+review.issues.filter(i=>i.level==='review').length+' unresolved reviews.\n'+review.issues.map(i=>`${i.level.toUpperCase()} ${i.code} ${i.object}: ${i.message}`).join('\n'),
 'No certificate is issued. Zero structural errors does not establish DIN VDE 0100 compliance. Import the draft using the action below, then inspect each floor and resolve all open inputs.'
 ].join('\n\n');}
