import { AppWindow } from 'lucide-react'
import { registerApp, type AppDefinition } from '../lib/registry'

/**
 * Step-3 stub app so the window manager has something to mount and the Dock
 * has an icon to launch. Step 5 replaces this with the 12 real apps.
 */
function TestAppContent() {
  return (
    <div className="p-6 text-[13px]" data-testid="test-app-content">
      <h1 className="text-lg font-semibold">Test App</h1>
      <p className="mt-2 text-black/60">
        A stub application mounted inside a window. Real apps arrive in step 5.
      </p>
    </div>
  )
}

const testApp: AppDefinition = {
  appId: 'test',
  title: 'Test App',
  icon: <AppWindow size={28} />,
  defaultSize: { w: 560, h: 400 },
  render: () => <TestAppContent />,
}

registerApp(testApp)
