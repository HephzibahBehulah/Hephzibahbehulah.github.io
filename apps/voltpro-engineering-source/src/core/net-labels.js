(()=>{'use strict';
const COLORS=['#48d8d0','#e8bd62','#8bc8ff','#a89cf2','#fa8f72','#8ed49c','#ef8bc6','#75b8ef'];
const endpoint=value=>typeof value==='string'?value:value&&value.deviceId!=null&&value.terminalId!=null?String(value.deviceId)+':'+String(value.terminalId):'';
function hash(value){let n=2166136261;for(const ch of String(value)){n^=ch.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0}
function labelFor(anchor){let slug=String(anchor||'NET').replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'').toUpperCase()||'NET';if(slug.length>28)slug=slug.slice(0,23)+'_'+hash(anchor).toString(36).toUpperCase();return 'N_'+slug}
function decorate(wires,resolution){
 const terminalToNet=resolution?.terminalToNet;if(!(terminalToNet instanceof Map))return {wires:(wires||[]).map(w=>({...w})),diagnostics:[]};
 const groups=new Map();
 for(const wire of wires||[]){const a=endpoint(wire.from??wire.a),b=endpoint(wire.to??wire.b),netA=terminalToNet.get(a),netB=terminalToNet.get(b),netId=netA&&netA===netB?netA:netA||netB;if(!netId)continue;if(!groups.has(netId))groups.set(netId,[]);groups.get(netId).push(wire)}
 const nets=(resolution.nets||[]).slice().map(net=>({...net,terminals:(net.terminals||[]).slice().sort()})).sort((a,b)=>String(a.terminals[0]||'').localeCompare(String(b.terminals[0]||'')));
 const presentation=new Map(),diagnostics=[];
 for(const net of nets){const wiresInNet=(groups.get(net.id)||[]).slice().sort((a,b)=>String(a.id||'').localeCompare(String(b.id||'')));if(!wiresInNet.length)continue;
  const labels=[...new Set(wiresInNet.map(w=>String(w.netLabel||'').trim()).filter(Boolean))].sort(),colors=[...new Set(wiresInNet.map(w=>/^#[0-9a-f]{6}$/i.test(w.netColor||'')?w.netColor.toLowerCase():null).filter(Boolean))].sort();
  if(labels.length>1)diagnostics.push({code:'NET_LABEL_CONFLICT',netId:net.id,labels});if(colors.length>1)diagnostics.push({code:'NET_COLOR_CONFLICT',netId:net.id,colors});
  const anchor=net.terminals[0]||net.id,label=labels[0]||labelFor(anchor),color=colors[0]||COLORS[hash(anchor)%COLORS.length];
  for(const wire of wiresInNet)presentation.set(wire.id,{netId:net.id,netLabel:label,netColor:color});
 }
 return {wires:(wires||[]).map(w=>({...w,...(presentation.get(w.id)||{})})),diagnostics};
}
window.VoltProNetLabels={COLORS,decorate,labelFor};
})();
