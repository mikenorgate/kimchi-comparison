import { useEffect, useRef, useState } from 'react'
import { executeCommand, type TerminalLine } from './commands'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const PROMPT = 'tahoe@macbook ~ %'

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: generateId(), type: 'output', text: 'Last login: ' + new Date().toLocaleString() },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [, setHistoryIndex] = useState(-1)
  const [cwd] = useState('/Users/tahoe-user')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      if (typeof el.scrollTo === 'function') {
        el.scrollTo({ top: el.scrollHeight })
      } else {
        el.scrollTop = el.scrollHeight
      }
    }
  }, [lines])

  const focusInput = () => inputRef.current?.focus()

  const appendLine = (type: TerminalLine['type'], text: string) => {
    setLines((prev) => [...prev, { id: generateId(), type, text }])
  }

  const runCommand = (raw: string) => {
    const trimmed = raw.trim()
    appendLine('input', `${PROMPT} ${trimmed}`)
    if (trimmed) {
      setHistory((prev) => [trimmed, ...prev].slice(0, 100))
      setHistoryIndex(-1)
    }
    const result = executeCommand(trimmed, { cwd })
    if (trimmed.toLowerCase() === 'clear') {
      setLines([])
      return
    }
    result.lines.forEach((line) => appendLine('output', line))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runCommand(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistoryIndex((prev) => {
        const next = prev + 1
        if (next >= history.length) return prev
        setInput(history[next])
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistoryIndex((prev) => {
        const next = prev - 1
        if (next < -1) return prev
        setInput(next === -1 ? '' : history[next])
        return next
      })
    }
  }

  return (
    <div
      className="flex flex-col h-full w-full bg-black text-green-400 font-mono text-sm p-3"
      onClick={focusInput}
      data-testid="terminal"
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap ${
              line.type === 'input' ? 'text-white' : line.type === 'error' ? 'text-red-400' : 'text-green-400'
            }`}
            data-testid={line.type === 'output' ? 'terminal-output' : line.type === 'input' ? 'terminal-input-line' : undefined}
          >
            {line.text}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <span className="text-white mr-2 shrink-0">{PROMPT}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400 min-w-0"
            aria-label="Terminal command input"
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}
