(()=>{"use strict";
const H=window.CYBER_HUB||{};
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const norm=x=>Array.isArray(x)?x.join(" ").toLowerCase():JSON.stringify(x||"").toLowerCase();
const records=()=>[
 ...(H.networkTools||[]).map(x=>({type:"network tool",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.protocols||[]).map(x=>({type:"protocol",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.windowsCommands||[]).map(x=>({type:"Windows command",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.linuxCommands||[]).map(x=>({type:"Linux command",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.shortcuts||[]).map(x=>({type:"shortcut",name:Array.isArray(x)?x[1]||x[0]:x.name,data:x})),
 ...(H.powerTricks||[]).map(x=>({type:"power trick",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.suspicious||[]).map(x=>({type:"detection",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.hackerTypes||[]).map(x=>({type:"actor",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.teams||[]).map(x=>({type:"security team",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.platforms||[]).map(x=>({type:"platform",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.electronics||[]).map(x=>({type:"electronics",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.docs||[]).map(x=>({type:"documentation",name:Array.isArray(x)?x[0]:x.name,data:x})),
 ...(H.formulas||[]).map(x=>({type:"formula",name:Array.isArray(x)?x[1]:x.name,data:x})),
 ...(H.powershell||[]).map(x=>({type:"PowerShell",name:x.name||x.command,data:x})),
 ...(H.externalRecords||[]).map(x=>({type:x.category||"external",name:x.name||x.title,data:x}))
];
function related(q){
 const needle=String(q||"").toLowerCase().trim(); if(!needle)return [];
 const all=records(); const hits=all.filter(r=>norm(r.data).includes(needle)).slice(0,20);
 const tokens=new Set(needle.split(/[^a-z0-9+#.-]+/).filter(x=>x.length>2));
 for(const h of hits){for(const r of all){if(h===r)continue;const n=norm(r.data);if([...tokens].some(t=>n.includes(t)))hits.push(r);if(hits.length>=40)break;}if(hits.length>=40)break;}
 return [...new Map(hits.map(r=>[r.type+"|"+r.name,r])).values()].slice(0,40);
}
window.CYBER_GRAPH_ENGINE={records,related,buildLinks(q){
 const rs=related(q);return rs.map((r,i)=>({id:i,type:r.type,name:r.name,record:r.data}));
}};
})();