import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Contacts } from './Contacts'

describe('Contacts', () => {
  beforeEach(() => {
    render(<Contacts />)
  })

  it('renders the sidebar, list, and detail view', () => {
    expect(screen.getByTestId('contacts-app')).toBeInTheDocument()
    expect(screen.getByTestId('contacts-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('contacts-list')).toBeInTheDocument()
    expect(screen.getByTestId('contacts-detail')).toBeInTheDocument()
    expect(screen.getByTestId('contacts-detail-name')).toHaveTextContent(
      'Emma Johnson'
    )
  })

  it('selects a different contact', async () => {
    await userEvent.click(screen.getByTestId('contacts-item-c-2'))
    expect(screen.getByTestId('contacts-detail-name')).toHaveTextContent(
      'Liam Williams'
    )
  })

  it('filters contacts by group', async () => {
    await userEvent.click(screen.getByTestId('contacts-group-work'))
    expect(screen.getByTestId('contacts-item-c-2')).toBeInTheDocument()
    expect(screen.queryByTestId('contacts-item-c-1')).not.toBeInTheDocument()
  })

  it('searches contacts by name', async () => {
    await userEvent.type(screen.getByTestId('contacts-search'), 'Olivia')
    expect(screen.getByTestId('contacts-item-c-3')).toBeInTheDocument()
    expect(screen.queryByTestId('contacts-item-c-1')).not.toBeInTheDocument()
  })

  it('toggles favorite status from the detail view', async () => {
    await userEvent.click(screen.getByTestId('contacts-item-c-2'))
    expect(screen.getByTestId('contacts-favorite-button')).toHaveTextContent(
      'Favorite'
    )
    await userEvent.click(screen.getByTestId('contacts-favorite-button'))
    expect(screen.getByTestId('contacts-favorite-button')).toHaveTextContent(
      'Favorited'
    )
    await userEvent.click(screen.getByTestId('contacts-favorite-button'))
    expect(screen.getByTestId('contacts-favorite-button')).toHaveTextContent(
      'Favorite'
    )
  })

  it('adds a new contact through the form', async () => {
    await userEvent.click(screen.getByTestId('contacts-add-button'))
    expect(screen.getByTestId('contacts-add-form')).toBeInTheDocument()

    await userEvent.type(screen.getByTestId('contacts-input-first'), 'Zoe')
    await userEvent.type(screen.getByTestId('contacts-input-last'), 'Test')
    await userEvent.type(
      screen.getByTestId('contacts-input-email'),
      'zoe@example.com'
    )
    await userEvent.type(screen.getByTestId('contacts-input-phone'), '555-0100')

    await userEvent.click(screen.getByTestId('contacts-save-button'))

    expect(screen.getByTestId('contacts-detail')).toBeInTheDocument()
    expect(screen.getByTestId('contacts-detail-name')).toHaveTextContent(
      'Zoe Test'
    )
    expect(screen.getByTestId('contacts-detail-email')).toHaveTextContent(
      'zoe@example.com'
    )
  })
})
