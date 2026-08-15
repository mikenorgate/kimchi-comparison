import { useState, useRef, useEffect } from 'react';
import './Terminal.css';

const COMMANDS = {
  help: () => `Available commands:
  help         Show this help message
  ls           List files in the current directory
  pwd          Print working directory
  whoami       Print current user
  date         Show current date and time
  uname        Show system information
  clear        Clear the terminal screen
  echo <text>  Print text to the terminal
  open <app>   Open a stock app (e.g., open safari)`,
  ls: () => `Applications    Documents    Downloads    Library    Pictures    Projects`,
  pwd: () => `/Users/developer`,
  whoami: () => `developer`,
  date: () => new Date().toString(),
  uname: () => `Darwin mbp.local 26.0.0 macOS Tahoe arm64`,
  echo: (args) => args.join(' '),
  open: (args) => {
    const app = args[0];
    if (!app) return 'Usage: open <app>';
    return `Opening ${app}...`;
  },
};

export default function Terminal() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Last login: ' + new Date().toLocaleString() },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (typeof scrollRef.current?.scrollIntoView === 'function') {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [history]);

  const runCommand = (raw) => {
    const trimmed = raw.trim();
    const args = trimmed.split(/\s+/);
    const command = args[0].toLowerCase();

    if (command === 'clear') {
      setHistory([{ type: 'prompt', cwd: '/Users/developer', input: '' }]);
      return;
    }

    let output = '';
    if (!command) {
      output = '';
    } else if (COMMANDS[command]) {
      output = COMMANDS[command](args.slice(1));
    } else {
      output = `zsh: command not found: ${command}`;
    }

    setHistory((prev) => {
      const next = [...prev];
      // Replace the current empty prompt with the executed one
      next[next.length - 1] = { type: 'prompt', cwd: '/Users/developer', input: raw };
      if (output) next.push({ type: 'output', text: output });
      next.push({ type: 'prompt', cwd: '/Users/developer', input: '' });
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runCommand(input);
    setInput('');
  };

  return (
    <div className="terminal" data-testid="terminal-app">
      <div className="terminal-screen" role="log" aria-live="polite">
        {history.map((entry, index) => (
          <div key={index} className={`terminal-line ${entry.type}`}>
            {entry.type === 'prompt' && (
              <>
                <span className="terminal-prompt">{entry.cwd} %</span>
                {entry.input && <span className="terminal-input"> {entry.input}</span>}
              </>
            )}
            {entry.type === 'output' && <pre className="terminal-output">{entry.text}</pre>}
            {entry.type === 'system' && <span className="terminal-system">{entry.text}</span>}
          </div>
        ))}
        <form className="terminal-line prompt" onSubmit={handleSubmit}>
          <span className="terminal-prompt">/Users/developer %</span>
          <input
            className="terminal-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            aria-label="Terminal command"
            spellCheck={false}
            autoComplete="off"
            data-testid="terminal-input"
          />
        </form>
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
