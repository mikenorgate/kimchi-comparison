import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDataStore } from '../stores/appDataStore';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useWindowStore } from '../stores/windowStore';
import {
  executeCommand,
  nodeIdToPath,
  type CommandLine,
} from '../lib/terminalCommands';

interface TerminalProps {
  windowId: string;
}

export default function Terminal({ windowId }: TerminalProps) {
  const history = useAppDataStore((s) => s.terminalHistory);
  const appendTerminal = useAppDataStore((s) => s.appendTerminal);
  const clearTerminal = useAppDataStore((s) => s.clearTerminal);
  const terminalCwd = useAppDataStore((s) => s.terminalCwd);
  const setTerminalCwd = useAppDataStore((s) => s.setTerminalCwd);

  const nodes = useFileSystemStore((s) => s.nodes);
  const getNode = useFileSystemStore((s) => s.getNode);
  const getChildren = useFileSystemStore((s) => s.getChildren);
  const createFolder = useFileSystemStore((s) => s.createFolder);
  const createFile = useFileSystemStore((s) => s.createFile);

  const openWindow = useWindowStore((s) => s.openWindow);
  const setTitle = useWindowStore((s) => s.setTitle);

  const [input, setInput] = useState('');
  // Index into the command log for up-arrow recall. -1 means "no history
  // navigation in progress; typing fresh text".
  const [historyIndex, setHistoryIndex] = useState(-1);
  // Holds the in-flight text the user was typing before pressing Up, so
  // Down-arrow can restore it.
  const draftRef = useRef<string>('');

  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // The command log is just the list of input lines from the persistent
  // store. Multiple terminals share this list, which is the standard shell
  // behaviour — `~/.zsh_history` isn't per-window.
  const commandLog = useMemo(
    () => history.filter((l) => l.type === 'input').map((l) => l.text),
    [history],
  );

  // Auto-scroll to bottom whenever new output is rendered.
  useEffect(() => {
    const node = outputRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [history]);

  // Make sure the title reflects what the user is doing.
  useEffect(() => {
    const cwdNode = getNode(terminalCwd);
    if (!cwdNode) return;
    setTitle(windowId, `Terminal — ${nodeIdToPath(terminalCwd, nodes)}`);
  }, [terminalCwd, getNode, nodes, setTitle, windowId]);

  // Keep focus on the prompt whenever the user clicks inside the window.
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const cwdNode = getNode(terminalCwd);
  const cwdPath = cwdNode ? nodeIdToPath(terminalCwd, nodes) : '/Users/mike';

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw;
      // Always echo the typed command in the output so the transcript is
      // readable, even for `clear` and unknown commands.
      if (trimmed) {
        appendTerminal({ type: 'input', text: trimmed });
      }

      if (!cwdNode) {
        appendTerminal({ type: 'error', text: 'pwd: unknown directory' });
        setInput('');
        setHistoryIndex(-1);
        draftRef.current = '';
        return;
      }

      const result = executeCommand(trimmed, {
        cwd: cwdNode,
        cwdId: terminalCwd,
        nodes,
        getNode,
        getChildren,
        createFolder,
        createFile,
      });

      if (result.clearHistory) {
        clearTerminal();
      } else {
        for (const line of result.lines) {
          appendTerminal({ type: line.type, text: line.text });
        }
      }

      if (result.newCwdId && result.newCwdId !== terminalCwd) {
        setTerminalCwd(result.newCwdId);
      }

      setInput('');
      // History index resets after a new command — this is the standard
      // shell behaviour and what the spec requires.
      setHistoryIndex(-1);
      draftRef.current = '';
    },
    [
      appendTerminal,
      clearTerminal,
      createFile,
      createFolder,
      cwdNode,
      getChildren,
      getNode,
      nodes,
      setTerminalCwd,
      terminalCwd,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runCommand(input);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandLog.length === 0) return;
        setHistoryIndex((idx) => {
          // Going up from the live draft (-1) snapshots whatever we're
          // currently typing so Down can restore it.
          if (idx === -1) {
            draftRef.current = input;
            // Newest entry is at the end of the log.
            const next = commandLog.length - 1;
            setInput(commandLog[next]);
            return next;
          }
          if (idx === 0) return idx; // Already at oldest entry.
          const next = idx - 1;
          setInput(commandLog[next]);
          return next;
        });
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIndex((idx) => {
          if (idx === -1) return -1;
          const next = idx + 1;
          if (next >= commandLog.length) {
            // Past the newest entry — restore the draft and exit history mode.
            setInput(draftRef.current);
            draftRef.current = '';
            return -1;
          }
          setInput(commandLog[next]);
          return next;
        });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        clearTerminal();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        // Bail out of the current input without running anything.
        if (input) {
          e.preventDefault();
          appendTerminal({ type: 'input', text: input });
          setInput('');
          setHistoryIndex(-1);
          draftRef.current = '';
        }
        return;
      }
    },
    [appendTerminal, clearTerminal, commandLog, input, runCommand],
  );

  // Wire menu actions to a global handler so the Shell menu in the menu bar
  // can ask us to open a new window or clear the buffer.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ windowId: string; action: string }>).detail;
      if (!detail || detail.windowId !== windowId) return;
      switch (detail.action) {
        case 'new-window':
          openWindow('terminal');
          return;
        case 'clear':
          clearTerminal();
          return;
        case 'focus':
          focusInput();
          return;
        default:
          return;
      }
    };
    document.addEventListener('terminal:menu-action', handler as EventListener);
    return () => document.removeEventListener('terminal:menu-action', handler as EventListener);
  }, [clearTerminal, focusInput, openWindow, windowId]);

  return (
    <div
      data-testid="terminal"
      data-window-id={windowId}
      onClick={focusInput}
      className="flex h-full flex-col bg-black text-green-200 font-mono text-[13px] leading-relaxed select-text"
    >
      <div
        ref={outputRef}
        data-testid="terminal-output"
        className="flex-1 overflow-y-auto px-3 py-2 whitespace-pre-wrap break-words"
      >
        {history.length === 0 && (
          <div data-testid="terminal-welcome" className="text-green-300/80">
            Tahoe Terminal — type `help` for available commands.
          </div>
        )}
        {history.map((entry, idx) => {
          const type = entry.type as CommandLine['type'];
          return (
            <div
              key={entry.id ?? idx}
              data-testid={`terminal-line-${type}`}
              className={
                type === 'error'
                  ? 'text-red-400'
                  : type === 'input'
                    ? 'text-white'
                    : 'text-green-200'
              }
            >
              {type === 'input' ? (
                <span>
                  <span data-testid="terminal-prompt-prefix" className="text-cyan-400">
                    mike@tahoe
                  </span>
                  <span className="text-green-300">:</span>
                  <span data-testid="terminal-prompt-path" className="text-blue-300">
                    {cwdPath}
                  </span>
                  <span className="text-green-300">$ </span>
                  <span>{entry.text}</span>
                </span>
              ) : (
                entry.text
              )}
            </div>
          );
        })}
      </div>
      <div
        data-testid="terminal-input-row"
        className="flex items-center gap-1 border-t border-green-900/40 px-3 py-1.5"
      >
        <span className="text-cyan-400">mike@tahoe</span>
        <span className="text-green-300">:</span>
        <span data-testid="terminal-prompt" className="text-blue-300">
          {cwdPath}
        </span>
        <span className="text-green-300">$&nbsp;</span>
        <input
          ref={inputRef}
          data-testid="terminal-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Typing invalidates any in-progress history navigation.
            if (historyIndex !== -1) {
              setHistoryIndex(-1);
              draftRef.current = '';
            }
          }}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent text-white outline-none border-none"
          aria-label="Terminal prompt"
        />
      </div>
    </div>
  );
}
