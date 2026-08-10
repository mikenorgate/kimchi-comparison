import { useState, useEffect, useRef, useCallback } from 'react';
import { Apple } from 'lucide-react';
import SystemIcon from './SystemIcon.jsx';

/**
 * MenuBar
 *
 * Fixed, full-width invisible menu bar that runs along the top of the
 * desktop. Renders the active app label on the left and an Apple-style
 * row of menu dropdowns on the right.
 *
 * Behavior matches the high-level macOS pattern:
 *   - Left side shows the Apple logo + the name of the frontmost app.
 *   - A row of menu labels (Apple, App, File, Edit, View, Window, Help)
 *     runs to the right. Clicking a label opens its dropdown panel.
 *   - Clicking outside, pressing Escape, or selecting a menu item closes
 *     the open dropdown.
 *
 * Props:
 *   - activeApp ({ id, name } | string | null, optional): identifies the
 *     currently focused app. When an object with a `.name` is provided,
 *     the left-side label and the second menu label switch to that app.
 *     A bare string is treated as the app name. Falsy / omitted values
 *     fall back to "Finder".
 *   - onMenuAction (function, optional): invoked as `onMenuAction(type, label)`
 *     whenever a menu item is activated. `type` is the menu id (e.g. "apple",
 *     "file", "app"). `label` is the item label. If not provided, the click
 *     is a no-op.
 *   - className (string, optional): extra classes appended to the root.
 */
const DEFAULT_APP_LABEL = 'Finder';
export { DEFAULT_APP_LABEL };

const BASE_MENUS = ['apple', 'app', 'file', 'edit', 'view', 'window', 'help'];

/**
 * Static menu definitions. Each entry maps a menu id to its display label
 * and a list of items. Items may be a string (label) or an object
 * `{ label, separator }`. Items without an explicit id fall back to the
 * label string for testability.
 */
const MENUS = Object.freeze({
  apple: {
    id: 'apple',
    label: '',
    items: [
      { label: 'About This Mac', type: 'about' },
      { separator: true, label: '' },
      { label: 'System Settings…', type: 'settings' },
      { label: 'App Store…', type: 'app-store' },
      { separator: true, label: '' },
      { label: 'Recent Items', type: 'recent' },
      { separator: true, label: '' },
      { label: 'Force Quit…', type: 'force-quit' },
      { separator: true, label: '' },
      { label: 'Sleep', type: 'sleep' },
      { label: 'Restart…', type: 'restart' },
      { label: 'Shut Down…', type: 'shutdown' },
    ],
  },
  app: {
    id: 'app',
    label: 'Finder',
    items: [
      { label: 'About Finder', type: 'about' },
      { separator: true, label: '' },
      { label: 'Preferences…', type: 'preferences' },
      { separator: true, label: '' },
      { label: 'Empty Trash', type: 'empty-trash' },
    ],
  },
  file: {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New Window', type: 'new-window' },
      { label: 'New Tab', type: 'new-tab' },
      { separator: true, label: '' },
      { label: 'Open…', type: 'open' },
      { label: 'Close Window', type: 'close-window' },
    ],
  },
  edit: {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo', type: 'undo' },
      { label: 'Redo', type: 'redo' },
      { separator: true, label: '' },
      { label: 'Cut', type: 'cut' },
      { label: 'Copy', type: 'copy' },
      { label: 'Paste', type: 'paste' },
      { separator: true, label: '' },
      { label: 'Select All', type: 'select-all' },
    ],
  },
  view: {
    id: 'view',
    label: 'View',
    items: [
      { label: 'as Icons', type: 'as-icons' },
      { label: 'as List', type: 'as-list' },
      { label: 'as Columns', type: 'as-columns' },
      { separator: true, label: '' },
      { label: 'Show Path Bar', type: 'show-path' },
    ],
  },
  window: {
    id: 'window',
    label: 'Window',
    items: [
      { label: 'Minimize', type: 'minimize' },
      { label: 'Zoom', type: 'zoom' },
      { separator: true, label: '' },
      { label: 'Bring All to Front', type: 'bring-all-front' },
    ],
  },
  help: {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'macOS Help', type: 'macos-help' },
    ],
  },
});

/**
 * App-specific menus. Used when `activeApp` is provided. Only the
 * "app" slot is overridden; the other slots (file/edit/view/...) keep
 * their base entries.
 */
