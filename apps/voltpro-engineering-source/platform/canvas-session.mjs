const encode = value => JSON.stringify(value);

export class CanvasSession {
  constructor({ tool, read, restore, clear, save, isEmpty, onCleanOpen = () => {}, onRestore = () => {},
    storage = localStorage, windowRef = window, documentRef = document, legacyKeys = [], preserveCurrent = false }) {
    Object.assign(this, { tool, read, restore, clear, save, isEmpty, onCleanOpen, onRestore, storage, windowRef, documentRef, legacyKeys });
    this.key = `voltpro-recovery-v1-${tool}`;
    this.baseline = encode(read());
    this.busy = false;
    if (!preserveCurrent) this.showStartup();
    this.timer = windowRef.setInterval(() => this.checkpoint(), 12000);
    this.beforeUnload = event => {
      if (!this.dirty()) return;
      event.preventDefault();
      event.returnValue = '';
    };
    this.pageHide = () => { if (this.dirty()) this.checkpoint(true); };
    windowRef.addEventListener('beforeunload', this.beforeUnload);
    windowRef.addEventListener('pagehide', this.pageHide);
    documentRef.addEventListener('click', this.onClick = event => this.guardLink(event), true);
  }

  dirty() { try { return encode(this.read()) !== this.baseline; } catch { return true; } }
  checkpoint(force = false) {
    if (!force && !this.dirty()) return;
    try { this.storage.setItem(this.key, JSON.stringify({ version: 1, tool: this.tool, savedAt: Date.now(), data: this.read() })); } catch { /* Recovery storage is best effort. */ }
  }
  markSaved() { this.baseline = encode(this.read()); this.storage.removeItem(this.key); }
  markClean() { this.baseline = encode(this.read()); this.storage.removeItem(this.key); }
  markChanged() { this.checkpoint(); }
  showStartup() {
    let raw = this.storage.getItem(this.key);
    let source = this.key;
    if (!raw) for (const legacy of this.legacyKeys) { raw = this.storage.getItem(legacy); if (raw) { source = legacy; break; } }
    if (raw) {
      let parsed;
      try { parsed = JSON.parse(raw); parsed = parsed?.data ?? parsed; } catch { parsed = null; }
      if (parsed && !this.isEmpty(parsed)) { this.prompt('We found an unsaved project from your last session. Restore it?', 'Restore', 'Dismiss', async () => {
        try { await this.clear(); this.baseline = encode(this.read()); await this.restore(parsed); this.removeLegacySnapshots(); this.onRestore(); }
        catch (error) { this.showError(error); this.storage.removeItem(source); this.cleanStart(); }
      }, () => { this.removeLegacySnapshots(); this.cleanStart(); }); return; }
      this.storage.removeItem(source);
    }
    this.cleanStart();
  }
  cleanStart() { Promise.resolve(this.clear()).then(() => { this.baseline = encode(this.read()); this.onCleanOpen(); }).catch(error => this.showError(error)); }
  removeLegacySnapshots() { this.storage.removeItem(this.key); for (const key of this.legacyKeys) this.storage.removeItem(key); }
  prompt(message, primary, secondary, accept, dismiss) {
    this.choose(message, [[primary, 'accept', accept], [secondary, 'dismiss', dismiss]]);
  }
  choose(message, buttons) {
    const dlg = this.documentRef.createElement('dialog');
    dlg.className = 'canvas-session-dialog';
    dlg.innerHTML = `<form method="dialog"><p>${message}</p><div>${buttons.map(([label, value]) => `<button value="${value}">${label}</button>`).join('')}</div></form>`;
    this.documentRef.body.append(dlg);
    dlg.addEventListener('close', () => { const choice = buttons.find(([, value]) => value === dlg.returnValue) || buttons.at(-1); dlg.remove(); choice?.[2](); }, { once: true });
    if (typeof dlg.showModal === 'function') dlg.showModal(); else { const choice = this.windowRef.confirm(message) ? buttons[0] : buttons.at(-1); dlg.close(choice[1]); }
  }
  showError(error) { this.windowRef.alert(`Could not restore this project: ${error?.message || error}`); }
  guardLink(event) {
    if (this.busy || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const next = new URL(link.href, this.windowRef.location.href), current = new URL(this.windowRef.location.href);
    if (next.origin !== current.origin || (next.pathname === current.pathname && next.search === current.search && next.hash)) return;
    if (!this.dirty()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    this.choose('You have an unsaved project. Save before leaving?', [
      ['Save', 'save', async () => { try { await this.save(); this.markSaved(); this.busy = true; this.windowRef.location.assign(next.href); } catch (error) { this.showError(error); } }],
      ['Discard', 'discard', async () => { await this.clear(); this.markClean(); this.busy = true; this.windowRef.location.assign(next.href); }],
      ['Cancel', 'cancel', () => {}]
    ]);
  }
  dispose() { this.windowRef.clearInterval(this.timer); this.windowRef.removeEventListener('beforeunload', this.beforeUnload); this.windowRef.removeEventListener('pagehide', this.pageHide); this.documentRef.removeEventListener('click', this.onClick, true); }
}

export function installCanvasSessionStyles(documentRef = document) {
  if (documentRef.getElementById('canvas-session-style')) return;
  const style = documentRef.createElement('style'); style.id = 'canvas-session-style';
  style.textContent = `.canvas-session-dialog{position:fixed;inset:0;margin:auto;width:min(440px,calc(100vw - 32px));border:1px solid #51677d;border-radius:14px;background:#101c2a;color:#edf6ff;padding:24px;box-shadow:0 24px 90px #000b;font:15px system-ui;z-index:100000}.canvas-session-dialog::backdrop{background:#020811bb;backdrop-filter:blur(3px)}.canvas-session-dialog p{line-height:1.5}.canvas-session-dialog form>div{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}.canvas-session-dialog button{border:1px solid #54708a;background:#172b40;color:#edf6ff;border-radius:8px;padding:9px 16px;cursor:pointer}.canvas-session-dialog button:first-child{background:#c93545;border-color:#c93545;font-weight:700}`;
  documentRef.head.append(style);
}
