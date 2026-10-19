(()=>{'use strict';
function stable(x){if(Array.isArray(x))return x.map(stable);if(x&&typeof x==='object')return Object.keys(x).sort().reduce((o,k)=>(o[k]=stable(x[k]),o),{});return x}
function serialize(project){return JSON.stringify(stable(project),null,2)}
function envelope(project){return {format:'voltpro-export',version:1,project:JSON.parse(serialize(project)),exportedAt:new Date().toISOString()}}
function parse(input){const x=typeof input==='string'?JSON.parse(input):input;if(x?.format==='voltpro-export')return x.project;if(x?.format==='voltpro')return x;throw Error('Unsupported VoltPRo project export')}
window.VoltProProjectIO={stable,serialize,envelope,parse};
})();