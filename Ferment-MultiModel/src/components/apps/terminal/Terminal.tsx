"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  TERMINAL_PROMPT,
  clearTerminal,
  historyNext,
  historyPrev,
  initialTerminalState,
  setDraft,
  submit,
  type TerminalEntry,
  type TerminalState,
} from "./terminalLogic";

/**
 * Terminal window content.
 *
 * Renders a macOS-Terminal-inspired layout:
 *
 *   | scrollback (echo + output)              |
 *   | prompt + active input field (sticky)    |
 *
 * The component owns a single piece of state — a
 * {@link TerminalState} snapshot — and dispatches every user
 * action through the pure helpers in `terminalLogic.ts`. Because
 * the helpers are pure, the same state machine is unit-tested
 * independently of React in `terminalLogic.test.ts`; this file
 * only adds the keyboard, focus, and auto-scroll wiring.
 *
 * Behavioural notes:
 * - The input field is rendered as a plain `<input type="text">`
 *   so screen-reader users get the standard text-entry semantics
 *   for free. The visible "prompt" is decorative — only the
 *   content of the input matters.
 * - The whole Terminal is clickable; clicking anywhere inside the
 *   pane refocuses the hidden input so users don't have to hunt
 *   for the cursor.
 * - History navigation (`ArrowUp` / `ArrowDown`) is wired through
 *   the `historyPrev` / `historyNext` helpers; the input's
 *   `onKeyDown` is the single source of truth for these keys so
 *   we don't double-handle via a global listener.
 * - After every state change the scrollback auto-scrolls to the
 *   bottom so newly printed output stays visible. The scroll
 *   happens in a `useLayoutEffect` to avoid a one-frame flash
 *   where the new content is below the fold.
 * - The component is intentionally tolerant of re-renders from
 *   the window manager: nothing in here reads from the global
 *   clock except via the `date` command, which goes through
 *   `processCommand` and accepts an injectable `now` function
 *   for tests.
 */
export interface TerminalProps {
  /**
   * Optional starting state. Defaults to
   * {@link initialTerminalState}. Tests can pass a smaller
   * fixture to drive specific branches without rebuilding the
   * full initial state.
   */
  readonly initialState?: TerminalState;
}

export default function Terminal({
  initialState,
}: TerminalProps): JSX.Element {
  const [state, setState] = useState<TerminalState>(
    initialState ?? initialTerminalState
  );

  /** Ref to the underlying `<input>` so we can refocus it when
   *  the user clicks elsewhere in the Terminal pane. Typed as
   *  `RefObject<HTMLInputElement>` so it matches the React 18
   *  `ref={...}` prop type — `current` is implicitly `T | null`. */
  const inputRef = useRef<HTMLInputElement>(null);

  /** Ref to the scrollback container so we can auto-scroll to
   *  the bottom after every render. */
  const scrollbackRef = useRef<HTMLDivElement | null>(null);

  /**
   * Submit the current draft. Exposed as a callback so we can
   * pass it to the Enter-key handler in `handleKeyDown`.
   */
  const handleSubmit = useCallback(() => {
    setState((prev) => submit(prev));
  }, []);

  /**
   * Replace the current draft with `value`. Resets history
   * navigation so the user can edit the recalled command.
   */
  const handleChange = useCallback(
    (value: string) => {
      setState((prev) => setDraft(prev, value));
    },
    []
  );

  /**
   * Single keydown handler. Keeps all keyboard-to-state mapping
   * in one place so adding a new shortcut is a one-line change.
   * Returns early without `preventDefault` when we don't
   * recognise the key so the browser's default text-input
   * behaviour still applies (e.g. typing letters still works).
   */
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          handleSubmit();
          return;
        case "ArrowUp":
          event.preventDefault();
          setState((prev) => historyPrev(prev));
          return;
        case "ArrowDown":
          event.preventDefault();
          setState((prev) => historyNext(prev));
          return;
        case "l":
          // Cmd+L (or Ctrl+L) clears the scrollback, matching
          // macOS Terminal. We accept either modifier so Linux
          // / Windows keyboards work too.
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            setState((prev) => clearTerminal(prev));
          }
          return;
        default:
          return;
      }
    },
    [handleSubmit]
  );

  /**
   * Click anywhere in the Terminal pane → refocus the input so
   * the user can keep typing without manually clicking into the
   * field. We deliberately skip clicks that originated inside
   * the input itself (its native focus handler does the right
   * thing), and skip clicks on text-selection UI (which would
   * otherwise steal focus mid-selection).
   */
  const handlePaneClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.tagName === "INPUT") {
        return;
      }
      inputRef.current?.focus();
    },
    []
  );

  /**
   * Auto-scroll to the bottom of the scrollback whenever entries
   * change. `useLayoutEffect` runs synchronously after DOM
   * mutation but before paint, so the new content is already
   * in view when the user sees it.
   */
  useLayoutEffect(() => {
    const node = scrollbackRef.current;
    if (node === null) return;
    node.scrollTop = node.scrollHeight;
  }, [state.entries]);

  /**
   * Focus the input on mount so the terminal is immediately
   * ready to type into — matches macOS Terminal, where the
   * cursor lands in the input row without an extra click.
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const entryCount = state.entries.length;
  const isNavigating = state.historyIndex !== null;

  return (
    <div
      className="terminal"
      data-testid="terminal"
      data-entry-count={entryCount}
      data-history-length={state.history.length}
      data-history-index={state.historyIndex ?? ""}
      data-navigating={isNavigating ? "true" : "false"}
      data-draft={state.draft}
      onClick={handlePaneClick}
    >
      <div
        ref={scrollbackRef}
        className="terminal__scrollback"
        data-testid="terminal-scrollback"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {state.entries.map((entry) => (
          <Entry key={entry.id} entry={entry} prompt={TERMINAL_PROMPT} />
        ))}
      </div>
      <PromptLine
        prompt={TERMINAL_PROMPT}
        draft={state.draft}
        inputRef={inputRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scrollback entry
// ---------------------------------------------------------------------------

interface EntryProps {
  readonly entry: TerminalEntry;
  readonly prompt: string;
}

/**
 * One line in the scrollback. Input lines render with the prompt
 * prefix; output lines render as plain text; error lines render
 * with an error class; system lines render with a dim class.
 *
 * Multi-line output (e.g. `help`) is split into individual
 * `<div>` rows so each line scrolls independently and long
 * output doesn't break the flex layout.
 */
