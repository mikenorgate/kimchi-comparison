import type { Email, MailFolder } from './types'

export const folders: { id: MailFolder; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'sent', label: 'Sent' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'trash', label: 'Trash' },
]

export const sampleEmails: Email[] = [
  {
    id: 'em-1',
    sender: 'Apple',
    subject: 'Welcome to your new Mac',
    preview: 'Set up your Mac and explore macOS Tahoe.',
    body: 'Welcome!\n\nYour new Mac is ready. Set up your Mac and explore everything macOS Tahoe has to offer.',
    date: 'Today, 9:41 AM',
    read: false,
    flagged: true,
    folder: 'inbox',
  },
  {
    id: 'em-2',
    sender: 'Tim Cook',
    subject: 'Tahoe launch event',
    preview: 'Join us for the special event next week.',
    body: 'Hi team,\n\nJoin us for the Tahoe launch event next week. We have exciting updates to share.',
    date: 'Today, 8:15 AM',
    read: true,
    flagged: false,
    folder: 'inbox',
  },
  {
    id: 'em-3',
    sender: 'me',
    subject: 'Project notes',
    preview: 'Draft of the project notes.',
    body: 'Here is the draft of the project notes. Let me know if you have any feedback.',
    date: 'Yesterday',
    read: true,
    flagged: false,
    folder: 'sent',
  },
  {
    id: 'em-4',
    sender: 'me',
    subject: 'Meeting follow-up',
    preview: 'Draft follow-up email.',
    body: 'Draft follow-up email after the meeting.',
    date: 'Yesterday',
    read: false,
    flagged: false,
    folder: 'drafts',
  },
]
