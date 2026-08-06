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
  const models = new Set(examples.map((e) => e.model).filter(Boolean));
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
      <div className="stat">
        <span className="stat-value">{models.size}</span>
        <span className="stat-label">models</span>
      </div>
    </div>
  );
}

interface Group {
  key: string;
  label: string;
  examples: Example[];
}

const MODE_ORDER = ['max', 'xhigh', 'high', 'medium', 'low', 'minimal', 'enabled', 'default'];

function buildGroups(agentFilter: string): Group[] {
  const filtered = examples.filter((e) => e.agent === agentFilter);

  // Group by model only
  const byModel = new Map<string, Example[]>();
  for (const ex of filtered) {
    const model = ex.model || 'Unknown';
    if (!byModel.has(model)) byModel.set(model, []);
    byModel.get(model)!.push(ex);
  }

  const groups: Group[] = [];

  for (const [model, modelExamples] of byModel) {
    // Sort within model by thinking level, then workflow, then duration
    const sorted = [...modelExamples].sort((a, b) => {
      const ai = MODE_ORDER.indexOf(a.thinkingLevel || 'default');
      const bi = MODE_ORDER.indexOf(b.thinkingLevel || 'default');
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      if (a.workflow !== b.workflow) return a.workflow.localeCompare(b.workflow);
      return (a.durationMs || 0) - (b.durationMs || 0);
    });
    groups.push({ key: model, label: model, examples: sorted });
  }

  groups.sort((a, b) => b.examples.length - a.examples.length);
  return groups;
}

function LandingPage() {
  const kimchiGroups = buildGroups('kimchi');
  const otherExamples = examples.filter(
    (e) => e.agent !== 'kimchi'
  );

  // For others, group by model+mode too
  const othersByModel = new Map<string, Example[]>();
  for (const ex of otherExamples) {
    const model = ex.model || 'Unknown';
    if (!othersByModel.has(model)) othersByModel.set(model, []);
    othersByModel.get(model)!.push(ex);
  }

  const othersGroups: Group[] = [];
  for (const [model, modelExamples] of othersByModel) {
    const sorted = [...modelExamples].sort((a, b) => {
      const ai = MODE_ORDER.indexOf(a.thinkingLevel || 'default');
      const bi = MODE_ORDER.indexOf(b.thinkingLevel || 'default');
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      if (a.workflow !== b.workflow) return a.workflow.localeCompare(b.workflow);
      return (a.durationMs || 0) - (b.durationMs || 0);
    });
    othersGroups.push({ key: model, label: model, examples: sorted });
  }
  othersGroups.sort((a, b) => b.examples.length - a.examples.length);

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
          {examples.length} implementations of the same macOS Tahoe web desktop,
          compared by agent, time, and approach.
        </p>
        <Stats />
      </header>

      <div className="divider" aria-hidden="true" />

      <SharedPrompt />

      <div className="divider" aria-hidden="true" />

      <section className="comparison">
        {kimchiGroups.length > 0 && (
          <div className="comparison-group">
            <h2 className="group-title group-title--kimchi">Kimchi</h2>
            {kimchiGroups.map((group) => (
              <div key={group.key} className="model-subgroup">
                <h3 className="subgroup-title">{group.label}</h3>
                <ExampleList examples={group.examples} />
              </div>
            ))}
          </div>
        )}

        {othersGroups.length > 0 && (
          <div className="comparison-group">
            <h2 className="group-title group-title--others">
              {otherExamples.every((e) => e.agent === 'claude') ? 'Claude' : 'Other agents'}
            </h2>
            {othersGroups.map((group) => (
              <div key={group.key} className="model-subgroup">
                <h3 className="subgroup-title">{group.label}</h3>
                <ExampleList examples={group.examples} />
              </div>
            ))}
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
