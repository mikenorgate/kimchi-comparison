import type { ComponentType } from 'react';

export const FinderPlaceholder: ComponentType<{ windowId: string }> = () => (
  <div style={{ padding: 16 }}>Finder (placeholder)</div>
);

export const CalculatorPlaceholder: ComponentType<{ windowId: string }> = () => (
  <div style={{ padding: 16 }}>Calculator (placeholder)</div>
);

export const NotesPlaceholder: ComponentType<{ windowId: string }> = () => (
  <div style={{ padding: 16 }}>Notes (placeholder)</div>
);

export const TerminalPlaceholder: ComponentType<{ windowId: string }> = () => (
  <div style={{ padding: 16 }}>Terminal (placeholder)</div>
);

export const SafariPlaceholder: ComponentType<{ windowId: string }> = () => (
  <div style={{ padding: 16 }}>Safari (placeholder)</div>
);

export const SettingsPlaceholder: ComponentType<{ windowId: string }> = () => (
  <div style={{ padding: 16 }}>Settings (placeholder)</div>
);
