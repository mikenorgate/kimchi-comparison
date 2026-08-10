import { Desktop } from '@/shell/Desktop';

/**
 * Root app component — renders the Tahoe desktop shell.
 *
 * Phase 1 had a temporary primitives showcase here; Phase 2 replaces
 * it with the real desktop. Glass primitives are still covered by
 * Vitest unit tests in src/design-system/__tests__/.
 */
export default function App() {
  return <Desktop />;
}
