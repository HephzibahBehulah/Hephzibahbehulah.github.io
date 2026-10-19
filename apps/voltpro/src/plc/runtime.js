(()=>{'use strict';
function scan(program,state={}){
 const io={...(state.io||{})},timers={...(state.timers||{})},counters={...(state.counters||{})},edges={...(state.edges||{})},timerArmed={...(state.timerArmed||{})};
 const scanMs=Math.max(1,Number(state.scanMs)||10);
 for(const rung of program.rungs||[]){
  let power=true,hasCondition=false;
  for(const n of rung.nodes||[]){
   const tag=String(n.tag||'').trim();
   if(n.type==='contact-no'){power=power&&Boolean(io[tag]);hasCondition=true}
   else if(n.type==='contact-nc'){power=power&&!Boolean(io[tag]);hasCondition=true}
   else if(n.type==='timer-on'){
    hasCondition=true;const preset=Math.max(0,Number(n.props?.presetMs)||1000);
    timers[tag]=power?Math.min(preset,(timers[tag]||0)+scanMs):0;
    power=power&&timers[tag]>=preset;
   }else if(n.type==='timer-off'){
    hasCondition=true;const preset=Math.max(0,Number(n.props?.presetMs)||1000);
    if(power){timers[tag]=0;timerArmed[tag]=true}
    else if(timerArmed[tag]){timers[tag]=Math.min(preset,(timers[tag]||0)+scanMs);if(timers[tag]>=preset)timerArmed[tag]=false}
    power=power||Boolean(timerArmed[tag]);
   }else if(n.type==='counter-up'){
    hasCondition=true;const key=String(n.id||tag),preset=Math.max(1,Number(n.props?.preset)||1);
    if(power&&!edges[key])counters[tag]=(counters[tag]||0)+1;
    edges[key]=Boolean(power);power=(counters[tag]||0)>=preset;
   }else if(n.type==='coil'){
    io[tag]=Boolean(power&&hasCondition);
   }
  }
 }
 return {io,timers,counters,edges,timerArmed,scanCount:Number(state.scanCount||0)+1};
}
window.VoltProPLCRuntime={scan};
})();