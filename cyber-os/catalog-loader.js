(()=>{"use strict";
const H=window.CYBER_HUB||{};
const sources=[
 ["mitre","data/generated/mitre-enterprise.json","external"],
 ["windows","data/generated/windows-commands.json","windowsCommands"],
 ["powershell","data/generated/powershell.json","powershell"],
 ["linux","data/generated/linux-manpages.json","linuxCommands"],
 ["rfc","data/generated/rfc-index.json","docs"]
];
function merge(key,records){
 if(!Array.isArray(records)||!records.length)return;
 H.externalRecords=[...(H.externalRecords||[]),...records];
 if(key==="windowsCommands")H.windowsCommands=[...(H.windowsCommands||[]),...records.map(x=>[x.name,x.summary,x.sourceUrl])];
 if(key==="linuxCommands")H.linuxCommands=[...(H.linuxCommands||[]),...records.map(x=>[x.name,x.summary,x.sourceUrl])];
 if(key==="docs")H.docs=[...(H.docs||[]),...records.map(x=>[x.name,x.summary,x.sourceUrl])];
 if(key==="powershell")H.powershell=[...(H.powershell||[]),...records];
}
window.CYBER_CATALOGS_READY=(async()=>{
 for(const [name,url,key] of sources){
  try{const r=await fetch(url,{cache:"no-store"});if(r.ok){const p=await r.json();merge(key,p.records)}}catch(e){}
 }
 window.CYBER_HUB=H;
 document.dispatchEvent(new CustomEvent("cyber:catalogs-loaded"));
 return H;
})();
})();