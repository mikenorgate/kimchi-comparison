import { useMemo, useState } from 'react'
import {
  Wifi,
  Bluetooth,
  Palette,
  Bell,
  Volume2,
  Settings,
  Search,
  ChevronRight,
} from 'lucide-react'
import { settingCategories } from './data'
import type { Setting } from './types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  bluetooth: Bluetooth,
  palette: Palette,
  bell: Bell,
  'volume-2': Volume2,
  settings: Settings,
}

function SettingRow({
  setting,
  onChange,
}: {
  setting: Setting
  onChange: (id: string, value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-tahoe-glass-border last:border-b-0">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-tahoe-text">{setting.label}</span>
        {setting.description && <span className="text-xs text-tahoe-text-secondary mt-0.5">{setting.description}</span>}
      </div>
      <div>
        {setting.kind === 'toggle' && (
          <button
            onClick={() => onChange(setting.id, !setting.value)}
            className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
              setting.value ? 'bg-tahoe-green' : 'bg-tahoe-text-tertiary/30'
            }`}
            aria-label={setting.label}
            aria-pressed={setting.value}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                setting.value ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        )}
        {setting.kind === 'checkbox' && (
          <input
            type="checkbox"
            checked={setting.value}
            onChange={(e) => onChange(setting.id, e.target.checked)}
            className="h-4 w-4 accent-tahoe-accent"
            aria-label={setting.label}
          />
        )}
        {setting.kind === 'button' && (
          <button className="flex items-center text-xs text-tahoe-text-secondary hover:text-tahoe-text">
            Open <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        )}
        {setting.kind === 'info' && setting.description && (
          <span className="text-xs text-tahoe-text-secondary">{setting.description}</span>
        )}
      </div>
    </div>
  )
}

export function SystemSettings() {
  const [selectedId, setSelectedId] = useState<string>(settingCategories[0].id)
  const [search, setSearch] = useState('')
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    settingCategories.forEach((cat) => {
      cat.settings.forEach((s) => {
        if (typeof s.value === 'boolean') map[s.id] = s.value
      })
    })
    return map
  })

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return settingCategories
    return settingCategories
      .map((cat) => ({
        ...cat,
        settings: cat.settings.filter(
          (s) => s.label.toLowerCase().includes(term) || cat.name.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.settings.length > 0)
  }, [search])

  const selectedCategory = useMemo(
    () => filteredCategories.find((c) => c.id === selectedId) ?? filteredCategories[0],
    [filteredCategories, selectedId]
  )

  const handleChange = (id: string, value: boolean) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  const settingsWithValues = useMemo<Setting[]>(() => {
    return (selectedCategory?.settings ?? []).map((s) => ({ ...s, value: values[s.id] ?? s.value }))
  }, [selectedCategory, values])

  const Icon = selectedCategory ? iconMap[selectedCategory.icon] ?? Settings : Settings

  return (
    <div className="flex h-full w-full bg-tahoe-window text-tahoe-text select-none">
      {/* Sidebar */}
      <aside data-testid="settings-sidebar" className="w-56 flex-shrink-0 bg-tahoe-sidebar/80 backdrop-blur-tahoe border-r border-tahoe-glass-border p-3 overflow-auto">
        <div className="flex items-center bg-tahoe-search rounded-lg px-2 py-1.5 mb-3">
          <Search className="w-4 h-4 text-tahoe-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="bg-transparent text-sm ml-2 outline-none placeholder:text-tahoe-text-tertiary w-full"
          />
        </div>
        <nav className="space-y-0.5">
          {filteredCategories.map((cat) => {
            const CatIcon = iconMap[cat.icon] ?? Settings
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedId(cat.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  selectedId === cat.id ? 'bg-tahoe-accent text-white' : 'text-tahoe-text hover:bg-tahoe-hover'
                }`}
              >
                <CatIcon className="w-4 h-4" />
                <span className="truncate">{cat.name}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Detail pane */}
      <main data-testid="settings-detail" className="flex-1 flex flex-col min-w-0 bg-tahoe-window">
        {selectedCategory ? (
          <>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-tahoe-glass-border bg-tahoe-titlebar/40">
              <Icon className="w-8 h-8 text-tahoe-text-secondary" />
              <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-xl mx-auto">
                {settingsWithValues.map((setting) => (
                  <SettingRow key={setting.id} setting={setting} onChange={handleChange} />
                ))}
                {settingsWithValues.length === 0 && (
                  <p className="text-sm text-tahoe-text-secondary text-center mt-10">No settings found.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-tahoe-text-secondary text-sm">
            Select a category
          </div>
        )}
      </main>
    </div>
  )
}
