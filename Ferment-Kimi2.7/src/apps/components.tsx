import { useMemo, useState } from 'react'

export function FinderApp() {
  const [path, setPath] = useState('Macintosh HD')
  const [selected, setSelected] = useState<string | null>(null)

  const items: { id: string; name: string; kind: 'folder' | 'file' }[] = [
    { id: 'applications', name: 'Applications', kind: 'folder' },
    { id: 'documents', name: 'Documents', kind: 'folder' },
    { id: 'downloads', name: 'Downloads', kind: 'folder' },
    { id: 'readme', name: 'README.md', kind: 'file' },
  ]

  const handleDoubleClick = (item: (typeof items)[number]) => {
    if (item.kind === 'folder') {
      setPath(`${path} / ${item.name}`)
      setSelected(null)
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <GlassToolbar className="mx-3 mt-3 mb-1" data-testid="finder-toolbar">
        <div className="flex items-center gap-1">
          <GlassButton size="sm" aria-label="Back" disabled>&larr;</GlassButton>
          <GlassButton size="sm" aria-label="Forward" disabled>&rarr;</GlassButton>
        </div>
        <div className="flex-1 mx-3 px-3 py-1 rounded-lg text-sm text-center tahoe-glass" data-testid="finder-path">
          {path}
        </div>
        <div className="flex items-center gap-1">
          <GlassButton size="sm" aria-label="Icon view">&#9638;</GlassButton>
          <GlassButton size="sm" aria-label="List view">&#9776;</GlassButton>
        </div>
      </GlassToolbar>

      <div className="flex-1 flex overflow-hidden">
        <GlassSidebar width={160} className="my-2 ml-2 mb-2">
          <div className="px-4 py-2 text-xs font-semibold opacity-60 uppercase tracking-wide">Favorites</div>
          <nav className="flex flex-col gap-0.5 px-2">
            <GlassSidebarItem>AirDrop</GlassSidebarItem>
            <GlassSidebarItem>Recents</GlassSidebarItem>
            <GlassSidebarItem>Applications</GlassSidebarItem>
            <GlassSidebarItem active>Macintosh HD</GlassSidebarItem>
          </nav>
          <div className="px-4 py-2 mt-2 text-xs font-semibold opacity-60 uppercase tracking-wide">Locations</div>
          <nav className="flex flex-col gap-0.5 px-2">
            <GlassSidebarItem>iCloud Drive</GlassSidebarItem>
            <GlassSidebarItem>Network</GlassSidebarItem>
          </nav>
        </GlassSidebar>

        <main className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-4 gap-3" role="list" aria-label="Finder files">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="listitem"
                onClick={() => setSelected(item.id)}
                onDoubleClick={() => handleDoubleClick(item)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
                  selected === item.id ? 'bg-tahoe-accent/20' : 'hover:bg-white/10'
                }`}
                data-testid={`finder-item-${item.id}`}
                aria-selected={selected === item.id}
              >
                <span className="text-4xl" aria-hidden="true">
                  {item.kind === 'folder' ? '&#128193;' : '&#128196;'}
                </span>
                <span className="text-xs text-center line-clamp-2">{item.name}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export function SafariApp() {
  const [tabs, setTabs] = useState([
    { id: 'tab-1', title: 'Apple', url: 'apple.com' },
  ])
  const [activeTabId, setActiveTabId] = useState('tab-1')

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (tabs.length <= 1) return
    const nextTabs = tabs.filter((t) => t.id !== id)
    setTabs(nextTabs)
    if (activeTabId === id) {
      setActiveTabId(nextTabs[0].id)
    }
  }

  const addTab = () => {
    const newTab = { id: `tab-${Date.now()}`, title: 'New Tab', url: '' }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="flex items-center gap-1">
          <GlassButton size="sm" aria-label="Back">&larr;</GlassButton>
          <GlassButton size="sm" aria-label="Forward" disabled>&rarr;</GlassButton>
          <GlassButton size="sm" aria-label="Reload">&#x21bb;</GlassButton>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg text-sm tahoe-glass" data-testid="safari-address-bar">
          <span className="opacity-50 text-xs">&#128274;</span>
          <span className="flex-1 text-center truncate">{activeTab.url || 'Search or enter address'}</span>
        </div>
        <GlassButton size="sm" aria-label="Share">&#x21ea;</GlassButton>
        <GlassButton size="sm" aria-label="New tab" onClick={addTab}>+</GlassButton>
      </div>

      <div className="flex items-end gap-1 px-3 border-b border-white/10" data-testid="safari-tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs min-w-[120px] max-w-[180px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
              activeTabId === tab.id ? 'bg-white/15 font-medium' : 'bg-white/5 hover:bg-white/10 opacity-70'
            }`}
            data-testid={`safari-tab-${tab.id}`}
            aria-selected={activeTabId === tab.id}
          >
            <span className="truncate flex-1">{tab.title}</span>
            <span
              className="opacity-60 hover:opacity-100"
              onClick={(e) => closeTab(e, tab.id)}
              aria-label={`Close ${tab.title} tab`}
            >
              &times;
            </span>
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 overflow-auto">
        <GlassPanel className="max-w-2xl mx-auto p-6" data-testid="safari-webpage">
          <h1 className="text-2xl font-bold mb-3">Welcome to Safari</h1>
          <p className="text-sm opacity-80 mb-4">
            This is a mocked webpage rendered inside the Tahoe desktop shell. Tabs, navigation, and the address bar are fully interactive, while page content is fake data.
          </p>
          <div className="w-full h-32 rounded-xl bg-gradient-to-br from-tahoe-accent/20 to-tahoe-accent/5 mb-4" aria-label="Mock webpage hero image" />
          <div className="space-y-2">
            {['Innovation at every pixel.', 'Liquid Glass on the web.', 'Built with React + Tailwind CSS.'].map((line, i) => (
              <p key={i} className="text-sm opacity-70">{line}</p>
            ))}
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}

const mockNotes = [
  {
    id: 'note-1',
    title: 'Grocery List',
    body: '- Almond milk\n- Avocados\n- Sourdough bread\n- Coffee beans',
    updatedAt: 'Today, 9:41 AM',
  },
  {
    id: 'note-2',
    title: 'Project Ideas',
    body: '1. Recreate macOS Tahoe in the browser\n2. Build a Liquid Glass design system\n3. Write end-to-end tests for every app',
    updatedAt: 'Yesterday, 4:22 PM',
  },
  {
    id: 'note-3',
    title: 'Meeting Notes',
    body: 'Discussed roadmap and core apps. Next: Calendar, Photos, Phone, Journal.',
    updatedAt: 'Aug 8, 2:00 PM',
  },
]

export function NotesApp() {
  const [notes, setNotes] = useState(mockNotes)
  const [selectedId, setSelectedId] = useState<string>(mockNotes[0].id)
  const [search, setSearch] = useState('')

  const selectedNote = notes.find((n) => n.id === selectedId) ?? notes[0]
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase()),
  )

  const updateNote = (patch: Partial<typeof mockNotes[number]>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, ...patch, updatedAt: 'Today, 10:00 AM' } : n)),
    )
  }

  const createNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      body: '',
      updatedAt: 'Just now',
    }
    setNotes([newNote, ...notes])
    setSelectedId(newNote.id)
  }

  return (
    <div className="w-full h-full flex overflow-hidden">
      <aside className="w-52 flex flex-col border-r border-white/10" data-testid="notes-sidebar">
        <div className="p-3 flex items-center gap-2">
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-white/10 placeholder-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50"
            data-testid="notes-search"
          />
          <GlassButton size="sm" aria-label="New note" onClick={createNote}>+</GlassButton>
        </div>
        <div className="flex-1 overflow-auto px-2 pb-2 space-y-1">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setSelectedId(note.id)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
                selectedId === note.id ? 'bg-tahoe-accent/20' : 'hover:bg-white/10'
              }`}
              data-testid={`notes-item-${note.id}`}
              aria-selected={selectedId === note.id}
            >
              <div className="text-sm font-semibold truncate">{note.title}</div>
              <div className="text-xs opacity-60 truncate">{note.updatedAt}</div>
              <div className="text-xs opacity-50 truncate mt-0.5">{note.body.slice(0, 40)}</div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden" data-testid="notes-editor">
        {selectedNote ? (
          <>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
              <GlassButton size="sm" aria-label="Bold">B</GlassButton>
              <GlassButton size="sm" aria-label="Italic">I</GlassButton>
              <GlassButton size="sm" aria-label="Underline">U</GlassButton>
              <GlassButton size="sm" aria-label="Checklist">&#10003;</GlassButton>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                className="w-full text-xl font-bold bg-transparent border-none outline-none placeholder-white/40 mb-2"
                placeholder="Title"
                data-testid="notes-title-input"
                aria-label="Note title"
              />
              <textarea
                value={selectedNote.body}
                onChange={(e) => updateNote({ body: e.target.value })}
                className="w-full flex-1 min-h-[200px] resize-none bg-transparent border-none outline-none text-sm leading-relaxed placeholder-white/40"
                placeholder="Start typing..."
                data-testid="notes-body-input"
                aria-label="Note body"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-60" data-testid="notes-empty">
            Select or create a note.
          </div>
        )}
      </main>
    </div>
  )
}

import { GlassPanel, GlassSidebar, GlassSidebarItem, GlassButton, GlassToolbar } from '../components/ui'
import { useTheme } from '../theme'

const settingsCategories = [
  { id: 'general', label: 'General', icon: '&#9881;' },
  { id: 'appearance', label: 'Appearance', icon: '&#127912;' },
  { id: 'wifi', label: 'Wi-Fi', icon: '&#128246;' },
  { id: 'bluetooth', label: 'Bluetooth', icon: '&#128146;' },
  { id: 'notifications', label: 'Notifications', icon: '&#128276;' },
  { id: 'sound', label: 'Sound', icon: '&#128264;' },
  { id: 'display', label: 'Display', icon: '&#128423;' },
  { id: 'battery', label: 'Battery', icon: '&#128267;' },
  { id: 'privacy', label: 'Privacy & Security', icon: '&#128272;' },
]

function ToggleRow({ label, description, checked, onChange, 'data-testid': testId }: { label: string; description?: string; checked: boolean; onChange: () => void; 'data-testid'?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs opacity-60">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        data-testid={testId}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
          checked ? 'bg-tahoe-accent' : 'bg-black/20 dark:bg-white/20'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs opacity-60 tabular-nums">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none bg-black/10 dark:bg-white/10 accent-tahoe-accent cursor-pointer"
        aria-label={label}
      />
    </div>
  )
}

export function SystemSettingsApp() {
  const { mode, toggleMode } = useTheme()
  const [activeId, setActiveId] = useState('general')
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [mute, setMute] = useState(false)
  const [volume, setVolume] = useState(72)
  const [brightness, setBrightness] = useState(85)
  const [location, setLocation] = useState(false)
  const [lowPower, setLowPower] = useState(false)
  const [screenRecording, setScreenRecording] = useState(false)

  const activeCategory = settingsCategories.find((c) => c.id === activeId) ?? settingsCategories[0]

  const renderPane = () => {
    switch (activeId) {
      case 'general':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-tahoe-accent/20 flex items-center justify-center text-xl">&#128187;</div>
                <div>
                  <p className="text-sm font-medium">Tahoe System</p>
                  <p className="text-xs opacity-60">Version 26.0 (Build 25A5316i)</p>
                </div>
              </div>
              <ToggleRow label="Automatic updates" description="Install updates overnight" checked={false} onChange={() => {}} />
              <GlassButton size="sm">Check for Updates…</GlassButton>
            </div>
          </>
        )
      case 'appearance':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs opacity-70">Switch between light and dark mode</p>
                </div>
                <GlassButton onClick={toggleMode} variant="primary" size="sm" data-testid="theme-toggle">
                  {mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                </GlassButton>
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Accent color</p>
                <div className="flex gap-2">
                  {['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE', '#5AC8FA'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded-full border border-white/20 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      style={{ backgroundColor: color }}
                      aria-label={`Accent ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      case 'wifi':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Wi-Fi</h2>
            <ToggleRow label="Wi-Fi" checked={wifi} onChange={() => setWifi((v) => !v)} data-testid="wifi-toggle" />
            {wifi && (
              <div className="mt-3 space-y-1">
                {['Tahoe-5G', 'Guest Network', 'NeighborsWiFi'].map((net, i) => (
                  <div key={net} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10">
                    <span className="text-sm">{net}</span>
                    <span className="text-xs opacity-60">{i === 0 ? 'Connected' : ''} {i !== 2 ? '🔒' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      case 'bluetooth':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Bluetooth</h2>
            <ToggleRow label="Bluetooth" checked={bluetooth} onChange={() => setBluetooth((v) => !v)} data-testid="bluetooth-toggle" />
            {bluetooth && (
              <div className="mt-3 space-y-1">
                {['AirPods Pro', 'Magic Mouse', 'Keyboard'].map((device) => (
                  <div key={device} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10">
                    <span className="text-sm">{device}</span>
                    <span className="text-xs opacity-60">Connected</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      case 'notifications':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <ToggleRow label="Allow Notifications" checked={notifications} onChange={() => setNotifications((v) => !v)} data-testid="notifications-toggle" />
            <div className="mt-3 space-y-1">
              {['Messages', 'Mail', 'Calendar'].map((app) => (
                <div key={app} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10">
                  <span className="text-sm">{app}</span>
                  <span className="text-xs opacity-60">Banners</span>
                </div>
              ))}
            </div>
          </>
        )
      case 'sound':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Sound</h2>
            <SliderRow label="Output volume" value={volume} onChange={setVolume} />
            <ToggleRow label="Mute" checked={mute} onChange={() => setMute((v) => !v)} data-testid="mute-toggle" />
          </>
        )
      case 'display':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Display</h2>
            <SliderRow label="Brightness" value={brightness} onChange={setBrightness} />
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Resolution</p>
              <p className="text-xs opacity-60">2560 × 1440 (Default)</p>
            </div>
          </>
        )
      case 'battery':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Battery</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🔋</div>
              <div>
                <p className="text-sm font-medium">84% remaining</p>
                <p className="text-xs opacity-60">Power source: Battery</p>
              </div>
            </div>
            <ToggleRow label="Low Power Mode" checked={lowPower} onChange={() => setLowPower((v) => !v)} data-testid="low-power-toggle" />
          </>
        )
      case 'privacy':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Privacy & Security</h2>
            <ToggleRow label="Location Services" checked={location} onChange={() => setLocation((v) => !v)} data-testid="location-toggle" />
            <ToggleRow label="Screen Recording" checked={screenRecording} onChange={() => setScreenRecording((v) => !v)} data-testid="screen-recording-toggle" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full flex overflow-hidden">
      <GlassSidebar width={200} className="py-3" data-testid="settings-sidebar">
        <div className="px-4 pb-3 text-sm font-semibold opacity-70">Settings</div>
        <nav className="flex flex-col gap-0.5 px-2">
          {settingsCategories.map((category) => (
            <GlassSidebarItem
              key={category.id}
              active={activeId === category.id}
              onClick={() => setActiveId(category.id)}
              data-testid={`settings-category-${category.id}`}
            >
              <span className="mr-2" aria-hidden="true" dangerouslySetInnerHTML={{ __html: category.icon }} />
              {category.label}
            </GlassSidebarItem>
          ))}
        </nav>
      </GlassSidebar>

      <main className="flex-1 p-6 overflow-auto">
        <GlassPanel variant="tinted" className="max-w-md p-5" data-testid="settings-glass-panel">
          <div data-testid={`settings-pane-${activeCategory.id}`}>
            {renderPane()}
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}

interface CalendarEvent {
  id: string
  date: Date
  title: string
  color: string
}

const calendarEvents: CalendarEvent[] = [
  { id: 'e1', date: new Date(2026, 7, 5), title: 'Team Standup', color: '#3b82f6' },
  { id: 'e2', date: new Date(2026, 7, 5), title: 'Lunch', color: '#10b981' },
  { id: 'e3', date: new Date(2026, 7, 12), title: 'Roadmap Review', color: '#8b5cf6' },
  { id: 'e4', date: new Date(2026, 7, 18), title: 'Dentist', color: '#ef4444' },
  { id: 'e5', date: new Date(2026, 7, 24), title: 'Flight to Tahoe', color: '#f59e0b' },
]

const calendarSources = [
  { id: 'personal', name: 'Personal', color: '#3b82f6' },
  { id: 'work', name: 'Work', color: '#8b5cf6' },
  { id: 'family', name: 'Family', color: '#10b981' },
]

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 10))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const { leading, days, trailing } = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const leadingCells = Array.from({ length: firstDayOfWeek }, (_, i) => ({
      key: `prev-${daysInPrevMonth - firstDayOfWeek + 1 + i}`,
      day: daysInPrevMonth - firstDayOfWeek + 1 + i,
      current: false,
      events: [] as CalendarEvent[],
    }))

    const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const date = new Date(year, month, day)
      return {
        key: `${year}-${month + 1}-${day}`,
        day,
        current: true,
        events: calendarEvents.filter(
          (e) =>
            e.date.getFullYear() === date.getFullYear() &&
            e.date.getMonth() === date.getMonth() &&
            e.date.getDate() === date.getDate(),
        ),
      }
    })

    const totalCells = leadingCells.length + dayCells.length
    const trailingCount = (7 - (totalCells % 7)) % 7
    const trailingCells = Array.from({ length: trailingCount }, (_, i) => ({
      key: `next-${i + 1}`,
      day: i + 1,
      current: false,
      events: [] as CalendarEvent[],
    }))

    return { leading: leadingCells, days: dayCells, trailing: trailingCells }
  }, [year, month])

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  return (
    <div className="w-full h-full flex overflow-hidden">
      <GlassSidebar width={180} className="py-3" data-testid="calendar-sidebar">
        <div className="px-4 pb-3 text-sm font-semibold opacity-70">Calendars</div>
        <nav className="flex flex-col gap-0.5 px-2">
          {calendarSources.map((source) => (
            <GlassSidebarItem key={source.id} data-testid={`calendar-source-${source.id}`}>
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: source.color }}
                aria-hidden="true"
              />
              {source.name}
            </GlassSidebarItem>
          ))}
        </nav>
      </GlassSidebar>
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GlassButton data-testid="calendar-prev" onClick={handlePrev} aria-label="Previous month">
              ‹
            </GlassButton>
            <GlassButton data-testid="calendar-next" onClick={handleNext} aria-label="Next month">
              ›
            </GlassButton>
            <h2 className="text-lg font-semibold ml-2" data-testid="calendar-month-label">
              {monthLabel}
            </h2>
          </div>
          <GlassButton>Today</GlassButton>
        </div>
        <GlassPanel className="flex-1 p-4 overflow-auto" data-testid="calendar-panel">
          <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border border-white/10 dark:border-white/5">
            {dayLabels.map((label) => (
              <div
                key={label}
                className="text-center text-xs font-medium py-2 opacity-60 bg-white/5 dark:bg-white/5"
              >
                {label}
              </div>
            ))}
            {[...leading, ...days, ...trailing].map((cell) => (
              <div
                key={cell.key}
                data-testid={cell.current ? `calendar-day-${cell.day}` : undefined}
                className={`min-h-[80px] p-2 transition-colors hover:bg-white/5 ${
                  cell.current ? 'bg-white/5 dark:bg-white/5' : 'bg-white/[0.02] opacity-40'
                }`}
              >
                <div className="text-sm mb-1">{cell.day}</div>
                <div className="flex flex-wrap gap-1">
                  {cell.events.map((event) => (
                    <span
                      key={event.id}
                      data-testid="calendar-event-dot"
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.color }}
                      title={event.title}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}

interface Photo {
  id: string
  title: string
  date: string
  gradient: string
}

const photos: Photo[] = [
  { id: '1', title: 'Tahoe Sunrise', date: 'Aug 1, 2026', gradient: 'from-orange-300 to-rose-400' },
  { id: '2', title: 'Lake Clarity', date: 'Aug 3, 2026', gradient: 'from-sky-300 to-blue-500' },
  { id: '3', title: 'Pine Forest', date: 'Aug 5, 2026', gradient: 'from-emerald-300 to-teal-500' },
  { id: '4', title: 'Mountain Trail', date: 'Aug 7, 2026', gradient: 'from-stone-300 to-slate-500' },
  { id: '5', title: 'Evening Glow', date: 'Aug 9, 2026', gradient: 'from-violet-300 to-indigo-500' },
  { id: '6', title: 'Wildflowers', date: 'Aug 11, 2026', gradient: 'from-pink-300 to-fuchsia-500' },
]

export function PhotosApp() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = photos.find((p) => p.id === selectedId)

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" data-testid="photos-app">
      <GlassToolbar className="flex items-center justify-between px-4 h-12 flex-shrink-0">
        <h2 className="text-base font-semibold">Photos</h2>
        <div className="flex items-center gap-2">
          <GlassButton data-testid="photos-library-tab" aria-pressed={selectedId === null}>
            Library
          </GlassButton>
          <GlassButton data-testid="photos-import-button">Import</GlassButton>
        </div>
      </GlassToolbar>
      {selected ? (
        <main className="flex-1 p-6 overflow-auto" data-testid="photo-detail">
          <GlassButton
            data-testid="photo-detail-back"
            className="mb-4"
            onClick={() => setSelectedId(null)}
          >
            ← Back to Library
          </GlassButton>
          <div
            className={`w-full max-w-2xl aspect-[4/3] mx-auto rounded-2xl bg-gradient-to-br ${selected.gradient} shadow-lg`}
            data-testid={`photo-detail-image-${selected.id}`}
            aria-label={selected.title}
          />
          <div className="max-w-2xl mx-auto mt-4">
            <h3 className="text-xl font-semibold" data-testid="photo-detail-title">
              {selected.title}
            </h3>
            <p className="text-sm opacity-60 mt-1" data-testid="photo-detail-date">
              {selected.date}
            </p>
          </div>
        </main>
      ) : (
        <main className="flex-1 p-6 overflow-auto">
          <GlassPanel className="p-4 h-full" data-testid="photos-grid">
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  data-testid={`photo-thumbnail-${photo.id}`}
                  type="button"
                  onClick={() => setSelectedId(photo.id)}
                  className={`group relative aspect-square rounded-xl bg-gradient-to-br ${photo.gradient} overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 transition-transform active:scale-[0.98]`}
                  aria-label={photo.title}
                >
                  <span className="absolute inset-x-0 bottom-0 p-2 text-xs font-medium bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.title}
                  </span>
                </button>
              ))}
            </div>
          </GlassPanel>
        </main>
      )}
    </div>
  )
}

