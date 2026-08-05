import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Mail,
  Phone,
  User,
  Star,
  Users,
  Briefcase,
  Heart,
} from 'lucide-react'
import type { Contact } from './types'
import { contacts as initialContacts, groups } from './data'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

function GroupIcon({ groupId }: { groupId: string }) {
  switch (groupId) {
    case 'favorites':
      return <Heart className="w-4 h-4" />
    case 'work':
      return <Briefcase className="w-4 h-4" />
    case 'family':
      return <Users className="w-4 h-4" />
    default:
      return <User className="w-4 h-4" />
  }
}

function randomColor() {
  const colors = [
    'from-tahoe-pink to-rose-400',
    'from-tahoe-accent to-sky-400',
    'from-tahoe-purple to-violet-400',
    'from-tahoe-green to-emerald-400',
    'from-tahoe-orange to-amber-400',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function Contacts() {
  const [contactsList, setContactsList] = useState<Contact[]>(initialContacts)
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0].id)
  const [selectedContactId, setSelectedContactId] = useState<string>(
    initialContacts[0]?.id ?? ''
  )
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    groupId: 'all',
  })

  const filteredContacts = useMemo(() => {
    return contactsList
      .filter((contact) => {
        if (selectedGroupId === 'all') return true
        if (selectedGroupId === 'favorites')
          return contact.groupId === 'favorites'
        return contact.groupId === selectedGroupId
      })
      .filter((contact) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase()
        const query = search.toLowerCase()
        return (
          query === '' ||
          fullName.includes(query) ||
          contact.email.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
  }, [contactsList, selectedGroupId, search])

  const selectedContact = useMemo(
    () => contactsList.find((c) => c.id === selectedContactId) ?? null,
    [contactsList, selectedContactId]
  )

  const handleAddContact = () => {
    const firstName = newContact.firstName.trim()
    const lastName = newContact.lastName.trim()
    if (!firstName || !lastName) return

    const contact: Contact = {
      id: generateId(),
      firstName,
      lastName,
      email: newContact.email.trim() || `${firstName.toLowerCase()}@example.com`,
      phone: newContact.phone.trim() || '+1 (555) 000-0000',
      groupId: newContact.groupId,
      initials: initials(firstName, lastName),
      color: randomColor(),
    }

    setContactsList((prev) => [...prev, contact])
    setSelectedContactId(contact.id)
    setSelectedGroupId(contact.groupId === 'favorites' ? 'favorites' : 'all')
    setIsAdding(false)
    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      groupId: 'all',
    })
  }

  const toggleFavorite = (id: string) => {
    setContactsList((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, groupId: c.groupId === 'favorites' ? 'all' : 'favorites' }
          : c
      )
    )
  }

  const groupName =
    groups.find((g) => g.id === selectedGroupId)?.name ?? 'Contacts'

  return (
    <div
      className="flex h-full w-full overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="contacts-app"
    >
      {/* Sidebar groups */}
      <div
        className="w-44 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3"
        data-testid="contacts-sidebar"
      >
        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
          Groups
        </h2>
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
              selectedGroupId === group.id
                ? 'bg-tahoe-accent/20 text-tahoe-text'
                : 'text-tahoe-text-secondary hover:bg-white/5'
            }`}
            data-testid={`contacts-group-${group.id}`}
          >
            <GroupIcon groupId={group.id} />
            {group.name}
          </button>
        ))}
      </div>

      {/* Contact list */}
      <div className="flex w-56 flex-shrink-0 flex-col border-r border-tahoe-glass-border bg-tahoe-window/70">
        <div className="flex h-12 items-center justify-between border-b border-tahoe-glass-border px-3">
          <span className="font-medium" data-testid="contacts-list-heading">
            {groupName}
          </span>
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-md p-1.5 hover:bg-white/10"
            aria-label="Add contact"
            data-testid="contacts-add-button"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="p-2">
          <div className="flex items-center gap-2 rounded-full bg-tahoe-glass/50 px-3 py-1.5">
            <Search className="h-4 w-4 text-tahoe-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm outline-none placeholder:text-tahoe-text-secondary"
              data-testid="contacts-search"
            />
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto p-2"
          data-testid="contacts-list"
        >
          {filteredContacts.length === 0 ? (
            <div
              className="p-4 text-center text-sm text-tahoe-text-secondary"
              data-testid="contacts-empty"
            >
              No contacts
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedContactId(contact.id)
                  setIsAdding(false)
                }}
                className={`flex w-full items-center gap-3 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                  selectedContactId === contact.id
                    ? 'bg-tahoe-accent/20 text-tahoe-text'
                    : 'hover:bg-white/5'
                }`}
                data-testid={`contacts-item-${contact.id}`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${contact.color} text-xs font-semibold text-white`}
                >
                  {contact.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {contact.firstName} {contact.lastName}
                  </div>
                  <div className="truncate text-xs text-tahoe-text-secondary">
                    {contact.email}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail / Add form */}
      <div className="flex flex-1 flex-col bg-tahoe-window/80">
        {isAdding ? (
          <div
            className="flex flex-1 flex-col p-6"
            data-testid="contacts-add-form"
          >
            <h2 className="mb-4 text-xl font-semibold">New Contact</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-tahoe-text-secondary">
                  First Name
                </label>
                <input
                  value={newContact.firstName}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full rounded-tahoe-xs bg-tahoe-glass/50 px-3 py-2 text-sm outline-none"
                  data-testid="contacts-input-first"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-tahoe-text-secondary">
                  Last Name
                </label>
                <input
                  value={newContact.lastName}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full rounded-tahoe-xs bg-tahoe-glass/50 px-3 py-2 text-sm outline-none"
                  data-testid="contacts-input-last"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-tahoe-text-secondary">
                  Email
                </label>
                <input
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-tahoe-xs bg-tahoe-glass/50 px-3 py-2 text-sm outline-none"
                  data-testid="contacts-input-email"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-tahoe-text-secondary">
                  Phone
                </label>
                <input
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-tahoe-xs bg-tahoe-glass/50 px-3 py-2 text-sm outline-none"
                  data-testid="contacts-input-phone"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-tahoe-text-secondary">
                  Group
                </label>
                <select
                  value={newContact.groupId}
                  onChange={(e) =>
                    setNewContact((prev) => ({ ...prev, groupId: e.target.value }))
                  }
                  className="w-full rounded-tahoe-xs bg-tahoe-glass/50 px-3 py-2 text-sm outline-none"
                  data-testid="contacts-input-group"
                >
                  {groups
                    .filter((g) => g.id !== 'all')
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <button
                onClick={handleAddContact}
                className="flex-1 rounded-tahoe-sm bg-tahoe-accent py-2 text-sm font-semibold text-white hover:bg-tahoe-accent-hover"
                data-testid="contacts-save-button"
              >
                Save
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="rounded-tahoe-sm px-4 py-2 text-sm hover:bg-white/10"
                data-testid="contacts-cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedContact ? (
          <div
            className="flex flex-1 flex-col items-center p-6"
            data-testid="contacts-detail"
          >
            <div
              className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${selectedContact.color} text-2xl font-semibold text-white shadow-sm`}
              data-testid="contacts-detail-avatar"
            >
              {selectedContact.initials}
            </div>
            <h2
              className="text-2xl font-semibold"
              data-testid="contacts-detail-name"
            >
              {selectedContact.firstName} {selectedContact.lastName}
            </h2>
            <p
              className="text-sm text-tahoe-text-secondary"
              data-testid="contacts-detail-group"
            >
              {groups.find((g) => g.id === selectedContact.groupId)?.name}
            </p>

            <div className="mt-6 flex w-full max-w-sm gap-3">
              <button
                onClick={() => toggleFavorite(selectedContact.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-tahoe-sm py-2 text-sm font-medium transition-colors ${
                  selectedContact.groupId === 'favorites'
                    ? 'bg-tahoe-yellow/20 text-tahoe-yellow'
                    : 'bg-tahoe-glass/50 hover:bg-tahoe-glass-strong/50'
                }`}
                data-testid="contacts-favorite-button"
              >
                <Star
                  className={`h-4 w-4 ${
                    selectedContact.groupId === 'favorites' ? 'fill-current' : ''
                  }`}
                />
                {selectedContact.groupId === 'favorites'
                  ? 'Favorited'
                  : 'Favorite'}
              </button>
            </div>

            <div className="mt-6 w-full max-w-sm space-y-3">
              <div
                className="flex items-center gap-3 rounded-tahoe-sm bg-tahoe-glass/50 p-3"
                data-testid="contacts-detail-email"
              >
                <Mail className="h-5 w-5 text-tahoe-text-secondary" />
                <div className="text-sm">{selectedContact.email}</div>
              </div>
              <div
                className="flex items-center gap-3 rounded-tahoe-sm bg-tahoe-glass/50 p-3"
                data-testid="contacts-detail-phone"
              >
                <Phone className="h-5 w-5 text-tahoe-text-secondary" />
                <div className="text-sm">{selectedContact.phone}</div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-1 items-center justify-center text-sm text-tahoe-text-secondary"
            data-testid="contacts-empty-detail"
          >
            Select a contact to view details
          </div>
        )}
      </div>
    </div>
  )
}
