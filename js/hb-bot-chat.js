(()=>{"use strict";
if(window.HBBotChat)return;
const boot=()=>{
  if(document.getElementById("hbBotWindow"))return;
  const privatePage=location.hostname==="admin.hephzibahbehulah.com"||document.documentElement.dataset.hbPrivate==="true";
  const engineering=location.hostname.startsWith("engineering.")||location.pathname.startsWith("/engineering/");
  const cyber=location.hostname.startsWith("cyber.")||location.pathname.startsWith("/cyber/");
  const root=document.createElement("div");
  root.innerHTML=`
<button class="hb-bot-launcher" id="hbBotLauncher" aria-label="Open ADIGUN website chat" aria-expanded="false" title="Ask ADIGUN"><span>AI</span><i class="hb-bot-dot"></i></button>
<section class="hb-bot-window" id="hbBotWindow" role="dialog" aria-label="ADIGUN website chat" aria-hidden="true">
<header class="hb-bot-head"><div class="hb-bot-brand"><div class="hb-bot-core">AI</div><div class="hb-bot-title"><strong>ADIGUN</strong><span>PUBLIC WEBSITE ASSISTANT</span></div></div><div class="hb-bot-actions"><button id="hbBotFull" title="Open full AI">↗</button><button id="hbBotClear" title="Clear chat">⌫</button><button id="hbBotClose" title="Close chat">×</button></div></header>
<div class="hb-bot-status"><b>● ONLINE</b> · GENERAL KNOWLEDGE · SITE INTELLIGENCE</div>
<div class="hb-bot-messages" id="hbBotMessages"></div>
<div class="hb-bot-suggestions" id="hbBotSuggestions"><button>What is this website?</button><button>Explain cybersecurity</button><button>What can you help me with?</button></div>
<form class="hb-bot-composer" id="hbBotForm"><textarea id="hbBotInput" rows="1" placeholder="Ask ADIGUN anything…" autocomplete="off"></textarea><button class="hb-bot-send" id="hbBotSend" type="submit" aria-label="Send">→</button></form>
<footer class="hb-bot-footer"><span>PUBLIC AI · NO ADMIN ACCESS</span><span>ADIGUN</span></footer>
</section>`;
  document.body.appendChild(root);
  root.querySelector(".hb-bot-title span").textContent=privatePage?"PRIVATE ADIGUN SI":engineering?"ENGINEERING ASSISTANT":cyber?"CYBER LEARNING ASSISTANT":"PUBLIC WEBSITE ASSISTANT";
  root.querySelector(".hb-bot-footer span").textContent=privatePage?"OWNER WORKSPACE · VERIFIED ADMIN TOOLS":"HEPHZIBAH BEHULAH · PUBLIC ASSISTANCE";
  root.querySelector(".hb-bot-status").textContent="ADIGUN · READY FOR YOUR QUESTION";
  const launcher=root.querySelector("#hbBotLauncher"), win=root.querySelector("#hbBotWindow"), msgs=root.querySelector("#hbBotMessages"), input=root.querySelector("#hbBotInput"), form=root.querySelector("#hbBotForm"), send=root.querySelector("#hbBotSend");
  const add=(text,role="bot")=>{const el=document.createElement("div");el.className="hb-bot-msg "+role;el.textContent=text;msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;return el};
  const welcome="Welcome to Hephzibah Behulah. ADIGUN online. I can answer general questions and help you explore the Hephzibah Behulah website, projects, cybersecurity, data, Linux, networking and other technical topics. What would you like to know?";
  add(welcome);
  const open=()=>{win.classList.add("open");win.setAttribute("aria-hidden","false");launcher.setAttribute("aria-expanded","true");setTimeout(()=>input.focus(),80)};
  const close=()=>{win.classList.remove("open");win.setAttribute("aria-hidden","true");launcher.setAttribute("aria-expanded","false")};
  launcher.addEventListener("click",()=>win.classList.contains("open")?close():open());
  root.querySelector("#hbBotClose").addEventListener("click",close);
  root.querySelector("#hbBotFull").addEventListener("click",()=>location.href=privatePage?"/admin#operator":engineering?"/academy-workbench":cyber?"/#content":"/ai-agent.html");
  root.querySelector("#hbBotClear").addEventListener("click",()=>{if(window.Adigun?.memory)window.Adigun.memory.clear();msgs.innerHTML="";add("Chat memory cleared. Start a new conversation.");});
  root.querySelectorAll("#hbBotSuggestions button").forEach(b=>b.addEventListener("click",()=>{input.value=b.textContent;form.requestSubmit()}));
  input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
  form.addEventListener("submit",async e=>{
    e.preventDefault();const q=input.value.trim();if(!q||send.disabled)return;
    add(q,"user");input.value="";send.disabled=true;
    const thinking=add("","bot");thinking.innerHTML='<span class="hb-bot-thinking"><i></i><i></i><i></i></span>';
    try{
      let d;
      const path=privatePage?"/api/admin/agent":engineering?"/api/engineering/chat":cyber?"/api/cyber/chat":"/api/chat";
      const body=privatePage?{task:q}:cyber?{question:q}:{messages:[{role:"user",content:q}],language:window.HBLanguage?.get?.()||"en"};
      const response=await fetch(path,{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(90000)});
      if(!response.ok)throw Error((await response.json().catch(()=>({}))).error||"Assistant request failed");
      if(response.headers.get("content-type")?.includes("text/event-stream")){
        const reader=response.body.getReader(),decoder=new TextDecoder();let buffer="",answer="";
        while(true){
          const chunk=await reader.read();
          buffer+=decoder.decode(chunk.value||new Uint8Array(),{stream:!chunk.done});
          const lines=buffer.split(/\r?\n/);buffer=lines.pop()||"";
          for(const line of lines){
            if(!line.startsWith("data:"))continue;
            const data=line.slice(5).trim();if(!data||data==="[DONE]")continue;
            try{const piece=JSON.parse(data).response;if(typeof piece==="string"){answer+=piece;thinking.textContent=answer;}}catch{}
          }
          if(chunk.done)break;
        }
        if(!answer)throw Error("The assistant returned an empty response.");
        d={answer};
      }else{d=await response.json();if(d.error&&!d.ok)throw Error(d.error);}

      thinking.remove();
      add(d?.answer||"I could not complete that request. Please try again.");
    }catch(err){thinking.remove();add(String(err.message||"ADIGUN is temporarily unavailable. Please try again shortly."));}
    finally{send.disabled=false;input.focus()}
  });
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.HBBotChat={open:()=>document.getElementById("hbBotLauncher")?.click()};
})();