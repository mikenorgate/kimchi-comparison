import { useState, useRef, useEffect, useCallback } from 'react'
import { useFileStore } from '../../store/file-store'

interface Line {
  id: string
  text: string
  isPrompt?: boolean
}

let lineCounter = 0
const genLineId = () => `term-line-${++lineCounter}`

export function Terminal({ windowId: _windowId }: { windowId: string }) {
  const { getChildren, getNode, getPath, createNode, updateContent } = useFileStore()
  const [cwdId, setCwdId] = useState('root')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [lines, setLines] = useState<Line[]>([
    { id: genLineId(), text: 'Last login: ' + new Date().toLocaleString(), isPrompt: false },
  ])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const prompt = useCallback(() => {
    const path = getPath(cwdId)
    const pathStr = '/' + path.map((n) => n.name).join('/')
    return `tahoe@macbook ${pathStr} %`
  }, [cwdId, getPath])

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  // Focus input on click
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const resolvePath = useCallback((arg: string): string | null => {
    if (!arg) return cwdId
    const node = getNode(arg)
    if (node) return node.id
    // Try relative path
    const parts = arg.split('/').filter(Boolean)
    let curId = cwdId
    for (const part of parts) {
      if (part === '..') {
        const cur = getNode(curId)
        if (cur?.parentId) curId = cur.parentId
        continue
      }
      const children = getChildren(curId)
      const found = children.find((c) => c.name === part)
      if (!found) return null
      curId = found.id
    }
    return curId
  }, [cwdId, getNode, getChildren])

  const execCommand = useCallback((cmd: string): string[] => {
    const trimmed = cmd.trim()
    if (!trimmed) return []
    const parts = trimmed.split(/\s+/)
    const command = parts[0]
    const args = parts.slice(1)

    switch (command) {
      case 'pwd': {
        const path = getPath(cwdId)
        return ['/' + path.map((n) => n.name).join('/')]
      }
      case 'ls': {
        const targetArg = args[0]
        const targetId = targetArg ? resolvePath(targetArg) : cwdId
        if (!targetId) return [`ls: ${targetArg}: No such file or directory`]
        const target = getNode(targetId)
        if (!target) return [`ls: ${targetArg}: No such file or directory`]
        if (target.type !== 'folder') return [target.name]
        const children = getChildren(targetId)
        if (children.length === 0) return []
        return [children.map((c) => c.type === 'folder' ? c.name + '/' : c.name).join('  ')]
      }
      case 'cd': {
        const targetArg = args[0] || 'root'
        const targetId = resolvePath(targetArg)
        if (!targetId) return [`cd: no such file or directory: ${targetArg}`]
        const target = getNode(targetId)
        if (!target) return [`cd: no such file or directory: ${targetArg}`]
        if (target.type !== 'folder') return [`cd: not a directory: ${targetArg}`]
        setCwdId(targetId)
        return []
      }
      case 'cat': {
        if (!args[0]) return ['usage: cat <file>']
        const targetId = resolvePath(args[0])
        if (!targetId) return [`cat: ${args[0]}: No such file or directory`]
        const target = getNode(targetId)
        if (!target) return [`cat: ${args[0]}: No such file or directory`]
        if (target.type !== 'file') return [`cat: ${args[0]}: Is a directory`]
        return [target.content ?? '']
      }
      case 'echo': {
        // Support echo "text" > file or echo text > file
        const redirectIdx = args.indexOf('>')
        if (redirectIdx !== -1) {
          const textParts = args.slice(0, redirectIdx)
          const text = textParts.join(' ').replace(/^["']|["']$/g, '')
          const fileName = args[redirectIdx + 1]
          if (!fileName) return ['syntax error: missing file name after >']
          // Find existing file or create
          const children = getChildren(cwdId)
          const existing = children.find((c) => c.name === fileName && c.type === 'file')
          if (existing) {
            updateContent(existing.id, text)
          } else {
            const id = createNode(fileName, 'file', cwdId)
            updateContent(id, text)
          }
          return []
        }
        return [args.join(' ').replace(/^["']|["']$/g, '')]
      }
      case 'mkdir': {
        if (!args[0]) return ['usage: mkdir <dir>']
        const dirName = args[0]
        const children = getChildren(cwdId)
        if (children.some((c) => c.name === dirName)) return [`mkdir: ${dirName}: File exists`]
        createNode(dirName, 'folder', cwdId)
        return []
      }
      case 'touch': {
        if (!args[0]) return ['usage: touch <file>']
        const fileName = args[0]
        const children = getChildren(cwdId)
        if (!children.some((c) => c.name === fileName && c.type === 'file')) {
          createNode(fileName, 'file', cwdId)
        }
        return []
      }
      case 'clear': {
        return ['__CLEAR__']
      }
      case 'help': {
        return ['Available commands: ls, cd, pwd, cat, echo, mkdir, touch, clear, help']
      }
      default:
        return [`zsh: command not found: ${command}`]
    }
  }, [cwdId, getNode, getChildren, getPath, createNode, updateContent, resolvePath])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input
    const newLines: Line[] = [
      { id: genLineId(), text: `${prompt()} ${cmd}`, isPrompt: true },
    ]
    if (cmd.trim()) {
      const output = execCommand(cmd)
      if (output.length === 1 && output[0] === '__CLEAR__') {
        setLines([])
        setHistory((h) => [...h, cmd])
        setInput('')
        setHistoryIdx(-1)
        return
      }
      for (const out of output) {
        newLines.push({ id: genLineId(), text: out })
      }
      setHistory((h) => [...h, cmd])
    }
    setLines((prev) => [...prev, ...newLines])
    setInput('')
    setHistoryIdx(-1)
  }, [input, prompt, execCommand])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1)
      setHistoryIdx(newIdx)
      setInput(history[newIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx === -1) return
      const newIdx = historyIdx + 1
      if (newIdx >= history.length) {
        setHistoryIdx(-1)
        setInput('')
      } else {
        setHistoryIdx(newIdx)
        setInput(history[newIdx])
      }
    }
  }, [history, historyIdx])

  return (
    <div
      data-testid="terminal-root"
      onClick={focusInput}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'rgba(20, 20, 30, 0.92)',
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily: 'SF Mono, Menlo, Monaco, Consolas, monospace',
        fontSize: 13,
        color: '#e0e0e0',
      }}
    >
      {/* Title bar */}
      <div
        data-testid="terminal-titlebar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'rgba(40, 40, 50, 0.8)',
          borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>mike@macbook — -zsh — 80×24</span>
      </div>

      {/* Scrollback */}
      <div
        ref={scrollRef}
        data-testid="terminal-scrollback"
        style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            data-testid={line.isPrompt ? 'terminal-prompt-line' : 'terminal-output-line'}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {line.text}
          </div>
        ))}
        {/* Input line */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6 }}>
          <span data-testid="terminal-prompt" style={{ color: '#30d158', flexShrink: 0 }}>{prompt()}</span>
          <input
            ref={inputRef}
            data-testid="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#e0e0e0',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              caretColor: '#e0e0e0',
            }}
          />
        </form>
      </div>
    </div>
  )
}
