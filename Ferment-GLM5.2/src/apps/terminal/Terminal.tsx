import { useState, useRef, useEffect, useCallback } from 'react'

interface FsNode {
  name: string
  type: 'folder' | 'file'
  children?: FsNode[]
}

/** Mock filesystem — shared concept with Finder. */
const MOCK_FS: FsNode = {
  name: 'Home',
  type: 'folder',
  children: [
    {
      name: 'Documents',
      type: 'folder',
      children: [
        { name: 'Resume.pdf', type: 'file' },
        { name: 'Budget.xlsx', type: 'file' },
        { name: 'Notes.txt', type: 'file' },
        { name: 'Projects', type: 'folder', children: [
          { name: 'README.md', type: 'file' },
          { name: 'index.html', type: 'file' },
        ]},
      ],
    },
    {
      name: 'Downloads',
      type: 'folder',
      children: [
        { name: 'installer.dmg', type: 'file' },
        { name: 'photo.jpg', type: 'file' },
        { name: 'report.zip', type: 'file' },
      ],
    },
    {
      name: 'Applications',
      type: 'folder',
      children: [
        { name: 'Safari.app', type: 'file' },
        { name: 'Mail.app', type: 'file' },
        { name: 'Calendar.app', type: 'file' },
        { name: 'Notes.app', type: 'file' },
      ],
    },
    {
      name: 'Desktop',
      type: 'folder',
      children: [
        { name: 'screenshot.png', type: 'file' },
        { name: 'todo.txt', type: 'file' },
      ],
    },
    { name: 'readme.md', type: 'file' },
  ],
}

const HOME_PATH = '/home/user'
const HELP_TEXT = `Available commands:
  pwd          Print working directory
  ls           List directory contents
  cd <dir>     Change directory
  echo <text>  Print text
  clear        Clear the terminal
  help         Show this help message
  whoami       Print current user
  date         Show current date and time`

interface TerminalLine {
  id: string
  type: 'input' | 'output'
  text: string
}

function resolvePath(cwd: string, target: string): string {
  if (!target || target === '.') return cwd
  if (target === '..') {
    if (cwd === HOME_PATH) return cwd
    const parts = cwd.split('/')
    parts.pop()
    return parts.join('/') || '/'
  }
  if (target.startsWith('/')) return target
  return `${cwd}/${target}`.replace(/\/+/g, '/')
}

function findNodeByPath(path: string): FsNode | null {
  // Map /home/user to root (Home), /home/user/Documents to Home/Documents, etc.
  const rel = path.replace(HOME_PATH, '').replace(/^\//, '')
  if (!rel) return MOCK_FS

  const parts = rel.split('/')
  let node: FsNode = MOCK_FS
  for (const part of parts) {
    if (!node.children) return null
    const child = node.children.find(c => c.name === part)
    if (!child) return null
    node = child
  }
  return node
}

let lineCounter = 0

/**
 * Terminal app — a toy shell with a scrollback view + input line.
 * Commands: pwd, ls, cd <dir>, echo <text>, clear, help, whoami, date.
 */
export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: `line-${lineCounter++}`, type: 'output', text: 'macOS Tahoe Terminal — Type "help" for available commands.' },
  ])
  const [cwd, setCwd] = useState(HOME_PATH)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const addLine = useCallback((type: 'input' | 'output', text: string) => {
    setLines(prev => [...prev, { id: `line-${lineCounter++}`, type, text }])
  }, [])

  const executeCommand = useCallback((raw: string) => {
    const trimmed = raw.trim()
    const parts = trimmed.split(/\s+/)
    const cmd = parts[0]
    const args = parts.slice(1)

    switch (cmd) {
      case '':
        break
      case 'pwd':
        addLine('output', cwd)
        break
      case 'ls': {
        const node = findNodeByPath(cwd)
        if (!node || !node.children) {
          addLine('output', '')
        } else {
          const listing = node.children.map(c =>
            c.type === 'folder' ? `${c.name}/` : c.name
          ).join('  ')
          addLine('output', listing)
        }
        break
      }
      case 'cd': {
        const target = args[0] || HOME_PATH
        const resolved = resolvePath(cwd, target)
        const node = findNodeByPath(resolved)
        if (node && node.type === 'folder') {
          setCwd(resolved)
        } else {
          addLine('output', `cd: no such directory: ${target}`)
        }
        break
      }
      case 'echo':
        addLine('output', args.join(' '))
        break
      case 'clear':
        setLines([])
        break
      case 'help':
        addLine('output', HELP_TEXT)
        break
      case 'whoami':
        addLine('output', 'user')
        break
      case 'date':
        addLine('output', new Date().toString())
        break
      default:
        addLine('output', `command not found: ${cmd}`)
    }
  }, [cwd, addLine])

  const handleSubmit = useCallback(() => {
    addLine('input', `$ ${input}`)
    executeCommand(input)
    setInput('')
  }, [input, executeCommand, addLine])

  return (
    <div
      data-testid="terminal"
      style={{
        height: '100%',
        background: '#1c1c1e',
        color: '#e0e0e0',
        fontFamily: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
        fontSize: '13px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Scrollback */}
      <div
        ref={scrollRef}
        data-testid="terminal-scrollback"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 12px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {lines.map(line => (
          <div
            key={line.id}
            data-testid={line.type === 'output' ? 'terminal-output' : 'terminal-input-line'}
            style={{ lineHeight: 1.5 }}
          >
            {line.text}
          </div>
        ))}
        {/* Input line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#4af0a0' }}>$</span>
          <input
            data-testid="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#e0e0e0',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              outline: 'none',
              caretColor: '#4af0a0',
            }}
          />
        </div>
      </div>
    </div>
  )
}
