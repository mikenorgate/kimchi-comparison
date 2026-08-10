import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeProvider'

function ThemeConsumer() {
  const { mode, toggleMode } = useTheme()
  return (
    <button onClick={toggleMode} data-testid="theme-consumer">
      {mode}
    </button>
  )
}

describe('ThemeProvider', () => {
  it('renders children and exposes light mode by default', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme-consumer')).toHaveTextContent('light')
  })

  it('toggles the document.documentElement dark class when toggled', async () => {
    document.documentElement.classList.remove('dark')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    const button = screen.getByTestId('theme-consumer')
    fireEvent.click(button)
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
    fireEvent.click(button)
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false))
  })

  it('respects initialMode prop', () => {
    render(
      <ThemeProvider initialMode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme-consumer')).toHaveTextContent('dark')
  })
})
