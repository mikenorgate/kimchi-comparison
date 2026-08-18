/**
 * Pure logic for the macOS-style Terminal window.
 *
 * This module owns the **state machine** that drives the simulated
 * shell. It exports plain immutable {@link TerminalState} snapshots
 * plus a small set of pure reducer-style helpers:
 *
 *   - {@link processCommand} turns a raw command line into one or
 *     more scrollback entries (echo + response).
 *   - {@link submit}, {@link setDraft}, {@link historyPrev},
 *     {@link historyNext}, and {@link clearTerminal} all take a
 *     state and return a brand-new state, so the React component
 *     can rely on `useState` / `useReducer` semantics without
 *     having to reason about partial mutation.
 *
 * The React component (`Terminal.tsx`) owns the **presentation**:
 * it maps user events (keystrokes, Enter, ArrowUp/Down) to calls
 * into the helpers below and renders the resulting scrollback.
 *
 * Behavioural notes:
 * - Commands are matched case-insensitively; arguments preserve
 *   their original casing.
 * - The `clear` command empties the scrollback but keeps the
 *   current draft and history intact — same behaviour as the real
 *   Terminal.
 * - History navigation follows the conventional readline/ksh
 *   behaviour: `ArrowUp` recurses backward through the history
 *   stack; `ArrowDown` recurses forward and "drops off the end"
 *   into an empty draft.
 * - Unknown commands echo back the input prefixed with the prompt
 *   and append a `command not found` style error line.
 */

/** Prompt shown at the start of every input line. */
export const TERMINAL_PROMPT = "user@macbook ~ %";

/** The current working directory reported by `pwd`. */
export const TERMINAL_PWD = "/Users/user";

/** Reported by `whoami`. */
export const TERMINAL_USER = "user";

/** Reported hostname in the prompt. */
export const TERMINAL_HOST = "macbook";

/** Maximum scrollback entries kept in memory. Older entries are
 *  dropped to keep the DOM bounded. Matches `Terminal.tsx`'s
 *  internal cap so the logic and UI agree. */
export const TERMINAL_MAX_SCROLLBACK = 500;

/** Set of supported command names. `processCommand` only special-
 *  cases commands in this set; everything else gets the
 *  "command not found" treatment. */
export const TERMINAL_COMMANDS = [
  "help",
  "clear",
  "date",
  "whoami",
  "pwd",
  "ls",
  "echo",
  "history",
  "exit",
] as const;

/** Union of supported command names. */
export type TerminalCommand = (typeof TERMINAL_COMMANDS)[number];

/** Classification of a scrollback entry. Drives the CSS class the
 *  UI applies so input vs. output vs. error lines can be styled
 *  differently. */
export type TerminalEntryKind = "input" | "output" | "error" | "system";

/** A single line in the terminal scrollback. */
export interface TerminalEntry {
  /** Monotonically increasing id so React can key entries
   *  stably across re-renders. */
  readonly id: number;
  /** Which kind of entry this is. */
  readonly kind: TerminalEntryKind;
  /** The text to render. Multi-line output is represented as a
   *  single entry with embedded `\n` characters — the UI splits
   *  it into separate visual lines. */
  readonly text: string;
  /** Optional timestamp (ISO string). Only set on output lines
   *  produced by `date` etc.; the input echo uses null so the
   *  prompt area stays compact. */
  readonly timestamp: string | null;
}

/** Snapshot of the terminal at one point in time. */
export interface TerminalState {
  /** Every line currently in the scrollback, oldest first. */
  readonly entries: readonly TerminalEntry[];
  /** History of submitted commands (deduplicated consecutive
   *  repeats, like bash). */
  readonly history: readonly string[];
  /** Index into `history` for ArrowUp/Down navigation.
   *  - `null` when not navigating (draft holds the user's
   *    in-progress text).
   *  - Otherwise an offset from the end of the history array:
   *    `0` = most recent command, `1` = one before that, …
   *    Values >= `history.length` are clamped. */
  readonly historyIndex: number | null;
  /** The current input draft. */
  readonly draft: string;
  /** Monotonic counter used to mint unique {@link TerminalEntry}
   *  ids. Incremented on every entry created. */
  readonly nextId: number;
}

/** The initial state of a freshly opened terminal. Includes a
 *  single system banner so the window doesn't open to an empty
 *  pane. Exported as a frozen constant so tests can compare
 *  against it without rebuilding. */
