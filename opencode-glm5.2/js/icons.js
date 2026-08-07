// ===================================================================
// App & UI icons as SVG strings (Tahoe-style gradient tiles)
// ===================================================================

function tile(inner, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/>
    </linearGradient></defs>
    <rect x="6" y="6" width="88" height="88" rx="22" fill="url(#g)"/>
    ${inner}</svg>`;
}

export const icons = {
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 205" fill="currentColor"><path d="M150.37 130.25c-.28 32.02 26.13 47.32 27.37 48.06-.15.48-4.28 14.62-14.12 29.2-8.5 12.62-17.32 25.2-31.23 25.5-13.66.25-18.06-8.27-33.7-8.27-15.62 0-20.5 8.02-33.45 8.52-13.4.5-23.62-13.55-32.2-26.13C24.7 206.8 14.05 166.9 25.6 138.4c5.75-14.2 20.18-23.2 35.9-23.4 13.5-.26 26.2 9.1 34.5 9.1 8.27 0 23.78-11.27 40.07-9.62 6.82.28 26 2.75 38.32 20.78-30.7 18.32-31.05 60.74-26.04 76.0zM121.6 65.0c8.6-10.43 14.4-24.9 12.83-39.32-12.4.5-27.43 8.26-36.32 18.66-7.98 9.23-14.97 24.0-13.1 38.13 13.84 1.07 27.98-7.04 36.59-17.47z"/></svg>`,

  finder: tile(`<path d="M50 28c-14 0-24 12-24 26v14h48V54c0-14-10-26-24-26z" fill="#fff"/><circle cx="42" cy="54" r="4" fill="#1a73e8"/><circle cx="58" cy="54" r="4" fill="#1a73e8"/><path d="M40 68c4 4 16 4 20 0" stroke="#1a73e8" stroke-width="3" fill="none" stroke-linecap="round"/>`, ["#3aa0ff", "#0a5fe0"]),

  calculator: tile(`<rect x="26" y="22" width="48" height="56" rx="8" fill="#fff"/><rect x="30" y="26" width="40" height="14" rx="3" fill="#1c1c1e"/><g fill="#1c1c1e"><circle cx="36" cy="50" r="3.5"/><circle cx="50" cy="50" r="3.5"/><circle cx="64" cy="50" r="3.5"/><circle cx="36" cy="62" r="3.5"/><circle cx="50" cy="62" r="3.5"/><circle cx="64" cy="62" r="3.5"/><circle cx="36" cy="74" r="3.5"/><circle cx="50" cy="74" r="3.5"/></g><circle cx="64" cy="74" r="4" fill="#ff9f0a"/>`, ["#3a3a3c", "#1c1c1e"]),

  notes: tile(`<rect x="22" y="20" width="56" height="60" rx="8" fill="#fff"/><rect x="22" y="20" width="56" height="14" rx="8" fill="#febc2e"/><path d="M22 28h56v6H22z" fill="#febc2e"/><g stroke="#c7c7cc" stroke-width="2"><line x1="32" y1="46" x2="68" y2="46"/><line x1="32" y1="56" x2="68" y2="56"/><line x1="32" y1="66" x2="58" y2="66"/></g>`, ["#ffe17a", "#febc2e"]),

  terminal: tile(`<rect x="18" y="22" width="64" height="56" rx="10" fill="#1c1c1e"/><rect x="18" y="22" width="64" height="12" rx="10" fill="#3a3a3c"/><path d="M30 44l10 8-10 8" stroke="#30d158" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="48" y1="62" x2="64" y2="62" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`, ["#2a2a2e", "#0a0a0c"]),

  safari: tile(`<circle cx="50" cy="50" r="38" fill="#fff"/><circle cx="50" cy="50" r="38" fill="none" stroke="#0a84ff" stroke-width="4"/><circle cx="50" cy="50" r="30" fill="#e8f0ff"/><path d="M50 50L66 34 56 56z" fill="#ff453a"/><path d="M50 50L34 66 44 44z" fill="#0a84ff"/><circle cx="50" cy="50" r="3" fill="#fff"/>`, ["#0a84ff", "#0040dd"]),

  settings: tile(`<circle cx="50" cy="50" r="38" fill="#8e8e93"/><g fill="#fff"><circle cx="50" cy="50" r="14" fill="none" stroke="#fff" stroke-width="3"/>
    ${Array.from({length:8}).map((_,i)=>{const a=i*Math.PI/4;const x1=50+Math.cos(a)*18,x2=50+Math.cos(a)*26,y1=50+Math.sin(a)*18,y2=50+Math.sin(a)*26;return `<rect x="${50+Math.cos(a)*20-3}" y="${50+Math.sin(a)*20-3}" width="6" height="14" rx="2" transform="rotate(${i*45} ${50+Math.cos(a)*20} ${50+Math.sin(a)*20})"/>`;}).join("")}</g><circle cx="50" cy="50" r="8" fill="#8e8e93"/>`, ["#c7c7cc", "#8e8e93"]),

  textedit: tile(`<rect x="26" y="18" width="48" height="64" rx="6" fill="#fff"/><path d="M26 18h36l12 12v52a6 6 0 01-6 6H32a6 6 0 01-6-6z" fill="#fff" stroke="#e5e5ea" stroke-width="1"/><path d="M62 18l12 12H62z" fill="#d1d1d6"/><g stroke="#0a84ff" stroke-width="2"><line x1="34" y1="40" x2="60" y2="40"/><line x1="34" y1="50" x2="66" y2="50"/><line x1="34" y1="60" x2="56" y2="60"/></g>`, ["#5ac8fa", "#0a84ff"]),

  calendar: tile(`<rect x="20" y="20" width="60" height="60" rx="10" fill="#fff"/><rect x="20" y="20" width="60" height="16" rx="10" fill="#ff453a"/><text x="50" y="64" font-size="30" font-weight="700" text-anchor="middle" fill="#1c1c1e" font-family="Arial">7</text>`, ["#ff6961", "#ff453a"]),

  music: tile(`<path d="M30 26l34-8v40a14 14 0 11-8-12.6V32l-26 6v34a14 14 0 11-8-12.6z" fill="#fff"/>`, ["#ff375f", "#fb2c69"]),

  photos: tile(`<g><circle cx="50" cy="50" r="12" fill="#ffcc00"/><g>${["#ff453a","#ff9f0a","#30d158","#0a84ff","#bf5af2"].map((c,i)=>{const a=i*72*Math.PI/180-90;const x=50+Math.cos(a)*24,y=50+Math.sin(a)*24;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${c}" opacity="0.92"/>`;}).join("")}</g></g>`, ["#f5f5f7", "#e5e5ea"]),

  weather: tile(`<circle cx="42" cy="48" r="12" fill="#ffd60a"/><path d="M40 64a16 16 0 0131-6 12 12 0 01-2 23H32a14 14 0 01-4-27 16 16 0 0112 10z" fill="#fff"/>`, ["#4a9eff", "#1a6fd6"]),

  clock: tile(`<circle cx="50" cy="50" r="36" fill="#000"/><circle cx="50" cy="50" r="36" fill="none" stroke="#fff" stroke-width="3"/><line x1="50" y1="50" x2="50" y2="28" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="50" x2="66" y2="50" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="50" x2="42" y2="62" stroke="#ff9f0a" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="50" r="3" fill="#ff9f0a"/>`, ["#1c1c1e", "#000"]),

  reminders: tile(`<circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="6"/><path d="M38 50l8 8 16-18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, ["#ff9f0a", "#ff6b00"]),

  mail: tile(`<rect x="20" y="30" width="60" height="40" rx="8" fill="#fff"/><path d="M22 34l28 20 28-20" fill="none" stroke="#0a84ff" stroke-width="3" stroke-linejoin="round"/>`, ["#4a9eff", "#0a84ff"]),

  maps: tile(`<rect x="18" y="22" width="64" height="56" rx="10" fill="#a7e8a7"/><path d="M18 40h28V22h8v18h28v8H54v32h-8V48H18z" fill="rgba(255,255,255,0.5)"/><path d="M50 30c-7 0-12 5-12 11 0 9 12 22 12 22s12-13 12-22c0-6-5-11-12-11z" fill="#ff453a"/><circle cx="50" cy="41" r="4" fill="#fff"/>`, ["#5ec85e", "#34a834"]),

  preview: tile(`<rect x="22" y="18" width="56" height="64" rx="8" fill="#fff"/><circle cx="38" cy="36" r="6" fill="#ffd60a"/><path d="M28 70l14-16 8 6 12-14 12 14v6H28z" fill="#5ac8fa"/><path d="M28 56l10-10 6 4 8-10 16 16" fill="none" stroke="#30d158" stroke-width="2"/>`, ["#6ac4f5", "#0a84ff"]),

  trash: tile(`<path d="M34 32h32l-3 48a6 6 0 01-6 6H43a6 6 0 01-6-6z" fill="#a8a8ad"/><rect x="28" y="26" width="44" height="6" rx="3" fill="#6e6e73"/><rect x="44" y="20" width="12" height="6" rx="3" fill="#6e6e73"/><g stroke="#6e6e73" stroke-width="2"><line x1="44" y1="40" x2="44" y2="76"/><line x1="50" y1="40" x2="50" y2="76"/><line x1="56" y1="40" x2="56" y2="76"/></g>`, ["#c7c7cc", "#8e8e93"]),

  appstore: tile(`<circle cx="50" cy="50" r="34" fill="#0a84ff"/><path d="M36 64l10-18 4 8-6 10zm14 0l6-10 6 10zm-2-4l-6-12h12z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M38 50l6-12 6 12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, ["#1a8fff", "#0a6fff"]),

  launchpad: tile(`<g fill="#fff">${[ [34,34],[66,34],[50,50],[34,66],[66,66]].map(p=>`<rect x="${p[0]-9}" y="${p[1]-9}" width="18" height="18" rx="5"/>`).join("")}</g>`, ["#6363e0", "#3a3ad0"]),

  facetime: tile(`<rect x="22" y="30" width="44" height="40" rx="8" fill="#30d158"/><path d="M68 44l12-8v28l-12-8z" fill="#30d158"/><circle cx="40" cy="48" r="6" fill="#fff"/><path d="M30 66c0-6 5-10 10-10s10 4 10 10z" fill="#fff"/>`, ["#5ee36b", "#30b84f"]),

  stocks: tile(`<rect x="22" y="22" width="56" height="56" rx="12" fill="#1c1c1e"/><polyline points="28,62 40,50 50,58 72,34" fill="none" stroke="#30d158" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="72" cy="34" r="3" fill="#30d158"/>`, ["#2a2a2e", "#0a0a0c"]),

  podcast: tile(`<circle cx="50" cy="50" r="14" fill="#fff"/><circle cx="50" cy="50" r="6" fill="#9b4dff"/><path d="M50 50m-26 0a26 26 0 1 0 52 0" stroke="#fff" stroke-width="3" fill="none" opacity="0.7"/><path d="M40 70c0-6 4-10 10-10s10 4 10 10v8a10 10 0 01-20 0z" fill="#fff"/>`, ["#9b4dff", "#7a2de0"]),

  tv: tile(`<rect x="20" y="24" width="60" height="42" rx="8" fill="#000"/><rect x="20" y="24" width="60" height="42" rx="8" fill="none" stroke="#fff" stroke-width="2"/><path d="M38 72h24M50 66v6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`, ["#1c1c1e", "#000"]),

  news: tile(`<rect x="20" y="18" width="60" height="64" rx="6" fill="#ff453a"/><text x="50" y="58" font-size="38" font-weight="800" text-anchor="middle" fill="#fff" font-family="Georgia">N</text>`, ["#ff6961", "#ff453a"]),

  messages: tile(`<path d="M28 30h44a8 8 0 018 8v24a8 8 0 01-8 8H48l-16 12v-12h-4a8 8 0 01-8-8V38a8 8 0 018-8z" fill="#30d158"/><circle cx="40" cy="50" r="3.5" fill="#fff"/><circle cx="50" cy="50" r="3.5" fill="#fff"/><circle cx="60" cy="50" r="3.5" fill="#fff"/>`, ["#5ee36b", "#30b84f"]),

  home: tile(`<path d="M50 26L24 48v28h16V58h20v18h16V48z" fill="#fff"/><circle cx="50" cy="22" r="6" fill="#ffd60a"/>`, ["#ffb340", "#ff8a00"]),

  // status bar icons
  wifi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 18a2 2 0 100 4 2 2 0 000-4zM6 12.5c3.3-3.3 8.7-3.3 12 0l-2 2a4.3 4.3 0 00-8 0l-2-2zM2 8.5c5.5-5.5 14.5-5.5 20 0l-2 2c-4.4-4.4-11.6-4.4-16 0l-2-2z"/></svg>`,
  battery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="10" rx="2.5"/><rect x="4" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none"/><path d="M24 10v4" stroke-linecap="round"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>`,
  control: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>`,
  spotlightCC: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>`,
  bluetooth: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 7l10 10-5 4V3l5 4L7 17"/></svg>`,
  volume: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8a4 4 0 010 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8 8 0 119.5 4 6 6 0 0020 14.5z"/></svg>`,
  airplane: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>`,
  folder: tile(`<path d="M16 30a6 6 0 016-6h12l6 6h34a6 6 0 016 6v40a6 6 0 01-6 6H22a6 6 0 01-6-6z" fill="#7ab7ff"/><path d="M16 36a6 6 0 016-6h56a6 6 0 016 6v6H16z" fill="#5a9ff0"/>`, ["#7ab7ff", "#4a8fe0"]),
  file: tile(`<path d="M30 18h28l16 16v48a6 6 0 01-6 6H30a6 6 0 01-6-6V24a6 6 0 016-6z" fill="#e9e9ee"/><path d="M58 18l16 16H58z" fill="#c7c7cc"/></g>`, ["#f5f5f7", "#dcdce0"]),
};

// generic small status/toolbar icons
export const ui = {
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  search: icons.search,
  back: icons.chevronLeft,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5v14L5 12z"/><path d="M18 5h2v14h-2z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14L19 12z" transform="scale(-1 1) translate(-24 0)"/><path d="M4 5h2v14H4z"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h12M8 12h12M8 18h12M4 6h0M4 12h0M4 18h0" stroke-linecap="round"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M12 3l-4 4M12 3l4 4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>`,
  reload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>`,
};

export function iconSVG(name, size) {
  const svg = icons[name] || icons.file;
  return svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
}
