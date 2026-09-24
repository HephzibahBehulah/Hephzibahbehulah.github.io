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
  quiz:'learning', explain:'learning', glossary:'learning', learn:'learning',
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
  const n = Number(x);
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
  print('Core: help  list  man  clear  exit  pwd  cd  chdir  history  status');
  print('Aliases: ? → help   ls → list   cls → clear   quit/q → exit   nap → nmap');
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
  if(c==='exit'||c==='quit'||c==='q'){root.classList.add('hb-terminal-closed');print('Terminal session closed. Type OPEN TERMINAL to restore.','ok');return;}
  if(c==='open'&&a[0]&&a[0].toLowerCase().includes('terminal')){root.classList.remove('hb-terminal-closed');print('Terminal restored.','ok');return;}
  if(c==='pwd'){print(cwd);return;}
  if(c==='cd'||c==='chdir'){let target=a[0]||'/home/hb';if(target==='..')target=cwd.split('/').slice(0,-1).join('/')||'/';if(!target.startsWith('/'))target=cwd+'/'+target;target=target.replace(/\/+/g,'/').replace(/\/$/,'')||'/';if(fs.includes(target)){cwd=target;setPrompt();}else print('cd: '+target+': virtual directory not found','warn');return;}
  if(c==='history'){history.forEach((x,i)=>print(String(i+1).padStart(3)+'  '+x));return;}
  if(c==='echo'){print(rest);return;}
  if(c==='date'){print(new Date().toString());return;}
  if(c==='version'){print('HB TERMINAL 1.0 · browser command engine');return;}
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
  if(['precision','recall','f1'].includes(c)){const n=a.map(num);if(n.length<2){print('Usage: '+c+' <value1> <value2>');return;}const p=n[0],r=n[1];print(c==='precision'?'precision='+fmt(p/(p+r)*100)+' %':c==='recall'?'recall='+fmt(p/(p+r)*100)+' %':'F1='+fmt(2*p*r/(p+r)*100)+' %');return;}

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

  if(['quiz','explain','glossary','learn'].includes(c)){print('Learning mode: '+(rest||'choose a topic such as networking, Linux, OSINT, Python or cybersecurity.'));return;}
  if(c==='tools'||c==='tool'){document.querySelector('#megaTools')?.scrollIntoView({behavior:'smooth'});print('Opening MEGA TOOLS.','ok');return;}
  if(c==='project'||c==='repo'){document.querySelector('#projects')?.scrollIntoView({behavior:'smooth'});print('Opening PROJECTS.','ok');return;}
  print('Unknown command: '+c+'. Type HELP or MAN '+c+'.','warn');
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
print('Type HELP to begin. Try: list · status · ia · cidr 192.168.1.0/24 · hash hello');
print('Security mode: authorised learning only.','warn');
input.focus();
})();