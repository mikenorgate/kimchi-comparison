import { useCallback, useEffect, useRef } from 'react';
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
 *
 * Keyboard navigation:
 *   ArrowDown / ArrowUp    move highlight through enabled items
 *   Home / End             jump to first / last enabled item
 *   Enter / Space          activate the highlighted item
 *   Escape                 dismiss (delegated to onClose)
 */
export default function Menu({ items, onItemActivate, onClose, className }: MenuProps) {
  const listRef = useRef<HTMLUListElement | null>(null);

  // Indices of items that can be highlighted (non-separator, non-disabled).
  const navigable = items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => !item.separator && !item.disabled);
  const firstIdx = navigable.length > 0 ? navigable[0].idx : -1;
  const lastIdx = navigable.length > 0 ? navigable[navigable.length - 1].idx : -1;

  const focusItem = useCallback((idx: number) => {
    const node = listRef.current?.querySelector<HTMLButtonElement>(
      `button[data-menu-index="${idx}"]`,
    );
    node?.focus();
  }, []);

  const handleKey = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      const target = event.target as HTMLElement;
      const currentAttr = target.getAttribute('data-menu-index');
      const current = currentAttr !== null ? Number(currentAttr) : -1;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const pos = navigable.findIndex(({ idx }) => idx === current);
        const nextIdx =
          pos === -1
            ? firstIdx
            : navigable[Math.min(pos + 1, navigable.length - 1)].idx;
        focusItem(nextIdx);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const pos = navigable.findIndex(({ idx }) => idx === current);
        const nextIdx =
          pos === -1
            ? lastIdx
            : navigable[Math.max(pos - 1, 0)].idx;
        focusItem(nextIdx);
      } else if (event.key === 'Home' && firstIdx !== -1) {
        event.preventDefault();
        focusItem(firstIdx);
      } else if (event.key === 'End' && lastIdx !== -1) {
        event.preventDefault();
        focusItem(lastIdx);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
      }
    },
    [focusItem, navigable, firstIdx, lastIdx, onClose],
  );

  // When the menu first appears, focus the first navigable item so the user
  // can immediately drive the menu with the keyboard.
  useEffect(() => {
    if (firstIdx === -1) return;
    focusItem(firstIdx);
  }, [focusItem, firstIdx]);

  return (
    <ul
      ref={listRef}
      role="menu"
      tabIndex={-1}
      onKeyDown={handleKey}
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
              data-menu-index={idx}
              disabled={isDisabled}
              tabIndex={isDisabled ? -1 : 0}
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
                  : 'hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none cursor-default')
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
