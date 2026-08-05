import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import App from './App'
import { clearRegistry } from './apps/registry'
import { registerDefaultApps } from './apps'

describe('Productivity apps launch from Dock', () => {
  beforeEach(() => {
    clearRegistry()
    registerDefaultApps()
  })

  it.each([
    ['Calculator', 'calculator'],
    ['Notes', 'notes-app'],
    ['Calendar', 'calendar-app'],
    ['Reminders', 'reminders-app'],
    ['Clock', 'clock-app'],
    ['Weather', 'weather-app'],
  ])('opens %s from the Dock', async (name, testId) => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name }))
    expect(screen.getByTestId(testId)).toBeInTheDocument()
    expect(screen.getAllByText(name).length).toBeGreaterThanOrEqual(1)
  })
})
