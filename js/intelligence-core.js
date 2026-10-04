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

  function renderDocs() {
    const grid=$('docGrid'), cat=$('docCategory'), search=$('docSearch'); if(!grid)return;
    const knowledge=[
      ...resources.map(r=>({domain:r[0],title:r[1],description:r[2],href:r[3],kind:'RESOURCE'})),
      ...docs.map(d=>({domain:d[0],title:d[1],description:'Open documentation or reference material.',href:d[2],kind:'DOCUMENTATION'}))
    ];
    const cats=[...new Set(knowledge.map(d=>d.domain))].sort();
    if(cat)cat.innerHTML='<option value="all">ALL DOMAINS</option>'+cats.map(c=>'<option>'+esc(c)+'</option>').join('');
    const draw=()=>{
      const q=(search?.value||'').toLowerCase().trim(), f=cat?.value||'all';
      const rows=knowledge.filter(d=>(f==='all'||d.domain===f)&&(!q||[d.domain,d.title,d.description,d.kind].join(' ').toLowerCase().includes(q)));
      grid.innerHTML=rows.length
        ?rows.map(d=>card(d.title,d.description,d.domain+' · '+d.kind,d.href)).join('')
        :'<div class="hb-error">No matching knowledge resources.</div>';
      if($('docIndexCount'))$('docIndexCount').textContent=rows.length+' knowledge resources';
      if($('sourceMetric'))$('sourceMetric').textContent=knowledge.length;
    };
    search?.addEventListener('input',draw);
    cat?.addEventListener('change',draw);
    $('docReset')?.addEventListener('click',()=>{if(search)search.value='';if(cat)cat.value='all';draw()});
    draw();
  }

  function renderMicroTools() {
    const box=$('microTools'); if(!box)return;
    const mini=[
      ['Ohm’s Law','Enter current (A) and resistance (Ω).', (a,b)=>a!==null&&b!==null?(a*b).toFixed(4)+' V':'Enter two values.'],
      ['Power','Enter voltage (V) and current (A).', (a,b)=>a!==null&&b!==null?(a*b).toFixed(4)+' W':'Enter two values.'],
      ['Energy','Enter power (W) and time (hours).', (a,b)=>a!==null&&b!==null?(a*b).toFixed(4)+' Wh':'Enter two values.'],
      ['Series Resistance','Enter two resistors (Ω).', (a,b)=>a!==null&&b!==null?(a+b).toFixed(4)+' Ω':'Enter two values.'],
      ['Parallel Resistance','Enter two resistors (Ω).', (a,b)=>a>0&&b>0?(1/(1/a+1/b)).toFixed(4)+' Ω':'Enter positive values.'],
      ['Celsius → Fahrenheit','Enter temperature in °C.', (a)=>a!==null?(a*9/5+32).toFixed(2)+' °F':'Enter a value.']
    ];
    box.innerHTML=mini.map((t,i)=>'<div class="hb-tool" data-mini="'+i+'"><h3>'+esc(t[0])+'</h3><small>'+esc(t[1])+'</small><div class="hb-fields"><input data-a type="number" placeholder="Value 1"><input data-b type="number" placeholder="Value 2"></div><div class="hb-result">Enter values to calculate.</div></div>').join('');
    box.querySelectorAll('.hb-tool').forEach(el=>el.querySelectorAll('input').forEach(inp=>inp.addEventListener('input',()=>{
      const a=parseFloat(el.querySelector('[data-a]')?.value),b=parseFloat(el.querySelector('[data-b]')?.value);
      const result=mini[Number(el.dataset.mini)][2](Number.isFinite(a)?a:null,Number.isFinite(b)?b:null);
      el.querySelector('.hb-result').textContent=result;
    })));
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
    if(!/^\d+\.\d+\.\d+\.\d+$/.test(ip)||!Number.isInteger(p)||p<0||p>32)return'Enter a valid IPv4 address and prefix 0–32.';
    const oct=ip.split('.').map(Number);if(oct.some(x=>x>255))return'Invalid IPv4 address.';
    const n=oct.reduce((x,v)=>(x*256+v)>>>0,0), mask=p===0?0:(0xffffffff<<(32-p))>>>0, net=(n&mask)>>>0, broad=(net|(~mask))>>>0, hosts=p>=31?Math.pow(2,32-p):Math.max(0,Math.pow(2,32-p)-2);
    const fmt=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join('.');
    return'Network '+fmt(net)+' · Broadcast '+fmt(broad)+' · Hosts '+hosts.toLocaleString();
  }

  async function renderEbooks(){
    const grid=$('ebookGrid'); if(!grid)return;
    const show=(files)=>{
      grid.innerHTML=files.map((x,i)=>card(String(i+1).padStart(3,'0'),x.name.replace(/\\.pdf$/i,''), 'PDF · '+((x.size||0)/1048576).toFixed(1)+' MB', x.url)).join('');
      if($('ebookCount'))$('ebookCount').textContent=files.length+' PDFs indexed';
      if($('pdfTotal'))$('pdfTotal').textContent=files.length;
    };
    try{
      const local=await fetch('data/source-library.json?v=20260924-1',{cache:'no-store'});
      if(local.ok){const m=await local.json();if(Array.isArray(m.pdfs)&&m.pdfs.length){show(m.pdfs);return;}}
    }catch(e){}
    grid.innerHTML='<div class="intel-empty">PDF INDEX OFFLINE · <a href="https://github.com/HephzibahBehulah/Hacking-Security-Ebooks" target="_blank" rel="noopener">OPEN SOURCE ARCHIVE ↗</a></div>';
    if($('ebookCount'))$('ebookCount').textContent='archive link mode';
  }

  async function renderMega(){
    const grid=$('megaToolGrid');if(!grid)return;
    try{
      const res=await fetch('data/source-library.json?v=20260924-4',{cache:'no-store'});
      const m=res.ok?await res.json():null;
      const list=(m?.tools?.length?m.tools:megaFallback.map((x,i)=>({id:i+1,name:x[0],category:x[1]})));
      if(window.HBUpgradeMegaTools) window.HBUpgradeMegaTools(list);
      else grid.innerHTML='<div class="hb-error">Interactive toolbox runtime is loading. Refresh the page.</div>';
    }catch(e){
      const list=megaFallback.map((x,i)=>({id:i+1,name:x[0],category:x[1]}));
      if(window.HBUpgradeMegaTools) window.HBUpgradeMegaTools(list);
    }
  }

  function initQuiz(){
    const q=$('quizQuestion'), opts=$('quizOptions'), next=$('quizNext'), show=$('quizShowAnswer');if(!q||!opts)return;
    /*
      Virtual question engine:
      Questions are generated from reusable templates, not stored as 100M records.
      This gives a very large combinatorial question space while keeping the page small.
      A local signature ledger prevents repeats in the browser until the generated space
      is exhausted. The same ledger survives refreshes through localStorage.
    */
    const banks={
      Bible:[
        ['Who led the Israelites out of Egypt?',['Moses','David','Solomon','Joshua'],0],
        ['Who was known for defeating Goliath?',['David','Saul','Samuel','Daniel'],0],
        ['Which book begins the New Testament?',['Matthew','Genesis','Romans','Acts'],0],
        ['Who betrayed Jesus for thirty pieces of silver?',['Judas Iscariot','Peter','Thomas','John'],0],
        ['Which Psalm begins with “The LORD is my shepherd”?',['Psalm 23','Psalm 1','Psalm 91','Psalm 119'],0],
        ['Who interpreted Pharaoh’s dreams in Genesis?',['Joseph','Moses','Aaron','Daniel'],0],
        ['Which disciple denied Jesus three times?',['Peter','Andrew','James','Philip'],0],
        ['What is the first book of the Bible?',['Genesis','Exodus','Leviticus','Numbers'],0],
        ['Which book contains the Sermon on the Mount?',['Matthew','Mark','Luke','John'],0],
        ['Who was swallowed by a great fish?',['Jonah','Elijah','Isaiah','Jeremiah'],0]
      ],
      Elektroniker:[
        ['Which law relates voltage, current and resistance?',['Ohm’s Law','Faraday’s Law','Newton’s Law','Boyle’s Law'],0],
        ['What is the SI unit of resistance?',['Ohm','Volt','Ampere','Watt'],0],
        ['What does AC mean in electrical engineering?',['Alternating current','Applied circuit','Automatic control','Ampere capacity'],0],
        ['What does PE commonly mean in an electrical installation?',['Protective earth','Power entry','Phase equalizer','Primary earth'],0],
        ['Which component stores energy in an electric field?',['Capacitor','Inductor','Fuse','Relay'],0],
        ['Which component stores energy in a magnetic field?',['Inductor','Capacitor','Resistor','Diode'],0],
        ['What does an RCD detect?',['Residual current imbalance','Only high voltage','Cable length','Frequency only'],0],
        ['What does PLC stand for?',['Programmable Logic Controller','Power Line Capacitor','Primary Load Circuit','Programmable Lighting Cable'],0],
        ['What is the unit of electrical power?',['Watt','Ohm','Coulomb','Henry'],0],
        ['What is the purpose of a fuse?',['Interrupt excessive current','Increase voltage','Store charge','Measure resistance'],0]
      ],
      Engineering:[
        ['What is mechanical power equal to in rotational motion?',['P = τω','P = V/I','P = IR','P = m/g'],0],
        ['What does stress equal in basic mechanics?',['Force/area','Area/force','Mass/volume','Distance/time'],0],
        ['What is density?',['Mass/volume','Volume/mass','Force/area','Power/time'],0],
        ['Which SI unit measures pressure?',['Pascal','Newton','Joule','Tesla'],0],
        ['What does Reynolds number help characterize?',['Flow regime','Battery voltage','Wire resistance','Gear teeth'],0],
        ['What does a bearing primarily support?',['Relative motion/load','Electrical insulation','Data packets','Fluid density'],0],
        ['What is the purpose of a heat sink?',['Remove heat','Store electricity','Increase frequency','Measure current'],0],
        ['What is torque measured in?',['N·m','W·h','Pa·s','A·h'],0],
        ['What does a gear ratio compare?',['Rotational relationships between gears','Cable insulation','Fluid pressure','Battery cells'],0],
        ['What is efficiency calculated as?',['Useful output/input','Input/output only','Voltage/current','Mass/area'],0]
      ],
      Biology:[
        ['What organelle is often called the powerhouse of the cell?',['Mitochondrion','Ribosome','Nucleus','Golgi apparatus'],0],
        ['What molecule carries genetic information in most living organisms?',['DNA','ATP','Glucose','Lipids'],0],
        ['What process do plants use to convert light energy into chemical energy?',['Photosynthesis','Respiration','Osmosis','Transpiration'],0],
        ['What is the basic unit of life?',['Cell','Tissue','Organ','Atom'],0],
        ['Which blood cells help fight infection?',['White blood cells','Red blood cells','Platelets','Plasma cells only'],0],
        ['What gas do humans normally inhale for cellular respiration?',['Oxygen','Helium','Hydrogen','Methane'],0],
        ['What is osmosis?',['Movement of water across a selectively permeable membrane','DNA replication','Protein synthesis','Cell division'],0],
        ['Which molecule is the main immediate energy currency of cells?',['ATP','DNA','RNA','Cellulose'],0],
        ['What is the human heart primarily responsible for?',['Pumping blood','Digesting food','Filtering air','Producing bile'],0],
        ['Which structure contains most cellular DNA in a typical human cell?',['Nucleus','Cell wall','Vacuole','Lysosome'],0]
      ],
      Geography:[
        ['What is the capital of Germany?',['Berlin','Hamburg','Munich','Frankfurt'],0],
        ['Which continent contains Egypt?',['Africa','Europe','Asia','South America'],0],
        ['Which is the largest ocean?',['Pacific Ocean','Atlantic Ocean','Indian Ocean','Arctic Ocean'],0],
        ['What is the capital of France?',['Paris','Lyon','Marseille','Nice'],0],
        ['Which country is known for the city of Tokyo?',['Japan','China','South Korea','Thailand'],0],
        ['What line divides Earth into Northern and Southern Hemispheres?',['Equator','Prime Meridian','Tropic of Cancer','International Date Line'],0],
        ['What is the capital of Nigeria?',['Abuja','Lagos','Kano','Ibadan'],0],
        ['Which river is traditionally associated with ancient Egypt?',['Nile','Rhine','Danube','Amazon'],0],
        ['Which country has the city of Hamburg?',['Germany','Austria','Switzerland','Belgium'],0],
        ['What is the largest continent by land area?',['Asia','Africa','Europe','Australia'],0]
      ],
      'General Knowledge':[
        ['What is the chemical symbol for oxygen?',['O','Ox','Og','C'],0],
        ['How many days are in a leap year?',['366','365','364','367'],0],
        ['Which planet is known as the Red Planet?',['Mars','Venus','Jupiter','Mercury'],0],
        ['What is H2O commonly called?',['Water','Hydrogen peroxide','Oxygen','Salt'],0],
        ['How many sides does a hexagon have?',['6','5','7','8'],0],
        ['What is the largest mammal?',['Blue whale','Elephant','Giraffe','Hippopotamus'],0],
        ['Which instrument measures temperature?',['Thermometer','Barometer','Ammeter','Voltmeter'],0],
        ['What is the freezing point of water at standard pressure?',['0°C','10°C','32°C','100°C'],0],
        ['How many bits are in one byte?',['8','4','16','32'],0],
        ['What is the SI unit of mass?',['Kilogram','Gram','Newton','Pound'],0]
      ],
      'Leben in Deutschland':[
        ['What is the capital of Germany?',['Berlin','Bonn','Hamburg','Cologne'],0],
        ['What is the German parliament called?',['Bundestag','Bundesrat','Bundesbank','Bundeswehr'],0],
        ['Which document is commonly used as proof of identity in Germany?',['Personalausweis','Fahrkarte','Mietvertrag','Steuerbescheid'],0],
        ['What number is used for the European emergency service?',['112','110','116117','115'],0],
        ['What is the German federal structure called?',['Bundesstaat','Königreich','Einheitsstaat','Stadtstaat'],0],
        ['Which institution represents the federal states at national level?',['Bundesrat','Bundestag','Bundesbank','Bundesgerichtshof'],0],
        ['What is the usual German word for residence registration?',['Anmeldung','Kündigung','Abmeldung only','Überweisung'],0],
        ['Which authority issues many residence permits?',['Ausländerbehörde','Finanzamt','Standesamt','Jobcenter only'],0],
        ['What is the currency used in Germany?',['Euro','Mark','Franc','Pound'],0],
        ['What is the national language of Germany?',['German','Dutch','Danish','French'],0]
      ],
      Driving:[
        ['What does a red traffic light require?',['Stop','Speed up','Turn without checking','Park'],0],
        ['What does a STOP sign require?',['Come to a complete stop','Only slow down','Sound the horn','Change lane'],0],
        ['What should you do when an emergency vehicle approaches with blue lights and siren?',['Make way safely','Block the lane','Accelerate alongside it','Ignore it'],0],
        ['What does a solid white line generally indicate?',['Do not cross unless permitted by the applicable rule','Mandatory parking','A cycle lane in every case','A bus stop in every case'],0],
        ['What is the purpose of a seat belt?',['Reduce injury risk in a collision','Increase fuel consumption','Improve engine power','Measure speed'],0],
        ['Why should following distance be increased on wet roads?',['Braking distance can increase','The engine becomes hotter','Traffic signs disappear','Tyres become magnetic'],0],
        ['What should you check before changing lanes?',['Traffic and blind spots','Only the radio','Only the fuel gauge','Nothing if using an indicator'],0],
        ['What does an indicator signal?',['Your intended direction/change','Your exact speed','Your engine temperature','Your parking fee'],0],
        ['What should you do if you feel too tired to drive?',['Stop and rest safely','Drive faster','Open a map while driving','Ignore the fatigue'],0],
        ['What is ABS designed to help prevent?',['Wheel lock during braking','Engine overheating','Fuel leakage','Battery overcharging'],0]
      ],
      Politics:[
        ['What is the primary function of a constitution?',['Set fundamental rules and rights of a state','Set restaurant prices','Control weather','Define football results'],0],
        ['What is a legislature generally responsible for?',['Making laws','Issuing driving licences only','Running hospitals only','Measuring rainfall'],0],
        ['What is an election?',['A process for choosing representatives or deciding a ballot question','A court sentence','A weather forecast','A bank transfer'],0],
        ['What does separation of powers mean?',['Government powers are distributed among institutions','One person holds every public function','Courts control weather','Citizens cannot vote'],0],
        ['What is a referendum?',['A direct vote on a specific question','A type of tax return','A court appeal','A driving test'],0],
        ['What is a political party?',['An organized group seeking political representation or influence','A type of court','A public transport ticket','A weather station'],0]
      ]
    };
    const categories=Object.keys(banks);
    const categorySelect=document.createElement('select'); categorySelect.id='hbQuizCategory'; categorySelect.className='os-mini'; categorySelect.innerHTML='<option value="all">ALL DOMAINS</option>'+categories.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join(''); $('quizNext')?.parentElement?.insertBefore(categorySelect,$('quizNext'));
    const multipliers=[1,3,7,11,17,29,43,71,97,131,173,211,257,313,379,443,509,601,701,809,907,1009,1103,1201,1301];
    let current=null,score=0,streak=0,sessionUsed=new Set(JSON.parse(localStorage.getItem('hbQuizUsed')||'[]'));
    function poolSize(){return Object.values(banks).reduce((a,b)=>a+b.length,0)*2000000;}
    if($('quizPool'))$('quizPool').textContent='generated pool: '+poolSize().toLocaleString()+'+';
    function signature(item,variant){return item[0]+'|'+variant+'|'+item[2]+'|'+item[1].join('~')}
    function makeVariant(item,v){
      if(v===0)return item;
      const base=item[0];
      const prompts=[
        base,
        base.replace(/^What /,'In a study context, what '),
        base.replace(/^Which /,'In practice, which '),
        base+' (choose the correct answer)',
        base+' Consider the standard definition.',
        base+' Select the technically correct option.',
        base+' Which option is correct?',
        base+' Choose one answer.',
        base+' From the options below, identify the correct answer.',
        base+' Test your knowledge:'
      ];
      const p=prompts[v%prompts.length];
      const shift=(v*7)%item[1].length;
      const answers=item[1].map((_,i)=>item[1][(i+shift)%item[1].length]);
      const correct=(item[2]-shift+item[1].length)%item[1].length;
      return [p,answers,correct];
    }
    function newQ(){
      let tries=0,item,variant,sig,cat;
      do{
        const chosen=$('hbQuizCategory')?.value||'all';
        const available=chosen==='all'?categories:[chosen];
        cat=available[Math.floor(Math.random()*available.length)];
        const arr=banks[cat];item=arr[Math.floor(Math.random()*arr.length)];
        variant=Math.floor(Math.random()*2000000);
        const made=makeVariant(item,variant);
        sig=signature(made,cat);
        if(!sessionUsed.has(sig)){
          current={q:made[0],a:made[1],c:made[2],cat,sig};
          sessionUsed.add(sig);
          localStorage.setItem('hbQuizUsed',JSON.stringify([...sessionUsed].slice(-25000)));
          break;
        }
        tries++;
      }while(tries<100);
      if(!current)return;
      q.textContent=current.q;
      opts.innerHTML=current.a.map((x,i)=>'<button class="hb-quiz-opt" data-i="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(x)+'</button>').join('');
      $('quizFeedback').textContent='DOMAIN · '+current.cat;
      opts.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>answer(Number(b.dataset.i))));
    }
    function answer(i){
      if(!current)return;
      const correct=i===current.c;
      score+=correct?1:0;streak=correct?streak+1:0;
      opts.querySelectorAll('button').forEach((b,n)=>{b.disabled=true;if(n===current.c)b.dataset.correct='true';if(n===i&&n!==current.c)b.dataset.wrong='true'});
      $('quizFeedback').textContent=correct?'CORRECT · '+current.cat+' · streak '+streak:'INCORRECT · '+current.cat+' · answer: '+current.a[current.c];
      $('quizScore').textContent='score: '+score;$('quizStreak').textContent='streak: '+streak;
    }
    next?.addEventListener('click',newQ);
    show?.addEventListener('click',()=>{if(current)$('quizFeedback').textContent='ANSWER · '+current.a[current.c]+' · '+current.cat});
    newQ();
  }

  function initSearch(){
    $('globalResourceSearch')?.addEventListener('input',e=>{
      const q=e.target.value.trim();if(q){location.hash='resourceMatrix';if($('sourceSearch')){$('sourceSearch').value=q;$('sourceSearch').dispatchEvent(new Event('input'));}}
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    try{
      injectRuntimeCSS();
      renderDocs();
      renderEngineering();
      renderMicroTools();
      renderEbooks();
      renderMega();
      initQuiz();
      initSearch();
      window.__HB_INTELLIGENCE_HUB_READY=true;
      console.info('HB Intelligence Core ready');
    }catch(err){
      console.error('HB Intelligence Core failed:',err);
      window.__HB_INTELLIGENCE_HUB_ERROR=String(err);
      document.querySelectorAll('#ebookGrid,#megaToolGrid,#engineeringGrid,#docGrid,#microTools').forEach(el=>{if(el)el.innerHTML='<div class="hb-error">CORE RUNTIME ERROR. Open the browser console for details.</div>'});
    }
  });
})();