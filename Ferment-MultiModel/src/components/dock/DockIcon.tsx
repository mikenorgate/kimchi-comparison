"use client";

import type { MouseEventHandler } from "react";
import type { AppDefinition } from "@/lib/apps";

interface DockIconProps {
  readonly app: AppDefinition;
  readonly running: boolean;
  readonly onLaunch: (id: AppDefinition["id"]) => void;
}

/**
 * A single icon in the Dock. Renders an emoji placeholder inside a
 * rounded square button with hover/active states and a tooltip label.
 * When the corresponding app is running, a small indicator dot appears
 * beneath the icon.
 */
export default function DockIcon({
  app,
  running,
  onLaunch,
}: DockIconProps): JSX.Element {
  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    onLaunch(app.id);
  };

  return (
    <div className="dock-icon-wrapper">
      <button
        type="button"
        className={`dock-icon${running ? " dock-icon--running" : ""}`}
        data-app-id={app.id}
        data-running={running ? "true" : "false"}
        title={app.name}
        aria-label={app.name}
        onClick={handleClick}
      >
        <span className="dock-icon__glyph" aria-hidden="true">
          {app.icon}
        </span>
      </button>
      <span
        className={`dock-icon__indicator${running ? " dock-icon__indicator--on" : ""}`}
        aria-hidden="true"
      />
    </div>
  );
}
