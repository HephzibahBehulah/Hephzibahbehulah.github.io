(()=>{"use strict";
const esc=x=>String(x??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const templates=[
["Protected DC Lamp","DC Basics","Build a fused low-voltage lighting circuit.","battery,fuse,switch,lamp"],
["Series Resistor Study","DC Basics","Explore the effect of series resistance on a load.","battery,resistor,resistor,lamp"],
["LED Indicator","Electronics","Explore a current-limited LED indicator.","battery,resistor,led,switch"],
["RC Learning Circuit","Electronics","Inspect resistance and capacitance parameters.","battery,resistor,switch,capacitor"],
["Inductive Load","Electronics","Explore an inductive load arrangement.","acsource,inductor,resistor,switch"],
["Diode Protection","Electronics","Study a diode in a protected DC path.","battery,fuse,diode,resistor"],
["Fuse Protected Motor","Protection","Place a fuse upstream of a switched motor load.","battery,fuse,switch,motor","motor-system"],
["MCB Protected Heater","Protection","Arrange a breaker and resistive load.","acsource,breaker,switch,heater"],
["Relay Control","Control","Explore a relay-controlled indicator circuit.","battery,switch,relay,lamp","relay-control"],
["Contactor Motor Concept","Industrial Control","Arrange protection, contactor and motor blocks.","battery,fuse,contactor,motor","motor-system"],
["Motor Load Study","Industrial Control","Change the simplified motor resistance model.","battery,breaker,switch,motor","motor-system"],
["Buzzer Alarm","Control","Create a switched audible-indicator circuit.","battery,fuse,switch,buzzer"],
["Heater Control","Industrial Control","Study a switched resistive load.","acsource,breaker,switch,heater"],
["AC Measurement","Measurement","Measure a resistive load in parallel with an AC source.","acsource,multimeter,resistor,switch","parallel-meter"],
["Oscilloscope Introduction","Measurement","Measure a resistive load in parallel with the oscilloscope probes.","acsource,oscilloscope,resistor,lamp","parallel-scope"],
["Terminal Block Wiring","Panel","Use a terminal block as a named connection point.","battery,terminal,switch,lamp"],
["Switch Contact Study","Control","Experiment with a switch state in a load circuit.","battery,switch,lamp,resistor"],
["Two Load Comparison","DC Basics","Compare lamp and heater loads in parallel through one switch.","battery,switch,lamp,heater","parallel-loads"],
["Relay and Buzzer","Industrial Control","Combine a protective device with relay and indicator.","battery,fuse,relay,buzzer","relay-control"],
["Component Parameter Lab","Reference","Practise editing and comparing component parameters.","battery,resistor,capacitor,inductor"]
].map((x,i)=>({template:i+1,name:x[0],category:x[1],goal:x[2],types:x[3].split(","),wiring:x[4]||"series"}));
const variants=[["Starter",1],["Low Range",.5],["Standard Range",1.5],["High Range",2],["Troubleshooting",.8]];
const demos=templates.flatMap(t=>variants.map((v,i)=>({id:(t.template-1)*5+i+1,title:t.name+" · "+v[0],category:t.category,goal:t.goal,types:t.types,wiring:t.wiring,variant:v[0],factor:v[1],template:t.template})));
let selected=demos[0],query="",category="All";
function style(){if(document.getElementById("vpDemoStyle"))return;const st=document.createElement("style");st.id="vpDemoStyle";st.textContent=`
#vpDemoLibrary{position:relative;width:100%;height:100%;min-height:0;background:#071321;color:#eaf5ff;display:none;grid-template-rows:auto minmax(0,1fr);overflow:hidden;font:12px system-ui}
#vpDemoLibrary.open{display:grid}.vpd-head{display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid #29475f;min-width:0}.vpd-head b{color:#35d5ff;letter-spacing:.06em;font-size:10px;line-height:1.4}.vpd-head span{color:#9ab1c5;font-size:10px}.vpd-head button{margin-left:auto;flex:none}.vpd-body{display:grid;grid-template-columns:1fr;grid-template-rows:minmax(120px,42%) minmax(0,1fr);min-height:0}.vpd-side,.vpd-detail{padding:8px;overflow:auto;min-width:0;min-height:0}.vpd-side{border-bottom:1px solid #29475f}.vpd-side input,.vpd-btn{width:100%;padding:8px;margin-bottom:6px;background:#0b1b2c;color:#eaf5ff;border:1px solid #31516d;border-radius:7px;text-align:left;cursor:pointer}.vpd-btn.active,.vpd-btn:hover{border-color:#35d5ff}.vpd-side small{display:block;color:#8da4bd;margin-top:4px}.vpd-cats{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}.vpd-cats button{background:#102238;color:#a8bed3;border:1px solid #29475f;border-radius:6px;padding:5px 6px;cursor:pointer}.vpd-detail h2{color:#35d5ff;font-size:15px}.vpd-detail h3{font-size:11px;margin:12px 0 4px}.vpd-detail p{line-height:1.5;color:#b5c8d9;font-size:11px}.vpd-detail .vpd-load{background:linear-gradient(135deg,#35d5ff,#65e6ad);color:#04131d;border:0;border-radius:8px;padding:9px 12px;font-weight:800;cursor:pointer}.vpd-note{border-left:3px solid #ffc45c;padding:8px 10px;background:#161c25;color:#d4c8a7;font-size:10px}.vpd-list{max-height:105px;overflow:auto}.vpd-list .vpd-btn{padding:6px;margin-bottom:4px;font-size:10px}#vpDemoLibrary[hidden]{display:none!important}`;
document.head.appendChild(st)}
function close(){const root=document.getElementById("vpDemoLibrary"),panel=document.getElementById("inspectorPanel");if(!root||!panel)return;root.classList.remove("open");root.hidden=true;for(const node of [...panel.children])if(node!==root&&node!==panel._demoLibraryHeading){if(panel._demoLibraryHidden?.has(node))node.hidden=panel._demoLibraryHidden.get(node)}panel._demoLibraryHidden=null;panel._demoLibraryHeading=null;}
function open(){style();const panel=document.getElementById("inspectorPanel");if(!panel)throw Error("The project library needs the Inspector dock. Open the Inspector and try again.");window.VoltProWorkspaceControls?.setPanel?.("right",true);let root=document.getElementById("vpDemoLibrary");if(!root){root=document.createElement("section");root.id="vpDemoLibrary";root.setAttribute("aria-label","Demo project library")}if(root.parentElement!==panel)panel.append(root);if(!panel._demoLibraryHidden){panel._demoLibraryHidden=new Map();panel._demoLibraryHeading=panel.querySelector(":scope > .vp-panel-heading, :scope > .panel-title");for(const node of [...panel.children])if(node!==root&&node!==panel._demoLibraryHeading){panel._demoLibraryHidden.set(node,node.hidden);node.hidden=true}}root.hidden=false;draw();root.classList.add("open");root.querySelector("#vpdSearch")?.focus()}
function wiringDescription(d){if(d.wiring==="motor-system")return "Three-phase source → 3-pole breaker → contactor → overload relay → three-phase motor. A separate 24 V control circuit uses the PLC start, stop and trip inputs.";if(d.wiring==="relay-control")return "The DC source and switch/fuse energize relay coil pins 0–1. Supply pins 2–4 feed the lamp or buzzer through the relay normally-open contact.";if(d.wiring==="parallel-meter")return "The source, switch and resistor form the load path. The multimeter probes connect across the resistor in parallel.";if(d.wiring==="parallel-scope")return "The AC source, resistor and lamp form the load path. Oscilloscope inputs connect across the resistor in parallel.";if(d.wiring==="parallel-loads")return "One switch feeds two parallel branches: a lamp and a heater. Both return to the source.";return "Series loop: source → "+d.types.slice(1).join(" → ")+" → source return. Each stage connects terminal 2 to the next stage terminal 1."}
function componentDescription(d){if(d.wiring==="motor-system")return "3-phase supply, 3-pole breaker, contactor, overload relay, 3-phase motor, PLC, start, stop and trip controls";if(d.wiring==="relay-control")return "24 V DC source, relay coil, relay NO contact and switched lamp/buzzer load";return d.types.map(t=>(window.defs?.[t]||{}).name||t).join(" → ")}
function draw(){const root=document.getElementById("vpDemoLibrary");if(!root)return;const cats=["All",...new Set(demos.map(d=>d.category))],list=demos.filter(d=>(category==="All"||d.category===category)&&(d.title+" "+d.goal+" "+d.id).toLowerCase().includes(query.toLowerCase()));root.innerHTML='<header class="vpd-head"><b>VOLTPro · 20 CIRCUIT STUDIES · 100 VARIANTS</b><span>'+list.length+' projects</span><button id="vpdClose" class="vpd-btn" style="width:auto;margin:0">Close</button></header><div class="vpd-body"><aside class="vpd-side"><input id="vpdSearch" placeholder="Search demos by name or topic"><div class="vpd-cats">'+cats.map(c=>'<button data-vpdcat="'+esc(c)+'">'+esc(c)+'</button>').join("")+'</div><div class="vpd-list">'+list.map(d=>'<button class="vpd-btn '+(selected.id===d.id?"active":"")+'" data-vpd="'+d.id+'"><b>'+String(d.id).padStart(3,"0")+'. '+esc(d.title)+'</b><small>'+esc(d.category)+'</small></button>').join("")+'</div></aside><main class="vpd-detail"><h2>'+esc(selected.title)+'</h2><p><b>Demo '+selected.id+' of 100 · '+esc(selected.category)+'</b></p><p>'+esc(selected.goal)+'</p><h3>Wiring plan</h3><p>'+esc(wiringDescription(selected))+'</p><h3>Learning guide</h3><p>Place the listed components, trace each terminal-to-terminal connection, select components to edit their values, then run the educational analysis. Use Undo/Redo to compare changes.</p><h3>Included components</h3><p>'+esc(componentDescription(selected))+'</p><p><b>Variant:</b> '+esc(selected.variant)+' · parameter factor '+selected.factor+'</p><div class="vpd-note">Educational example only. This is an educational circuit model. Verify ratings and applicable standards separately before real-world use.</div><p><button id="vpdLoad" class="vpd-load">Load demo into schematic</button></p></main></div>';
root.querySelector("#vpdClose").onclick=close;root.querySelector("#vpdSearch").value=query;root.querySelector("#vpdSearch").oninput=e=>{query=e.target.value;draw()};root.querySelectorAll("[data-vpdcat]").forEach(b=>{if(b.dataset.vpdcat===category)b.classList.add("active");b.onclick=()=>{category=b.dataset.vpdcat;draw()}});root.querySelectorAll("[data-vpd]").forEach(b=>b.onclick=()=>{selected=demos.find(d=>d.id===Number(b.dataset.vpd))||demos[0];draw()});root.querySelector("#vpdLoad").onclick=()=>loadDemo(selected)}
function loadDemo(d){
 const S=window.S,defs=window.defs||{};if(!S)throw Error("Simulator state is unavailable.");
 if(S.history){S.history.push(JSON.stringify({components:S.components,wires:S.wires}));if(S.history.length>30)S.history.shift();S.future=[]}
 const ids=d.types.map((t,i)=>"demo"+d.id+"_"+i);
 let components=d.types.map((type,i)=>{const def=defs[type]||{},props=JSON.parse(JSON.stringify(def.props||{}));if(typeof props.voltage==="number")props.voltage=Math.max(1,Math.round(props.voltage*d.factor));if(typeof props.resistance==="number")props.resistance=Math.max(1,Math.round(props.resistance/d.factor));if(typeof props.rating==="number")props.rating=Math.max(.1,Math.round(props.rating*d.factor*10)/10);return{id:ids[i],type,x:120+i*150,y:210,rotation:0,props,pins:[]}});
 let wires=[],seq=0;const link=(a,ap,b,bp)=>wires.push({id:"D"+d.id+"W"+(++seq),a:a+":"+ap,b:b+":"+bp});
 if(d.wiring==="motor-system"){
  if(!window.VoltProMotorSystem?.schematic)throw Error("The validated motor starter project is unavailable.");
  const project=window.VoltProMotorSystem.schematic({lineVoltage:400,controlVoltage:24,frequencyHz:50});
  for(const part of project.components)if(part.type==="motor")part.props.resistance=Math.max(1,Math.round(32/d.factor));project.metadata.name=d.title;project.metadata.objective=d.goal;
  components=project.components;wires=project.wires;
 }else if(d.wiring==="relay-control"){
  const source=components[0],control=components[1],relay=components[2],load=components[3];
  source.props.voltage=24;
  if(control.type==="switch")control.props.closed=1;
  link(source.id,0,control.id,0);link(control.id,1,relay.id,0);link(relay.id,1,source.id,1);
  link(source.id,0,relay.id,2);link(relay.id,4,load.id,0);link(load.id,1,source.id,1);
 }else if(d.wiring==="parallel-meter"){
  const source=components[0],meter=components[1],load=components[2],sw=components[3];
  link(source.id,0,sw.id,0);link(sw.id,1,load.id,0);link(load.id,1,source.id,1);
  link(meter.id,0,load.id,0);link(meter.id,1,load.id,1);
 }else if(d.wiring==="parallel-scope"){
  const source=components[0],scope=components[1],load=components[2],lamp=components[3];
  link(source.id,0,load.id,0);link(load.id,1,lamp.id,0);link(lamp.id,1,source.id,1);
  link(scope.id,0,load.id,0);link(scope.id,1,load.id,1);
 }else if(d.wiring==="parallel-loads"){
  const source=components[0],sw=components[1],lamp=components[2],heater=components[3];
  link(source.id,0,sw.id,0);link(sw.id,1,lamp.id,0);link(lamp.id,1,source.id,1);
  link(sw.id,1,heater.id,0);link(heater.id,1,source.id,1);
 }else{
  const invalid=components.find(c=>(defs[c.type]?.pins||2)!==2);
  if(invalid)throw Error("No verified two-terminal wiring plan exists for "+invalid.type+".");
  if(components.length>1){link(components[0].id,0,components[1].id,0);for(let i=1;i<components.length-1;i++)link(components[i].id,1,components[i+1].id,0);link(components.at(-1).id,1,components[0].id,1)}
 }
 const knownPins={battery:2,threephase:4,contactor:12,motor:7,"circuit-breaker-3p":6,"overload-relay":10,"plc-controller":13,ground:1,switch:2};const pinCount=c=>window.VoltProRegistry?.get?.(c.type)?.terminals?.length||window.VoltProComponents?.get?.(c.type)?.terminals?.length||defs[c.type]?.pins||knownPins[c.type]||2;const idsPresent=new Map(components.map(c=>[c.id,new Set(Array.from({length:pinCount(c)},(_,i)=>i))]));
 for(const wire of wires){for(const end of [wire.a,wire.b]){const parts=String(end).split(":"),valid=idsPresent.get(parts[0]);if(!valid||!valid.has(Number(parts[1])))throw Error("Demo wiring references a missing terminal: "+end)}}
 S.components=components;S.wires=wires;S.selected=components[0]?.id||null;S.selectedWireId=null;S.mode="schematic";S.running=false;S.lastAnalysis=null;S.lastSolverProject=null;S.pan={x:0,y:0};S.zoom=1;
 window.VoltProUI?.render?.();document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode==="schematic"));document.querySelector("#fitBtn")?.click();close();
 const c=document.querySelector("#console");if(c)c.textContent+="\nLoaded demo "+d.id+": "+d.title+" · "+wires.length+" verified terminal connections\n"+d.goal;
}
window.VoltProDemoLibrary={open,demos:()=>demos.slice(),load:loadDemo};
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
})();

