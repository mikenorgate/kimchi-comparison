import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Finder } from './Finder'
import { clearRegistry, registerApp } from '../registry'
import { Folder } from 'lucide-react'

describe('Finder', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: Finder, defaultSize: { width: 820, height: 520 } })
  })

  it('renders sidebar favorites and locations', () => {
    render(<Finder />)
    const sidebar = screen.getByTestId('finder-sidebar')
    expect(within(sidebar).getByText('Favorites')).toBeInTheDocument()
    expect(within(sidebar).getByText('Locations')).toBeInTheDocument()
    expect(within(sidebar).getByText('Macintosh HD')).toBeInTheDocument()
  })

  it('displays home folder contents by default', () => {
    render(<Finder />)
    const content = screen.getByTestId('finder-content')
    expect(within(content).getByText('Documents')).toBeInTheDocument()
    expect(within(content).getByText('Downloads')).toBeInTheDocument()
    expect(within(content).getByText('Pictures')).toBeInTheDocument()
  })

  it('navigates into a folder on double click', async () => {
    render(<Finder />)
    const content = screen.getByTestId('finder-content')
    await userEvent.dblClick(within(content).getByText('Documents'))
    expect(within(content).getByText('Resume.pdf')).toBeInTheDocument()
    expect(within(content).getByText('Budget.xlsx')).toBeInTheDocument()
  })

  it('navigates using breadcrumb', async () => {
    render(<Finder />)
    const content = screen.getByTestId('finder-content')
    await userEvent.dblClick(within(content).getByText('Documents'))
    await userEvent.click(screen.getByText('mike'))
    expect(within(content).getByText('Documents')).toBeInTheDocument()
  })

  it('switches between icon and list views', async () => {
    render(<Finder />)
    await userEvent.click(screen.getByRole('button', { name: 'List view' }))
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Icon view' }))
    expect(screen.queryByText('Name')).not.toBeInTheDocument()
  })

  it('selects an item on click', async () => {
    render(<Finder />)
    const content = screen.getByTestId('finder-content')
    await userEvent.click(within(content).getByText('Documents'))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
  })

  it('filters items by search', async () => {
    render(<Finder />)
    const content = screen.getByTestId('finder-content')
    const search = screen.getByPlaceholderText('Search')
    await userEvent.type(search, 'Doc')
    expect(within(content).getByText('Documents')).toBeInTheDocument()
    expect(within(content).queryByText('Downloads')).not.toBeInTheDocument()
  })
})
