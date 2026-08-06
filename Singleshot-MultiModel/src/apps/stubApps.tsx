/* eslint-disable react-refresh/only-export-components */
import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

/**
 * Minimal stub component used for apps that are registered in the Dock /
 * Launchpad but whose real implementation is delivered in later chunks
 * (Chunk 5+). When a user opens one of these stubs they see a placeholder
 * inside the window.
 */
function StubAppPlaceholder({ appName }: { appName: string }): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 8,
        padding: 24,
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
      }}
    >
      <div style={{ fontSize: 32 }}>🚧</div>
      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{appName}</div>
      <div style={{ fontSize: 13 }}>
        This app is a placeholder for Chunk 3 of the macOS Tahoe build.
      </div>
    </div>
  );
}

interface StubAppSpec {
  id: string;
  name: string;
  icon: string;
  category: AppDefinition['category'];
  canOpenMultiple?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
}

const STUB_SPECS: StubAppSpec[] = [
  { id: 'finder', name: 'Finder', icon: '📁', category: 'system', canOpenMultiple: false },
  { id: 'safari', name: 'Safari', icon: '🧭', category: 'productivity' },
  { id: 'mail', name: 'Mail', icon: '✉️', category: 'productivity' },
  { id: 'music', name: 'Music', icon: '🎵', category: 'media' },
  { id: 'photos', name: 'Photos', icon: '🖼️', category: 'media' },
  { id: 'podcasts', name: 'Podcasts', icon: '🎙️', category: 'media' },
  { id: 'tv', name: 'TV', icon: '📺', category: 'media' },
  { id: 'system-settings', name: 'System Settings', icon: '⚙️', category: 'system' },
  { id: 'notes', name: 'Notes', icon: '📝', category: 'productivity' },
  { id: 'reminders', name: 'Reminders', icon: '✅', category: 'productivity' },
  { id: 'calculator', name: 'Calculator', icon: '🧮', category: 'utilities' },
  { id: 'weather', name: 'Weather', icon: '⛅', category: 'utilities' },
  { id: 'maps', name: 'Maps', icon: '🗺️', category: 'utilities' },
  { id: 'clock', name: 'Clock', icon: '⏰', category: 'utilities' },
  { id: 'stocks', name: 'Stocks', icon: '📈', category: 'productivity' },
  { id: 'calendar', name: 'Calendar', icon: '📅', category: 'productivity' },
  { id: 'terminal', name: 'Terminal', icon: '⌨️', category: 'utilities' },
  { id: 'launchpad', name: 'Launchpad', icon: '🚀', category: 'system' },
  { id: 'trash', name: 'Trash', icon: '🗑️', category: 'system' },
];

function makeStubComponent(appName: string): ComponentType<{ windowId: string }> {
  const Component: ComponentType<{ windowId: string }> = () => (
    <StubAppPlaceholder appName={appName} />
  );
  Component.displayName = `${appName}Stub`;
  return Component;
}

/**
 * Build the full list of stub AppDefinitions to register with the store.
 * Each definition points to the same placeholder component until Chunk 5+
 * ships real apps.
 */
export function buildStubApps(): AppDefinition[] {
  return STUB_SPECS.map((spec) => ({
    id: spec.id,
    name: spec.name,
    icon: spec.icon,
    category: spec.category,
    component: makeStubComponent(spec.name),
    canOpenMultiple: spec.canOpenMultiple ?? true,
    defaultWidth: spec.defaultWidth ?? 720,
    defaultHeight: spec.defaultHeight ?? 480,
    minWidth: 320,
    minHeight: 240,
    menus: defaultAppMenus(spec.name),
  }));
}

function defaultAppMenus(name: string): AppDefinition['menus'] {
  return [
    {
      title: 'File',
      items: [
        { label: `New`, shortcut: '⌘N' },
        { label: `Open…`, shortcut: '⌘O' },
        { separator: true, label: '' },
        { label: `Close Window`, shortcut: '⌘W' },
        { label: `Quit ${name}`, shortcut: '⌘Q' },
      ],
    },
    {
      title: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z' },
        { label: 'Redo', shortcut: '⇧⌘Z' },
        { separator: true, label: '' },
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      title: 'View',
      items: [
        { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
        { separator: true, label: '' },
        { label: 'Actual Size', shortcut: '⌘0' },
        { label: 'Zoom In', shortcut: '⌘+' },
        { label: 'Zoom Out', shortcut: '⌘-' },
      ],
    },
    {
      title: 'Window',
      items: [
        { label: 'Minimize', shortcut: '⌘M' },
        { label: 'Zoom' },
        { separator: true, label: '' },
        { label: 'Bring All to Front' },
      ],
    },
    {
      title: 'Help',
      items: [{ label: `${name} Help` }],
    },
  ];
}
