export interface Message {
  id: string
  sender: 'me' | 'them'
  text: string
  timestamp: string
}

export interface Conversation {
  id: string
  name: string
  avatarInitial: string
  messages: Message[]
  unread: boolean
}
