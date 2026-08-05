import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class TerminalApp extends App {
  constructor() {
    super({ id: 'terminal', name: 'Terminal', width: 720, height: 420, emoji: '💻', iconGradient: ['#333', '#111'], iconColor: '#0f0' });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'terminal';
    root.innerHTML = `<div class="terminal-output" id="out"></div><div class="terminal-input-line"><span class="terminal-prompt">mike@tahoe ~ %</span><input type="text" class="terminal-input" id="in" spellcheck="false" autocomplete="off" autofocus /></div>`;

    const out = $('#out', root);
    const input = $('#in', root);
    let cwd = '~';

    const print = (html) => {
      const line = document.createElement('div');
      line.innerHTML = html;
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    };

    const commands = {
      help: () => 'Commands: help, clear, echo, date, whoami, ls, pwd, open, neofetch',
      clear: () => { out.innerHTML = ''; return ''; },
      echo: (args) => args.join(' '),
      date: () => new Date().toString(),
      whoami: () => 'mike',
      pwd: () => `/Users/mike/${cwd === '~' ? '' : cwd}`,
      ls: () => ['Applications', 'Desktop', 'Documents', 'Downloads', 'Movies', 'Music', 'Pictures'],
      open: (args) => { if (args[0]) window.dispatchEvent(new CustomEvent('open-app', { detail: args[0].replace('.app', '') })); return 'Opening ' + (args[0] || ''); },
      neofetch: () => `macOS Tahoe Web<br>Kernel: JavaScriptCore<br>Shell: Kimchi/1.0<br>Uptime: ${Math.floor(performance.now()/60000)} mins`
    };

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const raw = input.value.trim();
      print(`<span class="term-prompt">mike@tahoe ${cwd} %</span> ${raw}`);
      input.value = '';
      if (!raw) return;
      const [cmd, ...args] = raw.split(/\s+/);
      if (commands[cmd]) {
        const res = commands[cmd](args);
        if (res) print(res);
      } else {
        print(`zsh: command not found: ${cmd}`);
      }
    });

    print('Last login: ' + new Date().toLocaleString());
    print('Type <span class="term-cmd">help</span> for available commands.');
    return root;
  }
}

registerApp(new TerminalApp());
