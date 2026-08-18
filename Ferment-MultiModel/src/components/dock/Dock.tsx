"use client";

import { APPS, type AppId } from "@/lib/apps";
import DockIcon from "./DockIcon";

interface DockProps {
  readonly openApps: ReadonlySet<AppId>;
  readonly onLaunchApp: (id: AppId) => void;
}

/**
 * macOS-style Dock rendered as a translucent bar pinned to the bottom
 * center of the desktop. Maps over the app registry and emits one
 * `DockIcon` per entry. Running apps are highlighted via the
 * `openApps` set passed in from the desktop shell.
 */
export default function Dock({ openApps, onLaunchApp }: DockProps): JSX.Element {
  return (
    <nav className="dock" aria-label="Dock" data-testid="dock">
      <div className="dock__rail">
        {APPS.map((app) => (
          <DockIcon
            key={app.id}
            app={app}
            running={openApps.has(app.id)}
            onLaunch={onLaunchApp}
          />
        ))}
      </div>
    </nav>
  );
}
