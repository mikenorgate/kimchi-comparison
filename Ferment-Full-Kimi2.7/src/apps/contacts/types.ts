export interface ContactGroup {
  id: string
  name: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  groupId: string
  initials: string
  color: string
}
