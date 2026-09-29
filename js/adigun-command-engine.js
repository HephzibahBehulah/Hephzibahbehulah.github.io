/* ADIGUN Control Command Engine — browser-safe built-ins and command registry. */
(function(global){
  "use strict";
  const families={
    system:["help","list","man","which","status","version","config","history","clear","selftest","health","reload"],
    website:["site","pages","routes","sitemap","robots","links","metadata","assets","broken-links","redirects","cache","deploy-status","site-health","site-summary","site-assets","site-links"],
    administration:["admin","users","sessions","access","permissions","audit","logs","settings","activity"],
    reconnaissance:["recon","domain","dns","whois","ip","asn","subnet","reverse-dns","certificates","ports","technologies"],
    web:["url","headers","links","endpoints","redirects","forms","scripts","metadata","emails","robots","sitemap"],
    security:["security","tls","headers","csp","hsts","exposure","reputation","vulnerabilities","dependencies","secrets","security-report"],
    cloudflare:["cf","zones","dns","workers","deployments","cache","firewall","access","analytics","edge-status"],
    github:["github","repo","branches","commits","files","issues","prs","actions","workflows","releases","tags","languages","contributors"],
    data:["mean","median","mode","range","sum","min","max","percent","calculate","json","csv","table"],
    engineering:["ohm","power","energy","resistor","voltage","current","frequency","wavelength","convert"],
    osint:["osint","username","company","domain","people","social","urlinfo","reputation"],
    network:["ping","resolve","traceroute","latency","ip","cidr","subnet","ports","portcheck"],
    analysis:["analyze","compare","diff","summarize","correlate","timeline","report","export","investigate","diagnose","agent","ask","research"],
    learning:["quiz","answer","score","game","lesson","explain"],
    utilities:["encode","decode","base64","hash","uuid","timestamp","regex","text","format"]
  };
  const aliases={commands:"help",ls:"list",h:"help",manpage:"man",diag:"selftest",check:"health",cf:"cloudflare",gh:"github",net:"network",sec:"security",urlinfo:"url",cidr:"cidr",subnet:"cidr"};
  const descriptions={
    help:"Show the ADIGUN command registry.",list:"List command families and built-in commands.",man:"Show a manual entry for a command.",which:"Show where a command is implemented.",status:"Show ADIGUN control-plane status.",version:"Show terminal engine version.",config:"Show non-secret runtime configuration.",history:"Show commands used in this browser session.",clear:"Clear the terminal viewport.",selftest:"Run browser-side command-engine self-tests.",health:"Run a safe website health check.",reload:"Reload the control interface.",
    mean:"Calculate arithmetic mean.",median:"Calculate median.",mode:"Calculate mode.",range:"Calculate max minus min.",sum:"Calculate a sum.",min:"Find the minimum.",max:"Find the maximum.",percent:"Calculate a percentage.",calculate:"Evaluate a safe arithmetic expression.",
    ohm:"Calculate voltage, current or resistance using Ohm's law.",power:"Calculate electrical power P = V × I.",energy:"Calculate electrical energy E = P × time.",resistor:"Calculate series resistor value.",voltage:"Calculate V = I × R.",current:"Calculate I = V ÷ R.",frequency:"Calculate frequency from period or cycles/time.",wavelength:"Calculate wavelength λ = c/f.",convert:"Convert common engineering units.",investigate:"Run a private evidence-led investigation and produce a report.",diagnose:"Investigate a website or system problem using authorized diagnostics.",agent:"Ask the private ADIGUN investigation agent to research and analyze.",ask:"Send a task to the private ADIGUN investigation agent.",
    encode:"Base64 encode text.",decode:"Base64 decode text.",base64:"Base64 encode or decode text.",hash:"Calculate a SHA-256 hash.",uuid:"Generate a UUID.",timestamp:"Convert a timestamp or show current UTC time.",regex:"Test a regular expression against text.",text:"Inspect text length and basic statistics.",format:"Format JSON or text data.",
    cidr:"Calculate IPv4 CIDR network information.",ip:"Inspect an IPv4/IPv6 address locally.",url:"Inspect URL structure locally.",urlinfo:"Inspect URL structure locally.",resolve:"Resolve a hostname through the server command engine.",
    site:"Show authorized website control commands.",admin:"Show private administration capabilities.",security:"Show authorized security inspection commands.",github:"Show authorized repository intelligence commands.",cloudflare:"Show edge-control capabilities and safety policy.",osint:"Show public OSINT helper commands.",ping:"Perform an authorized HTTP reachability check against the protected site.",portcheck:"Show the authorized network-port diagnostic policy; no arbitrary target scanning is exposed.",research:"Send a research task to the private ADIGUN agent.",recon:"Run authorized passive reconnaissance against the protected site and repository.","full-recon":"Run the complete authorized passive reconnaissance suite.",nmap:"Raw arbitrary-target Nmap scanning is intentionally disabled.",shodan:"Shodan integration is not configured; no Shodan result will be fabricated."
  };
  const registry={};
  for(const [family,cmds] of Object.entries(families)) for(const command of cmds) registry[command]={family,description:descriptions[command]||family.toUpperCase()+" command: "+command};
  for(const [a,c] of Object.entries(aliases)) registry[a]={family:registry[c]?.family||"system",description:"Alias for "+c+".",alias:c};

  function nums(args){return args.map(Number).filter(Number.isFinite)}
  function fmt(n){return Number.isFinite(n)?String(Number(n.toFixed(12))):String(n)}
  function parseExpression(s){
    const x=String(s||"").replace(/,/g,"").trim();
    if(!x||!/^[0-9+\-*/().%\s]+$/.test(x))throw Error("Only numeric arithmetic is allowed.");
    if(/\*\*|\/\/|%\s*\d+\s*%/.test(x)){};
    return Function("\"use strict\";return ("+x+")")();
  }
  function cidr(input){
    const [raw,p]=String(input||"").split("/"); const prefix=Number(p);
    const parts=raw.split(".").map(Number);
    if(parts.length!==4||parts.some(x=>!Number.isInteger(x)||x<0||x>255)||!Number.isInteger(prefix)||prefix<0||prefix>32)throw Error("Use IPv4 CIDR such as 192.168.1.0/24.");
    const ip=parts.reduce((n,x)=>((n<<8)>>>0)+x,0)>>>0;
    const mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0;
    const network=(ip&mask)>>>0; const broadcast=(network|(~mask))>>>0; const size=2**(32-prefix);
    const str=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
    return {input,network:str(network),broadcast:str(broadcast),prefix,netmask:str(mask),totalAddresses:size,usableHosts:prefix>=31?size:Math.max(0,size-2),firstUsable:prefix>=31?null:str((network+1)>>>0),lastUsable:prefix>=31?null:str((broadcast-1)>>>0)};
  }
  async function sha256(text){const b=new TextEncoder().encode(String(text));const d=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("")}
  function b64e(s){return btoa(unescape(encodeURIComponent(String(s))))}
  function b64d(s){return decodeURIComponent(escape(atob(String(s).trim())))}
  function help(topic){
    if(String(topic||"").toLowerCase()==="all") topic="";
    if(!topic){
      const lines=["ADIGUN CONTROL TERMINAL 1.0","QUICK MEMORY SHEET","","Think: WEBSITE → INTELLIGENCE → SECURITY → CONTROL → DATA","","Type HELP <family> for a family. Type MAN <command> for one command.",""];
      for(const [family,cmds] of Object.entries(families)){lines.push("["+family.toUpperCase()+"]");lines.push(...cmds.slice(0,14).map(c=>"  "+c.padEnd(18)+" "+(descriptions[c]||registry[c].description)));if(cmds.length>14)lines.push("  …  HELP "+family+" for the full list");lines.push("")}
      lines.push("FAST START: HELP | LIST | SELFTEST | STATUS | SITE HEALTH | RECON","SAFETY: production mutations are approval-gated; reconnaissance is target-locked; no arbitrary production shell execution.");
      return lines.join("\n");
    }
    const t=String(topic).toLowerCase();
    if(families[t]) return ["ADIGUN / "+t.toUpperCase(),"",...families[t].map(c=>"  "+c.padEnd(20)+" "+(descriptions[c]||registry[c].description)),"","MAN <command> for details."].join("\n");
    const r=registry[t]; if(r)return man(t);
    return "Unknown help topic: "+topic+"\nTry HELP, HELP SYSTEM, HELP WEBSITE, HELP SECURITY, HELP DATA, HELP NETWORK, or HELP UTILITIES.";
  }
  function man(c){const t=String(c||"").toLowerCase(),r=registry[t];if(!r)return "No manual entry for "+t+".";return [t.toUpperCase()+"(1)","", "NAME", "  "+t+" — "+r.description,"", "FAMILY", "  "+r.family, "", "SYNOPSIS", "  "+t+(t==="help"?" [family|command]":" [arguments...]"),"", "STATUS", "  "+(r.alias?"ALIAS → "+r.alias:"BUILT-IN COMMAND ENGINE")].join("\n")}
  function status(){return ["ADIGUN CONTROL STATUS","────────────────────────────","terminal: ONLINE","command engine: ONLINE","browser built-ins: ONLINE","server reconnaissance: AVAILABLE","production mutation: APPROVAL-GATED","arbitrary production shell: DISABLED","secret access: DISABLED","target policy: AUTHORISED SITE / REPOSITORY ONLY"].join("\n")}
  function websiteHelp(){return ["WEBSITE CONTROL CENTER","","READ / INSPECT","  site health       live website health","  site summary      passive site summary","  pages             page inventory","  routes            route inventory","  assets            asset inventory","  broken-links      link diagnostics","  metadata          metadata inspection","  deploy-status     deployment inspection","","CONTROL POLICY","  Website mutations require explicit approval and a server-side authorised connector.","  ADIGUN will never claim a deployment, edit, purge or rollback that it did not execute and verify."].join("\n")}
  function local(command,args){
    const c=aliases[String(command).toLowerCase()]||String(command).toLowerCase();
    if(c==="help")return help(args[0]); if(c==="list")return help(); if(c==="man")return man(args[0]); if(c==="which")return registry[args[0]]?args[0]+"\n  family: "+registry[args[0]].family+"\n  implementation: built-in command engine":"Command not found: "+args[0];
    if(c==="status")return status(); if(c==="version")return "ADIGUN Control Terminal 1.0\nCommand Engine: 1.0\nRegistry: "+Object.keys(registry).length+" commands";
    if(c==="config")return "CONFIGURATION\n  mode: authenticated private control\n  recon target: https://hephzibahbehulah.com\n  repository: HephzibahBehulah/Hephzibahbehulah.github.io\n  production mutations: approval-gated\n  secrets: server-side only";
    if(c==="website"||c==="site")return websiteHelp();
    if(c==="ping")return fetch("https://hephzibahbehulah.com/",{method:"GET",cache:"no-store",redirect:"follow"}).then(r=>"PING / HTTP REACHABILITY\nstatus = "+r.status+"\nok = "+r.ok+"\nfinal URL = "+r.url); if(c==="security")return help("security"); if(c==="github")return help("github"); if(c==="cloudflare")return help("cloudflare"); if(c==="osint")return help("osint");
    if(c==="mean"||c==="average"){const a=nums(args);if(!a.length)throw Error("Usage: mean <numbers...>");return "mean = "+fmt(a.reduce((x,y)=>x+y,0)/a.length)}
    if(c==="sum"){const a=nums(args);return "sum = "+fmt(a.reduce((x,y)=>x+y,0))}
    if(c==="min"||c==="max"){const a=nums(args);if(!a.length)throw Error("Usage: "+c+" <numbers...>");return c+" = "+fmt(Math[c](...a))}
    if(c==="range"){const a=nums(args);if(!a.length)throw Error("Usage: range <numbers...>");return "range = "+fmt(Math.max(...a)-Math.min(...a))}
    if(c==="median"){const a=nums(args).sort((x,y)=>x-y);if(!a.length)throw Error("Usage: median <numbers...>");const m=Math.floor(a.length/2);return "median = "+fmt(a.length%2?a[m]:(a[m-1]+a[m])/2)}
    if(c==="mode"){const a=nums(args);if(!a.length)throw Error("Usage: mode <numbers...>");const m=new Map();a.forEach(x=>m.set(x,(m.get(x)||0)+1));const mx=Math.max(...m.values());return "mode = "+[...m].filter(x=>x[1]===mx).map(x=>x[0]).join(", ")}
    if(c==="percent"){if(args.length<2)throw Error("Usage: percent <part> <whole>");return "percent = "+fmt(Number(args[0])/Number(args[1])*100)+"%"}
    if(c==="calculate")return "result = "+fmt(parseExpression(args.join(" ")));
    if(c==="ohm"){if(args.length<2)throw Error("Usage: ohm <I> <R>");return "V = "+fmt(Number(args[0])*Number(args[1]))+" V"}
    if(c==="power"){if(args.length<2)throw Error("Usage: power <V> <I>");return "P = "+fmt(Number(args[0])*Number(args[1]))+" W"}
    if(c==="energy"){if(args.length<2)throw Error("Usage: energy <P> <time>");return "E = "+fmt(Number(args[0])*Number(args[1]))+" Wh (if time is hours)"}
    if(c==="resistor"){if(args.length<3)throw Error("Usage: resistor <Vs> <Vf> <I>");return "R = "+fmt((Number(args[0])-Number(args[1]))/Number(args[2]))+" Ω"}
    if(c==="voltage"){if(args.length<2)throw Error("Usage: voltage <I> <R>");return "V = "+fmt(Number(args[0])*Number(args[1]))+" V"}
    if(c==="current"){if(args.length<2)throw Error("Usage: current <V> <R>");return "I = "+fmt(Number(args[0])/Number(args[1]))+" A"}
    if(c==="frequency"){if(args.length<1)throw Error("Usage: frequency <period> or frequency <cycles> <time>");return args.length===1?"f = "+fmt(1/Number(args[0]))+" Hz":"f = "+fmt(Number(args[0])/Number(args[1]))+" Hz"}
    if(c==="wavelength"){if(args.length<1)throw Error("Usage: wavelength <frequencyHz>");return "λ = "+fmt(299792458/Number(args[0]))+" m"}
    if(c==="convert"){if(args.length<2)throw Error("Usage: convert <value> <unit>");const v=Number(args[0]),u=args[1].toLowerCase();const m={km:v=>v*1000,m:v=>v,cm:v=>v/100,mm:v=>v/1000,mi:v=>v*1609.344,ft:v=>v*.3048,in:v=>v*.0254,mhz:v=>v*1e6,khz:v=>v*1e3,ghz:v=>v*1e9};if(!m[u])throw Error("Supported units: km m cm mm mi ft in kHz MHz GHz");return u+" → SI = "+fmt(m[u](v))}
    if(c==="encode"||c==="base64")return "base64 = "+b64e(args.join(" "));
    if(c==="decode")return "text = "+b64d(args.join(" "));
    if(c==="hash")return sha256(args.join(" ")).then(x=>"SHA-256 = "+x);
    if(c==="uuid")return crypto.randomUUID();
    if(c==="timestamp")return args.length?new Date(Number(args[0])||args[0]).toISOString():new Date().toISOString();
    if(c==="regex"){if(args.length<2)throw Error("Usage: regex <pattern> <text>");const pattern=args[0],text=args.slice(1).join(" ");const re=new RegExp(pattern);return "match = "+re.test(text)+"\npattern = "+pattern+"\ntext length = "+text.length}
    if(c==="text"){const t=args.join(" ");return "characters = "+t.length+"\nwords = "+(t.trim()?t.trim().split(/\s+/).length:0)+"\nlines = "+(t? t.split(/\n/).length:0)}
    if(c==="format"){const t=args.join(" ");try{return JSON.stringify(JSON.parse(t),null,2)}catch{return t}}
    if(c==="json")return JSON.stringify(args.join(" "),null,2);
    if(c==="cidr")return JSON.stringify(cidr(args[0]),null,2);
    if(c==="ip"){const x=args[0]||"";const ipv4=/^(?:\d{1,3}\.){3}\d{1,3}$/.test(x);const valid=ipv4&&x.split(".").every(n=>Number(n)<=255);return "address = "+x+"\nIPv4 = "+valid+"\nIPv6 = "+(!ipv4&&x.includes(":"));}
    if(c==="url"||c==="urlinfo"){const u=new URL(args[0]);return JSON.stringify({href:u.href,protocol:u.protocol,hostname:u.hostname,port:u.port||null,path:u.pathname,query:u.search||null,hash:u.hash||null},null,2)}
    if(c==="selftest"){const tests=[];for(const [name,fn] of [["cidr",()=>cidr("192.168.1.0/24").usableHosts===254],["mean",()=>local("mean",["2","4"])==="mean = 3"],["power",()=>local("power",["230","2"]).startsWith("P = 460")],["base64",()=>b64d(b64e("hello"))==="hello"]]){try{tests.push({name,ok:Boolean(fn())})}catch(e){tests.push({name,ok:false,error:e.message})}}return "SELFTEST\n"+tests.map(x=>(x.ok?"✓":"✗")+" "+x.name+(x.error?" — "+x.error:"")).join("\n")}
    if(c==="health")return "Use SITE HEALTH for the live authorized website check.\nThe terminal engine is online.";
    if(c==="portcheck")return "PORT DIAGNOSTICS\nTarget policy: authorized Hephzibah Behulah assets only.\nRaw arbitrary-target port scanning is disabled.\nUse INVESTIGATE for an evidence-led authorized diagnostic.";
    if(c==="reload")return "Reload requested. Use the browser refresh control to complete the reload.";
    if(c==="research")return "Use: research <question> — routes the task to the private ADIGUN agent.";
    if(c==="nmap")return "NMAP INTERFACE\nRaw arbitrary-target scanning is intentionally disabled.\nUse authorized reconnaissance commands such as RECON, DNS, HTTP-STATUS, SECURITY-HEADERS, or INVESTIGATE.";
    if(c==="shodan")return "SHODAN\nNo Shodan API is configured. No external Shodan result will be fabricated.";
    if(c==="quiz"||c==="game"||c==="lesson"||c==="explain")return "LEARNING ENGINE\nUse: quiz start · quiz score · lesson <topic> · explain <topic>.\nLearning commands are browser-local and do not perform remote execution.";
    if(c==="admin"||c==="users"||c==="sessions"||c==="access"||c==="permissions"||c==="audit"||c==="logs"||c==="settings"||c==="activity")return "ADMINISTRATION\nThis command is part of the ADIGUN control registry. Read-only administration is available through the authenticated server API; state-changing operations require explicit approval.";
    return null;
  }
  global.AdigunCommandEngine={families,registry,help,man,local,resolve:c=>aliases[String(c||"").toLowerCase()]||String(c||"").toLowerCase()};
})(window);
