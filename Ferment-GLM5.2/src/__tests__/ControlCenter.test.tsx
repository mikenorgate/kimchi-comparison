import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import ControlCenter from '../components/ControlCenter'

afterEach(() => cleanup())

function openPanel() {
  act(() => {
    document.dispatchEvent(new CustomEvent('toggle-control-center'))
  })
}

describe('ControlCenter component', () => {
  it('panel is not visible initially', () => {
    render(<ControlCenter />)
    expect(screen.queryByTestId('control-center-panel')).not.toBeInTheDocument()
  })

  it('panel opens when toggled from menu bar', async () => {
    render(<ControlCenter />)
    openPanel()
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument()
  })

  it('brightness slider changes state and updates value display', () => {
    render(<ControlCenter />)
    openPanel()

    const slider = screen.getByTestId('brightness-slider') as HTMLInputElement
    expect(slider.value).toBe('80')

    fireEvent.change(slider, { target: { value: '45' } })

    expect(slider.value).toBe('45')
    expect(screen.getByTestId('brightness-value').textContent).toBe('45%')
  })

  it('volume slider changes state and updates value display', () => {
    render(<ControlCenter />)
    openPanel()

    const slider = screen.getByTestId('volume-slider') as HTMLInputElement
    expect(slider.value).toBe('60')

    fireEvent.change(slider, { target: { value: '30' } })

    expect(slider.value).toBe('30')
    expect(screen.getByTestId('volume-value').textContent).toBe('30%')
  })

  it('Wi-Fi toggle flips state when clicked', () => {
    render(<ControlCenter />)
    openPanel()

    const wifiToggle = screen.getByTestId('toggle-wifi')
    expect(wifiToggle.getAttribute('data-active')).toBe('true')

    fireEvent.click(wifiToggle)
    expect(wifiToggle.getAttribute('data-active')).toBe('false')

    fireEvent.click(wifiToggle)
    expect(wifiToggle.getAttribute('data-active')).toBe('true')
  })

  it('Bluetooth toggle flips state when clicked', () => {
    render(<ControlCenter />)
    openPanel()

    const btToggle = screen.getByTestId('toggle-bluetooth')
    expect(btToggle.getAttribute('data-active')).toBe('true')

    fireEvent.click(btToggle)
    expect(btToggle.getAttribute('data-active')).toBe('false')
  })

  it('AirDrop toggle flips state when clicked', () => {
    render(<ControlCenter />)
    openPanel()

    const airdropToggle = screen.getByTestId('toggle-airdrop')
    expect(airdropToggle.getAttribute('data-active')).toBe('false')

    fireEvent.click(airdropToggle)
    expect(airdropToggle.getAttribute('data-active')).toBe('true')
  })

  it('panel closes when toggled again', () => {
    render(<ControlCenter />)
    openPanel()
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument()
    openPanel()
    expect(screen.queryByTestId('control-center-panel')).not.toBeInTheDocument()
  })
})
