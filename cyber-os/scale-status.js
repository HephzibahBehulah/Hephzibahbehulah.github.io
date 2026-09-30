(()=>{"use strict";
const H=window.CYBER_HUB||{};
const count=a=>Array.isArray(a)?a.length:0;
window.CYBER_SCALE_STATUS={get(){
 const loaded={
  ports:count(H.protocols),protocols:count(H.protocols),networkTools:count(H.networkTools),
  windowsCommands:count(H.windowsCommands),powershell:count(H.powershell),linuxCommands:count(H.linuxCommands),
  shortcuts:count(H.shortcuts),powerTricks:count(H.powerTricks),suspiciousCommands:count(H.suspicious),
  engineeringFormulas:count(H.formulas),teams:count(H.teams),hackerTypes:count(H.hackerTypes),
  electronics:count(H.electronics),documentation:count(H.docs),externalRecords:count(H.externalRecords)
 };
 const targets=H.targets||{};
 return Object.fromEntries(Object.entries({...targets,powershell:10000}).map(([k,target])=>[k,{target,loaded:loaded[k]??0,remaining:typeof target==="number"?Math.max(target-(loaded[k]??0),0):null}]));
}};
function render(){
 const box=document.getElementById("scaleStatus");if(!box)return;
 const s=window.CYBER_SCALE_STATUS.get();
 box.innerHTML=Object.entries(s).map(([k,v])=>'<article class="cyber-card"><span class="tag">SCALE</span><h3>'+k.replace(/([A-Z])/g," $1").toUpperCase()+'</h3><p><b>'+Number(v.loaded).toLocaleString()+'</b> loaded · target '+String(v.target).replace(/\B(?=(\d{3})+(?!\d))/g,",")+'</p><p>'+((v.remaining===null)?"Derived from source data":Number(v.remaining).toLocaleString()+" remaining to target")+'</p></article>').join("");
}
document.addEventListener("DOMContentLoaded",render);
document.addEventListener("cyber:catalogs-loaded",render);
})();