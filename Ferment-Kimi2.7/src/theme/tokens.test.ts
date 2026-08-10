import { describe, expect, it } from 'vitest'
import { getThemeTokens, tahoeColors, tahoeShadows } from './tokens'

describe('getThemeTokens', () => {
  it('returns light palette by default', () => {
    const tokens = getThemeTokens('light')
    expect(tokens.colors.bg).toBe(tahoeColors.offWhite)
    expect(tokens.colors.wallpaper).toBe(tahoeColors.wallpaperLight)
    expect(tokens.colors.glass).toBe(tahoeColors.glassLight)
    expect(tokens.colors.text).toBe(tahoeColors.textLight)
  })

  it('returns dark palette when mode is dark', () => {
    const tokens = getThemeTokens('dark')
    expect(tokens.colors.bg).toBe(tahoeColors.black)
    expect(tokens.colors.wallpaper).toBe(tahoeColors.wallpaperDark)
    expect(tokens.colors.glass).toBe(tahoeColors.glassDark)
    expect(tokens.colors.text).toBe(tahoeColors.textDark)
  })

  it('includes shared structural tokens', () => {
    const tokens = getThemeTokens('light')
    expect(tokens.radii.window).toBe('12px')
    expect(tokens.spacing.md).toBe('12px')
    expect(tokens.shadows.dock).toBe(tahoeShadows.dock)
    expect(tokens.typography.fontStack).toContain('SF Pro Text')
  })
})
