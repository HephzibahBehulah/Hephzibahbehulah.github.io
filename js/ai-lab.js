document.addEventListener("DOMContentLoaded",()=>{
  const $=s=>document.querySelector(s);
  const messages=$("#aiMessages"),input=$("#aiInput"),send=$("#aiSend"),state=$("#aiState"),platform=$("#platformStatus");
  const attachmentInput=$("#attachmentInput"),attachmentPick=$("#attachmentPick"),attachmentButton=$("#aiAttach");
  const attachmentList=$("#attachmentList"),chips=$("#aiAttachmentChips");
  const history=[];
  let attachments=[];

  const session=(()=>{let v=localStorage.getItem("hb-ai-session");if(!v){v=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);localStorage.setItem("hb-ai-session",v)}return v})();

  const projects=[
    ["Water Pump Status Prediction","Machine learning · Python · classification","https://github.com/HephzibahBehulah/Water-Pump-Status-Prediction-ML"],
    ["Loan Approval Analysis","Data analytics · ML · feature exploration","https://github.com/HephzibahBehulah/ReDI2025_ML_Isaac_Loan_Approval_Project"],
    ["Cybersecurity Study Notes","Security foundations · Linux · networking","https://github.com/HephzibahBehulah/cybersecurity-study-notes"],
    ["Prompt Injection Learning Journal","AI security · responsible testing · research","https://github.com/HephzibahBehulah/Prompt-Injection-Learning-Journal"],
    ["TryHackMe GUI","Security lab · Python · learning automation","https://github.com/HephzibahBehulah/Tryhackme-GUI"],
    ["Power BI Samples","Business intelligence · dashboards · analytics","https://github.com/HephzibahBehulah/powerbi-desktop-samples"]
  ];
  const grid=$("#projectGrid"); if(grid)grid.innerHTML=projects.map(p=>'<article class="project-card"><strong>'+esc(p[0])+'</strong><span>'+esc(p[1])+'</span><a href="'+p[2]+'" target="_blank" rel="noopener">inspect repository ↗</a></article>').join("");

  function add(t,k){
    const e=document.createElement("div");e.className="ai-message "+k;
    if(k==="assistant"&&window.AdigunRenderer)window.AdigunRenderer.mount(e,t);else e.textContent=t;
    messages.appendChild(e);messages.scrollTop=messages.scrollHeight;
  }

  function bytesLabel(n){return n<1024*1024?(n/1024).toFixed(1)+" KB":(n/1024/1024).toFixed(1)+" MB"}
  function dataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error||new Error("read failed"));r.readAsDataURL(file)})}

  async function prepareFile(file){
    if(file.size>8*1024*1024)throw new Error(file.name+" is larger than 8 MB.");
    const data=await dataUrl(file);
    if(/^image\/(png|jpeg|webp|gif)$/i.test(file.type)){
      return {name:file.name,size:file.size,type:file.type,part:{type:"input_image",image_url:data,detail:"auto"}};
    }
    return {name:file.name,size:file.size,type:file.type||"application/octet-stream",part:{type:"input_file",filename:file.name,file_data:data}};
  }

  function renderAttachments(){
    if(attachmentList)attachmentList.innerHTML=attachments.length?attachments.map((a,i)=>'<div class="attachment-item"><span>📎</span><strong>'+esc(a.name)+'</strong><small>'+bytesLabel(a.size)+'</small><button type="button" data-remove="'+i+'" aria-label="Remove '+esc(a.name)+'">×</button></div>').join(""):'<div class="ai-empty">No files attached.</div>';
    if(chips)chips.innerHTML=attachments.map((a,i)=>'<span class="attachment-chip">📎 '+esc(a.name)+' <button type="button" data-remove="'+i+'">×</button></span>').join("");
    document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{attachments.splice(Number(b.dataset.remove),1);renderAttachments()}));
  }

  async function addFiles(fileList){
    for(const file of [...fileList]){
      if(attachments.some(a=>a.name===file.name&&a.size===file.size))continue;
      try{attachments.push(await prepareFile(file))}
      catch(e){add("Attachment error: "+String(e.message||e),"assistant")}
    }
    renderAttachments();
  }
  attachmentPick?.addEventListener("click",e=>{e.stopPropagation();attachmentInput?.click()});
  attachmentButton?.addEventListener("click",()=>attachmentInput?.click());
  attachmentInput?.addEventListener("change",e=>{if(e.target.files.length)addFiles(e.target.files);e.target.value=""});
  const picker=$("#attachments .ai-attachment-picker");
  ["dragenter","dragover"].forEach(ev=>picker?.addEventListener(ev,e=>{e.preventDefault();picker.classList.add("drag")}));
  ["dragleave","drop"].forEach(ev=>picker?.addEventListener(ev,e=>{e.preventDefault();picker.classList.remove("drag")}));
  picker?.addEventListener("drop",e=>{if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files)});
  const drop=$("#aiMessages");
  ["dragover","drop"].forEach(ev=>drop?.addEventListener(ev,e=>{if(ev==="dragover")e.preventDefault()}));
  drop?.addEventListener("drop",e=>{e.preventDefault();if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files)});

  async function ask(){
    const q=input.value.trim();
    if(!q&&!attachments.length)return;
    const content=[];
    if(q)content.push({type:"input_text",text:q});
    content.push(...attachments.map(a=>a.part));
    add(q||("Attached "+attachments.length+" file"+(attachments.length===1?"":"s")),"user");
    history.push({role:"user",content});
    input.value="";state.textContent="● THINKING";send.disabled=true;
    const outgoingAttachments=attachments; attachments=[]; renderAttachments();
    try{
      const siteContext=window.Adigun?.search?await window.Adigun.search(q||"attached file"): "";
      const r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},body:JSON.stringify({messages:history.slice(-10),siteContext})});
      const d=await r.json().catch(()=>({}));
      if(r.ok&&d.answer){
        add(d.answer,"assistant");history.push({role:"assistant",content:d.answer});
        state.textContent=d.attachments?"● MULTIMODAL ONLINE":(d.ragUsed?"● RAG ONLINE":"● AI ONLINE");
        send.disabled=false;return;
      }
      throw new Error(d.error||"AI gateway unavailable");
    }catch(e){
      console.error("ADIGUN API error:",e);
      add("ADIGUN AI gateway error: "+String(e.message||"unknown error"),"assistant");
      state.textContent="● API ERROR";
    }finally{send.disabled=false;outgoingAttachments.length=0}
  }
  send?.addEventListener("click",ask);
  input?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}});

  async function health(){
    try{
      const r=await fetch("/api/health",{cache:"no-store"}),d=await r.json();
      if(d.ok&&platform)platform.textContent=d.rag==="ai-search-ready"?"● AI + RAG READY":d.mode==="openai-responses"?"● AI ONLINE":"● LOCAL READY";
    }catch{}
  }
  health();
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
});