export function Wallpaper() {
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        background: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 35%),
          linear-gradient(135deg, #6fa8dc 0%, #4a86c7 40%, #8e7cc3 100%)
        `,
      }}
    />
  )
}
