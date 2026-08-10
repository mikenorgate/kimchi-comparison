/**
 * Cross-platform keyboard helpers.
 *
 * The Tahoe prototype follows the macOS convention where the "primary"
 * modifier is Cmd on Mac and Ctrl on Windows/Linux. These helpers normalize
 * that asymmetry so a single shortcut string like `"Cmd+W"` can be matched
 * against real keyboard events regardless of the host platform.
 */

/** Detect whether the current browser runs on macOS / iPadOS / iOS. */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') return true;
  const platform = (navigator.platform || '').toLowerCase();
  const userAgent = (navigator.userAgent || '').toLowerCase();
  return (
    platform.includes('mac') ||
    platform.includes('iphone') ||
    platform.includes('ipad') ||
    userAgent.includes('mac os') ||
    userAgent.includes('iphone')
  );
}

/**
 * True when the "primary" modifier (Cmd on Mac, Ctrl elsewhere) is held.
 * Use this to detect the platform-appropriate command shortcut.
 */
export function isMeta(event: { metaKey: boolean; ctrlKey: boolean }): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

/**
 * Build a normalized shortcut string from a KeyboardEvent. Modifiers are
 * emitted in a stable order (primary, Alt/Option, Shift) and the key is
 * rendered using its human label (e.g. `"Escape"`, `"ArrowLeft"`).
 *
 * Examples:
 *   Cmd+W           -> "Cmd+W"
 *   Ctrl+W          -> "Ctrl+W"
 *   Cmd+Option+Esc  -> "Cmd+Option+Escape"
 */
export function normalizeShortcut(event: KeyboardEvent): string {
  const mac = isMac();
  const parts: string[] = [];

  // Treat Cmd and Ctrl independently so either modifier emits its own label.
  // This keeps the helper platform-agnostic for tests and matches user
  // intuition: Cmd on Mac, Ctrl on Windows/Linux. `metaKey` takes precedence
  // on Mac, `ctrlKey` on non-Mac, but both always normalize to a label.
  if (mac ? event.metaKey || event.ctrlKey : event.ctrlKey || event.metaKey) {
    parts.push(mac ? 'Cmd' : 'Ctrl');
  }
  if (event.altKey) parts.push(mac ? 'Option' : 'Alt');
  if (event.shiftKey) parts.push('Shift');

  const modifierKeys = new Set(['Control', 'Shift', 'Alt', 'Meta', 'OS']);
  let key = event.key;
  if (!modifierKeys.has(key)) {
    if (key === ' ') key = 'Space';
    // Single-character keys normalize to uppercase so the comparison is
    // case-insensitive regardless of whether Shift was held.
    if (key.length === 1) key = key.toUpperCase();
    parts.push(key);
  }
  return parts.join('+');
}

/**
 * Build a displayable shortcut label from a normalized string, swapping
 * "Cmd"/"Option" to the platform-appropriate equivalents. Useful for menu
 * items shown to the user.
 */
export function formatShortcut(shortcut: string | undefined): string | undefined {
  if (!shortcut) return shortcut;
  if (isMac()) return shortcut;
  return shortcut
    .replace(/\bCmd\b/g, 'Ctrl')
    .replace(/\bOption\b/g, 'Alt')
    .replace(/\bMeta\b/g, 'Ctrl');
}
