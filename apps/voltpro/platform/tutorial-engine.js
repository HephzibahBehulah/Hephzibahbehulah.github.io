(()=>{"use strict";
function session(tutorial){return {id:tutorial.id,step:0,started:Date.now(),complete:false}}
function next(s,t){s.step=Math.min(s.step+1,(t.steps||[]).length);s.complete=s.step>=(t.steps||[]).length;return s}
function current(s,t){return (t.steps||[])[s.step]||null}
window.VoltProTutorial={session,next,current};
})();