import type { ComponentType } from 'react'

export interface Tab {
  id: string
  title: string
  url: string
}

export interface HistoryEntry {
  id: string
  url: string
  title: string
  timestamp: number
}

export interface MockPage {
  url: string
  title: string
  content: ComponentType
}
