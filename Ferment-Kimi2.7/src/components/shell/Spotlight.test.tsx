import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Spotlight } from './Spotlight'
import { WindowManagerProvider } from '../window'
import { ThemeProvider } from '../../theme'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WindowManagerProvider>{children}</WindowManagerProvider>
    </ThemeProvider>
  )
}

describe('Spotlight', () => {
  it('renders when open and shows all applications and actions', () => {
    render(
      <Wrapper>
        <Spotlight open onClose={() => {}} />
      </Wrapper>,
    )

    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-input')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-result-finder')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-result-safari')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-action-lock-screen')).toBeInTheDocument()
  })

  it('filters results when typing in the search input', () => {
    render(
      <Wrapper>
        <Spotlight open onClose={() => {}} />
      </Wrapper>,
    )

    const input = screen.getByTestId('spotlight-input')
    fireEvent.change(input, { target: { value: 'safari' } })

    expect(screen.getByTestId('spotlight-result-safari')).toBeInTheDocument()
    expect(screen.queryByTestId('spotlight-result-finder')).not.toBeInTheDocument()
    expect(screen.queryByTestId('spotlight-action-lock-screen')).not.toBeInTheDocument()
  })

  it('closes and opens a window when an app result is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Wrapper>
        <Spotlight open onClose={onClose} />
      </Wrapper>,
    )

    fireEvent.click(screen.getByTestId('spotlight-result-notes'))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('closes when Escape is pressed', () => {
    const onClose = vi.fn()
    render(
      <Wrapper>
        <Spotlight open onClose={onClose} />
      </Wrapper>,
    )

    fireEvent.keyDown(screen.getByTestId('spotlight-input'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
