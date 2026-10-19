(()=>{'use strict';
const M=window.VoltProDeviceModels;
function s(d){return d.state||{}}
M.register({id:'switch',version:'1.0.0',domains:['dc','ac','control'],validated:true,evaluate(d){const x=s(d);return {ok:true,closed:x.closed!==false,contacts:[{id:'1-2',closed:x.closed!==false}]}}});
M.register({id:'pushbutton-no',version:'1.0.0',domains:['control'],validated:true,evaluate(d){const x=s(d);return {ok:true,closed:x.pressed===true,contacts:[{id:'13-14',closed:x.pressed===true}]}}});
M.register({id:'pushbutton-nc',version:'1.0.0',domains:['control'],validated:true,evaluate(d){const x=s(d);return {ok:true,closed:x.pressed!==true,contacts:[{id:'21-22',closed:x.pressed!==true}]}}});
M.register({id:'lamp',version:'1.0.0',domains:['dc','ac'],validated:true,evaluate(d){return {ok:true,energized:Boolean(s(d).energized),contacts:[]}}});
})();