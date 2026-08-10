import { useContext } from 'react';
import { Trash2 } from 'lucide-react';
import AppIcon, { CURATED_APP_IDS } from './AppIcon.jsx';
import SystemIcon from './SystemIcon.jsx';
import WindowContext from '../contexts/WindowContext.jsx';

/**
 * Dock
 *
 * Persistent, horizontally-centered launcher pinned to the bottom of the
 * desktop. Renders a Liquid Glass surface containing a row of icons for
 * the 12 curated apps followed by a separator and a Trash icon.
 *
 * Each entry is rendered as a real <button> so it is keyboard-focusable
 * and announces itself as a labeled control. Activating an entry invokes
 * `onOpenApp(appId)`. The trash icon follows the same contract with the
 * synthetic id 'trash'.
 *
 * Props:
 *   - onOpenApp (function, optional): called as `onOpenApp(appId)` when
 *     any dock entry is activated. Defaults to a no-op so the Dock can
 *     render standalone.
 *   - className (string, optional): extra classes appended to the root.
 */

const TRASH_ID = 'trash';
export { TRASH_ID };

const APP_LABELS = Object.freeze({
  safari: 'Safari',
  messages: 'Messages',
  phone: 'Phone',
  photos: 'Photos',
  notes: 'Notes',
  calendar: 'Calendar',
  calculator: 'Calculator',
  settings: 'Settings',
  games: 'Games',
  journal: 'Journal',
  music: 'Music',
  mail: 'Mail',
});

const ICON_BUTTON_BASE =
  'group flex items-center justify-center w-14 h-14 rounded-xl ' +
  'transition-transform duration-150 ease-out ' +
  'hover:scale-110 hover:bg-white/25 ' +
  'focus:scale-110 focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-white/70 bg-white/10';

function Dock({ onOpenApp, className = '' }) {
  // Read the window context directly so Dock works both inside the
  // <WindowProvider /> tree (where it can dispatch `openApp`) and in
  // standalone tests (where the context default is `null`). This keeps
  // the existing `onOpenApp` prop contract intact.
  const windowCtx = useContext(WindowContext);
  const contextOpenApp =
    windowCtx && windowCtx.actions ? windowCtx.actions.openApp : null;

  const handleActivate = (entryId) => {
    if (typeof contextOpenApp === 'function') {
      contextOpenApp(entryId);
    }
    if (typeof onOpenApp === 'function') {
      onOpenApp(entryId);
    }
  };

  return (
    <div
      data-testid="dock"
      aria-label="Application dock"
      className={
        `fixed bottom-3 left-1/2 -translate-x-1/2 z-40 ` +
        `flex items-end gap-2 px-3 py-2 dock-glass ${className}`.trim()
      }
    >
      <div
        data-testid="dock-items"
        className="flex items-end gap-2"
        role="presentation"
      >
        {CURATED_APP_IDS.map((appId) => {
          const label = APP_LABELS[appId] ?? appId;
          return (
            <button
              key={appId}
              type="button"
              data-testid={`dock-icon-${appId}`}
              data-app-id={appId}
              aria-label={label}
              title={label}
              onClick={() => handleActivate(appId)}
              className={ICON_BUTTON_BASE}
            >
              <AppIcon appId={appId} size="dock" />
            </button>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        data-testid="dock-separator"
        className="self-stretch w-px mx-1 bg-white/30"
      />

      <button
        type="button"
        data-testid={`dock-icon-${TRASH_ID}`}
        data-app-id={TRASH_ID}
        aria-label="Trash"
        title="Trash"
        onClick={() => handleActivate(TRASH_ID)}
        className={ICON_BUTTON_BASE}
      >
        <SystemIcon icon={Trash2} size="dock" />
      </button>
    </div>
  );
}

export default Dock;
