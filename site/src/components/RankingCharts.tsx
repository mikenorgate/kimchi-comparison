import { Link } from 'react-router-dom';
import type { Example } from '../types';
import { formatDuration } from '../App';

interface RankingChartProps {
  examples: Example[];
}

function agentColor(agent: string) {
  if (agent === 'kimchi') return '#ff521d';
  if (agent === 'claude') return '#7bd3f7';
  if (agent === 'codex') return '#34d399';
  if (agent === 'opencode') return '#f9a8d4';
  return '#a1a1aa';
}

function parseCost(cost: string | null): number {
  if (!cost) return 0;
  return parseFloat(cost.replace(/[$,]/g, '')) || 0;
}

function totalTokens(ex: Example): number {
  if (!ex.tokenUsage) return 0;
  const t = ex.tokenUsage;
  return t.inputTokens + t.cachedInputTokens + t.cacheWriteTokens + t.outputTokens + t.reasoningTokens;
}

function shortLabel(ex: Example): string {
  const agent = ex.agent === 'kimchi' ? 'K' : ex.agent === 'claude' ? 'CC' : ex.agent === 'codex' ? 'CX' : 'OC';
  const model = (ex.model || '').replace('GPT-', '').replace('Claude ', 'C').replace('GLM ', 'GLM').replace('Kimi K', 'K');
  const level = ex.thinkingLevel && ex.thinkingLevel !== 'enabled' && ex.thinkingLevel !== 'default' ? `(${ex.thinkingLevel[0]})` : '';
  return `${agent} ${model}${level}`;
}

export function RankingCharts({ examples }: RankingChartProps) {
  // Cost ranking (cheapest first)
  const byCost = [...examples]
    .map((ex) => ({ ex, value: parseCost(ex.cost) }))
    .sort((a, b) => a.value - b.value);
  const maxCost = Math.max(...byCost.map((d) => d.value), 0.01);

  // Time ranking (fastest first)
  const byTime = [...examples]
    .map((ex) => ({ ex, value: (ex.durationMs || 0) / 60000 }))
    .sort((a, b) => a.value - b.value);
  const maxTime = Math.max(...byTime.map((d) => d.value), 0.1);

  // Total tokens ranking (fewest first)
  const byTokens = [...examples]
    .map((ex) => ({ ex, value: totalTokens(ex) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => a.value - b.value);
  const maxTokens = Math.max(...byTokens.map((d) => d.value), 1);

  return (
    <section className="ranking-charts">
      <h2 className="ranking-title">Rankings</h2>

      <div className="ranking-grid">
        {/* Cost */}
        <div className="ranking-chart">
          <h3 className="ranking-chart__label">Cost</h3>
          <div className="ranking-bars">
            {byCost.map(({ ex, value }) => (
              <Link
                key={ex.id}
                to={`/example/${ex.id}`}
                className="ranking-bar-row"
              >
                <span className="ranking-bar__label">{shortLabel(ex)}</span>
                <div className="ranking-bar__track">
                  <div
                    className="ranking-bar__fill"
                    style={{
                      width: `${(value / maxCost) * 100}%`,
                      background: agentColor(ex.agent),
                    }}
                  />
                </div>
                <span className="ranking-bar__value">${value.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="ranking-chart">
          <h3 className="ranking-chart__label">Time</h3>
          <div className="ranking-bars">
            {byTime.map(({ ex, value }) => (
              <Link
                key={ex.id}
                to={`/example/${ex.id}`}
                className="ranking-bar-row"
              >
                <span className="ranking-bar__label">{shortLabel(ex)}</span>
                <div className="ranking-bar__track">
                  <div
                    className="ranking-bar__fill"
                    style={{
                      width: `${(value / maxTime) * 100}%`,
                      background: agentColor(ex.agent),
                    }}
                  />
                </div>
                <span className="ranking-bar__value">{formatDuration(ex.durationMs)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tokens */}
        <div className="ranking-chart">
          <h3 className="ranking-chart__label">Total Tokens</h3>
          <div className="ranking-bars">
            {byTokens.map(({ ex, value }) => (
              <Link
                key={ex.id}
                to={`/example/${ex.id}`}
                className="ranking-bar-row"
              >
                <span className="ranking-bar__label">{shortLabel(ex)}</span>
                <div className="ranking-bar__track">
                  <div
                    className="ranking-bar__fill"
                    style={{
                      width: `${(value / maxTokens) * 100}%`,
                      background: agentColor(ex.agent),
                    }}
                  />
                </div>
                <span className="ranking-bar__value">
                  {value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : `${(value / 1e3).toFixed(0)}K`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
