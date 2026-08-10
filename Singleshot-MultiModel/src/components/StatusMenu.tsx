import { useState } from 'react';
import { BatteryFull, Volume2, Wifi } from 'lucide-react';
import Menu from './Menu';
import type { MenuItem } from '../types';

/**
 * Status icons shown on the right side of the menu bar. Clicking the icon
 * toggles a small dropdown with mock controls (purely visual for now).
 */
function StatusButton({
  label,
  children,
  items,
  testId,
}: {
  label: string;
  children: React.ReactNode;
  items: MenuItem[];
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" data-testid={testId}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={
          'flex h-full items-center px-2 text-white/90 ' +
          (open ? 'bg-white/20' : 'hover:bg-white/10')
        }
      >
        {children}
      </button>
      {open && (
        <div className="absolute right-0 top-full">
          <Menu items={items} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default function StatusMenu() {
  return (
    <div className="flex h-full items-center">
      <StatusButton
        label="Control center"
        testId="status-controlcenter"
        items={[
          { id: 'wifi', label: 'Wi-Fi: Home Network', disabled: true },
          { id: 'bt', label: 'Bluetooth: On', disabled: true },
          { id: 'airdrop', label: 'AirDrop: Contacts Only', disabled: true },
        ]}
      >
        <Wifi className="h-4 w-4" />
      </StatusButton>
      <StatusButton
        label="Volume"
        testId="status-volume"
        items={[
          { id: 'mute', label: 'Mute', shortcut: 'Cmd+Option+0' },
          { id: 'sep', separator: true },
          { id: 'vol-up', label: 'Volume Up', shortcut: 'F12' },
          { id: 'vol-down', label: 'Volume Down', shortcut: 'F11' },
        ]}
      >
        <Volume2 className="h-4 w-4" />
      </StatusButton>
      <StatusButton
        label="Battery"
        testId="status-battery"
        items={[
          { id: 'pct', label: 'Battery: 92%', disabled: true },
          { id: 'sep', separator: true },
          { id: 'prefs', label: 'Battery Settings…' },
        ]}
      >
        <BatteryFull className="h-4 w-4" />
      </StatusButton>
    </div>
  );
}
