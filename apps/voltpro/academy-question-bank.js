/* VoltPRo virtual question bank.
 * Adds one million parameterized variants to each existing question section.
 * Questions are generated deterministically on demand; never materialize the full bank.
 * This preserves the existing sidebar and keeps rendering limited to one page.
 */
(function(){
"use strict";
if(window.VoltProMillionBankLoaded)return;
window.VoltProMillionBankLoaded=true;
const PAGE_SIZE=25, VARIANTS_PER_TOPIC=100000, GENERATED_TOTAL=1000000, MAX_SAVED_GENERATED=5000;
const families=[
 {topic:"Ohm's law",level:"Foundation",unit:"A",make(n,a,b,c){const u=a*10,r=b;return {q:"A resistive load is supplied with "+u+" V and has a resistance of "+r+" Ω. What current flows?",v:u/r,why:"Ohm's law: I = U/R = "+u+"/"+r+" = "+fmt(u/r)+" A."};}},
 {topic:"Electrical power",level:"Foundation",unit:"W",make(n,a,b,c){const u=100+a,i=b/10;return {q:"A load operates at "+u+" V and draws "+fmt(i)+" A. Estimate its DC real power.",v:u*i,why:"For a DC load, P = U × I = "+u+" × "+fmt(i)+" = "+fmt(u*i)+" W."};}},
 {topic:"Energy and consumption",level:"Foundation",unit:"kWh",make(n,a,b,c){const p=a/10,t=b/10;return {q:"A "+fmt(p)+" kW load runs for "+fmt(t)+" hours. How much electrical energy is used?",v:p*t,why:"Energy = power × time = "+fmt(p)+" × "+fmt(t)+" = "+fmt(p*t)+" kWh."};}},
 {topic:"Series circuits",level:"Intermediate",unit:"A",make(n,a,b,c){const u=24+c*6,r1=a,r2=b;return {q:"A "+u+" V source feeds "+r1+" Ω and "+r2+" Ω resistors in series. Find the circuit current.",v:u/(r1+r2),why:"Series resistance = "+r1+" + "+r2+" = "+(r1+r2)+" Ω; I = U/R = "+u+"/"+(r1+r2)+" = "+fmt(u/(r1+r2))+" A."};}},
 {topic:"Voltage dividers",level:"Intermediate",unit:"V",make(n,a,b,c){const u=12+c*3,r1=a,r2=b;return {q:"A "+u+" V source feeds "+r1+" Ω and "+r2+" Ω in series. What voltage appears across the "+r2+" Ω resistor?",v:u*r2/(r1+r2),why:"Voltage division: Vout = U × R2/(R1+R2) = "+u+" × "+r2+"/"+(r1+r2)+" = "+fmt(u*r2/(r1+r2))+" V."};}},
 {topic:"Voltage drop",level:"Intermediate",unit:"V",make(n,a,b,c){const i=a/10,r=b/100;return {q:"A simplified circuit carries "+fmt(i)+" A through a loop resistance of "+fmt(r)+" Ω. Estimate the voltage drop.",v:i*r,why:"Using the simplified relation ΔU = I × R: "+fmt(i)+" × "+fmt(r)+" = "+fmt(i*r)+" V. This is not a complete cable-sizing calculation."};}},
 {topic:"Transformer ratios",level:"Intermediate",unit:"V",make(n,a,b,c){const vp=110+a,ratio=2+(b%97);return {q:"An ideal transformer has "+vp+" V at the primary and a primary-to-secondary turns ratio of "+ratio+":1. Estimate secondary voltage.",v:vp/ratio,why:"For an ideal transformer, Vs = Vp × Ns/Np = "+vp+"/"+ratio+" = "+fmt(vp/ratio)+" V. Real selection also requires ratings and application checks."};}},
 {topic:"Three-phase power",level:"Advanced",unit:"kW",make(n,a,b,c){const u=400,i=b/10,pf=0.5+((a+b)%50)/100;return {q:"A balanced three-phase load has "+u+" V line voltage, "+fmt(i)+" A line current and power factor "+fmt(pf)+". Estimate real power in kW.",v:Math.sqrt(3)*u*i*pf/1000,why:"Assuming a balanced sinusoidal load: P = √3 × Uline × Iline × cosφ = √3 × "+u+" × "+fmt(i)+" × "+fmt(pf)+" ≈ "+fmt(Math.sqrt(3)*u*i*pf/1000)+" kW."};}},
 {topic:"Parallel circuits",level:"Intermediate",unit:"Ω",make(n,a,b,c){const r=2+a,count=2+(n%8);return {q:"How many ohms is the equivalent resistance of "+count+" identical "+r+" Ω resistors connected in parallel?",v:r/count,why:"For "+count+" identical resistors in parallel, Req = R/n = "+r+"/"+count+" = "+fmt(r/count)+" Ω."};}},
 {topic:"Motor speed and frequency",level:"Advanced",unit:"rpm",make(n,a,b,c){const f=20+(a%81),p=[2,4,6,8][b%4];return {q:"What is the synchronous speed of an ideal AC motor field at "+f+" Hz with "+p+" poles?",v:120*f/p,why:"Synchronous speed nₛ = 120f/P = 120 × "+f+"/"+p+" = "+fmt(120*f/p)+" rpm. An induction motor's rotor speed is normally lower due to slip."};}}
];
function fmt(n){return Number.isFinite(n)?(Math.round((n+Number.EPSILON)*100)/100).toFixed(2):"0.00";}
function values(n,f){return {a:1+((n*37+f*11)%999),b:1+((n*73+f*17)%97),c:1+((n*19+f*7)%23)};}
function generatedQuestion(kind,f,n){
 const variant=kind==="exam"?(n*37+11)%VARIANTS_PER_TOPIC:n,p=values(variant,f),d=families[f].make(variant,p.a,p.b,p.c),v=Number(fmt(d.v)),step=Math.max(1,Math.abs(v)*0.25);
 let raw=[v,v+step,v+step*2,Math.max(0,v-step)].map(x=>Number(fmt(x)));
 if(new Set(raw).size<4){raw=[v,v+1,v+2,v+3].map(x=>Number(fmt(x)));}
 const correct=(variant+f)%4,options=[];
 for(let j=0;j<4;j++)options.push("≈ "+fmt(raw[(j-correct+4)%4])+" "+families[f].unit);
 return {id:"vpxg-"+(kind==="exam"?"ex":"kc")+"-"+f+"-"+n,topic:families[f].topic,level:families[f].level,q:kind==="exam"?"Assessment scenario: "+d.q+" Select the best calculated result.":d.q,a:options,c:correct,explanation:d.why};
}
const curated={quiz:()=>window.quizzes||[],exam:()=>window.examQuestions||[]};
const filters={quiz:{page:0,topic:"All topics",level:"All levels",search:""},exam:{page:0,topic:"All topics",level:"All levels",search:""}};
function selectedFamilies(k){return families.map((f,i)=>({f,i})).filter(x=>(filters[k].topic==="All topics"||x.f.topic===filters[k].topic)&&(filters[k].level==="All levels"||x.f.level===filters[k].level));}
function filteredCurated(k){return curated[k]().filter(q=>(filters[k].topic==="All topics"||q.topic===filters[k].topic)&&(filters[k].level==="All levels"||q.level===filters[k].level)&&(!filters[k].search||(q.q+" "+q.topic+" "+q.level).toLowerCase().includes(filters[k].search)));}
function totalFor(k){return filteredCurated(k).length+selectedFamilies(k).length*VARIANTS_PER_TOPIC;}
function getAt(k,position){
 const c=filteredCurated(k);if(position<c.length)return c[position];
 let offset=position-c.length,fs=selectedFamilies(k);
 const group=Math.floor(offset/VARIANTS_PER_TOPIC),variant=offset%VARIANTS_PER_TOPIC;
 return generatedQuestion(k,fs[group].i,variant);
}
function card(q,index,k,answers){
 const answered=answers[q.id]!==undefined;
 return '<article class="quiz-card vpx-million-question" data-topic="'+esc(q.topic||"Core")+'" data-level="'+esc(q.level||"Foundation")+'" data-search="'+esc((q.q+" "+(q.topic||"")).toLowerCase())+'"><span class="pill">'+esc(q.topic||"Core")+' · '+esc(q.level||"Foundation")+(q.id.startsWith("vpxg-")?' · Generated variant':'')+'</span><p>'+index+'. '+esc(q.q)+'</p><div class="answers">'+q.a.map((a,j)=>'<button class="answer '+(answered?(j===q.c?"correct":j===answers[q.id]?"wrong":""):"")+'" '+(answered?"disabled":"")+' onclick="vpxMillionAnswer(\''+k+'\',\''+q.id+'\','+j+')">'+String.fromCharCode(65+j)+'. '+esc(a)+'</button>').join("")+'</div>'+(answered?'<div class="result"><b>'+(answers[q.id]===q.c?"Correct":"Review this answer")+'.</b> '+esc(q.explanation||"Review the related lesson and retry a similar problem.")+'</div>':"")+'</article>';
}
function pageHtml(k){
 const f=filters[k],items=filteredCurated(k),familiesNow=selectedFamilies(k),total=items.length+familiesNow.length*VARIANTS_PER_TOPIC,pages=Math.max(1,Math.ceil(total/PAGE_SIZE));
 f.page=Math.min(f.page,pages-1);
 const answers=k==="quiz"?(state.quiz||{}):(state.exam||{}),start=f.page*PAGE_SIZE;
 let html="";
 for(let i=start;i<Math.min(total,start+PAGE_SIZE);i++){
  if(f.search){
   const q=getAt(k,i);
   if((q.q+" "+q.topic+" "+q.level).toLowerCase().includes(f.search))html+=card(q,i+1,k,answers);
  }else html+=card(getAt(k,i),i+1,k,answers);
 }
 if(!html)html='<p class="muted">No matching questions on this page. Clear the search or move to another page.</p>';
 const topicOptions=["All topics",...new Set([...curated[k]().map(q=>q.topic||"Core"),...families.map(x=>x.topic)])];
 const levelOptions=["All levels","Beginner","Foundation","Intermediate","Advanced","Professional"];
 return '<section class="card"><div class="calc"><div class="field"><label for="vpx'+k+'Topic">Topic</label><select id="vpx'+k+'Topic" onchange="vpxMillionFilter(\''+k+'\',\'topic\',this.value)">'+topicOptions.map(t=>'<option '+(f.topic===t?'selected':'')+'>'+esc(t)+'</option>').join("")+'</select></div><div class="field"><label for="vpx'+k+'Level">Level</label><select id="vpx'+k+'Level" onchange="vpxMillionFilter(\''+k+'\',\'level\',this.value)">'+levelOptions.map(t=>'<option '+(f.level===t?'selected':'')+'>'+esc(t)+'</option>').join("")+'</select></div><div class="field"><label for="vpx'+k+'Search">Search current page</label><input id="vpx'+k+'Search" value="'+esc(f.search)+'" oninput="vpxMillionFilter(\''+k+'\',\'search\',this.value)" placeholder="Search visible questions"></div></div><p class="muted">Question pool: '+total.toLocaleString()+' available for these filters. '+familiesNow.length.toLocaleString()+' generated topic banks × '+VARIANTS_PER_TOPIC.toLocaleString()+' parameterized variants each. Only 25 questions are rendered at a time. Generated variants are practice drills, not individually authored or officially validated exam items.</p><div id="vpx'+k+'List">'+html+'</div><div class="calc" style="align-items:center;justify-content:space-between;margin-top:16px"><button class="btn secondary" '+(f.page===0?'disabled':'')+' onclick="vpxMillionGo(\''+k+'\','+(f.page-1)+')">← Previous</button><span class="muted">Page '+(f.page+1).toLocaleString()+' of '+pages.toLocaleString()+'</span><button class="btn primary" '+(f.page>=pages-1?'disabled':'')+' onclick="vpxMillionGo(\''+k+'\','+(f.page+1)+')">Next →</button></div><p class="muted">For browser stability, up to '+MAX_SAVED_GENERATED.toLocaleString()+' generated answers per section are retained locally; curated answers continue to use the existing progress storage.</p></section>';
}
function renderQuiz(){
 const answers=state.quiz||{},count=Object.keys(answers).length;
 const h='<div class="hero" style="margin-bottom:18px"><div><span class="eyebrow">KNOWLEDGE CHECKS · EXPANDED QUESTION BANK</span><h2>Prüfe dein Wissen.</h2><p>Practice by topic and level. Curated questions are followed by deterministic, parameterized calculation variants.</p></div><div class="stat"><small>Recorded answers</small><strong>'+count.toLocaleString()+'</strong></div></div>'+pageHtml("quiz");
 layout("Knowledge Checks",h);
}
function renderExam(){
 const answers=state.exam||{},count=Object.keys(answers).length;
 const h='<div class="hero" style="margin-bottom:18px"><div><span class="eyebrow">EXAM PRACTICE · ORIGINAL PRACTICE, NOT AN OFFICIAL EXAM</span><h2>Exam-style practice</h2><p>Use the generated calculation drills to practise methods, then verify formal exam requirements using current official guidance.</p></div><div class="stat"><small>Recorded answers</small><strong>'+count.toLocaleString()+'</strong></div></div>'+pageHtml("exam")+'<div class="safety-gate"><b>Assessment note</b><p>Generated questions are parameterized practice drills, not individually authored or officially validated IHK/HWK questions, exam papers, qualification evidence or certification.</p></div>';
 layout("Exam Practice",h);
}
window.vpxMillionFilter=function(k,which,value){filters[k][which]=value;if(which!=="search")filters[k].page=0; k==="quiz"?renderQuiz():renderExam();};
window.vpxMillionGo=function(k,page){filters[k].page=Math.max(0,page);k==="quiz"?renderQuiz():renderExam();};
window.vpxMillionAnswer=function(k,id,n){
 const answersKey=k==="quiz"?"quiz":"exam";state[answersKey]=state[answersKey]||{};if(state[answersKey][id]!==undefined)return;
 state[answersKey][id]=n;
 const ids=Object.keys(state[answersKey]).filter(x=>x.startsWith("vpxg-"));
 if(ids.length>MAX_SAVED_GENERATED){for(const old of ids.slice(0,ids.length-MAX_SAVED_GENERATED))delete state[answersKey][old];}
 save();k==="quiz"?renderQuiz():renderExam();
};
window.quiz=renderQuiz;
window.expandedExam=renderExam;
})();
