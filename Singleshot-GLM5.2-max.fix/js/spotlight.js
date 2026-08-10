// Spotlight search — apps + files + quick actions.
import { bus } from './store.js';
import { glyph } from './icons.js';
import { APPS, launchApp } from './appregistry.js';
import { list } from './vfs.js';

const sp = () => document.getElementById('spotlight');
let open = false;
let results = [];
let selIdx = 0;

export function initSpotlight() {
  bus.on('spotlight:open', openSpotlight);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') { e.preventDefault(); open ? closeSpotlight() : openSpotlight(); }
    if (e.key === 'Escape' && open) closeSpotlight();
  });
  document.addEventListener('click', (e) => {
    if (open && !e.target.closest('#spotlight') && !e.target.closest('[data-cc="search"]')) closeSpotlight();
  });
}

function openSpotlight() {
  open = true;
  results = [];
  selIdx = 0;
  render('');
  sp().classList.remove('hidden');
  setTimeout(() => sp().querySelector('input').focus(), 20);
}

function closeSpotlight() {
  open = false;
  sp().classList.add('hidden');
}

function search(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  // Apps
  APPS.forEach(a => {
    if (a.name.toLowerCase().includes(q) || a.id.includes(q)) out.push({ type:'app', title:a.name, sub:'Application', icon:a.icon, run:() => launchApp(a.id) });
  });
  // Calculator-style math
  if (/^[\d\s+\-*/().%]+$/.test(q) && /[+\-*/]/.test(q) && /\d/.test(q)) {
    try { const v = Function('"use strict";return (' + q + ')')(); out.push({ type:'calc', title: String(v), sub:'=' + q, icon:'<svg viewBox="0 0 48 48" width="30" height="30"><rect width="48" height="48" rx="9" fill="#0a84ff"/><text x="24" y="32" text-anchor="middle" fill="#fff" font-size="22" font-weight="600">=</text></svg>', run:()=>{} }); } catch {}
  }
  // Files
  function walk(path) {
    for (const node of list(path)) {
      const full = path + '/' + node.name;
      if (node.name.toLowerCase().includes(q)) {
        out.push({ type:'file', title: node.name, sub: full, icon: fileIcon(node), run: () => { launchApp('finder'); } });
      }
      if (node.type === 'dir') walk(full);
    }
  }
  try { walk(''); } catch {}
  return out.slice(0, 12);
}

function fileIcon(node) {
  if (node.type === 'dir') return glyph('folder',30);
  const ext = node.name.split('.').pop().toLowerCase();
  if (['png','jpg','jpeg','gif','webp','heic'].includes(ext)) return glyph('image',30);
  return glyph('doc',30);
}

function render(q) {
  results = q ? search(q) : [];
  selIdx = 0;
  const el = sp();
  let resHtml = '';
  if (results.length) {
    const apps = results.filter(r => r.type==='app');
    const files = results.filter(r => r.type==='file');
    const calc = results.filter(r => r.type==='calc');
    let sections = '';
    if (calc.length) sections += `<div class="spot-section-h">Calculator</div>` + calc.map((r)=>resultRow(r, indexOf(r))).join('');
    if (apps.length) sections += `<div class="spot-section-h">Applications</div>` + apps.map((r)=>resultRow(r, indexOf(r))).join('');
    if (files.length) sections += `<div class="spot-section-h">Files</div>` + files.slice(0,6).map((r)=>resultRow(r, indexOf(r))).join('');
    resHtml = `<div class="spot-results scroll">${sections}</div>`;
  } else if (q) {
    resHtml = `<div class="spot-results"><div style="padding:16px;opacity:.5;text-align:center;font-size:13px">No results for “${q}”</div></div>`;
  }
  el.innerHTML = `<div class="spot-box">
    <div class="spot-input">${glyph('search',22)}<input type="text" placeholder="Spotlight Search" value="${q.replace(/"/g,'&quot;')}" /></div>
    ${resHtml}
  </div>`;
  el.querySelector('input').addEventListener('input', (e) => render(e.target.value));
  el.querySelector('input').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(results.length-1, selIdx+1); paintSel(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = Math.max(0, selIdx-1); paintSel(); }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[selIdx]; if (r) { r.run(); closeSpotlight(); } }
  });
  el.querySelectorAll('.spot-result').forEach(row => {
    row.addEventListener('click', () => { const i = +row.dataset.idx; const r = results[i]; if (r) { r.run(); closeSpotlight(); } });
    row.addEventListener('mouseenter', () => { selIdx = +row.dataset.idx; paintSel(); });
  });
}

function indexOf(r) { return results.indexOf(r); }

function resultRow(r, i) {
  return `<div class="spot-result ${i===selIdx?'sel':''}" data-idx="${i}">
    <div class="sr-icon">${r.icon}</div>
    <div class="sr-meta"><div class="sr-title">${r.title}</div><div class="sr-sub">${r.sub}</div></div>
  </div>`;
}

function paintSel() {
  sp().querySelectorAll('.spot-result').forEach(row => {
    row.classList.toggle('sel', +row.dataset.idx === selIdx);
  });
}
