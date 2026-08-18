import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Terminal from './Terminal'

afterEach(() => cleanup())

function runCommand(command: string) {
  const input = screen.getByTestId('terminal-input')
  fireEvent.change(input, { target: { value: command } })
  fireEvent.keyDown(input, { key: 'Enter', preventDefault: () => {} })
}

function getOutputs(): string[] {
  return screen.getAllByTestId('terminal-output').map((el: HTMLElement) => el.textContent || '')
}

describe('Terminal', () => {
  it('renders with welcome message and input line', () => {
    render(<Terminal />)
    expect(screen.getByTestId('terminal')).toBeInTheDocument()
    expect(screen.getByTestId('terminal-input')).toBeInTheDocument()
    expect(screen.getByTestId('terminal-scrollback').textContent).toContain('help')
  })

  it('pwd prints the home path', () => {
    render(<Terminal />)
    runCommand('pwd')
    const outputs = getOutputs()
    expect(outputs).toContain('/home/user')
  })

  it('ls lists the expected files and folders', () => {
    render(<Terminal />)
    runCommand('ls')
    const outputs = getOutputs()
    const lsOutput = outputs.find(o => o.includes('Documents'))
    expect(lsOutput).toBeDefined()
    expect(lsOutput).toContain('Documents/')
    expect(lsOutput).toContain('Downloads/')
    expect(lsOutput).toContain('Applications/')
    expect(lsOutput).toContain('Desktop/')
    expect(lsOutput).toContain('readme.md')
  })

  it('echo hi prints "hi"', () => {
    render(<Terminal />)
    runCommand('echo hi')
    const outputs = getOutputs()
    expect(outputs).toContain('hi')
  })

  it('help lists available commands', () => {
    render(<Terminal />)
    runCommand('help')
    const outputs = getOutputs()
    const helpOutput = outputs.find(o => o.includes('Available commands'))
    expect(helpOutput).toBeDefined()
    expect(helpOutput).toContain('pwd')
    expect(helpOutput).toContain('ls')
    expect(helpOutput).toContain('cd')
    expect(helpOutput).toContain('echo')
    expect(helpOutput).toContain('clear')
    expect(helpOutput).toContain('whoami')
    expect(helpOutput).toContain('date')
  })

  it('whoami prints "user"', () => {
    render(<Terminal />)
    runCommand('whoami')
    const outputs = getOutputs()
    expect(outputs).toContain('user')
  })

  it('unknown command prints "command not found"', () => {
    render(<Terminal />)
    runCommand('foobar')
    const outputs = getOutputs()
    expect(outputs.some(o => o.includes('command not found: foobar'))).toBe(true)
  })

  it('cd changes directory and pwd reflects the change', () => {
    render(<Terminal />)
    runCommand('cd Documents')
    runCommand('pwd')
    const outputs = getOutputs()
    expect(outputs).toContain('/home/user/Documents')
  })

  it('cd into nonexistent directory prints error', () => {
    render(<Terminal />)
    runCommand('cd nonexistent')
    const outputs = getOutputs()
    expect(outputs.some(o => o.includes('no such directory'))).toBe(true)
  })

  it('ls after cd shows contents of new directory', () => {
    render(<Terminal />)
    runCommand('cd Downloads')
    runCommand('ls')
    const outputs = getOutputs()
    const lsOutput = outputs.find(o => o.includes('installer.dmg'))
    expect(lsOutput).toBeDefined()
    expect(lsOutput).toContain('photo.jpg')
    expect(lsOutput).toContain('report.zip')
  })
})
