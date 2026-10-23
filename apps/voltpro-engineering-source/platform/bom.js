(()=>{"use strict";
function build(project,library=[]){
 const counts=new Map();
 const add=(type,description,properties={})=>{const props=JSON.stringify(properties||{}),key=type+"|"+props,old=counts.get(key);counts.set(key,{type,description:description||type,properties:props,quantity:(old?.quantity||0)+1})};
 for(const c of project.components||[])add(c.type,library.find(x=>x.id===c.type||x.type===c.type)?.name||c.type,c.props||{});
 const panel=project.panel||{};
 for(const r of panel.rails||[])add("DIN rail TS 35",r.label||"TS 35 DIN rail",{lengthModules:Number(r.length)||18});
 for(const d of panel.ducts||[])add("Cable duct",d.label||d.id||"Cable duct",{width:d.width||null,height:d.height||null,fill:d.fill??null});
 for(const t of panel.terminalStrips||[])add("Terminal strip",t.label||t.id||"Terminal strip",{ways:Number(t.count)||12});
 for(const x of panel.items||[])if(x.kind==="accessory"&&!["terminal-strip","cable-duct"].includes(x.type))add(x.type,x.label||x.type,{width:x.width||18});
 return [...counts.values()].map(x=>({reference:x.type,description:x.description,quantity:x.quantity,properties:x.properties}));
}
function csv(rows){const head="Reference,Description,Quantity,Properties";return [head,...rows.map(r=>[r.reference,r.description,r.quantity,r.properties].map(x=>'"'+String(x).replaceAll('"','""')+'"').join(","))].join("\n")}
window.VoltProBOM={build,csv};
})();