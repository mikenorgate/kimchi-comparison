/* icons.js — inline SVG app/file icons (no external assets) */
'use strict';

const _lg = (id, c1, c2, vertical = true) =>
  `<defs><linearGradient id="g${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="1">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`;
const _sq = (id, c1, c2, r = 14) => `<rect x="2" y="2" width="60" height="60" rx="${r}" fill="url(#g${id})"/>`;

const ICONS = {
finder: `<svg viewBox="0 0 64 64">${_lg('fi','#5ac8fa','#1b6ef3')}
  <path d="M32 2 H50 A12 12 0 0 1 62 14 V50 A12 12 0 0 1 50 62 H32 Z" fill="url(#gfi)"/>
  <path d="M32 2 H14 A12 12 0 0 0 2 14 V50 A12 12 0 0 0 14 62 H32 Z" fill="#8fdcff"/>
  <path d="M18 22 q3 -5 6 0 M40 22 q3 -5 6 0" stroke="#1d3f8a" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M32 6 V44 M32 44 q-9 0 -14 6 M32 44 q9 0 14 6" stroke="#1d3f8a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
safari: `<svg viewBox="0 0 64 64">${_lg('sa','#fdfdfd','#d8e4ee')}${_sq('sa','','')}
  <circle cx="32" cy="32" r="23" fill="#fff" stroke="#cfd8e0" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="#9fb3c8" stroke-width="0.7" stroke-dasharray="1.6 2.7"/>
  <path d="M42 22 L34 34 L22 42 L30 30 Z" fill="#f43b30"/>
  <path d="M42 22 L34 34 L30 30" fill="#fff" opacity="0.001"/>
  <path d="M42 22 L30 30 Z" fill="#f43b30"/><path d="M22 42 L34 34 Z" fill="#e2e8ef"/>
  <circle cx="32" cy="32" r="2.4" fill="#39434e"/></svg>`,
notes: `<svg viewBox="0 0 64 64">${_sq('no','#ffffff','#eef0f3')}
  <path d="M2 16 A12 12 0 0 1 14 4 H50 A12 12 0 0 1 62 16 V18 H2 Z" fill="#ffd60a" transform="translate(0,-2)"/>
  <path d="M12 30 H52 M12 39 H52 M12 48 H40" stroke="#c7ccd4" stroke-width="4" stroke-linecap="round"/></svg>`,
mail: `<svg viewBox="0 0 64 64">${_lg('ma','#59b0ff','#0b63f6')}${_sq('ma','','')}
  <rect x="11" y="19" width="42" height="27" rx="4" fill="#fff"/>
  <path d="M11 22 L32 36 L53 22" fill="none" stroke="#9cc3f7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11 44 L26 32 M53 44 L38 32" stroke="#e3edf9" stroke-width="2.5"/></svg>`,
messages: `<svg viewBox="0 0 64 64">${_lg('me','#6cf07a','#0ac746')}
  <path d="M32 8 C18 8 7 18 7 31 c0 6.6 3.3 12.5 8.5 16.5 -0.7 3-2.3 6 -4.5 7.8 4.2 -0.4 8 -1.8 10.8 -3.7 3.1 1 6.5 1.4 10.2 1.4 14 0 25 -10 25 -23 S46 8 32 8 Z" fill="url(#gme)"/>
  <circle cx="22" cy="31" r="3.4" fill="#fff"/><circle cx="33" cy="31" r="3.4" fill="#fff"/><circle cx="44" cy="31" r="3.4" fill="#fff"/></svg>`,
calendar: `<svg viewBox="0 0 64 64">${_sq('ca','#ffffff','#eceff3')}
  <text x="32" y="22" font-family="-apple-system,Helvetica,Arial" font-size="13" font-weight="600" fill="#fa2d2d" text-anchor="middle">AUG</text>
  <text x="32" y="50" font-family="-apple-system,Helvetica,Arial" font-size="30" font-weight="300" fill="#333" text-anchor="middle">7</text></svg>`,
reminders: `<svg viewBox="0 0 64 64">${_sq('re','#ffffff','#eef0f4')}
  <circle cx="17" cy="20" r="5.4" fill="#ff9f0a"/><rect x="27" y="17" width="24" height="6" rx="3" fill="#c9ced6"/>
  <circle cx="17" cy="35" r="5.4" fill="#0a84ff"/><rect x="27" y="32" width="24" height="6" rx="3" fill="#c9ced6"/>
  <circle cx="17" cy="50" r="5.4" fill="#30d158"/><rect x="27" y="47" width="24" height="6" rx="3" fill="#c9ced6"/></svg>`,
photos: `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="14" fill="#f6f6f8"/>
  ${[0,45,90,135,180,225,270,315].map((a, i) => {
    const cols = ['#ff9f0a','#ffd60a','#30d158','#64d2ff','#0a84ff','#bf5af2','#ff375f','#ff6482'];
    return `<path d="M32 32 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0" fill="none"/>
      <path d="M32 32 L${32 + 6 * Math.cos((a-22)*Math.PI/180)} ${32 + 6 * Math.sin((a-22)*Math.PI/180)} A24 24 0 0 1 ${32 + 6 * Math.cos((a+22)*Math.PI/180)} ${32 + 6 * Math.sin((a+22)*Math.PI/180)} Z" fill="${cols[i]}" opacity="0.85" transform="translate(${16*Math.cos(a*Math.PI/180)},${16*Math.sin(a*Math.PI/180)})"/>`;
  }).join('')}
  </svg>`,
music: `<svg viewBox="0 0 64 64">${_lg('mu','#fc5c7d','#e8204f')}${_sq('mu','','')}
  <path d="M26 44 V22 l20 -5 V40" fill="none" stroke="#fff" stroke-width="4.4" stroke-linejoin="round"/>
  <ellipse cx="21.5" cy="44" rx="6.4" ry="5" fill="#fff"/><ellipse cx="41.5" cy="40" rx="6.4" ry="5" fill="#fff"/></svg>`,
appstore: `<svg viewBox="0 0 64 64">${_lg('as','#3fb3fb','#0d5ff9')}${_sq('as','','')}
  <path d="M32 14 L20 42 M32 14 L44 42 M25 33 H39" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M14 42 H50" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.0"/></svg>`,
terminal: `<svg viewBox="0 0 64 64">${_lg('te','#3d3d44','#121216')}${_sq('te','','')}
  <path d="M12 16 L24 26 L12 36" stroke="#32d74b" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28 38 H48" stroke="#32d74b" stroke-width="5" stroke-linecap="round"/></svg>`,
settings: `<svg viewBox="0 0 64 64">${_lg('se','#e3e4e8','#9b9da6')}${_sq('se','','')}
  <g fill="#f4f5f7" stroke="#7b7d86" stroke-width="2">
    <path d="M32 15 l3 5 6 -1 1 6 6 2 -2 5 4 4 -4 4 2 6 -6 2 -1 6 -6 -1 -3 5 -3 -5 -6 1 -1 -6 -6 -2 2 -6 -4 -4 4 -4 -2 -5 6 -2 1 -6 6 1 Z"/>
  </g><circle cx="32" cy="32" r="8.5" fill="#9b9da6" stroke="#f4f5f7" stroke-width="3"/></svg>`,
calculator: `<svg viewBox="0 0 64 64">${_lg('cc','#3a3a3f','#17171a')}${_sq('cc','','')}
  <rect x="12" y="14" width="18" height="10" rx="2.5" fill="#ff9f0a"/><circle cx="44" cy="19" r="5" fill="#54545c"/>
  <circle cx="19" cy="35" r="5" fill="#54545c"/><circle cx="34" cy="35" r="5" fill="#54545c"/><circle cx="49" cy="35" r="5" fill="#54545c"/>
  <circle cx="19" cy="49" r="5" fill="#54545c"/><circle cx="34" cy="49" r="5" fill="#54545c"/><circle cx="49" cy="49" r="5" fill="#ff9f0a"/></svg>`,
weather: `<svg viewBox="0 0 64 64">${_lg('we','#5ab5ff','#1e6feb')}${_sq('we','','')}
  <circle cx="24" cy="22" r="10" fill="#ffd60a"/>
  <circle cx="27" cy="38" r="11" fill="#fff"/><circle cx="40" cy="34" r="13" fill="#fff"/>
  <rect x="20" y="34" width="30" height="15" rx="7.5" fill="#fff"/></svg>`,
clock: `<svg viewBox="0 0 64 64">${_lg('cl','#2c2c30','#0b0b0d')}${_sq('cl','','')}
  <circle cx="32" cy="32" r="21" fill="#fff"/>
  <path d="M32 32 V19 M32 32 L41 37" stroke="#111" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  <circle cx="32" cy="32" r="2.4" fill="#fa2d2d"/></svg>`,
maps: `<svg viewBox="0 0 64 64"><clipPath id="mclip"><rect x="2" y="2" width="60" height="60" rx="14"/></clipPath>
  <g clip-path="url(#mclip)"><rect width="64" height="64" fill="#c8e6c9"/>
  <path d="M-5 40 Q20 30 35 42 T70 38" stroke="#fff" stroke-width="9" fill="none"/>
  <path d="M20 -5 Q30 25 18 45 T30 70" stroke="#a5d6a7" stroke-width="14" fill="none"/>
  <circle cx="46" cy="18" r="10" fill="#90caf9"/>
  <path d="M40 8 c-6 0 -10 4.4 -10 9.6 0 7 10 16.4 10 16.4 S50 24.6 50 17.6 C50 12.4 46 8 40 8 Z" fill="#fa2d2d"/>
  <circle cx="40" cy="17.6" r="3.6" fill="#fff"/></g></svg>`,
textedit: `<svg viewBox="0 0 64 64"><rect x="10" y="4" width="40" height="56" rx="7" fill="#fff" stroke="#d5d9df"/>
  <path d="M17 14 H45 M17 21 H45 M17 28 H45 M17 35 H38" stroke="#c6ccd6" stroke-width="3.4" stroke-linecap="round"/>
  <g transform="rotate(40 46 40)"><rect x="42" y="26" width="8" height="26" rx="2" fill="#ffd60a"/><path d="M42 52 h8 l-4 8 Z" fill="#f4c27a"/><path d="M45 56.5 h2 l-1 3.5 Z" fill="#4d4d4d"/><rect x="42" y="26" width="8" height="5" fill="#ff9f0a"/></g></svg>`,
activity: `<svg viewBox="0 0 64 64">${_lg('ac','#313136','#0e0e10')}${_sq('ac','','')}
  <path d="M8 34 H18 L23 18 L31 48 L37 30 L41 38 H56" stroke="#32d74b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
preview: `<svg viewBox="0 0 64 64">${_lg('pr','#fdfdff','#e3e6ec')}${_sq('pr','','')}
  <path d="M18 38 l8 -11 6 8 5 -6 9 9 Z" fill="#8ecafc"/>
  <circle cx="23" cy="20" r="3.4" fill="#ffd60a"/>
  <circle cx="30" cy="30" r="13" fill="rgba(180,220,255,0.35)" stroke="#0a84ff" stroke-width="3.4"/>
  <path d="M40 40 L50 50" stroke="#0a84ff" stroke-width="4.6" stroke-linecap="round"/></svg>`,
photobooth: `<svg viewBox="0 0 64 64">${_lg('pb','#4b4b52','#17171b')}${_sq('pb','','')}
  <circle cx="32" cy="32" r="19" fill="#101014" stroke="#6d6d75" stroke-width="3"/>
  <circle cx="32" cy="32" r="11" fill="#1d3f66"/><circle cx="28" cy="28" r="4.4" fill="#5aa0f0"/>
  <circle cx="36" cy="37" r="1.8" fill="#9ec7f5"/></svg>`,
stickies: `<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="4" fill="#fff7ae"/>
  <path d="M8 44 L32 56 V32 L8 44" fill="#efe48c" opacity="0.0"/>
  <path d="M56 32 L32 56 H40 A16 16 0 0 0 56 40 Z" fill="#f0e38e"/>
  <path d="M16 18 H48 M16 25 H48 M16 32 H40" stroke="#d8c86a" stroke-width="3.4" stroke-linecap="round"/></svg>`,
trash: `<svg viewBox="0 0 64 64"><path d="M18 14 H46 L43 54 A6 6 0 0 1 37 59 H27 A6 6 0 0 1 21 54 Z" fill="rgba(200,205,215,0.55)" stroke="#8e939e" stroke-width="2.6"/>
  ${[24,30,36,42].map(x => `<path d="M${x} 18 L${x-1} 55" stroke="#8e939e" stroke-width="1.8"/>`).join('')}
  <rect x="14" y="9" width="36" height="6" rx="3" fill="#c3c8d2"/><rect x="27" y="5" width="10" height="5" rx="2" fill="#c3c8d2"/></svg>`,
trashfull: `<svg viewBox="0 0 64 64"><path d="M18 14 H46 L43 54 A6 6 0 0 1 37 59 H27 A6 6 0 0 1 21 54 Z" fill="rgba(200,205,215,0.55)" stroke="#8e939e" stroke-width="2.6"/>
  <circle cx="26" cy="12" r="6" fill="#f2f3f5" stroke="#cfd3da"/><circle cx="36" cy="10" r="7" fill="#fafbfc" stroke="#d6d9df"/><circle cx="42" cy="14" r="5" fill="#eef0f3" stroke="#d6d9df"/>
  ${[24,30,36,42].map(x => `<path d="M${x} 20 L${x-1} 55" stroke="#8e939e" stroke-width="1.8"/>`).join('')}
  <rect x="14" y="16" width="36" height="5" rx="2.5" fill="#c3c8d2"/></svg>`,
folder: `<svg viewBox="0 0 64 64">${_lg('fo','#6fc3ff','#2a8df5')}
  <path d="M6 16 A6 6 0 0 1 12 10 H24 l6 6 H52 A6 6 0 0 1 58 22 V24 H6 Z" fill="#3b97e8"/>
  <rect x="6" y="22" width="52" height="32" rx="6" fill="url(#gfo)"/></svg>`,
hd: `<svg viewBox="0 0 64 64"><rect x="6" y="20" width="52" height="24" rx="6" fill="#e8eaee" stroke="#b9bec7"/>
  <rect x="8" y="26" width="48" height="12" rx="4" fill="#d4d8df"/><circle cx="50" cy="32" r="2.6" fill="#7dd87f"/></svg>`,
file: `<svg viewBox="0 0 64 64"><path d="M16 6 H38 L50 18 V54 A4 4 0 0 1 46 58 H16 A4 4 0 0 1 12 54 V10 A4 4 0 0 1 16 6 Z" fill="#f4f6f9" stroke="#c9ced7"/>
  <path d="M38 6 V18 H50" fill="#dfe4ec"/></svg>`,
txt: `<svg viewBox="0 0 64 64"><path d="M16 6 H38 L50 18 V54 A4 4 0 0 1 46 58 H16 A4 4 0 0 1 12 54 V10 A4 4 0 0 1 16 6 Z" fill="#f4f6f9" stroke="#c9ced7"/>
  <path d="M38 6 V18 H50" fill="#dfe4ec"/><path d="M20 26 H44 M20 33 H44 M20 40 H44 M20 47 H36" stroke="#aab2c0" stroke-width="3" stroke-linecap="round"/></svg>`,
imgfile: `<svg viewBox="0 0 64 64"><path d="M16 6 H38 L50 18 V54 A4 4 0 0 1 46 58 H16 A4 4 0 0 1 12 54 V10 A4 4 0 0 1 16 6 Z" fill="#f4f6f9" stroke="#c9ced7"/>
  <path d="M38 6 V18 H50" fill="#dfe4ec"/><rect x="18" y="24" width="28" height="22" rx="3" fill="#bfe3ff"/><circle cx="25" cy="31" r="3" fill="#ffd60a"/><path d="M18 42 l8 -8 6 6 5 -5 9 7 v4 H18 Z" fill="#5aa9e6"/></svg>`,
pdf: `<svg viewBox="0 0 64 64"><path d="M16 6 H38 L50 18 V54 A4 4 0 0 1 46 58 H16 A4 4 0 0 1 12 54 V10 A4 4 0 0 1 16 6 Z" fill="#f4f6f9" stroke="#c9ced7"/>
  <path d="M38 6 V18 H50" fill="#dfe4ec"/><rect x="18" y="30" width="28" height="12" rx="2" fill="#fa2d2d"/><text x="32" y="39.6" font-family="Arial" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">PDF</text></svg>`,
};