interface RecentCall {
  id: string
  name: string
  number: string
  time: string
  type: 'incoming' | 'outgoing' | 'missed'
}

const recents: RecentCall[] = [
  { id: 'r1', name: 'Sarah Chen', number: '+1 (555) 123-4567', time: '10:30 AM', type: 'missed' },
  { id: 'r2', name: 'Design Team', number: '+1 (555) 987-6543', time: 'Yesterday', type: 'incoming' },
  { id: 'r3', name: 'Mom', number: '+1 (555) 246-8135', time: 'Yesterday', type: 'outgoing' },
  { id: 'r4', name: 'Unknown', number: '+1 (555) 000-1111', time: 'Aug 8', type: 'missed' },
]

interface Contact {
  id: string
  name: string
  initials: string
  color: string
}

const contacts: Contact[] = [
  { id: 'c1', name: 'Alex Rivera', initials: 'AR', color: '#3b82f6' },
  { id: 'c2', name: 'Jamie Lee', initials: 'JL', color: '#8b5cf6' },
  { id: 'c3', name: 'Morgan Patel', initials: 'MP', color: '#10b981' },
  { id: 'c4', name: 'Sam Taylor', initials: 'ST', color: '#f59e0b' },
  { id: 'c5', name: 'Taylor Swift', initials: 'TS', color: '#ef4444' },
]

