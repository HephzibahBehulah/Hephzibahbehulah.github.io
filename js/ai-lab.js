/* ADIGUN AI Lab frontend controller. UI is intentionally untouched. */
(function(){
  function boot(){
    const $=s=>document.querySelector(s);
    const messages=$("#aiMessages"),input=$("#aiInput"),send=$("#aiSend"),state=$("#aiState"),platform=$("#platformStatus");
    const attachmentInput=$("#attachmentInput"),attachmentPick=$("#attachmentPick"),attachmentButton=$("#aiAttach");
    const attachmentList=$("#attachmentList"),chips=$("#aiAttachmentChips");
    if(!messages||!input||!send){console.error("ADIGUN AI Lab: required chat elements are missing.");return;}

    const history=(()=>{try{const v=JSON.parse(localStorage.getItem("hb-ai-chats-v4")||"[]");return Array.isArray(v)?v:[]}catch{return[]}})();
    let attachments=[];
    let busy=false;
    const persist=()=>{try{localStorage.setItem("hb-ai-chats-v4",JSON.stringify(history.slice(-40)))}catch{}};
    const session=(()=>{try{let v=localStorage.getItem("hb-ai-session");if(!v){v=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));localStorage.setItem("hb-ai-session",v)}return v}catch{return Date.now().toString(36)}})();

    const projects=[
      ["Water Pump Status Prediction","Machine learning · Python · classification","https://github.com/HephzibahBehulah/Water-Pump-Status-Prediction-ML"],
      ["Loan Approval Analysis","Data analytics · ML · feature exploration","https://github.com/HephzibahBehulah/ReDI2025_ML_Isaac_Loan_Approval_Project"],
      ["Cybersecurity Study Notes","Security foundations · Linux · networking","https://github.com/HephzibahBehulah/cybersecurity-study-notes"],
      ["Prompt Injection Learning Journal","AI security · responsible testing · research","https://github.com/HephzibahBehulah/Prompt-Injection-Learning-Journal"],
      ["TryHackMe GUI","Security lab · Python · learning automation","https://github.com/HephzibahBehulah/Tryhackme-GUI"],
      ["Power BI Samples","Business intelligence · dashboards · analytics","https://github.com/HephzibahBehulah/powerbi-desktop-samples"]
    ];
    const grid=$("#projectGrid");
    if(grid)grid.innerHTML=projects.map(p=>'<article class="project-card"><strong>'+esc(p[0])+'</strong><span>'+esc(p[1])+'</span><a href="'+p[2]+'" target="_blank" rel="noopener">inspect repository ↗</a></article>').join("");

    function add(text,role){
      const e=document.createElement("div");e.className="ai-message "+role;
      if(role==="assistant"&&window.AdigunRenderer&&typeof window.AdigunRenderer.mount==="function"){
        try{window.AdigunRenderer.mount(e,String(text||""))}catch{e.textContent=String(text||"")}
      }else e.textContent=String(text||"");
      messages.appendChild(e);messages.scrollTop=messages.scrollHeight;return e;
    }
    function showThinking(){
      const e=document.createElement("div");e.className="ai-message assistant ai-thinking";e.setAttribute("role","status");e.setAttribute("aria-live","polite");
      e.innerHTML='<span>ADIGUN IS GENERATING</span><i></i><i></i><i></i>';messages.appendChild(e);messages.scrollTop=messages.scrollHeight;
      if(state)state.textContent="● GENERATING";return e;
    }
    function bytesLabel(n){return n<1024*1024?(n/1024).toFixed(1)+" KB":(n/1024/1024).toFixed(1)+" MB"}
    function dataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error||new Error("Could not read file."));r.readAsDataURL(file)})}
    async function prepareFile(file){
      if(file.size>8*1024*1024)throw new Error(file.name+" is larger than 8 MB.");
      const data=await dataUrl(file);
      if(/^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.type))return{name:file.name,size:file.size,type:file.type,part:{type:"input_image",image_url:data,detail:"auto"}};
      return{name:file.name,size:file.size,type:file.type||"application/octet-stream",part:{type:"input_file",filename:file.name,file_data:data}};
    }
    function renderAttachments(){
      if(attachmentList)attachmentList.innerHTML=attachments.length?attachments.map((a,i)=>'<div class="attachment-item"><span>📎</span><strong>'+esc(a.name)+'</strong><small>'+bytesLabel(a.size)+'</small><button type="button" data-remove-attachment="'+i+'" aria-label="Remove '+esc(a.name)+'">×</button></div>').join(""):'<div class="ai-empty">No files attached.</div>';
      if(chips)chips.innerHTML=attachments.map((a,i)=>'<span class="attachment-chip">📎 '+esc(a.name)+' <button type="button" data-remove-attachment="'+i+'">×</button></span>').join("");
      document.querySelectorAll("[data-remove-attachment]").forEach(b=>b.onclick=()=>{attachments.splice(Number(b.dataset.removeAttachment),1);renderAttachments()});
    }
    async function addFiles(fileList){
      for(const file of Array.from(fileList||[])){
        if(attachments.some(a=>a.name===file.name&&a.size===file.size))continue;
        try{attachments.push(await prepareFile(file))}catch(e){add("Attachment error: "+String(e.message||e),"assistant")}
      }
      renderAttachments();
    }
    attachmentPick?.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();attachmentInput?.click()});
    attachmentButton?.addEventListener("click",e=>{e.preventDefault();attachmentInput?.click()});
    attachmentInput?.addEventListener("change",e=>{if(e.target.files?.length)addFiles(e.target.files);e.target.value=""});
    const picker=$("#attachments .ai-attachment-picker");
    ["dragenter","dragover"].forEach(ev=>picker?.addEventListener(ev,e=>{e.preventDefault();picker.classList.add("drag")}));
    ["dragleave","drop"].forEach(ev=>picker?.addEventListener(ev,e=>{e.preventDefault();picker.classList.remove("drag")}));
    picker?.addEventListener("drop",e=>{if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files)});
    messages.addEventListener("dragover",e=>e.preventDefault());
    messages.addEventListener("drop",e=>{e.preventDefault();if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files)});

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
      if(!q&&!attachments.length)return;
      busy=true;send.disabled=true;
      const parts=[];if(q)parts.push({type:"input_text",text:q});parts.push(...attachments.map(a=>a.part));
      add(q||("Attached "+attachments.length+" file"+(attachments.length===1?"":"s")),"user");
      history.push({role:"user",content:parts});input.value="";
      const outgoing=attachments;attachments=[];renderAttachments();
      persist();const thinking=showThinking();
      try{
        const d=await api(history);
        thinking.remove();add(d.answer,"assistant");history.push({role:"assistant",content:String(d.answer)});persist();
        if(state)state.textContent=d.attachments?"● MULTIMODAL ONLINE":(d.ragUsed?"● RAG ONLINE":"● AI ONLINE");
      }catch(e){
        thinking.remove();const message=e?.name==="AbortError"?"ADIGUN AI request timed out. Please try again.":"ADIGUN AI gateway error: "+String(e?.message||e);
        console.error("ADIGUN API error:",e);add(message,"assistant");history.push({role:"assistant",content:message});persist();if(state)state.textContent="● API ERROR";
      }finally{outgoing.length=0;busy=false;send.disabled=false;input.focus();messages.scrollTop=messages.scrollHeight;}
    }
    send.addEventListener("click",ask);
    input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();e.stopPropagation();ask()}});

    async function health(){
      try{const r=await fetch("/api/health",{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(d.ok&&platform)platform.textContent=d.rag==="ai-search-ready"?"● AI + RAG READY":d.mode==="openai-responses"?"● AI ONLINE":"● LOCAL READY";}catch{if(platform)platform.textContent="● AI READY";}
    }
    renderAttachments();health();window.addEventListener("beforeunload",persist);
    console.info("ADIGUN AI Lab chat controller ready.");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
})();