// Status/menu glyphs (monochrome, currentColor)
const GLYPHS = {
  wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9.5 C8 4.8 16 4.8 21 9.5"/><path d="M6.5 13 C10 10 14 10 17.5 13"/><path d="M10 16.4 C11.4 15.3 12.6 15.3 14 16.4"/><circle cx="12" cy="19.4" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  wifiOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9.5 C8 4.8 16 4.8 21 9.5" opacity="0.35"/><path d="M6.5 13 C10 10 14 10 17.5 13" opacity="0.35"/><circle cx="12" cy="19.4" r="1.5" fill="currentColor" opacity="0.35" stroke="none"/><path d="M4 4 L20 20"/></svg>`,
  battery: `<svg viewBox="0 0 28 24"><rect x="2" y="7" width="21" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.5"/><rect x="3.6" y="8.6" width="13" height="6.8" rx="1.6" fill="currentColor"/><path d="M24.5 10 v4 a2.4 2.4 0 0 0 0 -4 Z" fill="currentColor" opacity="0.5"/></svg>`,
  cc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1.5" y="2.5" width="21" height="19" rx="5.5"/><circle cx="9" cy="12" r="4" fill="currentColor"/><path d="M15.5 8.5 v7" stroke-linecap="round"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 L21 21"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.5 A8.5 8.5 0 1 1 9.5 3.5 a7 7 0 0 0 11 11 Z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8 c0-1.2 1.3-1.9 2.3-1.3 l11 6.7 c1 .6 1 2 0 2.6 l-11 6.7 c-1 .6-2.3-.1-2.3-1.3 Z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5.5" y="4" width="4.6" height="16" rx="1.6"/><rect x="13.9" y="4" width="4.6" height="16" rx="1.6"/></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.8 c0-1 1.1-1.6 2-1.1 L15.5 11 c.8.5.8 1.7 0 2.2 L6 19.3 c-.9.5-2-.1-2-1.1 Z"/><rect x="17" y="4.5" width="3" height="15" rx="1.4"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5.8 c0-1-1.1-1.6-2-1.1 L8.5 11 c-.8.5-.8 1.7 0 2.2 L18 19.3 c.9.5 2-.1 2-1.1 Z"/><rect x="4" y="4.5" width="3" height="15" rx="1.4"/></svg>`,
  chevL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4 L7 12 L15 20"/></svg>`,
  chevR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 L17 12 L9 20"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16 V4 M7.5 8.5 L12 4 L16.5 8.5"/><path d="M6 11 v7.5 A2.5 2.5 0 0 0 8.5 21 h7 a2.5 2.5 0 0 0 2.5-2.5 V11"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5 V19 M5 12 H19"/></svg>`,
  sidebar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="4" width="19" height="16" rx="3.5"/><path d="M9.5 4 v16"/><circle cx="6" cy="7" r="0.9" fill="currentColor"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>`,
  listg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6 H21 M8 12 H21 M8 18 H21"/><circle cx="4" cy="6" r="1.3" fill="currentColor"/><circle cx="4" cy="12" r="1.3" fill="currentColor"/><circle cx="4" cy="18" r="1.3" fill="currentColor"/></svg>`,
  cols: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4 V20 M15 4 V20"/></svg>`,
  trashg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7 H20 M9 7 V4.5 h6 V7 M6.5 7 l1 13 h9 l1 -13"/><path d="M10 11 v6 M14 11 v6"/></svg>`,
  compose: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 H5.5 A2.5 2.5 0 0 1 3 17.5 V6.5 A2.5 2.5 0 0 1 5.5 4 H13"/><path d="M14 8 L20 2 M13 9 l3 -3 M16.5 2.5 l3 3 L11 14 l-4 1 1 -4 Z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5 C6 16 3 12.6 3 9.2 3 6.6 5 4.5 7.6 4.5 c1.8 0 3.4 1 4.4 2.6 1-1.6 2.6-2.6 4.4-2.6 C19 4.5 21 6.6 21 9.2 c0 3.4-3 6.8-9 11.3 Z"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5 V8 a4 4 0 0 1 8 0 v2.5"/><circle cx="12" cy="15.4" r="1.4" fill="currentColor"/></svg>`,
  quote: ``,
  gearSm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8 v3 M12 18.2 v3 M2.8 12 h3 M18.2 12 h3 M5.5 5.5 l2.1 2.1 M16.4 16.4 l2.1 2.1 M18.5 5.5 l-2.1 2.1 M7.6 16.4 l-2.1 2.1"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5 a6.5 6.5 0 0 0 13 0 M12 18 v3"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="7" width="19" height="13" rx="3"/><circle cx="12" cy="13.5" r="4"/><path d="M8 7 l1.4 -2.7 h5.2 L16 7"/></svg>`,
  bt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7.5 L17 16.5 L12.5 19.5 V4.5 L17 7.5 L7 16.5"/></svg>`,
  airdrop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none"/><path d="M8.5 14.5 a5 5 0 0 1 7 0 M5.5 11.5 a9.5 9.5 0 0 1 13 0 M2.5 8.5 a14 14 0 0 1 19 0"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 18 V6 l10 -2.5 V16"/><circle cx="6.8" cy="18" r="2.6"/><circle cx="16.8" cy="16" r="2.6"/></svg>`,
  photos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M3.5 15 l5 -5 4 4 3 -3 5 5"/><circle cx="9" cy="9" r="1.6"/></svg>`,
};

function iconEl(name, size = 48) {
  const s = el('span', { class: 'ic', html: ICONS[name] || ICONS.file });
  s.style.width = s.style.height = size + 'px';
  return s;
}
function glyphEl(name, size = 16) {
  const s = el('span', { class: 'gl', html: GLYPHS[name] || '' });
  s.style.width = s.style.height = size + 'px';
  return s;
}
