(()=>{'use strict';
function snap(v,grid=20){return Math.round(Number(v)/grid)*grid}
function move(d,x,y,grid=20){return {...d,position:{x:snap(x,grid),y:snap(y,grid)}}}
function rotate(d,delta=90){return {...d,rotation:((Number(d.rotation)||0)+delta+360)%360}}
function mirrorX(d){return {...d,mirrorX:!d.mirrorX}}
function transform(devices,ids,op){const set=new Set(ids);return devices.map(d=>set.has(d.id)?op(d):d)}
window.VoltProCadCommands={snap,move,rotate,mirrorX,transform};
})();