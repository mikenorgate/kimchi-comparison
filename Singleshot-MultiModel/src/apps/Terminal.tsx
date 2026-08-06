import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useOSStore } from '../store/osStore';

/**
 * Mock file system used by Terminal commands. Each path maps to a
 * directory containing child entries (directories + files). Files hold
 * string content that `cat` prints. This is independent of Finder's
 * mock FS because Finder's mock FS is delivered in Chunk 5 and lives
 * outside of this component.
 */

export interface FsNode {
  kind: 'dir' | 'file';
  /** File contents (empty string for directories). */
  content?: string;
  /** Children for directories, keyed by basename. */
  children?: Record<string, FsNode>;
}

function dir(children: Record<string, FsNode>): FsNode {
  return { kind: 'dir', children };
}
function file(content: string): FsNode {
  return { kind: 'file', content };
}

const MOCK_FS: FsNode = dir({
  Applications: dir({
    'Safari.app': dir({}),
    'Terminal.app': dir({}),
    'Notes.app': dir({}),
    'Calculator.app': dir({}),
    'System Settings.app': dir({}),
  }),
  Users: dir({
    mike: dir({
      Desktop: dir({
        'welcome.txt': file('Welcome to Tahoe!\n'),
      }),
      Documents: dir({
        'notes.txt': file(
          'Tahoe project notes\n' +
            '-------------------\n' +
            '- Mock file system\n' +
            '- In-memory state only\n' +
            '- Refresh to reset\n',
        ),
        'project.md': file(
          '# Tahoe\n\nA browser-based recreation of macOS 26.\n',
        ),
        'todo.txt': file('- polish\n- test\n- ship\n'),
      }),
      Downloads: dir({}),
      Pictures: dir({}),
      Movies: dir({}),
      Music: dir({}),
      '.bashrc': file('export PS1="\\u@\\h:\\w$ "\n'),
      '.zshrc': file('# Tahoe default shell profile\n'),
    }),
  }),
  System: dir({
    Library: dir({}),
  }),
  etc: dir({
    'hosts': file('127.0.0.1   localhost\n255.255.255.255 broadcasthost\n'),
  }),
  var: dir({
    log: dir({}),
  }),
  tmp: dir({}),
});

/** Resolves an absolute or relative path against the cwd within the mock FS. */
function resolvePath(cwd: string, target: string): string {
  if (target.startsWith('/')) return normalizePath(target);
  if (target === '~') return '/Users/mike';
  if (target.startsWith('~/')) return normalizePath(`/Users/mike/${target.slice(2)}`);
  return normalizePath(`${cwd === '/' ? '' : cwd}/${target}`);
}

function normalizePath(path: string): string {
  const parts: string[] = [];
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      parts.pop();
      continue;
    }
    parts.push(segment);
  }
  return `/${parts.join('/')}`;
}

function getNode(fs: FsNode, path: string): FsNode | null {
  if (path === '/') return fs;
  const segments = path.split('/').filter(Boolean);
  let current: FsNode = fs;
  for (const seg of segments) {
    if (current.kind !== 'dir' || !current.children) return null;
    const next = current.children[seg];
    if (!next) return null;
    current = next;
  }
  return current;
}

function listDirectory(node: FsNode): string[] {
  if (node.kind !== 'dir' || !node.children) return [];
  return Object.entries(node.children).map(([name, child]) =>
    child.kind === 'dir' ? `${name}/` : name,
  );
}

interface TerminalLine {
  id: number;
  /** "input", "output", or "system". */
  kind: 'input' | 'output' | 'system';
  text: string;
}

let lineIdCounter = 0;
function nextLineId(): number {
  lineIdCounter += 1;
  return lineIdCounter;
}

const PROMPT_USER = 'mike';
const PROMPT_HOST = 'tahoe';
const HOME_DIR = '/Users/mike';

