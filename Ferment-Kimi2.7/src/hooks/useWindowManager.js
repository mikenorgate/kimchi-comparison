import { useCallback, useEffect, useRef } from 'react'
import { useDesktopStore } from '../store/desktopStore'

export function useWindowManager(windowId) {
  const windowState = useDesktopStore((state) =>
    state.windows.find((w) => w.id === windowId)
  )
  const activeWindowId = useDesktopStore((state) => state.activeWindowId)
  const focusWindow = useDesktopStore((state) => state.focusWindow)
  const closeWindow = useDesktopStore((state) => state.closeWindow)
  const minimizeWindow = useDesktopStore((state) => state.minimizeWindow)
  const moveWindow = useDesktopStore((state) => state.moveWindow)
  const resizeWindow = useDesktopStore((state) => state.resizeWindow)

  const isActive = activeWindowId === windowId
  const isMinimized = windowState?.minimized ?? false

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 })
  const resizeRef = useRef({ resizing: false, startX: 0, startY: 0, origW: 0, origH: 0 })

  const focus = useCallback(() => focusWindow(windowId), [focusWindow, windowId])
  const close = useCallback(() => closeWindow(windowId), [closeWindow, windowId])
  const minimize = useCallback(() => minimizeWindow(windowId), [minimizeWindow, windowId])

  const handleTitleMouseDown = useCallback(
    (e) => {
      e.preventDefault()
      focus()
      if (!windowState) return
      dragRef.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: windowState.x,
        origY: windowState.y,
      }
    },
    [focus, windowState]
  )

  const handleResizeMouseDown = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      focus()
      if (!windowState) return
      resizeRef.current = {
        resizing: true,
        startX: e.clientX,
        startY: e.clientY,
        origW: windowState.width,
        origH: windowState.height,
      }
    },
    [focus, windowState]
  )

  useEffect(() => {
    function handleMouseMove(e) {
      if (dragRef.current.dragging) {
        const dx = e.clientX - dragRef.current.startX
        const dy = e.clientY - dragRef.current.startY
        moveWindow(windowId, dragRef.current.origX + dx, dragRef.current.origY + dy)
      }
      if (resizeRef.current.resizing) {
        const dx = e.clientX - resizeRef.current.startX
        const dy = e.clientY - resizeRef.current.startY
        resizeWindow(
          windowId,
          Math.max(200, resizeRef.current.origW + dx),
          Math.max(150, resizeRef.current.origH + dy)
        )
      }
    }

    function handleMouseUp() {
      dragRef.current.dragging = false
      resizeRef.current.resizing = false
    }

    const target = typeof window !== 'undefined' && window.addEventListener ? window : document
    target.addEventListener('mousemove', handleMouseMove)
    target.addEventListener('mouseup', handleMouseUp)
    return () => {
      target.removeEventListener('mousemove', handleMouseMove)
      target.removeEventListener('mouseup', handleMouseUp)
    }
  }, [moveWindow, resizeWindow, windowId])

  return {
    window: windowState,
    isActive,
    isMinimized,
    focus,
    close,
    minimize,
    handlers: {
      onTitleMouseDown: handleTitleMouseDown,
      onResizeMouseDown: handleResizeMouseDown,
    },
  }
}

export default useWindowManager
