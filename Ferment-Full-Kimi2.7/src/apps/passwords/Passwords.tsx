import { useState, useMemo, useCallback } from 'react'
import {
  Search,
  Eye,
  EyeOff,
  Copy,
  Globe,
  Shield,
  User,
  KeyRound,
} from 'lucide-react'
import { sampleCredentials } from './data'
import type { Credential, PasswordCategory } from './types'

const categories: PasswordCategory[] = [
  'All',
  'Social',
  'Work',
  'Finance',
  'Shopping',
  'Other',
]

function mask(value: string) {
  return '•'.repeat(Math.max(8, value.length))
}

export function Passwords() {
  const [credentials] = useState<Credential[]>(sampleCredentials)
  const [selectedId, setSelectedId] = useState<string>(sampleCredentials[0].id)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<PasswordCategory>('All')
  const [revealed, setRevealed] = useState(false)

  const filtered = useMemo(() => {
    return credentials.filter((cred) => {
      const matchesCategory = category === 'All' || cred.category === category
      const term = search.toLowerCase()
      const matchesSearch =
        cred.title.toLowerCase().includes(term) ||
        cred.username.toLowerCase().includes(term) ||
        (cred.url?.toLowerCase().includes(term) ?? false)
      return matchesCategory && matchesSearch
    })
  }, [credentials, category, search])

  const selected = useMemo(
    () => credentials.find((c) => c.id === selectedId) ?? credentials[0],
    [credentials, selectedId]
  )

  const toggleReveal = useCallback(() => {
    setRevealed((r) => !r)
  }, [])

  const selectCredential = useCallback((id: string) => {
    setSelectedId(id)
    setRevealed(false)
  }, [])

  return (
    <div
      className="flex h-full bg-tahoe-surface text-tahoe-text overflow-hidden"
      data-testid="passwords-app"
    >
      <div
        className="w-56 flex flex-col border-r border-white/10 bg-tahoe-glass/30"
        data-testid="passwords-sidebar"
      >
        <div className="px-3 py-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tahoe-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search passwords"
              className="w-full bg-white/5 rounded-md pl-8 pr-3 py-2 text-sm outline-none placeholder-white/30"
              data-testid="passwords-search"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {filtered.map((cred) => (
            <button
              key={cred.id}
              onClick={() => selectCredential(cred.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedId === cred.id
                  ? 'bg-tahoe-accent text-white'
                  : 'hover:bg-white/10'
              }`}
              data-testid={`password-item-${cred.id}`}
            >
              <div className="font-medium truncate">{cred.title}</div>
              <div className="text-xs opacity-70 truncate">{cred.username}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p
              className="text-sm text-tahoe-text-secondary px-2"
              data-testid="passwords-empty"
            >
              No matches
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-tahoe-accent" />
            <h2 className="text-lg font-semibold">Passwords</h2>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PasswordCategory)}
            className="bg-white/5 rounded-md px-3 py-1.5 text-sm outline-none"
            data-testid="passwords-category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {selected ? (
            <div
              className="max-w-xl mx-auto bg-tahoe-glass/30 rounded-tahoe p-6 space-y-6"
              data-testid="passwords-detail"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-tahoe bg-tahoe-accent/20 flex items-center justify-center">
                  <Globe className="w-7 h-7 text-tahoe-accent" />
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold"
                    data-testid="passwords-detail-title"
                  >
                    {selected.title}
                  </h3>
                  <p className="text-sm text-tahoe-text-secondary">
                    {selected.url ?? selected.category}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 bg-white/5 rounded-md p-3"
                  data-testid="passwords-detail-username"
                >
                  <User className="w-5 h-5 text-tahoe-text-secondary" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-tahoe-text-secondary">Username</div>
                    <div className="text-sm truncate">{selected.username}</div>
                  </div>
                  <button
                    className="p-1.5 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
                    aria-label="Copy username"
                    data-testid="passwords-copy-username"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div
                  className="flex items-center gap-3 bg-white/5 rounded-md p-3"
                  data-testid="passwords-detail-password"
                >
                  <KeyRound className="w-5 h-5 text-tahoe-text-secondary" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-tahoe-text-secondary">Password</div>
                    <div
                      className="text-sm font-mono truncate"
                      data-testid="passwords-password-value"
                    >
                      {revealed ? selected.password : mask(selected.password)}
                    </div>
                  </div>
                  <button
                    onClick={toggleReveal}
                    className="p-1.5 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
                    aria-label={revealed ? 'Hide password' : 'Reveal password'}
                    data-testid="passwords-reveal"
                  >
                    {revealed ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="p-1.5 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
                    aria-label="Copy password"
                    data-testid="passwords-copy-password"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div
                  className="flex items-center gap-3 bg-white/5 rounded-md p-3"
                  data-testid="passwords-detail-category"
                >
                  <Shield className="w-5 h-5 text-tahoe-text-secondary" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-tahoe-text-secondary">Category</div>
                    <div className="text-sm">{selected.category}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 flex items-center justify-center text-tahoe-text-secondary text-sm"
              data-testid="passwords-no-selection"
            >
              Select a credential
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
