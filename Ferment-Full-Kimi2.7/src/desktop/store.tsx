import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from 'react'
import { getApp } from '../apps/registry'

export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  z: number
}

interface DesktopState {
  windows: WindowState[]
  activeWindowId: string | null
  nextZ: number
}

type Action =
  | { type: 'OPEN_WINDOW'; payload: { appId: string; title: string; width: number; height: number } }
  | { type: 'CLOSE_WINDOW'; payload: { id: string } }
  | { type: 'FOCUS_WINDOW'; payload: { id: string } }
  | { type: 'MINIMIZE_WINDOW'; payload: { id: string } }
  | { type: 'MAXIMIZE_WINDOW'; payload: { id: string } }
  | { type: 'RESTORE_WINDOW'; payload: { id: string; x: number; y: number; width: number; height: number } }
  | { type: 'MOVE_WINDOW'; payload: { id: string; x: number; y: number } }
  | { type: 'RESIZE_WINDOW'; payload: { id: string; width: number; height: number } }

const initialState: DesktopState = {
  windows: [],
  activeWindowId: null,
  nextZ: 1,
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function centerPosition(width: number, height: number, offset = 0) {
  const x = typeof window !== 'undefined' ? Math.max(20, (window.innerWidth - width) / 2 + offset) : 100 + offset
  const y = typeof window !== 'undefined' ? Math.max(40, (window.innerHeight - height) / 2 + offset) : 80 + offset
  return { x, y }
}

function reducer(state: DesktopState, action: Action): DesktopState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const { appId, title, width, height } = action.payload
      const existingCount = state.windows.filter((w) => w.appId === appId && !w.minimized).length
      const offset = existingCount * 24
      const { x, y } = centerPosition(width, height, offset)
      const id = generateId()
      const window: WindowState = {
        id,
        appId,
        title,
        x,
        y,
        width,
        height,
        minimized: false,
        maximized: false,
        z: state.nextZ,
      }
      return {
        ...state,
        windows: [...state.windows, window],
        activeWindowId: id,
        nextZ: state.nextZ + 1,
      }
    }
    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.payload.id),
        activeWindowId: state.activeWindowId === action.payload.id
          ? state.windows.find((w) => w.id !== action.payload.id)?.id ?? null
          : state.activeWindowId,
      }
    case 'FOCUS_WINDOW':
      return {
        ...state,
        activeWindowId: action.payload.id,
        nextZ: state.nextZ + 1,
        windows: state.windows.map((w) =>
          w.id === action.payload.id ? { ...w, z: state.nextZ, minimized: false } : w
        ),
      }
    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id ? { ...w, minimized: true } : w
        ),
        activeWindowId: state.activeWindowId === action.payload.id
          ? state.windows.find((w) => w.id !== action.payload.id && !w.minimized)?.id ?? null
          : state.activeWindowId,
      }
    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? { ...w, maximized: true, x: 0, y: 28, width: window.innerWidth, height: window.innerHeight - 28 }
            : w
        ),
      }
    case 'RESTORE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? { ...w, maximized: false, x: action.payload.x, y: action.payload.y, width: action.payload.width, height: action.payload.height }
            : w
        ),
      }
    case 'MOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id ? { ...w, x: action.payload.x, y: action.payload.y } : w
        ),
      }
    case 'RESIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id ? { ...w, width: action.payload.width, height: action.payload.height } : w
        ),
      }
    default:
      return state
  }
}

interface DesktopContextValue extends DesktopState {
  openWindow: (appId: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string, x: number, y: number, width: number, height: number) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
}

const DesktopContext = createContext<DesktopContextValue | null>(null)

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo<DesktopContextValue>(() => ({
    ...state,
    openWindow: (appId: string) => {
      const app = getApp(appId)
      if (!app) return
      dispatch({
        type: 'OPEN_WINDOW',
        payload: {
          appId,
          title: app.name,
          width: app.defaultSize.width,
          height: app.defaultSize.height,
        },
      })
    },
    closeWindow: (id: string) => dispatch({ type: 'CLOSE_WINDOW', payload: { id } }),
    focusWindow: (id: string) => dispatch({ type: 'FOCUS_WINDOW', payload: { id } }),
    minimizeWindow: (id: string) => dispatch({ type: 'MINIMIZE_WINDOW', payload: { id } }),
    maximizeWindow: (id: string) => dispatch({ type: 'MAXIMIZE_WINDOW', payload: { id } }),
    restoreWindow: (id: string, x: number, y: number, width: number, height: number) =>
      dispatch({ type: 'RESTORE_WINDOW', payload: { id, x, y, width, height } }),
    moveWindow: (id: string, x: number, y: number) => dispatch({ type: 'MOVE_WINDOW', payload: { id, x, y } }),
    resizeWindow: (id: string, width: number, height: number) => dispatch({ type: 'RESIZE_WINDOW', payload: { id, width, height } }),
  }), [state])

  return (
    <DesktopContext.Provider value={value}>
      {children}
    </DesktopContext.Provider>
  )
}

export function useDesktop(): DesktopContextValue {
  const context = useContext(DesktopContext)
  if (!context) {
    throw new Error('useDesktop must be used within a DesktopProvider')
  }
  return context
}

export { initialState, reducer }
export type { DesktopState, Action }
