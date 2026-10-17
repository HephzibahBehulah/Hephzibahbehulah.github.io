/* VoltPRo transactional command history. Commands are serializable intent, not UI callbacks. */
(()=>{'use strict';
const clone=x=>structuredClone(x);
function replaceAt(obj,path,value){let cur=obj;for(let i=0;i<path.length-1;i++)cur=cur[path[i]];cur[path[path.length-1]]=clone(value)}
function setPath(path,before,after){return {type:'set',path:path.slice(),before:clone(before),after:clone(after),apply(p){replaceAt(p,path,after)},revert(p){replaceAt(p,path,before)}}}
function insert(path,index,value){return {type:'insert',path:path.slice(),index,value:clone(value),apply(p){p[path[0]].splice(index,0,clone(value))},revert(p){p[path[0]].splice(index,1)}}}
function remove(path,index,value){return {type:'remove',path:path.slice(),index,value:clone(value),apply(p){p[path[0]].splice(index,1)},revert(p){p[path[0]].splice(index,0,clone(value))}}}
function history(limit=200){let undo=[],redo=[];return {execute(project,command){command.apply(project);undo.push(command);if(undo.length>limit)undo.shift();redo=[];return project},undo(project){const c=undo.pop();if(!c)return false;c.revert(project);redo.push(c);return true},redo(project){const c=redo.pop();if(!c)return false;c.apply(project);undo.push(c);return true},clear(){undo=[];redo=[]},canUndo:()=>undo.length>0,canRedo:()=>redo.length>0,size:()=>({undo:undo.length,redo:redo.length})}}
window.VoltProCommands={clone,setPath,insert,remove,history};
})();