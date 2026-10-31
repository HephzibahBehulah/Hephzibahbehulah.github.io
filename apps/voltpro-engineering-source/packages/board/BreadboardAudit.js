/* Local, content-free action history for breadboard edits. */
(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.VoltProBreadboardAudit=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
'use strict';
const stable=value=>JSON.stringify(value??null);
function changes(before={},after={}){
 const out=[],partMap=items=>new Map((Array.isArray(items)?items:[]).filter(x=>x?.id).map(x=>[String(x.id),x]));
 const compare=(kind,left,right)=>{
  const a=partMap(left),b=partMap(right);
  for(const [id,item]of b){const prior=a.get(id);if(!prior){out.push({objectId:id,objectType:kind,action:'placed',summary:'Placed '+id});continue}if(stable(prior)===stable(item))continue;
   if(kind==='component'&&stable({x:prior.x,y:prior.y,pins:prior.pins})!==stable({x:item.x,y:item.y,pins:item.pins}))out.push({objectId:id,objectType:kind,action:'moved',summary:'Moved '+id});
   else if(kind==='wire'&&stable({a:prior.a,b:prior.b})!==stable({a:item.a,b:item.b}))out.push({objectId:id,objectType:kind,action:'rerouted',summary:'Changed endpoints for '+id});
   else out.push({objectId:id,objectType:kind,action:'edited',summary:'Edited '+id});
  }
  for(const id of a.keys())if(!b.has(id))out.push({objectId:id,objectType:kind,action:'removed',summary:'Removed '+id});
 };
 compare('component',before.parts,after.parts);compare('wire',before.wires,after.wires);return out;
}
function create({storage=globalThis.localStorage,key='voltpro-breadboard-audit-v1',now=()=>Date.now(),maxEntries=300,coalesceMs=900}={}){
 const read=()=>{try{const value=JSON.parse(storage?.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>x&&typeof x.action==='string').slice(0,maxEntries):[]}catch{return []}};
 const write=rows=>{try{storage?.setItem(key,JSON.stringify(rows));return true}catch{return false}};
 let rows=read();
 return {
  list(projectName){const items=projectName?rows.filter(x=>x.projectName===projectName):rows;return items.map(x=>({...x}));},
  record(before,after,projectName='Untitled breadboard'){
   const edits=changes(before,after),timestamp=new Date(now()).toISOString();
   for(const edit of edits){const last=rows[0];if(last&&last.projectName===projectName&&last.objectId===edit.objectId&&last.action===edit.action&&now()-Date.parse(last.timestamp)<=coalesceMs){last.timestamp=timestamp;last.count=(last.count||1)+1;last.summary=edit.summary+' ('+last.count+' rapid edits)';continue;}rows.unshift({...edit,projectName,timestamp,count:1});}
   rows=rows.slice(0,maxEntries);write(rows);return edits;
  },
  clear(projectName){rows=projectName?rows.filter(x=>x.projectName!==projectName):[];write(rows);},
  export(projectName){return JSON.stringify({schemaVersion:1,tool:'VoltPro Breadboard',exportedAt:new Date(now()).toISOString(),entries:this.list(projectName)},null,2);}
 };
}
return {changes,create};
});
