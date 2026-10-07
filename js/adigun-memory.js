/* ADIGUN persistent conversation memory layer.
 * UI/API behavior stays unchanged; this only preserves text turns locally so
 * follow-up questions can be sent with their relevant conversation context.
 */
(function(){
  "use strict";
  const VERSION=2;
  const MAX_TURNS=120;
  const MAX_CHARS=100000;
  const PREFIX="hb-adigun-memory:v2:";
  const cleanText=value=>String(value??"").replace(/\u0000/g,"").trim().slice(0,16000);
  const normalize=items=>{
    if(!Array.isArray(items))return [];
    const out=[];let chars=0;
    for(const item of items.slice(-MAX_TURNS)){
      const role=item?.role==="assistant"?"assistant":item?.role==="user"?"user":null;
      const content=cleanText(item?.content);
      if(!role||!content)continue;
      chars+=content.length;
      if(chars>MAX_CHARS)break;
      out.push({role,content,ts:Number(item?.ts)||Date.now()});
    }
    return out;
  };
  function create(scope){
    const key=PREFIX+String(scope||"public").replace(/[^a-z0-9_-]/gi,"-");
    const read=()=>{
      try{const raw=localStorage.getItem(key);if(!raw)return[];const parsed=JSON.parse(raw);return normalize(parsed?.messages||parsed)}catch{return[]}
    };
    const write=messages=>{try{localStorage.setItem(key,JSON.stringify({version:VERSION,updatedAt:new Date().toISOString(),messages:normalize(messages)}));return true}catch{return false}};
    const append=(role,content)=>{const next=read();next.push({role,content:cleanText(content),ts:Date.now()});write(next);return read()};
    return {
      key,
      load:read,
      save:items=>write(items),
      append,
      clear:()=>{try{localStorage.removeItem(key)}catch{}},
      getMessages:(limit=30)=>read().slice(-Math.max(1,Math.min(60,Number(limit)||30)))
    };
  }
  window.AdigunMemory={version:VERSION,create};
})();