const APP_MENUS = Object.freeze({
  Safari: {
    id: 'app',
    label: 'Safari',
    items: [
      { label: 'About Safari', type: 'about' },
      { separator: true, label: '' },
      { label: 'Preferences…', type: 'preferences' },
      { separator: true, label: '' },
      { label: 'New Window', type: 'new-window' },
      { label: 'New Private Window', type: 'new-private-window' },
      { separator: true, label: '' },
      { label: 'Clear History…', type: 'clear-history' },
    ],
  },
});

function resolveAppName(activeApp) {
  if (!activeApp) return DEFAULT_APP_LABEL;
  if (typeof activeApp === 'string') {
    return activeApp.length > 0 ? activeApp : DEFAULT_APP_LABEL;
  }
  if (typeof activeApp === 'object' && typeof activeApp.name === 'string') {
    return activeApp.name.length > 0 ? activeApp.name : DEFAULT_APP_LABEL;
  }
  return DEFAULT_APP_LABEL;
}

function buildMenus(activeApp) {
  const appName = resolveAppName(activeApp);
  const override = APP_MENUS[appName];
  const appMenu = override
    ? { ...override, label: appName }
    : { ...MENUS.app, label: appName };

  return BASE_MENUS.map((id) => (id === 'app' ? appMenu : MENUS[id]));
}

function MenuBar({ activeApp = null, onMenuAction, className = '' }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const rootRef = useRef(null);

  const menus = buildMenus(activeApp);
  const appName = resolveAppName(activeApp);

  const toggleMenu = useCallback((id) => {
    setOpenMenuId((current) => (current === id ? null : id));
  }, []);

  // Close on Escape and on outside clicks while a menu is open.
  useEffect(() => {
    if (!openMenuId) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) {
        return;
      }
      setOpenMenuId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openMenuId]);

  const handleItemClick = useCallback(
    (menu, item) => {
      if (item.separator) return;
      if (typeof onMenuAction === 'function') {
        onMenuAction(menu.id, item.label);
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(`[MenuBar] ${menu.id} -> ${item.label}`);
      }
      setOpenMenuId(null);
    },
    [onMenuAction],
  );

  return (
    <div
      ref={rootRef}
      role="menubar"
      data-testid="menu-bar"
      data-active-app={appName}
      className={`fixed top-0 left-0 right-0 z-50 h-7 flex items-center px-3 text-xs text-white glass-menu ${className}`.trim()}
    >
      {/* Left side: Apple logo + active app label */}
      <div
        data-testid="menu-bar-left"
        className="flex items-center gap-2 font-semibold"
      >
        <span
          aria-label="Apple menu"
          className="inline-flex items-center justify-center"
        >
          <SystemIcon icon={Apple} size="sm" strokeWidth={1.5} />
        </span>
        <span data-testid="menu-bar-app-label" className="select-none">
          {appName}
        </span>
      </div>

      {/* Menu labels */}
      <div
        data-testid="menu-bar-items"
        className="flex items-center gap-1 ml-4"
      >
        {menus
          .filter((menu) => menu.id !== 'apple')
          .map((menu) => {
            const isOpen = openMenuId === menu.id;
            return (
              <div key={menu.id} className="relative">
                <button
                  type="button"
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  data-testid={`menu-bar-trigger-${menu.id}`}
                  onClick={() => toggleMenu(menu.id)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    isOpen ? 'bg-white/20' : 'hover:bg-white/15'
                  }`}
                >
                  {menu.label}
                </button>
                {isOpen ? (
                  <div
                    role="menu"
                    data-testid={`menu-bar-dropdown-${menu.id}`}
                    className="absolute left-0 top-full mt-1 min-w-[14rem] py-1 glass-menu text-gray-900 dark:text-gray-50"
                    style={{ zIndex: 60 }}
                  >
                    {menu.items.map((item, index) => {
                      if (item.separator) {
                        return (
                          <div
                            key={`sep-${menu.id}-${index}`}
                            role="separator"
                            data-testid={`menu-bar-separator-${menu.id}-${index}`}
                            className="my-1 border-t border-black/10 dark:border-white/15"
                          />
                        );
                      }
                      return (
                        <button
                          key={`${menu.id}-${item.label}-${index}`}
                          type="button"
                          role="menuitem"
                          data-testid={`menu-bar-item-${menu.id}-${item.label}`}
                          onClick={() => handleItemClick(menu, item)}
                          className="block w-full text-left px-3 py-1 hover:bg-blue-500/20 focus:bg-blue-500/20 focus:outline-none"
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default MenuBar;
export { MENUS, APP_MENUS, buildMenus, resolveAppName };
