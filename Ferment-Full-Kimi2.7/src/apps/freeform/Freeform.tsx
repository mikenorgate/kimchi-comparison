import { useState, useCallback, useMemo } from 'react'
import {
  StickyNote,
  Square,
  Circle,
  Trash2,
  MousePointer2,
} from 'lucide-react'
import { initialBoardItems } from './data'
import type { BoardItem, ItemType } from './types'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const colors = [
  'bg-tahoe-yellow',
  'bg-tahoe-teal',
  'bg-tahoe-pink',
  'bg-tahoe-purple',
  'bg-tahoe-green',
  'bg-tahoe-orange',
]

export function Freeform() {
  const [items, setItems] = useState<BoardItem[]>(initialBoardItems)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nextColorIndex, setNextColorIndex] = useState(3)

  const addItem = useCallback((type: ItemType) => {
    setItems((prev) => {
      const color = colors[nextColorIndex % colors.length]
      setNextColorIndex((i) => i + 1)
      const newItem: BoardItem = {
        id: generateId(),
        type,
        x: 80 + (prev.length * 20) % 300,
        y: 80 + (prev.length * 20) % 200,
        text: type === 'note' ? 'New note' : undefined,
        color,
      }
      return [...prev, newItem]
    })
  }, [nextColorIndex])

  const clearBoard = useCallback(() => {
    setItems([])
    setSelectedId(null)
  }, [])

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    setItems((prev) => prev.filter((item) => item.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  )

  const updateSelectedText = useCallback((text: string) => {
    if (!selectedId) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, text } : item
      )
    )
  }, [selectedId])

  return (
    <div
      className="flex h-full bg-tahoe-surface text-tahoe-text overflow-hidden"
      data-testid="freeform-app"
    >
      <div
        className="w-16 flex flex-col items-center gap-3 border-r border-white/10 bg-tahoe-glass/30 py-4"
        data-testid="freeform-toolbar"
      >
        <button
          onClick={() => setSelectedId(null)}
          className={`p-2 rounded-md transition-colors ${
            selectedId === null ? 'bg-tahoe-accent text-white' : 'hover:bg-white/10'
          }`}
          aria-label="Select"
          data-testid="freeform-tool-select"
        >
          <MousePointer2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => addItem('note')}
          className="p-2 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
          aria-label="Add sticky note"
          data-testid="freeform-tool-note"
        >
          <StickyNote className="w-5 h-5" />
        </button>
        <button
          onClick={() => addItem('square')}
          className="p-2 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
          aria-label="Add square"
          data-testid="freeform-tool-square"
        >
          <Square className="w-5 h-5" />
        </button>
        <button
          onClick={() => addItem('circle')}
          className="p-2 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
          aria-label="Add circle"
          data-testid="freeform-tool-circle"
        >
          <Circle className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        <button
          onClick={deleteSelected}
          disabled={!selectedId}
          className="p-2 rounded-md hover:bg-red-500/20 text-tahoe-text-secondary hover:text-red-400 disabled:opacity-30"
          aria-label="Delete selected"
          data-testid="freeform-tool-delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={clearBoard}
          className="p-2 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
          aria-label="Clear board"
          data-testid="freeform-tool-clear"
        >
          <span className="text-xs font-semibold">Clear</span>
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:20px_20px]">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`absolute shadow-sm transition-shadow ${
              selectedId === item.id ? 'ring-2 ring-tahoe-accent ring-offset-2 ring-offset-tahoe-surface' : ''
            }`}
            style={{ left: item.x, top: item.y }}
            data-testid={`freeform-item-${item.id}`}
            aria-label={`${item.type} item`}
          >
            {item.type === 'note' && (
              <div
                className={`w-40 h-40 ${item.color} rounded-tahoe-sm p-3 text-left text-sm text-tahoe-text shadow-sm`}
              >
                {item.text}
              </div>
            )}
            {item.type === 'square' && (
              <div
                className={`w-28 h-28 ${item.color} rounded-md opacity-80`}
              />
            )}
            {item.type === 'circle' && (
              <div
                className={`w-28 h-28 ${item.color} rounded-full opacity-80`}
              />
            )}
          </button>
        ))}
        {items.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center text-tahoe-text-secondary text-sm"
            data-testid="freeform-empty"
          >
            Board is empty
          </div>
        )}
      </div>

      <div
        className="w-56 border-l border-white/10 bg-tahoe-glass/30 p-4 flex flex-col gap-3"
        data-testid="freeform-inspector"
      >
        <h3 className="text-sm font-semibold">Inspector</h3>
        {selectedItem ? (
          <>
            <div className="text-xs text-tahoe-text-secondary">
              Type: <span className="capitalize text-tahoe-text">{selectedItem.type}</span>
            </div>
            {selectedItem.type === 'note' && (
              <textarea
                value={selectedItem.text ?? ''}
                onChange={(e) => updateSelectedText(e.target.value)}
                className="w-full h-32 bg-white/5 rounded-md p-2 text-sm outline-none resize-none placeholder-white/30"
                placeholder="Note text"
                data-testid="freeform-note-text"
              />
            )}
            <div className="text-xs text-tahoe-text-secondary">
              Position: {selectedItem.x}, {selectedItem.y}
            </div>
          </>
        ) : (
          <p className="text-sm text-tahoe-text-secondary">Select an item to edit</p>
        )}
      </div>
    </div>
  )
}
