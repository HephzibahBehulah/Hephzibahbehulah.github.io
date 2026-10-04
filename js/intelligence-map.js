(function(){'use strict';
const B=[
['eng','ENGINEERING','electronics · automation',[
 ['Electronics','circuits · components · measurement','#terminal'],
 ['Automation / OT','PLC · industrial systems · OT security','#terminal'],
 ['Electrical Systems','power · protection · control','#terminal']]],
['web','WEB / CODE','HTML · CSS · JS · Git',[
 ['Web Building','frontend · deployment','#profile-hub'],
 ['Git / GitHub','repositories · version control','https://github.com/HephzibahBehulah'],
 ['JavaScript','browser applications · tooling','#terminal']]],
['data','DATA ANALYTICS','Python · SQL · ML',[
 ['Water Pump ML','machine learning project','https://github.com/HephzibahBehulah/Water-Pump-Status-Prediction-ML'],
 ['Loan Analysis','data analysis project','https://github.com/HephzibahBehulah/ReDI2025_ML_Isaac_Loan_Approval_Project'],
 ['Python / SQL','analysis · modelling','#terminal']]],
['cyber','CYBERSECURITY','networks · Linux · labs',[
 ['Security Notes','networking · Linux · foundations','https://github.com/HephzibahBehulah/Cybersecurity-Study-Notes'],
 ['Terminal','authorised browser learning engine','#terminal'],
 ['Web Security','testing methodology','#terminal']]],
['osint','OSINT','research · verification',[
 ['Public Sources','lawful open-source research','#public-ai-agent'],
 ['Verification','cross-check · provenance','#profile-hub'],
 ['OSINT Framework','source map','https://osintframework.com/']]],
['ai','AI SECURITY','AI · safety · testing',[
 ['Prompt Injection','learning journal','https://github.com/HephzibahBehulah/Prompt-Injection-Learning-Journal'],
 ['Responsible AI','privacy · safe experimentation','#public-ai-agent'],
 ['AI Agent','ask ADIGUN directly','#public-ai-agent']]],
['learn','LEARNING LAB','books · docs · practice',[
 ['Resource Matrix','curated technical sources','#tree'],
 ['Practice','hands-on learning workflows','#terminal'],
 ['Bible Quiz','local quiz engine','#genzBible']]]
];
function E(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function init(){const h=document.getElementById('intelTree');if(!h)return;h.innerHTML='';h.classList.add('map-canvas');
const stage=document.createElement('div');stage.className='intel-map-stage';h.appendChild(stage);
const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.className.baseVal='intel-map-lines';svg.setAttribute('viewBox','0 0 1500 900');stage.appendChild(svg);
const layer=document.createElement('div');layer.className='intel-map-layer';stage.appendChild(layer);
const info=document.getElementById('nodeInfo');let zoom=1,x=0,y=0,drag=false,sx=0,sy=0;const root={x:750,y:45};
function line(a,b,c,d){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d','M '+a+' '+b+' C '+a+' '+(b+55)+', '+c+' '+(d-55)+', '+c+' '+d);p.classList.add('map-connection');svg.appendChild(p);}
function say(t,d,e){if(info)info.innerHTML='<b>'+E(t)+'</b><span>'+E(d)+(e?' · '+E(e):'')+'</span>';}
function go(url,t,d){say(t,d,'opening connected destination');if(!url)return;if(url[0]==='#'){const z=document.querySelector(url);if(z)z.scrollIntoView({behavior:'smooth',block:'start'});}else window.open(url,'_blank','noopener,noreferrer');}
B.forEach((b,i)=>{const bx=120+i*210,by=275;line(root.x,root.y+60,bx+85,by);const n=document.createElement('button');n.className='map-node '+b[0];n.style.left=(bx+85)+'px';n.style.top=by+'px';n.innerHTML=E(b[1])+'<small>'+E(b[2])+'</small>';n.onclick=()=>say(b[1],b[2],'click a leaf to open its destination');layer.appendChild(n);b[3].forEach((c,j)=>{const ly=by+140+j*105;line(bx+85,by+62,bx+85,ly);const q=document.createElement('button');q.className='map-leaf '+b[0];q.style.left=(bx+85)+'px';q.style.top=ly+'px';q.innerHTML=E(c[0])+'<small>'+E(c[1])+'</small>';q.onclick=()=>go(c[2],c[0],c[1]);layer.appendChild(q);});});
const r=document.createElement('button');r.className='map-node map-root';r.style.left=root.x+'px';r.style.top=root.y+'px';r.innerHTML='HB / CORE<small>systems thinker</small>';r.onclick=()=>say('HB / CORE','Public intelligence map. Explore a branch, then open the connected resource.','');layer.appendChild(r);
function apply(){stage.style.transform='translate('+x+'px,'+y+'px) scale('+zoom+')';}
function reset(){zoom=1;x=0;y=0;apply();say('CORE','Drag to pan, scroll to zoom, click a branch to inspect it, or click a leaf to open its destination.','');}
h.onwheel=e=>{e.preventDefault();zoom=Math.max(.55,Math.min(1.45,zoom*(e.deltaY<0?1.08:.92)));apply();};
h.onpointerdown=e=>{if(e.target.closest('button'))return;drag=true;sx=e.clientX-x;sy=e.clientY-y;h.setPointerCapture(e.pointerId);h.classList.add('dragging');};
h.onpointermove=e=>{if(drag){x=e.clientX-sx;y=e.clientY-sy;apply();}};
h.onpointerup=()=>{drag=false;h.classList.remove('dragging');};
document.getElementById('resetTree')?.addEventListener('click',reset);reset();}
document.addEventListener('DOMContentLoaded',init);})();