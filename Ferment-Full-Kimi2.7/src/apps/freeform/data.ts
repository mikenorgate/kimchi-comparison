import type { BoardItem } from './types'

export const initialBoardItems: BoardItem[] = [
  {
    id: 'item-1',
    type: 'note',
    x: 120,
    y: 100,
    text: 'Welcome to Freeform',
    color: 'bg-tahoe-yellow',
  },
  {
    id: 'item-2',
    type: 'square',
    x: 360,
    y: 140,
    color: 'bg-tahoe-teal',
  },
  {
    id: 'item-3',
    type: 'circle',
    x: 240,
    y: 280,
    color: 'bg-tahoe-pink',
  },
]
