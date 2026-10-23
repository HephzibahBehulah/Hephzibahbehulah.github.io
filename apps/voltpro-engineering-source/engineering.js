"use strict";
function n(id){
  const el=document.getElementById(id);
  if(!el)return null;
  const raw=String(el.value??"").trim();
  if(raw==="")return null;
  const value=Number(raw);
  return Number.isFinite(value)?value:null;
}
function out(id,value){
  const el=document.getElementById(id);
  if(el)el.textContent=value;
}
function fmt(value,digits=3){return Number.isFinite(value)?Number(value.toFixed(digits)).toLocaleString("en-US",{maximumFractionDigits:digits}):"—";}
function ohm(){
  const u=n("u"),i=n("i"),r=n("r");
  const supplied=[u,i,r].filter(value=>value!==null).length;
  if(supplied<2){out("ohmOut","Enter any two values; leave the unknown blank.");return;}
  if(u!==null&&i!==null&&r!==null){
    if(r<=0){out("ohmOut","Resistance must be greater than zero.");return;}
    const calculated=i*r;
    const consistent=Math.abs(u-calculated)<=Math.max(.01,Math.abs(u)*.01);
    out("ohmOut","U = "+fmt(u)+" V · I × R = "+fmt(calculated)+" V · "+(consistent?"consistent within 1%":"check the entered values"));
    return;
  }
  if(u!==null&&i!==null){
    if(i===0){out("ohmOut","Current must be non-zero to calculate resistance.");return;}
    out("ohmOut","R = "+fmt(u/i)+" Ω");return;
  }
  if(u!==null&&r!==null){
    if(r===0){out("ohmOut","Resistance must be greater than zero.");return;}
    out("ohmOut","I = "+fmt(u/r,5)+" A");return;
  }
  if(i!==null&&r!==null){out("ohmOut","U = "+fmt(i*r)+" V");}
}
function power(){
  const voltage=n("pu"),current=n("pi");
  if(voltage===null||current===null){out("powerOut","Enter voltage and current.");return;}
  out("powerOut","P = "+fmt(voltage*current,2)+" W");
}
function drop(){
  const current=n("vi"),length=n("vl"),area=n("va"),rho=n("vk"),voltage=n("vv");
  if([current,length,area,rho,voltage].some(value=>value===null)||current<0||length<0||area<=0||rho<=0||voltage<=0){out("dropOut","Enter valid non-negative current/length and positive area, resistivity and voltage.");return;}
  const delta=2*current*length*rho/area;
  out("dropOut","ΔU = "+fmt(delta,3)+" V · "+fmt(delta/voltage*100,2)+" %");
}
function three(){
  const voltage=n("tu"),current=n("ti"),pf=n("tp");
  if(voltage===null||current===null||pf===null||voltage<=0||current<0||pf<0||pf>1){out("threeOut","Enter positive line voltage, non-negative current and power factor from 0 to 1.");return;}
  out("threeOut","P ≈ "+fmt(Math.sqrt(3)*voltage*current*pf/1000,3)+" kW");
}
function cable(){
  const current=n("ci"),length=n("cl"),voltage=n("cv"),maxPercent=n("cp");
  if([current,length,voltage,maxPercent].some(value=>value===null)||current<0||length<0||voltage<=0||maxPercent<=0||maxPercent>20){out("cableOut","Enter valid current, length, voltage and an allowed drop between 0 and 20%.");return;}
  const allowed=voltage*maxPercent/100;
  const areas=[1.5,2.5,4,6,10,16,25];
  const area=areas.find(size=>2*current*length*.0175/size<=allowed);
  if(!area){out("cableOut","No listed size meets this target. Increase the size range and verify the installation conditions.");return;}
  out("cableOut","Exercise estimate: "+area+" mm² · ΔU ≈ "+fmt(2*current*length*.0175/area,2)+" V · verify installation method, derating and protection");
}
function protect(){
  const ib=n("ib"),inn=n("in"),iz=n("iz");
  if([ib,inn,iz].some(value=>value===null)||ib<0||inn<=0||iz<=0){out("protectOut","Enter non-negative Ib and positive breaker In and cable Iz values.");return;}
  out("protectOut",ib<=inn&&inn<=iz?"Ib ≤ In ≤ Iz → PASS (exercise)":"Ib ≤ In ≤ Iz → CHECK VALUES");
}
function motor(){
  const powerKw=n("mk"),voltage=n("mv"),efficiency=n("me"),pf=n("mf");
  if([powerKw,voltage,efficiency,pf].some(value=>value===null)||powerKw<=0||voltage<=0||efficiency<=0||efficiency>1||pf<=0||pf>1){out("motorOut","Enter positive power/voltage and efficiency/power factor from 0 to 1.");return;}
  out("motorOut","I ≈ "+fmt(powerKw*1000/(Math.sqrt(3)*voltage*efficiency*pf),2)+" A");
}
ohm();power();drop();three();cable();protect();motor();
