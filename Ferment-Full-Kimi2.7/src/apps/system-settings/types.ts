export type SettingKind = 'toggle' | 'checkbox' | 'button' | 'info'

export interface Setting {
  id: string
  label: string
  kind: SettingKind
  value?: boolean
  description?: string
}

export interface SettingCategory {
  id: string
  name: string
  icon: string
  settings: Setting[]
}
