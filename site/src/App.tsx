import { Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import './App.css';
import examples from './data/examples.json';
import { ExampleList } from './components/ExampleList';
import { ExampleDetail } from './components/ExampleDetail';
import type { Example } from './types';

function formatDuration(ms: number | null) {
  if (ms === null || ms === undefined) return '—';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

function agentLabel(example: Example) {
  if (example.agent === 'kimchi') return 'Kimchi';
  if (example.agent === 'claude') return 'Claude';
  return 'Other';
}

function SharedPrompt() {
  const prompt = examples[0]?.originalPrompt || '';
  return (
    <section className="shared-prompt">
      <div className="section-label">The Prompt</div>
      <blockquote className="prompt-block">{prompt}</blockquote>
    </section>
  );
}

function Stats() {
  const agents = new Set(examples.map((e) => e.agent));
  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-value">{examples.length}</span>
        <span className="stat-label">implementations</span>
      </div>
      <div className="stat">
        <span className="stat-value">{agents.size}</span>
        <span className="stat-label">agents</span>
      </div>
    </div>
  );
}

function LandingPage() {
  const kimchi = examples.filter((e) => e.agent === 'kimchi');
  const others = examples.filter((e) => e.agent !== 'kimchi');

  return (
    <main className="app">
      <header className="hero">
        <p className="hero-subtitle">macOS Tahoe Desktop</p>
        <h1>
          Same prompt.
          <br />
          <span>Different agents.</span>
        </h1>
        <p className="hero-body">
          Four implementations of the same macOS Tahoe web desktop, compared by
          agent, time, and approach.
        </p>
        <Stats />
      </header>

      <div className="divider" aria-hidden="true" />

      <SharedPrompt />

      <div className="divider" aria-hidden="true" />

      <section className="comparison">
        {kimchi.length > 0 && (
          <div className="comparison-group">
            <h2 className="group-title group-title--kimchi">Kimchi</h2>
            <ExampleList examples={kimchi} />
          </div>
        )}

        {others.length > 0 && (
          <div className="comparison-group">
            <h2 className="group-title group-title--others">
              {others.every((e) => e.agent === 'claude') ? 'Claude' : 'Other agents'}
            </h2>
            <ExampleList examples={others} />
          </div>
        )}
      </section>

      <footer className="site-footer">
        <p>Auto-generated from agent session metadata.</p>
      </footer>
    </main>
  );
}

function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const example = examples.find((e) => e.id === id);
  if (!example) {
    return (
      <main className="app">
        <p>Example not found.</p>
      </main>
    );
  }
  return (
    <main className="app">
      <Link className="back-link" to="/">← All implementations</Link>
      <ExampleDetail example={example} />
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/example/:id" element={<DetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
export { formatDuration, agentLabel };
