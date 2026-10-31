/* Browser-local named breadboard documents; each page owns an independent project payload. */
(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.VoltProBreadboardPageStore=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
'use strict';
const clone=value=>JSON.parse(JSON.stringify(value));
function create({storage=globalThis.localStorage,key='voltpro-breadboard-pages-v1',now=()=>Date.now(),maxPages=100}={}){
 let sequence=0,state={schemaVersion:1,currentPageId:null,pages:[]};
 try{const parsed=JSON.parse(storage?.getItem(key)||'null');if(parsed?.schemaVersion===1&&Array.isArray(parsed.pages))state={schemaVersion:1,currentPageId:parsed.currentPageId||null,pages:parsed.pages.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&x.data&&typeof x.data==='object').slice(0,maxPages)}}catch{}
 const persist=()=>{try{storage?.setItem(key,JSON.stringify(state));return true}catch{return false}};
 const uniqueName=value=>{const base=String(value||'Untitled breadboard').trim().slice(0,80)||'Untitled breadboard',used=new Set(state.pages.map(x=>x.name.toLowerCase()));if(!used.has(base.toLowerCase()))return base;for(let i=2;i<1000;i++){const next=base.slice(0,Math.max(1,75-String(i).length))+' ('+i+')';if(!used.has(next.toLowerCase()))return next}return base+' ('+(state.pages.length+1)+')'};
 const newId=()=>`bb-${now().toString(36)}-${(++sequence).toString(36)}`;
 return {
  list(){return state.pages.map(({id,name,createdAt,updatedAt})=>({id,name,createdAt,updatedAt,current:id===state.currentPageId}))},
  current(){const page=state.pages.find(x=>x.id===state.currentPageId);return page?clone(page):null},
  get(id){const page=state.pages.find(x=>x.id===String(id));return page?clone(page):null},
  create(name,data){if(state.pages.length>=maxPages)throw new Error('The browser library is full; delete an old page before creating another.');const timestamp=new Date(now()).toISOString(),page={id:newId(),name:uniqueName(name),createdAt:timestamp,updatedAt:timestamp,data:clone(data)};state.pages.unshift(page);state.currentPageId=page.id;persist();return clone(page)},
  save(id,name,data){const page=state.pages.find(x=>x.id===String(id));if(!page)return this.create(name,data);page.name=String(name||page.name).trim().slice(0,80)||'Untitled breadboard';page.data=clone(data);page.updatedAt=new Date(now()).toISOString();state.currentPageId=page.id;persist();return clone(page)},
  open(id){const page=state.pages.find(x=>x.id===String(id));if(!page)return null;state.currentPageId=page.id;persist();return clone(page)},
  duplicate(id,name){const page=state.pages.find(x=>x.id===String(id));if(!page)return null;return this.create(name||page.name+' copy',page.data)},
  remove(id){const index=state.pages.findIndex(x=>x.id===String(id));if(index<0)return false;state.pages.splice(index,1);if(state.currentPageId===String(id))state.currentPageId=state.pages[0]?.id||null;persist();return true},
  export(){return JSON.stringify({schemaVersion:1,tool:'VoltPro Breadboard',exportedAt:new Date(now()).toISOString(),currentPageId:state.currentPageId,pages:state.pages.map(clone)},null,2)}
 };
}
return {create};
});
