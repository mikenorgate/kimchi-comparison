export interface Movie {
  id: string
  title: string
  genre: string
  duration: string
  description: string
  gradient: string
  featured?: boolean
}

export interface Category {
  id: string
  name: string
  movieIds: string[]
}
