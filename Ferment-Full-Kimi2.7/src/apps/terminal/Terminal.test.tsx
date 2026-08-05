import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Terminal } from './Terminal'
import { executeCommand } from './commands'
import { clearRegistry, registerApp } from '../registry'
import { Terminal as TerminalIcon } from 'lucide-react'

describe('Terminal', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'terminal', name: 'Terminal', icon: TerminalIcon, component: Terminal, defaultSize: { width: 720, height: 460 } })
  })

  it('renders the terminal prompt', () => {
    render(<Terminal />)
    expect(screen.getByTestId('terminal')).toBeInTheDocument()
    expect(screen.getByText('tahoe@macbook ~ %')).toBeInTheDocument()
  })

  it('executes an echo command and displays output', async () => {
    render(<Terminal />)
    const input = screen.getByLabelText('Terminal command input')
    await userEvent.type(input, 'echo hello world')
    await userEvent.keyboard('{Enter}')
    expect(screen.getAllByTestId('terminal-output').some((el) => el.textContent === 'hello world')).toBe(true)
  })

  it('shows command not found for unknown commands', async () => {
    render(<Terminal />)
    const input = screen.getByLabelText('Terminal command input')
    await userEvent.type(input, 'foobar')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('zsh: command not found: foobar')).toBeInTheDocument()
  })

  it('cycles through command history with arrow keys', async () => {
    render(<Terminal />)
    const input = screen.getByLabelText('Terminal command input')
    await userEvent.type(input, 'echo first')
    await userEvent.keyboard('{Enter}')
    await userEvent.type(input, 'echo second')
    await userEvent.keyboard('{Enter}')
    await userEvent.type(input, 'echo third')
    await userEvent.keyboard('{Enter}')

    await userEvent.type(input, '{arrowup}')
    expect(input).toHaveValue('echo third')
    await userEvent.type(input, '{arrowup}')
    expect(input).toHaveValue('echo second')
    await userEvent.type(input, '{arrowup}')
    expect(input).toHaveValue('echo first')
    await userEvent.type(input, '{arrowdown}')
    expect(input).toHaveValue('echo second')
    await userEvent.type(input, '{arrowdown}')
    expect(input).toHaveValue('echo third')
    await userEvent.type(input, '{arrowdown}')
    expect(input).toHaveValue('')
  })

  it('clears the terminal with clear command', async () => {
    render(<Terminal />)
    const input = screen.getByLabelText('Terminal command input')
    await userEvent.type(input, 'echo keep')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('keep')).toBeInTheDocument()
    await userEvent.type(input, 'clear')
    await userEvent.keyboard('{Enter}')
    expect(screen.queryByText('keep')).not.toBeInTheDocument()
  })

  it('returns help output from executeCommand', () => {
    const result = executeCommand('help', { cwd: '/Users/tahoe-user' })
    expect(result.lines[0]).toBe('Available commands:')
  })
})
