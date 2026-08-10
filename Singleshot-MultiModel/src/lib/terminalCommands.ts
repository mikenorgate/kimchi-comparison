import type { FsNode } from '../types';

/**
 * Minimal context the command interpreter needs to do its work. The caller
 * (the Terminal app component) provides hooks into the filesystem store
 * plus the current working directory id. Keeping this interface small
 * makes the parser trivially unit-testable.
 */
export interface TerminalContext {
  /** Resolved current working directory node. */
  cwd: FsNode;
  /** Current working directory node id. */
  cwdId: string;
  /** Snapshot of all filesystem nodes (used only for path-string rendering). */
  nodes: Record<string, FsNode>;
  getNode: (id: string) => FsNode | undefined;
  getChildren: (parentId: string | null) => FsNode[];
  createFolder: (parentId: string | null, name: string) => string;
  createFile: (parentId: string | null, name: string, content?: string) => string;
}

export interface CommandLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

export interface CommandResult {
  lines: CommandLine[];
  /** When set, the caller should update the terminal's cwd to this node id. */
  newCwdId?: string;
  /** When true, the caller should clear the visible terminal history. */
  clearHistory?: boolean;
}

export const HOME_NODE_ID = 'root';

const HELP_TEXT = [
  'Available commands:',
  '  help               Show this help text',
  '  pwd                Print the current working directory',
  '  ls [path]          List files and folders at path (or cwd)',
  '  cd <path>          Change directory (supports ., .., ~, absolute paths)',
  '  cat <file>         Print the contents of a file',
  '  mkdir <name>       Create a new folder inside the cwd',
  '  touch <name>       Create a new empty file inside the cwd',
  '  clear              Clear the terminal output',
  '',
  'Path examples:',
  '  cd Documents       relative to cwd',
  '  cd /Documents      absolute (anchored at /Users/mike)',
  '  cd ~               home directory',
  '  cd ..              parent directory',
];

/**
 * Convert a node id to the human-readable path string shown in the prompt.
 * The root renders as `/Users/mike` (the prototype's home) and children of
 * root render as `/Users/mike/<Name>`.
 */
export function nodeIdToPath(nodeId: string, nodes: Record<string, FsNode>): string {
  if (nodeId === HOME_NODE_ID) return '/Users/mike';
  const parts: string[] = [];
  let current = nodes[nodeId];
  while (current && current.parentId) {
    parts.unshift(current.name);
    current = nodes[current.parentId];
  }
  return `/Users/mike/${parts.join('/')}`;
}

/**
 * Resolve a user-typed path string to a filesystem node. Supports:
 *  - empty string / `~`            → home (root)
 *  - absolute paths starting with `/` (anchored at root)
 *  - paths starting with `~` or `~/` (home-anchored)
 *  - relative paths (`.`, `..`, plain segments)
 */
export function resolveTarget(input: string, ctx: TerminalContext): FsNode | undefined {
  const trimmed = input.trim();
  if (trimmed === '' || trimmed === '~') {
    return ctx.getNode(HOME_NODE_ID);
  }

  let segments: string[];
  let startNode: FsNode | undefined;

  if (trimmed.startsWith('/')) {
    // Absolute path. Strip the leading slash and any /Users/mike prefix so
    // that paths echoed back by `pwd` resolve correctly.
    let segs = trimmed.slice(1).split('/').filter(Boolean);
    if (segs[0] === 'Users' && segs[1] === 'mike') {
      segs = segs.slice(2);
    }
    segments = segs;
    startNode = ctx.getNode(HOME_NODE_ID);
  } else {
    let segs = trimmed.split('/').filter(Boolean);
    if (segs[0] === '~') {
      segs = segs.slice(1);
      startNode = ctx.getNode(HOME_NODE_ID);
    } else {
      startNode = ctx.cwd;
    }
    segments = segs;
  }

  let current: FsNode | undefined = startNode;
  for (const seg of segments) {
    if (!current) return undefined;
    if (seg === '.') continue;
    if (seg === '..') {
      if (!current.parentId) return undefined;
      current = ctx.getNode(current.parentId);
      continue;
    }
    if (current.type !== 'folder') return undefined;
    const child = ctx.getChildren(current.id).find((c) => c.name === seg);
    if (!child) return undefined;
    current = child;
  }
  return current;
}

