(()=>{"use strict";
function esc(s){return String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function mount(){
 const box=document.getElementById("gameArea");if(!box||!window.CYBER_KNOWLEDGE_GAMES)return;
 if(document.getElementById("knowledgeGameButton"))return; const button=document.createElement("button");button.id="knowledgeGameButton";button.className="os-btn";button.textContent="GENERATE FROM KNOWLEDGE BASE";
 button.onclick=()=>{const g=window.CYBER_KNOWLEDGE_GAMES.makeGame(document.getElementById("globalSearch")?.value||"");if(!g){box.insertAdjacentHTML("afterbegin",'<div class="detail-panel">No matching knowledge record.</div>');return}box.innerHTML='<div class="game-card"><span class="tag">GENERATED FROM LIVE CATALOG</span><h2>'+esc(g.title)+'</h2><p>'+esc(g.question)+'</p><div class="game-options">'+g.options.map((o,i)=>'<button data-i="'+i+'">'+esc(o)+'</button>').join("")+'</div><div id="generatedGameFeedback"></div><button class="os-btn" id="generatedNext">GENERATE ANOTHER</button></div>';box.querySelectorAll(".game-options button").forEach(b=>b.onclick=()=>{const ok=+b.dataset.i===g.answer;const f=document.getElementById("generatedGameFeedback");f.className=ok?"good":"bad";f.textContent=(ok?"CORRECT. ":"NOT YET. ")+g.explain});box.querySelector("#generatedNext").onclick=mount;};
 box.parentElement?.querySelector(".os-panel-head")?.appendChild(button);
}
document.addEventListener("DOMContentLoaded",mount);
document.addEventListener("cyber:catalogs-loaded",mount);
})();