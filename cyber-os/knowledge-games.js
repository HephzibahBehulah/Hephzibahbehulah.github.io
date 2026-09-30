(()=>{"use strict";
const H=window.CYBER_HUB||{},G=window.CYBER_GRAPH_ENGINE;
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function pool(){return G?G.records().filter(x=>x.name):[]}
function questionFor(r){
 const d=r.data;
 if(r.type==="protocol"&&Array.isArray(d))return {q:"Which transport or service detail is associated with "+r.name+"?",a:d[2]||d[1],ex:"The catalog record links "+r.name+" with "+(d[2]||"its recorded transport/service data")+"."};
 if(r.type==="Windows command"||r.type==="Linux command")return {q:"What is this command used for in Cyber OS learning? "+r.name,a:"Command reference",ex:"Use the command in an appropriate authorised environment and consult its primary documentation."};
 if(r.type==="shortcut"&&Array.isArray(d))return {q:"Which platform is associated with "+r.name+"?",a:d[0],ex:"The shortcut record identifies "+d[0]+" as its platform."};
 return {q:"What knowledge domain does "+r.name+" belong to?",a:r.type,ex:"Cyber OS connects the record to related concepts, sources and learning activities."};
}
function makeGame(q){
 const rs=pool().filter(x=>x.name.toLowerCase().includes(String(q||"").toLowerCase())||!q).slice(0,8);
 if(!rs.length)return null;
 const r=rs[Math.floor(Math.random()*rs.length)],item=questionFor(r),others=rs.filter(x=>x!==r).slice(0,3).map(x=>questionFor(x).a);
 const options=[item.a,...others];for(let i=options.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[options[i],options[j]]=[options[j],options[i]]}
 return {title:"Knowledge Challenge: "+r.name,question:item.q,options,answer:options.indexOf(item.a),explain:item.ex};
}
window.CYBER_KNOWLEDGE_GAMES={makeGame};
})();