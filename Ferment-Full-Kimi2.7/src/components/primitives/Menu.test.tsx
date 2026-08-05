import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Menu } from './Menu'

describe('Menu', () => {
  const items = [
    { id: 'new', label: 'New', shortcut: '⌘N', onClick: vi.fn() },
    { id: 'sep', label: '', separator: true },
    { id: 'quit', label: 'Quit', onClick: vi.fn() },
  ]

  it('renders label', () => {
    render(<Menu label="File" items={items} open />)
    expect(screen.getByText('File')).toBeInTheDocument()
  })

  it('shows menu items when open', () => {
    render(<Menu label="File" items={items} open />)
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Quit')).toBeInTheDocument()
  })

  it('calls item onClick and closes menu', async () => {
    render(<Menu label="File" items={items} />)
    await userEvent.hover(screen.getByText('File'))
    await userEvent.click(screen.getByText('New'))
    expect(items[0].onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('New')).not.toBeInTheDocument()
  })
})
