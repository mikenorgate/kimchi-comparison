import { describe, it, expect } from 'vitest';
import { appContentRegistry, getAppContent } from '../registry';

describe('App Content Registry', () => {
  const expectedAppIds = [
    'finder', 'safari', 'mail', 'notes', 'calculator',
    'settings', 'music', 'photos', 'messages', 'terminal',
    'calendar', 'weather', 'stocks', 'clock', 'reminders',
  ];

  it('registers all 15 builtin apps', () => {
    for (const id of expectedAppIds) {
      expect(appContentRegistry[id]).toBeDefined();
      expect(typeof appContentRegistry[id]).toBe('function');
    }
    expect(Object.keys(appContentRegistry).length).toBeGreaterThanOrEqual(15);
  });

  it('getAppContent returns a component for a registered appId', () => {
    const Comp = getAppContent('finder');
    expect(Comp).toBeDefined();
    expect(typeof Comp).toBe('function');
  });

  it('getAppContent falls back to placeholder for unregistered appId', () => {
    const Comp = getAppContent('nonexistent-app');
    expect(Comp).toBeDefined();
    expect(typeof Comp).toBe('function');
  });
});
