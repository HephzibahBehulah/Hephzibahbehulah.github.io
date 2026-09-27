/* HB GLOBAL SEARCH v2
   Central site-wide search for the main portfolio.
   Searches the current DOM, known first-party pages, tools, resources,
   terminal commands and accessible metadata without touching Recon Hub.
*/
(() => {
  'use strict';

  const INPUT_ID = 'globalResourceSearch';
  const PAGE_INDEX = [
    { path: './', title: 'Home / Intelligence Map' },
    { path: 'about.html', title: 'About' },
    { path: 'contact.html', title: 'Contact' },
    { path: 'engineering-library.html', title: 'Engineering Library' },
    { path: 'recon-hub.html', title: 'Recon Hub' },
    { path: 'ai-lab.html', title: 'AI Lab' }
  ];

  const terminalCommands = [
    'HELP','LIST','CLEAR','EXIT','PWD','CD','CHDIR','HISTORY','ECHO','DATE','VERSION','ABOUT','TREE','STATUS','WHOAMI','MAN','WHICH','IA','IS','NAV','OPEN','FOCUS',
    'OHM','POWER','ENERGY','RESISTOR','LED','COLOR','FREQUENCY','RMS','EFFICIENCY','VOLTAGE','CURRENT','IMPEDANCE','DIVIDER','VOLTAGE-DIVIDER','SERIES-RESISTANCE','PARALLEL-RESISTANCE','POWER-FACTOR','THREE-PHASE','MOTOR-TORQUE','VOLTAGE-DROP',
    'MEAN','MEDIAN','MODE','RANGE','VARIANCE','STD','ZSCORE','PRECISION','RECALL','F1','MIN','MAX','SUM','COUNT','PERCENT','PERCENTILE','QUARTILE','IQR','MAD','COVARIANCE','CORRELATION','SKEW','KURTOSIS','NORMALIZE','STANDARDIZE','MINMAX','OUTLIER','DISTRIBUTION','ACCURACY','CONFUSION','ROC','AUC','MAE','MSE','RMSE','R2','MAPE',
    'BASE64','ENCODE','DECODE','HASH','SHA256','JWT','CSRF','XSS','SQLI','MFA','PASSWORD','SSRF','XXE','IDOR','CORS','CSP','SESSION','COOKIE','AUTH','AUTHZ','PHISHING','MITM','AES','RSA','ECC','HMAC','PBKDF2','ARGON2',
    'URLINFO','URL','HEADERS','ROBOTS','SITEMAP','CRT','WHOIS','DOMAIN','SUBDOMAIN','CERTIFICATE','DNS-RECORD','MX','TXT','NS','CAA','WAYBACK','ASN','IPINFO','EVIDENCE','IOC','IOC-TYPE','IOC-EXTRACT','DOMAIN-EXTRACT','IP-EXTRACT','HASH-EXTRACT','URL-EXTRACT',
    'IP','CIDR','SUBNET','PORTS','PROTOCOL','TCP','UDP','ICMP','ARP','HTTP','HTTPS','DNS','DNSLOOKUP','NSLOOKUP','ROUTE','MAC','PING','TRACEROUTE','NMAP','HOSTS','NETWORK','BROADCAST','WILDCARD','PREFIX','MASK','IPV6','PACKET','FRAME','MTU','MSS','TCP-HANDSHAKE','TLS',
    'QUIZ','ANSWER','SCORE','RULES','CHECK','SELFTEST','GAME','EXPLAIN','GLOSSARY','LEARN','TOOLS','TOOL','PROJECT','REPO','CONVERT','FORMULA','FORMULAS','SOLVE','GRAPH','PLOT','WAVEFORM','SIMULATE','SIM','SEARCH','FIND','LOOKUP','RELATED','PROFILE','PROGRESS','LEVEL','STREAK','XP','BADGES','SKILLS','WEAKNESS','MASTERED',
    'CAPACITOR','INDUCTOR','REACTANCE','ADMITTANCE','RESISTIVITY','CONDUCTIVITY','APPARENT-POWER','REACTIVE-POWER','REAL-POWER','KVA','KVAR','KWH','CABLE-SIZE','FUSE','BREAKER','SHORT-CIRCUIT','FAULT-CURRENT','DIODE','ZENER','TRANSISTOR','MOSFET','BJT','RECTIFIER','FILTER','RC','RL','RLC','LOWPASS','HIGHPASS','BANDPASS','NOTCH','GAIN','DECIBEL','ADC','DAC','PWM','DUTY','SAMPLING','NYQUIST','RPM','PLC','LADDER','RELAY','CONTACTOR','SENSOR','ACTUATOR','PID','SETPOINT',
    'FILE','MAGIC','TIMESTAMP','METADATA','ENCODING','LOG','LOG-PARSE','HTML','CSS','JS','DOM','JSON','API','REST','FETCH','PROMISE','ASYNC','EVENT','LOCALSTORAGE','SESSIONSTORAGE','JSON-FORMAT','JSON-MINIFY','JSON-VALIDATE','HTML-ESCAPE','HTML-UNESCAPE',
    'GIT','GITHUB','CLONE','COMMIT','BRANCH','MERGE','PULL','PUSH','FETCH','REMOTE','DIFF','RESET','REBASE','PYTHON','PY','VARIABLE','ARRAY','LIST','DICT','TUPLE','SET','LOOP','FUNCTION','CLASS','IMPORT','EXCEPTION','PANDAS','NUMPY','SKLEARN',
    'AI','LLM','PROMPT','TOKEN','CONTEXT','RAG','EMBEDDING','VECTOR','GUARDRAIL','JAILBREAK','PROMPT-INJECTION','DATA-POISONING','MODEL-EXTRACTION'
  ];

  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const normalize = value => clean(value).toLowerCase();

  function pageLabel(doc, fallback) {
    return clean(doc.querySelector('title')?.textContent || fallback || 'Website');
  }

  function sectionLabel(el, fallback) {
    const section = el?.closest?.('section[id],article,[role="region"]');
    const heading = section?.querySelector('h1,h2,h3,.os-panel-head span');
    return clean(heading?.textContent || section?.id || fallback || 'Website');
  }

  function extractDocument(doc, pageTitle, pagePath) {
    const records = [];
    const seen = new Set();
    const add = (text, section, target, url) => {
      const value = clean(text);
      if (!value) return;
      const key = `${url}|${target || ''}|${value.slice(0, 280)}`;
      if (seen.has(key)) return;
      seen.add(key);
      records.push({ text:value, section:clean(section || pageTitle), target:target || '', url:url || pagePath, page:pageTitle });
    };

    doc.querySelectorAll('main h1,main h2,main h3,main h4,main p,main li,main article,main .os-item,main .os-node,main .os-leaf,main .hb-card,main .hb-tool,main button,main a').forEach(el => {
      if (el.closest('script,style,noscript')) return;
      const text = clean(el.innerText || el.textContent);
      if (!text) return;
      const href = el.getAttribute('href');
      add(text, sectionLabel(el, pageTitle), el.id || '', href && !href.startsWith('#') ? href : pagePath);
    });

    const bodyText = clean(doc.body?.innerText || '');
    if (bodyText) add(bodyText.slice(0, 12000), pageTitle, '', pagePath);
    return records;
  }

  function currentRecords() {
    return extractDocument(document, pageLabel(document, 'Home / Intelligence Map'), location.pathname || './');
  }

  async function fetchPage(entry) {
    try {
      const response = await fetch(entry.path, { cache:'force-cache', credentials:'same-origin' });
      if (!response.ok) return [];
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return extractDocument(doc, entry.title, entry.path);
    } catch {
      return [];
    }
  }

  function terminalRecords() {
    return terminalCommands.map(command => ({ text:`${command} · HB Terminal command`, section:'HB TERMINAL', target:'terminal', url:'#terminal', page:'Home / Intelligence Map' }));
  }

  function buildSearchIndex(pageRecords) {
    const all = [...currentRecords(), ...terminalRecords(), ...pageRecords.flat()];
    const seen = new Set();
    return all.filter(item => {
      const key = `${item.url}|${item.target}|${item.text.slice(0,280)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function score(item, query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const hay = normalize(item.text);
    const section = normalize(item.section);
    let total = 0;
    for (const word of words) {
      const pos = hay.indexOf(word);
      if (pos < 0) return -Infinity;
      total += pos === 0 ? 80 : 20;
      if (hay.startsWith(word)) total += 30;
      if (section.includes(word)) total += 25;
    }
    if (normalize(item.page).includes(normalize(query))) total += 12;
    return total;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const original = document.getElementById(INPUT_ID);
    if (!original) return;

    // Replace the old input so legacy handlers cannot turn the field into a placeholder.
    const input = original.cloneNode(true);
    input.removeAttribute('readonly');
    input.removeAttribute('disabled');
    input.autocomplete = 'off';
    original.replaceWith(input);

    // Provide an explicit search button as well as live typing and Enter-key search.
    let trigger = document.querySelector('.hb-global-search-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'hb-global-search-trigger';
      trigger.textContent = 'SEARCH';
      trigger.setAttribute('aria-label', 'Search the entire website');
      trigger.style.cssText = 'height:38px;padding:0 14px;border:1px solid rgba(0,255,170,.35);background:#07120f;color:#9fffe0;font:600 12px/1 system-ui,sans-serif;letter-spacing:.08em;cursor:pointer;';
      input.insertAdjacentElement('afterend', trigger);
    }
    document.querySelectorAll('.hb-global-search-overlay').forEach(node => node.remove());

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/hb-global-search.css?v=20260925-2';
    document.head.appendChild(css);

    const overlay = document.createElement('div');
    overlay.className = 'hb-global-search-overlay';
    overlay.innerHTML = `<div class="hb-global-search-panel" role="dialog" aria-modal="true" aria-label="Search everything"><div class="hb-global-search-head"><span>GLOBAL SEARCH / ALL HB INTELLIGENCE</span><button class="hb-global-search-close" type="button" aria-label="Close search">×</button></div><div class="hb-global-search-meta"></div><div class="hb-global-search-results"></div></div>`;
    document.body.appendChild(overlay);

    const meta = overlay.querySelector('.hb-global-search-meta');
    const results = overlay.querySelector('.hb-global-search-results');
    const close = overlay.querySelector('.hb-global-search-close');
    let index = terminalRecords();
    let lastResults = [];
    let loaded = false;
    let loadingPromise = null;

    function showEmpty(message) { results.innerHTML = `<div class="hb-global-empty">${escapeHTML(message)}</div>`; }

    async function loadSiteIndex() {
      if (loaded) return index;
      if (loadingPromise) return loadingPromise;
      loadingPromise = Promise.all(PAGE_INDEX.map(fetchPage)).then(pages => { index = buildSearchIndex(pages); loaded = true; return index; }).catch(() => index);
      return loadingPromise;
    }

    function openResult(item) {
      overlay.classList.remove('open');
      if (item.url && /^https?:\/\//i.test(item.url)) { window.open(item.url, '_blank', 'noopener'); return; }
      if (item.url && item.url !== '#' && item.url !== location.pathname && item.url !== './') { window.location.href = item.url; return; }
      if (item.target) {
        const el = document.getElementById(item.target);
        if (el) { el.scrollIntoView({ behavior:'smooth', block:'center' }); el.classList.add('hb-search-hit'); setTimeout(() => el.classList.remove('hb-search-hit'), 1200); return; }
      }
      document.getElementById('terminal')?.scrollIntoView({ behavior:'smooth', block:'center' });
    }

    function render(raw) {
      const query = clean(raw);
      if (!query) {
        meta.textContent = 'Search the entire Hephzibah Behulah website: pages, tools, engineering, cybersecurity, OSINT, AI, projects, lessons and Terminal.';
        showEmpty('Start typing. Even a single letter searches the full indexed site.');
        overlay.classList.add('open');
        return;
      }
      lastResults = index.map(item => ({ item, score:score(item, query) })).filter(row => Number.isFinite(row.score)).sort((a,b) => b.score - a.score).slice(0,100);
      meta.textContent = `${lastResults.length} result${lastResults.length === 1 ? '' : 's'} for “${query}” · all indexed HB content`;
      results.innerHTML = lastResults.length ? lastResults.map((row, i) => {
        const snippetSource = row.item.text.length > 220 ? row.item.text.slice(0,220) + '…' : row.item.text;
        const highlighted = escapeHTML(snippetSource);
        return '<button class="hb-global-result" type="button" data-index="' + i + '"><span class="hb-global-result-title">' + escapeHTML(row.item.section) + ' · ' + escapeHTML(row.item.page) + '</span><strong>' + highlighted + '</strong></button>'
      }).join('') : `<div class="hb-global-empty">No exact site match. Press Enter to ask ADIGUN about “${escapeHTML(query)}”.</div>`;
      overlay.classList.add('open');
    }

    async function search(raw) {
      const query = clean(raw);
      render(query);
      if (!query) return;
      if (!loaded) {
        meta.textContent = 'INDEXING ALL HB PAGES…';
        showEmpty('Loading the site-wide search index…');
        overlay.classList.add('open');
        await loadSiteIndex();
        render(query);
      }
    }

    async function askAdigun(query) {
      try {
        meta.textContent = 'ADIGUN / THINKING';
        showEmpty('ADIGUN is checking the site intelligence layer…');
        overlay.classList.add('open');
        const response = await window.Adigun?.ask?.(query);
        results.innerHTML = '<div class="hb-global-result hb-adigun-answer" style="cursor:default"><span class="hb-global-result-title">ADIGUN</span><div class="adigun-rendered-answer"></div></div>';
        if (window.AdigunRenderer) window.AdigunRenderer.mount(results.querySelector('.adigun-rendered-answer'), response?.answer || 'No answer returned.'); else results.querySelector('.adigun-rendered-answer').textContent = response?.answer || 'No answer returned.';
      } catch { showEmpty('ADIGUN could not answer this query right now.'); }
    }

    input.addEventListener('focus', () => search(input.value));
    input.addEventListener('input', () => search(input.value));
    trigger.addEventListener('click', async () => {
      const query = clean(input.value);
      if (!query) { input.focus(); await search(''); return; }
      await search(query);
      if (lastResults[0]) { openResult(lastResults[0].item); }
      else await askAdigun(query);
    });
    input.addEventListener('keydown', async event => {
      if (event.key === 'Escape') { event.preventDefault(); overlay.classList.remove('open'); input.blur(); return; }
      if (event.key === 'Enter') {
        event.preventDefault();
        const query = clean(input.value);
        if (lastResults[0]) openResult(lastResults[0].item);
        else if (query) await askAdigun(query);
      }
    });

    results.addEventListener('click', event => {
      const button = event.target.closest('[data-index]');
      if (!button) return;
      const hit = lastResults[Number(button.dataset.index)];
      if (hit) openResult(hit.item);
    });

    close.addEventListener('click', () => { overlay.classList.remove('open'); input.blur(); });
    overlay.addEventListener('click', event => { if (event.target === overlay) { overlay.classList.remove('open'); input.blur(); } });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && overlay.classList.contains('open')) { overlay.classList.remove('open'); input.blur(); } });

    if ('requestIdleCallback' in window) window.requestIdleCallback(() => loadSiteIndex(), { timeout:2500 });
    else setTimeout(() => loadSiteIndex(), 1200);
  });
})();
