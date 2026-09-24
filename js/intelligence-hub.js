/* HB INTELLIGENCE HUB v2 — original UI, external indexes, local calculators */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const OSINT_JSON='https://raw.githubusercontent.com/lockfale/OSINT-Framework/master/public/arf.json';
  const EBOOK_API='https://api.github.com/repos/HephzibahBehulah/Hacking-Security-Ebooks/contents/';
  let osint=[], docs=[], pdfs=[], osintCat='all', docCat='all';

  const docSources = [
    ['Cybersecurity','CISA Cybersecurity Resources','https://www.cisa.gov/resources-tools/resources','official security guidance'],
    ['Cybersecurity','NIST Cybersecurity Framework','https://www.nist.gov/cyberframework','risk and security framework'],
    ['Cybersecurity','OWASP Web Security Testing Guide','https://owasp.org/www-project-web-security-testing-guide/','web testing methodology'],
    ['Cybersecurity','OWASP Cheat Sheet Series','https://cheatsheetseries.owasp.org/','secure development references'],
    ['Cybersecurity','MITRE ATT&CK','https://attack.mitre.org/','threat behaviour knowledge base'],
    ['Cybersecurity','MITRE D3FEND','https://d3fend.mitre.org/','defensive technique knowledge base'],
    ['Networking','RFC Editor','https://www.rfc-editor.org/','Internet protocol specifications'],
    ['Networking','Wireshark Documentation','https://www.wireshark.org/docs/','packet analysis reference'],
    ['Networking','Nmap Reference Guide','https://nmap.org/book/man.html','network discovery reference'],
    ['Networking','Cloudflare Learning Center','https://www.cloudflare.com/learning/','DNS HTTP networking security'],
    ['Linux','Linux Kernel Documentation','https://docs.kernel.org/','kernel and systems documentation'],
    ['Linux','GNU Bash Reference','https://www.gnu.org/software/bash/manual/','shell reference'],
    ['Linux','OpenSSH Manual Pages','https://man.openbsd.org/ssh','SSH reference'],
    ['Data / Python','Python Documentation','https://docs.python.org/3/','language reference'],
    ['Data / Python','pandas Documentation','https://pandas.pydata.org/docs/','data analysis reference'],
    ['Data / Python','NumPy Documentation','https://numpy.org/doc/','numerical computing'],
    ['Data / Python','scikit-learn User Guide','https://scikit-learn.org/stable/user_guide.html','machine learning'],
    ['Engineering','Engineering Toolbox','https://www.engineeringtoolbox.com/','engineering reference'],
    ['Engineering','NIST Engineering Statistics','https://www.nist.gov/itl/sed/statistical-engineering','engineering statistics'],
    ['Electronics','All About Circuits Textbook','https://www.allaboutcircuits.com/textbook/','electronics learning'],
    ['Electronics','Arduino Documentation','https://docs.arduino.cc/','embedded electronics'],
    ['Electronics','VDE','https://www.vde.com/en','German electrical engineering'],
    ['Industrial / OT','CISA ICS','https://www.cisa.gov/topics/industrial-control-systems','ICS security'],
    ['Industrial / OT','NIST SP 800-82','https://csrc.nist.gov/pubs/sp/800/82/r3/final','OT security'],
    ['Industrial / OT','MITRE ATT&CK for ICS','https://attack.mitre.org/matrices/ics/','ICS threat knowledge'],
    ['Industrial / OT','Siemens Industry Support','https://support.industry.siemens.com/','industrial documentation'],
    ['Learning','MIT OpenCourseWare','https://ocw.mit.edu/','open courses'],
    ['Learning','TryHackMe','https://tryhackme.com/','security labs'],
    ['Learning','picoCTF','https://picoctf.org/','security practice'],
    ['Learning','OverTheWire','https://overthewire.org/wargames/','security wargames']
  ];

  const bookChapters={Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalms:150,Proverbs:31,Ecclesiastes:12,'Song of Solomon':8,Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,Hosea:14,Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,'1 Corinthians':16,'2 Corinthians':13,Galatians:6,Ephesians:6,Philippians:4,Colossians:4,'1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,Titus:3,Philemon:1,Hebrews:13,James:5,'1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,Jude:1,Revelation:22};
  const books=Object.entries(bookChapters).map(([name,chapters],i)=>({name,chapters,testament:i<39?'Old Testament':'New Testament',index:i+1}));
  const totalChapters=books.reduce((a,b)=>a+b.chapters,0);

  function normalizeOSINT(node,cat='OSINT Framework',out=[]){
    if(!node) return out;
    if(Array.isArray(node)){node.forEach(x=>normalizeOSINT(x,cat,out));return out;}
    if(typeof node==='string') return out;
    const name=node.name||node.title||node.label||node.text;
    const url=node.url||node.href||node.link;
    const nextCat=name && (!url || node.children || node.nodes || node.items) ? name : cat;
    if(name && url && /^https?:/i.test(url)) out.push({name,category:cat,url,description:node.description||'External OSINT resource indexed from the OSINT Framework dataset.'});
    for(const key of ['children','nodes','items','tools','links']) if(node[key]) normalizeOSINT(node[key],nextCat,out);
    return out;
  }

  function renderOSINT(q=''){
    const grid=$('#megaToolGrid');if(!grid)return;
    const query=q.toLowerCase().trim();
    const list=osint.filter(x=>(osintCat==='all'||x.category===osintCat)&&(!query||(x.name+' '+x.category+' '+x.description).toLowerCase().includes(query)));
    grid.innerHTML=list.slice(0,800).map(x=>'<a class="intel-card" target="_blank" rel="noopener noreferrer" href="'+esc(x.url)+'"><span class="intel-code">'+esc(x.category)+'</span><h3>'+esc(x.name)+' ↗</h3><p>'+esc(x.description)+'</p><span class="intel-open">OPEN ORIGINAL</span></a>').join('')||'<div class="intel-empty">NO TOOL MATCHES</div>';
    $('#megaToolCount').textContent=osint.length.toLocaleString()+' indexed tools';
  }
  function setupOSINT(){
    const select=$('#megaToolCategory');if(!select)return;
    const cats=[...new Set(osint.map(x=>x.category).filter(Boolean))].sort();
    select.innerHTML='<option value="all">ALL CATEGORIES</option>'+cats.map(c=>'<option value="'+esc(c)+'">'+esc(c.toUpperCase())+'</option>').join('');
    select.onchange=()=>{osintCat=select.value;renderOSINT($('#megaToolSearch').value)};
    $('#megaToolSearch').oninput=e=>renderOSINT(e.target.value);
    $('#megaToolRefresh').onclick=loadOSINT;
  }
  async function loadOSINT(){
    const grid=$('#megaToolGrid');if(!grid)return;
    grid.innerHTML='<div class="intel-empty">FETCHING OSINT FRAMEWORK DATA...</div>';
    try{const r=await fetch(OSINT_JSON,{cache:'no-store'});if(!r.ok)throw new Error(r.status);const data=await r.json();osint=normalizeOSINT(data);if(!osint.length)throw new Error('No records parsed');setupOSINT();renderOSINT($('#megaToolSearch').value)}catch(e){grid.innerHTML='<div class="intel-empty">OSINT DATA COULD NOT BE LOADED. <a href="https://osintframework.com/" target="_blank" rel="noopener">OPEN OSINT FRAMEWORK ↗</a></div>';$('#megaToolCount').textContent='external index unavailable';}
  }

  function renderDocs(q=''){
    const grid=$('#docGrid');if(!grid)return;const query=q.toLowerCase().trim();
    const list=docs.filter(x=>(docCat==='all'||x[0]===docCat)&&(!query||(x[0]+' '+x[1]+' '+x[3]).toLowerCase().includes(query)));
    grid.innerHTML=list.map(x=>'<a class="intel-card" href="'+x[2]+'" target="_blank" rel="noopener noreferrer"><span class="intel-code">'+esc(x[0])+'</span><h3>'+esc(x[1])+' ↗</h3><p>'+esc(x[3])+'</p><span class="intel-open">SOURCE / DOCUMENTATION</span></a>').join('');
    $('#docIndexCount').textContent=list.length+' source collections';
  }
  function setupDocs(){docs=docSources;const s=$('#docCategory');s.innerHTML='<option value="all">ALL DOMAINS</option>'+[...new Set(docs.map(x=>x[0]))].map(x=>'<option>'+esc(x)+'</option>').join('');s.onchange=()=>{docCat=s.value;renderDocs($('#docSearch').value)};$('#docSearch').oninput=e=>renderDocs(e.target.value);renderDocs();}

  const calcDefs=[
    ['Ohm’s Law','Electrical',['Voltage (V)','Current (A)','Resistance (Ω)'],(v)=>{let [V,I,R]=v.map(Number);if(!V&&I&&R)V=I*R;else if(!I&&V&&R)I=V/R;else if(!R&&V&&I)R=V/I;return 'V='+fmt(V)+' V · I='+fmt(I)+' A · R='+fmt(R)+' Ω'}],
    ['Voltage Divider','Electrical',['Vin (V)','R1 (Ω)','R2 (Ω)'],([vin,r1,r2])=>'Vout = '+fmt(vin*r2/(r1+r2))+' V'],
    ['Power / Energy','Electrical',['Voltage (V)','Current (A)','Time (h)'],([v,i,t])=>'P = '+fmt(v*i)+' W · E = '+fmt(v*i*t)+' Wh'],
    ['Series Resistance','Electronics',['R1 (Ω)','R2 (Ω)','R3 (Ω)'],([a,b,c])=>'Rtotal = '+fmt(a+b+c)+' Ω'],
    ['Parallel Resistance','Electronics',['R1 (Ω)','R2 (Ω)','R3 (Ω)'],([a,b,c])=>'Rtotal = '+fmt(1/(1/a+1/b+1/c))+' Ω'],
    ['Percentage','Data',['Value','Total'],([a,b])=>fmt(a/b*100)+' %'],
    ['Percentage Change','Data',['Old','New'],([a,b])=>fmt((b-a)/a*100)+' %'],
    ['Difference / Ratio','Data',['A','B'],([a,b])=>'Difference = '+fmt(a-b)+' · Ratio = '+fmt(a/b)],
    ['Binary / Hex / Decimal','Computing',['Decimal integer'],([a])=>'BIN '+(a>>>0).toString(2)+' · HEX '+(a>>>0).toString(16).toUpperCase()+' · DEC '+(a>>>0)],
    ['IPv4 CIDR','Networking',['IPv4 address','CIDR prefix'],([ip,prefix])=>cidr(ip,Number(prefix))],
    ['Resistor Bands','Electronics',['Band 1','Band 2','Multiplier'],([a,b,m])=>resistor(a,b,m)],
    ['Engineering Rate','Engineering',['Quantity','Time'],([q,t])=>'Rate = '+fmt(q/t)+' units/time'],
    ['Frequency / Period','Electronics',['Frequency (Hz)'],([f])=>'Period = '+fmt(1/f)+' s'],
    ['Wavelength','Engineering',['Frequency (Hz)'],([f])=>'λ = '+fmt(299792458/f)+' m'],
    ['Temperature °C ↔ °F','Engineering',['Value','Direction'],([v,d])=>d==='F→C'?fmt((v-32)*5/9)+' °C':fmt(v*9/5+32)+' °F'],
    ['Torque','Engineering',['Force (N)','Radius (m)'],([f,r])=>'Torque = '+fmt(f*r)+' N·m'],
    ['Mechanical Power','Engineering',['Torque (N·m)','RPM'],([t,rpm])=>'Power = '+fmt(t*rpm*2*Math.PI/60)+' W'],
    ['Pressure','Engineering',['Force (N)','Area (m²)'],([f,a])=>'Pressure = '+fmt(f/a)+' Pa'],
    ['Flow Rate','Engineering',['Volume (L)','Time (min)'],([v,t])=>'Flow = '+fmt(v/t)+' L/min'],
    ['Voltage Drop','Electrical',['Current (A)','Resistance (Ω)'],([i,r])=>'Drop = '+fmt(i*r)+' V'],
    ['Cable Power Loss','Electrical',['Current (A)','Resistance (Ω)'],([i,r])=>'Loss = '+fmt(i*i*r)+' W']
  ];
  function fmt(n){return Number.isFinite(n)?Number(n).toLocaleString(undefined,{maximumFractionDigits:6}):'—'}
  function cidr(ip,p){const a=String(ip).split('.').map(Number);if(a.length!==4||a.some(x=>x<0||x>255)||p<0||p>32)return'Invalid IPv4/CIDR';const n=a.reduce((x,y)=>(x*256+y)>>>0,0),mask=p===0?0:(0xffffffff<<(32-p))>>>0,net=(n&mask)>>>0,broadcast=(net|(~mask>>>0))>>>0;const f=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join('.');const hosts=p>=31?2**(32-p):Math.max(0,2**(32-p)-2);return'Network '+f(net)+' · Broadcast '+f(broadcast)+' · Mask '+f(mask)+' · Hosts '+hosts.toLocaleString()}
  const bandMap={black:0,brown:1,red:2,orange:3,yellow:4,green:5,blue:6,violet:7,grey:8,white:9};function resistor(a,b,m){const A=bandMap[String(a).toLowerCase()],B=bandMap[String(b).toLowerCase()],M=bandMap[String(m).toLowerCase()];if(A==null||B==null||M==null)return'Use colour names: black brown red orange yellow green blue violet grey white';return'R = '+fmt((A*10+B)*Math.pow(10,M))+' Ω'}

  function renderCalcs(){const g=$('#engineeringGrid');if(!g)return;g.innerHTML=calcDefs.map((c,i)=>'<article class="engineering-card"><div class="intel-code">'+esc(c[1])+'</div><h3>'+esc(c[0])+'</h3><p>Runs locally in your browser. No value is uploaded.</p><div class="field">'+c[2].map((x,j)=>'<input id="calc-'+i+'-'+j+'" '+(x.includes('Direction')?'value="C→F"':'')+' placeholder="'+esc(x)+'">').join('')+'</div><button class="os-btn primary" data-calc="'+i+'">CALCULATE</button><div class="calc-output" id="out-'+i+'">—</div></article>').join('');g.querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=+b.dataset.calc,c=calcDefs[i],vals=c[2].map((_,j)=>$('#calc-'+i+'-'+j).value.trim());try{$('#out-'+i).textContent=c[3](vals.map(v=>v===''?NaN:(/^[-+]?\d*\.?\d+$/.test(v)?Number(v):v)))}catch(e){$('#out-'+i).textContent='Check the inputs.'}})}

  // A generated quiz space: 1,000,000+ possible question instances without storing a million records.
  let score=0,streak=0,current=null,answered=false;
  const templates=[
    b=>({q:'How many chapters are in '+b.name+'?',a:String(b.chapters),pool:[String(b.chapters),String(Math.max(1,b.chapters-1)),String(b.chapters+1),String(Math.max(1,b.chapters+5))]}),
    b=>({q:b.name+' belongs to which testament?',a:b.testament,pool:[b.testament,b.testament==='Old Testament'?'New Testament':'Old Testament','Apocrypha','Both']}),
    b=>({q:'What is the canonical book number of '+b.name+'?',a:String(b.index),pool:[String(b.index),String(Math.max(1,b.index-1)),String(b.index+1),String((b.index+10)%66+1)]}),
    b=>({q:'Which book has '+b.chapters+' chapter(s)?',a:b.name,pool:[b.name,books[Math.floor(Math.random()*books.length)].name,books[Math.floor(Math.random()*books.length)].name,books[Math.floor(Math.random()*books.length)].name]})
  ];
  function nextQuiz(){answered=false;const b=books[Math.floor(Math.random()*books.length)];const t=templates[Math.floor(Math.random()*templates.length)];current=t(b);const pool=[...new Set(current.pool)];while(pool.length<4){pool.push(books[Math.floor(Math.random()*books.length)].name)}pool.sort(()=>Math.random()-.5);$('#quizQuestion').textContent=current.q;$('#quizOptions').innerHTML=pool.map(x=>'<button class="quiz-option" data-answer="'+esc(x)+'">'+esc(x)+'</button>').join('');$('#quizFeedback').textContent='';$('#quizOptions').querySelectorAll('button').forEach(x=>x.onclick=()=>answerQuiz(x.dataset.answer,x))}
  function answerQuiz(ans,el){if(answered)return;answered=true;if(ans===current.a){score++;streak++;el.classList.add('correct');$('#quizFeedback').textContent='CORRECT · '+current.a}else{streak=0;el.classList.add('wrong');$('#quizFeedback').textContent='ANSWER · '+current.a}$('#quizScore').textContent='score: '+score;$('#quizStreak').textContent='streak: '+streak}
  function setupQuiz(){$('#quizNext')?.addEventListener('click',nextQuiz);$('#quizShowAnswer')?.addEventListener('click',()=>{$('#quizFeedback').textContent='ANSWER · '+(current?.a||'Start the quiz first.')})}

  async function loadPDFs(){try{const r=await fetch(EBOOK_API,{headers:{Accept:'application/vnd.github+json'}});const d=await r.json();pdfs=d.filter(x=>x.type==='file'&&/\.pdf$/i.test(x.name));const total=$('#pdfTotal');if(total)total.textContent=pdfs.length;const count=$('#ebookCount');if(count)count.textContent=pdfs.length+' indexed PDFs';}catch(e){}}

  document.addEventListener('DOMContentLoaded',()=>{setupDocs();renderCalcs();setupQuiz();loadOSINT();loadPDFs();});
})();