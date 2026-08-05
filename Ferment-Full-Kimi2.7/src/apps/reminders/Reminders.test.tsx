import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Reminders } from './Reminders'

describe('Reminders', () => {
  beforeEach(() => {
    render(<Reminders />)
  })

  it('renders the reminder list', () => {
    expect(screen.getByTestId('reminders-app')).toBeInTheDocument()
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('switches between filters', async () => {
    await userEvent.click(screen.getByTestId('reminders-filter-flagged'))
    expect(screen.getByTestId('reminders-heading')).toHaveTextContent('Flagged')
    expect(screen.getByText('Review designs')).toBeInTheDocument()
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument()
  })

  it('toggles a reminder complete', async () => {
    const checkbox = screen.getAllByTestId(/^reminder-check-/)[0].closest('input') as HTMLInputElement
    const initial = checkbox.checked
    await userEvent.click(checkbox)
    expect(checkbox.checked).toBe(!initial)
  })

  it('adds a new reminder', async () => {
    const input = screen.getByTestId('reminders-input')
    await userEvent.type(input, 'Walk the dog')
    await userEvent.click(screen.getByTestId('reminders-add'))
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('deletes a reminder', async () => {
    const deleteButton = screen.getAllByTestId(/reminder-delete-/)[0]
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    await userEvent.click(deleteButton)
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument()
  })
})