function splitArgs(trimmed: string): { cmd: string; arg: string } {
  // The command is the first whitespace-delimited token; everything after
  // (including additional whitespace) is treated as a single argument string.
  // This matches how a casual user types `cat some file.txt` and expects
  // the shell to look up the literal name "some file.txt".
  const spaceIdx = trimmed.search(/\s/);
  if (spaceIdx === -1) return { cmd: trimmed, arg: '' };
  return { cmd: trimmed.slice(0, spaceIdx), arg: trimmed.slice(spaceIdx + 1).trim() };
}

export function executeCommand(input: string, ctx: TerminalContext): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  const { cmd, arg } = splitArgs(trimmed);

  switch (cmd) {
    case 'help':
      return {
        lines: HELP_TEXT.map((text) => ({ type: 'output' as const, text })),
      };

    case 'pwd':
      return {
        lines: [{ type: 'output', text: nodeIdToPath(ctx.cwdId, ctx.nodes) }],
      };

    case 'ls': {
      const target = arg ? resolveTarget(arg, ctx) : ctx.cwd;
      if (!target) {
        return {
          lines: [{ type: 'error', text: `ls: ${arg}: No such file or directory` }],
        };
      }
      if (target.type !== 'folder') {
        return { lines: [{ type: 'output', text: target.name }] };
      }
      const children = ctx.getChildren(target.id);
      if (children.length === 0) return { lines: [] };
      return {
        lines: children.map((c) => ({ type: 'output' as const, text: c.name })),
      };
    }

    case 'cd': {
      const target = arg ? resolveTarget(arg, ctx) : ctx.getNode(HOME_NODE_ID);
      if (!target) {
        return {
          lines: [{ type: 'error', text: `cd: ${arg || '~'}: No such file or directory` }],
        };
      }
      if (target.type !== 'folder') {
        return {
          lines: [{ type: 'error', text: `cd: ${arg}: Not a directory` }],
        };
      }
      return { lines: [], newCwdId: target.id };
    }

    case 'cat': {
      if (!arg) {
        return { lines: [{ type: 'error', text: 'cat: missing file operand' }] };
      }
      const target = resolveTarget(arg, ctx);
      if (!target) {
        return {
          lines: [{ type: 'error', text: `cat: ${arg}: No such file or directory` }],
        };
      }
      if (target.type !== 'folder') {
        // For files, print the content split on newlines so each rendered
        // line gets its own entry (matching real `cat` behaviour).
        return {
          lines: target.content.split('\n').map((text) => ({
            type: 'output' as const,
            text,
          })),
        };
      }
      return {
        lines: [{ type: 'error', text: `cat: ${arg}: Is a directory` }],
      };
    }

    case 'mkdir': {
      if (!arg) {
        return { lines: [{ type: 'error', text: 'mkdir: missing operand' }] };
      }
      const name = arg.trim();
      if (!name) {
        return { lines: [{ type: 'error', text: 'mkdir: missing operand' }] };
      }
      if (ctx.getChildren(ctx.cwd.id).some((c) => c.name === name)) {
        return {
          lines: [{ type: 'error', text: `mkdir: ${name}: File exists` }],
        };
      }
      const id = ctx.createFolder(ctx.cwd.id, name);
      if (!id) {
        return {
          lines: [{ type: 'error', text: `mkdir: ${name}: could not create folder` }],
        };
      }
      return { lines: [] };
    }

    case 'touch': {
      if (!arg) {
        return { lines: [{ type: 'error', text: 'touch: missing file operand' }] };
      }
      const name = arg.trim();
      if (!name) {
        return { lines: [{ type: 'error', text: 'touch: missing file operand' }] };
      }
      // `touch` on an existing entry is a no-op for this prototype — the
      // filesystem store doesn't track mtime independently of updates.
      if (ctx.getChildren(ctx.cwd.id).some((c) => c.name === name)) {
        return { lines: [] };
      }
      const id = ctx.createFile(ctx.cwd.id, name, '');
      if (!id) {
        return {
          lines: [{ type: 'error', text: `touch: ${name}: could not create file` }],
        };
      }
      return { lines: [] };
    }

    case 'clear':
      return { lines: [], clearHistory: true };

    default:
      return {
        lines: [{ type: 'error', text: `${cmd}: command not found` }],
      };
  }
}
