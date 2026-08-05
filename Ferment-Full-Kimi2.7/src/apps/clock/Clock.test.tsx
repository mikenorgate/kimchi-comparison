import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Clock } from './Clock'

function alarmItems() {
  return screen.getAllByTestId('clock-alarm-item')
}

describe('Clock', () => {
  beforeEach(() => {
    render(<Clock />)
  })

  it('renders the world clock tab by default', () => {
    expect(screen.getByTestId('clock-world-panel')).toBeInTheDocument()
    expect(screen.getByTestId('clock-digital-time')).toBeInTheDocument()
    expect(screen.getByTestId('clock-world-cupertino')).toBeInTheDocument()
  })

  it('switches to the alarm tab and toggles an alarm', async () => {
    await userEvent.click(screen.getByTestId('clock-tab-alarm'))
    expect(screen.getByTestId('clock-alarm-panel')).toBeInTheDocument()
    const toggle = screen.getAllByTestId(/^clock-alarm-toggle-/)[0].closest('input') as HTMLInputElement
    const initial = toggle.checked
    await userEvent.click(toggle)
    expect(toggle.checked).toBe(!initial)
  })

  it('adds and deletes an alarm', async () => {
    await userEvent.click(screen.getByTestId('clock-tab-alarm'))
    expect(alarmItems().length).toBe(2)
    await userEvent.click(screen.getByTestId('clock-add-alarm'))
    expect(alarmItems().length).toBe(3)
    const deleteButton = screen.getAllByTestId(/^clock-alarm-delete-/)[0]
    await userEvent.click(deleteButton)
    expect(alarmItems().length).toBe(2)
  })

  it('starts and resets the stopwatch', async () => {
    await userEvent.click(screen.getByTestId('clock-tab-stopwatch'))
    const display = screen.getByTestId('clock-stopwatch-display')
    const toggle = screen.getByTestId('clock-stopwatch-toggle')
    expect(display).toHaveTextContent('00:00.00')
    expect(toggle).toHaveTextContent('Start')
    await userEvent.click(toggle)
    expect(toggle).toHaveTextContent('Pause')
    await userEvent.click(screen.getByTestId('clock-stopwatch-reset'))
    expect(display).toHaveTextContent('00:00.00')
    expect(screen.getByTestId('clock-stopwatch-toggle')).toHaveTextContent('Start')
  })
})