function Entry({ entry, prompt }: EntryProps): JSX.Element {
  const lines = entry.text.split("\n");
  const kindClass = `terminal__entry--${entry.kind}`;
  return (
    <div
      className={`terminal__entry ${kindClass}`}
      data-testid={`terminal-entry-${entry.id}`}
      data-entry-id={entry.id}
      data-entry-kind={entry.kind}
      data-entry-text={entry.text}
    >
      {entry.kind === "input"
        ? lines.map((line, i) => (
            <div
              key={i}
              className="terminal__line terminal__line--input"
              data-testid={`terminal-line-${entry.id}-${i}`}
            >
              <span
                className="terminal__prompt"
                data-testid="terminal-prompt-inline"
              >
                {prompt}
              </span>
              <span
                className="terminal__input-text"
                data-testid={`terminal-input-text-${entry.id}`}
              >
                {line}
              </span>
            </div>
          ))
        : lines.map((line, i) => (
            <div
              key={i}
              className={`terminal__line ${kindClass}`}
              data-testid={`terminal-line-${entry.id}-${i}`}
            >
              {line}
            </div>
          ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prompt line
// ---------------------------------------------------------------------------

interface PromptLineProps {
  readonly prompt: string;
  readonly draft: string;
  readonly inputRef: React.RefObject<HTMLInputElement>;
  readonly onChange: (value: string) => void;
  readonly onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
}

/**
 * The sticky prompt + input row at the bottom of the Terminal.
 * The prompt is decorative; only the input holds draft state.
 *
 * The input is always rendered (not conditional on
 * `state.historyIndex`) so the cursor stays in the same place
 * while navigating history — the visible value changes, but the
 * DOM element is stable so React doesn't recreate it on every
 * arrow press.
 */
function PromptLine({
  prompt,
  draft,
  inputRef,
  onChange,
  onKeyDown,
}: PromptLineProps): JSX.Element {
  /**
   * Wrapper around `onChange` that pulls the string value out
   * of the change event. Kept as a stable callback via
   * `useCallback` so the input doesn't re-render on every
   * parent render.
   */
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div
      className="terminal__prompt-line"
      data-testid="terminal-prompt-line"
    >
      <span
        className="terminal__prompt"
        data-testid="terminal-prompt"
      >
        {prompt}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="terminal__input"
        data-testid="terminal-input"
        value={draft}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Terminal input"
        // The input is small enough that one line is plenty; this
        // also prevents the input from grabbing the OS focus
        // ring when the user clicks elsewhere in the pane.
        size={1}
      />
    </div>
  );
}
