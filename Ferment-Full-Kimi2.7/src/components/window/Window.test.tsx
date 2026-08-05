import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Window } from './Window'
import { DesktopProvider, useDesktop } from '../../desktop/store'
import { clearRegistry, registerApp } from '../../apps/registry'
import { Folder, Settings } from 'lucide-react'

const TestApp = () => null

function OpenAndRender({ appIds, children }: { appIds: string[]; children: (appId: string) => React.ReactNode }) {
  const { windows, openWindow } = useDesktop()
  return (
    <>
      {appIds.map((appId) => (
        <button key={appId} onClick={() => openWindow(appId)}>Open {appId}</button>
      ))}
      {windows.map((w) => (
        <Window key={w.id} window={w}>{children(w.appId)}</Window>
      ))}
    </>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <DesktopProvider>{children}</DesktopProvider>
}

describe('Window', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: TestApp, defaultSize: { width: 800, height: 500 } })
    registerApp({ id: 'settings', name: 'System Settings', icon: Settings, component: TestApp, defaultSize: { width: 700, height: 500 } })
  })

  it('renders a window with title bar buttons', async () => {
    render(
      <Wrapper>
        <OpenAndRender appIds={['finder']}>
          {() => <div data-testid="content">Hello</div>}
        </OpenAndRender>
      </Wrapper>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Open finder' }))
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTestId('window-close')).toBeInTheDocument()
    expect(screen.getByTestId('window-minimize')).toBeInTheDocument()
    expect(screen.getByTestId('window-maximize')).toBeInTheDocument()
  })

  it('closes a window when close button is clicked', async () => {
    render(
      <Wrapper>
        <OpenAndRender appIds={['finder']}>
          {() => <div data-testid="content">Hello</div>}
        </OpenAndRender>
      </Wrapper>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Open finder' }))
    await userEvent.click(screen.getByTestId('window-close'))
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('minimizes a window when minimize button is clicked', async () => {
    render(
      <Wrapper>
        <OpenAndRender appIds={['finder']}>
          {() => <div data-testid="content">Hello</div>}
        </OpenAndRender>
      </Wrapper>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Open finder' }))
    await userEvent.click(screen.getByTestId('window-minimize'))
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('maximizes a window when maximize button is clicked', async () => {
    render(
      <Wrapper>
        <OpenAndRender appIds={['finder']}>
          {() => <div data-testid="content">Hello</div>}
        </OpenAndRender>
      </Wrapper>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Open finder' }))
    await userEvent.click(screen.getByTestId('window-maximize'))
    const win = screen.getByTestId('content').closest('[data-testid^="window-"]') as HTMLElement
    expect(win).toHaveStyle({ width: `${window.innerWidth}px`, height: `${window.innerHeight - 28}px` })
  })

  it('focuses a window and updates z-order', async () => {
    render(
      <Wrapper>
        <OpenAndRender appIds={['finder', 'settings']}>
          {(appId) => <div data-testid={`${appId}-content`}>{appId}</div>}
        </OpenAndRender>
      </Wrapper>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Open finder' }))
    await userEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    const finderContent = screen.getByTestId('finder-content')
    const settingsContent = screen.getByTestId('settings-content')
    const finderWin = finderContent.closest('[data-testid^="window-"]') as HTMLElement
    const settingsWin = settingsContent.closest('[data-testid^="window-"]') as HTMLElement
    expect(settingsWin).toHaveStyle({ zIndex: '2' })
    await userEvent.click(finderWin)
    expect(finderWin).toHaveStyle({ zIndex: '3' })
  })
})
