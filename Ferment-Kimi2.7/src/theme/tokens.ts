export type ThemeMode = 'light' | 'dark'

export const tahoeColors = {
  // Apple-style palette
  blue: '#007AFF',
  red: '#FF3B30',
  green: '#34C759',
  yellow: '#FFCC00',
  orange: '#FF9500',
  purple: '#AF52DE',
  pink: '#FF2D55',
  teal: '#5AC8FA',
  indigo: '#5856D6',
  gray: '#8E8E93',

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  offWhite: '#F5F5F7',
  lightGray: '#E5E5EA',
  midGray: '#C7C7CC',
  darkGray: '#636366',
  darkerGray: '#3A3A3C',
  charcoal: '#1C1C1E',

  // Tahoe-specific surfaces
  wallpaperLight: '#B8D9E8',
  wallpaperDark: '#0A1A2E',

  glassLight: 'rgba(255, 255, 255, 0.45)',
  glassLightHover: 'rgba(255, 255, 255, 0.55)',
  glassLightBorder: 'rgba(255, 255, 255, 0.4)',
  glassLightHighlight: 'rgba(255, 255, 255, 0.7)',

  glassDark: 'rgba(40, 40, 40, 0.55)',
  glassDarkHover: 'rgba(60, 60, 60, 0.65)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.12)',
  glassDarkHighlight: 'rgba(255, 255, 255, 0.15)',

  textLight: '#1D1D1F',
  textLightSecondary: 'rgba(60, 60, 67, 0.72)',
  textDark: '#F5F5F7',
  textDarkSecondary: 'rgba(235, 235, 245, 0.72)',

  menuBarLight: 'rgba(255, 255, 255, 0.28)',
  menuBarDark: 'rgba(0, 0, 0, 0.28)',
}

export const tahoeShadows = {
  window: '0 22px 44px rgba(0, 0, 0, 0.24), 0 0 0 0.5px rgba(0, 0, 0, 0.08)',
  windowDark: '0 22px 44px rgba(0, 0, 0, 0.55), 0 0 0 0.5px rgba(255, 255, 255, 0.08)',
  dock: '0 10px 30px rgba(0, 0, 0, 0.18)',
  popover: '0 12px 32px rgba(0, 0, 0, 0.18)',
  button: '0 2px 6px rgba(0, 0, 0, 0.1)',
  inset: 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
}

export const tahoeRadii = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  xxl: '22px',
  full: '9999px',
  dock: '24px',
  window: '12px',
}

export const tahoeSpacing = {
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
}

export const tahoeTransitions = {
  fast: '120ms ease-out',
  base: '200ms ease-out',
  slow: '300ms ease-out',
  spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
}

export const tahoeTypography = {
  fontStack: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  sizes: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '15px',
    xl: '17px',
    xxl: '22px',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: '1.2',
    normal: '1.35',
    relaxed: '1.5',
  },
}

export function getThemeTokens(mode: ThemeMode = 'light') {
  const isDark = mode === 'dark'

  return {
    mode,
    colors: {
      accent: tahoeColors.blue,
      accentRed: tahoeColors.red,
      accentGreen: tahoeColors.green,
      accentYellow: tahoeColors.yellow,
      accentOrange: tahoeColors.orange,
      accentPurple: tahoeColors.purple,
      accentPink: tahoeColors.pink,

      bg: isDark ? tahoeColors.black : tahoeColors.offWhite,
      wallpaper: isDark ? tahoeColors.wallpaperDark : tahoeColors.wallpaperLight,

      glass: isDark ? tahoeColors.glassDark : tahoeColors.glassLight,
      glassHover: isDark ? tahoeColors.glassDarkHover : tahoeColors.glassLightHover,
      glassBorder: isDark ? tahoeColors.glassDarkBorder : tahoeColors.glassLightBorder,
      glassHighlight: isDark ? tahoeColors.glassDarkHighlight : tahoeColors.glassLightHighlight,
      menuBar: isDark ? tahoeColors.menuBarDark : tahoeColors.menuBarLight,

      text: isDark ? tahoeColors.textDark : tahoeColors.textLight,
      textSecondary: isDark ? tahoeColors.textDarkSecondary : tahoeColors.textLightSecondary,
      textInverse: isDark ? tahoeColors.textLight : tahoeColors.textDark,

      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      shadow: isDark ? tahoeColors.black : tahoeColors.black,
    },
    shadows: {
      window: isDark ? tahoeShadows.windowDark : tahoeShadows.window,
      dock: tahoeShadows.dock,
      popover: tahoeShadows.popover,
      button: tahoeShadows.button,
      inset: tahoeShadows.inset,
    },
    radii: tahoeRadii,
    spacing: tahoeSpacing,
    transitions: tahoeTransitions,
    typography: tahoeTypography,
    backdropBlur: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '36px',
    },
  }
}

export type TahoeTokens = ReturnType<typeof getThemeTokens>
