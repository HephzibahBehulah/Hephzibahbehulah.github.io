(()=>{'use strict';
function multimeter(mode,measurement){return {instrument:'multimeter',mode,value:measurement,unit:mode==='voltage'?'V':mode==='current'?'A':mode==='resistance'?'Ω':'continuity'}}
function oscilloscope(samples=[],channel='CH1'){return {instrument:'oscilloscope',channel,samples:samples.slice(),frequency:estimateFrequency(samples)}}
function estimateFrequency(samples){if(samples.length<3)return 0;let crossings=0;for(let i=1;i<samples.length;i++)if(samples[i-1].value<=0&&samples[i].value>0)crossings++;const duration=(samples.at(-1).t||0)-(samples[0].t||0);return duration>0?crossings/duration:0}
function threePhaseMeter(v){return {instrument:'three-phase-meter',L1L2:Number(v.L1L2||0),L2L3:Number(v.L2L3||0),L3L1:Number(v.L3L1||0),frequency:Number(v.frequency||0),sequence:v.sequence||null}}
window.VoltProInstruments={multimeter,oscilloscope,threePhaseMeter};
})();