interface Voicemail {
  id: string
  name: string
  time: string
  duration: string
}

const voicemails: Voicemail[] = [
  { id: 'v1', name: 'Sarah Chen', time: 'Today, 9:15 AM', duration: '0:24' },
  { id: 'v2', name: 'Unknown Caller', time: 'Aug 8, 4:30 PM', duration: '1:02' },
]

type PhoneTab = 'recents' | 'contacts' | 'voicemail'

export function PhoneApp() {
  const [activeTab, setActiveTab] = useState<PhoneTab>('recents')

  const tabs: { id: PhoneTab; label: string }[] = [
    { id: 'recents', label: 'Recents' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'voicemail', label: 'Voicemail' },
  ]

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" data-testid="phone-app">
      <div className="flex items-center justify-center gap-1 p-3" role="tablist" aria-label="Phone tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-testid={`phone-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
              activeTab === tab.id
                ? 'bg-white/20 text-tahoe-text'
                : 'text-tahoe-label hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <main className="flex-1 overflow-auto px-4 pb-4">
        {activeTab === 'recents' && (
          <GlassPanel className="p-2" data-testid="phone-recents-list">
            <h2 className="sr-only">Recents</h2>
            <ul className="space-y-1">
              {recents.map((call) => (
                <li
                  key={call.id}
                  data-testid={`phone-recent-${call.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg ${
                        call.type === 'missed' ? 'text-red-400' : call.type === 'incoming' ? 'text-green-400' : 'text-blue-400'
                      }`}
                      aria-hidden="true"
                    >
                      {call.type === 'missed' ? '↙' : call.type === 'incoming' ? '↙' : '↗'}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{call.name}</div>
                      <div className="text-xs opacity-60">{call.number}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-50">{call.time}</span>
                    <button
                      type="button"
                      data-testid={`phone-recent-info-${call.id}`}
                      aria-label={`Info for ${call.name}`}
                      className="text-tahoe-accent hover:opacity-80"
                    >
                      ⓘ
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </GlassPanel>
        )}
        {activeTab === 'contacts' && (
          <GlassPanel className="p-2" data-testid="phone-contacts-list">
            <h2 className="sr-only">Contacts</h2>
            <ul className="space-y-1">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  data-testid={`phone-contact-${contact.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: contact.color }}
                    aria-hidden="true"
                  >
                    {contact.initials}
                  </span>
                  <span className="text-sm font-medium">{contact.name}</span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        )}
        {activeTab === 'voicemail' && (
          <GlassPanel className="p-2" data-testid="phone-voicemail-list">
            <h2 className="sr-only">Voicemail</h2>
            <ul className="space-y-2">
              {voicemails.map((vm) => (
                <li
                  key={vm.id}
                  data-testid={`phone-voicemail-${vm.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{vm.name}</div>
                    <div className="text-xs opacity-60">{vm.time}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-50 font-mono">{vm.duration}</span>
                    <button
                      type="button"
                      data-testid={`phone-voicemail-play-${vm.id}`}
                      aria-label={`Play voicemail from ${vm.name}`}
                      className="w-7 h-7 rounded-full bg-tahoe-accent text-white flex items-center justify-center text-xs hover:opacity-90"
                    >
                      ▶
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </GlassPanel>
        )}
      </main>
    </div>
  )
}

interface JournalEntry {
  id: string
  title: string
  body: string
  date: string
  mood: string
}

const initialEntries: JournalEntry[] = [
  {
    id: 'j1',
    title: 'First Day at Tahoe',
    body:
      'Spent the morning exploring the shoreline. The water was impossibly clear and the air smelled like pine. I can already tell this trip is going to be memorable.',
    date: 'Aug 10, 2026',
    mood: 'Grateful',
  },
  {
    id: 'j2',
    title: 'Roadmap Review',
    body:
      'We walked through the rest of the core apps today. Everyone agreed the Liquid Glass treatment is the right direction. Next up: overlays and final integration.',
    date: 'Aug 8, 2026',
    mood: 'Focused',
  },
  {
    id: 'j3',
    title: 'Late Night Coding',
    body:
      'The window manager finally feels smooth. Drag, resize, minimize, maximize — all working. Small wins matter.',
    date: 'Aug 5, 2026',
    mood: 'Accomplished',
  },
]

const moodOptions = ['Grateful', 'Focused', 'Accomplished', 'Calm', 'Excited']

export function JournalApp() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [selectedId, setSelectedId] = useState<string>(initialEntries[0].id)

  const selected = entries.find((e) => e.id === selectedId) ?? entries[0]

  const updateSelected = (patch: Partial<JournalEntry>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === selectedId ? { ...entry, ...patch } : entry)),
    )
  }

  const handleNew = () => {
    const id = `j${Date.now()}`
    const newEntry: JournalEntry = {
      id,
      title: 'New Entry',
      body: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      mood: 'Calm',
    }
    setEntries((prev) => [newEntry, ...prev])
    setSelectedId(id)
  }

  return (
    <div className="w-full h-full flex overflow-hidden" data-testid="journal-app">
      <GlassSidebar width={220} className="py-3" data-testid="journal-entry-list">
        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-sm font-semibold opacity-70">Entries</span>
          <button
            type="button"
            data-testid="journal-new-button"
            onClick={handleNew}
            className="text-xs px-2 py-1 rounded-md bg-tahoe-accent text-white hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50"
            aria-label="New journal entry"
          >
            + New
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {entries.map((entry) => (
            <GlassSidebarItem
              key={entry.id}
              active={selectedId === entry.id}
              data-testid={`journal-entry-${entry.id}`}
              onClick={() => setSelectedId(entry.id)}
            >
              <div className="flex flex-col items-start w-full min-w-0">
                <span className="text-sm font-medium truncate w-full">{entry.title}</span>
                <span className="text-xs opacity-60 truncate w-full">{entry.date}</span>
              </div>
            </GlassSidebarItem>
          ))}
        </nav>
      </GlassSidebar>
      <main className="flex-1 p-4 overflow-auto" data-testid="journal-editor">
        <GlassPanel className="h-full p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <input
              data-testid="journal-title-input"
              type="text"
              value={selected.title}
              onChange={(e) => updateSelected({ title: e.target.value })}
              className="flex-1 bg-transparent text-xl font-semibold border-b border-white/10 focus:border-tahoe-accent focus:outline-none py-1"
              aria-label="Entry title"
            />
            <span data-testid="journal-date" className="text-sm opacity-60 whitespace-nowrap">
              {selected.date}
            </span>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Mood">
            {moodOptions.map((mood) => (
              <button
                key={mood}
                type="button"
                data-testid={`journal-mood-${mood.toLowerCase()}`}
                onClick={() => updateSelected({ mood })}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
                  selected.mood === mood
                    ? 'bg-tahoe-accent border-tahoe-accent text-white'
                    : 'border-white/20 text-tahoe-label hover:bg-white/10'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
          <textarea
            data-testid="journal-body-input"
            value={selected.body}
            onChange={(e) => updateSelected({ body: e.target.value })}
            className="flex-1 resize-none bg-white/5 dark:bg-white/5 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50"
            aria-label="Entry body"
          />
        </GlassPanel>
      </main>
    </div>
  )
}
