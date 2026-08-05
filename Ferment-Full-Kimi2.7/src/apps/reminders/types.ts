export interface Reminder {
  id: string
  title: string
  completed: boolean
  list: 'Today' | 'Scheduled' | 'All' | 'Flagged'
  flagged?: boolean
}
