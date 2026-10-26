const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);return n;};
const action=(text,fn)=>{const n=make('button',text);n.type='button';n.addEventListener('click',fn);return n;};
let securityDialog,sessionWatcher=false,expiry=0;
async function get(path){
 const r=await fetch('/api/admin/security'+path,{credentials:'same-origin',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(20000)});
 if(r.status===401||r.status===403||r.type==='opaqueredirect'){const e=Error('Administrator sign-in has expired. Sign in again.');e.expired=true;throw e;}
 if(!r.ok)throw Error('Private security report is unavailable ('+r.status+').');
 if(!r.headers.get('content-type')?.includes('application/json'))throw Error('Unexpected response. Recheck your administrator sign-in.');return r.json();
}
function signInLink(text='Sign in again'){const a=make('a',text);a.href='/cdn-cgi/access/logout';return a;}
function lock(){
 document.querySelector('#hb-admin-accounts')?.close();securityDialog?.close();
 if(document.querySelector('#hb-admin-session-lock'))return;
 const d=make('dialog');d.id='hb-admin-session-lock';d.className='hb-platform-dialog';d.setAttribute('aria-label','Administrator session expired');
 d.append(make('h2','Administrator session expired'),make('p','Private requests are blocked by the server. Sign in again to continue. Save work before leaving this page.'),signInLink());d.addEventListener('cancel',e=>e.preventDefault());document.body.append(d);d.showModal();
}
export function watchSession(menu){
 if(sessionWatcher)return;sessionWatcher=true;
 const identity=make('small','Verifying administrator session…');identity.setAttribute('role','status');menu.append(identity);
 async function refresh(){if(document.hidden)return;try{const data=await get('/session'),s=data.session;expiry=s.expiresAt?Date.parse(s.expiresAt):0;identity.textContent=s.email+' · '+s.role+' · '+(expiry?'expires '+new Date(expiry).toLocaleString():'expiry unavailable');}catch(e){identity.textContent=e.message;if(e.expired||expiry&&Date.now()>=expiry)lock();}}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 setInterval(()=>{if(expiry&&Date.now()>=expiry)lock();else refresh();},60000);refresh();
}
function table(headers,rows){const wrap=make('div');wrap.style.overflow='auto';const t=make('table');t.style.cssText='width:100%;border-collapse:collapse;font-size:13px';const tr=make('tr');for(const title of headers)tr.append(make('th',title));const head=make('thead');head.append(tr);const body=make('tbody');for(const row of rows){const tr=make('tr');for(const value of row){const td=make('td');td.style.cssText='padding:10px;border-bottom:1px solid #64748b;overflow-wrap:anywhere';td.append(value instanceof Node?value:document.createTextNode(String(value??'Unavailable')));tr.append(td);}body.append(tr);}t.append(head,body);wrap.append(t);return wrap;}
export function openSecurity(){
 if(securityDialog?.isConnected){securityDialog.focus();return;}
 const dialog=make('dialog');securityDialog=dialog;dialog.className='hb-platform-dialog';dialog.id='hb-admin-security';dialog.setAttribute('aria-label','Security and releases');dialog.style.cssText='width:min(1100px,calc(100vw - 24px));max-height:90dvh;overflow:auto';
 const header=make('header');header.style.cssText='display:flex;justify-content:space-between;gap:20px;align-items:center';header.append(make('h2','Security & releases'),action('Close',()=>dialog.close()));
 const status=make('p','Loading verified security information…');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 let report,busy=false;
 const refresh=action('Refresh checks',load),download=action('Download report',()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=make('a');a.href=url;a.download='admin-security-'+new Date().toISOString().replaceAll(':','-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});download.disabled=true;
 const controls=make('p');controls.append(refresh,document.createTextNode(' '),download,document.createTextNode(' '),signInLink('Sign out / reauthenticate'));
 const body=make('section');dialog.append(header,status,controls,body);
 async function load(){
  if(busy)return;busy=true;refresh.disabled=true;status.textContent='Checking source, deployments, and selected public assets…';
  try{const data=await get('');if(!dialog.isConnected)return;report=data;body.replaceChildren();download.disabled=false;
   body.append(make('h3','Verified session'),make('p',data.session.email+' · '+data.session.role+' · '+data.session.provider),make('p','Expires: '+(data.session.expiresAt?new Date(data.session.expiresAt).toLocaleString():'Unavailable')),make('p',data.session.mfa));
   body.append(make('h3','Current release'),make('p','Deployed commit: '+(data.build?.commitHash||'Unavailable')),make('p','Main branch: '+(data.source?.mainCommit||'Unverified')),make('p',data.verification||'Deployment verification unavailable'));
   body.append(make('h3','Review signals'));
   if(!data.signals.length)body.append(make('p','No issues found in these checks. This is not a guarantee that the website is uncompromised.'));
   const list=make('ul');for(const item of data.signals)list.append(make('li',item.level.toUpperCase()+': '+item.message));body.append(list);
   body.append(make('h3','Selected asset integrity'),table(['Public asset','Result','Expected SHA-256'],data.integrity.map(x=>[x.path,x.status,x.expected||x.reason])));
   body.append(make('h3','Deployment history & upgrade reports'),make('p','Open a run to review its production-security-report artifact. Older runs may predate this report. Failed or in-progress runs are not proof of malicious activity.'));
   body.append(table(['Created','Commit','Actor','Result','Evidence'],data.releases.map(r=>{const a=make('a','Open workflow / reports');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';return [r.createdAt,r.commit,r.actor,r.result||r.status,a];})));
   body.append(make('h3','Monitoring coverage'));const coverage=make('ul');for(const line of data.coverage)coverage.append(make('li',line));body.append(coverage);
   status.textContent='Checked '+new Date(data.observedAt).toLocaleString()+'. Results are a point-in-time snapshot.';
  }catch(e){status.textContent=e.message+' Previous results, if any, are stale.';download.disabled=true;if(e.expired)lock();}finally{busy=false;refresh.disabled=false;}
 }
 dialog.addEventListener('close',()=>{dialog.remove();if(securityDialog===dialog)securityDialog=null;},{once:true});document.body.append(dialog);dialog.showModal();load();
}
