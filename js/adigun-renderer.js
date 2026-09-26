/* ADIGUN response renderer: Markdown + safe HTML + LaTeX. */
(() => {
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function render(text) {
    const source = String(text ?? '');
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

  function mount(el, text) {
    if (!el) return;
    el.innerHTML = render(text);
    el.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    typeset(el);
  }

  window.AdigunRenderer = { render, mount, typeset };
})();
