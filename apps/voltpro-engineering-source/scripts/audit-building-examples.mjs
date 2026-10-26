// Run from apps/voltpro-engineering-source: node scripts/audit-building-examples.mjs
// Full catalogue audit is intentionally separate from the short CI regression suite.
import {createHash} from 'node:crypto';
import {BUILDING_EXAMPLES,buildBuildingExample,validateBuildingExample} from '../building-examples.mjs';
const unique=new Map(),counts={},started=Date.now();let checked=0;
for(const e of BUILDING_EXAMPLES){const d=buildBuildingExample(e);validateBuildingExample(d);const physical={rooms:d.rooms.map(r=>[r.floor,r.x,r.y,r.width,r.height]),equipment:d.nodes.map(n=>[n.type,n.floor,n.x,n.y]),routes:d.wires.map(w=>[w.cableId,w.runs]),circuits:d.circuits.map(c=>[c.voltage,c.phases])};const hash=createHash('sha256').update(JSON.stringify(physical)).digest('hex');if(unique.has(hash))throw Error(`Repeated physical design: ${unique.get(hash)} and ${e.id}`);unique.set(hash,e.id);counts[e.profile]=(counts[e.profile]||0)+1;if(++checked%100===0)console.log(JSON.stringify({checked,total:BUILDING_EXAMPLES.length}));}
if(checked!==1000||Object.values(counts).some(n=>n!==250))throw Error('Incomplete example catalogue.');console.log(JSON.stringify({passed:checked,uniquePhysicalDesigns:unique.size,byRegion:counts,seconds:(Date.now()-started)/1000,scope:'Structural, reference, regional part/cable and PE screening; not construction certification.'}));
