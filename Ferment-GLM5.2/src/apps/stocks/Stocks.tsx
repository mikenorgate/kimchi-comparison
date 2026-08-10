import { useState } from 'react';

interface Stock { symbol: string; name: string; price: number; change: number; changePercent: number; }

const SEED_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 192.45, change: 2.30, changePercent: 1.21 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 168.72, change: -1.15, changePercent: -0.68 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.30, change: 3.50, changePercent: 0.85 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.20, changePercent: -2.05 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 12.40, changePercent: 1.44 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.92, change: 0.78, changePercent: 0.42 },
  { symbol: 'META', name: 'Meta Platforms', price: 502.66, change: 4.10, changePercent: 0.82 },
];

export function Stocks({ appId: _appId }: { appId: string }) {
  const [selected, setSelected] = useState<Stock>(SEED_STOCKS[0]);
  return (
    <div className="flex h-full w-full" data-testid="stocks-root">
      <div className="flex-1 overflow-y-auto p-3" data-testid="stocks-list">
        <div className="text-sm font-semibold text-black/40 dark:text-white/40 uppercase mb-2">Watchlist</div>
        {SEED_STOCKS.map((stock) => (
          <button
            key={stock.symbol}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
              selected.symbol === stock.symbol ? 'bg-[#0a84ff]/15' : 'hover:bg-black/3 dark:hover:bg-white/3'
            }`}
            onClick={() => setSelected(stock)}
            data-testid={`stock-${stock.symbol}`}
          >
            <div>
              <div className="text-sm font-semibold text-black/80 dark:text-white/80">{stock.symbol}</div>
              <div className="text-xs text-black/40 dark:text-white/40">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-black/80 dark:text-white/80">${stock.price.toFixed(2)}</div>
              <div className={`text-xs ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid={`stock-change-${stock.symbol}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="w-48 shrink-0 border-l border-black/5 dark:border-white/5 flex flex-col items-center justify-center p-4 gap-2" data-testid="stocks-detail">
        <div className="text-3xl font-bold text-black/80 dark:text-white/80">{selected.symbol}</div>
        <div className="text-2xl font-thin text-black/70 dark:text-white/70" data-testid="stocks-price">${selected.price.toFixed(2)}</div>
        <div className={`text-sm font-medium ${selected.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {selected.change >= 0 ? '+' : ''}{selected.change.toFixed(2)}
        </div>
        <div className="mt-4 w-full h-20 rounded-lg bg-black/5 dark:bg-white/5 flex items-end p-2 gap-1">
          {Array.from({ length: 12 }).map((_, i) => {
            const h = 20 + Math.random() * 60;
            return <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: selected.change >= 0 ? '#30d158' : '#ff5f57' }} />;
          })}
        </div>
      </div>
    </div>
  );
}
