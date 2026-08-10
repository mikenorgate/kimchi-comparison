import { useState, useRef, useEffect } from 'react';
import { useFSStore } from '@/store/fs';

interface Line { type: 'input' | 'output'; text: string; }

export function Terminal({ appId: _appId }: { appId: string }) {
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: 'Last login: ' + new Date().toLocaleString() },
    { type: 'output', text: 'Welcome to macOS Tahoe Terminal (mock)' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    let output = '';

    switch (command) {
      case 'ls': {
        const children = useFSStore.getState().getChildren(cwd);
        output = children.map(c => c.type === 'folder' ? c.name + '/' : c.name).join('  ') || '(empty)';
        break;
      }
      case 'pwd':
        output = cwd;
        break;
      case 'cd': {
        if (!args[0] || args[0] === '~') { setCwd('/'); break; }
        const target = args[0].startsWith('/') ? args[0] : (cwd === '/' ? '/' + args[0] : cwd + '/' + args[0]);
        const cleanTarget = target.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        const node = useFSStore.getState().getNode(cleanTarget);
        if (node && node.type === 'folder') { setCwd(node.id); }
        else if (node) { output = `cd: not a directory: ${args[0]}`; }
        else { output = `cd: no such file or directory: ${args[0]}`; }
        break;
      }
      case 'echo':
        output = args.join(' ');
        break;
      case 'help':
        output = 'Available commands: ls, cd, pwd, echo, help, clear';
        break;
      case 'clear':
        setLines([]);
        setInput('');
        return;
      case '':
        break;
      default:
        output = `command not found: ${command}`;
    }

    setLines((prev) => [
      ...prev,
      { type: 'input', text: `user@macbook ${cwd} % ${cmd}` },
      ...(output ? [{ type: 'output' as const, text: output }] : []),
    ]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/90 dark:bg-black/95" data-testid="terminal-root" onClick={() => inputRef.current?.focus()}>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-green-400" ref={scrollRef} data-testid="terminal-output">
        {lines.map((line, i) => (
          <div key={i} className={line.type === 'input' ? 'text-white/60' : 'text-green-400'}>{line.text}</div>
        ))}
        <div className="flex items-center text-white/60">
          <span>user@macbook {cwd} %&nbsp;</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCommand(input); }}
            autoFocus
            data-testid="terminal-input"
          />
        </div>
      </div>
    </div>
  );
}
