import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ControlCenter } from './ControlCenter'
import { ThemeProvider } from '../../theme'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('ControlCenter', () => {
  it('renders the dropdown when open with toggles and sliders', () => {
    render(
      <Wrapper>
        <ControlCenter open onClose={() => {}} />
      </Wrapper>,
    )

    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument()
    expect(screen.getByTestId('control-center-wifi-toggle')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('control-center-bluetooth-toggle')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('control-center-brightness-slider')).toBeInTheDocument()
    expect(screen.getByTestId('control-center-volume-slider')).toBeInTheDocument()
  })

  it('toggles a control when a toggle button is clicked', () => {
    render(
      <Wrapper>
        <ControlCenter open onClose={() => {}} />
      </Wrapper>,
    )

    const wifi = screen.getByTestId('control-center-wifi-toggle')
    expect(wifi).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(wifi)
    expect(wifi).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(wifi)
    expect(wifi).toHaveAttribute('aria-checked', 'true')
  })

  it('updates slider values', () => {
    render(
      <Wrapper>
        <ControlCenter open onClose={() => {}} />
      </Wrapper>,
    )

    const brightness = screen.getByTestId('control-center-brightness-slider')
    expect(brightness).toHaveValue('75')
    fireEvent.change(brightness, { target: { value: '42' } })
    expect(brightness).toHaveValue('42')
  })

  it('closes when the overlay is clicked', () => {
    const onClose = vi.fn()
    render(
      <Wrapper>
        <ControlCenter open onClose={onClose} />
      </Wrapper>,
    )

    fireEvent.click(screen.getByTestId('control-center-overlay'))
    expect(onClose).toHaveBeenCalled()
  })
})
