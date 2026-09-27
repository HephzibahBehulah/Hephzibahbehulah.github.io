/* HB runtime boot guard: detects missing/broken intelligence bundle on GitHub Pages. */
(() => {
  'use strict';
  const showFailure = () => {
    if (window.__HB_INTELLIGENCE_HUB_READY) return;
    const targets = ['#sourceGrid','#ebookGrid','#megaToolGrid','#engineeringGrid','#docGrid','#microTools'];
    targets.forEach(sel => {
      const el = document.querySelector(sel);
      if (el && (!el.children.length || /LOADING|indexing|catalogue/i.test(el.textContent))) {
        el.innerHTML = '<div class="intel-empty">PORTFOLIO RUNTIME DID NOT LOAD · <button type="button" class="os-btn" onclick="location.reload()">RELOAD</button></div>';
      }
    });
    const script = document.createElement('script');
    script.src = 'js/intelligence-hub.js?v=20260924-7-retry';
    script.async = false;
    script.onload = () => window.__HB_INTELLIGENCE_HUB_READY && console.info('HB intelligence runtime recovered');
    document.body.appendChild(script);
  };
  window.addEventListener('load', () => setTimeout(showFailure, 250));
})();