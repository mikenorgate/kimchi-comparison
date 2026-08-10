export interface Note { id: string; title: string; body: string; updated: string }
export const INITIAL_NOTES: Note[] = [
  { id: 'n1', title: 'Welcome to Notes', body: 'This is a quick note.\n\nYou can edit this text — it stays for your session.', updated: 'Today 9:41 AM' },
  { id: 'n2', title: 'Grocery List', body: '- Milk\n- Eggs\n- Coffee\n- Bread', updated: 'Yesterday' },
  { id: 'n3', title: 'Meeting Notes', body: 'Q3 planning:\n- Ship the new shell\n- Review design tokens\n- Follow up with QA', updated: 'Mon' },
  { id: 'n4', title: 'Ideas', body: 'A Tahoe-style web desktop that feels alive.', updated: 'Last week' },
]
