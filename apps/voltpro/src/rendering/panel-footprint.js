(()=>{'use strict';
function footprint(device){const width=Number(device.panel?.width??device.width??18),height=Number(device.panel?.height??device.height??80),rails=Number(device.panel?.railUnits??Math.max(1,Math.ceil(width/18)));return {deviceId:device.id,width,height,railUnits:rails,mounting:'DIN-rail',anchor:{x:Number(device.position?.x||0),y:Number(device.position?.y||0)}}}
function layout(items,railLength=72){let x=0,row=0;return items.map(d=>{const f=footprint(d);if(x+f.railUnits>railLength){row++;x=0}const out={...f,row,railPosition:x};x+=f.railUnits;return out})}
window.VoltProPanelFootprints={footprint,layout};
})();