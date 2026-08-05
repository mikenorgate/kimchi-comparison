const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  url: 'http://localhost:8765/',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true
});

const { window } = dom;
window.addEventListener('error', (e) => errors.push(e.message));
window.addEventListener('unhandledrejection', (e) => errors.push(e.reason?.message || String(e.reason)));

window.addEventListener('load', () => {
  console.log('window load fired');
  setTimeout(() => {
    console.log('Document title:', window.document.title);
    console.log('Boot display:', window.getComputedStyle(window.document.getElementById('boot-screen')).display);
    console.log('Desktop visible:', window.getComputedStyle(window.document.getElementById('desktop')).display);
    console.log('Dock apps:', window.document.querySelectorAll('#dock-apps .dock-app').length);
    console.log('Windows:', window.document.querySelectorAll('.window').length);
    console.log('Errors:', errors.length ? errors : 'none');
    process.exit(errors.length ? 1 : 0);
  }, 3500);
});
