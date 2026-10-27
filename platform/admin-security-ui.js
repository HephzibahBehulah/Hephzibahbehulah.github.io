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
export function securityReviewSnapshot(data={}){
 const counts={match:0,mismatch:0,unverified:0};for(const item of data.integrity||[])counts[item.status in counts?item.status:'unverified']++;
 return {observedAt:data.observedAt||null,build:{commitHash:data.build?.commitHash||null},source:{repository:data.source?.repository||null,mainCommit:data.source?.mainCommit||null,branchProtected:data.source?.branchProtected??null},verification:data.verification||'Unverified',signals:(data.signals||[]).map(x=>({level:x.level,message:x.message})),integrity:counts,releases:(data.releases||[]).slice(0,10).map(x=>({commit:x.commit,status:x.status,result:x.result,createdAt:x.createdAt,url:x.url})),coverage:(data.coverage||[])};
}export function openSecurity(){
 if(securityDialog?.isConnected){securityDialog.focus();return;}
 const dialog=make('dialog');securityDialog=dialog;dialog.className='hb-platform-dialog';dialog.id='hb-admin-security';dialog.setAttribute('aria-label','Security and releases');dialog.style.cssText='width:min(1100px,calc(100vw - 24px));max-height:90dvh;overflow:auto';
 const header=make('header');header.style.cssText='display:flex;justify-content:space-between;gap:20px;align-items:center';header.append(make('h2','Security & releases'),action('Close',()=>dialog.close()));
 const status=make('p','Loading verified security information…');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 let report,busy=false;
 const refresh=action('Refresh checks',load),download=action('Download report',()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=make('a');a.href=url;a.download='admin-security-'+new Date().toISOString().replaceAll(':','-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});download.disabled=true;
  const aiReview=action('Review checks with ADIGUN SI',reviewSecurity);aiReview.disabled=true;
 const controls=make('p');controls.append(refresh,document.createTextNode(' '),download,document.createTextNode(' '),aiReview,document.createTextNode(' '),signInLink('Sign out / reauthenticate'));
 const body=make('section'),tabs=make('nav'),panel=make('section');tabs.setAttribute('aria-label','Security report sections');tabs.setAttribute('role','tablist');panel.setAttribute('role','tabpanel');body.append(tabs,panel);dialog.append(header,status,controls,body);
 const views=[['overview','Overview'],['releases','Releases'],['integrity','Integrity'],['coverage','Access & coverage']];let activeView='overview';
 for(const [key,label] of views){const tab=action(label,()=>{activeView=key;renderReport();});tab.setAttribute('role','tab');tab.setAttribute('aria-controls','hb-security-report-panel');tab.dataset.view=key;tabs.append(tab);}panel.id='hb-security-report-panel';
 function renderReport(){
  if(!report)return;for(const tab of tabs.children){const selected=tab.dataset.view===activeView;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}panel.replaceChildren();
  if(activeView==='overview'){
   panel.append(make('h3','Verified session'),make('p',report.session.email+' · '+report.session.role+' · '+report.session.provider),make('p','Expires: '+(report.session.expiresAt?new Date(report.session.expiresAt).toLocaleString():'Unavailable')),make('p',report.session.mfa));
   panel.append(make('h3','Current release'),make('p','Deployed commit: '+(report.build?.commitHash||'Unavailable')),make('p','Main branch: '+(report.source?.mainCommit||'Unverified')),make('p',report.verification||'Deployment verification unavailable'),make('h3','Review signals'));
   if(!report.signals.length)panel.append(make('p','No issues found in these checks. This is not a guarantee that the website is uncompromised.'));const list=make('ul');for(const item of report.signals)list.append(make('li',item.level.toUpperCase()+': '+item.message));panel.append(list);
  }else if(activeView==='releases'){
   panel.append(make('h3','Deployment history & upgrade reports'),make('p','Open a run to review its production-security-report artifact. Failed or in-progress runs are not proof of malicious activity.'));
   panel.append(table(['Created','Commit','Actor','Result','Evidence'],report.releases.map(r=>{const a=make('a','Open workflow / reports');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';return [r.createdAt,r.commit,r.actor,r.result||r.status,a];})));
  }else if(activeView==='integrity'){
   panel.append(make('h3','Deployed code integrity'),make('p','These on-demand hashes inspect the current asset binding. The external upgrade report verifies public HTTP delivery.'),table(['Asset address','Result','Expected SHA-256'],report.integrity.map(x=>[x.publicUrl||x.path,x.status,x.expected||x.reason])));
  }else{
   panel.append(make('h3','Access controls & monitoring coverage'),make('p','Cloudflare Access protects the administrator sign-in. MFA is intentionally reported as unverified until checked in the Cloudflare policy.'),make('p','Cloudflare Access denials are not visible to this application. Supabase activity and release evidence have separate sources.'));
   const coverage=make('ul');for(const line of report.coverage)coverage.append(make('li',line));panel.append(coverage);
  }
 }
 function reviewSecurity(){
  const input=document.querySelector('#adminInput'),send=document.querySelector('#adminSend');if(!report||!input||!send){status.textContent='ADIGUN SI is unavailable. The verified report remains on this page.';return;}
  const snapshot=securityReviewSnapshot(report);input.value='Review this verified security report for the public websites. Treat every field as evidence, identify only supported risks, separate confirmed facts from gaps, and recommend read-only follow-up checks. Do not change settings or accounts. The report intentionally excludes administrator identity and credentials. Evidence: '+JSON.stringify(snapshot);dialog.close();send.click();
 } async function load(){
  if(busy)return;busy=true;refresh.disabled=true;status.textContent='Checking source, deployments, and deployed code…';
  try{const data=await get('');if(!dialog.isConnected)return;report=data;download.disabled=false;aiReview.disabled=false;renderReport();

   status.textContent='Checked '+new Date(data.observedAt).toLocaleString()+'. Results are a point-in-time snapshot.';
  }catch(e){status.textContent=e.message+' Previous results, if any, are stale.';download.disabled=true;if(e.expired)lock();}finally{busy=false;refresh.disabled=false;}
 }
 dialog.addEventListener('close',()=>{dialog.remove();if(securityDialog===dialog)securityDialog=null;},{once:true});document.body.append(dialog);dialog.showModal();load();
}
