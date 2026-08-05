export type PasswordCategory = 'All' | 'Social' | 'Work' | 'Finance' | 'Shopping' | 'Other'

export interface Credential {
  id: string
  title: string
  username: string
  password: string
  category: Exclude<PasswordCategory, 'All'>
  url?: string
}
