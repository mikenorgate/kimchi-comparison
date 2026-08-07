import type { Example } from '../types';
import { formatDuration, agentLabel } from '../App';

interface ExampleDetailProps {
  example: Example;
}

function agentClass(agent: string) {
  if (agent === 'kimchi') return 'agent--kimchi';
  if (agent === 'claude') return 'agent--claude';
  if (agent === 'codex') return 'agent--codex';
  if (agent === 'opencode') return 'agent--opencode';
  return 'agent--unknown';
}

function workflowClass(workflow: string) {
  if (workflow === 'ferment') return 'workflow--ferment';
  if (workflow === 'oneshot') return 'workflow--oneshot';
  if (workflow === '/goal') return 'workflow--goal';
  return 'workflow--default';
}

export function ExampleDetail({ example }: ExampleDetailProps) {
  const base = import.meta.env.BASE_URL || '/';
  const demoUrl = `${base}${example.id}/${example.entryPoint}`.replace(/\/+/g, '/');
  const heading = example.model
    ? `${agentLabel(example)} — ${example.model}`
    : agentLabel(example);

  return (
    <article className="example-detail">
      <header className="example-detail__header">
        <div className="detail-meta">
          <span className={`agent-badge agent-badge--large ${agentClass(example.agent)}`}>
            {agentLabel(example)}
          </span>
          <span className={`workflow-badge ${workflowClass(example.workflow)}`}>
            {example.workflow}
          </span>
        </div>
        <h1>{heading}</h1>
        <p className="example-detail__strategy">{example.approach}</p>
      </header>

      <section className="detail-section metrics-row">
        <div className="metric-card">
          <span className="metric-card__label">Agent</span>
          <span className="metric-card__value">{agentLabel(example)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Model</span>
          <span className="metric-card__value">{example.model || '—'}</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Time</span>
          <span className="metric-card__value">{formatDuration(example.durationMs)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Cost</span>
          <span className="metric-card__value">{example.cost || '—'}</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Thinking</span>
          <span className="metric-card__value">{example.thinkingLevel || '—'}</span>
        </div>
      </section>

      <section className="detail-section">
        <h2>Agent Q&amp;A</h2>
        {example.questionsAndAnswers.length === 0 ? (
          <p className="empty">No Q&amp;A recorded.</p>
        ) : (
          <div className="qa-list">
            {example.questionsAndAnswers.map((qa, index) => (
              <div key={index} className="qa-item">
                <div className="qa-question">{qa.question}</div>
                <div className="qa-answer">{qa.answer}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="detail-section">
        <h2>The Shared Prompt</h2>
        <blockquote className="prompt-block">{example.originalPrompt}</blockquote>
      </section>

      <section className="detail-section">
        <h2>Build &amp; Run</h2>
        <pre className="code-block">
          <code>{example.buildCommand}</code>
        </pre>
        <p className="entry-point">
          Entry point: <code>{example.entryPoint}</code>
        </p>
      </section>

      <section className="detail-section detail-actions">
        <a className="button" href={demoUrl} target="_blank" rel="noreferrer">
          Open implementation →
        </a>
      </section>
    </article>
  );
}
