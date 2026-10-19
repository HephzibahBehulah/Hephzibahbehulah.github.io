(()=>{'use strict';
const shapes={
 resistor:'<line x1="-30" y1="0" x2="-20" y2="0"/><rect x="-20" y="-8" width="40" height="16"/><line x1="20" y1="0" x2="30" y2="0"/>',
 switch:'<line x1="-30" y1="0" x2="-7" y2="0"/><circle cx="-7" cy="0" r="2"/><circle cx="7" cy="0" r="2"/><line x1="-7" y1="0" x2="7" y2="-12"/><line x1="7" y1="0" x2="30" y2="0"/>',
 lamp:'<line x1="-30" y1="0" x2="-15" y2="0"/><circle cx="0" cy="0" r="15"/><path d="M-10,-10 L10,10 M10,-10 L-10,10"/><line x1="15" y1="0" x2="30" y2="0"/>',
 coil:'<line x1="-30" y1="0" x2="-16" y2="0"/><rect x="-16" y="-12" width="32" height="24" rx="2"/><path d="M-10,-7 Q-4,0 -10,7 M0,-7 Q6,0 0,7 M10,-7 Q16,0 10,7"/><line x1="16" y1="0" x2="30" y2="0"/>',
 motor:'<line x1="-30" y1="-12" x2="-18" y2="-12"/><line x1="-30" y1="0" x2="-18" y2="0"/><line x1="-30" y1="12" x2="-18" y2="12"/><circle cx="0" cy="0" r="18"/><text x="0" y="5" text-anchor="middle" stroke="none" fill="currentColor">M</text><line x1="18" y1="-12" x2="30" y2="-12"/><line x1="18" y1="0" x2="30" y2="0"/><line x1="18" y1="12" x2="30" y2="12"/><line x1="0" y1="18" x2="0" y2="25"/>',
 threephase:'<circle cx="0" cy="0" r="17"/><text x="0" y="4" text-anchor="middle" stroke="none" fill="currentColor">3~</text><line x1="17" y1="-14" x2="30" y2="-14"/><line x1="17" y1="0" x2="30" y2="0"/><line x1="17" y1="14" x2="30" y2="14"/>',
 'circuit-breaker-3p':'<rect x="-16" y="-21" width="32" height="42" rx="2"/><path d="M-9,-14 L-2,-7 M-9,0 L-2,7 M-9,14 L-2,21 M4,-14 L11,-7 M4,0 L11,7 M4,14 L11,21"/><line x1="-30" y1="-14" x2="-16" y2="-14"/><line x1="-30" y1="0" x2="-16" y2="0"/><line x1="-30" y1="14" x2="-16" y2="14"/><line x1="16" y1="-14" x2="30" y2="-14"/><line x1="16" y1="0" x2="30" y2="0"/><line x1="16" y1="14" x2="30" y2="14"/>',
 contactor:'<rect x="-20" y="-30" width="40" height="64" rx="3"/><circle cx="0" cy="-17" r="7"/><path d="M-8,-2 H8 M-8,10 H8 M-8,22 H8"/><line x1="-30" y1="-22" x2="-20" y2="-22"/><line x1="20" y1="-22" x2="30" y2="-22"/><line x1="-30" y1="-6" x2="-20" y2="-6"/><line x1="20" y1="-6" x2="30" y2="-6"/><line x1="-30" y1="6" x2="-20" y2="6"/><line x1="20" y1="6" x2="30" y2="6"/><line x1="-30" y1="18" x2="-20" y2="18"/><line x1="20" y1="18" x2="30" y2="18"/><line x1="-30" y1="30" x2="-20" y2="30"/><line x1="20" y1="30" x2="30" y2="30"/><line x1="-30" y1="42" x2="-20" y2="42"/><line x1="20" y1="42" x2="30" y2="42"/>',
 controlsource:'<line x1="-30" y1="0" x2="-17" y2="0"/><circle cx="0" cy="0" r="17"/><text x="0" y="4" text-anchor="middle" stroke="none" fill="currentColor">24V</text><line x1="17" y1="0" x2="30" y2="0"/>',
 'pushbutton-no':'<line x1="-30" y1="0" x2="-10" y2="0"/><circle cx="-10" cy="0" r="2"/><circle cx="10" cy="0" r="2"/><line x1="-10" y1="0" x2="8" y2="-10"/><line x1="10" y1="0" x2="30" y2="0"/>'
};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function svg(type,opts={}){
 const body=shapes[type]||'<rect x="-18" y="-12" width="36" height="24"/>';
 const viewBox=type==="contactor"?"-36 -48 72 100":type==="motor"?"-36 -30 72 60":"-36 -28 72 56";
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+viewBox+'" role="img" aria-label="'+escape(opts.label||type)+'"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+body+'</g></svg>';
}
function terminalPoint(type,id){
 const maps={
  "circuit-breaker-3p":{L1:[-30,-14],L2:[-30,0],L3:[-30,14],T1:[30,-14],T2:[30,0],T3:[30,14]},
  threephase:{L1:[30,-14],L2:[30,0],L3:[30,14]},
  contactor:{A1:[-30,-22],A2:[30,-22],L1:[-30,-6],T1:[30,-6],L2:[-30,6],T2:[30,6],L3:[-30,18],T3:[30,18],"13":[-30,30],"14":[30,30],"21":[-30,42],"22":[30,42]},
  resistor:{"1":[-30,0],"2":[30,0]},
  switch:{"1":[-30,0],"2":[30,0]},
  lamp:{"1":[-30,0],"2":[30,0]},
  coil:{A1:[-30,0],A2:[30,0]},
  controlsource:{PLUS:[-30,0],MINUS:[30,0]},
  "pushbutton-no":{"13":[-30,0],"14":[30,0]},
  motor:{U1:[-30,-12],V1:[-30,0],W1:[-30,12],U2:[30,-12],V2:[30,0],W2:[30,12],PE:[0,25]}
 };
 return maps[type]?.[id]||[0,0];
}
window.VoltProSymbols={svg,terminalPoint,types:Object.keys(shapes)};
})();