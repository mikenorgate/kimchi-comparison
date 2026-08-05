import type { Contact, ContactGroup } from './types'

export const groups: ContactGroup[] = [
  { id: 'all', name: 'All Contacts' },
  { id: 'favorites', name: 'Favorites' },
  { id: 'work', name: 'Work' },
  { id: 'family', name: 'Family' },
]

export const contacts: Contact[] = [
  {
    id: 'c-1',
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.j@example.com',
    phone: '+1 (555) 123-4567',
    groupId: 'favorites',
    initials: 'EJ',
    color: 'from-tahoe-pink to-rose-400',
  },
  {
    id: 'c-2',
    firstName: 'Liam',
    lastName: 'Williams',
    email: 'liam.w@example.com',
    phone: '+1 (555) 987-6543',
    groupId: 'work',
    initials: 'LW',
    color: 'from-tahoe-accent to-sky-400',
  },
  {
    id: 'c-3',
    firstName: 'Olivia',
    lastName: 'Brown',
    email: 'olivia.b@example.com',
    phone: '+1 (555) 246-8135',
    groupId: 'family',
    initials: 'OB',
    color: 'from-tahoe-purple to-violet-400',
  },
  {
    id: 'c-4',
    firstName: 'Noah',
    lastName: 'Davis',
    email: 'noah.d@example.com',
    phone: '+1 (555) 135-7924',
    groupId: 'work',
    initials: 'ND',
    color: 'from-tahoe-green to-emerald-400',
  },
  {
    id: 'c-5',
    firstName: 'Ava',
    lastName: 'Miller',
    email: 'ava.m@example.com',
    phone: '+1 (555) 864-2097',
    groupId: 'favorites',
    initials: 'AM',
    color: 'from-tahoe-orange to-amber-400',
  },
]
