/* =====================================================================
   Tahoe Web — SVG app icons + toolbar glyphs
   ===================================================================== */
'use strict';

function squircle(id, c1, c2){
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#${id})"/>`;
}
const INSET = `<rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/><path d="M10 10 Q32 4 54 10" stroke="rgba(255,255,255,.25)" fill="none" stroke-width="1.4"/>`;

const ICON_DEFS = {
  finder: () => `<svg viewBox="0 0 64 64">${squircle('gF','#6cc2ff','#0f6bd6')}
    <path d="M32 4h18c5.5 0 10 4.5 10 10v36c0 5.5-4.5 10-10 10H32z" fill="#0a55b8" opacity=".85"/>
    <path d="M22 24v8M42 24v8" stroke="#083a75" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M16 40 Q24 48 32 45 Q40 48 48 40" stroke="#083a75" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M32 4v56" stroke="#083a75" stroke-width="1.6" opacity=".5"/>${INSET}</svg>`,

  launchpad: () => `<svg viewBox="0 0 64 64">${squircle('gL','#f2f2f7','#b8b8c0')}
    <g transform="rotate(-38 32 32)"><path d="M32 10c4 5 6 10 6 16l-6 4-6-4c0-6 2-11 6-16z" fill="#ff5f57"/>
    <rect x="26" y="26" width="12" height="18" rx="5" fill="#ffffff"/>
    <path d="M26 34l-8 8 8-2zM38 34l8 8-8-2z" fill="#8e8e93"/>
    <path d="M32 44c-1.5 5-2.6 8-4 10 2.4-1.2 5.6-1.2 8 0-1.4-2-2.5-5-4-10z" fill="#ff9f0a"/></g>${INSET}</svg>`,

  safari: () => `<svg viewBox="0 0 64 64">${squircle('gS','#f7f7fa','#d9d9e0')}
    <circle cx="32" cy="32" r="21" fill="#fff" stroke="#c7c7cf"/>
    <circle cx="32" cy="32" r="21" fill="none" stroke="#1e83f7" stroke-width="1.4" stroke-dasharray="1.6 4.4"/>
    <g transform="rotate(-45 32 32)"><path d="M32 14l5 18h-10z" fill="#ff3b30"/><path d="M32 50l5-18h-10z" fill="#e9e9ee"/></g>${INSET}</svg>`,

  mail: () => `<svg viewBox="0 0 64 64">${squircle('gM','#35a8ff','#0459d8')}
    <rect x="12" y="18" width="40" height="28" rx="4" fill="#fff"/>
    <path d="M12 20l20 15 20-15" stroke="#d3d3da" stroke-width="2.4" fill="none"/>
    <path d="M12 44l13-12M52 44L39 32" stroke="#e4e4ea" stroke-width="1.8"/>${INSET}</svg>`,

  messages: () => `<svg viewBox="0 0 64 64"><defs><linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ef071"/><stop offset="1" stop-color="#0fc42b"/></linearGradient></defs>
    <path d="M32 8c13 0 24 8.6 24 19.5S45 47 32 47c-2 0-4-.2-5.8-.7L14 50l2.6-9C11 37.8 8 33 8 27.5 8 16.6 19 8 32 8z" fill="url(#gG)"/>
    <circle cx="22" cy="27.5" r="3.1" fill="#fff"/><circle cx="32" cy="27.5" r="3.1" fill="#fff"/><circle cx="42" cy="27.5" r="3.1" fill="#fff"/>${INSET}</svg>`,

  facetime: () => `<svg viewBox="0 0 64 64"><defs><linearGradient id="gFT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ff07e"/><stop offset="1" stop-color="#12c43a"/></linearGradient></defs>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#gFT)"/>
    <rect x="12" y="20" width="26" height="24" rx="6" fill="#fff"/>
    <path d="M38 29l12-7v20l-12-7z" fill="#fff"/>${INSET}</svg>`,

  maps: () => `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="14" fill="#b9e986"/>
    <path d="M4 20c10-6 22 8 32 2 8-5 12-14 24-12v-6H4z" fill="#8fd479"/>
    <path d="M4 34h60v26H4z" fill="#9adcf2"/>
    <path d="M4 34c8 3 14-4 22-1 9 3.6 20 8 24 1" stroke="#fff" stroke-width="4.5" fill="none"/>
    <path d="M18 12 L40 52" stroke="#ffd60a" stroke-width="4" fill="none"/>
    <path d="M40 8c-5 0-9 4-9 9 0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9z" fill="#ff375f"/><circle cx="40" cy="17" r="3.4" fill="#fff"/>${INSET}</svg>`,

  photos: () => `<svg viewBox="0 0 64 64">${squircle('gP','#ffffff','#e8e8ee')}
    <g transform="translate(32 32)"><g id="petals">${[0,45,90,135,180,225,270,315].map((a,i)=>`<ellipse cx="0" cy="-12" rx="5.4" ry="11" fill="${['#ff3b30','#ff9f0a','#ffd60a','#32d74b','#64d2ff','#0a84ff','#bf5af2','#ff375f'][i]}" opacity=".85" transform="rotate(${a})"/>`).join('')}</g></g>${INSET}</svg>`,

  calendar: () => { const d=new Date(); return `<svg viewBox="0 0 64 64">${squircle('gC','#ffffff','#ececf2')}
    <text x="32" y="19" text-anchor="middle" font-family="-apple-system,Helvetica" font-size="10" font-weight="700" fill="#ff3b30">${DAYS_S[d.getDay()].toUpperCase()}</text>
    <text x="32" y="47" text-anchor="middle" font-family="-apple-system,Helvetica" font-size="29" font-weight="300" fill="#1d1d1f">${d.getDate()}</text>${INSET}</svg>`; },

  notes: () => `<svg viewBox="0 0 64 64">${squircle('gN','#ffffff','#ececf0')}
    <path d="M4 16c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12H4z" fill="#ffd60a"/>
    <path d="M14 28h36M14 37h36M14 46h24" stroke="#c7c7cf" stroke-width="3" stroke-linecap="round"/>${INSET}</svg>`,

  reminders: () => `<svg viewBox="0 0 64 64">${squircle('gR','#ffffff','#ececf0')}
    ${['#ff9f0a','#0a84ff','#32d74b'].map((c,i)=>`<circle cx="19" cy="${23+i*10}" r="4.4" fill="${c}"/><rect x="27" y="${20.5+i*10}" width="22" height="5" rx="2.5" fill="#d4d4da"/>`).join('')}${INSET}</svg>`,

  music: () => `<svg viewBox="0 0 64 64">${squircle('gMU','#ffffff','#eeecf2')}
    <g transform="translate(0 2)"><path d="M25 48.5c0 4-3.4 7-8 7s-8-2.6-8-6.5 3.4-7 8-7c1.4 0 2.7.3 3.8.9L25 21l21-5v26.5c0 4-3.4 7-8 7s-8-2.6-8-6.5 3.4-7 8-7c1.4 0 2.7.3 3.8.9V22.6L29 26.4z" fill="url(#gMus)"/></g>
    <defs><linearGradient id="gMus" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fc5c7d"/><stop offset="1" stop-color="#e01b4c"/></linearGradient></defs>${INSET}</svg>`,

  appstore: () => `<svg viewBox="0 0 64 64">${squircle('gAS','#2fb8ff','#0a5cff')}
    <g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M20 44 L32 18 L44 44" fill="none"/><path d="M24 36h21"/></g>${INSET}</svg>`,

  terminal: () => `<svg viewBox="0 0 64 64">${squircle('gT','#4a4a52','#0b0b0f')}
    <path d="M14 18l12 10-12 10" stroke="#32d74b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="30" y="36" width="16" height="4.4" rx="2" fill="#32d74b"/>${INSET}</svg>`,

  settings: () => `<svg viewBox="0 0 64 64">${squircle('gST','#e8e8ee','#b0b0ba')}
    <g transform="translate(32 32)">${[0,45,90,135,180,225,270,315].map(a=>`<rect x="-3.4" y="-21" width="6.8" height="9" rx="3" fill="#5e5e66" transform="rotate(${a})"/>`).join('')}
    <circle r="15" fill="#5e5e66"/><circle r="6" fill="#c9c9d1"/></g>${INSET}</svg>`,

  calculator: () => `<svg viewBox="0 0 64 64">${squircle('gCA','#3a3a40','#17171b')}
    <rect x="14" y="8" width="36" height="9" rx="2.5" fill="#57575f"/>
    <g fill="#57575f"><rect x="14" y="21" width="9" height="9" rx="4.5"/><rect x="27" y="21" width="9" height="9" rx="4.5"/><rect x="40" y="21" width="9" height="9" rx="4.5"/>
    <rect x="14" y="34" width="9" height="9" rx="4.5"/><rect x="27" y="34" width="9" height="9" rx="4.5"/><rect x="40" y="34" width="9" height="9" rx="4.5"/>
    <rect x="14" y="47" width="9" height="9" rx="4.5"/><rect x="27" y="47" width="9" height="9" rx="4.5"/></g>
    <rect x="40" y="47" width="9" height="9" rx="4.5" fill="#ff9f0a"/>${INSET}</svg>`,

  clock: () => `<svg viewBox="0 0 64 64">${squircle('gCK','#232327','#050507')}
    <circle cx="32" cy="32" r="20" fill="#f5f5f7"/>
    <path d="M32 20v12l8 5" stroke="#1d1d1f" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="32" cy="32" r="2" fill="#ff9f0a"/>${INSET}</svg>`,

  weather: () => `<svg viewBox="0 0 64 64">${squircle('gW','#4aa3f0','#1a5fc0')}
    <circle cx="25" cy="24" r="9" fill="#ffd60a"/>
    <path d="M22 44h24a8 8 0 0 0 0-16 12 12 0 0 0-23-2 8.5 8.5 0 0 0-1 18z" fill="#fff" opacity=".96"/>${INSET}</svg>`,

  contacts: () => `<svg viewBox="0 0 64 64">${squircle('gCO','#e6d5b8','#bfae8f')}
    <rect x="10" y="10" width="44" height="44" rx="6" fill="#fdf6ea"/>
    <rect x="10" y="10" width="8" height="44" rx="4" fill="#a08b66"/>
    <circle cx="36" cy="26" r="7" fill="#a08b66"/><path d="M24 46c0-7 5.4-11 12-11s12 4 12 11z" fill="#a08b66"/>${INSET}</svg>`,

  textedit: () => `<svg viewBox="0 0 64 64">${squircle('gTE','#ffffff','#e6e6ec')}
    <path d="M15 20h26M15 27h26M15 34h18" stroke="#48484e" stroke-width="3" stroke-linecap="round"/>
    <g transform="rotate(40 46 40)"><rect x="42" y="22" width="7" height="24" rx="2" fill="#ffd60a"/><path d="M42 46h7l-3.5 7z" fill="#f4c290"/><path d="M44 50h1l-.5 1z" fill="#3a3a3e"/><rect x="42" y="22" width="7" height="5" rx="2" fill="#ff9f0a"/></g>${INSET}</svg>`,

  preview: () => `<svg viewBox="0 0 64 64">${squircle('gPR','#f4f4f8','#dcdce4')}
    <rect x="12" y="14" width="26" height="20" rx="3" fill="url(#gPV)"/><circle cx="19" cy="20" r="2.6" fill="#ffdf8e"/>
    <path d="M12 30l7-7 6 6 5-5 8 8v2H12z" fill="#4a9e5c"/>
    <circle cx="38" cy="36" r="9" fill="rgba(255,255,255,.4)" stroke="#0a84ff" stroke-width="4"/>
    <path d="M45.5 43.5L53 51" stroke="#0a84ff" stroke-width="4.5" stroke-linecap="round"/>
    <defs><linearGradient id="gPV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aee2ff"/><stop offset="1" stop-color="#5f97d8"/></linearGradient></defs>${INSET}</svg>`,

  appstore_legacy: () => '',
  tips: () => `<svg viewBox="0 0 64 64">${squircle('gQ','#ffd60a','#ff9f0a')}<text x="32" y="43" text-anchor="middle" font-family="-apple-system,Helvetica" font-size="30" font-weight="700" fill="#fff">?</text>${INSET}</svg>`,
};

