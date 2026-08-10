import type { MenuItem } from '../types';

interface MenuProps {
  items: MenuItem[];
  /** Invoked after an item's action runs (and before the menu closes). */
  onItemActivate?: (item: MenuItem) => void;
  /** Invoked when a leaf item is activated and the dropdown should dismiss. */
  onClose?: () => void;
  /** Optional className applied to the menu root for positioning. */
  className?: string;
}

/**
 * Generic vertical menu renderer. Renders separators, disabled items, and
 * keyboard shortcuts. Used by ContextMenu, AppleMenu and the menu-bar
 * dropdowns to keep the look and behavior consistent.
 */
export default function Menu({ items, onItemActivate, onClose, className }: MenuProps) {
  return (
    <ul
      role="menu"
      className={
        'min-w-[200px] rounded-md bg-white/85 backdrop-blur-xl shadow-xl py-1 text-sm text-slate-800 border border-white/40 ' +
        (className ?? '')
      }
    >
      {items.map((item, idx) => {
        if (item.separator) {
          return (
            <li
              key={`sep-${item.id}-${idx}`}
              role="separator"
              className="my-1 mx-1 border-t border-slate-300/60"
            />
          );
        }
        const isDisabled = item.disabled;
        return (
          <li key={item.id} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                item.action?.();
                onItemActivate?.(item);
                onClose?.();
              }}
              className={
                'flex w-full items-center justify-between gap-4 px-3 py-1 text-left ' +
                (isDisabled
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-blue-500 hover:text-white cursor-default')
              }
            >
              <span className="truncate">{item.label ?? ''}</span>
              {item.shortcut && (
                <span className="ml-4 text-xs opacity-70">{item.shortcut}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
