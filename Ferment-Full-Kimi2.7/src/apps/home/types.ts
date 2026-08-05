export interface Room {
  id: string
  name: string
  icon: 'living' | 'bed' | 'kitchen' | 'office'
}

export type AccessoryType = 'light' | 'lock' | 'thermostat' | 'switch' | 'sensor'

export interface Accessory {
  id: string
  roomId: string
  name: string
  type: AccessoryType
  isOn: boolean
  value?: number
  unit?: string
}
