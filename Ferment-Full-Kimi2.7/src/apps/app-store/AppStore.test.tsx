import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { AppStore } from './AppStore'

describe('AppStore', () => {
  beforeEach(() => {
    render(<AppStore />)
  })

  it('renders the storefront with hero and grid', () => {
    expect(screen.getByTestId('app-store-app')).toBeInTheDocument()
    expect(screen.getByTestId('app-store-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('app-store-hero')).toBeInTheDocument()
    expect(screen.getByTestId('app-store-grid')).toBeInTheDocument()
    expect(screen.getByTestId('app-store-item-featured-1')).toBeInTheDocument()
  })

  it('filters apps by category', async () => {
    await userEvent.click(screen.getByTestId('app-store-category-games'))
    expect(screen.getByTestId('app-store-grid-title')).toHaveTextContent('Games')
    expect(screen.getByTestId('app-store-item-app-4')).toBeInTheDocument()
    expect(screen.queryByTestId('app-store-item-app-1')).not.toBeInTheDocument()
  })

  it('searches apps by name', async () => {
    await userEvent.type(screen.getByTestId('app-store-search'), 'Cloud Drive')
    expect(screen.getByTestId('app-store-item-app-2')).toBeInTheDocument()
    expect(screen.queryByTestId('app-store-item-app-1')).not.toBeInTheDocument()
  })

  it('opens and closes an app detail modal', async () => {
    await userEvent.click(screen.getByTestId('app-store-item-app-4'))
    expect(screen.getByTestId('app-store-modal')).toBeInTheDocument()
    expect(screen.getByTestId('app-store-modal-get')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('app-store-modal-close'))
    expect(screen.queryByTestId('app-store-modal')).not.toBeInTheDocument()
  })

  it('opens the hero app detail from the call-to-action', async () => {
    await userEvent.click(screen.getByTestId('app-store-hero-cta'))
    expect(screen.getByTestId('app-store-modal')).toBeInTheDocument()
    expect(screen.getByTestId('app-store-modal-get')).toBeInTheDocument()
    expect(screen.getByTestId('app-store-modal-title')).toHaveTextContent(
      'Focus Flow'
    )
  })
})
