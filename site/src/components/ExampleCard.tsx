import { Link } from 'react-router-dom';
import type { Example } from '../types';
import { formatDuration, agentLabel } from '../App';

interface ExampleCardProps {
  example: Example;
}

function agentClass(agent: string) {
  if (agent === 'kimchi') return 'agent--kimchi';
  if (agent === 'claude') return 'agent--claude';
  return 'agent--unknown';
}

function workflowClass(workflow: string) {
  if (workflow === 'ferment') return 'workflow--ferment';
  if (workflow === 'oneshot') return 'workflow--oneshot';
  if (workflow === '/goal') return 'workflow--goal';
  return 'workflow--default';
}

export function ExampleCard({ example }: ExampleCardProps) {
  const base = import.meta.env.BASE_URL || '/';
  const demoUrl = `${base}${example.id}/${example.entryPoint}`.replace(/\/+/g, '/');

  return (
    <article className={`example-card ${agentClass(example.agent)}`}>
      <header className="example-card__header">
        <span className={`agent-badge ${agentClass(example.agent)}`}>{agentLabel(example)}</span>
        <span className={`workflow-badge ${workflowClass(example.workflow)}`}>{example.workflow}</span>
        {example.thinkingLevel && (
          <span className="thinking-badge">{example.thinkingLevel}</span>
        )}
      </header>

      <h3 className="example-card__title">
        {example.model ? `${example.workflow} — ${example.model}` : `${agentLabel(example)} ${example.workflow}`}
      </h3>
      <p className="example-card__strategy">{example.approach}</p>

      <div className="metrics">
        <div className="metric">
          <span className="metric__label">Model</span>
          <span className="metric__value">{example.model || '—'}</span>
        </div>
        <div className="metric">
          <span className="metric__label">Time</span>
          <span className="metric__value">{formatDuration(example.durationMs)}</span>
        </div>
        <div className="metric">
          <span className="metric__label">Cost</span>
          <span className="metric__value">{example.cost || '—'}</span>
        </div>
      </div>

      <footer className="example-card__footer">
        <Link className="card-link card-link--primary" to={`/example/${example.id}`}>
          Session details
        </Link>
        <a className="card-link" href={demoUrl} target="_blank" rel="noreferrer">
          Open app →
        </a>
      </footer>
    </article>
  );
}
