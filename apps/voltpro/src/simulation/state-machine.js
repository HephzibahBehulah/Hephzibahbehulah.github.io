(()=>{'use strict';
function machine(spec={}){const states=new Set(spec.states||[]),transitions=spec.transitions||[],initial=spec.initial||Array.from(states)[0],current={value:initial};if(!states.has(initial))throw Error('Invalid initial state');
 function step(event,context={}){for(const t of transitions){if(t.from!==current.value||t.event!==event)continue;if(typeof t.guard==='function'&&!t.guard(context))continue;if(!states.has(t.to))throw Error('Invalid transition target');const before=current.value;current.value=t.to;return {changed:before!==t.to,before,after:t.to,event};}return {changed:false,before:current.value,after:current.value,event,ignored:true};}
 return {get state(){return current.value},step,reset(){current.value=initial}}}
window.VoltProStateMachine={machine};
})();