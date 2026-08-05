import { type ReactNode } from 'react'
import { DesktopProvider } from './store'
import { Wallpaper } from './Wallpaper'

export interface DesktopProps {
  children?: ReactNode
}

export function Desktop({ children }: DesktopProps) {
  return (
    <DesktopProvider>
      <div data-testid="desktop" className="relative w-full h-full overflow-hidden bg-tahoe-bg">
        <Wallpaper />
        {children}
      </div>
    </DesktopProvider>
  )
}
