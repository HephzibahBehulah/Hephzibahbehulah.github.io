import fs from 'node:fs';
import path from 'node:path';

const MAIN='https://hephzibahbehulah.com';
const APP_HOSTS={engineering:'https://engineering.hephzibahbehulah.com',cyber:'https://cyber.hephzibahbehulah.com'};
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=value=>String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&(?:nbsp|amp|quot|#39|lt|gt);/g,' ').replace(/\s+/g,' ').trim();

function publicUrl(relative){
 const normalized=relative.replaceAll(path.sep,'/');
 if(normalized.startsWith('_hb/')||/(^|\/)(?:admin|admin-tools|account|member)(?:\.html|\/|$)/i.test(normalized))return null;
 let host=MAIN,route='/'+normalized;
 for(const [app,origin] of Object.entries(APP_HOSTS))if(normalized.startsWith(`_apps/${app}/`)){
  host=origin;route='/'+normalized.slice(`_apps/${app}/`.length);break;
 }
 if(route.endsWith('/index.html'))route=route.slice(0,-10);
 else if(route==='/index.html')route='/';
 else if(host!==MAIN&&route.endsWith('.html'))route=route.slice(0,-5);
 return host+route;
}

function applyHtml(file,relative){
 let html=fs.readFileSync(file,'utf8');
 const title=text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'Hephzibah Behulah');
 const descriptionTag=html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i);
 const existing=descriptionTag?.[0].match(/\bcontent=["']([^"']*)["']/i)?.[1];
 const heading=text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
 const description=(existing||`${heading||title} — learning, engineering and practical tools by Hephzibah Behulah.`).slice(0,300);
 if(!descriptionTag)html=html.replace(/<head\b[^>]*>/i,match=>`${match}<meta name="description" content="${escape(description)}">`);
 if(!/<meta\b(?=[^>]*\bproperty=["']og:title["'])/i.test(html))html=html.replace(/<head\b[^>]*>/i,match=>`${match}<meta property="og:title" content="${escape(title)}">`);
 if(!/<meta\b(?=[^>]*\bproperty=["']og:description["'])/i.test(html))html=html.replace(/<head\b[^>]*>/i,match=>`${match}<meta property="og:description" content="${escape(description)}">`);
 if(!/<meta\b(?=[^>]*\bproperty=["']og:type["'])/i.test(html))html=html.replace(/<head\b[^>]*>/i,match=>`${match}<meta property="og:type" content="website">`);
 if(!/<link\b(?=[^>]*\brel=["']icon["'])/i.test(html))html=html.replace(/<head\b[^>]*>/i,match=>`${match}<link rel="icon" href="${MAIN}/favicon.ico">`);
 const url=publicUrl(relative);
 if(url&&!/<meta\b(?=[^>]*\bproperty=["']og:url["'])/i.test(html))html=html.replace(/<head\b[^>]*>/i,match=>`${match}<meta property="og:url" content="${escape(url)}">`);
 const learning=/academy|learn|learning|engineering|simulator|breadboard|plc|pentest|resource|course|tutorial/i.test(`${title} ${relative}`);
 if(url&&learning&&!/"@type"\s*:\s*"LearningResource"/i.test(html)){
  const schema={'@context':'https://schema.org','@type':'LearningResource',name:title,description,url,inLanguage:'en',provider:{'@type':'Person',name:'Hephzibah Behulah'}};
  html=html.replace(/<head\b[^>]*>/i,match=>`${match}<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
 }
 fs.writeFileSync(file,html);
 return url;
}

export function generateSeo(destination){
 const urls=[];
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){walk(file);continue;}
  if(!entry.isFile()||!entry.name.endsWith('.html'))continue;
  const relative=path.relative(destination,file);
  const url=applyHtml(file,relative);
  if(url)urls.push(url);
 }}
 walk(destination);
 const unique=[...new Set(urls)].sort();
 const writeSitemap=(dir,origin,items)=>{
  fs.writeFileSync(path.join(dir,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /member\nDisallow: /api/\nDisallow: /_hb/\nSitemap: ${origin}/sitemap.xml\n`);
  fs.writeFileSync(path.join(dir,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.map(url=>`<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>\n`);
 };
 writeSitemap(destination,MAIN,unique.filter(url=>url.startsWith(MAIN+'/')));
 for(const [app,origin]of Object.entries(APP_HOSTS)){
  const dir=path.join(destination,'_apps',app);
  if(fs.existsSync(dir))writeSitemap(dir,origin,unique.filter(url=>url.startsWith(origin+'/')));
 }
 return unique;
}

export {publicUrl};
