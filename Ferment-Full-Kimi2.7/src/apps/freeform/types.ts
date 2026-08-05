export type ItemType = 'note' | 'square' | 'circle'

export interface BoardItem {
  id: string
  type: ItemType
  x: number
  y: number
  text?: string
  color?: string
}
