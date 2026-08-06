import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

let openCount = 0;

export function openTerminal() {
  openCount++;
  openWindow('terminal', 'Terminal', `
    <div class="terminal">
      <div class="terminal-output"></div>
      <div class="terminal-line">
        <span class="terminal-prompt">mike@tahoe ~ %</span>
        <input type="text" class="terminal-input" spellcheck="false" autofocus>
      </div>
    </div>
  `, {
    width: 640, height: 420,
    onMount: (el) => {
      markAppRunning('terminal', true);
      initTerminal(el);
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="terminal"]')) markAppRunning('terminal', false);
      });
    }
  });
}

function initTerminal(el) {
  const output = el.querySelector('.terminal-output');
  const input = el.querySelector('.terminal-input');
  const prompt = 'mike@tahoe ~ %';
  let cwd = '~';

  const terminal = el.querySelector('.terminal');
  function print(text) {
    output.textContent += text + '\n';
    terminal.scrollTop = terminal.scrollHeight;
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      print(`${prompt} ${cmd}`);
      const response = runCommand(cmd);
      if (response) print(response);
      input.value = '';
    }
  });

  input.focus();
  terminal.addEventListener('click', () => input.focus());

  function runCommand(cmd) {
    const parts = cmd.split(/\s+/);
    const base = parts[0].toLowerCase();
    switch (base) {
      case '': return '';
      case 'help': return 'Available commands: help, echo, date, whoami, pwd, ls, cd, clear, uname, open';
      case 'echo': return parts.slice(1).join(' ');
      case 'date': return new Date().toString();
      case 'whoami': return 'mike';
      case 'pwd': return `/Users/mike${cwd === '~' ? '' : cwd.replace('~', '')}`;
      case 'ls': return 'Applications\tDocuments\tDownloads\tDesktop\tLibrary\tMovies\tMusic\tPictures\n';
      case 'cd':
        if (parts[1]) cwd = parts[1];
        return '';
      case 'clear':
        output.textContent = '';
        return '';
      case 'uname': return 'Darwin mike-tahoe 26.0.0 arm64';
      case 'open': return `Opening ${parts[1] || 'nothing'}...`;
      default: return `zsh: command not found: ${base}`;
    }
  }
}
