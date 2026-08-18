import { useState, useEffect, useRef, useCallback } from 'react'

export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  history: number[]
}

const WATCHLIST_KEY = 'tahoe.stocks-watchlist'

const AVAILABLE_STOCKS: Record<string, { name: string; price: number }> = {
  'AAPL': { name: 'Apple Inc.', price: 225.50 },
  'GOOGL': { name: 'Alphabet Inc.', price: 178.25 },
  'MSFT': { name: 'Microsoft Corp.', price: 420.75 },
  'AMZN': { name: 'Amazon.com Inc.', price: 185.30 },
  'TSLA': { name: 'Tesla Inc.', price: 245.60 },
  'META': { name: 'Meta Platforms', price: 512.40 },
  'NVDA': { name: 'NVIDIA Corp.', price: 128.90 },
  'NFLX': { name: 'Netflix Inc.', price: 695.20 },
  'AMD': { name: 'Advanced Micro Devices', price: 152.80 },
  'INTC': { name: 'Intel Corp.', price: 28.45 },
  'BABA': { name: 'Alibaba Group', price: 85.60 },
  'DIS': { name: 'Walt Disney Co.', price: 92.30 },
}

function genHistory(price: number, seed: number): number[] {
  const hist: number[] = []
  let p = price - (price * 0.05 * (seed % 3))
  for (let i = 0; i < 20; i++) {
    p += (Math.random() - 0.5) * price * 0.02
    hist.push(parseFloat(p.toFixed(2)))
  }
  hist.push(price)
  return hist
}

function createStock(symbol: string): Stock {
  const info = AVAILABLE_STOCKS[symbol]
  const seed = symbol.charCodeAt(0) + symbol.length
  const history = genHistory(info.price, seed)
  const prevClose = history[0]
  const change = parseFloat((info.price - prevClose).toFixed(2))
  const changePercent = parseFloat(((change / prevClose) * 100).toFixed(2))
  return {
    symbol,
    name: info.name,
    price: info.price,
    change,
    changePercent,
    history,
  }
}

const DEFAULT_WATCHLIST = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']

function loadWatchlist(): Stock[] {
  try {
    const s = localStorage.getItem(WATCHLIST_KEY)
    if (s) {
      const symbols: string[] = JSON.parse(s)
      return symbols.map(createStock)
    }
  } catch {}
  return DEFAULT_WATCHLIST.map(createStock)
}

function persistWatchlist(stocks: Stock[]) {
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(stocks.map((s) => s.symbol))) } catch {}
}

function jitterPrice(price: number): number {
  return parseFloat((price + (Math.random() - 0.5) * price * 0.005).toFixed(2))
}

function formatPrice(p: number): string {
  return p.toFixed(2)
}

