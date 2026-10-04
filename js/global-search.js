/* HB GLOBAL SEARCH — compact, site-wide dropdown */
(() => {
  'use strict';

  const INPUT_ID = 'globalResourceSearch';
  const MIN_CHARS = 2;
  const MAX_RESULTS = 7;
  const PAGES = [
    {path:'./',title:'Home'},
    {path:'about.html',title:'About'},
    {path:'contact.html',title:'Contact'},
  ];

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const normal=v=>clean(v).toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeRegExp=v=>v.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&');

  function extract(doc,page){
    const root=doc.querySelector('main')||doc.body;
    if(!root)return[];
    root.querySelectorAll('script,style,noscript,header,footer,nav,form,svg').forEach(el=>el.remove());

    const records=[],seen=new Set();
    let section=page.title;

    root.querySelectorAll('h1,h2,h3,h4,p,li').forEach(el=>{
      const text=clean(el.textContent);
      if(!text||text.length<3||text.length>500)return;
      if(/^H[1-4]$/.test(el.tagName)){section=text;return;}
      const key=normal(text)+'|'+normal(section);
      if(seen.has(key))return;
      seen.add(key);
      records.push({text,section,page:page.title,url:page.path,target:el.id||''});
    });

    const title=clean(doc.title);
    const description=clean(doc.querySelector('meta[name="description"]')?.content);
    if(title)records.unshift({text:title,section:page.title,page:page.title,url:page.path,target:''});
    if(description)records.unshift({text:description,section:page.title,page:page.title,url:page.path,target:''});
    return records;
  }

  async function loadPage(page){
    try{
      const response=await fetch(page.path,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok)return[];
      return extract(new DOMParser().parseFromString(await response.text(),'text/html'),page);
    }catch{return[];}
  }

  function score(item,query){
    const q=normal(query),words=q.split(/\s+/).filter(Boolean);
    const text=normal(item.text),section=normal(item.section),page=normal(item.page);
    let points=0;
    if(text===q)points+=160;
    if(text.startsWith(q))points+=70;
    if(text.includes(q))points+=45;
    if(section.includes(q))points+=35;
    if(page.includes(q))points+=25;

    for(const word of words){
      const re=new RegExp('(^|\\s|[^a-z0-9])'+escapeRegExp(word)+'($|\\s|[^a-z0-9])','i');
      if(re.test(item.text))points+=30;
      else if(text.includes(word))points+=10;
      else if(section.includes(word)||page.includes(word))points+=5;
      else return-Infinity;
    }
    return points;
  }

  function init(){
    const input=document.getElementById(INPUT_ID);
    if(!input||input.dataset.hbSearchReady==='1')return;
    input.dataset.hbSearchReady='1';

    const wrapper=document.createElement('div');
    wrapper.className='hb-search-wrap';
    input.parentNode.insertBefore(wrapper,input);
    wrapper.appendChild(input);

    const button=document.createElement('button');
    button.type='button';
    button.className='hb-search-button';
    button.setAttribute('aria-label','Search website');
    button.textContent='⌕';
    wrapper.appendChild(button);

    const dropdown=document.createElement('div');
    dropdown.id='hbSearchDropdown';
    dropdown.className='hb-search-dropdown';
    dropdown.setAttribute('role','listbox');
    wrapper.appendChild(dropdown);

    input.removeAttribute('disabled');
    input.removeAttribute('readonly');
    input.setAttribute('autocomplete','off');
    input.setAttribute('aria-expanded','false');
    input.setAttribute('aria-controls',dropdown.id);

    let index=[],results=[],active=-1,loaded=false,loading=null,timer=null;

    const open=()=>{
      dropdown.classList.add('open');
      input.setAttribute('aria-expanded','true');
    };
    const close=()=>{
      dropdown.classList.remove('open');
      input.setAttribute('aria-expanded','false');
      active=-1;
    };
    const status=message=>{
      dropdown.innerHTML='<div class="hb-search-status">'+esc(message)+'</div>';
      results=[];
      active=-1;
    };

    function render(query){
      const q=clean(query);
      open();
      if(!q){status('Type a topic, tool, project or page name.');return;}
      if(q.length<MIN_CHARS){status('Type at least 2 characters.');return;}

      results=index
        .map(item=>({item,score:score(item,q)}))
        .filter(row=>Number.isFinite(row.score))
        .sort((a,b)=>b.score-a.score)
        .reduce((out,row)=>{
          const key=row.item.page+'|'+normal(row.item.text);
          if(!out.some(x=>x.key===key))out.push({...row,key});
          return out;
        },[])
        .slice(0,MAX_RESULTS);

      if(!results.length){status('No matching content found.');return;}

      dropdown.innerHTML=results.map((row,i)=>{
        const snippet=row.item.text.length>190?row.item.text.slice(0,190)+'…':row.item.text;
        return '<button type="button" class="hb-search-result" data-index="'+i+'" role="option" aria-selected="false">'
          +'<span>'+esc(row.item.page)+' · '+esc(row.item.section)+'</span>'
          +'<strong>'+esc(snippet)+'</strong></button>';
      }).join('');
      active=-1;
    }

    async function buildIndex(){
      if(loaded)return index;
      if(loading)return loading;
      loading=Promise.all(PAGES.map(loadPage)).then(pages=>{
        index=pages.flat();
        loaded=true;
        return index;
      }).catch(()=>index);
      return loading;
    }

    async function runSearch(){
      const q=clean(input.value);
      open();
      if(!q){status('Type a topic, tool, project or page name.');return;}
      if(q.length<MIN_CHARS){status('Type at least 2 characters.');return;}
      status('Searching…');
      await buildIndex();
      if(clean(input.value)===q)render(q);
    }

    function activate(i){
      active=i;
      dropdown.querySelectorAll('.hb-search-result').forEach((el,n)=>{
        const selected=n===active;
        el.classList.toggle('active',selected);
        el.setAttribute('aria-selected',selected?'true':'false');
      });
      dropdown.querySelector('.hb-search-result.active')?.scrollIntoView({block:'nearest'});
    }

    function openResult(item){
      close();
      window.location.href=item.url;
    }

    input.addEventListener('focus',()=>{
      open();
      if(input.value.trim())runSearch();
      else status('Type a topic, tool, project or page name.');
    });

    input.addEventListener('input',()=>{
      clearTimeout(timer);
      timer=setTimeout(runSearch,180);
    });

    button.addEventListener('click',()=>{
      if(results.length)openResult(results[active>=0?active:0].item);
      else{input.focus();runSearch();}
    });

    input.addEventListener('keydown',event=>{
      if(event.key==='Escape'){close();input.blur();}
      else if(event.key==='ArrowDown'&&results.length){event.preventDefault();activate(Math.min(active+1,results.length-1));}
      else if(event.key==='ArrowUp'&&results.length){event.preventDefault();activate(Math.max(active-1,0));}
      else if(event.key==='Enter'){event.preventDefault();if(results.length)openResult(results[active>=0?active:0].item);else runSearch();}
    });

    dropdown.addEventListener('click',event=>{
      const result=event.target.closest('.hb-search-result');
      if(!result)return;
      const row=results[Number(result.dataset.index)];
      if(row)openResult(row.item);
    });

    document.addEventListener('click',event=>{
      if(!wrapper.contains(event.target))close();
    });

    if('requestIdleCallback' in window)window.requestIdleCallback(buildIndex,{timeout:2500});
    else setTimeout(buildIndex,700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();