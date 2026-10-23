(()=>{'use strict';
const tabs={PROJECT:['new','open','save','export'],EDIT:['undo','redo','copy','paste','delete'],VIEW:['zoom-in','zoom-out','fit','grid'],WIRING:['wire','junction','label','number-wires'],ARRANGE:['align','distribute','rotate','mirror'],TEST_TRAIN:['run','fault','measure','challenge'],PLC:['ladder','io','timers'],DOCUMENT:['bom','wire-schedule','terminal-schedule']};
function commands(){return Object.entries(tabs).flatMap(([tab,ids])=>ids.map(id=>({id,tab,label:id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())})))}
function groups(){return Object.fromEntries(Object.entries(tabs).map(([k,v])=>[k,v.slice()]))}
window.VoltProRibbon={tabs,commands,groups};
})();