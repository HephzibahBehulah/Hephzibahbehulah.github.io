(()=>{"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const menus={
 demos:{title:"Demo circuits",items:[
  ["Protected DC Lamp · Starter","demo","Protected DC Lamp · Starter"],
  ["LED Indicator · Starter","demo","LED Indicator · Starter"],
  ["Series Resistor Study · Starter","demo","Series Resistor Study · Starter"],
  ["RC Learning Circuit · Starter","demo","RC Learning Circuit · Starter"],
  ["AC Measurement · Starter","demo","AC Measurement · Starter"],
  ["Browse all demo circuits…","demo-library"]
 ]},
 motor:{title:"Motor starter",items:[
  ["Contactor Motor Concept · Starter","demo","Contactor Motor Concept · Starter"],
  ["Motor Load Study · Standard Range","demo","Motor Load Study · Standard Range"],
  ["Fuse Protected Motor · Starter","demo","Fuse Protected Motor · Starter"],
  ["Open PLC ladder editor","plc"],
  ["Run motor-starter challenge","challenge","motor-starter"]
 ]},
 logic:{title:"Logic lab",items:[
  ["Open PLC ladder editor","plc"],
  ["Switch a lamp challenge","challenge","light-basic"],
  ["3-phase motor starter challenge","challenge","motor-starter"],
  ["MCU Blink challenge","challenge","arduino-blink"],
  ["Open PLC Logic mode","mode","plc"]
 ]},
 projects:{title:"Project library",items:[
  ["Wired application projects","applications"],
  ["Open saved project library","project-library"],
  ["Save current project","click-id","saveBtn"],
  ["Load project file","click-id","loadBtn"],
  ["Export project file","click-id","exportBtn"]
 ]},
 faults:{title:"Fault lab",items:[
  ["Open conductor / open circuit","fault","open"],
  ["Short circuit","fault","short"],
  ["Overload","fault","overload"],
  ["Reverse polarity","fault","reverse"],
  ["Ground fault","fault","ground"],
  ["Phase loss","fault","phaseLoss"]
 ]},
 challenges:{title:"Challenges",items:[
  ["Switch a lamp · Beginner","challenge","light-basic"],
  ["3-phase motor starter · Professional","challenge","motor-starter"],
  ["MCU Blink · Intermediate","challenge","arduino-blink"]
 ]},
 tutorials:{title:"Tutorials",items:[
  ["Your first circuit","tutorial","first-circuit"],
  ["Five safety rules","tutorial","five-safety-rules"]
 ]},
 mcu:{title:"Microcontroller lab",items:[
  ["Open MCU Lab · Blink LED","mcu","blink"],
  ["Button input example","mcu","button"],
  ["PWM LED dimmer example","mcu","pwm"],
  ["Open BB400 breadboard workspace","navigate","breadboard.html"]
 ]},
 tools:{title:"Engineering tools",items:[
  ["Engineering component reference","reference"],
  ["Engineering Toolkit","tool","engineering"],
  ["Engineering Documentation","tool","docs"],
  ["Bill of Materials","tool","bom"],
  ["Panel Designer","tool","panel"],
  ["Component Information","tool","info"],
  ["Accessibility settings","tool","a11y"],
  ["Demo Project Library","demo-library"]
 ]}
};
let activeTrigger=null,popover=null;
function close(){if(popover){popover.remove();popover=null}if(activeTrigger){activeTrigger.setAttribute("aria-expanded","false");activeTrigger=null}window.VoltProMenuDock?.close?.()}
function position(){
 if(!popover||!activeTrigger)return;
 const dock=window.VoltProMenuDock?.element;if(dock&&dock.contains(popover)){popover.style.position="static";popover.style.left="";popover.style.top="";popover.style.width="";popover.style.maxHeight="";return}
 const r=activeTrigger.getBoundingClientRect(),w=popover.offsetWidth,h=popover.scrollHeight,gutter=8,below=window.innerHeight-r.bottom-gutter,above=r.top-gutter;
 const placeBelow=below>=Math.min(h,180)||below>=above;
 const available=Math.max(0,placeBelow?below:above);
 popover.style.maxHeight=Math.max(80,available)+"px";
 const actualHeight=Math.min(h,available),left=Math.max(gutter,Math.min(window.innerWidth-w-gutter,r.left));
 let top=placeBelow?r.bottom+6:r.top-actualHeight-6;
 top=Math.max(gutter,Math.min(window.innerHeight-actualHeight-gutter,top));
 popover.style.left=left+"px";popover.style.top=top+"px";
}
function invoke(target,method,label,arg){const action=target?.[method];if(typeof action!=="function")throw Error(label+" did not load. Reload the Simulator and try again.");return action.call(target,arg)}
function dispatch(kind,value){
 const actions=window.VoltProPlatformActions||{};
 if(kind==="applications"){invoke(window.VoltProReferenceLibrary,"open","Engineering application library",{view:"applications"});return}
 if(kind==="reference"){invoke(window.VoltProReferenceLibrary,"open","Component reference",{view:"components"});return}
 if(kind==="demo"){const d=window.VoltProDemoLibrary?.demos?.().find(x=>x.title===value);if(!d){invoke(window.VoltProDemoLibrary,"open","Demo library");return}window.VoltProDemoLibrary.load(d);return}
 if(kind==="demo-library"){invoke(window.VoltProDemoLibrary,"open","Demo library");return}
 if(kind==="project-library"){invoke(window.VoltProProjectWorkspace,"open","Project library");return}
 if(kind==="click-id"){const control=document.getElementById(value);if(!control)throw Error("The requested project control is missing.");control.click();return}
 if(kind==="plc"){invoke(window.VoltProWorkbench,"plc","PLC workspace");return}
 if(kind==="mode"){document.querySelector('.mode[data-mode="'+value+'"]')?.click();return}
 if(kind==="fault"){invoke(actions,"fault","Fault Lab",value);return}
 if(kind==="challenge"){invoke(actions,"challenge","Challenge",value);return}
 if(kind==="tutorial"){invoke(actions,"tutorial","Tutorial",value);return}
 if(kind==="mcu"){invoke(actions,"mcu","Microcontroller Lab",value);return}
 if(kind==="tool"){invoke(actions,value,"Engineering tool");return}
 if(kind==="navigate"){window.location.href=value;return}
}
function open(trigger){
 const key=trigger.dataset.vpMenu,definition=menus[key];if(!definition)return;
 if(activeTrigger===trigger){close();return}close();
 activeTrigger=trigger;trigger.setAttribute("aria-expanded","true");
 popover=document.createElement("div");popover.className="vp-toolbar-popover";popover.id="vp-menu-"+key;popover.setAttribute("role","menu");popover.setAttribute("aria-label",definition.title);
 popover.innerHTML='<div class="vp-toolbar-popover-title">'+esc(definition.title)+'</div>'+definition.items.map((item,i)=>'<button type="button" role="menuitem" data-index="'+i+'" data-kind="'+esc(item[1])+'" data-value="'+esc(item[2]||"")+'">'+esc(item[0])+'</button>').join("");
 const dock=window.VoltProMenuDock?.element;const docked=window.VoltProMenuDock?.open?.(popover,definition.title);if(!docked){if(dock&&!dock.hidden)dock.appendChild(popover);else document.body.appendChild(popover)}trigger.setAttribute("aria-controls",popover.id);position();
 popover.addEventListener("click",event=>{const button=event.target.closest("button[role=menuitem]");if(!button)return;const kind=button.dataset.kind,value=button.dataset.value;close();try{dispatch(kind,value);window.VoltProMenuDock?.close?.()}catch(error){console.error("VoltPRo toolbar action failed:",error);const status=$("#simStatus");if(status){status.dataset.state="error";status.querySelector(".status-label").textContent="TOOL ERROR"}const message="Tool action failed: "+error.message;const log=$("#console");if(log)log.textContent+="\n"+message;const live=$("#simStatus");if(live){live.dataset.state="error";const label=live.querySelector(".status-label");if(label)label.textContent="TOOL UNAVAILABLE";live.setAttribute("aria-label",message)}console.error(message)}});
 popover.addEventListener("keydown",event=>{const items=[...popover.querySelectorAll("button[role=menuitem]")],i=items.indexOf(document.activeElement);if(event.key==="Escape"){event.preventDefault();close();trigger.focus()}else if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();items[(i+(event.key==="ArrowDown"?1:-1)+items.length)%items.length]?.focus()}else if(event.key==="Home"){event.preventDefault();items[0]?.focus()}else if(event.key==="End"){event.preventDefault();items.at(-1)?.focus()}});
 popover.querySelector("button")?.focus();
}
document.querySelectorAll("[data-vp-menu]").forEach(trigger=>trigger.addEventListener("click",()=>open(trigger)));
document.addEventListener("click",event=>{if(!popover)return;if(popover.contains(event.target)||event.target.closest("[data-vp-menu]"))return;close()});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&popover){const trigger=activeTrigger;close();trigger?.focus()}});
const bar=$(".toolbar");bar?.addEventListener("scroll",close,{passive:true});window.addEventListener("resize",position);window.addEventListener("scroll",position,true);
window.VoltProToolbarMenus={close,open,definitions:menus};
})();

