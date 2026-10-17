(()=>{'use strict';
function scan(s={}){const eStopClosed=s.S0?.pressed!==true,stopClosed=s.S1?.pressed!==true,overloadClosed=s.OL1?.tripped!==true,startPressed=s.S2?.pressed===true,holding=s.KM1?.energized===true;const coil=eStopClosed&&stopClosed&&overloadClosed&&(startPressed||holding);const phases=s.phases||{L1:true,L2:true,L3:true};const phaseHealthy=Boolean(phases.L1&&phases.L2&&phases.L3);return {KM1:{energized:coil},M1:{running:coil&&phaseHealthy},control:{eStopClosed,stopClosed,overloadClosed,startPressed,holding},phaseHealthy}}
window.VoltProDOLRuntime={scan};
})();