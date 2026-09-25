/* HB GLOBAL SEARCH ENGINE
   Searches rendered site content, tools, resources, lessons, projects, formulas,
   Intelligence Tree nodes, Terminal commands and generated cards.
*/
document.addEventListener("DOMContentLoaded",function(){
  const input=document.getElementById("globalResourceSearch");
  if(!input)return;

  const css=document.createElement("link");
  css.rel="stylesheet";
  css.href="css/hb-global-search.css?v=20260925-1";
  document.head.appendChild(css);

  const overlay=document.createElement("div");
  overlay.className="hb-global-search-overlay";
  overlay.innerHTML='<div class="hb-global-search-panel" role="dialog" aria-modal="true" aria-label="Search everything"><div class="hb-global-search-head"><span>GLOBAL SEARCH</span><button class="hb-global-search-close" type="button" aria-label="Close search">×</button></div><div class="hb-global-search-meta"></div><div class="hb-global-search-results"></div></div>';
  document.body.appendChild(overlay);

  const meta=overlay.querySelector(".hb-global-search-meta");
  const results=overlay.querySelector(".hb-global-search-results");
  const close=overlay.querySelector(".hb-global-search-close");
  let lastResults=[];

  const terminalCommands=[
    "HELP","LIST","CLEAR","EXIT","PWD","CD","CHDIR","HISTORY","ECHO","DATE","VERSION","ABOUT","TREE","STATUS","WHOAMI","MAN","WHICH","IA","IS","NAV","OPEN","FOCUS",
    "OHM","POWER","ENERGY","RESISTOR","LED","COLOR","FREQUENCY","RMS","EFFICIENCY","VOLTAGE","CURRENT","IMPEDANCE","DIVIDER","VOLTAGE-DIVIDER","SERIES-RESISTANCE","PARALLEL-RESISTANCE","POWER-FACTOR","THREE-PHASE","MOTOR-TORQUE","VOLTAGE-DROP",
    "MEAN","MEDIAN","MODE","RANGE","VARIANCE","STD","ZSCORE","PRECISION","RECALL","F1",
    "BASE64","ENCODE","DECODE","HASH","SHA256","JWT","CSRF","XSS","SQLI","MFA","PASSWORD",
    "URLINFO","URL","HEADERS","ROBOTS","SITEMAP","CRT","WHOIS",
    "IP","CIDR","SUBNET","PORTS","PROTOCOL","TCP","UDP","ICMP","ARP","HTTP","HTTPS","DNS","DNSLOOKUP","NSLOOKUP","ROUTE","MAC","PING","TRACEROUTE","NMAP","NAP",
    "QUIZ","ANSWER","SCORE","RULES","CHECK","SELFTEST","GAME","EXPLAIN","GLOSSARY","LEARN","TOOLS","TOOL","PROJECT","REPO",
    "CONVERT","FORMULA","FORMULAS","SOLVE","GRAPH","PLOT","WAVEFORM","SIMULATE","SIM","CASE","IOC","SEARCH","FIND","LOOKUP","RELATED","PROFILE","PROGRESS","LEVEL","STREAK","XP","BADGES","SKILLS","WEAKNESS","MASTERED",
    "CAPACITOR","INDUCTOR","REACTANCE","ADMITTANCE","RESISTIVITY","CONDUCTIVITY","APPARENT-POWER","REACTIVE-POWER","REAL-POWER","KVA","KVAR","KWH","CABLE-SIZE","FUSE","BREAKER","SHORT-CIRCUIT","FAULT-CURRENT","DIODE","ZENER","TRANSISTOR","MOSFET","BJT","RECTIFIER","FILTER","RC","RL","RLC","LOWPASS","HIGHPASS","BANDPASS","NOTCH","GAIN","DECIBEL","ADC","DAC","PWM","DUTY","SAMPLING","NYQUIST","RPM","PLC","LADDER","RELAY","CONTACTOR","SENSOR","ACTUATOR","PID","SETPOINT",
    "MIN","MAX","SUM","COUNT","PERCENT","PERCENTILE","QUARTILE","IQR","MAD","COVARIANCE","CORRELATION","SKEW","KURTOSIS","NORMALIZE","STANDARDIZE","MINMAX","OUTLIER","BIN","DISTRIBUTION","ACCURACY","CONFUSION","TP","TN","FP","FN","ROC","AUC","LOGLOSS","MAE","MSE","RMSE","R2","MAPE",
    "HOSTS","NETWORK","BROADCAST","FIRST-HOST","LAST-HOST","WILDCARD","PREFIX","MASK","IPTYPE","IPVERSION","PRIVATE-IP","PUBLIC-IP","LOOPBACK","MULTICAST","IPV6","IPV6-CIDR","IPV6-COMPRESS","IPV6-EXPAND","IPV6-TYPE","PACKET","FRAME","MTU","MSS","TCP-HANDSHAKE","TCP-FLAGS","TCP-STATE","TLS",
    "SSRF","XXE","IDOR","CORS","CSP","SESSION","COOKIE","AUTH","AUTHZ","SALT","PEPPER","PHISHING","MITM","CERT","SHA512","MD5","HEX","BINARY","ASCII","URLENCODE","URLDECODE","ROT13","ROT47","CAESAR","XOR","UUID","RANDOM","ENTROPY","AES","RSA","ECC","HMAC","PBKDF2","ARGON2","NONCE","IV","KEY","DIGEST","SIGNATURE",
    "DOMAIN","URL-PARSE","URL-DECODE","DOMAIN-PARSE","SUBDOMAIN","CERTIFICATE","DNS-RECORD","MX","TXT","NS","CAA","SECURITY-TXT","WAYBACK","ASN","IPINFO","EVIDENCE","TIMELINE","IOC-TYPE","IOC-EXTRACT","DOMAIN-EXTRACT","IP-EXTRACT","HASH-EXTRACT","URL-EXTRACT",
    "FILE","MAGIC","TIMESTAMP","METADATA","ENCODING","LOG","LOG-PARSE","HTML","CSS","JS","DOM","JSON","API","REST","FETCH","PROMISE","ASYNC","EVENT","LOCALSTORAGE","SESSIONSTORAGE","JSON-FORMAT","JSON-MINIFY","JSON-VALIDATE","HTML-ESCAPE","HTML-UNESCAPE",
    "GIT","GITHUB","CLONE","COMMIT","BRANCH","MERGE","PULL","PUSH","FETCH","REMOTE","DIFF","RESET","REBASE","PYTHON","PY","VARIABLE","ARRAY","LIST","DICT","TUPLE","SET","LOOP","FUNCTION","CLASS","IMPORT","EXCEPTION","PANDAS","NUMPY","SKLEARN",
    "AI","LLM","PROMPT","TOKEN","CONTEXT","RAG","EMBEDDING","VECTOR","GUARDRAIL","JAILBREAK","PROMPT-INJECTION","DATA-POISONING","MODEL-EXTRACTION"
  ];

  function clean(value){return String(value||"").replace(/\s+/g," ").trim();}
  function sectionFor(el){
    const section=el.closest("section[id]");
    if(!section)return "Website";
    const heading=section.querySelector("h1,h2,h3,.os-panel-head span");
    return clean(heading?.textContent||section.id);
  }
  function add(items,seen,el,text,section,target){
    text=clean(text);
    if(!text||text.length<2)return;
    const key=(target||el?.id||"")+"|"+text.slice(0,260);
    if(seen.has(key))return;
    seen.add(key);items.push({el,text,section,target:target||el?.id||""});
  }
  function buildIndex(){
    const items=[],seen=new Set();
    document.querySelectorAll("main section[id],main article,main .os-panel,main .resource-hub,main .os-item,main .intel-card,main .ebook-card,main .engineering-card,main .micro-tool-row,main .hb-equation,main .hb-workbench-panel,main .os-node,main .os-leaf,main button,main a").forEach(function(el){
      if(el===input||overlay.contains(el))return;
      add(items,seen,el,el.innerText||el.textContent,sectionFor(el),el.id);
    });
    terminalCommands.forEach(function(command){
      add(items,seen,null,command+" · HB Terminal command","HB TERMINAL","terminal");
    });
    return items;
  }
  function score(item,query){
    const words=query.split(/\s+/).filter(Boolean),hay=item.text.toLowerCase(),section=item.section.toLowerCase();
    let total=0;
    for(const word of words){
      const pos=hay.indexOf(word);
      if(pos<0)return -9999;
      total+=pos===0?45:12;
      if(hay.startsWith(word))total+=20;
      if(section.includes(word))total+=15;
    }
    return total;
  }
  function openResult(item){
    overlay.classList.remove("open");
    if(item.target){
      const el=document.getElementById(item.target);
      if(el){
        el.scrollIntoView({behavior:"smooth",block:"center"});
        el.classList.add("hb-search-hit");
        setTimeout(()=>el.classList.remove("hb-search-hit"),1100);
        return;
      }
    }
    const terminal=document.getElementById("terminal");
    if(terminal)terminal.scrollIntoView({behavior:"smooth",block:"center"});
  }
  async function askAdigun(query){try{meta.textContent="ADIGUN / THINKING";results.innerHTML='<div class="hb-global-empty">ADIGUN is searching site intelligence and the public knowledge layer…</div>';overlay.classList.add("open");const d=await window.Adigun?.ask?.(query);results.innerHTML='<div class="hb-global-result" style="cursor:default"><span class="hb-global-result-title">ADIGUN</span><strong>'+clean(d?.answer||"No answer returned.")+'</strong></div>';}catch{results.innerHTML='<div class="hb-global-empty">ADIGUN could not answer this query.</div>';}}
  function render(raw){
    const query=clean(raw).toLowerCase();
    if(!query){
      meta.textContent="Search everything: resources, tools, books, formulas, engineering, security, OSINT, projects, lessons and Terminal commands.";
      results.innerHTML="";
      overlay.classList.add("open");
      return;
    }
    lastResults=buildIndex().map(item=>({item,score:score(item,query)})).filter(x=>x.score>-5000).sort((a,b)=>b.score-a.score).slice(0,80);
    meta.textContent=lastResults.length+" result"+(lastResults.length===1?"":"s")+" found";
    results.innerHTML=lastResults.length?lastResults.map((x,i)=>{
      const snippet=x.item.text.length>190?x.item.text.slice(0,190)+"…":x.item.text;
      return '<button class="hb-global-result" type="button" data-index="'+i+'"><span class="hb-global-result-title">'+clean(x.item.section)+'</span><strong>'+clean(snippet)+'</strong></button>';
    }).join(""):'<div class="hb-global-empty">No matching content found. Try a broader keyword.</div>';
    overlay.classList.add("open");
  }

  input.addEventListener("input",function(event){
    event.stopImmediatePropagation();
    render(input.value);
  },true);
  input.addEventListener("focus",function(){render(input.value);});
  input.addEventListener("keydown",function(event){
    if(event.key==="Escape"){event.preventDefault();overlay.classList.remove("open");input.blur();}
    if(event.key==="Enter"){event.preventDefault();if(lastResults[0])openResult(lastResults[0].item);else askAdigun(query);}
  });
  results.addEventListener("click",function(event){
    const button=event.target.closest("[data-index]");
    if(button){const hit=lastResults[Number(button.dataset.index)];if(hit)openResult(hit.item);}
  });
  close.addEventListener("click",function(){overlay.classList.remove("open");input.blur();});
  overlay.addEventListener("click",function(event){if(event.target===overlay){overlay.classList.remove("open");input.blur();}});
  document.addEventListener("keydown",function(event){if(event.key==="Escape"&&overlay.classList.contains("open")){overlay.classList.remove("open");input.blur();}});
});