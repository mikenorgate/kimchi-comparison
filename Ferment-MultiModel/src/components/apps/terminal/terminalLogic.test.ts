import { describe, it, expect } from "vitest";
import {
  TERMINAL_COMMANDS,
  TERMINAL_HOST,
  TERMINAL_MAX_SCROLLBACK,
  TERMINAL_PROMPT,
  TERMINAL_PWD,
  TERMINAL_USER,
  clearTerminal,
  entryCount,
  formatPrompt,
  getEntry,
  historyNext,
  historyPrev,
  initialTerminalState,
  processCommand,
  setDraft,
  submit,
  type TerminalEntry,
} from "./terminalLogic";

/**
 * Convenience helper: submit a single command against a fresh
 * state and return the new state. Mirrors the user flow of
 * typing into the input and pressing Enter.
 */
function runCommand(input: string): ReturnType<typeof submit> {
  const state = setDraft(initialTerminalState, input);
  return submit(state);
}

/** A frozen fake date so the `date` command produces a
 *  deterministic output. */
const FROZEN_DATE = new Date("2024-06-15T14:30:00Z");

describe("terminalLogic — constants and initial state", () => {
  it("exposes the expected prompt", () => {
    expect(TERMINAL_PROMPT).toBe("user@macbook ~ %");
    expect(TERMINAL_HOST).toBe("macbook");
    expect(TERMINAL_USER).toBe("user");
    expect(TERMINAL_PWD).toBe("/Users/user");
    expect(formatPrompt()).toBe(TERMINAL_PROMPT);
  });

  it("exposes the supported command list", () => {
    expect(TERMINAL_COMMANDS).toContain("help");
    expect(TERMINAL_COMMANDS).toContain("clear");
    expect(TERMINAL_COMMANDS).toContain("date");
    expect(TERMINAL_COMMANDS).toContain("whoami");
    expect(TERMINAL_COMMANDS).toContain("pwd");
  });

  it("starts with a welcome banner entry", () => {
    expect(initialTerminalState.entries).toHaveLength(1);
    const banner = initialTerminalState.entries[0];
    expect(banner.kind).toBe("system");
    expect(banner.text).toMatch(/Welcome to Ferment Terminal/);
    expect(initialTerminalState.history).toHaveLength(0);
    expect(initialTerminalState.draft).toBe("");
    expect(initialTerminalState.historyIndex).toBeNull();
    expect(initialTerminalState.nextId).toBeGreaterThan(0);
  });

  it("exposes the initial state as a frozen constant", () => {
    expect(Object.isFrozen(initialTerminalState)).toBe(true);
    expect(Object.isFrozen(initialTerminalState.entries)).toBe(true);
  });
});

describe("terminalLogic — setDraft", () => {
  it("replaces the current draft", () => {
    const next = setDraft(initialTerminalState, "hello");
    expect(next.draft).toBe("hello");
    expect(next).not.toBe(initialTerminalState);
  });

  it("resets history navigation when the draft changes", () => {
    const seeded = historyPrev(
      submit(setDraft(initialTerminalState, "ls"))
    );
    expect(seeded.historyIndex).not.toBeNull();
    const next = setDraft(seeded, "l");
    expect(next.historyIndex).toBeNull();
    expect(next.draft).toBe("l");
  });

  it("returns the same reference when the draft is unchanged", () => {
    const seeded = setDraft(initialTerminalState, "ls");
    const next = setDraft(seeded, "ls");
    expect(next).toBe(seeded);
  });
});

