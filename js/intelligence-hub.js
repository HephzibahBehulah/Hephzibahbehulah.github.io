
/* INTELLIGENCE RESOURCE HUB
   Original interface. Resource metadata is loaded from the public Hacking-Security-Ebooks
   repository at runtime; this avoids duplicating copyrighted book files in the portfolio.
*/
(() => {
  const API = 'https://api.github.com/repos/HephzibahBehulah/Hacking-Security-Ebooks/contents/';
  const REPO = 'https://github.com/HephzibahBehulah/Hacking-Security-Ebooks';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const pretty = s => s.replace(/\.(pdf)$/i,'').replace(/_/g,' ').replace(/\s+/g,' ').trim();
  const size = n => n ? (n/1024/1024).toFixed(1)+' MB' : 'PDF';

  const groups = {
    'OSINT / Research': [
      ['OSINT Framework','Structured discovery map for open-source research.','https://osintframework.com/','discover'],
      ['Google Search','Public web search and search operators.','https://www.google.com/','search'],
      ['Google Advanced Search','Build targeted public-web searches without scripting.','https://www.google.com/advanced_search','search'],
      ['Internet Archive','Historical snapshots and archived public pages.','https://web.archive.org/','archives'],
      ['crt.sh','Certificate Transparency search for public certificates.','https://crt.sh/','domains'],
      ['DNSdumpster','Domain and DNS reconnaissance resource.','https://dnsdumpster.com/','domains'],
      ['urlscan.io','Public URL and web-scan observations.','https://urlscan.io/','web'],
      ['VirusTotal','Threat-intelligence and file/domain reputation research.','https://www.virustotal.com/','threat-intel'],
      ['Have I Been Pwned','Check whether an email appears in known breach notifications.','https://haveibeenpwned.com/','exposure']
    ],
    'Web Security': [
      ['OWASP Web Security Testing Guide','Testing methodology and security verification guidance.','https://owasp.org/www-project-web-security-testing-guide/','methodology'],
      ['OWASP Top 10','Common web application security risks and mitigations.','https://owasp.org/www-project-top-ten/','reference'],
      ['OWASP Cheat Sheet Series','Practical secure-development guidance.','https://cheatsheetseries.owasp.org/','reference'],
      ['PortSwigger Web Security Academy','Interactive web-security learning labs.','https://portswigger.net/web-security','labs'],
      ['MDN Web Docs','Web platform reference for HTML, CSS, JavaScript and APIs.','https://developer.mozilla.org/','web']
    ],
    'Networking / Infrastructure': [
      ['Cloudflare Learning Center','Networking, DNS, HTTP and security explainers.','https://www.cloudflare.com/learning/','networking'],
      ['Cisco Networking Academy','Networking and technology learning resources.','https://www.netacad.com/','learning'],
      ['Wireshark','Network protocol analyzer and official documentation.','https://www.wireshark.org/','analysis'],
      ['Nmap','Network discovery and security auditing documentation.','https://nmap.org/','assessment'],
      ['RFC Editor','Primary source for Internet protocol specifications.','https://www.rfc-editor.org/','standards']
    ],
    'Linux / Systems': [
      ['Linux Kernel Documentation','Official Linux kernel documentation.','https://docs.kernel.org/','linux'],
      ['Ubuntu Documentation','Linux administration and system guides.','https://documentation.ubuntu.com/','linux'],
      ['ArchWiki','Detailed Linux concepts and administration references.','https://wiki.archlinux.org/','linux'],
      ['GNU Bash Reference','Reference for Bash shell behaviour and scripting.','https://www.gnu.org/software/bash/manual/','shell'],
      ['OpenSSH','Secure shell documentation and project information.','https://www.openssh.com/','remote-access']
    ],
    'Digital Forensics / DFIR': [
      ['NIST Computer Forensics','Digital-forensics guidance and publications.','https://www.nist.gov/itl/forensics','forensics'],
      ['Autopsy','Open-source digital-forensics platform.','https://www.autopsy.com/','forensics'],
      ['SANS DFIR','Digital-forensics and incident-response resources.','https://www.sans.org/digital-forensics/','dfir'],
      ['MITRE ATT&CK','Knowledge base for adversary tactics and techniques.','https://attack.mitre.org/','threat-intel']
    ],
    'Defensive Security': [
      ['CISA','Cybersecurity guidance, alerts and defensive resources.','https://www.cisa.gov/','defence'],
      ['NIST Cybersecurity Framework','Risk-management framework for cybersecurity.','https://www.nist.gov/cyberframework','governance'],
      ['BSI IT-Grundschutz','German federal information-security methodology.','https://www.bsi.bund.de/EN/Topics/ITGrundschutz/itgrundschutz_node.html','germany'],
      ['MITRE D3FEND','Knowledge base for defensive cybersecurity techniques.','https://d3fend.mitre.org/','defence'],
      ['OWASP SAMM','Software assurance maturity model.','https://owaspsamm.org/','governance']
    ],
    'Programming / Data': [
      ['Python Documentation','Official Python language documentation.','https://docs.python.org/3/','python'],
      ['pandas Documentation','Python data-analysis reference.','https://pandas.pydata.org/docs/','data'],
      ['NumPy Documentation','Numerical computing reference for Python.','https://numpy.org/doc/','data'],
      ['scikit-learn','Machine-learning documentation and examples.','https://scikit-learn.org/stable/','ml'],
      ['SQLBolt','Interactive SQL practice.','https://sqlbolt.com/','sql'],
      ['Git Documentation','Official Git reference and learning material.','https://git-scm.com/doc','git'],
      ['GitHub Docs','Documentation for repositories, Actions and Pages.','https://docs.github.com/','git']
    ],
    'Industrial / OT': [
      ['CISA ICS','Industrial Control Systems security resources.','https://www.cisa.gov/topics/industrial-control-systems','ics'],
      ['NIST SP 800-82','Guide to Operational Technology security.','https://csrc.nist.gov/publications/detail/sp/800-82/rev-3/final','ics'],
      ['MITRE ATT&CK for ICS','ICS-focused adversary knowledge base.','https://attack.mitre.org/matrices/ics/','ics'],
      ['Siemens Industry Online Support','Industrial manuals and technical information.','https://support.industry.siemens.com/','industrial']
    ],
    'Electronics / Engineering': [
      ['VDE','German electrical engineering and professional resources.','https://www.vde.com/','engineering'],
      ['All About Circuits','Electronics textbook and reference resources.','https://www.allaboutcircuits.com/textbook/','electronics'],
      ['Arduino Documentation','Hardware and programming documentation.','https://docs.arduino.cc/','electronics'],
      ['Khan Academy Electrical Engineering','Foundational electrical and electronics learning.','https://www.khanacademy.org/science/electrical-engineering','learning']
    ],
    'Learning / Labs': [
      ['TryHackMe','Guided cybersecurity learning rooms and labs.','https://tryhackme.com/','labs'],
      ['Hack The Box Academy','Hands-on cybersecurity training.','https://academy.hackthebox.com/','labs'],
      ['picoCTF','Capture-the-flag cybersecurity learning.','https://picoctf.org/','labs'],
      ['OverTheWire','Wargames for learning security concepts.','https://overthewire.org/wargames/','labs'],
      ['MIT OpenCourseWare','Open course materials from MIT.','https://ocw.mit.edu/','learning']
    ]
  };

  const pdfClass = name => {
    const n=name.toLowerCase();
    if(/forensic|malware|virus|rootkit|incident/.test(n)) return 'DFIR / Malware';
    if(/web|sql injection|xss|php security|bug hunter/.test(n)) return 'Web Security';
    if(/network|wireless|bluetooth|firewall|wireshark|snort|nessus|ssh/.test(n)) return 'Networks';
    if(/linux|unix|red hat|kali|bash/.test(n)) return 'Linux / Systems';
    if(/penetration|pentest|ethical hacking|hacking|hack attacks|metasploit|shellcoder|intrusion/.test(n)) return 'Offensive Security';
    if(/crypt|code book/.test(n)) return 'Cryptography';
    if(/governance|iso 27001|information security|security fundamentals|computer security/.test(n)) return 'Security Foundations';
    if(/python|coding|programming|java|javascript/.test(n)) return 'Programming';
    if(/scada|industrial|plc|automation|control/.test(n)) return 'Industrial / OT';
    return 'Technical Library';
  };

  let pdfs=[], activeSource='all';

  function sourceCard(title,desc,url,tag){
    return '<a class="intel-card" href="'+url+'" target="_blank" rel="noopener noreferrer">'+
      '<span class="intel-code">'+esc(tag)+'</span><h3>'+esc(title)+' ↗</h3><p>'+esc(desc)+'</p><span class="intel-open">OPEN RESOURCE</span></a>';
  }

  function renderSources(q=''){
    const box=$('#sourceGrid'); if(!box)return;
    const query=q.toLowerCase().trim();
    const out=[];
    Object.entries(groups).forEach(([cat,items])=>{
      if(activeSource!=='all' && activeSource!==cat)return;
      items.forEach(x=>{
        if(!query || (cat+' '+x[0]+' '+x[1]).toLowerCase().includes(query)) out.push(sourceCard(x[0],x[1],x[2],cat));
      });
    });
    box.innerHTML=out.join('') || '<div class="intel-empty">NO MATCHES IN RESOURCE MATRIX</div>';
    const stat=$('#sourceCount'); if(stat)stat.textContent=out.length+' resources';
  }

  function renderSourceFilters(){
    const sel=$('#sourceFilter'); if(!sel)return;
    sel.innerHTML='<option value="all">ALL RESOURCE DOMAINS</option>'+Object.keys(groups).map(x=>'<option value="'+esc(x)+'">'+esc(x.toUpperCase())+'</option>').join('');
    sel.onchange=()=>{activeSource=sel.value;renderSources($('#sourceSearch')?.value||'')};
  }

  function renderPDFs(q=''){
    const box=$('#ebookGrid'); if(!box)return;
    const query=q.toLowerCase().trim();
    const list=pdfs.filter(b=> (activeSource==='all'||activeSource===b.category) &&
      (!query || (pretty(b.name)+' '+b.category).toLowerCase().includes(query)));
    box.innerHTML=list.map((b,i)=>'<article class="ebook-card"><div><span class="intel-code">'+String(i+1).padStart(3,'0')+'</span><span class="ebook-cat">'+esc(b.category)+'</span></div><h3>'+esc(pretty(b.name))+'</h3><p>PDF · '+size(b.size)+'</p><a href="'+esc(b.download_url)+'" target="_blank" rel="noopener noreferrer">OPEN PDF ↗</a></article>').join('') ||
      '<div class="intel-empty">NO EBOOK MATCHES</div>';
    const stat=$('#ebookCount');if(stat)stat.textContent=list.length+' indexed PDFs';
    const total=$('#pdfTotal');if(total)total.textContent=pdfs.length;
  }

  async function loadPDFs(){
    try{
      const r=await fetch(API,{headers:{Accept:'application/vnd.github+json'}});
      if(!r.ok)throw new Error('GitHub API '+r.status);
      const data=await r.json();
      pdfs=data.filter(x=>x.type==='file'&&/\.pdf$/i.test(x.name)).map(x=>({...x,category:pdfClass(x.name)}));
      pdfs.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
      renderPDFs($('#ebookSearch')?.value||'');
    }catch(e){
      const box=$('#ebookGrid');if(box)box.innerHTML='<div class="intel-empty">PDF INDEX TEMPORARILY UNAVAILABLE. <a href="'+REPO+'" target="_blank" rel="noopener">OPEN REPOSITORY ↗</a></div>';
      console.warn(e);
    }
  }

  function setupSearch(){
    $('#sourceSearch')?.addEventListener('input',e=>renderSources(e.target.value));
    $('#ebookSearch')?.addEventListener('input',e=>renderPDFs(e.target.value));
    $('#globalResourceSearch')?.addEventListener('input',e=>{
      const q=e.target.value.trim();
      if(q){$('#resourceMatrix')?.scrollIntoView({behavior:'smooth'});$('#sourceSearch').value=q;renderSources(q)}
    });
  }

  function setupToolFilters(){
    const tools=[
      ['Ohm’s Law','Electrical','Calculate V, I or R locally.'],['Voltage Divider','Electrical','Calculate Vout from Vin, R1 and R2.'],
      ['IPv4 CIDR','Networking','Network, broadcast, mask and host count.'],['Resistor Bands','Electronics','Decode a three-band resistor.'],
      ['Percentage','Data','Calculate percentage relationships.'],['Binary / Hex','Networking','Convert an integer to binary and hexadecimal.'],
      ['Time × Rate','Engineering','Simple rate and duration calculation.'],['Difference / Ratio','Data','Compare two numeric values.']
    ];
    const box=$('#microTools');if(!box)return;
    box.innerHTML=tools.map((t,i)=>'<button class="micro-tool-row" data-tool="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span><b>'+t[0]+'</b><em>'+t[1]+'</em><small>'+t[2]+'</small></button>').join('');
    box.querySelectorAll('button').forEach(b=>b.onclick=()=>openTool(tools[+b.dataset.tool]));
  }

  function openTool(t){
    const m=$('#resourceToolModal');if(!m)return;
    $('#resourceToolTitle').textContent=t[0];$('#resourceToolBody').innerHTML=
      '<span class="intel-code">'+esc(t[1])+'</span><p>'+esc(t[2])+'</p>'+
      '<input id="toolA" type="number" step="any" placeholder="Value A"><input id="toolB" type="number" step="any" placeholder="Value B">'+
      '<button class="os-btn primary" id="toolRun">RUN LOCALLY</button><output id="toolOut">—</output>';
    m.classList.add('open');m.setAttribute('aria-hidden','false');
    $('#toolRun').onclick=()=>{
      const a=parseFloat($('#toolA').value),b=parseFloat($('#toolB').value),o=$('#toolOut');
      if(!Number.isFinite(a)){o.textContent='Enter Value A.';return}
      if(t[0]==='Percentage'&&Number.isFinite(b))o.textContent=(a/b*100).toFixed(3)+'%';
      else if(t[0]==='Binary / Hex')o.textContent='BIN '+(a>>>0).toString(2)+' · HEX '+(a>>>0).toString(16).toUpperCase();
      else if(t[0]==='Difference / Ratio'&&Number.isFinite(b))o.textContent='DIFF '+(a-b).toFixed(4)+' · RATIO '+(a/b).toFixed(4);
      else if(t[0]==='Time × Rate'&&Number.isFinite(b))o.textContent=(a*b).toFixed(4);
      else if(Number.isFinite(b))o.textContent='A×B '+(a*b).toFixed(4)+' · A÷B '+(a/b).toFixed(4);
      else o.textContent='VALUE '+a;
    };
  }

  function setupModal(){
    $('#resourceToolClose')?.addEventListener('click',()=>{$('#resourceToolModal').classList.remove('open')});
    $('#resourceToolModal')?.addEventListener('click',e=>{if(e.target.id==='resourceToolModal')$('#resourceToolModal').classList.remove('open')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#resourceToolModal')?.classList.remove('open')});
  }

  document.addEventListener('DOMContentLoaded',()=>{
    renderSources();renderSourceFilters();renderPDFs();setupSearch();setupToolFilters();setupModal();loadPDFs();
    const reset=$('#resourceReset');reset?.addEventListener('click',()=>{activeSource='all';$('#sourceFilter').value='all';$('#sourceSearch').value='';$('#ebookSearch').value='';renderSources();renderPDFs()});
  });
})();
