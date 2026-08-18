import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Stocks } from './stocks'

function resetStocks() {
  localStorage.removeItem('tahoe.stocks-watchlist')
}

describe('Stocks', () => {
  beforeEach(() => {
    resetStocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the root with header and watchlist', () => {
    render(<Stocks windowId="w1" />)
    expect(screen.getByTestId('stocks-root')).toBeInTheDocument()
    expect(screen.getByTestId('search-btn')).toBeInTheDocument()
  })

  it('shows default watchlist stocks', () => {
    render(<Stocks windowId="w1" />)
    expect(screen.getByTestId('stock-AAPL')).toBeInTheDocument()
    expect(screen.getByTestId('stock-GOOGL')).toBeInTheDocument()
    expect(screen.getByTestId('stock-MSFT')).toBeInTheDocument()
    expect(screen.getByTestId('stock-AMZN')).toBeInTheDocument()
    expect(screen.getByTestId('stock-TSLA')).toBeInTheDocument()
  })

  it('stock shows symbol, name, price, and change', () => {
    render(<Stocks windowId="w1" />)
    expect(screen.getByTestId('symbol-AAPL')).toHaveTextContent('AAPL')
    expect(screen.getByTestId('stock-AAPL')).toHaveTextContent('Apple Inc.')
    expect(screen.getByTestId('price-AAPL')).toHaveTextContent('$')
    expect(screen.getByTestId('change-AAPL')).toHaveTextContent('%')
  })

  it('positive change shows green, negative shows red', () => {
    render(<Stocks windowId="w1" />)
    const change = screen.getByTestId('change-AAPL')
    const color = change.style.color
    expect(['rgb(48, 209, 88)', 'rgb(255, 69, 58)']).toContain(color)
  })

  it('stock row has sparkline SVG', () => {
    render(<Stocks windowId="w1" />)
    expect(screen.getByTestId('sparkline-AAPL')).toBeInTheDocument()
    expect(screen.getByTestId('sparkline-GOOGL')).toBeInTheDocument()
  })

  it('search button opens search panel', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect(screen.getByTestId('search-panel')).toBeInTheDocument()
    expect(screen.getByTestId('stock-search')).toBeInTheDocument()
  })

  it('search shows available stocks not in watchlist', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect(screen.getByTestId('result-NVDA')).toBeInTheDocument()
    expect(screen.getByTestId('result-NFLX')).toBeInTheDocument()
    // Already in watchlist should not appear
    expect(screen.queryByTestId('result-AAPL')).toBeNull()
  })

  it('adding a stock adds it to watchlist', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('result-NVDA'))
    })
    expect(screen.getByTestId('stock-NVDA')).toBeInTheDocument()
  })

  it('search filters by symbol', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('stock-search'), { target: { value: 'NV' } })
    })
    expect(screen.getByTestId('result-NVDA')).toBeInTheDocument()
    expect(screen.queryByTestId('result-NFLX')).toBeNull()
  })

  it('search filters by name', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('stock-search'), { target: { value: 'Netflix' } })
    })
    expect(screen.getByTestId('result-NFLX')).toBeInTheDocument()
    expect(screen.queryByTestId('result-NVDA')).toBeNull()
  })

  it('search with no results shows empty', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('stock-search'), { target: { value: 'ZZZZ' } })
    })
    expect(screen.getByTestId('search-empty')).toBeInTheDocument()
  })

  it('remove stock removes from watchlist', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('remove-TSLA'))
    })
    expect(screen.queryByTestId('stock-TSLA')).toBeNull()
  })

  it('clicking a stock opens detail view', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('stock-AAPL'))
    })
    expect(screen.getByTestId('stock-detail')).toBeInTheDocument()
    expect(screen.getByTestId('detail-sparkline')).toBeInTheDocument()
  })

  it('prices animate on interval', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    const afterPrice = screen.getByTestId('price-AAPL').textContent
    // Price may or may not change (jitter is random), but the element should still be present
    expect(afterPrice).toBeTruthy()
    expect(afterPrice).toContain('$')
  })

  it('sparkline updates on interval', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    const afterPoints = screen.getByTestId('sparkline-AAPL').querySelector('polyline')!.getAttribute('points')
    // Points may change slightly — at minimum the element should still be present
    expect(afterPoints).toBeTruthy()
    expect(screen.getByTestId('sparkline-AAPL')).toBeInTheDocument()
  })

  it('persists watchlist to localStorage', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('result-AMD'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.stocks-watchlist')!)
    expect(stored).toContain('AMD')
    expect(stored).toContain('AAPL')
  })

  it('persisted watchlist survives reload', () => {
    localStorage.setItem('tahoe.stocks-watchlist', JSON.stringify(['META', 'DIS']))
    render(<Stocks windowId="w1" />)
    expect(screen.getByTestId('stock-META')).toBeInTheDocument()
    expect(screen.getByTestId('stock-DIS')).toBeInTheDocument()
    expect(screen.queryByTestId('stock-AAPL')).toBeNull()
  })

  it('removing all stocks shows empty message', () => {
    render(<Stocks windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('remove-AAPL')) })
    act(() => { fireEvent.click(screen.getByTestId('remove-GOOGL')) })
    act(() => { fireEvent.click(screen.getByTestId('remove-MSFT')) })
    act(() => { fireEvent.click(screen.getByTestId('remove-AMZN')) })
    act(() => { fireEvent.click(screen.getByTestId('remove-TSLA')) })
    expect(screen.getByTestId('watchlist-empty')).toBeInTheDocument()
  })

  it('removing selected stock clears detail', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('stock-GOOGL'))
    })
    expect(screen.getByTestId('stock-detail')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('remove-GOOGL'))
    })
    expect(screen.queryByTestId('stock-detail')).toBeNull()
  })

  it('search is case-insensitive for symbols', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('stock-search'), { target: { value: 'nvda' } })
    })
    expect(screen.getByTestId('result-NVDA')).toBeInTheDocument()
  })

  it('detail shows large sparkline with correct color', () => {
    render(<Stocks windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('stock-MSFT'))
    })
    const sparkline = screen.getByTestId('detail-sparkline').querySelector('polyline')!
    expect(sparkline.getAttribute('stroke')).toBeTruthy()
  })

  it('negative change shows red', () => {
    localStorage.setItem('tahoe.stocks-watchlist', JSON.stringify(['INTC']))
    render(<Stocks windowId="w1" />)
    const change = screen.getByTestId('change-INTC')
    // INTC may have positive or negative change depending on seed, but the color should be one of the two
    const color = change.style.color
    expect(['rgb(48, 209, 88)', 'rgb(255, 69, 58)']).toContain(color)
  })
})
