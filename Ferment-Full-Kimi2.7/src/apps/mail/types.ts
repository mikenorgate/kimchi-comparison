export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'trash'

export interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  body: string
  date: string
  read: boolean
  flagged: boolean
  folder: MailFolder
}
