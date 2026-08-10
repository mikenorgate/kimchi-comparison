import { useTheme } from '../../theme'

export function Wallpaper() {
  const { mode } = useTheme()

  const gradient =
    mode === 'dark'
      ? 'radial-gradient(circle at 30% 30%, #1a3a5f 0%, #0a1525 45%, #000000 100%)'
      : 'radial-gradient(circle at 30% 30%, #bfe3f3 0%, #d7e9f7 40%, #f0d9e6 100%)'

  return (
    <div
      className="absolute inset-0 -z-10 transition-all duration-700"
      style={{
        background: gradient,
      }}
    />
  )
}
