export interface BookCollection {
  id: string
  name: string
}

export interface Book {
  id: string
  title: string
  author: string
  collectionId: string
  cover: string
  description: string
  totalPages: number
}