export const initialTerminalState: TerminalState = Object.freeze({
  entries: Object.freeze([
    Object.freeze({
      id: 1,
      kind: "system" as TerminalEntryKind,
      text: `Welcome to Ferment Terminal v1.0. Type "help" for a list of commands.`,
      timestamp: null,
    }),
  ]) as readonly TerminalEntry[],
  history: Object.freeze([]) as readonly string[],
  historyIndex: null,
  draft: "",
  nextId: 2,
});

/** The monospace hostname + path fragment shown in the prompt. */
export function formatPrompt(): string {
  return TERMINAL_PROMPT;
}

/** Construct a new {@link TerminalEntry}. Internal helper that
 *  pulls the next id from the state — keeps the call sites short. */
function makeEntry(
  state: TerminalState,
  kind: TerminalEntryKind,
  text: string,
  timestamp: string | null
): { entry: TerminalEntry; nextId: number } {
  return {
    entry: {
      id: state.nextId,
      kind,
      text,
      timestamp,
    },
    nextId: state.nextId + 1,
  };
}

/** Append one entry to a state, returning a new state. */
function appendEntry(
  state: TerminalState,
  entry: TerminalEntry,
  nextId: number
): TerminalState {
  const entries = [...state.entries, entry];
  // Cap the scrollback so the DOM stays bounded. When we drop
  // entries we drop the oldest ones first — the system banner
  // is allowed to be evicted if the user runs enough commands.
  if (entries.length > TERMINAL_MAX_SCROLLBACK) {
    return {
      ...state,
      entries: entries.slice(entries.length - TERMINAL_MAX_SCROLLBACK),
      nextId,
    };
  }
  return { ...state, entries, nextId };
}

/** Split a raw command line into the command verb and the
 *  remainder. Returns `["", input]` when the line is empty so
 *  callers can handle whitespace uniformly. */
function splitCommand(input: string): { cmd: string; rest: string } {
  const trimmed = input.trim();
  if (trimmed === "") return { cmd: "", rest: "" };
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { cmd: trimmed, rest: "" };
  return {
    cmd: trimmed.slice(0, firstSpace),
    rest: trimmed.slice(firstSpace + 1).trim(),
  };
}

/** Build the multi-line help text shown by the `help` command. */
function helpText(): string {
  return [
    "Available commands:",
    "  help       Show this message",
    "  clear      Clear the scrollback",
    "  date       Print the current date and time",
    "  whoami     Print the current user",
    "  pwd        Print the working directory",
    "  ls         List files in the working directory",
    "  echo <msg> Print the given text",
    "  history    Show previously entered commands",
    "  exit       Close the terminal session",
  ].join("\n");
}

/** Build a fake directory listing for `ls`. Deterministic — the
 *  mock data is hard-coded so tests can assert against it. */
function lsText(): string {
  return ["Desktop", "Documents", "Downloads", "Library", "Movies", "Music", "Pictures", "Public"].join("\n");
}

/** Build a fake history listing for the `history` command. Lines
 *  are numbered 1-based to match `bash`. */
function historyText(history: readonly string[]): string {
  if (history.length === 0) return "(history is empty)";
  return history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join("\n");
}

/** Apply one terminal command to a state, returning the new
 *  state. Pure: never reads clocks other than `Date.now()` for
 *  the `date` command (callers can stub that for tests). */
