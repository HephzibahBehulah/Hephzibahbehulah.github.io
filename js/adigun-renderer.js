/* ADIGUN response renderer: Markdown + safe HTML + LaTeX + copy controls. */
(() => {
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function normalizeMarkdownEscapes(value) {
    const source = String(value ?? '');
    const chunks = source.split(/(```[\\s\\S]*?```)/g);
    return chunks.map((chunk, index) => {
      if (index % 2 === 1) return chunk;
      return chunk.replace(/\\([\\`*_{}#+.!|>~-])/g, '$1');
    }).join('');
  }

  function render(text) {
    const source = normalizeMarkdownEscapes(text);
    try {
      if (window.marked && window.DOMPurify) {
        const html = window.DOMPurify.sanitize(window.marked.parse(source, {
          breaks: true,
          gfm: true
        }), {
          USE_PROFILES: { html: true },
          ADD_ATTR: ['target','rel']
        });
        return html;
      }
    } catch {}

    return '<p>' + escapeHTML(source).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
  }

  function typeset(root) {
    if (!root || !window.renderMathInElement) return;
    try {
      window.renderMathInElement(root, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '\\[', right: '\\]', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false}
        ],
        throwOnError: false,
        strict: false
      });
    } catch {}
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) {
        const old = button.textContent;
        button.textContent = 'COPIED';
        setTimeout(() => { button.textContent = old; }, 1200);
      }
      return true;
    } catch {
      return false;
    }
  }

  function addCopyControls(el, source) {
    const toolbar = document.createElement('div');
    toolbar.className = 'adigun-copy-toolbar';
    const responseButton = document.createElement('button');
    responseButton.type = 'button';
    responseButton.className = 'adigun-copy-button';
    responseButton.textContent = 'COPY RESPONSE';
    responseButton.title = 'Copy the original Markdown response so it can be pasted with its formatting intact';
    responseButton.addEventListener('click', () => copyText(source, responseButton));
    toolbar.appendChild(responseButton);

    el.querySelectorAll('pre').forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'adigun-code-copy';
      button.textContent = 'COPY CODE';
      button.addEventListener('click', () => copyText(code.textContent, button));
      pre.classList.add('adigun-code-block');
      pre.appendChild(button);
    });

    el.prepend(toolbar);
  }

  function mount(el, text) {
    if (!el) return;
    const source = String(text ?? '');
    el.innerHTML = render(source);
    el.dataset.rawResponse = source;
    el.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    addCopyControls(el, source);
    typeset(el);
  }

  window.AdigunRenderer = { render, mount, typeset, copyText };
})();
