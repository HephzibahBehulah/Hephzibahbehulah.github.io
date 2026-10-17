(()=>{"use strict";
const copper={0.75:10,1:13,1.5:16,2.5:20,4:25,6:32,10:40,16:63,25:80,35:100,50:125,70:160,95:200};
function voltageDrop(current,length,size,material="Cu"){const amp=copper[size]||0;const rho=material==="Al"?0.0282:0.0175;const v=current*length*2*rho/size;return {drop:v,percent:null,ampacity:amp,material,size}}
function cableSize({current,length,voltage=230,maxDrop=3,material="Cu"}){for(const s of Object.keys(copper).map(Number))if(voltageDrop(current,length,s,material).drop/voltage*100<=maxDrop&&copper[s]>=current)return {size:s,...voltageDrop(current,length,s,material),percent:voltageDrop(current,length,s,material).drop/voltage*100};return {size:null,error:"No size in educational table"}}
function motorCurrent({power,voltage=400,efficiency=.9,pf=.8,phases=3}){return phases===3?power/(Math.sqrt(3)*voltage*efficiency*pf):power/(voltage*efficiency*pf)}
function breaker({loadCurrent,curve="B"}){const factor=curve==="C"?1.25:curve==="D"?1.5:1.15;return Math.ceil(loadCurrent*factor)}
window.VoltProEngineering={voltageDrop,cableSize,motorCurrent,breaker};
})();