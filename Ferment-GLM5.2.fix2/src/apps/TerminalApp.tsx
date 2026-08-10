import { useState, useRef, useEffect } from 'react'
import { TERMINAL_ENTRIES, TERMINAL_HOST, TERMINAL_PATH } from '@/data/terminal-data'

interface TerminalLine {
  type: 'input' | 'output'
  text: string
}

const PROMPT = `${TERMINAL_HOST} ${TERMINAL_PATH} %`

export default function TerminalApp() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: 'Last login: Today 9:41 AM on ttys000' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const runCommand = (raw: string) => {
    const cmd = raw.trim()
    const nextLines: TerminalLine[] = [...lines, { type: 'input', text: `${PROMPT} ${raw}` }]

    const parts = cmd.split(/\s+/)
    const command = parts[0] ?? ''
    const args = parts.slice(1)

    if (cmd === '') {
      setLines(nextLines)
      return
    }

    let output = ''
    switch (command) {
      case 'ls':
        output = TERMINAL_ENTRIES.join('  ')
        break
      case 'pwd':
        output = '/Users/user'
        break
      case 'echo':
        output = args.join(' ')
        break
      case 'clear':
        setLines([])
        setHistory((prev) => [...prev, cmd])
        setHistoryIndex(null)
        return
      case 'help':
        output = 'Available commands:\n  ls       list directory entries\n  pwd      print working directory\n  echo     print text\n  clear    clear the screen\n  help     show this message'
        break
      default:
        output = `command not found: ${command}`
    }

    const outputLines = output.split('\n')
    setLines([...nextLines, ...outputLines.map((text) => ({ type: 'output' as const, text }))])
    setHistory((prev) => [...prev, cmd])
    setHistoryIndex(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runCommand(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const newIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIndex)
      setInput(history[newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (history.length === 0) return
      if (historyIndex === null) return
      const newIndex = historyIndex + 1
      if (newIndex >= history.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    }
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'rgba(0,0,0,0.55)', color: '#e6e6e6', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.type === 'input' ? '#7ee787' : '#e6e6e6' }}>
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', padding: '4px 12px 8px', gap: 8 }}>
        <span style={{ color: '#7ee787', whiteSpace: 'nowrap' }}>{PROMPT}</span>
        <input
          ref={inputRef}
          data-testid="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e6e6e6',
            fontFamily: 'inherit',
            fontSize: 12,
          }}
        />
      </form>
    </div>
  )
}
