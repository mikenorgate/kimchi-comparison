'use client';

import { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Wifi,
  Bluetooth,
  Bell,
  Volume2,
  Battery,
  Shield,
  User,
  Check,
} from 'lucide-react';
import { useTheme, type Theme } from '@/app/components/ThemeProvider';

interface Pane {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

function AppearancePane() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-5 w-5" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-5 w-5" /> },
    { value: 'system', label: 'Auto', icon: <Monitor className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-xl font-semibold">Appearance</h2>
        <p className="text-sm opacity-60">Choose a look for your Mac.</p>
      </div>
      <div className="flex gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            data-testid={`settings-appearance-${option.value}`}
            onClick={() => setTheme(option.value)}
            className={`flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              theme === option.value
                ? 'border-accent bg-accent/10'
                : 'border-transparent bg-foreground/5 hover:bg-foreground/10'
            }`}
            style={theme === option.value ? { borderColor: 'var(--accent)' } : undefined}
          >
            {option.icon}
            <span className="text-sm font-medium">{option.label}</span>
            {theme === option.value && <Check className="h-3 w-3 text-accent" />}
          </button>
        ))}
      </div>
      <div
        className="rounded-lg border p-3 text-sm"
        style={{ borderColor: 'var(--window-border)' }}
      >
        Current appearance: <span className="font-medium">{resolvedTheme}</span>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  enabled,
  onChange,
  testId,
}: {
  label: string;
  enabled: boolean;
  onChange: () => void;
  testId: string;
}) {
  return (
    <div
      className="flex items-center justify-between border-b py-3"
      style={{ borderColor: 'var(--window-border)' }}
    >
      <span className="text-sm">{label}</span>
      <button
        data-testid={testId}
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? 'bg-accent' : 'bg-foreground/20'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

function WifiPane() {
  const [enabled, setEnabled] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>('Home-5G');
  const networks = ['Home-5G', 'CoffeeShop-Guest', 'OfficeSecure', 'xfinitywifi'];

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Wi-Fi</h2>
      <ToggleRow label="Wi-Fi" enabled={enabled} onChange={() => setEnabled((v) => !v)} testId="settings-wifi-toggle" />
      {enabled && (
        <div className="space-y-1">
          {networks.map((network) => (
            <button
              key={network}
              data-testid={`settings-wifi-${network}`}
              onClick={() => setSelectedNetwork(network)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                selectedNetwork === network ? 'bg-accent/10' : 'hover:bg-foreground/5'
              }`}
            >
              <span>{network}</span>
              {selectedNetwork === network && <Check className="h-3 w-3 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BluetoothPane() {
  const [enabled, setEnabled] = useState(true);
  const devices = ['AirPods Pro', 'Magic Mouse', 'Trackpad'];

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Bluetooth</h2>
      <ToggleRow label="Bluetooth" enabled={enabled} onChange={() => setEnabled((v) => !v)} testId="settings-bluetooth-toggle" />
      {enabled && (
        <div className="space-y-1">
          {devices.map((device) => (
            <div
              key={device}
              data-testid={`settings-bluetooth-${device}`}
              className="rounded-md px-2 py-1.5 text-sm hover:bg-foreground/5"
            >
              {device}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceholderPane({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm opacity-60">{description}</p>
    </div>
  );
}

export function Settings() {
  const panes: Pane[] = [
    { id: 'appearance', name: 'Appearance', icon: <Monitor className="h-4 w-4" />, component: <AppearancePane /> },
    { id: 'wifi', name: 'Wi-Fi', icon: <Wifi className="h-4 w-4" />, component: <WifiPane /> },
    { id: 'bluetooth', name: 'Bluetooth', icon: <Bluetooth className="h-4 w-4" />, component: <BluetoothPane /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="h-4 w-4" />, component: <PlaceholderPane title="Notifications" description="Manage app notifications and alerts." /> },
    { id: 'sound', name: 'Sound', icon: <Volume2 className="h-4 w-4" />, component: <PlaceholderPane title="Sound" description="Configure output and input devices." /> },
    { id: 'battery', name: 'Battery', icon: <Battery className="h-4 w-4" />, component: <PlaceholderPane title="Battery" description="View battery usage and settings." /> },
    { id: 'privacy', name: 'Privacy & Security', icon: <Shield className="h-4 w-4" />, component: <PlaceholderPane title="Privacy & Security" description="Control app permissions and security settings." /> },
    { id: 'users', name: 'Users & Groups', icon: <User className="h-4 w-4" />, component: <PlaceholderPane title="Users & Groups" description="Manage accounts on this Mac." /> },
  ];

  const [activeId, setActiveId] = useState('appearance');
  const activePane = panes.find((p) => p.id === activeId) ?? panes[0];

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      <aside
        className="flex h-full w-52 flex-col gap-1 border-r p-3"
        style={{ borderColor: 'var(--window-border)', background: 'var(--window-bg)' }}
        data-testid="settings-sidebar"
      >
        {panes.map((pane) => (
          <button
            key={pane.id}
            data-testid={`settings-pane-${pane.id}`}
            onClick={() => setActiveId(pane.id)}
            className={`flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors ${
              activeId === pane.id ? 'bg-accent text-accent-foreground' : 'hover:bg-foreground/5'
            }`}
          >
            {pane.icon}
            {pane.name}
          </button>
        ))}
      </aside>
      <main className="flex-1 overflow-auto" data-testid="settings-content">
        {activePane.component}
      </main>
    </div>
  );
}
