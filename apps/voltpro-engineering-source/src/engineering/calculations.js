(()=>{'use strict';
function motorCurrent({powerKw,voltage,pf=.8,efficiency=.9,phases=3}){const p=Number(powerKw)*1000,v=Number(voltage);return phases===3?p/(Math.sqrt(3)*v*Number(pf)*Number(efficiency)):p/(v*Number(pf)*Number(efficiency))}
function threePhasePower({voltage,current,pf=.8}){return Math.sqrt(3)*Number(voltage)*Number(current)*Number(pf)/1000}
function voltageDrop({current,lengthMm,resistanceOhmPerKm=.012,phases=3}){const factor=phases===3?Math.sqrt(3):2;return factor*Number(current)*Number(lengthMm)/1000*Number(resistanceOhmPerKm)}
function recommendCable({current,ambientFactor=.8}){const required=Number(current)/Number(ambientFactor);const sizes=[1.5,2.5,4,6,10,16,25,35,50,70,95];return sizes.find(x=>x*6>=required)||null}
function report(input){const current=motorCurrent(input);return {inputs:structuredClone(input),motorCurrentA:current,threePhasePowerKw:threePhasePower({voltage:input.voltage,current,pf:input.pf}),cableRecommendationMm2:recommendCable({current}),assumptions:['Balanced three-phase system','Educational calculation','Verify cable ampacity, installation method, correction factors and standards before real use']}}
window.VoltProEngineering={motorCurrent,threePhasePower,voltageDrop,recommendCable,report};
})();