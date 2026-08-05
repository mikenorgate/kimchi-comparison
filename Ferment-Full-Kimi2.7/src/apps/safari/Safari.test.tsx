import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Safari } from './Safari'
import { clearRegistry, registerApp } from '../registry'
import { Globe } from 'lucide-react'

describe('Safari', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'safari', name: 'Safari', icon: Globe, component: Safari, defaultSize: { width: 1024, height: 700 } })
  })

  it('renders toolbar with navigation and address bar', () => {
    render(<Safari />)
    expect(screen.getByLabelText('Back')).toBeInTheDocument()
    expect(screen.getByLabelText('Forward')).toBeInTheDocument()
    expect(screen.getByLabelText('Address and search')).toBeInTheDocument()
  })

  it('renders a tab bar with the start page tab', () => {
    render(<Safari />)
    expect(screen.getByText('Start Page')).toBeInTheDocument()
  })

  it('navigates to a mocked page when entering a URL', async () => {
    render(<Safari />)
    const address = screen.getByLabelText('Address and search')
    await userEvent.clear(address)
    await userEvent.type(address, 'https://example.com')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('safari-page')).toHaveTextContent('Example Domain')
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('adds and switches tabs', async () => {
    render(<Safari />)
    await userEvent.click(screen.getByLabelText('New tab'))
    expect(screen.getAllByText('Start Page').length).toBe(2)
    const address = screen.getByLabelText('Address and search')
    await userEvent.clear(address)
    await userEvent.type(address, 'https://news.example')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('safari-page')).toHaveTextContent('Tahoe News')
  })

  it('closes a tab when clicking its close control', async () => {
    render(<Safari />)
    await userEvent.click(screen.getByLabelText('New tab'))
    expect(screen.getAllByText('Start Page').length).toBe(2)
    await userEvent.click(screen.getAllByTestId('tab-close')[0])
    expect(screen.getAllByText('Start Page').length).toBe(1)
  })

  it('navigates back and forward through mocked history', async () => {
    render(<Safari />)
    const address = screen.getByLabelText('Address and search')
    await userEvent.clear(address)
    await userEvent.type(address, 'https://example.com')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('safari-page')).toHaveTextContent('Example Domain')

    await userEvent.clear(address)
    await userEvent.type(address, 'https://news.example')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('safari-page')).toHaveTextContent('Tahoe News')

    await userEvent.click(screen.getByLabelText('Back'))
    expect(screen.getByTestId('safari-page')).toHaveTextContent('Example Domain')

    await userEvent.click(screen.getByLabelText('Forward'))
    expect(screen.getByTestId('safari-page')).toHaveTextContent('Tahoe News')
  })
})
