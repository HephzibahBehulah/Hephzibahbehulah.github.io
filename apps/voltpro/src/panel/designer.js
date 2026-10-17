(()=>{'use strict';
function create(spec={}){return {width:Number(spec.width||800),height:Number(spec.height||600),rails:Array.isArray(spec.rails)?structuredClone(spec.rails):[{id:'R1',length:72,y:80}],items:Array.isArray(spec.items)?structuredClone(spec.items):[],ducts:Array.isArray(spec.ducts)?structuredClone(spec.ducts):[],terminalStrips:Array.isArray(spec.terminalStrips)?structuredClone(spec.terminalStrips):[]}}
function place(panel,item){const rail=panel.rails.find(r=>r.id===item.railId);if(!rail)throw Error('Unknown rail');if(item.position<0||item.position+item.railUnits>rail.length)throw Error('Device exceeds rail');panel.items.push(structuredClone(item));return panel}
function remove(panel,id){const i=panel.items.findIndex(x=>x.id===id);if(i>=0)panel.items.splice(i,1);return panel}
window.VoltProPanelDesigner={create,place,remove};
})();