export function Stocks({ windowId: _windowId }: { windowId: string }) {
  const [stocks, setStocks] = useState<Stock[]>(loadWatchlist)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stocksRef = useRef(stocks)
  stocksRef.current = stocks

  useEffect(() => { persistWatchlist(stocks) }, [stocks])

  // Animate prices on an interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStocks((prev) => prev.map((s) => {
        const newPrice = jitterPrice(s.price)
        const newChange = parseFloat((newPrice - (s.history[0] || newPrice)).toFixed(2))
        const newChangePercent = parseFloat(((newChange / (s.history[0] || newPrice)) * 100).toFixed(2))
        return {
          ...s,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          history: [...s.history.slice(1), newPrice],
        }
      }))
    }, 2000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const addStock = useCallback((symbol: string) => {
    if (stocks.some((s) => s.symbol === symbol)) return
    setStocks((prev) => [...prev, createStock(symbol)])
    setShowSearch(false)
    setSearchInput('')
  }, [stocks])

  const removeStock = useCallback((symbol: string) => {
    setStocks((prev) => prev.filter((s) => s.symbol !== symbol))
    if (selectedSymbol === symbol) setSelectedSymbol(null)
  }, [selectedSymbol])

  const filteredResults = Object.keys(AVAILABLE_STOCKS).filter((sym) => {
    if (!searchInput) return true
    const q = searchInput.toUpperCase()
    return sym.includes(q) || AVAILABLE_STOCKS[sym].name.toUpperCase().includes(q)
  }).filter((sym) => !stocks.some((s) => s.symbol === sym))

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol)

  const sparklinePoints = (history: number[]): string => {
    const min = Math.min(...history)
    const max = Math.max(...history)
    const range = max - min || 1
    return history.map((v, i) => `${(i / (history.length - 1)) * 100},${30 - ((v - min) / range) * 28}`).join(' ')
  }

  return (
    <div data-testid="stocks-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>Watchlist</span>
        <button data-testid="search-btn" onClick={() => setShowSearch(!showSearch)} style={{ border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 16 }}>🔍</button>
      </div>

      {/* Search panel */}
      {showSearch && (
        <div data-testid="search-panel" style={{ padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
          <input
            data-testid="stock-search"
            type="text"
            placeholder="Search symbol or name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: '100%', padding: '4px 8px', border: '0.5px solid var(--glass-border)', borderRadius: 6, background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ marginTop: 4, maxHeight: 150, overflowY: 'auto' }}>
            {filteredResults.length === 0 ? (
              <div data-testid="search-empty" style={{ padding: 8, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>No results</div>
            ) : (
              filteredResults.map((sym) => (
                <button
                  key={sym}
                  data-testid={`result-${sym}`}
                  onClick={() => addStock(sym)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '4px 8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12 }}
                >
                  <span style={{ fontWeight: 700, minWidth: 50 }}>{sym}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{AVAILABLE_STOCKS[sym].name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Stock list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {stocks.length === 0 ? (
          <div data-testid="watchlist-empty" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            No stocks in watchlist
          </div>
        ) : (
          stocks.map((stock) => {
            const isPositive = stock.change >= 0
            return (
              <div
                key={stock.symbol}
                data-testid={`stock-${stock.symbol}`}
                onClick={() => setSelectedSymbol(stock.symbol)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: selectedSymbol === stock.symbol ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div data-testid={`symbol-${stock.symbol}`} style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{stock.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{stock.name}</div>
                </div>
                {/* Sparkline */}
                <svg data-testid={`sparkline-${stock.symbol}`} width="60" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ flexShrink: 0 }}>
                  <polyline
                    points={sparklinePoints(stock.history)}
                    fill="none"
                    stroke={isPositive ? '#30d158' : '#ff453a'}
                    strokeWidth="1"
                  />
                </svg>
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <div data-testid={`price-${stock.symbol}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${formatPrice(stock.price)}</div>
                  <div data-testid={`change-${stock.symbol}`} style={{ fontSize: 11, color: isPositive ? '#30d158' : '#ff453a' }}>
                    {isPositive ? '+' : ''}{formatPrice(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent}%)
                  </div>
                </div>
                <button
                  data-testid={`remove-${stock.symbol}`}
                  onClick={(e) => { e.stopPropagation(); removeStock(stock.symbol) }}
                  style={{ border: 'none', background: 'transparent', color: '#ff5f57', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
                >✕</button>
              </div>
            )
          })
        )}
      </div>

      {/* Detail view */}
      {selectedStock && (
        <div data-testid="stock-detail" style={{ borderTop: '0.5px solid var(--glass-border)', padding: '12px 16px', flexShrink: 0, background: 'var(--glass-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedStock.symbol}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{selectedStock.name}</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>${formatPrice(selectedStock.price)}</span>
            <span style={{ fontSize: 13, color: selectedStock.change >= 0 ? '#30d158' : '#ff453a' }}>
              {selectedStock.change >= 0 ? '+' : ''}{formatPrice(selectedStock.change)} ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent}%)
            </span>
          </div>
          {/* Large sparkline */}
          <svg data-testid="detail-sparkline" width="100%" height="60" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
              points={sparklinePoints(selectedStock.history)}
              fill="none"
              stroke={selectedStock.change >= 0 ? '#30d158' : '#ff453a'}
              strokeWidth="0.5"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
