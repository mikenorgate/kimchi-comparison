import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContextMenu } from './ContextMenu'

describe('ContextMenu', () => {
  const items = [
    { id: 'open', label: 'Open', onClick: vi.fn() },
    { id: 'sep', label: '', separator: true },
    { id: 'info', label: 'Get Info', onClick: vi.fn() },
  ]

  it('opens on right click', () => {
    render(
      <ContextMenu items={items}>
        <div data-testid="target">Right click me</div>
      </ContextMenu>
    )
    fireEvent.contextMenu(screen.getByTestId('target'))
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('calls item onClick when selected', async () => {
    render(
      <ContextMenu items={items}>
        <div data-testid="target">Right click me</div>
      </ContextMenu>
    )
    fireEvent.contextMenu(screen.getByTestId('target'))
    await userEvent.click(screen.getByText('Open'))
    expect(items[0].onClick).toHaveBeenCalledTimes(1)
  })
})