function ICON(id, size=64){
  const fn = ICON_DEFS[id] || ICON_DEFS.tips;
  const svg = fn();
  if (size >= 64 || !size) return svg;
  return svg;
}

/* ---- file-type glyphs (finder, desktop) ---- */
function folderSVG(size){ return `<svg viewBox="0 0 64 64" style="width:${size}px;height:${size}px"><rect x="6" y="16" width="52" height="36" rx="7" fill="#35a8ff"/><path d="M6 22v24a7 7 0 0 0 7 7h38a7 7 0 0 0 7-7V26H30l-5-6H13a7 7 0 0 0-7 2z" fill="#5ec2ff"/><path d="M6 22v24a7 7 0 0 0 7 7h38a7 7 0 0 0 7-7V26H30l-5-6H13a7 7 0 0 0-7 2z" fill="#fff" opacity=".15"/></svg>`; }
function docSVG(inner, size){
  return `<svg viewBox="0 0 64 64" style="width:${size}px;height:${size}px"><path d="M14 4h24l12 12v42a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="#fbfbfd" stroke="#c9c9d1"/>
  <path d="M38 4v12h12" fill="#e3e3e8" stroke="#c9c9d1"/>${inner}</svg>`;
}
function FICON(name, node, size=56){
  if (node.type === 'folder') return folderSVG(size);
  switch (node.kind){
    case 'app': return ICON(node.appId, size);
    case 'img': return `<img src="${svgArt(node.img, 160, 160)}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:6px;background:#888">`;
    case 'pdf': return docSVG(`<rect x="14" y="34" width="36" height="13" rx="2.5" fill="#ff3b30"/><text x="32" y="43.5" text-anchor="middle" font-family="-apple-system,Helvetica" font-size="9" font-weight="800" fill="#fff">PDF</text><path d="M19 24h26M19 29h20" stroke="#c9c9d1" stroke-width="2.6" stroke-linecap="round"/>`, size);
    case 'md': return docSVG(`<path d="M16 42V30l6 7 6-7v12M36 30v12M33 36h6" stroke="#5e5e66" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 20h26" stroke="#c9c9d1" stroke-width="2.6" stroke-linecap="round"/>`, size);
    case 'zip': return docSVG(`<g fill="#8e8e93"><rect x="29" y="20" width="6" height="4" rx="1"/><rect x="31" y="17" width="2" height="3"/><rect x="30" y="26" width="4" height="3.4" rx=".8"/><rect x="31" y="31" width="2" height="3.4"/><rect x="30" y="36" width="4" height="3.4" rx=".8"/><rect x="29" y="41" width="6" height="5" rx="2"/></g>`, size);
    case 'audio': return docSVG(`<path d="M28 42.2c0 2.4-2 4-4.6 4s-4.6-1.5-4.6-3.7 2-4 4.6-4c.8 0 1.6.2 2.2.5V26l12-3v15.2c0 2.4-2 4-4.6 4s-4.6-1.5-4.6-3.7 2-4 4.6-4c.8 0 1.6.2 2.2.5v-9.4l-9.2 2.3z" fill="#fc5c7d"/>`, size);
    default: return docSVG(`<path d="M19 24h26M19 31h26M19 38h18" stroke="#5e5e66" stroke-width="2.6" stroke-linecap="round"/>`, size);
  }
}
function trashSVG(full=false){
  return `<svg viewBox="0 0 64 64"><defs><linearGradient id="gTR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f2f6"/><stop offset="1" stop-color="#bfc2c9"/></linearGradient></defs>
  <path d="M14 20h36l-4 36a5 5 0 0 1-5 4H23a5 5 0 0 1-5-4z" fill="url(#gTR)"/>
  <path d="M14 20h36l-4 36a5 5 0 0 1-5 4H23a5 5 0 0 1-5-4z" fill="none" stroke="rgba(0,0,0,.12)"/>
  ${[20,26,32,38,44].map(x=>`<path d="M${x} 24l-1.5 32" stroke="rgba(0,0,0,.14)" stroke-width="1.6"/>`).join('')}
  <rect x="11" y="15" width="42" height="6" rx="3" fill="#e6e7eb" stroke="rgba(0,0,0,.12)"/>
  ${full?`<path d="M18 15l4-8h6l2 6M30 15l3-9h7l4 9" stroke="#8f939c" stroke-width="3" fill="none" stroke-linecap="round"/>`:''}
  </svg>`;
}
function hdSVG(){ return `<svg viewBox="0 0 64 64"><defs><linearGradient id="gHD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5f5f8"/><stop offset="1" stop-color="#c3c6cd"/></linearGradient></defs>
<rect x="4" y="22" width="56" height="20" rx="5" fill="url(#gHD)" stroke="rgba(0,0,0,.15)"/><rect x="10" y="18" width="44" height="6" rx="2.5" fill="#dcdfe4" stroke="rgba(0,0,0,.12)"/>
<circle cx="52" cy="32" r="2.4" fill="#32d74b"/><rect x="10" y="30" width="22" height="4" rx="2" fill="#a7abb4"/></svg>`; }
function appleSVG(color='#fff'){ return `<svg viewBox="0 0 384 512" fill="${color}"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`; }