export function processCommand(
  state: TerminalState,
  input: string,
  now: () => Date = () => new Date()
): TerminalState {
  const { cmd, rest } = splitCommand(input);

  // Empty line — just echo the prompt, no response.
  if (cmd === "") {
    const { entry, nextId } = makeEntry(state, "input", "", null);
    return appendEntry(state, entry, nextId);
  }

  // Echo the input line first. We always record what the user
  // typed, even when the command is unknown, so the scrollback
  // reads naturally.
  const echoed: TerminalEntry = {
    id: state.nextId,
    kind: "input",
    text: input,
    timestamp: null,
  };
  let working: TerminalState = appendEntry(state, echoed, state.nextId + 1);

  // Match the command verb case-insensitively, but preserve the
  // original casing for the echoed line above.
  const verb = cmd.toLowerCase();

  switch (verb) {
    case "help": {
      const { entry, nextId } = makeEntry(
        working,
        "output",
        helpText(),
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    case "clear":
      // Clear resets the scrollback but keeps the draft, history,
      // and historyIndex. We mint a new banner entry so the user
      // has visual confirmation that the clear succeeded and a
      // fresh id sequence for subsequent entries.
      working = {
        ...initialTerminalState,
        history: working.history,
        historyIndex: working.historyIndex,
        draft: working.draft,
      };
      break;
    case "date": {
      const { entry, nextId } = makeEntry(
        working,
        "output",
        formatDate(now()),
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    case "whoami": {
      const { entry, nextId } = makeEntry(
        working,
        "output",
        TERMINAL_USER,
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    case "pwd": {
      const { entry, nextId } = makeEntry(
        working,
        "output",
        TERMINAL_PWD,
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    case "ls": {
      const { entry, nextId } = makeEntry(
        working,
        "output",
        lsText(),
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    case "echo": {
      const { entry, nextId } = makeEntry(
        working,
        "output",
        rest,
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    case "history": {
      const { entry, nextId } = makeEntry(
        working,
        "output",
        historyText(working.history),
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    case "exit": {
      const { entry, nextId } = makeEntry(
        working,
        "system",
        "logout",
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
    default: {
      const { entry, nextId } = makeEntry(
        working,
        "error",
        `zsh: command not found: ${cmd}`,
        null
      );
      working = appendEntry(working, entry, nextId);
      break;
    }
  }

  // Append to history (deduplicate consecutive repeats so the
  // history list isn't dominated by the user mashing the up
  // arrow against the same command).
  const trimmed = input.trim();
  const last = working.history[working.history.length - 1];
  if (trimmed !== "" && trimmed !== last) {
    working = { ...working, history: [...working.history, trimmed] };
  }
  return working;
}

/** Submit the current draft as a command. Returns a new state
 *  with the command processed and the draft cleared. Resets
 *  history navigation. */
export function submit(state: TerminalState): TerminalState {
  const submitted = processCommand(state, state.draft);
  return {
    ...submitted,
    draft: "",
    historyIndex: null,
  };
}

/** Update the current input draft. Resets history navigation so
 *  the user can edit the recalled command before submitting it
 *  again — same as bash. */
export function setDraft(state: TerminalState, value: string): TerminalState {
  if (state.draft === value) return state;
  return { ...state, draft: value, historyIndex: null };
}

/** Move backward through the history stack. If not currently
 *  navigating, jump to the most recent entry. If already at the
 *  oldest entry, stay there. */
export function historyPrev(state: TerminalState): TerminalState {
  if (state.history.length === 0) return state;
  // Compute the absolute index into `history` we should land on.
  // When not navigating, "previous" means the most recent entry
  // (length - 1). When already navigating, decrement by one.
  const current = state.historyIndex ?? state.history.length;
  const target = Math.max(0, current - 1);
  const offset = state.history.length - 1 - target;
  return {
    ...state,
    historyIndex: offset,
    draft: state.history[target] ?? "",
  };
}

/** Move forward through the history stack. If not currently
 *  navigating, no-op (matches bash: ArrowDown only navigates
 *  after ArrowUp). When at the most recent entry, restore the
 *  empty draft and exit navigation. */
export function historyNext(state: TerminalState): TerminalState {
  if (state.historyIndex === null) return state;
  if (state.historyIndex === 0) {
    // About to step past the most recent entry — restore the
    // empty draft and exit navigation.
    return { ...state, historyIndex: null, draft: "" };
  }
  const target = state.history.length - 1 - (state.historyIndex - 1);
  return {
    ...state,
    historyIndex: state.historyIndex - 1,
    draft: state.history[target] ?? "",
  };
}

/** Clear the scrollback but keep history/draft intact. Equivalent
 *  to running the `clear` builtin but as a standalone action so
 *  the UI can wire a button (or test) directly. */
export function clearTerminal(state: TerminalState): TerminalState {
  return {
    ...initialTerminalState,
    history: state.history,
    historyIndex: state.historyIndex,
    draft: state.draft,
    nextId: state.nextId,
  };
}

/** Format the current date as a friendly string. Pinned to the
 *  `en-US` locale so tests can assert against a deterministic
 *  output shape (the actual day-of-month / time will still vary,
 *  but the surrounding text is stable). */
function formatDate(now: Date): string {
  const dateString = now.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return dateString;
}

/** Look up an entry by id. Helper used by the React component
 *  when it needs to find a specific entry's text for assertions. */
export function getEntry(
  state: TerminalState,
  id: number
): TerminalEntry | undefined {
  return state.entries.find((e) => e.id === id);
}

/** Count of entries currently in the scrollback. */
export function entryCount(state: TerminalState): number {
  return state.entries.length;
}
