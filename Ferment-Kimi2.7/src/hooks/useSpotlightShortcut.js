import { useEffect } from 'react'

export function useSpotlightShortcut(callback) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.metaKey && e.code === 'Space') {
        e.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [callback])
}

export default useSpotlightShortcut
