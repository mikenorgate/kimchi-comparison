export function Wallpaper() {
  return (
    <div
      data-testid="wallpaper"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-wallpaper)',
        background: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(0,0,0,0.15) 0%, transparent 40%),
          linear-gradient(135deg, var(--color-wallpaper-start) 0%, var(--color-wallpaper-end) 100%)
        `,
      }}
    />
  )
}

export default Wallpaper
