// Safari — tabs, address bar, start page with favorites.
import { glyph } from '../icons.js';

export const windowConfig = { width: 900, height: 580 };

const FAVORITES = [
  { name:'Apple',    url:'https://www.apple.com',     color:'#000', letter:'' },
  { name:'Wikipedia',url:'https://en.wikipedia.org',  color:'#000', letter:'W' },
  { name:'GitHub',   url:'https://github.com',        color:'#24292e', letter:'' },
  { name:'YouTube',  url:'https://www.youtube.com',   color:'#ff0000', letter:'' },
  { name:'Reddit',   url:'https://www.reddit.com',    color:'#ff4500', letter:'R' },
  { name:'Hacker News', url:'https://news.ycombinator.com', color:'#ff6600', letter:'Y' },
  { name:'MDN',      url:'https://developer.mozilla.org', color:'#000', letter:'M' },
  { name:'Example', url:'https://example.com',       color:'#0a84ff', letter:'E' },
];

export function mount(el) {
  const tabs = [{ id: 1, title: 'Start Page', url: '', active: true }];
  let nextTabId = 2;

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="safari-tabs" data-tabs></div>
      <div class="safari-bar">
        <div class="snav" data-act="back">${glyph('chevronLeft',18)}</div>
        <div class="snav" data-act="fwd">${glyph('chevronRight',18)}</div>
        <input type="text" placeholder="Search or enter website name" data-url />
        <div class="snav" data-act="reload">${glyph('chevronDown',18)}</div>
        <div class="snav" data-act="newtab">${glyph('plus',18)}</div>
      </div>
      <div class="safari-view" data-view></div>
    </div>
  `;
  const tabsEl = el.querySelector('[data-tabs]');
  const urlInput = el.querySelector('[data-url]');
  const view = el.querySelector('[data-view]');

  function renderTabs() {
    tabsEl.innerHTML = tabs.map(t => `
      <div class="safari-tab ${t.active?'sel':''}" data-tab="${t.id}">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px">${escapeHtml(t.title)}</span>
        <span class="st-close" data-close="${t.id}">✕</span>
      </div>
    `).join('');
    tabsEl.querySelectorAll('.safari-tab').forEach(tt => {
      tt.addEventListener('click', (e) => {
        if (e.target.dataset.close) { closeTab(+e.target.dataset.close); return; }
        tabs.forEach(x => x.active = x.id === +tt.dataset.tab);
        renderTabs(); showActive();
      });
    });
  }

  function showActive() {
    const t = tabs.find(x => x.active);
    if (!t) return;
    urlInput.value = t.url;
    if (!t.url || t.url === 'start') { showStartPage(); return; }
    view.innerHTML = `<iframe src="${t.url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;
    // detect load failure (some sites block iframes — show a fallback message after timeout)
    const iframe = view.querySelector('iframe');
    let loaded = false;
    iframe.addEventListener('load', () => { loaded = true; t.title = t.url.replace(/^https?:\/\//,'').split('/')[0]; renderTabs(); });
    setTimeout(() => {
      if (!loaded && iframe) {
        // can't detect X-Frame-Options reliably; show a note if still blank
      }
    }, 4000);
  }

  function showStartPage() {
    view.innerHTML = `
      <div class="safari-start scroll">
        <h1 style="text-align:center">Start Page</h1>
        <div class="safari-fav">
          ${FAVORITES.map(f => `
            <a data-url="${f.url}">
              <div class="sf-ico" style="background:${f.color}">${f.letter || glyph('star',26)}</div>
              <span class="sf-lbl">${f.name}</span>
            </a>
          `).join('')}
        </div>
        <div style="margin-top:30px;text-align:center;opacity:.5;font-size:13px">
          Note: Some sites block embedding. If a page doesn't load, that's the site's security policy.
        </div>
      </div>
    `;
    view.querySelectorAll('[data-url]').forEach(a => {
      a.addEventListener('click', () => navigate(a.dataset.url));
    });
  }

  function navigate(url) {
    if (!url) return;
    if (!url.match(/^https?:\/\//)) {
      // treat as search
      if (url.includes('.') && !url.includes(' ')) url = 'https://' + url;
      else url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
    }
    const t = tabs.find(x => x.active);
    t.url = url;
    t.title = url.replace(/^https?:\/\//,'').split('/')[0] || 'Loading…';
    renderTabs(); showActive();
  }

  function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx < 0) return;
    tabs.splice(idx, 1);
    if (tabs.length === 0) { tabs.push({ id: nextTabId++, title: 'Start Page', url: '', active: true }); }
    else if (tabs[idx]?.active || !tabs.find(t => t.active)) tabs[Math.max(0, idx-1)].active = true;
    renderTabs(); showActive();
  }

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigate(urlInput.value);
  });
  el.querySelector('[data-act="back"]').addEventListener('click', () => { try { view.querySelector('iframe')?.contentWindow.history.back(); } catch {} });
  el.querySelector('[data-act="fwd"]').addEventListener('click', () => { try { view.querySelector('iframe')?.contentWindow.history.forward(); } catch {} });
  el.querySelector('[data-act="reload"]').addEventListener('click', () => { const t = tabs.find(x => x.active); if (t?.url) showActive(); else showStartPage(); });
  el.querySelector('[data-act="newtab"]').addEventListener('click', () => {
    tabs.forEach(t => t.active = false);
    tabs.push({ id: nextTabId++, title: 'Start Page', url: '', active: true });
    renderTabs(); showActive(); urlInput.focus();
  });

  renderTabs(); showActive();
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
