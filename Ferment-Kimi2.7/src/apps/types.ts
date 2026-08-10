import type { ComponentType } from 'react'

export interface AppDefinition {
  id: string
  name: string
  shortName?: string
  icon: ComponentType<{ className?: string }>
  component: ComponentType<{ windowId?: string }>
  category: 'system' | 'productivity' | 'media' | 'communication'
  defaultWidth: number
  defaultHeight: number
}
