(()=>{'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const number=value=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):null;
function face(device={},options={}){
 const name=esc(device.ref||device.id||'DEV'),type=String(device.type||'device').toLowerCase(),label=esc(device.label||device.name||device.type||'Device');
 const supplied=Array.isArray(device.terminals)&&device.terminals.length?device.terminals:(window.VoltProTerminalGraph?.definitionFor?.(type)?.terminals||[]);
 const terminal=(t,i)=>esc(t.label||t.id||t.number||String(i+1));
 const dims=device.dimensions||device.manufacturerDimensions||{};
 const verified=dims.verified===true&&number(dims.width)&&number(dims.height);
 const dimensionText=verified?('W '+number(dims.width)+' × H '+number(dims.height)+' mm'):'DIMENSIONS NOT VERIFIED';
 const parts=[];
 const rect=(x,y,w,h,rx=3,fill='#e8edf2',stroke='#273444')=>parts.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.5"/>');
 const text=(x,y,value,anchor='middle',size=8,weight=400)=>parts.push('<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-family="sans-serif" font-size="'+size+'" font-weight="'+weight+'" fill="#17212b">'+esc(value)+'</text>');
 const line=(x1,y1,x2,y2)=>parts.push('<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#273444" stroke-width="1.5"/>');
 const circle=(cx,cy,r=3)=>parts.push('<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#f8fafc" stroke="#273444" stroke-width="1.3"/>');
 rect(5,5,110,140,5);
 rect(12,12,96,19,2,'#d4dce5');
 text(60,25,name,'middle',10,700);
 if(type==='circuit-breaker-3p'||type==='mcb-3p'||type==='mcb3p'||type==='3-pole-mcb'){
  rect(34,39,52,78,3,'#d7e0e8');
  text(60,52,'3P MCB','middle',9,700);
  for(let i=0;i<3;i++){const y=64+i*18;line(43,y,55,y+5);line(65,y+5,77,y);circle(43,y,2);circle(77,y,2);text(29,y+3,terminal(supplied[i]||{label:['L1','L2','L3'][i]},i),'end',7,700);text(91,y+3,terminal(supplied[i+3]||{label:['T1','T2','T3'][i]},i+3),'start',7,700)}
 }else if(type==='contactor'||type==='contactor3p'){
  rect(30,36,60,86,3,'#d7e0e8');
  text(60,48,'CONTACTOR','middle',7,700);
  rect(43,54,34,15,2,'#f5f7f9');
  text(60,64,'COIL','middle',6,700);
  for(let i=0;i<6;i++){const y=77+i*7;line(39,y,47,y);line(73,y,81,y);circle(39,y,1.8);circle(81,y,1.8);const pair=[supplied[i*2],supplied[i*2+1]];text(35,y+2,terminal(pair[0]||{label:['A1','L1','L2','L3','13','21'][i]},i*2),'end',5.5,700);text(85,y+2,terminal(pair[1]||{label:['A2','T1','T2','T3','14','22'][i]},i*2+1),'start',5.5,700)}
 }else if(type==='motor'||type==='motor-3phase'||type==='three-phase-motor'){
  circle(60,82,28);text(60,86,'M','middle',18,700);rect(38,38,44,16,2,'#d7e0e8');text(60,49,'TERMINALS','middle',6,700);
  const labels=supplied.length?supplied.map(terminal):['U1','V1','W1','U2','V2','W2','PE'];
  labels.forEach((v,i)=>{const left=i<3,x=left?16:104,y=63+(i%3)*15;circle(left?26:94,y,2);text(x,y+3,v,left?'end':'start',6.5,700)});
 }else{
  rect(24,38,72,80,4,'#d7e0e8');
  text(60,57,label.length>13?label.slice(0,13):label,'middle',8,700);
  const labels=supplied.map(terminal);
  labels.slice(0,8).forEach((v,i)=>{const left=i%2===0,x=left?15:105,y=72+Math.floor(i/2)*12;circle(left?26:94,y,2);text(x,y+3,v,left?'end':'start',6.5,700)});
 }
 text(60,133,dimensionText,'middle',7,verified?700:400);
 text(60,142,verified?'VERIFIED DIMENSIONS':'USE MANUFACTURER DATA','middle',5.5,700);
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" role="img" aria-label="'+name+' '+esc(type)+' device face">'+parts.join('')+'</svg>';
}
window.VoltProDeviceFace={face};
})();