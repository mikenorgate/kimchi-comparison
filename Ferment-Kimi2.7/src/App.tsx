import { ThemeProvider } from './theme'
import { Desktop } from './components/shell'

function App() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  )
}

export default App
