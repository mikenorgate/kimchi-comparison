/* ============================================
   App: Terminal
   ============================================ */

const Terminal = {
  cwd: '~',

  render(container, winData) {
    container.innerHTML = `
      <div class="terminal-app">
        <div class="terminal-body" id="${winData.id}-body" tabindex="0"></div>
      </div>
    `;

    const body = document.getElementById(`${winData.id}-body`);
    this.printLine(body, 'Last login: ' + new Date().toString());
    this.printLine(body, 'Welcome to macOS Tahoe Terminal');
    this.printLine(body, '');
    this.newPrompt(body);
    this.attachEvents(winData);
  },

  printLine(body, text) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  },

  newPrompt(body) {
    const line = document.createElement('div');
    line.className = 'terminal-input-line';
    line.innerHTML = `
      <span class="terminal-prompt">
        <span class="user">mike@MacBook</span><span class="symbol">:</span><span class="path">${this.cwd}</span><span class="symbol">$ </span>
      </span>
      <input type="text" class="terminal-input" autocomplete="off" spellcheck="false" autofocus>
    `;
    body.appendChild(line);
    const input = line.querySelector('.terminal-input');
    input.focus();
    body.scrollTop = body.scrollHeight;
  },

  attachEvents(winData) {
    const body = document.getElementById(`${winData.id}-body`);
    if (!body) return;
    void winData;

    body.addEventListener('click', () => {
      const inputs = body.querySelectorAll('.terminal-input');
      const last = inputs[inputs.length - 1];
      if (last) last.focus();
    });

    body.addEventListener('keydown', (e) => {
      const input = e.target;
      if (!input.classList.contains('terminal-input')) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = input.value.trim();
        input.disabled = true;
        const promptSpan = input.previousElementSibling;
        const cmdLine = document.createElement('div');
        cmdLine.className = 'terminal-line';
        cmdLine.innerHTML = promptSpan.outerHTML + ' ' + cmd;
        input.parentElement.removeChild(input);
        promptSpan.replaceWith(cmdLine);
        body.scrollTop = body.scrollHeight;

        this.executeCommand(cmd, body);
        this.newPrompt(body);
      }
    });
  },

  executeCommand(cmd, body) {
    if (!cmd) return;
    const parts = cmd.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        this.printLine(body, 'Available commands:');
        this.printLine(body, '  help       - Show this help message');
        this.printLine(body, '  ls         - List directory contents');
        this.printLine(body, '  pwd        - Print working directory');
        this.printLine(body, '  cd         - Change directory');
        this.printLine(body, '  cat        - Display file contents');
        this.printLine(body, '  echo       - Print text');
        this.printLine(body, '  date       - Show current date and time');
        this.printLine(body, '  whoami     - Print current user');
        this.printLine(body, '  uname      - System information');
        this.printLine(body, '  clear      - Clear the screen');
        this.printLine(body, '  open       - Open an application');
        this.printLine(body, '  history    - Show command history');
        this.printLine(body, '  neofetch   - System info display');
        this.printLine(body, '  sudo       - Run as superuser');
        this.printLine(body, '  man        - Manual pages');
        break;

      case 'ls':
        this.ls(body);
        break;

      case 'pwd':
        this.printLine(body, '/Users/mike/' + (this.cwd === '~' ? '' : this.cwd.replace('~/', '')));
        break;

      case 'cd':
        this.cd(args, body);
        break;

      case 'cat':
        this.cat(args, body);
        break;

      case 'echo':
        this.printLine(body, args.join(' '));
        break;

      case 'date':
        this.printLine(body, new Date().toString());
        break;

      case 'whoami':
        this.printLine(body, 'mike');
        break;

      case 'uname':
        if (args[0] === '-a') {
          this.printLine(body, 'Darwin Mike-MacBook.local 26.0.0 Darwin Kernel Version 26.0.0 x86_64');
        } else {
          this.printLine(body, 'Darwin');
        }
        break;

      case 'clear':
        body.innerHTML = '';
        break;

      case 'open':
        this.openApp(args, body);
        break;

      case 'neofetch':
        this.printLine(body, '         .:"""".      Mike@MacBook');
        this.printLine(body, '        / _  _ \\     -----------');
        this.printLine(body, '       | (_)(_) |    OS: macOS Tahoe 26.0');
        this.printLine(body, '       |  __/  |     Host: MacBook Pro M3');
        this.printLine(body, '        \\_____/      Kernel: Darwin 26.0');
        this.printLine(body, '                     Shell: zsh 5.9');
        this.printLine(body, '                     CPU: Apple M3 Pro');
        this.printLine(body, '                     Memory: 16GB');
        this.printLine(body, '                     Resolution: ' + window.screen.width + 'x' + window.screen.height);
        this.printLine(body, '                     WM: Liquid Glass');
        this.printLine(body, '                     Terminal: Terminal.app');
        break;

      case 'sudo':
        this.printLine(body, 'Password: ');
        this.printLine(body, 'Sorry, try again.');
        break;

      case 'man':
        if (args[0]) {
          this.printLine(body, `MAN(1)              User Commands             ${args[0].toUpperCase()}(1)`);
          this.printLine(body, '');
          this.printLine(body, `NAME`);
          this.printLine(body, `   ${args[0]} - manual page for ${args[0]}`);
          this.printLine(body, '');
          this.printLine(body, `SYNOPSIS`);
          this.printLine(body, `   ${args[0]} [OPTION]...`);
          this.printLine(body, '');
          this.printLine(body, `DESCRIPTION`);
          this.printLine(body, `   The ${args[0]} command. This is a simulated man page.`);
          this.printLine(body, `   Use 'help' for available commands.`);
        } else {
          this.printLine(body, 'What manual page do you want?');
        }
        break;

      default:
        this.printLine(body, `zsh: command not found: ${command}`);
        break;
    }
  },

  ls(body) {
    const items = Finder.fileSystem[this.currentPathName()] || Finder.fileSystem['Home'] || [];
    if (items.length === 0) {
      this.printLine(body, '');
      return;
    }
    const colored = items.map(i => {
      if (i.type === 'folder') return `<span style="color:#64d2ff;">${i.name}/</span>`;
      if (i.type === 'app') return `<span style="color:#30d158;">${i.name}.app</span>`;
      if (i.type === 'image') return `<span style="color:#ffd60a;">${i.name}</span>`;
      return i.name;
    });
    this.printLine(body, colored.join('   '));
  },

  currentPathName() {
    if (this.cwd === '~') return 'Home';
    if (this.cwd === '~/Desktop') return 'Desktop';
    if (this.cwd === '~/Documents') return 'Documents';
    if (this.cwd === '~/Downloads') return 'Downloads';
    if (this.cwd === '~/Pictures') return 'Pictures';
    if (this.cwd === '~/Applications') return 'Applications';
    return 'Home';
  },

  cd(args, body) {
    if (!args[0] || args[0] === '~' || args[0] === '/') {
      this.cwd = '~';
    } else if (args[0] === '..') {
      if (this.cwd !== '~') {
        const parts = this.cwd.split('/');
        parts.pop();
        this.cwd = parts.join('/') || '~';
      }
    } else {
      const target = args[0].replace('~/', '').replace('~', '');
      const pathName = this.capitalize(target);
      if (Finder.fileSystem[pathName]) {
        this.cwd = '~/' + target;
      } else {
        this.printLine(body, `cd: no such file or directory: ${args[0]}`);
      }
    }
  },

  cat(args, body) {
    if (!args[0]) {
      this.printLine(body, 'Usage: cat <filename>');
      return;
    }
    const note = Notes.notes.find(n => n.title.toLowerCase().includes(args[0].toLowerCase()));
    if (note) {
      this.printLine(body, note.content);
      return;
    }
    this.printLine(body, `cat: ${args[0]}: No such file or directory`);
  },

  openApp(args, body) {
    if (!args[0]) {
      this.printLine(body, 'Usage: open <appname>');
      return;
    }
    const name = args[0].toLowerCase().replace('.app', '');
    const appId = Object.keys(Tahoe.state.apps).find(id =>
      id.toLowerCase() === name || Tahoe.state.apps[id].name.toLowerCase() === name
    );
    if (appId && appId !== 'trash' && appId !== 'launchpad') {
      Tahoe.launchApp(appId);
      this.printLine(body, `Opening ${Tahoe.state.apps[appId].name}...`);
    } else {
      this.printLine(body, `The file ${args[0]} does not exist.`);
    }
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
};