describe("terminalLogic — processCommand and submit", () => {
  it("echoes a submitted command into the scrollback", () => {
    const state = runCommand("hello");
    const inputs = state.entries.filter((e) => e.kind === "input");
    expect(inputs.some((e) => e.text === "hello")).toBe(true);
    expect(state.draft).toBe("");
    expect(state.historyIndex).toBeNull();
  });

  it("records the submitted command in history", () => {
    const state = runCommand("ls -la");
    expect(state.history).toContain("ls -la");
  });

  it("deduplicates consecutive repeat submissions", () => {
    let state = initialTerminalState;
    state = submit(setDraft(state, "ls"));
    state = submit(setDraft(state, "ls"));
    state = submit(setDraft(state, "pwd"));
    state = submit(setDraft(state, "pwd"));
    expect(state.history).toEqual(["ls", "pwd"]);
  });

  it("treats a blank submission as a no-op input line", () => {
    const state = submit(setDraft(initialTerminalState, "   "));
    // The empty input line gets recorded but produces no output.
    const inputs = state.entries.filter((e) => e.kind === "input");
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    expect(state.history).toHaveLength(0);
  });

  it("does not mutate the input state", () => {
    const seeded = setDraft(initialTerminalState, "help");
    const snapshot = JSON.stringify(seeded);
    submit(seeded);
    expect(JSON.stringify(seeded)).toBe(snapshot);
  });
});

describe("terminalLogic — built-in commands", () => {
  it("help returns the help text", () => {
    const state = runCommand("help");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toMatch(/Available commands/);
    expect(last.text).toMatch(/help/);
    expect(last.text).toMatch(/clear/);
    expect(last.text).toMatch(/date/);
  });

  it("clear resets the scrollback but keeps history", () => {
    const afterHelp = runCommand("help");
    expect(afterHelp.entries.length).toBeGreaterThan(1);
    const afterClear = submit(setDraft(afterHelp, "clear"));
    // Welcome banner is regenerated; everything else is gone.
    expect(afterClear.entries).toHaveLength(1);
    expect(afterClear.entries[0].kind).toBe("system");
    // History is preserved across clear (and grows by one
    // because the `clear` command itself was submitted).
    expect(afterClear.history).toEqual([...afterHelp.history, "clear"]);
  });

  it("date returns a deterministic string for a frozen clock", () => {
    const state = processCommand(
      initialTerminalState,
      "date",
      () => FROZEN_DATE
    );
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text.length).toBeGreaterThan(0);
  });

  it("whoami returns the current user", () => {
    const state = runCommand("whoami");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toBe(TERMINAL_USER);
  });

  it("pwd returns the working directory", () => {
    const state = runCommand("pwd");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toBe(TERMINAL_PWD);
  });

  it("ls returns the mock directory listing", () => {
    const state = runCommand("ls");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toMatch(/Desktop/);
    expect(last.text).toMatch(/Documents/);
    expect(last.text).toMatch(/Pictures/);
  });

  it("echo prints its argument", () => {
    const state = runCommand("echo hello world");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toBe("hello world");
  });

  it("echo with no argument prints an empty line", () => {
    const state = runCommand("echo");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toBe("");
  });

  it("history lists previously submitted commands", () => {
    let state = initialTerminalState;
    state = submit(setDraft(state, "ls"));
    state = submit(setDraft(state, "pwd"));
    state = submit(setDraft(state, "history"));
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toMatch(/1\s+ls/);
    expect(last.text).toMatch(/2\s+pwd/);
  });

  it("history reports an empty list when nothing has been entered", () => {
    const state = runCommand("history");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("output");
    expect(last.text).toMatch(/empty/i);
  });

  it("exit prints 'logout' as a system line", () => {
    const state = runCommand("exit");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("system");
    expect(last.text).toBe("logout");
  });

  it("unknown commands produce an error line", () => {
    const state = runCommand("definitely-not-a-command");
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("error");
    expect(last.text).toMatch(/command not found/);
    expect(last.text).toMatch(/definitely-not-a-command/);
  });

  it("matches commands case-insensitively but preserves echoed casing", () => {
    const state = runCommand("HELLO");
    const echoed = state.entries.find(
      (e) => e.kind === "input" && e.text === "HELLO"
    );
    expect(echoed).toBeDefined();
    const last = state.entries[state.entries.length - 1];
    expect(last.kind).toBe("error");
    expect(last.text).toMatch(/HELLO/);
  });
});

