import { useState, useMemo, useCallback } from 'react'
import { Search, TrendingUp, TrendingDown, Star, Clock } from 'lucide-react'
import { stocks } from './data'

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

function generatePlaceholderPoints(isPositive: boolean) {
  const count = 24
  const points: number[] = []
  let value = 50
  for (let i = 0; i < count; i++) {
    const move = (Math.random() - 0.5) * (isPositive ? 12 : 16)
    value = Math.max(10, Math.min(90, value + move))
    points.push(value)
  }
  if (isPositive) points[points.length - 1] = Math.max(55, points[points.length - 1])
  else points[points.length - 1] = Math.min(45, points[points.length - 1])
  return points
}

function ChartPlaceholder({ color }: { color: string }) {
  const positive = color.includes('green')
  const points = useMemo(() => generatePlaceholderPoints(positive), [positive])
  const width = 100
  const height = 40
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((p - min) / range) * height
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-10 w-24"
      data-testid="stocks-chart"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={positive ? 'text-tahoe-green' : 'text-tahoe-red'}
      />
    </svg>
  )
}

export function Stocks() {
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [watchlist, setWatchlist] = useState<Set<string>>(
    new Set(['stk-aapl', 'stk-msft', 'stk-googl'])
  )

  const filteredStocks = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stocks
    return stocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    )
  }, [query])

  const selectedStock = useMemo(
    () => stocks.find((s) => s.id === selectedStockId) ?? null,
    [selectedStockId]
  )

  const watchlistStocks = useMemo(
    () => stocks.filter((s) => watchlist.has(s.id)),
    [watchlist]
  )

  const openStock = useCallback((id: string) => {
    setSelectedStockId(id)
  }, [])

  const closeStock = useCallback(() => {
    setSelectedStockId(null)
  }, [])

  const toggleWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="stocks-app"
    >
      {/* Header */}
      <div
        className="flex h-12 items-center justify-between border-b border-tahoe-glass-border bg-tahoe-window/80 px-4"
        data-testid="stocks-header"
      >
        <div className="flex items-center gap-2">
          {selectedStock ? (
            <button
              onClick={closeStock}
              className="rounded-tahoe-xs p-1 text-sm text-tahoe-text-secondary hover:bg-white/10"
              data-testid="stocks-back"
            >
              Watchlist
            </button>
          ) : (
            <span className="font-semibold">Watchlist</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-tahoe-text-secondary" />
          <span className="text-sm text-tahoe-text-secondary">Market Open</span>
        </div>
      </div>

      {/* Search */}
      {!selectedStock && (
        <div className="border-b border-tahoe-glass-border bg-tahoe-window/60 px-4 py-2">
          <div className="flex items-center gap-2 rounded-tahoe-xs bg-white/10 px-3 py-2">
            <Search className="h-4 w-4 text-tahoe-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-tahoe-text-tertiary"
              data-testid="stocks-search"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-tahoe-window/80">
        {selectedStock ? (
          <div className="p-6" data-testid="stocks-detail">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  className="text-3xl font-bold"
                  data-testid="stocks-detail-symbol"
                >
                  {selectedStock.symbol}
                </h2>
                <p className="text-sm text-tahoe-text-secondary">
                  {selectedStock.name}
                </p>
              </div>
              <button
                onClick={() => toggleWatchlist(selectedStock.id)}
                className={`rounded-full p-2 transition-colors ${
                  watchlist.has(selectedStock.id)
                    ? 'bg-tahoe-accent/20 text-tahoe-accent'
                    : 'bg-white/10 text-tahoe-text-secondary hover:bg-white/20'
                }`}
                data-testid="stocks-watch"
                aria-label="Watchlist"
              >
                <Star
                  className={`h-5 w-5 ${watchlist.has(selectedStock.id) ? 'fill-current' : ''}`}
                />
              </button>
            </div>

            <div className="mt-4">
              <span
                className="text-4xl font-light"
                data-testid="stocks-detail-price"
              >
                {formatPrice(selectedStock.price)}
              </span>
              <div
                className={`mt-1 flex items-center gap-1 text-sm ${
                  selectedStock.change >= 0 ? 'text-tahoe-green' : 'text-tahoe-red'
                }`}
                data-testid="stocks-detail-change"
              >
                {selectedStock.change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {selectedStock.change >= 0 ? '+' : ''}
                  {selectedStock.change.toFixed(2)} (
                  {selectedStock.changePercent >= 0 ? '+' : ''}
                  {selectedStock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="mt-6 h-40 rounded-tahoe-lg bg-white/5 p-4">
              <ChartPlaceholder color={selectedStock.chartColor} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-tahoe-xs bg-white/5 p-3">
                <div className="text-xs text-tahoe-text-secondary">Market Cap</div>
                <div className="font-medium">{selectedStock.marketCap}</div>
              </div>
              <div className="rounded-tahoe-xs bg-white/5 p-3">
                <div className="text-xs text-tahoe-text-secondary">Volume</div>
                <div className="font-medium">52.4M</div>
              </div>
              <div className="rounded-tahoe-xs bg-white/5 p-3">
                <div className="text-xs text-tahoe-text-secondary">Open</div>
                <div className="font-medium">
                  {formatPrice(selectedStock.price - selectedStock.change)}
                </div>
              </div>
              <div className="rounded-tahoe-xs bg-white/5 p-3">
                <div className="text-xs text-tahoe-text-secondary">52W High</div>
                <div className="font-medium">
                  {formatPrice(selectedStock.price * 1.15)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4" data-testid="stocks-watchlist">
            {query ? (
              <div className="mb-2 text-sm font-semibold text-tahoe-text-secondary">
                Results
              </div>
            ) : null}
            <div className="space-y-2">
              {(query ? filteredStocks : watchlistStocks).map((stock) => (
                <button
                  key={stock.id}
                  onClick={() => openStock(stock.id)}
                  className="flex w-full items-center gap-3 rounded-tahoe-xs bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                  data-testid={`stocks-item-${stock.id}`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-tahoe-xs bg-white/10 font-semibold">
                    {stock.symbol[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="truncate text-xs text-tahoe-text-secondary">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatPrice(stock.price)}
                    </div>
                    <div
                      className={`text-xs ${
                        stock.change >= 0 ? 'text-tahoe-green' : 'text-tahoe-red'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <ChartPlaceholder color={stock.chartColor} />
                </button>
              ))}
            </div>
            {(query ? filteredStocks : watchlistStocks).length === 0 && (
              <div
                className="py-12 text-center text-sm text-tahoe-text-secondary"
                data-testid="stocks-empty"
              >
                No stocks found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
