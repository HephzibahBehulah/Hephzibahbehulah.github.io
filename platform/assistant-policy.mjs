/* User intent is separate from execution evidence and retrieved document contents. */
export function operatorIntent(task){
 const text=String(task||'').toLowerCase();
 const noTools=/\b(?:do not|don't|never)\s+(?:run|execute|use\s+(?:any\s+)?tools|perform\s+(?:any\s+)?checks)\b/.test(text);
 const explanation=/^\s*(?:explain|describe|teach|what is|what are|how does|how do i)\b/.test(text)&&! /\b(?:please|then|also)\s+(?:run|check|inspect|investigate|execute)\b/.test(text);
 const actionable=text.replace(/\b(?:do not|don't|never)\s+(?:change|modify|edit|update|fix|deploy|delete|remove|commit|push|merge|purge|restart|rotate|configure)\b[^.;]*/g,'');
 return {execute:!noTools&&!explanation,mutation:!noTools&&!explanation&&/\b(?:change|modify|edit|update|fix|deploy|delete|remove|commit|push|merge|purge|restart|rotate|configure)\b/.test(actionable)};
}
