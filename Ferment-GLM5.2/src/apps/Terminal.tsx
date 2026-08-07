import { useEffect, useRef, useState } from 'react'
import { useVfsStore, VfsError, type VfsNode } from '../store/vfs'

/**
 * Terminal — a shell over the virtual filesystem.
 *
 * Supports: ls, cd, pwd, cat, mkdir, touch, echo (with `>` redirect), clear,
 * help. Each Terminal instance keeps its own working directory (local state,
 * not the store's global cwd) so multiple Terminal windows are independent.
 * Command history is navigable with Up/Down arrows.
 */

interface Line {
  type: 'input' | 'output' | 'error'
  text: string
}

const BANNER =
  'Last login: now on ttys000\nWelcome to Tahoe Terminal. Type `help` for commands.'

function splitArgs(input: string): string[] {
  // Simple whitespace tokenizer; quoted strings not supported (keep it simple).
  return input.trim().split(/\s+/).filter(Boolean)
}

export function Terminal() {
  const nodes = useVfsStore((s) => s.nodes)
  const createNode = useVfsStore((s) => s.createNode)
  const updateContent = useVfsStore((s) => s.updateContent)

  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: BANNER },
  ])
  const [input, setInput] = useState('')
  const [cwdId, setCwdId] = useState('root')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const prompt = `tahoe@macbook ${pathOfSafe(nodes, cwdId)} %`

  // Auto-scroll to bottom on new output.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const push = (type: Line['type'], text: string) =>
    setLines((prev) => [...prev, { type, text }])

  const resolve = (path: string): string => {
    const { resolvePath } = useVfsStore.getState()
    return resolvePath(path, cwdId)
  }

  const runCommand = (raw: string) => {
    const cmd = raw.trim()
    // Echo the input line.
    push('input', `${prompt} ${cmd}`)
    if (!cmd) return

    setHistory((prev) => [...prev, cmd])

    const parts = splitArgs(cmd)
    const name = parts[0]
    const args = parts.slice(1)

    try {
      switch (name) {
        case 'help':
          push('output', [
            'Available commands:',
            '  ls [path]          list directory contents',
            '  cd [path]          change directory (default: /)',
            '  pwd                print working directory',
            '  cat <file>         print file contents',
            '  mkdir <name>       create a directory',
            '  touch <name>       create an empty file',
            '  echo <text>        print text (supports > file redirect)',
            '  clear              clear the screen',
            '  help               show this help',
          ].join('\n'))
          break

        case 'ls': {
          const target = args[0] ? resolve(args[0]) : cwdId
          const node = nodes[target]
          if (!node) throw new VfsError(`ls: ${args[0]}: No such file or directory`)
          if (node.type === 'file') {
            push('output', node.name)
            break
          }
          const children = useVfsStore.getState().listChildren(target)
          if (children.length === 0) {
            break // empty directory → no output
          }
          push(
            'output',
            children
              .map((c) => (c.type === 'folder' ? `${c.name}/` : c.name))
              .join('\n'),
          )
          break
        }

        case 'cd': {
          if (!args[0] || args[0] === '~' || args[0] === '/') {
            setCwdId('root')
            break
          }
          const target = resolve(args[0])
          const node = nodes[target]
          if (!node) throw new VfsError(`cd: ${args[0]}: No such file or directory`)
          if (node.type !== 'folder')
            throw new VfsError(`cd: ${args[0]}: Not a directory`)
          setCwdId(target)
          break
        }

        case 'pwd':
          push('output', pathOfSafe(nodes, cwdId))
          break

        case 'cat': {
          if (!args[0]) throw new VfsError('cat: missing file operand')
          const target = resolve(args[0])
          const node = nodes[target]
          if (!node) throw new VfsError(`cat: ${args[0]}: No such file or directory`)
          if (node.type === 'folder')
            throw new VfsError(`cat: ${args[0]}: Is a directory`)
          push('output', node.content ?? '')
          break
        }

        case 'mkdir': {
          if (!args[0]) throw new VfsError('mkdir: missing operand')
          createNode({ name: args[0], type: 'folder', parentId: cwdId })
          break
        }

        case 'touch': {
          if (!args[0]) throw new VfsError('touch: missing operand')
          // If the file already exists, touch is a no-op (updates mtime).
          const existing = useVfsStore
            .getState()
            .listChildren(cwdId)
            .find((c) => c.name === args[0])
          if (!existing) {
            createNode({ name: args[0], type: 'file', parentId: cwdId, content: '' })
          }
          break
        }

        case 'echo': {
          // Support: echo hello world  OR  echo hello > file.txt
          const redirectIdx = args.indexOf('>')
          if (redirectIdx !== -1) {
            const text = args.slice(0, redirectIdx).join(' ')
            const filename = args[redirectIdx + 1]
            if (!filename) throw new VfsError('echo: missing redirect target')
            const existing = useVfsStore
              .getState()
              .listChildren(cwdId)
              .find((c) => c.name === filename)
            if (existing) {
              if (existing.type === 'folder')
                throw new VfsError(`echo: ${filename}: Is a directory`)
              updateContent(existing.id, text)
            } else {
              createNode({ name: filename, type: 'file', parentId: cwdId, content: text })
            }
          } else {
            push('output', args.join(' '))
          }
          break
        }

        case 'clear':
          setLines([])
          break

        default:
          throw new VfsError(`zsh: command not found: ${name}`)
      }
    } catch (e) {
      push('error', e instanceof Error ? e.message : String(e))
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input)
      setInput('')
      setHistIdx(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(next)
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const next = histIdx + 1
      if (next >= history.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(next)
        setInput(history[next])
      }
    }
  }

  return (
    <div
      data-testid="terminal-content"
      className="h-full overflow-hidden bg-black/90 font-mono text-[13px] leading-relaxed text-green-300"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        className="h-full overflow-auto px-3 py-2"
        data-testid="terminal-output"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            data-testid="terminal-line"
            className={
              line.type === 'error'
                ? 'text-red-400'
                : line.type === 'input'
                  ? 'text-white'
                  : 'text-green-300'
            }
          >
            <pre className="whitespace-pre-wrap font-mono">{line.text}</pre>
          </div>
        ))}
        {/* Live prompt line */}
        <div className="flex items-center text-white">
          <span className="shrink-0 text-blue-300">{prompt}</span>
          <input
            ref={inputRef}
            data-testid="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="ml-1 flex-1 bg-transparent text-white outline-none"
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
          />
        </div>
      </div>
    </div>
  )
}

function pathOfSafe(nodes: Record<string, VfsNode>, id: string): string {
  try {
    return useVfsStore.getState().pathOf(id)
  } catch {
    // Fallback: build manually if the store helper throws.
    const parts: string[] = []
    let cur: string | null = id
    while (cur) {
      const n: VfsNode | undefined = nodes[cur]
      if (!n || n.parentId === null) break
      parts.unshift(n.name)
      cur = n.parentId
    }
    return '/' + parts.join('/')
  }
}

export default Terminal
