// Terminal — a shell over the virtual filesystem with real-ish commands.
import * as vfs from '../vfs.js';
import { getState } from '../store.js';

export const windowConfig = { width: 680, height: 420 };

let cwd = '/Users/mike';
const history = [];
let histIdx = -1;

const HOSTNAME = 'mike-mac';
const USER = 'mike';

function prompt() {
  const short = cwd.replace('/Users/mike','~');
  return `${USER}@${HOSTNAME} ${short} % `;
}

export function mount(el) {
  cwd = '/Users/mike';
  el.innerHTML = `<div class="term scroll" data-term></div>`;
  const term = el.querySelector('[data-term]');
  printBanner(term);
  newLine(term);

  function printBanner(t) {
    const lines = [
      'Last login: ' + new Date().toLocaleString(),
      'Welcome to macOS Tahoe (web) — Darwin Kernel Version 26.0.0',
      '',
    ];
    lines.forEach(l => t.innerHTML += `<div class="term-line">${escapeHtml(l)}</div>`);
  }

  function newLine(t) {
    const inputRow = document.createElement('div');
    inputRow.className = 'term-input';
    inputRow.innerHTML = `<span class="prompt">${prompt()}</span><input type="text" autofocus spellcheck="false" />`;
    t.appendChild(inputRow);
    const inp = inputRow.querySelector('input');
    inp.focus();
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = inp.value;
        t.removeChild(inputRow);
        t.innerHTML += `<div class="term-line">${escapeHtml(prompt() + cmd)}</div>`;
        history.push(cmd); histIdx = history.length;
        runCommand(cmd, t).then(() => { newLine(t); t.scrollTop = t.scrollHeight; });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; inp.value = history[histIdx] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx < history.length-1) { histIdx++; inp.value = history[histIdx] || ''; }
        else { histIdx = history.length; inp.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        inp.value = autocomplete(inp.value);
      }
    });
    t.scrollTop = t.scrollHeight;
  }

  async function runCommand(cmd, t) {
    cmd = cmd.trim();
    if (!cmd) return;
    const parts = cmd.split(/\s+/);
    const c = parts[0];
    const args = parts.slice(1);
    const out = (s) => { t.innerHTML += `<div class="term-line">${escapeHtml(s)}</div>`; };

    switch (c) {
      case 'help':
        out('Available commands:');
        out('  ls [path]       list directory contents');
        out('  cd <path>       change directory');
        out('  pwd             print working directory');
        out('  cat <file>      print file contents');
        out('  echo <text>     print text');
        out('  mkdir <name>    create a directory');
        out('  touch <name>    create an empty file');
        out('  rm <name>       remove file');
        out('  mv <a> <b>      rename/move (basic)');
        out('  clear           clear screen');
        out('  date            show current date');
        out('  whoami          print current user');
        out('  echo            print text');
        out('  open <app>      launch an app');
        out('  tree            show directory tree');
        out('  neofetch        system info');
        out('  help            show this help');
        break;
      case 'ls': {
        const path = args[0] ? resolvePath(args[0]) : cwd;
        const items = vfs.list(path);
        if (items.length === 0) out('');
        else out(items.map(i => i.type==='dir'? i.name+'/' : i.name).join('   '));
        break;
      }
      case 'cd': {
        if (!args[0] || args[0] === '~') { cwd = '/Users/mike'; break; }
        const path = resolvePath(args[0]);
        const node = vfs.resolve(path);
        if (!node) out(`cd: no such file or directory: ${args[0]}`);
        else if (node.type !== 'dir') out(`cd: not a directory: ${args[0]}`);
        else cwd = path;
        break;
      }
      case 'pwd': out(cwd); break;
      case 'cat': {
        if (!args[0]) { out('usage: cat <file>'); break; }
        const path = resolvePath(args[0]);
        const node = vfs.resolve(path);
        if (!node) out(`cat: ${args[0]}: No such file or directory`);
        else if (node.type === 'dir') out(`cat: ${args[0]}: Is a directory`);
        else out(node.content || '');
        break;
      }
      case 'echo': out(args.join(' ')); break;
      case 'mkdir': {
        if (!args[0]) { out('usage: mkdir <name>'); break; }
        const path = resolvePath(args[0]);
        if (vfs.makeDir(path)) out('');
        else out(`mkdir: ${args[0]}: File exists`);
        break;
      }
      case 'touch': {
        if (!args[0]) { out('usage: touch <name>'); break; }
        const path = resolvePath(args[0]);
        vfs.writeFile(path, vfs.readFile(path) || '');
        out('');
        break;
      }
      case 'rm': {
        if (!args[0]) { out('usage: rm <name>'); break; }
        const path = resolvePath(args[0]);
        if (vfs.remove(path)) out('');
        else out(`rm: ${args[0]}: No such file or directory`);
        break;
      }
      case 'clear': t.innerHTML = ''; break;
      case 'date': out(new Date().toString()); break;
      case 'whoami': out(USER); break;
      case 'open': {
        if (!args[0]) { out('usage: open <app>'); break; }
        const mod = await import('../appregistry.js');
        mod.launchApp(args[0].toLowerCase());
        out(`Opening ${args[0]}…`);
        break;
      }
      case 'tree': {
        const start = args[0] ? resolvePath(args[0]) : cwd;
        printTree(start, '', t, 0);
        break;
      }
      case 'neofetch': {
        out('                    -`                  mike@' + HOSTNAME);
        out('                  -o-`                 -----------------');
        out('                -ooo-`                 OS: macOS Tahoe 26.0');
        out('              -ooooo-`                 Host: MacBook Pro (Web)');
        out('            -ooooooo-`                 Kernel: Darwin 26.0.0');
        out('          -ooooooooo-`                Shell: websh 1.0');
        out('        -ooooooooooo-`                 Resolution: ' + window.innerWidth + 'x' + window.innerHeight);
        out('      -ooooooooooooo-`                 CPU: Apple Silicon (Virtual)');
        out('    -ooooooooooooooo-`                 Memory: 16 GB');
        break;
      }
      default:
        out(`zsh: command not found: ${c}`);
    }
  }

  function resolvePath(p) {
    if (p === '~') return '/Users/mike';
    if (p.startsWith('~/')) return '/Users/mike/' + p.slice(2);
    if (p.startsWith('/')) return p;
    return cwd === '/' ? '/' + p : cwd + '/' + p;
  }
  function printTree(path, prefix, t, depth) {
    if (depth > 3) return;
    const items = vfs.list(path);
    items.forEach((node, i) => {
      const last = i === items.length - 1;
      const branch = last ? '└── ' : '├── ';
      const line = prefix + branch + node.name + (node.type==='dir' ? '/' : '');
      t.innerHTML += `<div class="term-line">${escapeHtml(line)}</div>`;
      if (node.type === 'dir') printTree(path + '/' + node.name, prefix + (last ? '    ' : '│   '), t, depth + 1);
    });
  }

  // focus terminal on click
  el.querySelector('.term').addEventListener('click', () => {
    const inp = el.querySelector('.term-input input');
    if (inp) inp.focus();
  });
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
