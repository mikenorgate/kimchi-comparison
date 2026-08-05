import { useState, useMemo, useCallback } from 'react'
import {
  Sofa,
  Bed,
  ChefHat,
  Briefcase,
  Lightbulb,
  Lock,
  Unlock,
  Thermometer,
  Power,
  Activity,
  Home as HomeIcon,
  Sun,
  Moon,
} from 'lucide-react'
import { rooms, accessories as initialAccessories } from './data'
import type { Accessory, AccessoryType } from './types'

function RoomIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'living':
      return <Sofa className="h-4 w-4" />
    case 'bed':
      return <Bed className="h-4 w-4" />
    case 'kitchen':
      return <ChefHat className="h-4 w-4" />
    case 'office':
      return <Briefcase className="h-4 w-4" />
    default:
      return <HomeIcon className="h-4 w-4" />
  }
}

function AccessoryIcon({ type, isOn }: { type: AccessoryType; isOn: boolean }) {
  switch (type) {
    case 'light':
      return (
        <Lightbulb
          className={`h-5 w-5 ${isOn ? 'fill-tahoe-yellow text-tahoe-yellow' : ''}`}
        />
      )
    case 'lock':
      return isOn ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />
    case 'thermostat':
      return <Thermometer className="h-5 w-5" />
    case 'switch':
      return <Power className="h-5 w-5" />
    case 'sensor':
      return <Activity className="h-5 w-5" />
    default:
      return <HomeIcon className="h-5 w-5" />
  }
}

export function Home() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-living')
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories)
  const [scene, setScene] = useState<'morning' | 'evening' | 'away' | null>(null)

  const activeCount = useMemo(
    () => accessories.filter((a) => a.isOn).length,
    [accessories]
  )

  const filteredAccessories = useMemo(
    () => accessories.filter((a) => a.roomId === selectedRoomId),
    [accessories, selectedRoomId]
  )

  const toggleAccessory = useCallback((id: string) => {
    setAccessories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isOn: !a.isOn } : a))
    )
  }, [])

  const adjustValue = useCallback((id: string, delta: number) => {
    setAccessories((prev) =>
      prev.map((a) =>
        a.id === id && a.value !== undefined
          ? { ...a, value: Math.min(100, Math.max(0, a.value + delta)) }
          : a
      )
    )
  }, [])

  const activateScene = useCallback((sceneName: 'morning' | 'evening' | 'away') => {
    setScene(sceneName)
    setAccessories((prev) =>
      prev.map((a) => {
        if (sceneName === 'away') {
          return { ...a, isOn: false }
        }
        if (sceneName === 'morning') {
          if (a.type === 'light') return { ...a, isOn: true, value: 80 }
          if (a.type === 'lock') return { ...a, isOn: false }
          return { ...a, isOn: true }
        }
        // evening
        if (a.type === 'light') return { ...a, isOn: true, value: 40 }
        if (a.type === 'lock') return { ...a, isOn: true }
        return a
      })
    )
  }, [])

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="home-app"
    >
      {/* Header */}
      <div
        className="flex h-12 items-center justify-between border-b border-tahoe-glass-border bg-tahoe-window/80 px-4"
        data-testid="home-header"
      >
        <div className="flex items-center gap-2">
          <HomeIcon className="h-5 w-5 text-tahoe-accent" />
          <span className="font-semibold">Home</span>
        </div>
        <div className="text-sm text-tahoe-text-secondary">
          {activeCount} accessory{activeCount === 1 ? '' : 'ies'} on
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-44 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3"
          data-testid="home-sidebar"
        >
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
            Rooms
          </h2>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                selectedRoomId === room.id
                  ? 'bg-tahoe-accent/20 text-tahoe-text'
                  : 'hover:bg-white/5 text-tahoe-text-secondary'
              }`}
              data-testid={`home-room-${room.id}`}
            >
              <RoomIcon icon={room.icon} />
              <span className="truncate">{room.name}</span>
            </button>
          ))}

          <h2 className="mb-2 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
            Scenes
          </h2>
          <div className="space-y-1 px-2">
            <button
              onClick={() => activateScene('morning')}
              className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                scene === 'morning' ? 'bg-tahoe-yellow/20' : 'bg-white/5 hover:bg-white/10'
              }`}
              data-testid="home-scene-morning"
            >
              <Sun className="h-4 w-4 text-tahoe-yellow" />
              Morning
            </button>
            <button
              onClick={() => activateScene('evening')}
              className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                scene === 'evening' ? 'bg-tahoe-purple/20' : 'bg-white/5 hover:bg-white/10'
              }`}
              data-testid="home-scene-evening"
            >
              <Moon className="h-4 w-4 text-tahoe-purple" />
              Evening
            </button>
            <button
              onClick={() => activateScene('away')}
              className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                scene === 'away' ? 'bg-tahoe-text-tertiary/20' : 'bg-white/5 hover:bg-white/10'
              }`}
              data-testid="home-scene-away"
            >
              <Lock className="h-4 w-4" />
              Away
            </button>
          </div>
        </div>

        {/* Accessories grid */}
        <div className="flex flex-1 flex-col bg-tahoe-window/80">
          <div
            className="flex h-12 items-center border-b border-tahoe-glass-border px-4 text-sm font-medium"
            data-testid="home-room-title"
          >
            {rooms.find((r) => r.id === selectedRoomId)?.name}
          </div>
          <div
            className="grid flex-1 content-start gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="home-grid"
          >
            {filteredAccessories.map((accessory) => (
              <div
                key={accessory.id}
                className={`rounded-tahoe-sm p-4 transition-colors ${
                  accessory.isOn ? 'bg-tahoe-accent/15' : 'bg-white/5'
                }`}
                data-testid={`home-accessory-${accessory.id}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-full p-2 ${
                      accessory.isOn
                        ? 'bg-tahoe-accent text-white'
                        : 'bg-white/10 text-tahoe-text-secondary'
                    }`}
                  >
                    <AccessoryIcon
                      type={accessory.type}
                      isOn={accessory.isOn}
                    />
                  </div>
                  <button
                    onClick={() => toggleAccessory(accessory.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      accessory.isOn ? 'bg-tahoe-accent' : 'bg-white/20'
                    }`}
                    data-testid={`home-toggle-${accessory.id}`}
                    aria-label={accessory.isOn ? 'Turn off' : 'Turn on'}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                        accessory.isOn ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-3">
                  <div className="font-medium">{accessory.name}</div>
                  <div className="text-sm text-tahoe-text-secondary">
                    {accessory.isOn
                      ? accessory.type === 'lock'
                        ? 'Locked'
                        : 'On'
                      : accessory.type === 'lock'
                        ? 'Unlocked'
                        : 'Off'}
                    {accessory.value !== undefined && accessory.isOn && (
                      <span className="ml-1">
                        • {accessory.value}
                        {accessory.unit}
                      </span>
                    )}
                  </div>
                  {accessory.value !== undefined && accessory.isOn && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => adjustValue(accessory.id, -10)}
                        className="rounded-tahoe-xs bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                        data-testid={`home-dim-${accessory.id}`}
                      >
                        -
                      </button>
                      <div className="h-1.5 flex-1 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-tahoe-accent"
                          style={{ width: `${accessory.value}%` }}
                        />
                      </div>
                      <button
                        onClick={() => adjustValue(accessory.id, 10)}
                        className="rounded-tahoe-xs bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                        data-testid={`home-bright-${accessory.id}`}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
