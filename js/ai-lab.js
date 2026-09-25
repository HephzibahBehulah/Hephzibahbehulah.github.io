document.addEventListener("DOMContentLoaded",()=>{
  const input=document.getElementById("aiInput"), send=document.getElementById("aiSend"), messages=document.getElementById("aiMessages"), state=document.getElementById("aiState");
  if(!input||!send||!messages)return;
  const add=(text,kind)=>{const el=document.createElement("div");el.className="ai-message "+kind;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight};
  const submit=()=>{
    const q=input.value.trim(); if(!q)return;
    add(q,"user"); input.value="";
    state.textContent="● LOCAL DEMO";
    setTimeout(()=>add("The interface is connected to the future AI gateway, but live model access is not enabled yet. Your question can be routed to RAG, project search, data analysis or an approved tool once the backend provider is configured.","assistant"),260);
  };
  send.addEventListener("click",submit); input.addEventListener("keydown",e=>{if(e.key==="Enter")submit()});
});
