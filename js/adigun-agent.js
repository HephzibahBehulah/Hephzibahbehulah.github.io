(()=>{const sid=(()=>{let x=localStorage.getItem("hb-adigun-session");if(!x){x=crypto.randomUUID?crypto.randomUUID():String(Date.now());localStorage.setItem("hb-adigun-session",x)}return x})();
const memory=window.AdigunMemory?.create("public")||null;
const HISTORY_LIMIT=50;
async function search(q){try{const r=await fetch("/api/site/search?q="+encodeURIComponent(q));const d=await r.json();return(d.hits||[]).map(h=>"["+h.path+"]\n"+h.snippet).join("\n\n").slice(0,12000)}catch{return""}}
function localAnswer(q){const x=String(q||"").trim().toLowerCase();if(/^(who am i|what is my name|what's my name|tell me my name)$/.test(x))return"I do not know your name unless you tell me or share your account context.";if(/what is voltage|define voltage/.test(x))return"Voltage is the electrical potential difference between two points. It is measured in volts (V).";if(/what is current|define current/.test(x))return"Electric current is the rate at which electric charge flows through a circuit. It is measured in amperes (A).";if(/what is resistance|define resistance/.test(x))return"Electrical resistance is the opposition to current flow. It is measured in ohms (Ω).";return null}
function textOnlyHistory(){return memory?memory.getMessages(HISTORY_LIMIT):[]}
async function ask(q,attachments=[],options={}){
  const text=String(q||"").trim();
  const userText=text||"Analyze the attached material."; const persist=options.persist!==false;
  try{
    const siteContext=await search(text||"attached file");
    const prior=textOnlyHistory();
    const current={role:"user",content:[...(text?[{type:"input_text",text}]:[]),...attachments]};
    const messages=[...prior,current];
    const r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json","x-hb-session":sid},body:JSON.stringify({messages,siteContext})});
    const d=await r.json().catch(()=>({}));
    for(const a of d.actions||[]){if(a.action==="navigate")location.href=a.target;if(a.action==="terminal"&&window.HBTerminalExpansion)window.HBTerminalExpansion.run(a.target)}
    if(d?.answer){if(persist&&memory){memory.append("user",userText);memory.append("assistant",String(d.answer))}return d}
    return{ok:false,answer:"ADIGUN AI gateway is currently unavailable. Please try again shortly.",source:"gateway-error",error:d?.error||"AI gateway unavailable",ragUsed:false,actions:[]};
  }catch(e){return{ok:false,answer:"ADIGUN AI gateway is currently unavailable. Please try again shortly.",source:"gateway-error",error:String(e?.message||e),ragUsed:false,actions:[]}}
}
function contextualPrompt(el){const text=String(el?.innerText||el?.textContent||"").replace(/\s+/g," ").trim().slice(0,700);if(!text)return;ask("Explain this item from the Hephzibah Behulah site in practical terms and connect it to the relevant tool or concept: "+text,[],{persist:false}).then(d=>{if(d?.answer){let box=document.getElementById("adigunContextAnswer");if(!box){box=document.createElement("div");box.id="adigunContextAnswer";box.style.cssText="position:fixed;right:18px;bottom:18px;max-width:420px;z-index:99999;padding:14px;border:1px solid rgba(120,160,190,.35);background:rgba(7,12,18,.96);color:#dbeafe;font:13px/1.5 system-ui;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.4)";document.body.appendChild(box)}box.textContent="ADIGUN · "+d.answer;setTimeout(()=>box.remove(),9000)}})}
function nav(q){const x=String(q).toLowerCase();const map=[["terminal","#terminal"],["ai agent","#ai-agent"],["engineering","engineering-library.html"],["recon","recon-hub.html"]];const h=map.find(([k])=>x.includes(k));if(h){location.href=h[1];return true}return false}
async function capabilities(){const r=await fetch("/api/agent/capabilities");return r.json()}
async function analyzeDocument(name,content){const r=await fetch("/api/document/analyze",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,content})});return r.json()}
async function analyzeDataset(name,content){const r=await fetch("/api/dataset/profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,content})});return r.json()}
async function generateReport(title,findings,format="markdown"){const r=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title,findings,format})});return r.json()}
function bindContextual(){}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindContextual);else bindContextual();
window.Adigun={name:"ADIGUN",ask,search,navigate:nav,capabilities,analyzeDocument,analyzeDataset,generateReport,localAnswer,memory};
})();