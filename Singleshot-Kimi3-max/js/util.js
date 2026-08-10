/* util.js — window.Mac namespace, DOM helpers, event bus, icons, art generators */
window.Mac = window.Mac || {};
(function () {
  const Mac = window.Mac;

  /* ---------------- event bus ---------------- */
  Mac.Bus = {
    m: {},
    on(e, f) { (this.m[e] = this.m[e] || []).push(f); },
    emit(e, d) { (this.m[e] || []).forEach(f => { try { f(d); } catch (err) { console.error(err); } }); }
  };

  /* ---------------- DOM helpers ---------------- */
  Mac.h = function (tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const kid of kids.flat(20)) {
      if (kid === null || kid === undefined || kid === false || kid === '') continue;
      n.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return n;
  };
  Mac.$ = s => document.querySelector(s);
  Mac.$$ = s => Array.from(document.querySelectorAll(s));
  Mac.uid = () => Math.random().toString(36).slice(2, 10);
  Mac.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  Mac.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  Mac.debounce = (fn, ms) => { let t; return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; };
  Mac.cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  Mac.fmtBytes = n => { n = +n || 0; if (n === 0) return 'Zero KB'; if (n < 1024) return n + ' bytes'; const u = ['KB', 'MB', 'GB', 'TB']; let i = -1; do { n /= 1024; i++; } while (n >= 1024); return n.toFixed(n < 10 ? 1 : 0) + ' ' + u[i]; };
  Mac.fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  Mac.fmtDateTime = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  Mac.fmtTime = d => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  Mac.todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  Mac.hash = s => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  Mac.rng = seed => { let a = Mac.hash(seed) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  /* ---------------- small UI glyphs (inline SVG, currentColor) ---------------- */
  const G = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const Gf = p => `<svg viewBox="0 0 24 24" fill="currentColor">${p}</svg>`;
  Mac.GLYPH = {
    'chev-l': G('<path d="M15 5l-7 7 7 7"/>'),
    'chev-r': G('<path d="M9 5l7 7-7 7"/>'),
    'chev-d': G('<path d="M6 9l6 6 6-6"/>'),
    'plus': G('<path d="M12 5v14M5 12h14"/>'),
    'minus': G('<path d="M5 12h14"/>'),
    'search': G('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/>'),
    'x': G('<path d="M6 6l12 12M18 6L6 18"/>'),
    'check': G('<path d="M4 12.5l5 5L20 7"/>'),
    'clock': G('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
    'folder': G('<path d="M3 7a2 2 0 012-2h4l2 2.5h8a2 2 0 012 2V17a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'),
    'doc': G('<path d="M7 3h7l4 4v13a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 20V4.5A1.5 1.5 0 017 3z"/><path d="M14 3v4h4"/>'),
    'download': G('<path d="M12 4v10m0 0l-4-4m4 4l4-4"/><path d="M5 19h14"/>'),
    'desktop': G('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>'),
    'note': G('<path d="M9 17V6l9-2v11"/><circle cx="6.5" cy="17" r="2.5"/><circle cx="15.5" cy="15" r="2.5"/>'),
    'photo': G('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 18l5-5 4 4 3-3 6 6"/>'),
    'grid': Gf('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
    'list': G('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.1" fill="currentColor"/><circle cx="4" cy="12" r="1.1" fill="currentColor"/><circle cx="4" cy="18" r="1.1" fill="currentColor"/>'),
    'wifi': G('<path d="M2.5 9.5a14 14 0 0119 0"/><path d="M5.5 13a9.5 9.5 0 0113 0"/><path d="M8.5 16.4a5 5 0 017 0"/><circle cx="12" cy="19.5" r="1.3" fill="currentColor" stroke="none"/>'),
    'bt': G('<path d="M7 8l10 8-5 4V4l5 4L7 16"/>'),
    'battery': G('<rect x="2.5" y="8" width="17" height="9" rx="2.5"/><path d="M22 11v3"/><rect x="4.5" y="10" width="10" height="5" rx="1" fill="currentColor" stroke="none"/>'),
    'moon': G('<path d="M20 13.5A8 8 0 1110.5 4 6.5 6.5 0 0020 13.5z"/>'),
    'cc': G('<rect x="3" y="5" width="18" height="6" rx="3"/><rect x="3" y="14" width="18" height="6" rx="3"/><circle cx="16.5" cy="8" r="1.8" fill="currentColor" stroke="none"/><circle cx="8" cy="17" r="1.8" fill="currentColor" stroke="none"/>'),
    'play': Gf('<path d="M8 5.5l11 6.5-11 6.5z"/>'),
    'pause': Gf('<rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/>'),
    'fwd': Gf('<path d="M4.5 5.5l7.5 6.5-7.5 6.5zM13 5.5l7.5 6.5L13 18.5z"/>'),
    'back': Gf('<path d="M19.5 5.5L12 12l7.5 6.5zM11 5.5L3.5 12 11 18.5z"/>'),
    'speaker': G('<path d="M4 9.5v5h3.5L13 19V5L7.5 9.5z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>'),
    'sun': G('<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19"/>'),
    'trash': G('<path d="M4 7h16M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10 11v6M14 11v6"/>'),
    'gear': G('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/>'),
    'airdrop': G('<circle cx="12" cy="16.5" r="1.6" fill="currentColor" stroke="none"/><path d="M7.5 13.5a6.4 6.4 0 019 0M4.5 10.3a11 11 0 0115 0M2 7a15.5 15.5 0 0120 0"/>'),
    'sidebar': G('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9.5 4v16"/>'),
    'share': G('<path d="M12 3v11m0-11L8 7m4-4l4 4"/><path d="M6 10v9a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0018 19v-9"/>'),
    'tag': G('<path d="M3 11V5a2 2 0 012-2h6l10 10-8 8z"/><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/>'),
    'pencil': G('<path d="M16.5 3.5l4 4L8 20l-5 1 1-5z"/>'),
    'phone': Gf('<path d="M6.6 3.2c.6-.2 1.3.1 1.6.6l1.8 3.1c.3.5.2 1.2-.2 1.6l-1.4 1.4a12.6 12.6 0 005.7 5.7l1.4-1.4c.4-.4 1.1-.5 1.6-.2l3.1 1.8c.5.3.8 1 .6 1.6l-.9 2.7c-.2.7-.9 1.1-1.6.9C10.4 19.7 4.3 13.6 2.9 5.7c-.2-.7.2-1.4.9-1.6z"/>'),
    'video': Gf('<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.5l5.5-3.5v10L16 13.5z"/>'),
    'bell': G('<path d="M6 9a6 6 0 0112 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 004 0"/>'),
    'display': G('<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 17v3.5"/>'),
    'lock': G('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/>'),
    'user': G('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0115 0"/>'),
    'globe': G('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3z"/>'),
    'update': G('<path d="M21 12a9 9 0 11-2.6-6.4M21 4v5h-5"/>'),
    'info': G('<circle cx="12" cy="12" r="9"/><path d="M12 10.5V17"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>'),
    'dots': Gf('<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>'),
    'flag': G('<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6"/>'),
    'mail': G('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>'),
    'bubble': G('<path d="M21 12a8 8 0 01-8 8c-1.1 0-2.2-.2-3.1-.6L4 21l1.7-4.6A8 8 0 1121 12z"/>'),
    'map-pin': G('<path d="M12 21s7-5.8 7-11a7 7 0 10-14 0c0 5.2 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    'music2': Gf('<path d="M9 18.5a3 3 0 11-2-2.83V6l12-2.6V15a3 3 0 11-2-2.83V7.2L9 9.2z"/>'),
    'tv': Gf('<rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M9.8 9.3l5.6 3.2-5.6 3.2z" fill="#000" opacity=".55"/>'),
    'calc': G('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01"/>'),
    'apps': Gf('<circle cx="6" cy="6" r="2.2"/><circle cx="12" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="6" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="18" cy="12" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="12" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/>'),
    'compose': G('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4.4 1.4L5 15z"/>'),
  };
  Mac.glyph = (name, cls) => `<span class="glyph ${cls || ''}">${Mac.GLYPH[name] || Mac.GLYPH.dots}</span>`;

  /* ---------------- app icons (48x48 squircle SVG) ---------------- */
  const I = {};
  I.finder = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-find" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc4f9"/><stop offset="1" stop-color="#1a8cf0"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-find)"/>
  <path d="M25.2 1.8C27 12 26.4 24 24.9 34.2 24.5 38.8 24.7 42.7 25.4 46.2 29.2 46.9 33 47 36.5 47 43 47 47 43 47 36.5V11.5C47 5 43 1 36.5 1 32.9 1 28.9 1.2 25.2 1.8Z" fill="#f2f9ff"/>
  <path d="M24.6.8V47.2" stroke="#0f6cc0" stroke-width="1" opacity=".35"/>
  <path d="M13 15.5v6.5M30 15.5v6.5" stroke="#143c5e" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M11 29.5C14.5 33 19 34.8 23.5 34.8s9.5-1.8 13-5.3" stroke="#143c5e" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>`;

  const now0 = new Date();
  I.calendar = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-cal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef0f3"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-cal)"/>
  <text x="24" y="14" text-anchor="middle" font-size="9.5" font-weight="600" fill="#f2493d" font-family="-apple-system,Helvetica,Arial">${['SUN','MON','TUE','WED','THU','FRI','SAT'][now0.getDay()]}</text>
  <text x="24" y="40" text-anchor="middle" font-size="26" font-weight="300" fill="#1d1d1f" font-family="-apple-system,Helvetica,Arial">${now0.getDate()}</text></svg>`;

  I.safari = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-saf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4e9ef"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="#1287f5"/>
  <circle cx="24" cy="24" r="18.5" fill="url(#g-saf)"/>
  <circle cx="24" cy="24" r="15.8" fill="none" stroke="#a9b6c4" stroke-width="2.6" stroke-dasharray="1.1 4.03"/>
  <g transform="rotate(48 24 24)"><path d="M24 7.5 27 24H21Z" fill="#f0435f"/><path d="M24 40.5 21 24h6Z" fill="#e2e8f0"/></g>
  <circle cx="24" cy="24" r="2.1" fill="#46505c"/></svg>`;

  I.mail = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-mail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#59b3f9"/><stop offset="1" stop-color="#1e7be8"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-mail)"/>
  <rect x="7.5" y="12" width="33" height="24" rx="2.6" fill="#ffffff"/>
  <path d="M8.8 14.3 24 26.2 39.2 14.3" fill="none" stroke="#c3d8ef" stroke-width="1.8"/>
  <path d="M9 34.5 19.5 24M39 34.5 28.5 24" stroke="#d8e6f5" stroke-width="1.4"/></svg>`;

  I.messages = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-msg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ef07c"/><stop offset="1" stop-color="#15c23c"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-msg)"/>
  <path d="M24 9.5c-8.8 0-15.5 5.4-15.5 12.6 0 7 6 12.4 13.8 12.6l1.9 5.5c.3.8 1.3.8 1.7.1l2.4-5.4c6.3-.9 11.2-6.1 11.2-12.8 0-7.2-6.7-12.6-15.5-12.6Z" fill="#fff"/>
  <circle cx="17.5" cy="22" r="2.1" fill="#2cc94f"/><circle cx="24" cy="22" r="2.1" fill="#2cc94f"/><circle cx="30.5" cy="22" r="2.1" fill="#2cc94f"/></svg>`;

  I.maps = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#a9dc9e"/>
  <path d="M0 29C8 25 15 26 21 31c6.4 5.4 14 5.6 27 2.6V48H0Z" fill="#8ecdf6"/>
  <path d="M7 0c0 10 5 17 13 22" stroke="#fff" stroke-width="4.2" fill="none"/>
  <path d="M0 13c10-1.5 20 1 27 7.5C33.5 26 40 28 48 28" stroke="#f7d273" stroke-width="3.4" fill="none"/>
  <path d="M24 6.5c-5.3 0-9 3.7-9 8.4 0 6.3 9 15.1 9 15.1s9-8.8 9-15.1c0-4.7-3.7-8.4-9-8.4Z" fill="#f23f43"/>
  <circle cx="24" cy="15" r="3.7" fill="#fff"/></svg>`;

  (function () {
    const cols = ['#f2504b', '#f8960f', '#f9d60c', '#7cd042', '#2fcfb9', '#2b8ef0', '#7965f2', '#e04fc4'];
    let petals = '';
    for (let i = 0; i < 8; i++) petals += `<ellipse cx="0" cy="-13.2" rx="6" ry="12.6" fill="${cols[i]}" opacity=".8" transform="rotate(${i * 45})"/>`;
    I.photos = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#f4f5f7"/><g transform="translate(24 24)">${petals}</g></svg>`;
  })();

  I.music = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-mus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb5c74"/><stop offset="1" stop-color="#e8203f"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-mus)"/>
  <text x="24" y="34" text-anchor="middle" font-size="27" fill="#fff" font-family="-apple-system,Helvetica,Arial">&#9834;</text></svg>`;

  I.podcasts = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-pod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c96bf7"/><stop offset="1" stop-color="#7d2ae8"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-pod)"/>
  <circle cx="24" cy="17" r="4.6" fill="#fff"/>
  <path d="M20.5 23.5C19 24 17 25.6 17 29c0 3.6 1 8 7 8s7-4.4 7-8c0-3.4-2-5-3.5-5.5" fill="#fff"/>
  <circle cx="24" cy="18.5" r="10" fill="none" stroke="#fff" stroke-width="2.6" stroke-dasharray="46 17" transform="rotate(90 24 18.5)"/>
  <circle cx="24" cy="18.5" r="15.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-dasharray="76 21.4" transform="rotate(90 24 18.5)"/></svg>`;

  I.tv = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-tv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2c31"/><stop offset="1" stop-color="#000000"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-tv)"/>
  <circle cx="24" cy="24" r="13.5" fill="none" stroke="#fff" stroke-width="2.4"/>
  <path d="M21 17.8 29.4 24 21 30.2Z" fill="#fff"/></svg>`;

  I.facetime = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-ft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63e07b"/><stop offset="1" stop-color="#1ec249"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-ft)"/>
  <rect x="7" y="14.5" width="22" height="19" rx="4.5" fill="#fff"/>
  <path d="M31 20.7 41 14.5v19L31 27.3Z" fill="#fff"/></svg>`;

  I.notes = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#ffffff"/>
  <path d="M0 11C0 4.9 4.9 0 11 0h26C43.1 0 48 4.9 48 11v3.5H0Z" fill="#f8d34c"/>
  <path d="M9 24.5h24M9 31.5h24M9 38.5h16" stroke="#c9cdd4" stroke-width="2.2" stroke-linecap="round"/></svg>`;

  I.reminders = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#ffffff"/>
  <circle cx="13.5" cy="15" r="4.4" fill="#f8960f"/><rect x="21.5" y="12.8" width="17" height="4.4" rx="2.2" fill="#d6ccd0"/>
  <circle cx="13.5" cy="27" r="4.4" fill="#31c94f"/><rect x="21.5" y="24.8" width="13" height="4.4" rx="2.2" fill="#d6ccd0"/>
  <circle cx="13.5" cy="39" r="4.4" fill="#168bf5"/><rect x="21.5" y="36.8" width="9" height="4.4" rx="2.2" fill="#d6ccd0"/></svg>`;

  I.contacts = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-con" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c1b9"/><stop offset="1" stop-color="#9d938a"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-con)"/>
  <path d="M38.5 0H48v13h-9.5Z" fill="#f2493d"/>
  <circle cx="21" cy="18" r="8" fill="#fff"/>
  <path d="M7 41c2-8.5 7-12.5 14-12.5S33 32.5 35 41Z" fill="#fff"/></svg>`;

  I.settings = (function () {
    let spokes = '';
    for (let i = 0; i < 8; i++) spokes += `<rect x="22.2" y="5.5" width="3.6" height="8.5" rx="1.8" fill="#8f959e" transform="rotate(${i * 45} 24 24)"/>`;
    return `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-set" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f1f4"/><stop offset="1" stop-color="#d3d6dc"/></linearGradient></defs>
    <rect width="48" height="48" rx="11" fill="url(#g-set)"/>
    ${spokes}<circle cx="24" cy="24" r="13" fill="#8f959e"/><circle cx="24" cy="24" r="8.5" fill="#f0f1f4"/><circle cx="24" cy="24" r="3.4" fill="#8f959e"/></svg>`;
  })();

  I.terminal = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-term" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3d45"/><stop offset="1" stop-color="#14171c"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-term)"/>
  <text x="10" y="30" font-size="19" fill="#6fe08a" font-family="Menlo,monospace" font-weight="600">&gt;_</text></svg>`;

  I.activity = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#17181c"/>
  <path d="M5 27h8.5l3.5-12 6.5 21 4-14.5 2.7 5.5H43" fill="none" stroke="#35e065" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  I.calculator = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#202024"/>
  <rect x="8.5" y="7.5" width="31" height="8" rx="3.4" fill="#d9d9de"/>
  <rect x="8.5" y="19.5" width="14.4" height="9" rx="3.4" fill="#939398"/><rect x="25.5" y="19.5" width="14.4" height="9" rx="3.4" fill="#939398"/>
  <rect x="8.5" y="32.5" width="14.4" height="9" rx="3.4" fill="#939398"/><rect x="25.5" y="32.5" width="14.4" height="9" rx="3.4" fill="#ff9f0a"/></svg>`;

  I.clock = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#141519"/>
  <circle cx="24" cy="24" r="16.5" fill="#fff"/>
  <circle cx="24" cy="11.5" r="1.1" fill="#111"/><circle cx="24" cy="36.5" r="1.1" fill="#111"/><circle cx="11.5" cy="24" r="1.1" fill="#111"/><circle cx="36.5" cy="24" r="1.1" fill="#111"/>
  <path d="M24 24V14.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M24 24l7 4" stroke="#111" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="1.8" fill="#ff9500"/></svg>`;

  I.weather = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-wx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c9fe8"/><stop offset="1" stop-color="#1565c8"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-wx)"/>
  <circle cx="19.5" cy="17" r="8" fill="#ffd34d"/>
  <path d="M15.5 37.5a7 7 0 01-1-14 9.3 9.3 0 0118.2 2 6 6 0 01-.5 12Z" fill="#fff"/></svg>`;

  I.textedit = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#fbfbfd"/>
  <rect x="9" y="11.5" width="20" height="27" rx="2" fill="#fff" stroke="#d6d9df" stroke-width="1.4"/>
  <path d="M13 17.5h12M13 22.5h12M13 27.5h7" stroke="#b9bec7" stroke-width="1.6" stroke-linecap="round"/>
  <g transform="rotate(38 31 26)"><rect x="27.5" y="14" width="7" height="19" rx="1.6" fill="#f9c54e"/><rect x="27.5" y="30.5" width="7" height="4.5" rx="1.4" fill="#f28ba6"/><path d="M27.5 14h7l-3.5-5.2Z" fill="#e8c39e"/><path d="M30.2 10.6 33 10.6 31.6 8.8Z" fill="#4b4b51"/></g></svg>`;

  I.preview = `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#eef1f5"/>
  <rect x="8" y="7" width="17" height="13" rx="1.6" fill="#8ecdf6"/><path d="M8 17.5l4.5-4 3.5 3 3-2.5 6 6v0H8Z" fill="#5fa24a"/>
  <circle cx="22" cy="21.5" r="11" fill="rgba(190,222,250,.55)" stroke="#5f96d8" stroke-width="3"/>
  <path d="M30 29.5 40 39.5" stroke="#5f96d8" stroke-width="4.4" stroke-linecap="round"/></svg>`;

  I.appstore = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-as" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25c2fb"/><stop offset="1" stop-color="#0e62e8"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="url(#g-as)"/>
  <path d="M17 38.5l5.8-24.5M31 38.5l-5.8-24.5" stroke="#fff" stroke-width="4.4" stroke-linecap="round" fill="none" transform="translate(0 -2)"/>
  <path d="M13.5 31.5h21" stroke="#fff" stroke-width="4.4" stroke-linecap="round" transform="translate(0 -1)"/>
  <path d="M26.5 15.5l2.6 4" stroke="#fff" stroke-width="4.4" stroke-linecap="round" transform="translate(1.5 -2)"/></svg>`;

  I.trash = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe4ea"/><stop offset="1" stop-color="#aeb6c0"/></linearGradient></defs>
  <path d="M24 9c0-2.8 2-3.4 2-5.5" stroke="#9aa3ae" fill="none" stroke-width="1.6"/>
  <rect x="8.5" y="9" width="31" height="4.8" rx="2.4" fill="#b9c1cb"/>
  <path d="M11 14.8h26l-2.2 25.6a4.4 4.4 0 01-4.4 4.1H17.6a4.4 4.4 0 01-4.4-4.1Z" fill="url(#g-tr)"/>
  <path d="M18 16.5l-1.2 26M24 16.5v26M30 16.5l1.2 26" stroke="#95a0ab" stroke-width="1.7" opacity=".8"/></svg>`;
  I.trashFull = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-tr2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe4ea"/><stop offset="1" stop-color="#aeb6c0"/></linearGradient></defs>
  <path d="M24 9c0-2.8 2-3.4 2-5.5" stroke="#9aa3ae" fill="none" stroke-width="1.6"/>
  <rect x="8.5" y="9" width="31" height="4.8" rx="2.4" fill="#b9c1cb"/>
  <path d="M11 14.8h26l-2.2 25.6a4.4 4.4 0 01-4.4 4.1H17.6a4.4 4.4 0 01-4.4-4.1Z" fill="url(#g-tr2)"/>
  <path d="M18 16.5l-1.2 26M24 16.5v26M30 16.5l1.2 26" stroke="#95a0ab" stroke-width="1.7" opacity=".8"/>
  <path d="M17 13c1-3.5 3-5 4.5-4.5C20.5 6.5 21 5 23 4.5c1-.3 2.4.3 3 1.5 1.5-1 3.5-.3 4 1.3 2-.3 3.5 1.3 3.3 3.2.9 1 .6 2.5-.3 3Z" fill="#eef2f6" stroke="#b9c1cb" stroke-width="1"/></svg>`;

  I.launchpad = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-lp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6e8ec"/><stop offset="1" stop-color="#9aa1ab"/></linearGradient></defs>
  <rect width="48" height="48" rx="11" fill="#2a2c31"/>
  <path d="M24 6.5c5.5 4 7.5 10.5 7.5 16.5H16.5C16.5 17 18.5 10.5 24 6.5Z" fill="url(#g-lp)"/>
  <circle cx="24" cy="16.5" r="2.6" fill="#4a4e56"/>
  <path d="M16.5 23 11 30.5l7 1.5M31.5 23l5.5 7.5-7 1.5" fill="#8f959e"/>
  <path d="M20 30.5c0 4.5-2 6.5-4 8.5 3.5-1 5-1.6 8-4.4 3 2.8 4.5 3.4 8 4.4-2-2-4-4-4-8.5Z" fill="#f2994a"/></svg>`;

  /* Finder file icons */
  I.folder = `<svg viewBox="0 0 48 48"><defs><linearGradient id="g-fold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ecdf9"/><stop offset="1" stop-color="#4ba3ec"/></linearGradient></defs>
  <path d="M4 12a4 4 0 014-4h10.5l4.5 5H44a0 0 0 010 0v3H4Z" fill="#5fb2f0"/>
  <path d="M4 16h40v21a4 4 0 01-4 4H8a4 4 0 01-4-4Z" fill="url(#g-fold)"/></svg>`;
  I.doc = `<svg viewBox="0 0 48 48"><path d="M9 3.5h19l10 10v27a4 4 0 01-4 4H9a4 4 0 01-4-4v-33a4 4 0 014-4Z" fill="#fdfdfe" stroke="#c6ccd4" stroke-width="1.3"/>
  <path d="M28 3.5l10 10h-9a1 1 0 01-1-1Z" fill="#dbe1e8"/>
  <path d="M12 21.5h24M12 27.5h24M12 33.5h15" stroke="#aeb6c2" stroke-width="1.7" stroke-linecap="round"/></svg>`;
  I.imgfile = `<svg viewBox="0 0 48 48"><path d="M9 3.5h19l10 10v27a4 4 0 01-4 4H9a4 4 0 01-4-4v-33a4 4 0 014-4Z" fill="#fdfdfe" stroke="#c6ccd4" stroke-width="1.3"/>
  <path d="M28 3.5l10 10h-9a1 1 0 01-1-1Z" fill="#dbe1e8"/>
  <rect x="11" y="18" width="26" height="19" rx="2" fill="#9ad2f7"/><path d="M11 33.5l7-6.5 5 4.5 5.5-5 8.5 8v2.5H11Z" fill="#69b34c"/><circle cx="17.5" cy="23.5" r="2.4" fill="#ffd34d"/></svg>`;
  I.musicfile = `<svg viewBox="0 0 48 48"><path d="M9 3.5h19l10 10v27a4 4 0 01-4 4H9a4 4 0 01-4-4v-33a4 4 0 014-4Z" fill="#fdfdfe" stroke="#c6ccd4" stroke-width="1.3"/>
  <path d="M28 3.5l10 10h-9a1 1 0 01-1-1Z" fill="#dbe1e8"/>
  <text x="24" y="35" text-anchor="middle" font-size="19" fill="#e8203f" font-family="-apple-system,Helvetica">&#9834;</text></svg>`;
  I.appfile = `<svg viewBox="0 0 48 48"><rect x="5" y="5" width="38" height="38" rx="9.5" fill="#d7dbe2"/></svg>`;

  Mac.ICONS = I;
  Mac.appIcon = (name, px) => {
    const svg = I[name] || I.appfile;
    return `<div class="appicon"${px ? ` style="width:${px}px;height:${px}px"` : ''}>${svg}</div>`;
  };
  Mac.fileIcon = (node) => {
    if (node.type === 'folder') return I.folder;
    if (node.kind === 'app') return I[node.appId] || I.appfile;
    if (node.kind === 'photo') return null; // caller should render <img>
    if (node.kind === 'audio') return I.musicfile;
    if (node.kind === 'image') return I.imgfile;
    return I.doc;
  };

  /* avatars */
  const AVCOLS = ['linear-gradient(135deg,#ff9f5c,#f7681c)', 'linear-gradient(135deg,#5ed1ff,#1268e0)', 'linear-gradient(135deg,#8df08d,#1da84a)', 'linear-gradient(135deg,#c98df7,#6f2de0)', 'linear-gradient(135deg,#f78bd0,#d6257f)', 'linear-gradient(135deg,#ffd35c,#e8a40c)', 'linear-gradient(135deg,#6de8dd,#0e8f96)', 'linear-gradient(135deg,#a3b3c7,#4c5e78)'];
  Mac.avatarColor = name => AVCOLS[Mac.hash(name || '?') % AVCOLS.length];
  Mac.avatar = (name, px) => {
    const initials = String(name || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `<div style="width:${px}px;height:${px}px;border-radius:50%;background:${Mac.avatarColor(name)};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(px * 0.4)}px;flex:none">${initials}</div>`;
  };

  /* ---------------- generated photo art (deterministic) ---------------- */
  const photoCache = {};
  Mac.genPhoto = (seed, W, H) => {
    W = W || 640; H = H || 480;
    const key = seed + '|' + W + 'x' + H;
    if (photoCache[key]) return photoCache[key];
    const r = Mac.rng(seed);
    const skies = [['#79b8f0', '#dff0fb'], ['#f5a86e', '#fde6c8'], ['#35428c', '#9db1e8'], ['#8adcf5', '#f8fdf4'], ['#f77fa1', '#ffe3ec'], ['#2c3e70', '#e88f5a']];
    const lands = [['#3d7a4a', '#2a5a38', '#1d4430'], ['#7a5a3d', '#5a442d', '#443322'], ['#4a5a8a', '#374368', '#2a3250'], ['#5a8a7a', '#43685a', '#334f44']];
    const sky = skies[(r() * skies.length) | 0], land = lands[(r() * lands.length) | 0];
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // sun/moon
    const sx = 60 + r() * (W - 120), sy = 40 + r() * H * 0.3, sr = 18 + r() * 26;
    const sg = c.createRadialGradient(sx, sy, 0, sx, sy, sr * 2.6);
    sg.addColorStop(0, 'rgba(255,244,214,.95)'); sg.addColorStop(0.35, 'rgba(255,222,150,.55)'); sg.addColorStop(1, 'rgba(255,222,150,0)');
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    c.fillStyle = '#fff3d0'; c.beginPath(); c.arc(sx, sy, sr * 0.72, 0, 7); c.fill();
    // clouds
    c.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 3 + r() * 3; i++) {
      const cx = r() * W, cy = 25 + r() * H * 0.22, cw = 36 + r() * 70;
      c.beginPath(); c.ellipse(cx, cy, cw, cw * 0.32, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(cx - cw * 0.35, cy + 6, cw * 0.5, cw * 0.2, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(cx + cw * 0.4, cy + 7, cw * 0.45, cw * 0.18, 0, 0, 7); c.fill();
    }
    // mountain layers
    for (let L = 0; L < 3; L++) {
      const base = H * (0.5 + L * 0.14), amp = H * (0.26 - L * 0.06);
      c.fillStyle = land[L];
      c.beginPath(); c.moveTo(0, H);
      let x = 0, y = base - r() * amp;
      c.lineTo(0, y);
      while (x < W) { x += W / (5 + r() * 4); y = base - r() * amp; c.lineTo(Math.min(x, W), y); }
      c.lineTo(W, H); c.closePath(); c.fill();
    }
    // foreground: trees or buildings
    const n = 6 + (r() * 8) | 0;
    for (let i = 0; i < n; i++) {
      const tx = r() * W, th = 26 + r() * 60, ty = H * 0.74 + r() * H * 0.2;
      c.fillStyle = 'rgba(20,40,30,' + (0.5 + r() * 0.4) + ')';
      if (r() > 0.35) { // tree
        c.fillRect(tx - 2.4, ty - th * 0.35, 4.8, th * 0.4);
        c.beginPath(); c.moveTo(tx, ty - th); c.lineTo(tx - th * 0.26, ty - th * 0.3); c.lineTo(tx + th * 0.26, ty - th * 0.3); c.closePath(); c.fill();
      } else { // building
        const bw = 14 + r() * 26;
        c.fillStyle = 'rgba(40,44,58,.75)'; c.fillRect(tx, ty - th, bw, th);
        c.fillStyle = 'rgba(255,230,140,.85)';
        for (let wy = ty - th + 5; wy < ty - 6; wy += 9) for (let wx = tx + 4; wx < tx + bw - 4; wx += 8) if (r() > 0.5) c.fillRect(wx, wy, 3.4, 4.4);
      }
    }
    // birds
    c.strokeStyle = 'rgba(30,30,40,.6)'; c.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      if (r() > 0.6) continue;
      const bx = r() * W, by = 30 + r() * H * 0.3, bs = 5 + r() * 6;
      c.beginPath(); c.moveTo(bx - bs, by); c.quadraticCurveTo(bx, by - bs * 0.9, bx, by); c.quadraticCurveTo(bx, by - bs * 0.9, bx + bs, by); c.stroke();
    }
    const url = cv.toDataURL('image/jpeg', 0.86);
    photoCache[key] = url;
    return url;
  };

  /* album art: SVG string */
  Mac.albumArt = (seed, label) => {
    const r = Mac.rng(seed);
    const palettes = [['#f8364f', '#7b1fd6'], ['#1f9df8', '#123bd6'], ['#f8a41f', '#d63a1f'], ['#1fd6a0', '#0c7bd6'], ['#d61fb0', '#4a1fd6'], ['#5ad61f', '#1f8ad6'], ['#26262e', '#55555f']];
    const p = palettes[(r() * palettes.length) | 0];
    const ang = (r() * 360) | 0;
    const ch = (label || '?').trim().charAt(0).toUpperCase();
    return `<svg viewBox="0 0 100 100"><defs><linearGradient id="aa-${Mac.hash(seed)}" gradientTransform="rotate(${ang})"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs><rect width="100" height="100" fill="url(#aa-${Mac.hash(seed)})"/><circle cx="${20 + r() * 60}" cy="${20 + r() * 60}" r="${18 + r() * 26}" fill="rgba(255,255,255,.14)"/><text x="50" y="66" text-anchor="middle" font-size="44" font-weight="700" fill="rgba(255,255,255,.92)" font-family="-apple-system,Helvetica,Arial">${Mac.esc(ch)}</text></svg>`;
  };
})();
