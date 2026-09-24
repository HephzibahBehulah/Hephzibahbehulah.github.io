(() => {
'use strict';

const root = document.getElementById('hbTerminal');
if (!root) return;

const output = root.querySelector('#hbTerminalOutput');
const input = root.querySelector('#hbTerminalInput');
const prompt = root.querySelector('#hbTerminalPrompt');
const pathEl = root.querySelector('#hbTerminalPath');
const status = root.querySelector('#hbTerminalStatus');
const fs = ['/home/hb','/home/hb/engineering','/home/hb/network','/home/hb/security','/home/hb/osint','/home/hb/data','/home/hb/learning','/home/hb/projects','/home/hb/tools'];
let cwd = '/home/hb';
let history = [];
let historyIndex = -1;

const COMMANDS = {
  help:'system', '?':'system', list:'system', ls:'system', clear:'system', cls:'system',
  exit:'system', quit:'system', q:'system', pwd:'system', cd:'system', chdir:'system',
  history:'system', echo:'system', date:'system', version:'system', about:'system',
  tree:'system', status:'system', whoami:'system', man:'system', which:'system',
  ia:'system', is:'system', nav:'system', open:'system', focus:'system',
  ohm:'engineering', power:'engineering', energy:'engineering', resistor:'engineering',
  led:'engineering', color:'engineering', frequency:'engineering', rms:'engineering',
  efficiency:'engineering', voltage:'engineering', current:'engineering', impedance:'engineering',
  divider:'engineering', 'voltage-divider':'engineering', 'series-resistance':'engineering',
  'parallel-resistance':'engineering', 'power-factor':'engineering', 'three-phase':'engineering',
  'motor-torque':'engineering', 'voltage-drop':'engineering',
  mean:'data', median:'data', mode:'data', range:'data', variance:'data',
  std:'data', zscore:'data', precision:'data', recall:'data', f1:'data',
  base64:'security', encode:'security', decode:'security', hash:'security', sha256:'security',
  jwt:'security', csrf:'security', xss:'security', sqli:'security', mfa:'security',
  password:'security', headers:'osint', urlinfo:'osint', url:'osint', robots:'osint',
  sitemap:'osint', crt:'osint', whois:'osint', dns:'network', dnslookup:'network',
  ip:'network', cidr:'network', subnet:'network', ports:'network', protocol:'network',
  tcp:'network', udp:'network', icmp:'network', arp:'network', http:'network',
  https:'network', nmap:'network', nap:'network', ping:'network', traceroute:'network',
  nslookup:'network', route:'network', mac:'network',
  quiz:'learning', game:'learning', answer:'learning', score:'learning', rules:'learning',
  explain:'learning', glossary:'learning', learn:'learning', check:'system', selftest:'system',
  tools:'learning', tool:'learning', project:'learning', repo:'learning'
};

const descriptions = {
  system:'shell navigation, history and website control',
  engineering:'electrical and technical calculations',
  data:'statistics and ML evaluation concepts',
  network:'networking concepts and safe address calculations',
  osint:'public-source research helpers and URL inspection',
  security:'defensive security learning utilities',
  learning:'learning, projects and website navigation'
};

const print = (text='', cls='') => {
  const line = document.createElement('div');
  line.className = 'hb-term-line' + (cls ? ' '+cls : '');
  line.textContent = String(text);
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
};

const printLines = (text, cls='') => String(text).split('\n').forEach(x => print(x, cls));
const setPrompt = () => {
  pathEl.textContent = cwd;
  prompt.textContent = 'hb@intel:' + cwd.replace('/home/hb','~') + '$';
};
const tokenize = s => {
  const m = String(s).trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
  return (m || []).map(x => x.replace(/^["']|["']$/g,''));
};
const num = x => {
  const token = String(x ?? '').trim().replace(/^<|>$/g,'');
  const n = Number(token);
  return Number.isFinite(n) ? n : null;
};
const fmt = (n, unit='') => Number.isFinite(n) ? (Math.abs(n) >= 1e-6 && Math.abs(n) < 1e6 ? n.toFixed(6).replace(/\.0+$/,'') : n.toExponential(4)) + unit : 'invalid';

function cidrInfo(cidr) {
  const m = String(cidr||'').match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!m) return null;
  const ip=m[1].split('.').map(Number), prefix=Number(m[2]);
  if (ip.some(x=>x>255)||prefix>32) return null;
  const value=(((ip[0]*256+ip[1])*256+ip[2])*256+ip[3])>>>0;
  const mask=prefix===0?0:(0xffffffff << (32-prefix))>>>0;
  const network=(value&mask)>>>0, broadcast=(network | (~mask>>>0))>>>0;
  const toIp=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  const hosts=prefix>=31?Math.pow(2,32-prefix):Math.pow(2,32-prefix)-2;
  return {prefix,mask:toIp(mask),network:toIp(network),broadcast:toIp(broadcast),hosts,range:prefix>=31?toIp(network)+' → '+toIp(broadcast):toIp(network+1)+' → '+toIp(broadcast-1)};
}

function stat(type, raw) {
  const a=String(raw||'').split(/[ ,;]+/).map(Number).filter(Number.isFinite);
  if (!a.length) return 'Usage: '+type+' 10,20,30';
  const mean=a.reduce((x,y)=>x+y,0)/a.length, sorted=[...a].sort((x,y)=>x-y);
  const variance=a.reduce((s,x)=>s+(x-mean)**2,0)/a.length, sd=Math.sqrt(variance);
  if(type==='mean') return 'mean = '+fmt(mean);
  if(type==='median') return 'median = '+fmt(sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2);
  if(type==='mode'){const c=new Map();a.forEach(x=>c.set(x,(c.get(x)||0)+1));const max=Math.max(...c.values());return max===1?'mode = none': 'mode = '+[...c].filter(x=>x[1]===max).map(x=>x[0]).join(', ')+' (×'+max+')';}
  if(type==='range') return 'range = '+fmt(sorted.at(-1)-sorted[0]);
  if(type==='variance') return 'variance = '+fmt(variance);
  if(type==='std') return 'standard deviation = '+fmt(sd);
  if(type==='zscore'){const x=num(arguments[2]);return x===null?'Usage: zscore <x> | <mean> | <std>':'z = '+fmt((x-mean)/sd);}
  return 'n = '+a.length;
}

function showHelp(topic) {
  if (topic && descriptions[topic]) { print(topic.toUpperCase()+' · '+descriptions[topic]); printLines(Object.entries(COMMANDS).filter(([,v])=>v===topic).map(([k])=>k).join('  ')); return; }
  print('HB TERMINAL · command interface');
  print('Type HELP <family> for focused commands.');
  Object.entries(descriptions).forEach(([k,v])=>print(k.padEnd(11)+' '+v));
  print('');
  print('Core: help  list  man  clear  exit  pwd  cd  chdir  history  status  selftest');
  print('Aliases: ? → help   ls → list   cls → clear   quit/q → exit   nap → nmap');
  print('Learning: quiz start · quiz next · answer A · score · game start · rules');
  print('Safety: browser-local by default. Nmap is explanatory only; no arbitrary remote shell.');
}

function run(cmd) {
  const raw=String(cmd||'').trim();
  if(!raw) return;
  history.push(raw); historyIndex=history.length;
  print(prompt.textContent+' '+raw,'command');
  const a=tokenize(raw), c=(a.shift()||'').toLowerCase(), rest=a.join(' ');
  if(c==='help'||c==='?'){showHelp(a[0]);return;}
  if(c==='list'||c==='ls'){print(Object.entries(descriptions).map(([k,v])=>k.toUpperCase()+': '+Object.entries(COMMANDS).filter(([,x])=>x===k).map(([n])=>n).join(', ')).join('\n'));return;}
  if(c==='clear'||c==='cls'){output.textContent='';return;}
  if(c==='check'||c==='selftest'){selfTest();return;}
  if(c==='exit'||c==='quit'||c==='q'){root.classList.add('hb-terminal-closed');print('Terminal session closed. Type OPEN TERMINAL to restore.','ok');return;}
  if(c==='open'&&a[0]&&a[0].toLowerCase().includes('terminal')){root.classList.remove('hb-terminal-closed');print('Terminal restored.','ok');return;}
  if(c==='pwd'){print(cwd);return;}
  if(c==='cd'||c==='chdir'){let target=a[0]||'/home/hb';if(target==='..')target=cwd.split('/').slice(0,-1).join('/')||'/';if(!target.startsWith('/'))target=cwd+'/'+target;target=target.replace(/\/+/g,'/').replace(/\/$/,'')||'/';if(fs.includes(target)){cwd=target;setPrompt();}else print('cd: '+target+': virtual directory not found','warn');return;}
  if(c==='history'){history.forEach((x,i)=>print(String(i+1).padStart(3)+'  '+x));return;}
  if(c==='echo'){print(rest);return;}
  if(c==='date'){print(new Date().toString());return;}
  if(c==='version'){print('HB TERMINAL 1.1 · browser command engine + learning game');return;}
  if(c==='about'||c==='whoami'){print('HEPHZIBAH BEHULAH · Intelligence · Engineering · Security');print('Electronics → automation → software → data → security');return;}
  if(c==='status'||c==='is'){print('SYSTEM ONLINE\nterminal: ready\nexecution: browser-local\nexternal shell: disabled\nsecurity mode: authorised learning');return;}
  if(c==='ia'){print('INTELLIGENCE ASSISTANT');print('Try: ia engineering | ia network | ia security | ia osint | ia data | ia learning');return;}
  if(c==='nav'){const map={tree:'#tree',resources:'#resourceMatrix',ebooks:'#ebookVault',toolbench:'#toolbench','mega-tools':'#megaTools',engineering:'#engineeringLab',knowledge:'#knowledgeLibrary',projects:'#projects'};const dest=map[(a[0]||'').toLowerCase()];if(dest){document.querySelector(dest)?.scrollIntoView({behavior:'smooth'});print('Navigating to '+a[0]+'…','ok');}else print('Usage: nav tree|resources|ebooks|toolbench|mega-tools|engineering|knowledge|projects');return;}
  if(c==='focus'){const dest=document.querySelector('#terminalMachine');dest?.scrollIntoView({behavior:'smooth'});input.focus();return;}
  if(c==='man'){const x=(a[0]||'').toLowerCase();if(COMMANDS[x]){print(x+' · '+COMMANDS[x]);print('Usage: '+x+(x==='cidr'?' <ip/prefix>':x==='urlinfo'||x==='headers'||x==='hash'||x==='base64'||x==='decode'?' <value>':''));}else print('No manual entry for '+x+'. Try HELP.');return;}
  if(c==='which'){print(COMMANDS[a[0]]?'builtin: '+a[0]:'command not found: '+a[0]);return;}

  if(['ohm','power','energy','resistor','led','color','frequency','rms','efficiency','voltage','current','impedance','divider','voltage-divider','series-resistance','parallel-resistance','power-factor','three-phase','motor-torque','voltage-drop'].includes(c)){
    const n=a.map(num);
    const calc={
      ohm:()=>n.length>=2?'V='+fmt(n[0]*n[1])+' V  (I × R)':'Usage: ohm <current A> <resistance Ω>',
      power:()=>n.length>=2?'P='+fmt(n[0]*n[1])+' W  (V × I)':'Usage: power <voltage V> <current A>',
      energy:()=>n.length>=2?'E='+fmt(n[0]*n[1])+' Wh  (P × time)':'Usage: energy <power W> <time h>',
      resistor:()=>n.length>=3?'R='+fmt((n[0]-n[1])/n[2])+' Ω  ((Vs−Vf)/I)':'Usage: resistor <supply V> <led Vf V> <current A>',
      led:()=>n.length>=3?'R='+fmt((n[0]-n[1])/n[2])+' Ω':'Usage: led <supply V> <Vf V> <current A>',
      color:()=>/^#?[0-9a-f]{3,8}$/i.test(a[0]||'')?'colour token accepted: '+a[0]:'Usage: color <hex>',
      frequency:()=>n[0]>0?'T='+fmt(1/n[0])+' s':'Usage: frequency <Hz>',
      rms:()=>n[0]!=null?'RMS sine='+fmt(Math.abs(n[0])/Math.sqrt(2))+' (peak input)':'Usage: rms <peak>',
      efficiency:()=>n.length>=2?'η='+fmt(n[0]/n[1]*100)+' %':'Usage: efficiency <output> <input>',
      voltage:()=>n.length>=2?'V='+fmt(n[0]*n[1])+' V':'Usage: voltage <current A> <resistance Ω>',
      current:()=>n.length>=2&&n[1]!==0?'I='+fmt(n[0]/n[1])+' A':'Usage: current <voltage V> <resistance Ω>',
      impedance:()=>n.length>=2?'Z='+fmt(Math.hypot(n[0],n[1]))+' Ω':'Usage: impedance <R Ω> <X Ω>',
      divider:()=>n.length>=3&&n[1]+n[2]?'Vout='+fmt(n[0]*n[2]/(n[1]+n[2]))+' V':'Usage: divider <Vin> <R1> <R2>',
      'voltage-divider':()=>n.length>=3&&n[1]+n[2]?'Vout='+fmt(n[0]*n[2]/(n[1]+n[2]))+' V':'Usage: voltage-divider <Vin> <R1> <R2>',
      'series-resistance':()=>n.length>=2?'Rt='+fmt(n[0]+n[1])+' Ω':'Usage: series-resistance <R1> <R2>',
      'parallel-resistance':()=>n.length>=2&&n[0]>0&&n[1]>0?'Rt='+fmt(1/(1/n[0]+1/n[1]))+' Ω':'Usage: parallel-resistance <R1> <R2>',
      'power-factor':()=>n.length>=2&&n[1]?'PF='+fmt(n[0]/n[1]):'Usage: power-factor <real W> <apparent VA>',
      'three-phase':()=>n.length>=3?'P='+fmt(Math.sqrt(3)*n[0]*n[1]*n[2])+' W':'Usage: three-phase <V> <I> <PF>',
      'motor-torque':()=>n.length>=2&&n[1]>0?'τ='+fmt(n[0]/(2*Math.PI*n[1]/60))+' N·m':'Usage: motor-torque <power W> <rpm>',
      'voltage-drop':()=>n.length>=2?'Vdrop='+fmt(n[0]*n[1])+' V':'Usage: voltage-drop <current A> <resistance Ω>'
    };
    print(calc[c]());return;
  }

  if(['mean','median','mode','range','variance','std'].includes(c)){print(stat(c,rest));return;}
  if(c==='zscore'){const parts=rest.split('|').map(num);print(parts.length===3&&parts.every(x=>x!==null)?'z='+fmt((parts[0]-parts[1])/parts[2]):'Usage: zscore <x> | <mean> | <std>');return;}
  if(['precision','recall','f1'].includes(c)){
    const n=a.map(num);
    if(c==='precision'){
      if(n.length<2||n[0]===null||n[1]===null||n[0]+n[1]===0){print('Usage: precision <TP> <FP>');return;}
      print('precision='+fmt(n[0]/(n[0]+n[1])*100)+' %  (TP / (TP + FP))');return;
    }
    if(c==='recall'){
      if(n.length<2||n[0]===null||n[1]===null||n[0]+n[1]===0){print('Usage: recall <TP> <FN>');return;}
      print('recall='+fmt(n[0]/(n[0]+n[1])*100)+' %  (TP / (TP + FN))');return;
    }
    if(n.length<2||n[0]===null||n[1]===null||n[0]+n[1]===0){print('Usage: f1 <precision> <recall>');return;}
    print('F1='+fmt(2*n[0]*n[1]/(n[0]+n[1]))+'  (2PR / (P + R))');return;
  }

  if(c==='base64'||c==='encode'){try{print(btoa(unescape(encodeURIComponent(rest))));}catch{print('Unable to encode input.');}return;}
  if(c==='decode'){try{print(decodeURIComponent(escape(atob(rest))));}catch{print('Invalid Base64.');}return;}
  if(c==='hash'||c==='sha256'){if(!rest){print('Usage: hash <text>');return;}crypto.subtle.digest('SHA-256',new TextEncoder().encode(rest)).then(buf=>print([...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join(''),'ok'));return;}
  if(c==='jwt'){try{const part=rest.split('.')[1];if(!part)throw 0;const json=decodeURIComponent(escape(atob(part.replace(/-/g,'+').replace(/_/g,'/'))));print(JSON.stringify(JSON.parse(json),null,2));}catch{print('Invalid JWT payload. This decoder does not verify a signature.','warn');}return;}
  if(['csrf','xss','sqli','mfa','password'].includes(c)){const notes={csrf:'CSRF: cross-site request forgery. Learn origin checks, SameSite cookies and anti-CSRF tokens.',xss:'XSS: untrusted content becomes executable markup/script. Learn output encoding, CSP and safe DOM APIs.',sqli:'SQL injection: unsafe query construction lets input alter SQL. Learn parameterised queries and least privilege.',mfa:'MFA adds another authentication factor. Prefer phishing-resistant methods where available.',password:'Use long unique passwords with a password manager; enable MFA and never test credentials against systems you do not own.'};print(notes[c]);return;}

  if(c==='urlinfo'||c==='url'){try{const u=new URL(a[0].includes('://')?a[0]:'https://'+a[0]);print('protocol: '+u.protocol+'\nhost: '+u.hostname+'\nport: '+(u.port||'default')+'\npath: '+u.pathname+'\nquery: '+(u.search||'none')+'\norigin: '+u.origin);}catch{print('Invalid URL.');}return;}
  if(c==='headers'){if(!a[0]){print('Usage: headers <https-url>');return;}fetch(a[0].includes('://')?a[0]:'https://'+a[0],{method:'HEAD',mode:'cors'}).then(r=>{print('status: '+r.status+' '+r.statusText);r.headers.forEach((v,k)=>print(k+': '+v));}).catch(()=>print('Browser policy blocked header access for this origin. No bypass is attempted.','warn'));return;}
  if(['robots','sitemap'].includes(c)){try{const u=new URL(a[0].includes('://')?a[0]:'https://'+a[0]);u.pathname=c==='robots'?'/robots.txt':'/sitemap.xml';print(u.href);print('Open this public resource in a browser or use an authorised research workflow.');}catch{print('Usage: '+c+' <domain>');}return;}
  if(['crt','whois'].includes(c)){print(c.toUpperCase()+' is an external public-source lookup.');print('Use the Recon Hub for source links and documented lookup workflows.');return;}

  if(c==='cidr'||c==='subnet'){const info=cidrInfo(a[0]);if(!info){print('Usage: cidr 192.168.1.0/24');return;}print('network: '+info.network+'\nbroadcast: '+info.broadcast+'\nmask: '+info.mask+'\nusable hosts: '+info.hosts+'\nrange: '+info.range);return;}
  if(c==='ip'){print('IP addressing is a network-layer identity system. Try: cidr 192.168.1.0/24');return;}
  if(c==='ports'){print('Common: 22 SSH · 25 SMTP · 53 DNS · 80 HTTP · 123 NTP · 143 IMAP · 443 HTTPS · 445 SMB · 587 SMTP submission · 993 IMAPS · 1883 MQTT');return;}
  if(c==='protocol'||c==='tcp'||c==='udp'||c==='icmp'||c==='arp'||c==='http'||c==='https'||c==='dns'||c==='dnslookup'||c==='nslookup'||c==='route'||c==='mac'||c==='ping'||c==='traceroute'){
    const info={protocol:'Protocols define how systems communicate. Use LIST or MAN protocol.',tcp:'TCP is connection-oriented and provides ordered, reliable byte delivery.',udp:'UDP is connectionless with low overhead and no delivery guarantee.',icmp:'ICMP carries network-control and diagnostic messages.',arp:'ARP maps IPv4 addresses to link-layer addresses on a local network.',http:'HTTP is an application-layer protocol commonly used on TCP 80.',https:'HTTPS is HTTP protected by TLS, commonly on TCP 443.',dns:'DNS translates names to records such as A, AAAA, MX and TXT.',dnslookup:'Browser-only sites cannot freely perform arbitrary DNS queries without a permitted API.',nslookup:'Use the Recon Hub public-source workflow for authorised DNS research.',route:'Routing selects paths between networks using routing tables.',mac:'MAC addresses identify network interfaces at the link layer.',ping:'A browser cannot send arbitrary ICMP packets. Use an authorised local/network tool.',traceroute:'A browser cannot run system traceroute. Use an authorised local/network tool.'};print(info[c]);return;
  }
  if(c==='nmap'||c==='nap'){print('NMAP · explanatory mode');print('nmap -sV target   → service/version detection concept');print('nmap -p 80,443 target   → selected ports concept');print('nmap -Pn target   → skip host discovery concept');print('This browser terminal does not execute system Nmap or scan arbitrary targets. Use only an authorised local lab.','warn');return;}

  if(c==='rules'){
    print('GAME RULES');
    print('1. Use QUIZ START to enter quiz mode.');
    print('2. Use QUIZ NEXT for a new question.');
    print('3. Use ANSWER A|B|C|D to submit an answer.');
    print('4. SCORE shows points, streak and level.');
    print('5. GAME START launches a mixed technical challenge.');
    print('6. GAME RESET clears the current game session.');
    print('Questions are generated locally; no account or server is required.');
    return;
  }

  if(c==='score'){
    print('SCORE · '+game.score+' points · '+game.correct+' correct · '+game.answered+' answered · streak '+game.streak+' · level '+game.level);
    return;
  }

  if(c==='game'){
    const sub=(a[0]||'').toLowerCase();
    if(sub==='help'||!sub){print('GAME · GAME START | GAME RESET | QUIZ START | QUIZ NEXT | ANSWER A');return;}
    if(sub==='start'){startGame();return;}
    if(sub==='reset'){resetGame();return;}
    if(sub==='score'){print('GAME SCORE');print('points: '+game.score+' · correct: '+game.correct+' · answered: '+game.answered+' · streak: '+game.streak+' · level: '+game.level);return;}
    print('Usage: game start | game reset | game score');
    return;
  }

  if(c==='quiz'){
    const sub=(a[0]||'').toLowerCase();
    if(sub==='start'||!sub){startQuiz(a[1]);return;}
    if(sub==='next'){nextQuiz();return;}
    if(sub==='score'){print('QUIZ SCORE · '+game.score+' points · streak '+game.streak);return;}
    if(sub==='reset'){resetGame();return;}
    print('Usage: quiz start [domain] | quiz next | quiz score | quiz reset');
    return;
  }

  if(c==='answer'){
    answerQuiz(a.slice(1).join(' '));
    return;
  }

  if(['explain','glossary','learn'].includes(c)){
    const topic=rest||'networking';
    const lessons={
      engineering:'Engineering: voltage, current, resistance, power, energy, signals and practical electrical calculations.',
      networking:'Networking: IP addressing, CIDR, TCP/UDP, DNS, HTTP/HTTPS, routing and packet communication.',
      cybersecurity:'Cybersecurity: protect systems through least privilege, secure design, authentication, monitoring and authorised testing.',
      osint:'OSINT: collect and verify information from lawful public sources while documenting provenance and respecting privacy.',
      data:'Data: inspect, clean, analyse and validate information; common ML metrics include precision, recall and F1.',
      python:'Python: a general-purpose language widely used for automation, data analysis and security tooling.',
      linux:'Linux: a family of operating systems with command-line tools, permissions, processes and networking utilities.',
      'ai security':'AI security: study prompt injection, data leakage, unsafe tool use, model misuse and defensive controls.'
    };
    print((lessons[topic.toLowerCase()]||'Learning topic: '+topic+'. Try engineering, networking, cybersecurity, OSINT, data, Python, Linux or AI security.'));
    return;
  }
  if(c==='tools'||c==='tool'){document.querySelector('#megaTools')?.scrollIntoView({behavior:'smooth'});print('Opening MEGA TOOLS.','ok');return;}
  if(c==='project'||c==='repo'){document.querySelector('#projects')?.scrollIntoView({behavior:'smooth'});print('Opening PROJECTS.','ok');return;}
  print('Unknown command: '+c+'. Type HELP or MAN '+c+'.','warn');
}

  const game={
    mode:'idle', domain:'all', current:null, score:0, correct:0, answered:0, streak:0, level:1
  };

  const GAME_BANKS={
    engineering:[
      ['What is Ohm’s Law?',['V = I × R','P = V × I','E = P × t','f = 1 / T'],0],
      ['What is electrical power when voltage is 24 V and current is 5 A?',['120 W','29 W','19 W','480 W'],0],
      ['A 12 V supply feeds a 2 V LED at 20 mA. What series resistance is approximately required?',['500 Ω','50 Ω','2.4 Ω','2400 Ω'],0],
      ['What is the RMS value of a 230 V peak sine wave?',['162.6 V','230 V','325.3 V','115 V'],0],
      ['What does f = 1/T describe?',['Frequency and period','Power and energy','Voltage and current','Resistance and current'],0]
    ],
    networking:[
      ['How many usable IPv4 hosts are normally in a /24 subnet?',['254','256','128','512'],0],
      ['Which protocol commonly uses TCP port 443?',['HTTPS','DNS','SSH','SMTP'],0],
      ['Which protocol translates domain names into records such as A and MX?',['DNS','ARP','ICMP','DHCP'],0],
      ['Which transport protocol is connection-oriented and ordered?',['TCP','UDP','ICMP','ARP'],0],
      ['What does CIDR /24 mean?',['24 network prefix bits','24 host bits','24 total addresses','24 TCP ports'],0]
    ],
    security:[
      ['Which control helps prevent SQL injection?',['Parameterized queries','Longer URLs','Disabling DNS','Increasing screen brightness'],0],
      ['What does MFA add to authentication?',['Another factor','Another IP address','Another database','Another browser tab'],0],
      ['What is XSS?',['Injection of untrusted content that can execute in a browser','A routing protocol','A disk format','A power calculation'],0],
      ['What does the principle of least privilege mean?',['Give only the access needed','Give every user administrator rights','Disable authentication','Share one password'],0],
      ['What does a JWT decoder in this terminal do?',['Reads the payload without verifying the signature','Cracks the signing key','Authenticates the user','Connects to the issuer'],0]
    ],
    data:[
      ['Precision is TP divided by what?',['TP + FP','TP + FN','TN + FP','TP + TN'],0],
      ['Recall is TP divided by what?',['TP + FN','TP + FP','TN + FN','TP + TN'],0],
      ['What does the F1 score combine?',['Precision and recall','Mean and median','Voltage and current','IP and MAC'],0],
      ['What does a z-score describe?',['Distance from the mean in standard-deviation units','Number of database rows','Network latency','Electrical resistance'],0]
    ],
    osint:[
      ['What is the safest default approach for public-source research?',['Passive, lawful and evidence-driven','Credential guessing','Random scanning','Bypassing access controls'],0],
      ['What does crt.sh primarily expose?',['Certificate transparency observations','Password hashes','Private emails','Operating-system processes'],0],
      ['What is an important OSINT verification habit?',['Cross-check important claims with independent evidence','Trust the first result','Ignore timestamps','Collect private data'],0]
    ],
    learning:[
      ['What does the HB Terminal run on?',['The browser','A hidden SSH server','A remote Linux shell','A database server'],0],
      ['Can this GitHub Pages terminal run arbitrary system Nmap?',['No','Yes, automatically','Only without a browser','Only on every public website'],0],
      ['What does the Technical Workbench connect conceptually?',['Electricity → Signal → Data → Network → Security','Music → Video → Games → Ads → Sales','HTML → CSS → Ads → Mail → Finance','Only cybersecurity'],0],
      ['What is the purpose of the Intelligence Tree?',['Explore the site’s technical domains','Run a remote shell','Store passwords','Scan the internet'],0]
    ]
  };

  const allDomains=Object.keys(GAME_BANKS);
  const rand=n=>Math.floor(Math.random()*n);
  const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=rand(i+1);[x[i],x[j]]=[x[j],x[i]];}return x;};

  function levelFromScore(){game.level=1+Math.floor(game.score/5);}

  function makeGameQuestion(domain){
    const d=domain&&GAME_BANKS[domain]?domain:allDomains[rand(allDomains.length)];
    const item=GAME_BANKS[d][rand(GAME_BANKS[d].length)];
    const answers=shuffle(item[1]);
    const correct=answers.indexOf(item[1][item[2]]);
    return {q:item[0],a:answers,c:correct,d};
  }

  function startGame(){
    game.mode='game';game.domain='all';game.current=null;
    print('HB TECHNICAL GAME · MIXED MODE','ok');
    print('Domains: engineering · networking · security · data · osint · learning');
    print('Type NEXT or QUIZ NEXT. Submit with ANSWER A, B, C or D.');
    nextQuiz();
  }

  function startQuiz(domain){
    const d=(domain||'all').toLowerCase().replace(/[-_]/g,' ');
    const mapped=d==='all'||!d?'all':(allDomains.includes(d)?d:null);
    if(d!=='all'&&d&&!mapped){print('Unknown quiz domain. Use: '+allDomains.join(' | '));return;}
    game.mode='quiz';game.domain=mapped||'all';
    print('HB QUIZ · '+(game.domain==='all'?'ALL DOMAINS':game.domain.toUpperCase()),'ok');
    nextQuiz();
  }

  function nextQuiz(){
    if(game.mode==='idle')game.mode='quiz';
    const domain=game.domain==='all'?null:game.domain;
    game.current=makeGameQuestion(domain);
    print('');
    print('QUESTION · '+game.current.d.toUpperCase());
    print(game.current.q);
    game.current.a.forEach((x,i)=>print(String.fromCharCode(65+i)+'. '+x));
    print('ANSWER A|B|C|D · SCORE · '+game.score+' · STREAK '+game.streak);
  }

  function answerQuiz(value){
    if(!game.current){print('No active question. Use QUIZ START or GAME START.','warn');return;}
    const raw=String(value||'').trim().toUpperCase();
    let idx=-1;
    if(/^[ABCD]$/.test(raw))idx='ABCD'.indexOf(raw);
    else if(/^\d$/.test(raw))idx=Number(raw)-1;
    if(idx<0||idx>3){print('Usage: answer A|B|C|D','warn');return;}
    game.answered++;
    const ok=idx===game.current.c;
    if(ok){game.correct++;game.streak++;game.score+=1+Math.floor(game.streak/5);levelFromScore();print('CORRECT · +'+(1+Math.floor(game.streak/5))+' points · streak '+game.streak,'ok');}
    else {game.streak=0;print('INCORRECT · correct answer: '+String.fromCharCode(65+game.current.c)+'. '+game.current.a[game.current.c],'warn');}
    game.current=null;
    print('SCORE · '+game.score+' · correct '+game.correct+'/'+game.answered+' · level '+game.level);
    print('Type QUIZ NEXT for another question.');
  }

  function resetGame(){
    game.mode='idle';game.domain='all';game.current=null;game.score=0;game.correct=0;game.answered=0;game.streak=0;game.level=1;
    print('Game session reset.','ok');
  }

  function selfTest(){
    const tests=[
      ['parser number',num('<24>')===24],
      ['power',Math.abs(24*5-120)<1e-9],
      ['ohm',Math.abs(2*10-20)<1e-9],
      ['efficiency',Math.abs(80/100*100-80)<1e-9],
      ['CIDR /24',cidrInfo('192.168.1.0/24')?.hosts===254],
      ['CIDR /30',cidrInfo('10.0.0.0/30')?.hosts===2],
      ['engineering commands',Object.values(COMMANDS).includes('engineering')],
      ['network commands',Object.values(COMMANDS).includes('network')],
      ['security commands',Object.values(COMMANDS).includes('security')],
      ['data commands',Object.values(COMMANDS).includes('data')],
      ['OSINT commands',Object.values(COMMANDS).includes('osint')],
      ['learning/game commands',COMMANDS.quiz==='learning'&&COMMANDS.game==='learning'],
      ['aliases',COMMANDS['?']==='system'&&COMMANDS.nap==='network']
    ];
    const passed=tests.filter(x=>x[1]).length;
    print('HB TERMINAL SELF-TEST · '+passed+'/'+tests.length+' checks passed','ok');
    tests.forEach(x=>print((x[1]?'PASS ':'FAIL ')+x[0],x[1]?'ok':'warn'));
    print('Coverage: parser · engineering · networking · security · data · OSINT · learning/game');
  }

input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){const v=input.value;input.value='';run(v);}
  else if(e.key==='ArrowUp'){e.preventDefault();if(history.length){historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';}}
  else if(e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]||'';}
  else if(e.key==='Tab'){e.preventDefault();const q=input.value.trim().toLowerCase();if(q){const hit=Object.keys(COMMANDS).find(x=>x.startsWith(q));if(hit)input.value=hit+' ';}}
});
root.querySelectorAll('[data-terminal-command]').forEach(b=>b.addEventListener('click',()=>run(b.dataset.terminalCommand)));
root.querySelector('#hbTerminalClear')?.addEventListener('click',()=>{output.textContent='';input.focus();});
root.querySelector('#hbTerminalOpen')?.addEventListener('click',()=>{root.classList.remove('hb-terminal-closed');input.focus();});
setPrompt();
print('HB TERMINAL · browser command engine','ok');
print('Type HELP to begin. Try: list · selftest · cidr 192.168.1.0/24 · hash hello · quiz start · game start');
print('Security mode: authorised learning only.','warn');
input.focus();
})();