/* ---- small toolbar/menu glyphs (16x16, currentColor) ---- */
const G_PATHS = {
  chevL:'M10.5 3.5L5 9l5.5 5.5', chevR:'M5.5 3.5L11 9l-5.5 5.5', chevD:'M3.5 6L8 10.5 12.5 6', chevU:'M3.5 10L8 5.5 12.5 10',
  plus:'M8 3v10M3 8h10', search:'M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM11 11l4 4',
  x:'M4 4l10 10M14 4L4 14', flag:'M4 14V3c3-1.5 6 1.5 9 0v7c-3 1.5-6-1.5-9 0',
  trash:'M3.5 5h11M6.5 5V3.5h5V5M5 5l.7 9h6.6L13 5', share:'M8 10V1.5M5 4l3-2.5L11 4M4 7.5H2.5v7h11v-7H12',
  compose:'M12.5 2.5a1.8 1.8 0 0 1 2.5 2.5L6.5 13.5l-3.6 1 1.1-3.5z', reply:'M6.5 4L2.5 8l4 4M2.5 8h8a3 3 0 0 1 3 3v1.5',
  replyAll:'M5 4L1.5 7.5 5 11M8.5 4L5 7.5l3.5 3.5M5 7.5h6.5a3 3 0 0 1 3 3V12', forward:'M9.5 4l4 4-4 4M13.5 8h-8a3 3 0 0 0-3 3v1.5',
  sidebar:'M2 3h12v10H2zM6 3v10', grid:'M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z',
  list:'M5 4h8.5M5 8h8.5M5 12h8.5M2.5 4h.01M2.5 8h.01M2.5 12h.01', cols:'M2 3h3.6v10H2zM6.2 3h3.6v10H6.2zM10.4 3H14v10h-3.6z',
  info:'M8 5.2h.01M8 7.5V11M8 13.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z',
  eye:'M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  play:'M5 3.5l8 4.5-8 4.5z', pause:'M5.5 3.5H7v9H5.5zM9 3.5h1.5v9H9z',
  next:'M3.5 3.5L10 8l-6.5 4.5zM11 3.5h1.5v9H11z', prev:'M12.5 3.5L6 8l6.5 4.5zM3.5 3.5H5v9H3.5z',
  heart:'M8 13.5S2.5 10 2.5 6.3A3.1 3.1 0 0 1 8 4.6a3.1 3.1 0 0 1 5.5 1.7C13.5 10 8 13.5 8 13.5z',
  phone:'M3 2.5h3l1.5 4-2 1.5a10 10 0 0 0 4.5 4.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.7 1.5A13.5 13.5 0 0 1 1.5 4.2 1.5 1.5 0 0 1 3 2.5z',
  video:'M2 4.5h8v7H2zM10 7l4-2.2v6.4L10 9', mic:'M8 2a2 2 0 0 1 2 2v4a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2zM4.5 8a3.5 3.5 0 0 0 7 0M8 11.5V14M5.5 14h5',
  cam:'M2.5 5h2l1.2-1.5h4.6L11.5 5H13v7H2.5zM8 10.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z',
  wifi:'M2 6.5a9 9 0 0 1 12 0M4.5 9.5a5.5 5.5 0 0 1 7 0M7 12a2 2 0 0 1 2 0M8 13.5h.01',
  bt:'M5 3.5l6 4.5-3.5 3L11 14.5 5 19V3.5zM5 7.5l3.5 3L5 13.5',
  airdrop:'M8 8m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0M4.5 5a4.5 4.5 0 0 1 7 0M2.5 2.5a8 8 0 0 1 11 0M11.5 5l2 6.5h-11L4.5 5',
  moon:'M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z', sun:'M8 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.6 3.6l1 1M11.4 11.4l1 1M12.4 3.6l-1 1M4.6 11.4l-1 1',
  download:'M8 2v8M4.5 7L8 10.5 11.5 7M2.5 12.5h11', rotate:'M13 8A5 5 0 1 1 8 3M5 3h3v3',
  zin:'M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM11 11l4 4M4.5 7h5M7 4.5v5',
  zout:'M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM11 11l4 4M4.5 7h5',
  folderPlus:'M2 5.5A1.5 1.5 0 0 1 3.5 4h3l1.5 2h5A1.5 1.5 0 0 1 15 7.5v4A1.5 1.5 0 0 1 13.5 13h-10A1.5 1.5 0 0 1 2 11.5zM8.5 7.5v3.5M6.75 9.25h3.5',
  globe:'M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM2 8h12M8 2c2 1.8 2 10.2 0 12M8 2c-2 1.8-2 10.2 0 12',
  siri:'M8 14a6 6 0 0 0 4.24-10.24M8 14a6 6 0 0 1 0-12M8 14a9.5 3.5 0 0 0 0-7M8 14a9.5 3.5 90 0 1 0-7',
  control:'M4 5.5h5M11.5 5.5h2M10 4v3M4 10.5h2M8.5 10.5h5M7 9v3',
  battery:'M2 5.5h10a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zM14 7v2M3.5 7h7v2h-7z',
  clockG:'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM8 4.5V8l2.5 1.5',
  mail:'M2 4h12v8H2zM2 5l6 4.5L14 5', person:'M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 13.5c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5',
  lock:'M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7M3.5 7h9v6h-9z', gear:'M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2L3.4 12.6',
};
function G(name, size=15){
  const paths = G_PATHS[name] || G_PATHS.info;
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="${paths}"/></svg>`;
}
