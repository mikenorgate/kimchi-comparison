import { useContext } from 'react'
import { WindowManagerContext, type WindowManagerContextValue } from './WindowManagerContext'

export function useWindowManager(): WindowManagerContextValue {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error(
      'useWindowManager must be used within a WindowManagerProvider',
    )
  }
  return context
}
