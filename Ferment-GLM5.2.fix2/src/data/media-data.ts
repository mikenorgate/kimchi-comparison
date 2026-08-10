export interface Track { id: string; title: string; artist: string; duration: string }
export const PLAYLIST: Track[] = [
  { id: 'tr1', title: 'Midnight City', artist: 'Aurora Synth', duration: '3:42' },
  { id: 'tr2', title: 'Glass Horizons', artist: 'The Liquid Collective', duration: '4:15' },
  { id: 'tr3', title: 'Tahoe Dreams', artist: 'Sierra Sounds', duration: '3:28' },
  { id: 'tr4', title: 'Transparent Sky', artist: 'Aurora Synth', duration: '5:01' },
  { id: 'tr5', title: 'Reflections', artist: 'Mira Vale', duration: '3:55' },
  { id: 'tr6', title: 'Cascade', artist: 'The Liquid Collective', duration: '4:30' },
  { id: 'tr7', title: 'Crystalline', artist: 'Sierra Sounds', duration: '3:12' },
  { id: 'tr8', title: 'Shimmer', artist: 'Mira Vale', duration: '4:48' },
]

export interface Photo { id: string; label: string; gradient: string }
export const PHOTOS: Photo[] = [
  { id: 'p1', label: 'Sunset', gradient: 'linear-gradient(135deg, #ff9f0a, #ff453a, #bf5af2)' },
  { id: 'p2', label: 'Ocean', gradient: 'linear-gradient(135deg, #0a84ff, #30d158)' },
  { id: 'p3', label: 'Forest', gradient: 'linear-gradient(135deg, #30d158, #1d6e4a)' },
  { id: 'p4', label: 'Desert', gradient: 'linear-gradient(135deg, #ff9f0a, #ffD700)' },
  { id: 'p5', label: 'Mountain', gradient: 'linear-gradient(135deg, #8e8e93, #48484a)' },
  { id: 'p6', label: 'Aurora', gradient: 'linear-gradient(135deg, #bf5af2, #0a84ff, #30d158)' },
  { id: 'p7', label: 'Lavender', gradient: 'linear-gradient(135deg, #bf5af2, #ff375f)' },
  { id: 'p8', label: 'Meadow', gradient: 'linear-gradient(135deg, #30d158, #ff9f0a)' },
  { id: 'p9', label: 'Glacier', gradient: 'linear-gradient(135deg, #0a84ff, #8e8e93)' },
  { id: 'p10', label: 'Canyon', gradient: 'linear-gradient(135deg, #ff453a, #ff9f0a, #8e8e93)' },
  { id: 'p11', label: 'Tide', gradient: 'linear-gradient(135deg, #0a84ff, #bf5af2)' },
  { id: 'p12', label: 'Dawn', gradient: 'linear-gradient(135deg, #ff375f, #ff9f0a, #ffD700)' },
]

export interface WorldClock { city: string; offset: number }
export const WORLD_CLOCKS: WorldClock[] = [
  { city: 'Cupertino', offset: 0 },
  { city: 'New York', offset: 3 },
  { city: 'London', offset: 8 },
  { city: 'Tokyo', offset: 17 },
  { city: 'Sydney', offset: 18 },
]
