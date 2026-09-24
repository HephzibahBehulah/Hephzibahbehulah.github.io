/* HB INTELLIGENCE CORE
   Self-contained GitHub Pages runtime.
   Core content renders locally first; remote indexes are optional enhancements.
*/
(() => {
  'use strict';

  const resources = [
    ['OSINT / Research','OSINT Framework','Discovery map for public-source research','https://osintframework.com/'],
    ['OSINT / Research','Internet Archive','Historical web pages and public archives','https://web.archive.org/'],
    ['OSINT / Research','Google Advanced Search','Structured public web searching','https://www.google.com/advanced_search'],
    ['OSINT / Research','crt.sh','Certificate transparency search','https://crt.sh/'],
    ['OSINT / Research','urlscan.io','Public web scan observations','https://urlscan.io/'],
    ['OSINT / Research','Have I Been Pwned','Breach exposure awareness and notification','https://haveibeenpwned.com/'],
    ['OSINT / Research','Bellingcat Online Investigation Toolkit','Open-source investigation resources','https://bellingcat.gitbook.io/toolkit/'],
    ['Web Security','OWASP Top 10','Web application security risk reference','https://owasp.org/www-project-top-ten/'],
    ['Web Security','OWASP WSTG','Web security testing methodology','https://owasp.org/www-project-web-security-testing-guide/'],
    ['Web Security','OWASP Cheat Sheet Series','Secure development guidance','https://cheatsheetseries.owasp.org/'],
    ['Web Security','PortSwigger Web Security Academy','Interactive web security labs','https://portswigger.net/web-security'],
    ['Web Security','MDN Web Docs','HTML CSS JavaScript and web APIs','https://developer.mozilla.org/'],
    ['Cybersecurity','NIST Cybersecurity Framework','Cybersecurity risk management reference','https://www.nist.gov/cyberframework'],
    ['Cybersecurity','CISA Cybersecurity Guides','Public defensive security guidance','https://www.cisa.gov/topics/cybersecurity-best-practices'],
    ['Cybersecurity','MITRE ATT&CK','Adversary tactics and techniques knowledge base','https://attack.mitre.org/'],
    ['Cybersecurity','Kali Linux Tools','Security tool documentation','https://www.kali.org/tools/'],
    ['Cybersecurity','OWASP Juice Shop','Deliberately vulnerable learning application','https://owasp.org/www-project-juice-shop/'],
    ['Networking','Cloudflare Learning Center','Networking and internet concepts','https://www.cloudflare.com/learning/'],
    ['Networking','Cisco Networking Academy','Networking learning resources','https://www.netacad.com/'],
    ['Networking','Wireshark Documentation','Packet analysis reference','https://www.wireshark.org/docs/'],
    ['Networking','RFC Editor','Internet protocol standards and RFCs','https://www.rfc-editor.org/'],
    ['Linux','Linux man-pages','Linux command and system reference','https://man7.org/linux/man-pages/'],
    ['Linux','The Linux Kernel Docs','Kernel documentation','https://docs.kernel.org/'],
    ['Linux','OverTheWire','Command-line and security learning games','https://overthewire.org/wargames/'],
    ['Data / Python','Python Documentation','Official Python language reference','https://docs.python.org/3/'],
    ['Data / Python','pandas Documentation','Data analysis with Python','https://pandas.pydata.org/docs/'],
    ['Data / Python','scikit-learn','Machine learning in Python','https://scikit-learn.org/stable/'],
    ['Data / Python','Kaggle Learn','Practical data and ML lessons','https://www.kaggle.com/learn'],
    ['AI Security','OWASP LLM Top 10','Security risks for large language model applications','https://genai.owasp.org/'],
    ['AI Security','MITRE ATLAS','AI threat knowledge base','https://atlas.mitre.org/'],
    ['Electronics / OT','All About Circuits','Electronics reference and tutorials','https://www.allaboutcircuits.com/'],
    ['Electronics / OT','Electronics Tutorials','Electronics fundamentals and calculators','https://www.electronics-tutorials.ws/'],
    ['Electronics / OT','IEC Webstore','International electrotechnical standards catalogue','https://webstore.iec.ch/'],
    ['Electronics / OT','Siemens Industry Online Support','Industrial automation documentation','https://support.industry.siemens.com/'],
    ['Learning','TryHackMe','Guided cybersecurity learning rooms','https://tryhackme.com/'],
    ['Learning','Hack The Box Academy','Structured cybersecurity training','https://academy.hackthebox.com/'],
    ['Learning','freeCodeCamp','Programming and web development learning','https://www.freecodecamp.org/']
  ];

  const docs = [
    ['Electronics','Ohm’s Law and circuit fundamentals','https://www.allaboutcircuits.com/textbook/direct-current/chpt-2/'],
    ['Electronics','Kirchhoff’s Laws','https://www.allaboutcircuits.com/textbook/direct-current/chpt-6/'],
    ['Electronics','Digital Logic','https://www.allaboutcircuits.com/textbook/digital/'],
    ['Electronics','Electrical Safety','https://www.hse.gov.uk/electricity/'],
    ['Automation / OT','PLC Basics','https://www.plcacademy.com/'],
    ['Automation / OT','Siemens S7 documentation','https://support.industry.siemens.com/cs/'],
    ['Networking','RFC Index','https://www.rfc-editor.org/rfc-index.html'],
    ['Networking','TCP/IP Guide','https://www.rfc-editor.org/'],
    ['Networking','Wireshark User Guide','https://www.wireshark.org/docs/wsug_html/'],
    ['Cybersecurity','NIST CSF','https://www.nist.gov/cyberframework'],
    ['Cybersecurity','MITRE ATT&CK','https://attack.mitre.org/'],
    ['Cybersecurity','OWASP WSTG','https://owasp.org/www-project-web-security-testing-guide/'],
    ['Cybersecurity','OWASP Cheat Sheets','https://cheatsheetseries.owasp.org/'],
    ['Linux','Linux man-pages','https://man7.org/linux/man-pages/'],
    ['Linux','Linux Kernel documentation','https://docs.kernel.org/'],
    ['Python','Python 3 documentation','https://docs.python.org/3/'],
    ['Python','pandas user guide','https://pandas.pydata.org/docs/user_guide/'],
    ['Python','scikit-learn user guide','https://scikit-learn.org/stable/user_guide.html'],
    ['AI Security','OWASP GenAI Security Project','https://genai.owasp.org/'],
    ['AI Security','MITRE ATLAS','https://atlas.mitre.org/']
  ];

  const tools = [
    ['Ohm’s Law','V = I × R','Electronics','ohm'],
    ['Power','P = V × I','Electronics','power'],
    ['Energy','E = P × t','Electronics','energy'],
    ['Voltage Divider','Vout = Vin × R2 / (R1 + R2)','Electronics','divider'],
    ['Series Resistance','Rtotal = R1 + R2 + …','Electronics','series'],
    ['Parallel Resistance','1/Rt = 1/R1 + 1/R2 + …','Electronics','parallel'],
    ['Current from Power','I = P / V','Electronics','current'],
    ['Resistance from Power','R = V² / P','Electronics','resistance'],
    ['Frequency / Period','f = 1 / T','Signals','frequency'],
    ['Wavelength','λ = c / f','Signals','wavelength'],
    ['dBm → mW','mW = 10^(dBm/10)','Networking','dbm'],
    ['mW → dBm','dBm = 10 log10(mW)','Networking','mw'],
    ['CIDR IPv4','Calculate hosts and range','Networking','cidr'],
    ['Subnet Hosts','2^hostBits − 2','Networking','hosts'],
    ['Binary → Decimal','Base conversion','Computing','bin'],
    ['Hex → Decimal','Base conversion','Computing','hex'],
    ['Decimal → Binary','Base conversion','Computing','decbin'],
    ['Decimal → Hex','Base conversion','Computing','dechex'],
    ['Bytes → KB / MB','Storage conversion','Computing','bytes'],
    ['Celsius → Fahrenheit','Temperature conversion','Engineering','temp']
  ];

  const megaFallback = [
    ['OSINT Framework','OSINT','https://osintframework.com/'],
    ['Google Search','Search','https://www.google.com/'],
    ['crt.sh','Certificates','https://crt.sh/'],
    ['urlscan.io','Web intelligence','https://urlscan.io/'],
    ['VirusTotal','Threat intelligence','https://www.virustotal.com/'],
    ['Have I Been Pwned','Breach awareness','https://haveibeenpwned.com/'],
    ['Wayback Machine','Archives','https://web.archive.org/'],
    ['Shodan','Internet exposure research','https://www.shodan.io/'],
    ['Censys','Internet asset research','https://search.censys.io/'],
    ['OWASP ZAP','Web security','https://www.zaproxy.org/'],
    ['Burp Suite','Web security','https://portswigger.net/burp'],
    ['PortSwigger Academy','Web labs','https://portswigger.net/web-security'],
    ['Nmap','Network discovery','https://nmap.org/'],
    ['Wireshark','Packet analysis','https://www.wireshark.org/'],
    ['Metasploit','Security testing framework','https://www.metasploit.com/'],
    ['CyberChef','Data transformation','https://gchq.github.io/CyberChef/'],
    ['ExifTool','Metadata research','https://exiftool.org/'],
    ['Maltego','Link analysis','https://www.maltego.com/'],
    ['Amass','Attack surface mapping','https://github.com/owasp-amass/amass'],
    ['theHarvester','OSINT collection','https://github.com/laramies/theHarvester'],
    ['Subfinder','Subdomain discovery','https://github.com/projectdiscovery/subfinder'],
    ['httpx','HTTP probing','https://github.com/projectdiscovery/httpx'],
    ['Sublist3r','Subdomain enumeration','https://github.com/aboul3la/Sublist3r'],
    ['Nikto','Web server assessment','https://github.com/sullo/nikto'],
    ['SQLMap','SQL injection testing','https://sqlmap.org/'],
    ['John the Ripper','Password auditing','https://www.openwall.com/john/'],
    ['Hashcat','Password recovery research','https://hashcat.net/hashcat/'],
    ['Gobuster','Content discovery','https://github.com/OJ/gobuster'],
    ['FFUF','Web fuzzing','https://github.com/ffuf/ffuf'],
    ['Hydra','Authentication testing','https://github.com/vanhauser-thc/thc-hydra']
  ];

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const card = (title, desc, meta, href) => '<article class="hb-card"><div class="hb-card-top"><span>'+esc(meta)+'</span><span>●</span></div><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p><a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">OPEN SOURCE ↗</a></article>';

  function injectRuntimeCSS() {
    if ($('hbRuntimeCSS')) return;
    const s = document.createElement('style'); s.id='hbRuntimeCSS';
    s.textContent = `
      .hb-card{border:1px solid rgba(127,255,212,.18);background:rgba(8,16,24,.72);padding:16px;min-height:150px;display:flex;flex-direction:column;gap:9px}
      .hb-card-top{display:flex;justify-content:space-between;font:11px/1.2 "JetBrains Mono",monospace;letter-spacing:.08em;opacity:.7}
      .hb-card h3{margin:0;font-size:16px}.hb-card p{margin:0;opacity:.72;line-height:1.5;font-size:13px}.hb-card a{margin-top:auto;color:inherit;text-decoration:none;font:11px "JetBrains Mono",monospace}
      .intel-grid,.ebook-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;min-height:40px}
      .engineering-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;padding:18px}
      .hb-tool{border:1px solid rgba(127,255,212,.18);padding:15px;background:rgba(8,16,24,.72)}.hb-tool h3{margin:0 0 6px}.hb-tool small{opacity:.65}
      .hb-tool .hb-fields{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.hb-tool input,.hb-tool select{width:100%;box-sizing:border-box;padding:9px;background:rgba(0,0,0,.3);color:inherit;border:1px solid rgba(127,255,212,.2)}
      .hb-result{padding:10px;border:1px dashed rgba(127,255,212,.3);font-family:"JetBrains Mono",monospace;font-size:12px;min-height:18px}
      .hb-count{opacity:.8}.hb-live{color:inherit}.hb-error{border:1px solid rgba(255,100,100,.35);padding:15px;opacity:.85}
      .hb-mini-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.hb-mini-actions button{cursor:pointer}
      .hb-quiz-opt{display:block;width:100%;text-align:left;margin:7px 0;padding:11px;border:1px solid rgba(127,255,212,.2);background:transparent;color:inherit;cursor:pointer}
      .hb-quiz-opt:hover{background:rgba(127,255,212,.08)}
    `;
    document.head.appendChild(s);
  }

  function renderResources() {
    const grid=$('sourceGrid'), filter=$('sourceFilter'), search=$('sourceSearch');
    if(!grid) return;
    const cats=[...new Set(resources.map(r=>r[0]))];
    if(filter) filter.innerHTML='<option value="all">ALL DOMAINS</option>'+cats.map(c=>'<option>'+esc(c)+'</option>').join('');
    const draw=()=>{
      const q=(search?.value||'').toLowerCase().trim(), f=filter?.value||'all';
      const rows=resources.filter(r=>(f==='all'||r[0]===f)&&(!q||r.join(' ').toLowerCase().includes(q)));
      grid.innerHTML=rows.length?rows.map(r=>card(r[1],r[2],r[0],r[3])).join(''):'<div class="hb-error">No matching resources.</div>';
      if($('sourceCount')) $('sourceCount').textContent=rows.length+' resources';
      if($('sourceMetric')) $('sourceMetric').textContent=resources.length;
    };
    search?.addEventListener('input',draw); filter?.addEventListener('change',draw); $('resourceReset')?.addEventListener('click',()=>{if(search)search.value='';if(filter)filter.value='all';draw()});
    draw();
  }

  function renderDocs() {
    const grid=$('docGrid'), cat=$('docCategory'), search=$('docSearch'); if(!grid)return;
    const cats=[...new Set(docs.map(d=>d[0]))];
    if(cat)cat.innerHTML='<option value="all">ALL DOMAINS</option>'+cats.map(c=>'<option>'+esc(c)+'</option>').join('');
    const draw=()=>{
      const q=(search?.value||'').toLowerCase(), f=cat?.value||'all';
      const rows=docs.filter(d=>(f==='all'||d[0]===f)&&(!q||d.join(' ').toLowerCase().includes(q)));
      grid.innerHTML=rows.map(d=>card(d[1],'Open documentation or reference material.',d[0],d[2])).join('');
      if($('docIndexCount'))$('docIndexCount').textContent=rows.length+' documents';
    };
    search?.addEventListener('input',draw);cat?.addEventListener('change',draw);draw();
  }

  function renderEngineering() {
    const box=$('engineeringGrid'); if(!box)return;
    box.innerHTML=tools.map((t,i)=>{
      const fields=(t[3]==='cidr')?'<input data-a placeholder="IPv4 e.g. 192.168.1.0"><input data-b placeholder="Prefix e.g. 24">':
        (t[3]==='bin'||t[3]==='hex'||t[3]==='decbin'||t[3]==='dechex')?'<input data-a placeholder="Enter value">':
        (t[3]==='temp')?'<input data-a type="number" placeholder="°C">':
        '<input data-a type="number" placeholder="Value 1"><input data-b type="number" placeholder="Value 2">';
      return '<div class="hb-tool" data-tool="'+i+'"><div><h3>'+esc(t[0])+'</h3><small>'+esc(t[1])+' · '+esc(t[2])+'</small></div><div class="hb-fields">'+fields+'</div><div class="hb-result">Enter values to calculate.</div></div>';
    }).join('');
    box.querySelectorAll('.hb-tool').forEach(el=>el.querySelectorAll('input').forEach(inp=>inp.addEventListener('input',()=>calculate(el,tools[Number(el.dataset.tool)][3]))));
  }

  function num(el,attr){const v=parseFloat(el.querySelector('[data-'+attr+']')?.value);return Number.isFinite(v)?v:null}
  function calculate(el,type){
    const a=num(el,'a'),b=num(el,'b'), out=el.querySelector('.hb-result'); let r='';
    if(type==='ohm'&&a!==null&&b!==null)r=(a*b).toFixed(4)+' V (I × R)';
    else if(type==='power'&&a!==null&&b!==null)r=(a*b).toFixed(4)+' W (V × I)';
    else if(type==='energy'&&a!==null&&b!==null)r=(a*b).toFixed(4)+' Wh (P × hours)';
    else if(type==='divider'&&a!==null&&b!==null){const vin=a,r1=b,r2=1;r=(vin*r2/(r1+r2)).toFixed(4)+' V (R2 assumed 1Ω; add a custom ratio tool later)';}
    else if(type==='series'&&a!==null&&b!==null)r=(a+b).toFixed(4)+' Ω';
    else if(type==='parallel'&&a>0&&b>0)r=(1/(1/a+1/b)).toFixed(4)+' Ω';
    else if(type==='current'&&a!==null&&b!==0)r=(a/b).toFixed(4)+' A';
    else if(type==='resistance'&&a!==null&&b>0)r=((a*a)/b).toFixed(4)+' Ω';
    else if(type==='frequency'&&a>0)r=(1/a).toFixed(6)+' Hz';
    else if(type==='wavelength'&&a>0)r=(299792458/a).toFixed(4)+' m';
    else if(type==='dbm'&&a!==null)r=Math.pow(10,a/10).toFixed(6)+' mW';
    else if(type==='mw'&&a>0)r=(10*Math.log10(a)).toFixed(4)+' dBm';
    else if(type==='hosts'&&a!==null)r=Math.max(0,Math.pow(2,a)-2).toLocaleString()+' usable hosts';
    else if(type==='bin'&&a!==null)r=parseInt(a,2).toString(10);
    else if(type==='hex'&&a!==null)r=parseInt(String(el.querySelector('[data-a]').value).replace(/^0x/i,''),16).toString(10);
    else if(type==='decbin'&&a!==null)r=Math.trunc(a).toString(2);
    else if(type==='dechex'&&a!==null)r=Math.trunc(a).toString(16).toUpperCase();
    else if(type==='bytes'&&a!==null)r=a+' bytes = '+(a/1024).toFixed(3)+' KB = '+(a/1048576).toFixed(3)+' MB';
    else if(type==='temp'&&a!==null)r=(a*9/5+32).toFixed(2)+' °F';
    else if(type==='cidr'){const ip=el.querySelector('[data-a]')?.value.trim(), p=parseInt(el.querySelector('[data-b]')?.value);r=cidr(ip,p)}
    out.textContent=r||'Enter valid values to calculate.';
  }

  function cidr(ip,p){
    if(!/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(ip)||!Number.isInteger(p)||p<0||p>32)return'Enter a valid IPv4 address and prefix 0–32.';
    const oct=ip.split('.').map(Number);if(oct.some(x=>x>255))return'Invalid IPv4 address.';
    const n=oct.reduce((x,v)=>(x*256+v)>>>0,0), mask=p===0?0:(0xffffffff<<(32-p))>>>0, net=(n&mask)>>>0, broad=(net|(~mask))>>>0, hosts=p>=31?Math.pow(2,32-p):Math.max(0,Math.pow(2,32-p)-2);
    const fmt=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join('.');
    return'Network '+fmt(net)+' · Broadcast '+fmt(broad)+' · Hosts '+hosts.toLocaleString();
  }

  async function renderEbooks(){
    const grid=$('ebookGrid'); if(!grid)return;
    grid.innerHTML=megaFallback.slice(0,8).map(x=>card(x[0],'Use the archive repository to browse available security and technical books.',x[1],'https://github.com/HephzibahBehulah/Hacking-Security-Ebooks')).join('');
    if($('ebookCount'))$('ebookCount').textContent='archive available';
    try{
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),7000);
      const res=await fetch('https://api.github.com/repos/HephzibahBehulah/Hacking-Security-Ebooks/git/trees/main?recursive=1',{signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});
      clearTimeout(timer);if(!res.ok)throw new Error('GitHub API '+res.status);
      const data=await res.json();const files=(data.tree||[]).filter(x=>x.type==='blob'&&/\\.pdf$/i.test(x.path));
      if(files.length){
        const rows=files.map(x=>['EBOOK',x.path.split('/').pop().replace(/\\.pdf$/i,''),x.url||'', 'https://github.com/HephzibahBehulah/Hacking-Security-Ebooks/blob/main/'+x.path]);
        grid.innerHTML=rows.map(r=>card(r[1],'PDF available in the public Hacking-Security-Ebooks repository.','PDF',r[3])).join('');
        if($('ebookCount'))$('ebookCount').textContent=files.length+' PDFs indexed';
        if($('pdfTotal'))$('pdfTotal').textContent=files.length;
      }
    }catch(e){if($('ebookCount'))$('ebookCount').textContent='archive link mode';}
  }

  async function renderMega(){
    const grid=$('megaToolGrid');if(!grid)return;
    let list=megaFallback.slice();
    const draw=()=>{
      const q=($('megaToolSearch')?.value||'').toLowerCase(),f=$('megaToolCategory')?.value||'all';
      const rows=list.filter(x=>(f==='all'||x[1]===f)&&(!q||x.join(' ').toLowerCase().includes(q)));
      grid.innerHTML=rows.map(x=>card(x[0],'External tool discovery entry. Open the provider for full documentation.',x[1],x[2])).join('');
      if($('megaToolCount'))$('megaToolCount').textContent=rows.length+' tools available';
    };
    const cats=[...new Set(list.map(x=>x[1]))];
    if($('megaToolCategory'))$('megaToolCategory').innerHTML='<option value="all">ALL CATEGORIES</option>'+cats.map(c=>'<option>'+esc(c)+'</option>').join('');
    $('megaToolSearch')?.addEventListener('input',draw);$('megaToolCategory')?.addEventListener('change',draw);$('megaToolRefresh')?.addEventListener('click',()=>loadMega(draw));
    draw(); await loadMega(draw);
    async function loadMega(redraw){
      try{
        const c=new AbortController(),t=setTimeout(()=>c.abort(),7000);
        const res=await fetch('https://raw.githubusercontent.com/lockfale/OSINT-Framework/master/public/arf.json',{signal:c.signal});clearTimeout(t);
        if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json(),found=[];
        (function walk(node,cat){
          if(!node||typeof node!=='object')return;
          const category=node.name||cat||'OSINT';
          if(Array.isArray(node.children))node.children.forEach(ch=>walk(ch,category));
          if(Array.isArray(node.links))node.links.forEach(l=>{if(l&&l.url)found.push([l.name||l.title||'Unnamed tool',category,l.url])});
          if(node.url)found.push([node.name||'OSINT tool',category,node.url]);
        })(data,'OSINT');
        const unique=[];const seen=new Set();for(const x of found){if(!seen.has(x[2])){seen.add(x[2]);unique.push(x)}} 
        if(unique.length>100){list=unique.slice(0,1000);const cats2=[...new Set(list.map(x=>x[1]))];if($('megaToolCategory'))$('megaToolCategory').innerHTML='<option value="all">ALL CATEGORIES</option>'+cats2.map(c=>'<option>'+esc(c)+'</option>').join('');redraw();}
      }catch(e){/* curated local index remains visible */ }
    }
  }

  function initQuiz(){
    const q=$('quizQuestion'), opts=$('quizOptions'), next=$('quizNext'), show=$('quizShowAnswer');if(!q||!opts)return;
    const bank=[
      ['What does HTTPS use for secure web transport?',['TLS','FTP','SMTP','ARP'],0],
      ['Which device forwards packets between networks?',['Router','Switch','Keyboard','Monitor'],0],
      ['What does DNS translate?',['Domain names to IP addresses','Passwords to hashes','Files to PDFs','Ports to usernames'],0],
      ['What does SQL stand for?',['Structured Query Language','Secure Query Link','System Queue Logic','Simple Question Language'],0],
      ['Which protocol is commonly used for secure remote login?',['SSH','HTTP','FTP','Telnet'],0],
      ['What is the hexadecimal value of decimal 255?',['FF','AA','10','15'],0],
      ['What does OSINT mean?',['Open Source Intelligence','Online System Internet Network Tool','Operating Security Interface','Open Server Internal Network'],0],
      ['Which layer does IP belong to in the TCP/IP model?',['Internet','Application','Physical','Presentation'],0]
    ];
    let current=null,score=0,streak=0;
    function newQ(){current=bank[Math.floor(Math.random()*bank.length)];q.textContent=current[0];opts.innerHTML=current[1].map((x,i)=>'<button class="hb-quiz-opt" data-i="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(x)+'</button>').join('');$('quizFeedback').textContent='';opts.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>answer(Number(b.dataset.i))));}
    function answer(i){if(!current)return;const correct=i===current[2];score+=correct?1:0;streak=correct?streak+1:0;opts.querySelectorAll('button').forEach((b,n)=>{b.disabled=true;if(n===current[2])b.dataset.correct='true'});$('quizFeedback').textContent=correct?'CORRECT · streak '+streak:'INCORRECT · answer: '+current[1][current[2]];$('quizScore').textContent='score: '+score;$('quizStreak').textContent='streak: '+streak;}
    next?.addEventListener('click',newQ);show?.addEventListener('click',()=>{if(current)$('quizFeedback').textContent='ANSWER · '+current[1][current[2]]});newQ();
  }

  function initSearch(){
    $('globalResourceSearch')?.addEventListener('input',e=>{
      const q=e.target.value.trim();if(q){location.hash='resourceMatrix';if($('sourceSearch')){$('sourceSearch').value=q;$('sourceSearch').dispatchEvent(new Event('input'));}}
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    try{
      injectRuntimeCSS();
      renderResources();
      renderDocs();
      renderEngineering();
      renderEbooks();
      renderMega();
      initQuiz();
      initSearch();
      window.__HB_INTELLIGENCE_HUB_READY=true;
      console.info('HB Intelligence Core ready');
    }catch(err){
      console.error('HB Intelligence Core failed:',err);
      window.__HB_INTELLIGENCE_HUB_ERROR=String(err);
      document.querySelectorAll('#sourceGrid,#ebookGrid,#megaToolGrid,#engineeringGrid,#docGrid,#microTools').forEach(el=>{if(el)el.innerHTML='<div class="hb-error">CORE RUNTIME ERROR. Open the browser console for details.</div>'});
    }
  });
})();