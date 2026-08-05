import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Folder } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { AppIcon } from './AppIcon'

describe('AppIcon', () => {
  it('renders icon', () => {
    render(<AppIcon icon={Folder} label="Finder" />)
    expect(screen.getByRole('button', { name: 'Finder' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<AppIcon icon={Folder} label="Finder" onClick={handleClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows running indicator', () => {
    render(<AppIcon icon={Folder} label="Finder" running />)
    expect(screen.getByRole('button').querySelector('.rounded-full')).toBeInTheDocument()
  })
})
