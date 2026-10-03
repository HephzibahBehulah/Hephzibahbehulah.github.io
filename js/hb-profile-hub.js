(() => {
  'use strict';
  const USER='HephzibahBehulah';
  const API='https://api.github.com/users/'+USER+'/repos';
  const CACHE_KEY='hb-profile-github-repos-v2';
  const CACHE_TTL=15*60*1000;
  const featured={
    'Water-Pump-Status-Prediction-ML':['DATA / ML','Water infrastructure status prediction using machine learning, data preparation and model evaluation.'],
    'ReDI2025_ML_Isaac_Loan_Approval_Project':['DATA / ML','Practical loan approval analysis exploring data preparation, features and machine-learning workflow.'],
    'powerbi-desktop-samples':['DATA / BI','Power BI practice and business intelligence work focused on turning data into usable insight.'],
    'cybersecurity-study-notes':['CYBERSECURITY','Structured cybersecurity study material covering foundations, networking, Linux and security concepts.'],
    'Prompt-Injection-Learning-Journal':['AI SECURITY','A learning journal for understanding prompt injection, AI security risks and responsible testing.'],
    'Tryhackme-GUI':['CYBERSECURITY','A practical interface project connected to hands-on cybersecurity learning.'],
    'VoltPRo-Academy':['ENGINEERING / LEARNING','A practical academy project connecting electrical and technical learning with digital tools.'],
    'Hephzibah-Behulah-Engineering-systems-Lab':['ENGINEERING / SYSTEMS','Engineering systems experiments connecting physical technology, software and structured technical learning.'],
    'Hephzibah-OSINT-Frame':['OSINT','A research-oriented project around lawful public-source intelligence workflows.'],
    'ML_Isaac_SQL_Assignment':['DATA / SQL','SQL and machine-learning practice demonstrating structured data work and analytical thinking.']
  };
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const date=v=>{try{return new Intl.DateTimeFormat('en',{year:'numeric',month:'short',day:'numeric'}).format(new Date(v));}catch{return 'date unavailable';}};
  const cacheRead=()=>{try{const x=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');return x&&Date.now()-x.savedAt<CACHE_TTL&&Array.isArray(x.repos)?x.repos:null;}catch{return null;}};
  const cacheWrite=r=>{try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),repos:r}));}catch{}};
  async function fetchRepos(){
    const cached=cacheRead(); if(cached)return {repos:cached,cached:true};
    const all=[];
    for(let page=1;page<=10;page++){
      const res=await fetch(API+'?per_page=100&page='+page+'&sort=updated&direction=desc',{headers:{Accept:'application/vnd.github+json'}});
      if(!res.ok)throw new Error('GitHub HTTP '+res.status);
      const batch=await res.json(); if(!Array.isArray(batch))throw new Error('Invalid GitHub response');
      all.push(...batch); if(batch.length<100)break;
    }
    const publicRepos=all.filter(r=>!r.private); cacheWrite(publicRepos); return {repos:publicRepos,cached:false};
  }
  const classify=r=>{
    if(featured[r.name])return featured[r.name][0];
    const h=[r.name,r.description,...(r.topics||[])].join(' ').toLowerCase();
    if(/cyber|security|pentest|hack|osint|linux/.test(h))return 'CYBERSECURITY';
    if(/python|sql|data|machine|ml|powerbi|analytics|loan|pump/.test(h))return 'DATA / ML';
    if(/plc|electric|engineer|automation|volt|industrial/.test(h))return 'ENGINEERING';
    if(/web|html|css|javascript|github|academy|gui/.test(h))return 'SOFTWARE / WEB';
    return 'PROJECT / RESEARCH';
  };
  const desc=r=>featured[r.name]?featured[r.name][1]:(r.description||'Public repository in the Hephzibah Behulah technical portfolio.');
  const score=r=>(featured[r.name]?100:0)+(r.stargazers_count?Math.min(r.stargazers_count*5,20):0)+(r.description?8:0)+(r.homepage?4:0)+(r.language?2:0);
  const state={repos:[],filter:'all',query:'',sort:'featured'};
  function status(msg,live=true){const e=document.querySelector('#hbGithubLiveStatus');if(e)e.innerHTML='<span class="hb-live-dot '+(live?'':'offline')+'"></span>'+esc(msg);}
  function stats(repos){
    const langs=new Set(repos.map(r=>r.language).filter(Boolean));
    const latest=repos.slice().sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at))[0];
    const data=[['PUBLIC REPOS',repos.length],['LANGUAGES',langs.size],['FEATURED',repos.filter(r=>featured[r.name]).length],['LATEST UPDATE',latest?date(latest.updated_at):'—']];
    const e=document.querySelector('#hbGithubStats');if(e)e.innerHTML=data.map(x=>'<div class="hb-profile-stat"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join('');
  }
  function rows(){
    const q=state.query.toLowerCase().trim();
    const out=state.repos.filter(r=>{const c=classify(r);const h=[r.name,r.description,r.language,...(r.topics||[]),c].join(' ').toLowerCase();return (state.filter==='all'||c===state.filter)&&(!q||h.includes(q));});
    if(state.sort==='recent')out.sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
    else if(state.sort==='stars')out.sort((a,b)=>b.stargazers_count-a.stargazers_count||new Date(b.updated_at)-new Date(a.updated_at));
    else out.sort((a,b)=>score(b)-score(a)||new Date(b.updated_at)-new Date(a.updated_at));
    return out;
  }
  function render(){
    const grid=document.querySelector('#hbGithubRepoGrid');const count=document.querySelector('#hbGithubRepoCount');if(!grid)return;
    const list=rows();if(count)count.textContent=list.length+' public project'+(list.length===1?'':'s')+' shown';
    if(!list.length){grid.innerHTML='<div class="hb-profile-empty">No public repositories match this view. Try another search or category.</div>';return;}
    grid.innerHTML=list.map(r=>{
      const cat=classify(r),lang=r.language||'Mixed / documentation',topics=(r.topics||[]).slice(0,4);
      const mark=featured[r.name]?'<span class="hb-repo-featured">FEATURED</span>':'';
      const home=r.homepage?'<a href="'+esc(r.homepage)+'" target="_blank" rel="noopener noreferrer">live demo ↗</a>':'';
      return '<article class="hb-repo-card"><div class="hb-repo-top"><span class="hb-repo-category">'+esc(cat)+'</span>'+mark+'</div><h3>'+esc(r.name.replace(/[-_]+/g,' '))+'</h3><p>'+esc(desc(r))+'</p><div class="hb-repo-tags"><span>'+esc(lang)+'</span>'+topics.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="hb-repo-meta"><span>updated '+esc(date(r.updated_at))+'</span><span>★ '+(r.stargazers_count||0)+'</span><span>⑂ '+(r.forks_count||0)+'</span></div><div class="hb-repo-actions"><a class="os-btn primary" href="'+esc(r.html_url)+'" target="_blank" rel="noopener noreferrer">inspect repository ↗</a>'+home+'</div></article>';
    }).join('');
  }
  function filters(){
    const e=document.querySelector('#hbGithubCategory');if(!e)return;
    const cats=[...new Set(state.repos.map(classify))].sort();e.innerHTML='<option value="all">ALL DOMAINS</option>'+cats.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
  }
  function bind(){
    document.querySelector('#hbGithubSearch')?.addEventListener('input',e=>{state.query=e.target.value;render();});
    document.querySelector('#hbGithubCategory')?.addEventListener('change',e=>{state.filter=e.target.value;render();});
    document.querySelector('#hbGithubSort')?.addEventListener('change',e=>{state.sort=e.target.value;render();});
    document.querySelector('#hbGithubRefresh')?.addEventListener('click',async()=>{
      try{localStorage.removeItem(CACHE_KEY);status('refreshing GitHub index…');const x=await fetchRepos();state.repos=x.repos;stats(state.repos);filters();render();status('live · refreshed '+date(new Date()));}
      catch{status('GitHub API unavailable · refresh failed',false);}
    });
  }
  async function init(){
    if(!document.querySelector('#profile-hub'))return; bind();
    try{status('connecting to GitHub…');const x=await fetchRepos();state.repos=x.repos;stats(state.repos);filters();render();status(x.cached?'live · cached public index':'live · GitHub public API');}
    catch{status('GitHub API unavailable',false);const g=document.querySelector('#hbGithubRepoGrid');if(g)g.innerHTML='<div class="hb-profile-empty">The live repository index could not be reached right now. Open the GitHub profile to browse the public repositories directly.</div>';}
  }
  document.addEventListener('DOMContentLoaded',init);
})();