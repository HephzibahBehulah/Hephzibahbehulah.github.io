(()=>{'use strict';
function numberWires(wires,prefix='W'){return wires.map((w,i)=>({...w,number:w.number||prefix+String(i+1).padStart(3,'0')}))}
function metadata(wire,patch={}){return {...wire,crossSection:patch.crossSection??wire.crossSection??1.5,colour:patch.colour??wire.colour??'black',material:patch.material??wire.material??'Cu',domain:patch.domain??wire.domain??'control',phase:patch.phase??wire.phase??null}}
window.VoltProWireData={numberWires,metadata};
})();