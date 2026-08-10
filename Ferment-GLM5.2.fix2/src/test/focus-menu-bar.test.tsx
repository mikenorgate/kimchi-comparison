import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

/**
 * Runtime proof of the focus → menu-bar wiring.
 *
 * The shell boots with Finder active (an effect opens a Finder window on
 * mount). Clicking a Dock icon opens that app's window, which calls
 * os.setActiveAppId — and the menu bar must re-render with the new app's
 * name. This asserts the wiring end-to-end at runtime, not just that it
 * compiles.
 */
describe('focus → menu bar wiring', () => {
  it('re-titles the menu bar when a Dock app is launched', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Finder opens on mount → menu bar's active-app-name shows "Finder".
    let appName = await screen.findByTestId('active-app-name')
    expect(appName).toHaveTextContent('Finder')

    // Click the Calculator Dock icon.
    await user.click(screen.getByLabelText('Launch Calculator'))

    // The menu bar should now show "Calculator" as the active app name.
    appName = screen.getByTestId('active-app-name')
    expect(appName).toHaveTextContent('Calculator')
  })
})
