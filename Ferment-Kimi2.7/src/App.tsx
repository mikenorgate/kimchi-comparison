import './index.css'
import { WindowManagerProvider } from './store/windows'

function App() {
  return (
    <WindowManagerProvider>
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">Tahoe Web Desktop</h1>
      </main>
    </WindowManagerProvider>
  )
}

export default App
