'use client';

import { useEffect, useRef, useState } from 'react';

interface Line {
  id: string;
  text: string;
  type: 'input' | 'output' | 'error';
}

const COMMANDS: Record<string, (args: string[]) => string | string[]> = {
  help: () =>
    'Available commands: help, echo, date, whoami, pwd, ls, uname, clear',
  echo: (args) => args.join(' ') || '',
  date: () => new Date().toString(),
  whoami: () => 'tahoe-user',
  pwd: () => '/Users/tahoe-user',
  ls: () => ['Documents', 'Downloads', 'Desktop', 'Applications'],
  uname: () => 'Darwin Tahoe.local 24.0.0 arm64',
};

function runCommand(raw: string): { type: 'output' | 'error'; lines: string[] } {
  const trimmed = raw.trim();
  if (!trimmed) return { type: 'output', lines: [] };

  const [name, ...args] = trimmed.split(/\s+/);

  if (name === 'clear') {
    return { type: 'output', lines: ['__CLEAR__'] };
  }

  const handler = COMMANDS[name];
  if (!handler) {
    return { type: 'error', lines: [`zsh: command not found: ${name}`] };
  }

  const result = handler(args);
  return { type: 'output', lines: Array.isArray(result) ? result : [result] };
}

export function Terminal() {
  const [history, setHistory] = useState<Line[]>([
    { id: 'banner', text: 'Tahoe Shell — type "help" for available commands.', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      if (typeof el.scrollTo === 'function') {
        el.scrollTo({ top: el.scrollHeight });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [history]);

  const submitCommand = () => {
    const command = input;
    setInput('');

    setHistory((prev) => [
      ...prev,
      { id: `in-${Date.now()}`, text: `$ ${command}`, type: 'input' },
    ]);

    const result = runCommand(command);

    if (result.lines.length === 1 && result.lines[0] === '__CLEAR__') {
      setHistory([]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      ...result.lines.map((line, i) => ({
        id: `out-${Date.now()}-${i}`,
        text: line,
        type: result.type,
      })),
    ]);
  };

  return (
    <div
      className="flex h-full w-full flex-col p-3 font-mono text-sm"
      style={{ background: '#0d0d0d', color: '#f0f0f0' }}
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal"
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto space-y-0.5 pr-2"
        data-testid="terminal-scrollback"
      >
        {history.map((line) => (
          <div
            key={line.id}
            data-testid={`terminal-line-${line.type}`}
            className={`whitespace-pre-wrap ${
              line.type === 'input'
                ? 'text-green-400'
                : line.type === 'error'
                ? 'text-red-400'
                : 'text-gray-200'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitCommand();
        }}
        className="mt-2 flex items-center gap-2"
        data-testid="terminal-form"
      >
        <span className="text-green-400">$</span>
        <input
          ref={inputRef}
          data-testid="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          style={{ color: '#f0f0f0' }}
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
}