function buildPrompt(cwd: string): string {
  const display = cwd === HOME_DIR ? '~' : cwd === '/' ? '/' : cwd;
  return `${PROMPT_USER}@${PROMPT_HOST}:${display}$`;
}

const HELP_TEXT = [
  'Available commands:',
  '  help                 Show this help text',
  '  ls [path]            List directory contents',
  '  cd <path>            Change directory (~ and .. supported)',
  '  pwd                  Print working directory',
  '  clear                Clear the screen',
  '  open <app>           Open a registered app (e.g. open Safari)',
  '  whoami               Print the current user',
  '  date                 Print the current date and time',
  '  echo <text>          Print text',
  '  cat <file>           Print a file\'s contents',
].join('\n');

const APP_ALIASES: Record<string, string> = {
  safari: 'safari',
  terminal: 'terminal',
  notes: 'notes',
  calculator: 'calculator',
  calc: 'calculator',
  settings: 'system-settings',
  'system-settings': 'system-settings',
  'system settings': 'system-settings',
  finder: 'finder',
  preview: 'finder',
};

/**
 * Terminal app — a single scrollback buffer with a command parser and
 * mock file system. Up/Down arrow keys cycle through command history.
 *
 * The prompt is rendered as the last "input" line; the input field is a
 * transparent overlay so the text appears inline with the scrollback.
 */
