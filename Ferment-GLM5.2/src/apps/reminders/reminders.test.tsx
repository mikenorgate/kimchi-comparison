import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Reminders } from './reminders'
import { useReminderStore } from '../../store/reminder-store'

function resetStore() {
  localStorage.removeItem('tahoe.reminders')
  localStorage.removeItem('tahoe.reminder-lists')
  useReminderStore.getState().reset()
}

describe('Reminders', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders the two-panel layout: sidebar and content', () => {
    render(<Reminders windowId="w1" />)
    expect(screen.getByTestId('reminders-root')).toBeInTheDocument()
    expect(screen.getByTestId('reminders-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('reminders-header')).toBeInTheDocument()
  })

  it('renders default lists in the sidebar', () => {
    render(<Reminders windowId="w1" />)
    expect(screen.getByTestId('reminders-list-today')).toHaveTextContent('Today')
    expect(screen.getByTestId('reminders-list-scheduled')).toHaveTextContent('Scheduled')
    expect(screen.getByTestId('reminders-list-all')).toHaveTextContent('All')
    expect(screen.getByTestId('reminders-list-personal')).toHaveTextContent('Personal')
    expect(screen.getByTestId('reminders-list-work')).toHaveTextContent('Work')
  })

  it('shows empty state when there are no reminders', () => {
    render(<Reminders windowId="w1" />)
    expect(screen.getByTestId('reminders-empty')).toHaveTextContent('No Reminders')
  })

  it('adds a reminder via the Add button', () => {
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('reminders-new-input'), { target: { value: 'Buy milk' } })
      fireEvent.click(screen.getByTestId('reminders-add-btn'))
    })
    expect(useReminderStore.getState().reminders).toHaveLength(1)
    expect(useReminderStore.getState().reminders[0].title).toBe('Buy milk')
  })

  it('adds a reminder via Enter key', () => {
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('reminders-new-input'), { target: { value: 'Call mom' } })
      fireEvent.keyDown(screen.getByTestId('reminders-new-input'), { key: 'Enter' })
    })
    expect(useReminderStore.getState().reminders).toHaveLength(1)
  })

  it('does not add an empty reminder', () => {
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-add-btn'))
    })
    expect(useReminderStore.getState().reminders).toHaveLength(0)
  })

  it('toggles a reminder complete via checkbox click', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Task 1')
    render(<Reminders windowId="w1" />)
    // Select the personal list to see the reminder
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    expect(useReminderStore.getState().getRemindersByList('personal')[0].completed).toBe(false)
    act(() => {
      fireEvent.click(screen.getByTestId(`reminder-check-${id}`))
    })
    expect(useReminderStore.getState().getRemindersByList('personal')[0].completed).toBe(true)
    act(() => {
      fireEvent.click(screen.getByTestId(`reminder-check-${id}`))
    })
    expect(useReminderStore.getState().getRemindersByList('personal')[0].completed).toBe(false)
  })

  it('deletes a reminder via the delete button', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Delete me')
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId(`reminder-delete-${id}`))
    })
    expect(useReminderStore.getState().reminders).toHaveLength(0)
  })

  it('renames a reminder via double-click on title', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Old title')
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    act(() => {
      fireEvent.doubleClick(screen.getByTestId(`reminder-title-${id}`))
    })
    const input = screen.getByTestId(`reminder-edit-${id}`) as HTMLInputElement
    expect(input.value).toBe('Old title')
    act(() => {
      fireEvent.change(input, { target: { value: 'New title' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    expect(useReminderStore.getState().getRemindersByList('personal')[0].title).toBe('New title')
  })

  it('shows the detail panel with date picker and notes when clicking the info button', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Task with details')
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    expect(screen.queryByTestId(`reminder-detail-panel-${id}`)).toBeNull()
    act(() => {
      fireEvent.click(screen.getByTestId(`reminder-details-${id}`))
    })
    expect(screen.getByTestId(`reminder-detail-panel-${id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`reminder-date-${id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`reminder-notes-${id}`)).toBeInTheDocument()
  })

  it('sets a due date via the date picker', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Due task')
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId(`reminder-details-${id}`))
    })
    act(() => {
      fireEvent.change(screen.getByTestId(`reminder-date-${id}`), { target: { value: '2025-12-25' } })
    })
    expect(useReminderStore.getState().getRemindersByList('personal')[0].dueDate).toBe('2025-12-25')
  })

  it('updates notes via the notes textarea', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Note task')
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId(`reminder-details-${id}`))
    })
    act(() => {
      fireEvent.change(screen.getByTestId(`reminder-notes-${id}`), { target: { value: 'Some notes here' } })
    })
    expect(useReminderStore.getState().getRemindersByList('personal')[0].notes).toBe('Some notes here')
  })

  it('shows due date label when a due date is set', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Dated', '2025-06-15')
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    expect(screen.getByTestId(`reminder-due-${id}`)).toHaveTextContent('Jun 15')
  })

  it('marks overdue reminders in red', () => {
    const id = useReminderStore.getState().addReminder('personal', 'Overdue', '2020-01-01')
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    const dueLabel = screen.getByTestId(`reminder-due-${id}`)
    expect(dueLabel.style.color).toBe('rgb(255, 69, 58)')
  })

  it('sorts incomplete reminders before completed ones', () => {
    useReminderStore.getState().addReminder('personal', 'Incomplete')
    const doneId = useReminderStore.getState().addReminder('personal', 'Completed')
    useReminderStore.getState().toggleComplete(doneId)
    render(<Reminders windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-personal'))
    })
    const rows = screen.getAllByTestId(/reminder-row-/)
    expect(rows[0]).toHaveTextContent('Incomplete')
    expect(rows[1]).toHaveTextContent('Completed')
  })

  it('shows list name as header title', () => {
    render(<Reminders windowId="w1" />)
    expect(screen.getByTestId('reminders-list-title')).toHaveTextContent('Today')
    act(() => {
      fireEvent.click(screen.getByTestId('reminders-list-work'))
    })
    expect(screen.getByTestId('reminders-list-title')).toHaveTextContent('Work')
  })

  it('persists reminders to localStorage', () => {
    useReminderStore.getState().addReminder('personal', 'Persisted task')
    const stored = JSON.parse(localStorage.getItem('tahoe.reminders')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Persisted task')
  })

  it('shows incomplete count in sidebar next to each list', () => {
    useReminderStore.getState().addReminder('personal', 'Task A')
    useReminderStore.getState().addReminder('personal', 'Task B')
    render(<Reminders windowId="w1" />)
    const personalBtn = screen.getByTestId('reminders-list-personal')
    expect(personalBtn).toHaveTextContent('Personal')
    // Count should be 2
    expect(personalBtn).toHaveTextContent('2')
  })
})
