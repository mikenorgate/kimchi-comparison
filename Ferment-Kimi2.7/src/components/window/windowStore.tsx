import {
  useReducer,
  useMemo,
  useCallback,
} from 'react'
import { WindowManagerContext } from './WindowManagerContext'
import type { WindowManagerContextValue } from './WindowManagerContext'

export interface WindowItem {
  id: string
  appId: string
  title: string
  icon?: React.ReactNode
  x: number
  y: number
  width: number
  height: number
  prevBounds?: { x: number; y: number; width: number; height: number } | null
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

export interface WindowManagerState {
  windows: WindowItem[]
  focusedId: string | null
  nextZ: number
}

type Action =
  | { type: 'OPEN'; payload: Omit<WindowItem, 'zIndex'> & { zIndex?: number } }
  | { type: 'CLOSE'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'MAXIMIZE'; id: string }
  | { type: 'RESTORE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'RESIZE'; id: string; width: number; height: number }

const INITIAL_Z = 100

function createInitialState(): WindowManagerState {
  return { windows: [], focusedId: null, nextZ: INITIAL_Z }
}

function reducer(state: WindowManagerState, action: Action): WindowManagerState {
  switch (action.type) {
    case 'OPEN': {
      const existing = state.windows.find((w) => w.id === action.payload.id)
      if (existing) {
        return reducer(state, { type: 'FOCUS', id: existing.id })
      }
      const nextZ = state.nextZ
      const windowItem: WindowItem = {
        ...action.payload,
        zIndex: action.payload.zIndex ?? nextZ,
        isOpen: true,
        isMinimized: false,
      }
      return {
        ...state,
        windows: [...state.windows, windowItem],
        focusedId: windowItem.id,
        nextZ: nextZ + 1,
      }
    }
    case 'CLOSE': {
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.id),
        focusedId:
          state.focusedId === action.id
            ? state.windows
                .filter((w) => w.id !== action.id)
                .sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null
            : state.focusedId,
      }
    }
    case 'MINIMIZE': {
      const nextWindows = state.windows.map((w) =>
        w.id === action.id ? { ...w, isMinimized: true } : w,
      )
      return {
        ...state,
        windows: nextWindows,
        focusedId:
          state.focusedId === action.id
            ? nextWindows
                .filter((w) => !w.isMinimized && w.isOpen)
                .sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null
            : state.focusedId,
      }
    }
    case 'MAXIMIZE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                isMaximized: true,
                prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
              }
            : w,
        ),
        focusedId: action.id,
      }
    }
    case 'RESTORE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                isMaximized: false,
                isMinimized: false,
                ...(w.prevBounds
                  ? {
                      x: w.prevBounds.x,
                      y: w.prevBounds.y,
                      width: w.prevBounds.width,
                      height: w.prevBounds.height,
                    }
                  : {}),
              }
            : w,
        ),
      }
    }
    case 'FOCUS': {
      if (state.focusedId === action.id) return state
      const nextZ = state.nextZ
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, zIndex: nextZ } : w,
        ),
        focusedId: action.id,
        nextZ: nextZ + 1,
      }
    }
    case 'MOVE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      }
    }
    case 'RESIZE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, width: action.width, height: action.height }
            : w,
        ),
      }
    }
    default:
      return state
  }
}

export function WindowManagerProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: WindowManagerState
}) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState ?? createInitialState(),
  )

  const openWindow = useCallback(
    (window: Omit<WindowItem, 'zIndex'> & { zIndex?: number }) => {
      dispatch({ type: 'OPEN', payload: window })
    },
    [],
  )

  const closeWindow = useCallback((id: string) => {
    dispatch({ type: 'CLOSE', id })
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    dispatch({ type: 'MINIMIZE', id })
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    dispatch({ type: 'MAXIMIZE', id })
  }, [])

  const restoreWindow = useCallback((id: string) => {
    dispatch({ type: 'RESTORE', id })
  }, [])

  const focusWindow = useCallback((id: string) => {
    dispatch({ type: 'FOCUS', id })
  }, [])

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE', id, x, y })
  }, [])

  const resizeWindow = useCallback(
    (id: string, width: number, height: number) => {
      dispatch({ type: 'RESIZE', id, width, height })
    },
    [],
  )

  const value = useMemo<WindowManagerContextValue>(
    () => ({
      state,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
    }),
    [
      state,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
    ],
  )

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}

export type { WindowManagerContextValue } from './WindowManagerContext'


