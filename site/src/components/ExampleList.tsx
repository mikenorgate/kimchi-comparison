import type { Example } from '../types';
import { ExampleCard } from './ExampleCard';

interface ExampleListProps {
  examples: Example[];
}

export function ExampleList({ examples }: ExampleListProps) {
  return (
    <div className="example-list">
      {examples.map((example) => (
        <ExampleCard key={example.id} example={example} />
      ))}
    </div>
  );
}
