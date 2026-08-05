import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Plus,
  X,
  House,
  Search,
  PanelLeft,
  Share,
  Copy,
} from 'lucide-react'
import { homeUrl, resolvePage } from './data'
import type { Tab, HistoryEntry } from './types'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function formatUrlForDisplay(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function Safari() {
  const initialTab: Tab = { id: generateId(), title: 'Start Page', url: homeUrl }
  const [tabs, setTabs] = useState<Tab[]>([initialTab])
  const [activeTabId, setActiveTabId] = useState<string>(initialTab.id)
  const [histories, setHistories] = useState<Record<string, HistoryEntry[]>>({
    [initialTab.id]: [{ id: generateId(), url: homeUrl, title: 'Start Page', timestamp: Date.now() }],
  })
  const [historyIndex, setHistoryIndex] = useState<Record<string, number>>({ [initialTab.id]: 0 })
  const [inputUrl, setInputUrl] = useState(homeUrl)

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) ?? tabs[0], [tabs, activeTabId])

  const page = useMemo(() => resolvePage(activeTab.url), [activeTab.url])
  const PageContent = page.content

  const currentHistory = histories[activeTab.id] ?? []
  const currentIndex = historyIndex[activeTab.id] ?? 0
  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < currentHistory.length - 1

  const updateTabUrl = (tabId: string, url: string, title: string) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, url, title } : t)))
    if (tabId === activeTabId) setInputUrl(url)
  }

  const navigate = (url: string, tabId?: string) => {
    const targetId = tabId ?? activeTabId
    const resolved = resolvePage(url)
    updateTabUrl(targetId, resolved.url, resolved.title)
    setHistories((prev) => {
      const entries = (prev[targetId] ?? []).slice(0, (historyIndex[targetId] ?? 0) + 1)
      entries.push({ id: generateId(), url: resolved.url, title: resolved.title, timestamp: Date.now() })
      return { ...prev, [targetId]: entries }
    })
    setHistoryIndex((prev) => ({ ...prev, [targetId]: (prev[targetId] ?? 0) + 1 }))
  }

  const addTab = () => {
    const newTab: Tab = { id: generateId(), title: 'Start Page', url: homeUrl }
    const entry: HistoryEntry = { id: generateId(), url: homeUrl, title: 'Start Page', timestamp: Date.now() }
    setTabs((prev) => [...prev, newTab])
    setHistories((prev) => ({ ...prev, [newTab.id]: [entry] }))
    setHistoryIndex((prev) => ({ ...prev, [newTab.id]: 0 }))
    setActiveTabId(newTab.id)
    setInputUrl(homeUrl)
  }

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    if (tabs.length <= 1) return
    const index = tabs.findIndex((t) => t.id === tabId)
    setTabs((prev) => prev.filter((t) => t.id !== tabId))
    setHistories((prev) => {
      const next = { ...prev }
      delete next[tabId]
      return next
    })
    setHistoryIndex((prev) => {
      const next = { ...prev }
      delete next[tabId]
      return next
    })
    if (activeTabId === tabId) {
      const next = tabs[index - 1] ?? tabs[index + 1]
      setActiveTabId(next.id)
      setInputUrl(next.url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let url = inputUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url) && !/^tahoe:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        url = `https://${url}`
      } else {
        url = `https://search.example?q=${encodeURIComponent(url)}`
      }
    }
    navigate(url)
  }

  const goToHistoryIndex = (nextIndex: number) => {
    const entry = currentHistory[nextIndex]
    if (!entry) return
    updateTabUrl(activeTabId, entry.url, entry.title)
    setHistoryIndex((prev) => ({ ...prev, [activeTabId]: nextIndex }))
  }

  const handleBack = () => goToHistoryIndex(currentIndex - 1)
  const handleForward = () => goToHistoryIndex(currentIndex + 1)

  return (
    <div className="flex flex-col h-full w-full bg-tahoe-window text-tahoe-text select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-tahoe-glass-border bg-tahoe-titlebar/40">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className="p-1.5 rounded-md hover:bg-tahoe-hover disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={!canGoForward}
            className="p-1.5 rounded-md hover:bg-tahoe-hover disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(activeTab.url)}
            className="p-1.5 rounded-md hover:bg-tahoe-hover"
            aria-label="Reload"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(homeUrl)}
            className="p-1.5 rounded-md hover:bg-tahoe-hover"
            aria-label="Home"
          >
            <House className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 mx-2">
          <div className="flex items-center bg-tahoe-search rounded-lg px-3 py-1">
            <Search className="w-3.5 h-3.5 text-tahoe-text-tertiary" />
            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="bg-transparent text-sm ml-2 outline-none w-full text-tahoe-text placeholder:text-tahoe-text-tertiary"
              aria-label="Address and search"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-md hover:bg-tahoe-hover" aria-label="Sidebar">
            <PanelLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-tahoe-hover" aria-label="Share">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-tahoe-hover" aria-label="Copy address">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div data-testid="safari-tab-bar" className="flex items-center gap-1 px-2 py-1.5 border-b border-tahoe-glass-border bg-tahoe-window">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTabId(tab.id)
              setInputUrl(tab.url)
            }}
            className={`group flex items-center gap-2 min-w-[8rem] max-w-[12rem] px-3 py-1.5 rounded-md text-xs transition-colors ${
              activeTabId === tab.id ? 'bg-tahoe-search text-tahoe-text' : 'text-tahoe-text-secondary hover:bg-tahoe-hover'
            }`}
          >
            <span className="truncate flex-1 text-left">{tab.title}</span>
            <span
              onClick={(e) => closeTab(e, tab.id)}
              data-testid="tab-close"
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-tahoe-hover transition-opacity"
              role="button"
              aria-label={`Close ${tab.title}`}
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        ))}
        <button
          onClick={addTab}
          className="p-1.5 rounded-md hover:bg-tahoe-hover text-tahoe-text-secondary"
          aria-label="New tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Page renderer */}
      <div className="flex-1 overflow-auto bg-white" data-testid="safari-page">
        <PageContent />
      </div>

      {/* Mock history footer */}
      <div className="px-3 py-1.5 text-[10px] text-tahoe-text-tertiary border-t border-tahoe-glass-border bg-tahoe-window flex justify-between">
        <span>{formatUrlForDisplay(activeTab.url)}</span>
        <span>{currentHistory.length} page(s) in history</span>
      </div>
    </div>
  )
}
