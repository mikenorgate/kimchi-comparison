import { useEffect, useMemo, useState } from 'react';

interface StockSeriesPoint {
  t: number;
  v: number;
}

interface Stock {
  symbol: string;
  name: string;
  series: StockSeriesPoint[];
}

const SEED_STOCKS: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    series: generateSeries(192.0, 60, 0.4),
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    series: generateSeries(420.5, 60, 0.3),
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet',
    series: generateSeries(178.2, 60, 0.5),
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    series: generateSeries(186.7, 60, 0.6),
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    series: generateSeries(1120.4, 60, 1.2),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    series: generateSeries(248.0, 60, 1.8),
  },
  {
    symbol: 'META',
    name: 'Meta Platforms',
    series: generateSeries(560.3, 60, 0.7),
  },
  {
    symbol: 'NFLX',
    name: 'Netflix',
    series: generateSeries(715.1, 60, 0.9),
  },
];

function generateSeries(
  start: number,
  length: number,
  volatility: number,
): StockSeriesPoint[] {
  // Deterministic pseudo-random walk so prices are stable across renders.
  const series: StockSeriesPoint[] = [];
  let value = start;
  let seed = start * 1000;
  for (let i = 0; i < length; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280 - 0.5;
    value = Math.max(1, value + r * volatility);
    series.push({ t: i, v: round2(value) });
  }
  return series;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function Sparkline({
  series,
  up,
}: { series: StockSeriesPoint[]; up: boolean }): JSX.Element {
  const w = 100;
  const h = 30;
  const min = Math.min(...series.map((p) => p.v));
  const max = Math.max(...series.map((p) => p.v));
  const range = max - min || 1;
  const stepX = w / Math.max(1, series.length - 1);
  const points = series
    .map((p, idx) => {
      const x = idx * stepX;
      const y = h - ((p.v - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  const color = up ? '#34c759' : '#ff3b30';
  const last = series[series.length - 1]!;
  const lastX = (series.length - 1) * stepX;
  const lastY = h - ((last.v - min) / range) * h;
  return (
    <svg className="stocks-row__spark" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  );
}

interface RowStats {
  price: number;
  change: number;
  pct: number;
  up: boolean;
}

function computeStats(s: StockSeriesPoint[]): RowStats {
  const first = s[0]!;
  const last = s[s.length - 1]!;
  const change = round2(last.v - first.v);
  const pct = round2((change / first.v) * 100);
  return { price: last.v, change, pct, up: change >= 0 };
}

export function Stocks(): JSX.Element {
  const [stocks, setStocks] = useState<Stock[]>(SEED_STOCKS);

  // Simulate live price updates every 4 seconds by appending a new point and
  // dropping the oldest.
  useEffect(() => {
    const id = window.setInterval(() => {
      setStocks((prev) =>
        prev.map((stock) => {
          const last = stock.series[stock.series.length - 1]!;
          const seed = Date.now() % 1000;
          const drift = ((seed / 1000) - 0.5) * 0.5;
          const nextVal = round2(Math.max(1, last.v + drift));
          const nextSeries = [...stock.series.slice(1), { t: last.t + 1, v: nextVal }];
          return { ...stock, series: nextSeries };
        }),
      );
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(() => stocks.map((s) => ({ stock: s, stats: computeStats(s.series) })), [stocks]);

  const totalChange = useMemo(
    () => round2(rows.reduce((acc, r) => acc + r.stats.change, 0)),
    [rows],
  );
  const gainers = rows.filter((r) => r.stats.up).length;
  const losers = rows.length - gainers;

  return (
    <div className="stocks-root">
      <div className="stocks-summary">
        <div className="stocks-summary__item">
          <div className="stocks-summary__label">Watchlist</div>
          <div className="stocks-summary__value">{rows.length}</div>
        </div>
        <div className="stocks-summary__item">
          <div className="stocks-summary__label">Net Change</div>
          <div
            className="stocks-summary__value"
            style={{ color: totalChange >= 0 ? '#34c759' : '#ff3b30' }}
          >
            {totalChange >= 0 ? '+' : ''}
            {totalChange}
          </div>
        </div>
        <div className="stocks-summary__item">
          <div className="stocks-summary__label">Gainers</div>
          <div className="stocks-summary__value" style={{ color: '#34c759' }}>
            {gainers}
          </div>
        </div>
        <div className="stocks-summary__item">
          <div className="stocks-summary__label">Losers</div>
          <div className="stocks-summary__value" style={{ color: '#ff3b30' }}>
            {losers}
          </div>
        </div>
      </div>
      <div className="stocks-table">
        {rows.map(({ stock, stats }) => (
          <div className="stocks-row" key={stock.symbol}>
            <div>
              <div className="stocks-row__symbol">{stock.symbol}</div>
            </div>
            <div className="stocks-row__name">{stock.name}</div>
            <div className="stocks-row__price">{stats.price.toFixed(2)}</div>
            <div
              className={`stocks-row__change ${stats.up ? 'stocks-row__change--up' : 'stocks-row__change--down'}`}
            >
              {stats.change >= 0 ? '+' : ''}
              {stats.change.toFixed(2)} ({stats.pct >= 0 ? '+' : ''}
              {stats.pct.toFixed(2)}%)
            </div>
            <Sparkline series={stock.series} up={stats.up} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stocks;
