import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Terminal } from './terminal'
import { useFileStore } from '../../store/file-store'

function resetFS() {
  localStorage.removeItem('tahoe.filesystem')
  useFileStore.getState().reset()
}

function runCommand(cmd: string) {
  const input = screen.getByTestId('terminal-input') as HTMLInputElement
  act(() => {
    fireEvent.change(input, { target: { value: cmd } })
    fireEvent.submit(input.closest('form')!)
  })
}

function getOutputLines(): string[] {
  return screen.getAllByTestId('terminal-output-line').map((el) => el.textContent ?? '')
}

function getLastOutput(): string {
  const lines = getOutputLines()
  return lines[lines.length - 1] ?? ''
}

describe('Terminal', () => {
  beforeEach(() => {
    resetFS()
  })

  it('renders the terminal with title bar, scrollback, and input', () => {
    render(<Terminal windowId="w1" />)
    expect(screen.getByTestId('terminal-root')).toBeInTheDocument()
    expect(screen.getByTestId('terminal-titlebar')).toBeInTheDocument()
    expect(screen.getByTestId('terminal-scrollback')).toBeInTheDocument()
    expect(screen.getByTestId('terminal-input')).toBeInTheDocument()
  })

  it('shows the prompt with current path', () => {
    render(<Terminal windowId="w1" />)
    expect(screen.getByTestId('terminal-prompt')).toHaveTextContent('Macintosh HD')
  })

  it('pwd shows the current directory path', () => {
    render(<Terminal windowId="w1" />)
    runCommand('pwd')
    expect(getLastOutput()).toBe('/Macintosh HD')
  })

  it('ls lists directory contents with folder suffix', () => {
    render(<Terminal windowId="w1" />)
    runCommand('ls')
    const output = getLastOutput()
    expect(output).toContain('Desktop/')
    expect(output).toContain('Documents/')
    expect(output).toContain('Downloads/')
    expect(output).toContain('Pictures/')
    expect(output).toContain('Applications/')
  })

  it('cd into Documents and pwd reflects it', () => {
    render(<Terminal windowId="w1" />)
    runCommand('cd Documents')
    runCommand('pwd')
    expect(getLastOutput()).toBe('/Macintosh HD/Documents')
  })

  it('ls in Documents shows Welcome.txt', () => {
    render(<Terminal windowId="w1" />)
    runCommand('cd Documents')
    runCommand('ls')
    expect(getLastOutput()).toContain('Welcome.txt')
  })

  it('cat displays file content', () => {
    render(<Terminal windowId="w1" />)
    runCommand('cd Documents')
    runCommand('cat Welcome.txt')
    expect(getLastOutput()).toBe('Welcome to macOS Tahoe Web!')
  })

  it('echo prints text', () => {
    render(<Terminal windowId="w1" />)
    runCommand('echo Hello World')
    expect(getLastOutput()).toBe('Hello World')
  })

  it('echo with redirect writes to a file', () => {
    render(<Terminal windowId="w1" />)
    runCommand('echo Test content > test.txt')
    runCommand('ls')
    expect(getLastOutput()).toContain('test.txt')
    runCommand('cat test.txt')
    expect(getLastOutput()).toBe('Test content')
  })

  it('mkdir creates a new directory', () => {
    render(<Terminal windowId="w1" />)
    runCommand('mkdir Projects')
    runCommand('ls')
    expect(getLastOutput()).toContain('Projects/')
  })

  it('mkdir fails if directory already exists', () => {
    render(<Terminal windowId="w1" />)
    runCommand('mkdir Projects')
    runCommand('mkdir Projects')
    expect(getLastOutput()).toContain('File exists')
  })

  it('touch creates a new empty file', () => {
    render(<Terminal windowId="w1" />)
    runCommand('touch notes.md')
    runCommand('ls')
    expect(getLastOutput()).toContain('notes.md')
    runCommand('cat notes.md')
    expect(getLastOutput()).toBe('')
  })

  it('clear empties the scrollback', () => {
    render(<Terminal windowId="w1" />)
    // Initial state has a "Last login" output line
    expect(screen.getAllByTestId('terminal-output-line')).toHaveLength(1)
    runCommand('echo hello')
    expect(screen.getAllByTestId('terminal-output-line')).toHaveLength(2)
    runCommand('clear')
    expect(screen.queryAllByTestId('terminal-output-line')).toHaveLength(0)
    expect(screen.queryAllByTestId('terminal-prompt-line')).toHaveLength(0)
  })

  it('cd .. goes back to parent directory', () => {
    render(<Terminal windowId="w1" />)
    runCommand('cd Documents')
    runCommand('cd ..')
    runCommand('pwd')
    expect(getLastOutput()).toBe('/Macintosh HD')
  })

  it('cd to non-existent shows error', () => {
    render(<Terminal windowId="w1" />)
    runCommand('cd nonexistent')
    expect(getLastOutput()).toContain('no such file or directory')
  })

  it('cat on directory shows error', () => {
    render(<Terminal windowId="w1" />)
    runCommand('cat Documents')
    expect(getLastOutput()).toContain('Is a directory')
  })

  it('unknown command shows error', () => {
    render(<Terminal windowId="w1" />)
    runCommand('foobar')
    expect(getLastOutput()).toContain('command not found')
  })

  it('help lists available commands', () => {
    render(<Terminal windowId="w1" />)
    runCommand('help')
    expect(getLastOutput()).toContain('ls')
    expect(getLastOutput()).toContain('cd')
    expect(getLastOutput()).toContain('pwd')
    expect(getLastOutput()).toContain('cat')
    expect(getLastOutput()).toContain('echo')
    expect(getLastOutput()).toContain('mkdir')
    expect(getLastOutput()).toContain('touch')
    expect(getLastOutput()).toContain('clear')
  })

  it('command history: ArrowUp recalls previous command', () => {
    render(<Terminal windowId="w1" />)
    runCommand('echo first')
    runCommand('echo second')
    const input = screen.getByTestId('terminal-input') as HTMLInputElement
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' })
    })
    expect(input.value).toBe('echo second')
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' })
    })
    expect(input.value).toBe('echo first')
  })

  it('command history: ArrowDown moves forward', () => {
    render(<Terminal windowId="w1" />)
    runCommand('echo first')
    runCommand('echo second')
    const input = screen.getByTestId('terminal-input') as HTMLInputElement
    act(() => { fireEvent.keyDown(input, { key: 'ArrowUp' }) })
    act(() => { fireEvent.keyDown(input, { key: 'ArrowUp' }) })
    expect(input.value).toBe('echo first')
    act(() => { fireEvent.keyDown(input, { key: 'ArrowDown' }) })
    expect(input.value).toBe('echo second')
  })

  it('command history: ArrowDown past end clears input', () => {
    render(<Terminal windowId="w1" />)
    runCommand('echo test')
    const input = screen.getByTestId('terminal-input') as HTMLInputElement
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' })
    })
    expect(input.value).toBe('echo test')
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' })
    })
    expect(input.value).toBe('')
  })

  it('files created via terminal appear in file store', () => {
    render(<Terminal windowId="w1" />)
    runCommand('mkdir testdir')
    const root = useFileStore.getState().getChildren('root')
    expect(root.some((n) => n.name === 'testdir' && n.type === 'folder')).toBe(true)
  })

  it('echo redirect updates existing file content', () => {
    render(<Terminal windowId="w1" />)
    runCommand('echo first > file.txt')
    runCommand('echo second > file.txt')
    runCommand('cat file.txt')
    expect(getLastOutput()).toBe('second')
  })

  it('cd without arguments goes to root', () => {
    render(<Terminal windowId="w1" />)
    runCommand('cd Documents')
    runCommand('cd')
    runCommand('pwd')
    expect(getLastOutput()).toBe('/Macintosh HD')
  })

  it('empty input does not produce output', () => {
    render(<Terminal windowId="w1" />)
    const beforeCount = screen.getAllByTestId('terminal-output-line').length
    const input = screen.getByTestId('terminal-input') as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.submit(input.closest('form')!)
    })
    // No new output lines should be added (only the initial "Last login" line)
    expect(screen.getAllByTestId('terminal-output-line')).toHaveLength(beforeCount)
  })
})
