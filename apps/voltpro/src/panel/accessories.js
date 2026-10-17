(()=>{'use strict';
function terminalStrip(spec={}){const count=Number(spec.count||12);return {id:spec.id||'X1',label:spec.label||'X1',count,terminals:Array.from({length:count},(_,i)=>({number:String(i+1),label:spec.prefix?spec.prefix+String(i+1):String(i+1),used:false}))}}
function allocate(strip,labels=[]){if(labels.length>strip.terminals.length)throw Error('Terminal strip capacity exceeded');labels.forEach((label,i)=>{strip.terminals[i]={...strip.terminals[i],label,used:true}});return strip}
function duct(spec={}){return {id:spec.id||'D1',x:Number(spec.x||0),y:Number(spec.y||0),width:Number(spec.width||40),height:Number(spec.height||200),fill:Number(spec.fill||.5)}}
window.VoltProPanelAccessories={terminalStrip,allocate,duct};
})();