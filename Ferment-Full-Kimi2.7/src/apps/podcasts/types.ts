export interface Podcast {
  id: string
  title: string
  author: string
  artwork: string
  category: string
}

export interface Episode {
  id: string
  podcastId: string
  title: string
  description: string
  duration: number
  date: string
}
