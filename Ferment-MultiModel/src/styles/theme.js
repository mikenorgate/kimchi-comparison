/**
 * Design tokens for the Tahoe Web Desktop.
 *
 * These JavaScript tokens mirror the CSS custom properties declared in
 * `src/index.css`. Components may consume either layer; the JS tokens are
 * useful when values need to be computed in code (e.g. positioning math,
 * styled component props) while the CSS variables are the primary
 * mechanism for theme-aware styling at the paint layer.
 *
 * Color values are expressed as channel triplets (R G B) without the
 * `rgb(...)` wrapper so that callers can compose them with any alpha:
 *     `rgba(var(--color-surface-rgb), 0.5)`
 * Hex/string values are kept alongside for direct consumers.
 */

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

/**
 * Neutral, surface, text and border tones for the light theme.
 * Names are deliberately abstract ("surface", "surface-elevated") so the
 * layer that consumes them does not have to know about specific hues.
 */
export const lightColors = {
  // Backgrounds
  'bg-base': '245 245 247', // canvas behind everything
  'bg-canvas': '235 235 240', // desktop wallpaper area
  surface: '255 255 255', // default panel
  'surface-elevated': '255 255 255', // raised surfaces (menus, dialogs)
  'surface-sunken': '240 240 243', // recessed surfaces (input wells)
  overlay: '0 0 0', // dim/scrim base

  // Text
  'text-primary': '28 28 30',
  'text-secondary': '72 72 74',
  'text-tertiary': '142 142 147',
  'text-inverse': '255 255 255',
  'text-accent': '0 122 255',

  // Borders / dividers
  border: '210 210 215',
  'border-strong': '180 180 185',
  divider: '230 230 235',

  // States
  'state-hover': '0 0 0 / 0.06',
  'state-active': '0 0 0 / 0.10',
  'state-focus': '0 122 255 / 0.45',

  // Shadows (RGB for alpha composition)
  'shadow-rgb': '0 0 0',
};

/**
 * Dark theme counterparts. Surface tones lean cool blue-gray in the
 * spirit of macOS Sonoma/Sequoia dark UI without copying any Apple
 * artwork.
 */
export const darkColors = {
  'bg-base': '20 20 24',
  'bg-canvas': '28 28 32',
  surface: '40 40 46',
  'surface-elevated': '54 54 60',
  'surface-sunken': '32 32 38',
  overlay: '0 0 0',

  'text-primary': '245 245 247',
  'text-secondary': '180 180 185',
  'text-tertiary': '120 120 128',
  'text-inverse': '28 28 30',
  'text-accent': '10 132 255',

  border: '70 70 78',
  'border-strong': '95 95 105',
  divider: '58 58 64',

  'state-hover': '255 255 255 / 0.08',
  'state-active': '255 255 255 / 0.14',
  'state-focus': '10 132 255 / 0.55',

  'shadow-rgb': '0 0 0',
};

/**
 * Accent tints used for app icons, selection highlights and
 * user-customizable accents. Each entry exposes the canonical color
 * (`rgb`), a lighter and darker shade, plus a "soft" background
 * suitable for tinted glass.
 */
export const accentTints = {
  blue: {
    name: 'blue',
    DEFAULT: '0 122 255',
    soft: '0 122 255 / 0.18',
    strong: '0 64 221',
    on: '255 255 255',
  },
  purple: {
    name: 'purple',
    DEFAULT: '175 82 222',
    soft: '175 82 222 / 0.18',
    strong: '142 47 189',
    on: '255 255 255',
  },
  pink: {
    name: 'pink',
    DEFAULT: '255 55 95',
    soft: '255 55 95 / 0.18',
    strong: '218 33 72',
    on: '255 255 255',
  },
  orange: {
    name: 'orange',
    DEFAULT: '255 149 0',
    soft: '255 149 0 / 0.20',
    strong: '217 119 0',
    on: '28 28 30',
  },
  green: {
    name: 'green',
    DEFAULT: '48 209 88',
    soft: '48 209 88 / 0.20',
    strong: '31 163 67',
    on: '28 28 30',
  },
  yellow: {
    name: 'yellow',
    DEFAULT: '255 214 10',
    soft: '255 214 10 / 0.22',
    strong: '206 169 0',
    on: '28 28 30',
  },
};

/**
 * The default accent. Components can read this via the CSS variable
 * `--accent` which is wired up below to track `accentTints.blue`.
 */
export const defaultAccent = 'blue';

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

