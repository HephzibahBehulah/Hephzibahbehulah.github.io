(function(){'use strict';
const B=[
['ops','OPERATOR','investigate · approve · act',[['Private Operator','authenticated agent','#operator'],['Investigations','live evidence gathering','#intelligence'],['Approval Queue','controlled actions','#security']]],
['intel','INTELLIGENCE','site · edge · GitHub',[['System Checks','run live inspections','#intelligence'],['Website Health','availability and headers','#intelligence'],['GitHub Knowledge','source-backed mirror','#github-knowledge']]],
['security','SECURITY','identity · access · secrets',[['Identity','Cloudflare Access','#security'],['Authorization','server-side checks','#security'],['Secrets','server-side credentials','#security']]],
['knowledge','GITHUB KNOWLEDGE','repositories · learning',[['Knowledge Mirror','indexed source material','#github-knowledge'],['Security Notes','private knowledge surface','#github-knowledge'],['Source Documents','open verified material','#github-knowledge']]],
['terminal','TERMINAL','commands · diagnostics',[['Command Engine','browser command layer','#terminal'],['Self Test','diagnostic checks','#terminal'],['Recon','authorised research tools','#terminal']]],
['tools','PRIVATE TOOLING','workspaces · labs',[['AI Lab','multimodal private AI','/ai-lab.html'],['Recon Hub','passive-first OSINT','/recon-hub.html'],['Engineering Library','technical calculators','/engineering-library.html']]]
];
function E(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function init(){const h=document.getElementById('adminIntelTree');if(!h)return;h.innerHTML='';h.classList.add('admin-map-canvas');
const stage=document.createElement('div');stage.className='admin-map-stage';h.appendChild(stage);
const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1400 820');svg.classList.add('admin-map-lines');stage.appendChild(svg);
const layer=document.createElement('div');layer.className='admin-map-layer';stage.appendChild(layer);
const info=document.getElementById('adminNodeInfo');let zoom=1,x=0,y=0,drag=false,sx=0,sy=0;const root={x:700,y:35};
function line(a,b,c,d){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d','M '+a+' '+b+' C '+a+' '+(b+55)+', '+c+' '+(d-55)+', '+c+' '+d);p.classList.add('admin-map-connection');svg.appendChild(p);}
function say(t,d,e){if(info)info.innerHTML='<b>'+E(t)+'</b><span>'+E(d)+(e?' · '+E(e):'')+'</span>';}
function go(url,t,d){say(t,d,'opening connected destination');if(url[0]==='#'){const z=document.querySelector(url);if(z)z.scrollIntoView({behavior:'smooth',block:'start'});}else window.open(url,'_blank','noopener,noreferrer');}
B.forEach((b,i)=>{const bx=80+i*210,by=255;line(root.x,root.y+58,bx+85,by);const n=document.createElement('button');n.className='admin-map-node '+b[0];n.style.left=(bx+85)+'px';n.style.top=by+'px';n.innerHTML=E(b[1])+'<small>'+E(b[2])+'</small>';n.onclick=()=>say(b[1],b[2],'click a leaf to open its destination');layer.appendChild(n);b[3].forEach((c,j)=>{const ly=by+125+j*92;line(bx+85,by+58,bx+85,ly);const q=document.createElement('button');q.className='admin-map-leaf '+b[0];q.style.left=(bx+85)+'px';q.style.top=ly+'px';q.innerHTML=E(c[0])+'<small>'+E(c[1])+'</small>';q.onclick=()=>go(c[2],c[0],c[1]);layer.appendChild(q);});});
const r=document.createElement('button');r.className='admin-map-node admin-map-root';r.style.left=root.x+'px';r.style.top=root.y+'px';r.innerHTML='ADIGUN CONTROL<small>private operations</small>';r.onclick=()=>say('ADIGUN CONTROL','Private operations map. Every leaf opens a real control surface or workspace.','');layer.appendChild(r);
function apply(){stage.style.transform='translate('+x+'px,'+y+'px) scale('+zoom+')';}
function reset(){zoom=1;x=0;y=0;apply();say('PRIVATE CONTROL','Drag to pan, scroll to zoom, click a branch to inspect it, or click a leaf to open its destination.','');}
h.onwheel=e=>{e.preventDefault();zoom=Math.max(.6,Math.min(1.4,zoom*(e.deltaY<0?1.08:.92)));apply();};
h.onpointerdown=e=>{if(e.target.closest('button'))return;drag=true;sx=e.clientX-x;sy=e.clientY-y;h.setPointerCapture(e.pointerId);};
h.onpointermove=e=>{if(drag){x=e.clientX-sx;y=e.clientY-sy;apply();}};
h.onpointerup=()=>{drag=false;};
document.getElementById('resetAdminTree')?.addEventListener('click',reset);reset();}
document.addEventListener('DOMContentLoaded',init);})();