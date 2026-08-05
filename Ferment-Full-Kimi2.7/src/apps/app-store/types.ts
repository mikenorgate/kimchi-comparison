export type AppCategory =
  | 'All'
  | 'Productivity'
  | 'Games'
  | 'Social'
  | 'Utilities'
  | 'Creativity'

export interface AppItem {
  id: string
  name: string
  developer: string
  category: Exclude<AppCategory, 'All'>
  rating: number
  reviews: number
  price: string
  description: string
  color: string
}
