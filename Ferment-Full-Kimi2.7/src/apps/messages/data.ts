import type { Conversation } from './types'

export const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Alice',
    avatarInitial: 'A',
    unread: true,
    messages: [
      { id: 'm-1', sender: 'them', text: 'Hey, are we still on for lunch?', timestamp: '10:30 AM' },
      { id: 'm-2', sender: 'me', text: 'Yes, see you at noon!', timestamp: '10:32 AM' },
    ],
  },
  {
    id: 'conv-2',
    name: 'Bob',
    avatarInitial: 'B',
    unread: false,
    messages: [
      { id: 'm-3', sender: 'them', text: 'Can you send me the report?', timestamp: 'Yesterday' },
    ],
  },
  {
    id: 'conv-3',
    name: 'Team Chat',
    avatarInitial: 'T',
    unread: false,
    messages: [
      { id: 'm-4', sender: 'them', text: 'Great work on the demo today.', timestamp: 'Yesterday' },
      { id: 'm-5', sender: 'me', text: 'Thanks everyone!', timestamp: 'Yesterday' },
    ],
  },
]