export function Terminal({ windowId }: { windowId: string }): JSX.Element {
  const apps = useOSStore((state) => state.apps);
  const launchApp = useOSStore((state) => state.launchApp);

  const [cwd, setCwd] = useState<string>(HOME_DIR);
  const [history, setHistory] = useState<string[]>([]);
  const [draft, setDraft] = useState<string>('');
  // -1 = current draft; otherwise an index into `history`. Stored in a ref
  // because we only ever need the current value inside the setter.
  const historyIndexRef = useRef<number>(-1);
  const [draftSnapshot, setDraftSnapshot] = useState<string>('');
  const [lines, setLines] = useState<TerminalLine[]>(() => [
    { id: nextLineId(), kind: 'system', text: 'Last login: ' + new Date().toString() },
    { id: nextLineId(), kind: 'system', text: "Welcome to Tahoe Terminal. Type 'help' for commands." },
  ]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const prompt = useMemo(() => buildPrompt(cwd), [cwd]);

  // Auto-scroll to bottom on new output.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus the input on click anywhere in the terminal body.
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the input focused when this window is mounted.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const appendOutput = useCallback((text: string) => {
    const parts = text.split('\n');
    setLines((current) => {
      const next: TerminalLine[] = [...current];
      for (const part of parts) {
        next.push({ id: nextLineId(), kind: 'output', text: part });
      }
      return next;
    });
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      // Echo the input line.
      setLines((current) => [
        ...current,
        { id: nextLineId(), kind: 'input', text: `${prompt} ${raw}` },
      ]);

      if (trimmed.length === 0) {
        return;
      }

      // Split into command + rest.
      const spaceIdx = trimmed.indexOf(' ');
      const cmd = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();
      const rest = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim();

      switch (cmd) {
        case 'help': {
          appendOutput(HELP_TEXT);
          return;
        }
        case 'pwd': {
          appendOutput(cwd);
          return;
        }
        case 'whoami': {
          appendOutput(PROMPT_USER);
          return;
        }
        case 'date': {
          appendOutput(new Date().toString());
          return;
        }
        case 'echo': {
          appendOutput(rest);
          return;
        }
        case 'clear': {
          setLines([]);
          return;
        }
        case 'ls': {
          const target = rest.length === 0 ? cwd : resolvePath(cwd, rest);
          const node = getNode(MOCK_FS, target);
          if (!node) {
            appendOutput(`ls: ${target}: No such file or directory`);
            return;
          }
          if (node.kind !== 'dir') {
            appendOutput(node.kind === 'file' ? target.split('/').pop() ?? '' : '');
            return;
          }
          const entries = listDirectory(node);
          if (entries.length === 0) {
            // Empty directory → blank line (no output).
            return;
          }
          appendOutput(entries.join('  '));
          return;
        }
        case 'cd': {
          const target = rest.length === 0 ? HOME_DIR : resolvePath(cwd, rest);
          const node = getNode(MOCK_FS, target);
          if (!node) {
            appendOutput(`cd: no such file or directory: ${rest || target}`);
            return;
          }
          if (node.kind !== 'dir') {
            appendOutput(`cd: not a directory: ${rest || target}`);
            return;
          }
          setCwd(target);
          return;
        }
        case 'cat': {
          if (rest.length === 0) {
            appendOutput('cat: missing operand');
            return;
          }
          const target = resolvePath(cwd, rest);
          const node = getNode(MOCK_FS, target);
          if (!node) {
            appendOutput(`cat: ${rest}: No such file or directory`);
            return;
          }
          if (node.kind !== 'file') {
            appendOutput(`cat: ${rest}: Is a directory`);
            return;
          }
          appendOutput(node.content ?? '');
          return;
        }
        case 'open': {
          if (rest.length === 0) {
            appendOutput('open: usage: open <app>');
            return;
          }
          const alias = APP_ALIASES[rest.toLowerCase()] ?? rest.toLowerCase();
          const known = Boolean(apps[alias]);
          if (!known) {
            appendOutput(`open: cannot find app "${rest}"`);
            return;
          }
          launchApp(alias);
          appendOutput(`Opening ${alias}…`);
          return;
        }
        default: {
          appendOutput(`zsh: command not found: ${cmd}`);
        }
      }
    },
    [appendOutput, apps, cwd, launchApp, prompt],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = draft;
      setDraft('');
      historyIndexRef.current = -1;
      setDraftSnapshot('');
      if (value.trim().length > 0) {
        setHistory((current) => [...current, value]);
      }
      runCommand(value);
    },
    [draft, runCommand],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (history.length === 0) return;
        const current = historyIndexRef.current;
        let snapshot = draftSnapshot;
        if (current === -1) {
          snapshot = draft;
          setDraftSnapshot(snapshot);
        }
        const nextIdx = current === -1 ? history.length - 1 : Math.max(0, current - 1);
        historyIndexRef.current = nextIdx;
        const value = history[nextIdx];
        if (value !== undefined) setDraft(value);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const current = historyIndexRef.current;
        if (current === -1) return;
        if (current === history.length - 1) {
          // Past the oldest entry — restore the captured draft.
          setDraft(draftSnapshot);
          setDraftSnapshot('');
          historyIndexRef.current = -1;
          return;
        }
        const nextIdx = current + 1;
        historyIndexRef.current = nextIdx;
        const value = history[nextIdx];
        if (value !== undefined) setDraft(value);
      } else if (event.key === 'l' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setLines([]);
      }
    },
    [draft, draftSnapshot, history],
  );

  return (
    <div
      role="application"
      aria-label="Terminal"
      onClick={focusInput}
      style={{
        height: '100%',
        background: 'rgba(15, 15, 18, 0.96)',
        color: '#f5f5f7',
        fontFamily:
          '"SF Mono", Menlo, Monaco, "Cascadia Mono", "Roboto Mono", Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.4,
        padding: '12px 14px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'text',
      }}
    >
      <div
        ref={scrollRef}
        data-window-id={windowId}
        style={{
          flex: 1,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              color:
                line.kind === 'system'
                  ? '#8e8e93'
                  : line.kind === 'input'
                  ? '#f5f5f7'
                  : '#d1d1d6',
              minHeight: '1.4em',
            }}
          >
            {line.kind === 'input' ? <span style={{ color: '#5ac8fa' }}>{line.text}</span> : line.text}
          </div>
        ))}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ color: '#5ac8fa', whiteSpace: 'pre' }}>{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Terminal input"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f5f5f7',
              font: 'inherit',
              padding: 0,
            }}
          />
        </form>
      </div>
    </div>
  );
}

export default Terminal;
