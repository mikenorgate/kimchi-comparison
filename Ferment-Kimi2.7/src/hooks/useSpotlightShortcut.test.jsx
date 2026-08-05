import { describe, it, expect, vi } from 'vitest'
import { renderHook, fireEvent } from '@testing-library/react'
import { useSpotlightShortcut } from './useSpotlightShortcut'

describe('useSpotlightShortcut', () => {
  it('calls callback on Cmd+Space', () => {
    const callback = vi.fn()
    renderHook(() => useSpotlightShortcut(callback))
    fireEvent.keyDown(document, { metaKey: true, code: 'Space' })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not call callback on other keys', () => {
    const callback = vi.fn()
    renderHook(() => useSpotlightShortcut(callback))
    fireEvent.keyDown(document, { metaKey: true, code: 'KeyA' })
    expect(callback).not.toHaveBeenCalled()
  })
})