describe("terminalLogic — history navigation", () => {
  /**
   * Helper: seed the history with a couple of commands and
   * return the resulting state so each test starts from the
   * same point.
   */
  function seedHistory(): ReturnType<typeof submit> {
    let state = initialTerminalState;
    state = submit(setDraft(state, "ls"));
    state = submit(setDraft(state, "pwd"));
    return state;
  }

  it("ArrowUp from a fresh state jumps to the most recent entry", () => {
    const next = historyPrev(seedHistory());
    expect(next.historyIndex).toBe(0);
    expect(next.draft).toBe("pwd");
  });

  it("ArrowUp again recurses to the previous entry", () => {
    let state = seedHistory();
    state = historyPrev(state);
    state = historyPrev(state);
    expect(state.historyIndex).toBe(1);
    expect(state.draft).toBe("ls");
  });

  it("ArrowUp clamps at the oldest entry", () => {
    let state = seedHistory();
    state = historyPrev(state);
    state = historyPrev(state);
    state = historyPrev(state);
    state = historyPrev(state);
    expect(state.historyIndex).toBe(1);
    expect(state.draft).toBe("ls");
  });

  it("ArrowDown steps forward through history", () => {
    let state = seedHistory();
    state = historyPrev(state);
    state = historyPrev(state);
    state = historyNext(state);
    expect(state.historyIndex).toBe(0);
    expect(state.draft).toBe("pwd");
  });

  it("ArrowDown from the most recent entry restores the empty draft", () => {
    let state = seedHistory();
    state = historyPrev(state);
    state = historyNext(state);
    expect(state.historyIndex).toBeNull();
    expect(state.draft).toBe("");
  });

  it("ArrowDown when not navigating is a no-op", () => {
    const state = seedHistory();
    const next = historyNext(state);
    expect(next).toBe(state);
  });

  it("ArrowUp with empty history is a no-op", () => {
    const state = historyPrev(initialTerminalState);
    expect(state).toBe(initialTerminalState);
  });
});

describe("terminalLogic — clearTerminal helper", () => {
  it("clears the scrollback but keeps history and draft", () => {
    const seeded = submit(setDraft(initialTerminalState, "help"));
    const next = clearTerminal(seeded);
    expect(next.entries).toHaveLength(1);
    expect(next.entries[0].kind).toBe("system");
    expect(next.history).toEqual(seeded.history);
    expect(next.draft).toBe(seeded.draft);
  });
});

describe("terminalLogic — scrollback cap", () => {
  it("caps entries at TERMINAL_MAX_SCROLLBACK", () => {
    // Submit many small commands and confirm we never exceed the cap.
    let state = initialTerminalState;
    for (let i = 0; i < TERMINAL_MAX_SCROLLBACK + 50; i += 1) {
      state = submit(setDraft(state, `echo ${i}`));
    }
    expect(state.entries.length).toBeLessThanOrEqual(TERMINAL_MAX_SCROLLBACK);
  });
});

describe("terminalLogic — entry helpers", () => {
  it("getEntry returns the entry with the matching id", () => {
    const seeded = runCommand("help");
    const firstId = seeded.entries[0].id;
    expect(getEntry(seeded, firstId)).toBe(seeded.entries[0]);
    expect(getEntry(seeded, -1)).toBeUndefined();
  });

  it("entryCount matches the length of the entries array", () => {
    const seeded = runCommand("ls");
    expect(entryCount(seeded)).toBe(seeded.entries.length);
  });
});

describe("terminalLogic — entry invariants", () => {
  it("every entry produced has a unique id", () => {
    let state = initialTerminalState;
    state = submit(setDraft(state, "ls"));
    state = submit(setDraft(state, "pwd"));
    state = submit(setDraft(state, "history"));
    const ids = new Set<number>();
    for (const entry of state.entries) {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
    }
  });

  it("input entries are recorded with a null timestamp", () => {
    const state = runCommand("ls");
    const input = state.entries.find((e) => e.kind === "input");
    expect(input).toBeDefined();
    expect(input?.timestamp).toBeNull();
  });

  it("the next id counter advances monotonically", () => {
    const before = initialTerminalState.nextId;
    const after = runCommand("ls");
    expect(after.nextId).toBeGreaterThan(before);
  });
});

// Reference type to ensure TerminalEntry import is used.
const _typeProbe: TerminalEntry | undefined = undefined;
void _typeProbe;
