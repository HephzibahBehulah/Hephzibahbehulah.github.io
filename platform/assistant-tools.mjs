import './studio-bank.js';
const bank=globalThis.HBStudioBank;
export const PUBLIC_TOOLS=['calculate','project.review','library.find','site.health'];
export const PRIVATE_TOOLS=[...PUBLIC_TOOLS,'accounts.summary'];
const number=(args,key,{zero=false}={})=>{const value=args[key];if(typeof value!=='number'||!Number.isFinite(value)||(zero?value<0:value<=0)||value>1e12||value!==0&&value<1e-24)throw Error('Enter a valid '+key+' value in SI units.');return value;};
export function calculate(args={}){
 const kind=args.kind;
 if(kind==='ohms'){const voltage=number(args,'voltage',{zero:true}),resistance=number(args,'resistance');return {kind,voltageV:voltage,resistanceOhm:resistance,currentA:voltage/resistance,powerW:voltage*voltage/resistance,formula:'I = V/R; P = V²/R'};}
 if(kind==='divider'){const voltage=number(args,'voltage',{zero:true}),top=number(args,'r1'),bottom=number(args,'r2');return {kind,outputV:voltage*bottom/(top+bottom),currentA:voltage/(top+bottom),formula:'Vout = Vin × R2/(R1+R2)',assumption:'Unloaded ideal resistor divider.'};}
 if(kind==='rc'){const resistance=number(args,'resistance'),capacitance=number(args,'capacitance');return {kind,timeConstantS:resistance*capacitance,cutoffHz:1/(2*Math.PI*resistance*capacitance),formula:'τ = RC; fc = 1/(2πRC)'};}
 if(kind==='rl'){const resistance=number(args,'resistance'),inductance=number(args,'inductance');return {kind,timeConstantS:inductance/resistance,formula:'τ = L/R'};}
 if(kind==='led'){const voltage=number(args,'voltage'),forwardV=number(args,'forwardV',{zero:true}),current=number(args,'current');if(voltage<=forwardV)throw Error('Supply voltage must exceed LED forward voltage.');const resistance=(voltage-forwardV)/current;return {kind,resistanceOhm:resistance,resistorPowerW:current*current*resistance,formula:'R = (Vs − Vf)/I',assumption:'Ideal DC estimate; select a real resistor power rating with suitable margin.'};}
 throw Error('Choose ohms, divider, rc, rl or led.');
}
export function reviewProject(project){
 if(!project||typeof project!=='object'||Array.isArray(project))throw Error('Open a supported drawing and include its project context.');
 const isPLC=Array.isArray(project.nodes),isBB=Array.isArray(project.parts),items=isPLC?project.nodes:isBB?project.parts:project.components,wires=isPLC?project.edges:project.wires;
 if(!Array.isArray(items)||!Array.isArray(wires)||items.length>1000||wires.length>4000)throw Error('Unsupported project structure or project too large for this review.');
 const ids=new Set(),issues=[],connections=new Map();
 for(const item of items){if(typeof item.id!=='string'||!item.id)issues.push('A device has no ID.');else if(ids.has(item.id))issues.push('Duplicate device ID: '+item.id);else ids.add(item.id);}
 if(!items.length)issues.push('The drawing is empty.');
 const pinIds=new Set(items.flatMap(item=>Array.isArray(item.pins)?item.pins.filter(p=>typeof p==='string'):[]));
 for(const wire of wires){const ends=isPLC?[wire.source,wire.target]:[wire.a,wire.b];if(ends.some(v=>typeof v!=='string')){issues.push('A connection has a missing endpoint.');continue;}if(ends[0]===ends[1])issues.push('A connection joins an endpoint to itself.');for(const end of ends){const id=isPLC?end:end.split(':')[0];if(isPLC&&!ids.has(id)||!isPLC&&!isBB&&!ids.has(id)&&!pinIds.has(end))issues.push('Unknown connection endpoint: '+end);if(ids.has(id))connections.set(id,(connections.get(id)||0)+1);}}
 const unconnected=isBB?[]:[...ids].filter(id=>!connections.has(id));
 return {workspace:isPLC?'plc':isBB?'breadboard':'simulator',devices:items.length,connections:wires.length,issues:[...new Set(issues)].slice(0,50),unconnectedDevices:unconnected.slice(0,50),scope:'Structural review only. No electrical solve, terminal-rating check, breadboard strip-continuity verification or safety certification was performed.'};
}
const HEALTH_URLS=['https://hephzibahbehulah.com/','https://engineering.hephzibahbehulah.com/','https://cyber.hephzibahbehulah.com/'];
export async function runAssistantTool(name,args,{privateHost=false,request,env,accountAdmin,fetcher=fetch}={}){
 if(!(privateHost?PRIVATE_TOOLS:PUBLIC_TOOLS).includes(name))throw Error('This tool is not available in this workspace.');
 if(name==='calculate')return calculate(args);
 if(name==='project.review')return reviewProject(args.project);
 if(name==='library.find'){const q=String(args.q||'').slice(0,100),family=String(args.family||'');if(q.length>0&&!/^(?:st-|cfg-)?\d+$/i.test(q)&&!bank.families.some(f=>f.id===family))throw Error('Choose a circuit family or an exact ST/CFG ID.');return bank.query({q,family,kind:args.kind==='components'?'components':'projects',limit:6});}
 if(name==='site.health')return {checkedAt:new Date().toISOString(),pages:await Promise.all(HEALTH_URLS.map(async url=>{const start=Date.now();try{const r=await fetcher(url,{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(8000)});return {url,httpStatus:r.status,elapsedMs:Date.now()-start,reachable:r.status>=200&&r.status<400};}catch{return {url,reachable:false,error:'Health request failed or timed out.'};}})),scope:'Public HTTP reachability only. Does not prove that every feature or provider works.'};
 if(name==='accounts.summary'){
  if(!accountAdmin||!request)throw Error('Private account service unavailable.');
  const url=new URL(request.url);url.pathname='/api/admin/accounts/events';url.search='';
  const r=await accountAdmin(new Request(url,{headers:request.headers}),env);const body=await r.json();if(!r.ok)throw Error(body.error||'Account event service unavailable.');
  const events=Array.isArray(body.events)?body.events:[],actions={};for(const event of events){const action=String(event.action||'unknown');actions[action]=(actions[action]||0)+1;}
  return {checkedAt:new Date().toISOString(),eventsInWindow:events.length,actions,newest:events[0]?.created_at||null,oldest:events.at(-1)?.created_at||null,coverage:body.coverage||'Available provider audit events only.',scope:'Latest available event window, at most 100 records; not all users or all historical sign-ins. No passwords, session tokens, email addresses or IP addresses included.'};
 }
}
