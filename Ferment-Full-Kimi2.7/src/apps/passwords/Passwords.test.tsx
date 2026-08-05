import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Passwords } from './Passwords'

describe('Passwords', () => {
  beforeEach(() => {
    render(<Passwords />)
  })

  it('renders the app with credential list and detail', () => {
    expect(screen.getByTestId('passwords-app')).toBeInTheDocument()
    expect(screen.getByTestId('passwords-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('passwords-detail')).toBeInTheDocument()
    expect(screen.getByTestId('password-item-cred-1')).toBeInTheDocument()
  })

  it('selects a different credential and updates the detail view', async () => {
    await userEvent.click(screen.getByTestId('password-item-cred-3'))
    expect(screen.getByTestId('passwords-detail-title')).toHaveTextContent(
      'GitHub'
    )
    expect(screen.getByTestId('passwords-password-value')).toHaveTextContent(
      /•+/
    )
  })

  it('reveals and hides the password', async () => {
    const revealButton = screen.getByTestId('passwords-reveal')
    expect(revealButton).toHaveAttribute('aria-label', 'Reveal password')

    await userEvent.click(revealButton)
    expect(screen.getByTestId('passwords-password-value')).toHaveTextContent(
      'Tahoe2026!Secure'
    )
    expect(revealButton).toHaveAttribute('aria-label', 'Hide password')

    await userEvent.click(revealButton)
    expect(screen.getByTestId('passwords-password-value')).toHaveTextContent(
      /•+/
    )
  })

  it('filters credentials by search term', async () => {
    const search = screen.getByTestId('passwords-search')
    await userEvent.type(search, 'github')

    expect(screen.getByTestId('password-item-cred-3')).toBeInTheDocument()
    expect(screen.queryByTestId('password-item-cred-1')).not.toBeInTheDocument()
  })

  it('filters credentials by category', async () => {
    const categorySelect = screen.getByTestId('passwords-category')
    await userEvent.selectOptions(categorySelect, 'Finance')

    expect(screen.getByTestId('password-item-cred-4')).toBeInTheDocument()
    expect(screen.queryByTestId('password-item-cred-2')).not.toBeInTheDocument()
  })
})
