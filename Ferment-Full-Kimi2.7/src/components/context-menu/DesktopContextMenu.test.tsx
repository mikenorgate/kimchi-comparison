import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DesktopContextMenu } from './DesktopContextMenu'

describe('DesktopContextMenu', () => {
  it('opens on right-click and shows menu items', async () => {
    render(
      <DesktopContextMenu>
        <div data-testid="desktop">Desktop</div>
      </DesktopContextMenu>
    )
    await userEvent.pointer({ target: screen.getByTestId('desktop'), keys: '[MouseRight]' })
    expect(screen.getByRole('button', { name: 'New Folder' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get Info' })).toBeInTheDocument()
  })

  it('closes on click outside', async () => {
    render(
      <DesktopContextMenu>
        <div data-testid="desktop">Desktop</div>
      </DesktopContextMenu>
    )
    await userEvent.pointer({ target: screen.getByTestId('desktop'), keys: '[MouseRight]' })
    expect(screen.getByRole('button', { name: 'New Folder' })).toBeInTheDocument()
    await userEvent.click(document.body)
    expect(screen.queryByRole('button', { name: 'New Folder' })).not.toBeInTheDocument()
  })
})
