import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ControlCenter } from './ControlCenter'

describe('ControlCenter', () => {
  it('is hidden when isOpen is false', () => {
    render(<ControlCenter isOpen={false} onClose={() => {}} />)
    expect(screen.queryByTestId('control-center-panel')).not.toBeInTheDocument()
  })

  it('renders toggles and sliders when open', () => {
    render(<ControlCenter isOpen onClose={() => {}} />)
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument()
    expect(screen.getByTestId('cc-wifi')).toBeInTheDocument()
    expect(screen.getByTestId('cc-bluetooth')).toBeInTheDocument()
    expect(screen.getByTestId('cc-dnd')).toBeInTheDocument()
    expect(screen.getByTestId('cc-brightness')).toBeInTheDocument()
    expect(screen.getByTestId('cc-volume')).toBeInTheDocument()
  })

  it('toggles Wi-Fi on and off', () => {
    render(<ControlCenter isOpen onClose={() => {}} />)
    const wifi = screen.getByTestId('cc-wifi')
    expect(wifi).toHaveStyle({ background: 'var(--color-accent)' })
    fireEvent.click(wifi)
    expect(wifi).not.toHaveStyle({ background: 'var(--color-accent)' })
    fireEvent.click(wifi)
    expect(wifi).toHaveStyle({ background: 'var(--color-accent)' })
  })

  it('toggles Bluetooth and DND', () => {
    render(<ControlCenter isOpen onClose={() => {}} />)
    const bluetooth = screen.getByTestId('cc-bluetooth')
    const dnd = screen.getByTestId('cc-dnd')
    expect(bluetooth).toHaveStyle({ background: 'var(--color-accent)' })
    expect(dnd).not.toHaveStyle({ background: 'var(--color-accent)' })
    fireEvent.click(bluetooth)
    fireEvent.click(dnd)
    expect(bluetooth).not.toHaveStyle({ background: 'var(--color-accent)' })
    expect(dnd).toHaveStyle({ background: 'var(--color-accent)' })
  })

  it('updates brightness and volume sliders', () => {
    render(<ControlCenter isOpen onClose={() => {}} />)
    const brightnessInput = screen.getByTestId('cc-brightness').querySelector('input')
    const volumeInput = screen.getByTestId('cc-volume').querySelector('input')
    fireEvent.change(brightnessInput, { target: { value: '90' } })
    fireEvent.change(volumeInput, { target: { value: '30' } })
    expect(brightnessInput).toHaveValue('90')
    expect(volumeInput).toHaveValue('30')
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    render(<ControlCenter isOpen onClose={onClose} />)
    fireEvent.click(screen.getByTestId('control-center-overlay'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
