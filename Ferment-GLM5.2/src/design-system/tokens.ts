/**
 * macOS Tahoe — Liquid Glass Design System Tokens
 *
 * Centralized design tokens that power both the Tailwind v4 @theme block
 * in main.css and runtime JS access for components that need computed
 * values (e.g. canvas rendering, inline styles for dynamic surfaces).
 *
 * All values are original approximations of the Tahoe Liquid Glass
 * aesthetic — no copyrighted Apple assets are used.
 */

// ── Appearance Modes ──────────────────────────────────────────────

export type AppearanceMode = 'light' | 'dark' | 'tinted';

// ── Color Palette ─────────────────────────────────────────────────

/**
 * Base grayscale ramps used across all three appearance modes.
 * Each entry is a hex color string.
 */
export const palette = {
  // Neutral ramp (gray scale)
  white: '#ffffff',
  gray50: '#f5f5f7',
  gray100: '#e8e8ed',
  gray200: '#d1d1d6',
  gray300: '#b0b0b5',
  gray400: '#8e8e93',
  gray500: '#636366',
  gray600: '#48484a',
  gray700: '#3a3a3c',
  gray800: '#2c2c2e',
  gray900: '#1c1c1e',
  black: '#000000',

  // Tahoe accent colors
  blue: '#0a84ff',
  blueDark: '#0a6fff',
  purple: '#bf5af2',
  pink: '#ff375f',
  red: '#ff453a',
  orange: '#ff9f0a',
  yellow: '#ffd60a',
  green: '#32d74b',
  teal: '#64d2ff',
  indigo: '#5e5ce6',

  // Glass surface tints (applied via rgba over backdrop)
  glassLight: 'rgba(255, 255, 255, 0.72)',
  glassDark: 'rgba(28, 28, 32, 0.72)',
  glassTinted: 'rgba(255, 255, 255, 0.60)',

  // Specular highlight (top edge sheen)
  specularLight: 'rgba(255, 255, 255, 0.45)',
  specularDark: 'rgba(255, 255, 255, 0.12)',
  specularTinted: 'rgba(255, 255, 255, 0.30)',

  // Text
  textPrimaryLight: 'rgba(0, 0, 0, 0.88)',
  textPrimaryDark: 'rgba(255, 255, 255, 0.92)',
  textSecondaryLight: 'rgba(0, 0, 0, 0.55)',
  textSecondaryDark: 'rgba(255, 255, 255, 0.55)',
} as const;

// ── Backdrop Blur & Saturate ──────────────────────────────────────

export const backdrop = {
  // Standard glass surface
  blur: '20px',
  saturate: '1.8',

  // Reduced transparency (accessibility / user preference)
  blurReduced: '4px',
  saturateReduced: '1.0',

  // Menu bar / floating panels — lighter blur
  blurBar: '24px',
  saturateBar: '2.0',

  // Heavy glass (Spotlight, modals)
  blurHeavy: '40px',
  saturateHeavy: '2.5',
} as const;

// ── Squircle Radii ────────────────────────────────────────────────

/**
 * Tahoe windows and panels use dramatically rounded corners (squircle).
 * CSS `border-radius` approximates this; for true squircle we use the
 * `mask` approach with an SVG superellipse, but border-radius is the
 * pragmatic fallback that works everywhere.
 */
export const radii = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  // Window/panel corners — Tahoe's signature large radius
  window: '16px',
  panel: '14px',
  dock: '22px',
  menu: '10px',
  pill: '9999px',
} as const;

// ── Depth Box Shadows ─────────────────────────────────────────────

export const shadows = {
  // Window floating shadow
  window:
    '0 0 0 0.5px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.12)',
  // Window in dark mode (slightly stronger)
  windowDark:
    '0 0 0 0.5px rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
  // Panel / popover shadow
  panel:
    '0 4px 20px rgba(0, 0, 0, 0.18), 0 1px 4px rgba(0, 0, 0, 0.1)',
  // Dock shadow
  dock:
    '0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 8px 24px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.15)',
  // Menu dropdown shadow
  menu: '0 6px 24px rgba(0, 0, 0, 0.22), 0 1px 4px rgba(0, 0, 0, 0.12)',
  // Inner specular highlight (top edge sheen via inset shadow)
  specular:
    'inset 0 1px 1px rgba(255, 255, 255, 0.35), inset 0 -0.5px 0.5px rgba(0, 0, 0, 0.06)',
  specularDark:
    'inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -0.5px 0.5px rgba(0, 0, 0, 0.2)',
} as const;

// ── Specular Highlight Gradients ──────────────────────────────────

export const gradients = {
  // Top-edge specular sheen for glass surfaces
  specularTop:
    'linear-gradient(to bottom, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.04) 30%, transparent 50%)',
  specularTopDark:
    'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 30%, transparent 50%)',

  // Window chrome gradient (subtle)
  chromeBar:
    'linear-gradient(to bottom, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02))',
  chromeBarDark:
    'linear-gradient(to bottom, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01))',

  // Dock background
  dockBg:
    'linear-gradient(to bottom, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04))',
  dockBgDark:
    'linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',

  // Menu bar
  menuBarBg:
    'linear-gradient(to bottom, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04))',
  menuBarBgDark:
    'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.12))',
} as const;

// ── Spacing Scale ─────────────────────────────────────────────────

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ── Typography ────────────────────────────────────────────────────

export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif',
  // Font sizes (rem)
  fontSize: {
    xxs: '0.625rem', // 10px
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Line heights
  lineHeight: {
    tight: '1.2',
    normal: '1.4',
    relaxed: '1.6',
  },
  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
  },
} as const;

// ── Animation / Motion ────────────────────────────────────────────

export const motion = {
  duration: {
    fast: '0.15s',
    normal: '0.25s',
    slow: '0.4s',
    slower: '0.6s',
  },
  easing: {
    // Standard ease
    ease: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    // Ease-in (for elements exiting)
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    // Ease-out (for elements entering)
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    // Spring-like bounce
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Genie minimize curve
    genie: 'cubic-bezier(0.55, 0.0, 0.45, 1)',
  },
} as const;

// ── Z-Index Layers ────────────────────────────────────────────────

export const zIndex = {
  desktop: 0,
  windows: 100,
  windowFocused: 200,
  dock: 900,
  menuBar: 1000,
  menuDropdown: 1100,
  spotlight: 1200,
  controlCenter: 1150,
  notificationCenter: 1150,
  modal: 2000,
  toast: 3000,
} as const;

// ── Layout Constants ──────────────────────────────────────────────

export const layout = {
  menuBarHeight: '28px',
  dockHeight: '72px',
  dockIconSize: '52px',
  dockIconSizeMagnified: '72px',
  dockSpacing: '8px',
  windowMinWidth: '320px',
  windowMinHeight: '200px',
  sidebarMinWidth: '180px',
  sidebarDefaultWidth: '220px',
} as const;

// ── Combined export for convenience ───────────────────────────────

export const tokens = {
  palette,
  backdrop,
  radii,
  shadows,
  gradients,
  spacing,
  typography,
  motion,
  zIndex,
  layout,
} as const;

export default tokens;
