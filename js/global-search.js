/* HB GLOBAL SEARCH
   Simple site-wide dropdown search.
   Searches the public first-party pages and opens the matching result.
*/
(() => {
  'use strict';

  const INPUT_ID = 'globalResourceSearch';
  const PAGES = [
    { path: './', title: 'Home' },
    { path: 'about.html', title: 'About' },
    { path: 'contact.html', title: 'Contact' },
    { path: 'engineering-library.html', title: 'Engineering Library' },
    { path: 'recon-hub.html', title: 'Recon Hub' },
    { path: 'ai-lab.html', title: 'AI Lab' }
  ];

  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const normal = value => clean(value).toLowerCase();
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));

  function extract(doc, page) {
    const records = [];
    const seen = new Set();

    doc.querySelectorAll('main h1, main h2, main h3, main h4, main p, main li, main article, main a, main button, main .hb-card, main .hb-tool, main .os-node, main .os-leaf').forEach(el => {
      if (el.closest('script,style,noscript')) return;
      const text = clean(el.innerText || el.textContent);
      if (!text || text.length < 2) return;

      const section = clean(
        el.closest('section[id],article,[role="region"]')?.querySelector('h1,h2,h3,h4,.os-panel-head span')?.textContent
        || page.title
      );
      const href = el.getAttribute('href');
      const target = el.id || '';
      const url = href && !href.startsWith('#') ? href : page.path;
      const key = section + '|' + url + '|' + text.slice(0, 220);

      if (!seen.has(key)) {
        seen.add(key);
        records.push({ text, section, url, target, page: page.title });
      }
    });

    return records;
  }

  async function loadPage(page) {
    try {
      const response = await fetch(page.path, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) return [];
      const html = await response.text();
      return extract(new DOMParser().parseFromString(html, 'text/html'), page);
    } catch {
      return [];
    }
  }

  function score(item, query) {
    const words = normal(query).split(/\s+/).filter(Boolean);
    const text = normal(item.text);
    const section = normal(item.section);
    const page = normal(item.page);
    let points = 0;

    for (const word of words) {
      const position = text.indexOf(word);
      if (position === -1 && !section.includes(word) && !page.includes(word)) return -Infinity;
      if (position === 0) points += 80;
      else if (position > -1) points += 30;
      if (section.includes(word)) points += 20;
      if (page.includes(word)) points += 15;
    }

    return points;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById(INPUT_ID);
    if (!input) return;

    input.removeAttribute('disabled');
    input.removeAttribute('readonly');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'hbSearchDropdown');

    const wrapper = document.createElement('div');
    wrapper.className = 'hb-search-wrap';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hb-search-button';
    button.setAttribute('aria-label', 'Search website');
    button.innerHTML = '⌕';
    wrapper.appendChild(button);

    const dropdown = document.createElement('div');
    dropdown.id = 'hbSearchDropdown';
    dropdown.className = 'hb-search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.innerHTML = '<div class="hb-search-status">Type to search the website.</div>';
    wrapper.appendChild(dropdown);

    let index = [];
    let loaded = false;
    let loading = null;
    let results = [];
    let active = -1;

    function openDropdown() {
      dropdown.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      dropdown.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      active = -1;
    }

    function showStatus(message) {
      dropdown.innerHTML = '<div class="hb-search-status">' + escapeHTML(message) + '</div>';
      active = -1;
    }

    function render(query) {
      query = clean(query);
      openDropdown();

      if (!query) {
        showStatus('Type a word, topic, tool, project or page name.');
        return;
      }

      results = index
        .map(item => ({ item, score: score(item, query) }))
        .filter(row => Number.isFinite(row.score))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      if (!results.length) {
        showStatus('No matching content found.');
        return;
      }

      dropdown.innerHTML = results.map((row, i) => {
        const snippet = row.item.text.length > 170 ? row.item.text.slice(0, 170) + '…' : row.item.text;
        return '<button type="button" class="hb-search-result" data-index="' + i + '" role="option">'
          + '<span>' + escapeHTML(row.item.page) + ' · ' + escapeHTML(row.item.section) + '</span>'
          + '<strong>' + escapeHTML(snippet) + '</strong>'
          + '</button>';
      }).join('');

      active = -1;
    }

    async function buildIndex() {
      if (loaded) return index;
      if (loading) return loading;

      loading = Promise.all(PAGES.map(loadPage))
        .then(pages => {
          index = pages.flat();
          loaded = true;
          return index;
        })
        .catch(() => index);

      return loading;
    }

    async function search() {
      const query = clean(input.value);
      openDropdown();

      if (!query) {
        showStatus('Type a word, topic, tool, project or page name.');
        return;
      }

      showStatus('Searching the website…');
      await buildIndex();
      render(query);
    }

    function openResult(item) {
      closeDropdown();

      if (item.url && item.url !== '#' && item.url !== './' && item.url !== location.pathname) {
        window.location.href = item.url;
        return;
      }

      if (item.target) {
        const target = document.getElementById(item.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('hb-search-hit');
          setTimeout(() => target.classList.remove('hb-search-hit'), 1000);
          return;
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    input.addEventListener('focus', () => {
      if (input.value.trim()) search();
      else openDropdown();
    });

    input.addEventListener('input', search);

    button.addEventListener('click', () => {
      if (dropdown.classList.contains('open') && input.value.trim()) {
        if (results[0]) openResult(results[0].item);
        else search();
      } else {
        input.focus();
        search();
      }
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeDropdown();
        input.blur();
        return;
      }

      if (event.key === 'ArrowDown' && results.length) {
        event.preventDefault();
        active = Math.min(active + 1, results.length - 1);
        dropdown.querySelectorAll('.hb-search-result').forEach((el, i) => el.classList.toggle('active', i === active));
        return;
      }

      if (event.key === 'ArrowUp' && results.length) {
        event.preventDefault();
        active = Math.max(active - 1, 0);
        dropdown.querySelectorAll('.hb-search-result').forEach((el, i) => el.classList.toggle('active', i === active));
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (active >= 0 && results[active]) openResult(results[active].item);
        else if (results[0]) openResult(results[0].item);
        else search();
      }
    });

    dropdown.addEventListener('click', event => {
      const result = event.target.closest('.hb-search-result');
      if (!result) return;
      const row = results[Number(result.dataset.index)];
      if (row) openResult(row.item);
    });

    document.addEventListener('click', event => {
      if (!wrapper.contains(event.target)) closeDropdown();
    });

    // Build the index quietly after the page is ready.
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => buildIndex(), { timeout: 2500 });
    } else {
      setTimeout(() => buildIndex(), 1000);
    }
  });
})();
