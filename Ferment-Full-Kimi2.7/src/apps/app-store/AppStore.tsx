import { useMemo, useState } from 'react'
import {
  Star,
  X,
  Download,
  Search,
  Store,
  LayoutGrid,
  Gamepad2,
  Briefcase,
  Users,
  Wrench,
  Palette,
} from 'lucide-react'
import type { AppCategory, AppItem } from './types'
import { apps, categories, featuredApp } from './data'

function formatReviews(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

function CategoryIcon({ category }: { category: AppCategory }) {
  switch (category) {
    case 'Productivity':
      return <Briefcase className="w-4 h-4" />
    case 'Games':
      return <Gamepad2 className="w-4 h-4" />
    case 'Social':
      return <Users className="w-4 h-4" />
    case 'Utilities':
      return <Wrench className="w-4 h-4" />
    case 'Creativity':
      return <Palette className="w-4 h-4" />
    default:
      return <LayoutGrid className="w-4 h-4" />
  }
}

function AppCard({
  app,
  onClick,
}: {
  app: AppItem
  onClick: (app: AppItem) => void
}) {
  return (
    <button
      onClick={() => onClick(app)}
      className="flex flex-col gap-2 rounded-tahoe-sm bg-tahoe-window/60 p-3 text-left transition hover:bg-tahoe-window/80 hover:shadow-sm"
      data-testid={`app-store-item-${app.id}`}
    >
      <div
        className={`h-16 w-16 rounded-tahoe-xs bg-gradient-to-br ${app.color} shadow-sm`}
      />
      <div>
        <div className="font-medium leading-tight">{app.name}</div>
        <div className="text-xs text-tahoe-text-secondary">{app.category}</div>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-tahoe-text-secondary">
          <Star className="h-3 w-3 fill-tahoe-yellow text-tahoe-yellow" />
          <span>{app.rating}</span>
        </div>
        <span className="text-xs font-medium text-tahoe-accent">{app.price}</span>
      </div>
    </button>
  )
}

export function AppStore() {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('All')
  const [search, setSearch] = useState('')
  const [detailApp, setDetailApp] = useState<AppItem | null>(null)

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesCategory =
        selectedCategory === 'All' || app.category === selectedCategory
      const matchesSearch =
        search.trim() === '' ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.developer.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, search])

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="app-store-app"
    >
      {/* Header */}
      <div className="flex h-12 items-center gap-4 border-b border-tahoe-glass-border bg-tahoe-window/80 px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Store className="h-5 w-5 text-tahoe-accent" />
          <span>App Store</span>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-tahoe-glass/50 px-3 py-1.5">
          <Search className="h-4 w-4 text-tahoe-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-tahoe-text-secondary"
            data-testid="app-store-search"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-44 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3"
          data-testid="app-store-sidebar"
        >
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
            Discover
          </h2>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-tahoe-accent/20 text-tahoe-text'
                  : 'text-tahoe-text-secondary hover:bg-white/5'
              }`}
              data-testid={`app-store-category-${category.toLowerCase()}`}
            >
              <CategoryIcon category={category} />
              {category}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-tahoe-window/80 p-5">
          {/* Hero */}
          {selectedCategory === 'All' && search.trim() === '' && (
            <div
              className="relative mb-6 overflow-hidden rounded-tahoe-lg bg-gradient-to-br from-tahoe-purple/90 to-tahoe-pink/80 p-6 text-white shadow-sm"
              data-testid="app-store-hero"
            >
              <div className="relative z-10 max-w-md">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                  App of the Day
                </div>
                <h2 className="mt-1 text-2xl font-bold">{featuredApp.name}</h2>
                <p className="mt-2 text-sm opacity-90">
                  {featuredApp.description}
                </p>
                <button
                  onClick={() => setDetailApp(featuredApp)}
                  className="mt-4 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-tahoe-purple hover:bg-white/90"
                  data-testid="app-store-hero-cta"
                >
                  Get
                </button>
              </div>
            </div>
          )}

          {/* App grid */}
          <div className="mb-3 flex items-center justify-between">
            <h3
              className="text-lg font-semibold"
              data-testid="app-store-grid-title"
            >
              {selectedCategory === 'All' ? 'Top Apps' : selectedCategory}
            </h3>
            <span className="text-sm text-tahoe-text-secondary">
              {filteredApps.length} app{filteredApps.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredApps.length === 0 ? (
            <div
              className="flex flex-1 items-center justify-center text-sm text-tahoe-text-secondary"
              data-testid="app-store-empty"
            >
              No apps found
            </div>
          ) : (
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4"
              data-testid="app-store-grid"
            >
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} onClick={setDetailApp} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {detailApp && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 p-6 backdrop-blur-sm"
          data-testid="app-store-modal"
          onClick={() => setDetailApp(null)}
        >
          <div
            className="max-h-full w-full max-w-md overflow-auto rounded-tahoe-lg bg-tahoe-window p-5 shadow-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div
                  className={`h-20 w-20 rounded-tahoe-sm bg-gradient-to-br ${detailApp.color}`}
                />
                <div>
                  <h3 className="text-xl font-bold" data-testid="app-store-modal-title">{detailApp.name}</h3>
                  <p className="text-sm text-tahoe-text-secondary">
                    {detailApp.developer}
                  </p>
                  <p className="text-xs text-tahoe-text-secondary">
                    {detailApp.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailApp(null)}
                className="rounded-full p-1 hover:bg-black/5"
                aria-label="Close"
                data-testid="app-store-modal-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4 border-y border-tahoe-glass-border py-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-tahoe-yellow text-tahoe-yellow" />
                <span className="font-semibold">{detailApp.rating}</span>
              </div>
              <div className="text-sm text-tahoe-text-secondary">
                {formatReviews(detailApp.reviews)} ratings
              </div>
              <div className="ml-auto text-lg font-bold text-tahoe-accent">
                {detailApp.price}
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-tahoe-text-secondary">
              {detailApp.description}
            </p>

            <button
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-tahoe-accent py-2.5 font-semibold text-white hover:bg-tahoe-accent-hover"
              data-testid="app-store-modal-get"
            >
              <Download className="h-4 w-4" />
              Get
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
