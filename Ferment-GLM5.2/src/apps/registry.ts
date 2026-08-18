/**
 * App registry — defines all apps that appear in the Dock and Spotlight.
 * Each app has an id, name, and an SVG icon component.
 * The icon components are neutral lookalikes (not Apple's copyrighted artwork).
 */

export interface AppIcon {
  /** Unique app identifier */
  id: string
  /** Display name */
  name: string
  /** SVG path data for the icon glyph */
  iconPath: string
  /** Background gradient for the squircle */
  gradient: string
  /** Default window width */
  defaultWidth: number
  /** Default window height */
  defaultHeight: number
}

export const APP_REGISTRY: AppIcon[] = [
  {
    id: 'finder',
    name: 'Finder',
    iconPath: 'M3 6h18v12H3z M7 6v12 M3 6l2-2h4 M9 4h4l2 2',
    gradient: 'linear-gradient(135deg, #4a9eff, #1a6dd0)',
    defaultWidth: 720,
    defaultHeight: 480,
  },
  {
    id: 'safari',
    name: 'Safari',
    iconPath: 'M12 2a10 10 0 100 20 10 10 0 000-20z M12 6l4 8-4 4-4-4z M12 6v12 M8 10l8 4',
    gradient: 'linear-gradient(135deg, #1a9eff, #0066cc)',
    defaultWidth: 800,
    defaultHeight: 560,
  },
  {
    id: 'notes',
    name: 'Notes',
    iconPath: 'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5',
    gradient: 'linear-gradient(135deg, #fff3a0, #f0c040)',
    defaultWidth: 640,
    defaultHeight: 440,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    iconPath: 'M5 2h14v20H5z M8 5h8 M8 9h3v3H8z M13 9h3v3h-3z M8 14h3v3H8z M13 14h3v3h-3z',
    gradient: 'linear-gradient(135deg, #555, #222)',
    defaultWidth: 280,
    defaultHeight: 420,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    iconPath: 'M3 5h18v16H3z M3 5l2-2 M19 3l2 2 M7 3v4 M17 3v4 M3 9h18 M8 13h2 M14 13h2 M8 17h2',
    gradient: 'linear-gradient(135deg, #ff4a4a, #cc0000)',
    defaultWidth: 640,
    defaultHeight: 480,
  },
  {
    id: 'mail',
    name: 'Mail',
    iconPath: 'M3 5h18v14H3z M3 5l9 7 9-7',
    gradient: 'linear-gradient(135deg, #4af0ff, #0099cc)',
    defaultWidth: 760,
    defaultHeight: 500,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    iconPath: 'M4 4h16v16H4z M7 9l3 3-3 3 M12 15h5',
    gradient: 'linear-gradient(135deg, #2a2a2a, #000)',
    defaultWidth: 640,
    defaultHeight: 400,
  },
  {
    id: 'settings',
    name: 'System Settings',
    iconPath: 'M12 2l2 4-2 2-2-2z M12 22l-2-4 2-2 2 2z M2 12l4 2 2-2-2-2z M22 12l-4-2-2 2 2 2z M6 6l3 1 M18 18l-3-1 M18 6l-3 1 M6 18l3-1',
    gradient: 'linear-gradient(135deg, #888, #444)',
    defaultWidth: 680,
    defaultHeight: 460,
  },
]
