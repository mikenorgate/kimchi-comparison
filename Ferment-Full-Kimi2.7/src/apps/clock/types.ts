export interface WorldClock {
  id: string
  city: string
  timezone: string
}

export interface Alarm {
  id: string
  label: string
  time: string
  enabled: boolean
}
