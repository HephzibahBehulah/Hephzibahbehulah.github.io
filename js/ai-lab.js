/* ADIGUN AI Lab frontend controller. UI is intentionally untouched. */
(function(){
  function boot(){
    const $=s=>document.querySelector(s);
    const messages=$("#aiMessages"),input=$("#aiInput"),send=$("#aiSend"),state=$("#aiState"),platform=$("#platformStatus");
    async function api(historyToSend){
      const siteContext=window.Adigun&&typeof window.Adigun.search==="function"?await window.Adigun.search(historyToSend[historyToSend.length-1]?.content||"attached file"):"";
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),120000);
      try{
        const r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",signal:controller.signal,body:JSON.stringify({messages:historyToSend.slice(-10),siteContext})});
        const raw=await r.text();let d={};try{d=raw?JSON.parse(raw):{}}catch{throw new Error("AI gateway returned invalid JSON (HTTP "+r.status+").")}
        if(!r.ok||!d.answer)throw new Error(d.error||("AI gateway unavailable (HTTP "+r.status+")."));
        return d;
      }finally{clearTimeout(timer)}
    }

    async function ask(){
      if(busy)return;
      const q=String(input.value||"").trim();
      if(!q)return;
      busy=true;send.disabled=true;
      add(q,"user");
      history.push({role:"user",content:q});input.value="";
      persist();const thinking=showThinking();
      try{
        const d=await api(history);
        thinking.remove();add(d.answer,"assistant");history.push({role:"assistant",content:String(d.answer)});persist();
        if(state)state.textContent=d.attachments?"● MULTIMODAL ONLINE":(d.ragUsed?"● RAG ONLINE":"● AI ONLINE");
      }catch(e){
        thinking.remove();const message=e?.name==="AbortError"?"ADIGUN AI request timed out. Please try again.":"ADIGUN AI gateway error: "+String(e?.message||e);
        console.error("ADIGUN API error:",e);add(message,"assistant");history.push({role:"assistant",content:message});persist();if(state)state.textContent="● API ERROR";
      }finally{busy=false;send.disabled=false;input.focus();messages.scrollTop=messages.scrollHeight;}
    }
    send.addEventListener("click",ask);
    input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();e.stopPropagation();ask()}});

    async function health(){
      try{const r=await fetch("/api/health",{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(d.ok&&platform)platform.textContent=d.rag==="ai-search-ready"?"● AI + RAG READY":d.mode==="openai-responses"?"● AI ONLINE":"● LOCAL READY";}catch{if(platform)platform.textContent="● AI READY";}
    }
    health();window.addEventListener("beforeunload",persist);
    console.info("ADIGUN AI Lab chat controller ready.");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
})();