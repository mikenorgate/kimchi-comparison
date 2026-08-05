import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Stocks } from './Stocks'

describe('Stocks', () => {
  beforeEach(() => {
    render(<Stocks />)
  })

  it('renders the watchlist with default stocks', () => {
    expect(screen.getByTestId('stocks-app')).toBeInTheDocument()
    expect(screen.getByTestId('stocks-watchlist')).toBeInTheDocument()
    expect(screen.getByTestId('stocks-item-stk-aapl')).toBeInTheDocument()
    expect(screen.getByTestId('stocks-item-stk-msft')).toBeInTheDocument()
  })

  it('opens a stock detail view', async () => {
    await userEvent.click(screen.getByTestId('stocks-item-stk-aapl'))
    expect(screen.getByTestId('stocks-detail')).toBeInTheDocument()
    expect(screen.getByTestId('stocks-detail-symbol')).toHaveTextContent('AAPL')
    expect(screen.getByTestId('stocks-detail-price')).toHaveTextContent('$214.50')
  })

  it('returns to the watchlist from detail view', async () => {
    await userEvent.click(screen.getByTestId('stocks-item-stk-msft'))
    expect(screen.getByTestId('stocks-detail')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('stocks-back'))
    expect(screen.queryByTestId('stocks-detail')).not.toBeInTheDocument()
    expect(screen.getByTestId('stocks-watchlist')).toBeInTheDocument()
  })

  it('toggles a stock in the watchlist from detail', async () => {
    await userEvent.click(screen.getByTestId('stocks-item-stk-aapl'))
    await userEvent.click(screen.getByTestId('stocks-watch'))
    await userEvent.click(screen.getByTestId('stocks-back'))
    expect(screen.queryByTestId('stocks-item-stk-aapl')).not.toBeInTheDocument()
  })

  it('searches for stocks by symbol or name', async () => {
    await userEvent.type(screen.getByTestId('stocks-search'), 'tesla')
    expect(screen.getByTestId('stocks-item-stk-tsla')).toBeInTheDocument()
    expect(screen.queryByTestId('stocks-item-stk-aapl')).not.toBeInTheDocument()
  })
})
