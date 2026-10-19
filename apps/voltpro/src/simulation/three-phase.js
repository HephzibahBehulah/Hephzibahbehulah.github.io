(()=>{'use strict';
const SQ=Math.sqrt(3),deg=x=>x*Math.PI/180;
function source(spec={}){const line=Number(spec.lineVoltage??400),frequency=Number(spec.frequency??50),sequence=spec.sequence||'ABC',ph=sequenceAngles(sequence);const phase=line/SQ;return {lineVoltage:line,phaseVoltage:phase,frequency,sequence,phases:{L1:{magnitude:phase,angleDeg:ph[0]},L2:{magnitude:phase,angleDeg:ph[1]},L3:{magnitude:phase,angleDeg:ph[2]},N:{magnitude:0,angleDeg:0},PE:{magnitude:0,angleDeg:0}}}}
function sequenceAngles(s){return s==='ACB'?[0,120,-120]:[0,-120,120]}
function phasor(m,a){const r=deg(a);return {re:m*Math.cos(r),im:m*Math.sin(r)}}
function lineLine(src,a,b){const x=src.phases[a],y=src.phases[b],p=phasor(x.magnitude,x.angleDeg),q=phasor(y.magnitude,y.angleDeg);return {magnitude:Math.hypot(p.re-q.re,p.im-q.im),phaseDeg:Math.atan2(p.im-q.im,p.re-q.re)*180/Math.PI}}
function status(src,available={L1:true,L2:true,L3:true}){const missing=Object.keys(available).filter(k=>!available[k]);return {healthy:missing.length===0,phaseLoss:missing.length>0,missing}}
window.VoltProThreePhase={source,phasor,lineLine,status};
})();