/**
 * 4-pt grid spacing scale. Values are expressed in rem so they scale
 * with the root font size.
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
};

// ---------------------------------------------------------------------------
// Radii
// ---------------------------------------------------------------------------

export const radii = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '28px',
  full: '9999px',
};

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

/**
 * Elevation-aware shadow tokens. The numeric prefix roughly maps to
 * the number of points of elevation so designers can request a
 * "shadow-2" intuitively.
 */
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(var(--shadow-rgb) / 0.08)',
  sm: '0 1px 3px 0 rgb(var(--shadow-rgb) / 0.12), 0 1px 2px 0 rgb(var(--shadow-rgb) / 0.06)',
  md: '0 4px 8px -2px rgb(var(--shadow-rgb) / 0.16), 0 2px 4px -2px rgb(var(--shadow-rgb) / 0.08)',
  lg: '0 12px 24px -6px rgb(var(--shadow-rgb) / 0.20), 0 4px 8px -4px rgb(var(--shadow-rgb) / 0.10)',
  xl: '0 24px 48px -12px rgb(var(--shadow-rgb) / 0.28), 0 8px 16px -8px rgb(var(--shadow-rgb) / 0.12)',
  '2xl': '0 32px 80px -20px rgb(var(--shadow-rgb) / 0.36), 0 12px 24px -12px rgb(var(--shadow-rgb) / 0.14)',
  inner: 'inset 0 1px 2px 0 rgb(var(--shadow-rgb) / 0.10)',
  'glass-edge':
    '0 1px 0 0 rgb(255 255 255 / 0.45) inset, 0 -1px 0 0 rgb(0 0 0 / 0.05) inset, 0 8px 24px -8px rgb(var(--shadow-rgb) / 0.25)',
  'glass-edge-dark':
    '0 1px 0 0 rgb(255 255 255 / 0.08) inset, 0 -1px 0 0 rgb(0 0 0 / 0.30) inset, 0 12px 32px -10px rgb(0 0 0 / 0.55)',
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const fontFamily = {
  sans: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  display: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  mono: `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`,
};

export const fontSize = {
  xs: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
  sm: ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0' }],
  base: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
  md: ['0.9375rem', { lineHeight: '1.375rem', letterSpacing: '0' }],
  lg: ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.005em' }],
  xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
  '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// ---------------------------------------------------------------------------
// Liquid Glass
// ---------------------------------------------------------------------------

/**
 * Backdrop-filter and translucent surface values for the "Liquid Glass"
 * effect used by menus, the dock, and windows. Keep these grouped so
 * future components can opt into a specific intensity.
 */
export const glass = {
  /**
   * Subtle glass — readable on busy wallpapers without stealing focus.
   * Used for menus, popovers and tooltips.
   */
  light: {
    background: 'rgb(255 255 255 / 0.55)',
    backgroundDark: 'rgb(40 40 46 / 0.55)',
    border: 'rgb(255 255 255 / 0.50)',
    borderDark: 'rgb(255 255 255 / 0.10)',
    blur: '20px',
    saturate: '180%',
    shadow: shadows['glass-edge'],
    shadowDark: shadows['glass-edge-dark'],
    radius: radii.lg,
  },
  /**
   * Medium glass — for the dock and other always-on-top surfaces that
   * sit between content and the user.
   */
  medium: {
    background: 'rgb(255 255 255 / 0.45)',
    backgroundDark: 'rgb(36 36 40 / 0.55)',
    border: 'rgb(255 255 255 / 0.45)',
    borderDark: 'rgb(255 255 255 / 0.08)',
    blur: '28px',
    saturate: '200%',
    shadow: shadows['glass-edge'],
    shadowDark: shadows['glass-edge-dark'],
    radius: radii.xl,
  },
  /**
   * Strong glass — used for window chrome that needs to feel weighty
   * but still translucent.
   */
  strong: {
    background: 'rgb(255 255 255 / 0.65)',
    backgroundDark: 'rgb(44 44 50 / 0.65)',
    border: 'rgb(255 255 255 / 0.55)',
    borderDark: 'rgb(255 255 255 / 0.10)',
    blur: '36px',
    saturate: '220%',
    shadow: shadows['glass-edge'],
    shadowDark: shadows['glass-edge-dark'],
    radius: radii['2xl'],
  },
};

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export const duration = {
  fast: '120ms',
  base: '180ms',
  slow: '260ms',
  slower: '400ms',
};

export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ---------------------------------------------------------------------------
// Aggregated themes
// ---------------------------------------------------------------------------

/**
 * Light-mode theme object. Import this in components that need to
 * consume the full token graph in JS land.
 */
export const lightTheme = {
  mode: 'light',
  colors: lightColors,
  accent: accentTints[defaultAccent],
  accentName: defaultAccent,
  spacing,
  radii,
  shadows,
  fontFamily,
  fontSize,
  fontWeight,
  glass: glass.light,
  duration,
  easing,
};

export const darkTheme = {
  mode: 'dark',
  colors: darkColors,
  accent: accentTints[defaultAccent],
  accentName: defaultAccent,
  spacing,
  radii,
  shadows,
  fontFamily,
  fontSize,
  fontWeight,
  glass: glass.medium, // use slightly heavier blur for dark menus
  duration,
  easing,
};

export const theme = { light: lightTheme, dark: darkTheme };

export default theme;
