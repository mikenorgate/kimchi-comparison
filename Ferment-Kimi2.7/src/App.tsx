import { ThemeProvider } from './theme'
import { Desktop } from './components/shell'
import { WindowManagerProvider } from './components/window'

function App() {
  return (
    <ThemeProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </ThemeProvider>
  )
}

export default App
