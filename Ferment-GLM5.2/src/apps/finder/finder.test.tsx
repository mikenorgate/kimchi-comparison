import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Finder } from './finder'
import { useFileStore } from '../../store/file-store'
import { clearRegistry } from '../../store/app-registry'

function resetFS() {
  localStorage.removeItem('tahoe.filesystem')
  useFileStore.getState().reset()
}

describe('Finder', () => {
  beforeEach(() => {
    resetFS()
    clearRegistry()
  })

  it('renders the Finder with sidebar, toolbar, and content area', () => {
    render(<Finder windowId="w1" />)
    expect(screen.getByTestId('finder-root')).toBeInTheDocument()
    expect(screen.getByTestId('finder-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('finder-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('finder-content')).toBeInTheDocument()
  })

  it('renders sidebar sections: Favorites, iCloud, Locations', () => {
    render(<Finder windowId="w1" />)
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('iCloud')).toBeInTheDocument()
    expect(screen.getByText('Locations')).toBeInTheDocument()
  })

  it('renders sidebar location items', () => {
    render(<Finder windowId="w1" />)
    expect(screen.getByTestId('sidebar-documents')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-desktop')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-downloads')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-apps')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-pictures')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-root')).toBeInTheDocument()
  })

  it('defaults to Documents folder and shows its contents', () => {
    render(<Finder windowId="w1" />)
    // Default FS has a Welcome.txt in Documents
    expect(screen.getByText('Welcome.txt')).toBeInTheDocument()
  })

  it('shows breadcrumbs for the current path', () => {
    render(<Finder windowId="w1" />)
    expect(screen.getByTestId('finder-breadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumb-root')).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumb-documents')).toBeInTheDocument()
  })

  it('navigates to a folder via sidebar click', () => {
    render(<Finder windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('sidebar-desktop'))
    })
    // Desktop folder is empty
    expect(screen.getByTestId('finder-empty')).toBeInTheDocument()
  })

  it('navigates into a subfolder via double-click in list view', () => {
    render(<Finder windowId="w1" />)
    // Navigate to root (has Applications folder)
    act(() => {
      fireEvent.click(screen.getByTestId('sidebar-root'))
    })
    // Double-click Applications folder (target the node-name span in the content area)
    const appsNode = screen.getByTestId('node-name-apps')
    act(() => {
      fireEvent.doubleClick(appsNode.closest('[data-testid^="fs-node-"]')!)
    })
    // Should now show Applications folder content (empty)
    expect(screen.getByTestId('finder-empty')).toBeInTheDocument()
  })

  it('creates a new folder via toolbar button', () => {
    render(<Finder windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-folder'))
    })
    // A rename input should appear for the new folder
    expect(screen.getByTestId(/rename-input-/)).toBeInTheDocument()
    // Commit rename
    const input = screen.getByTestId(/rename-input-/) as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { value: 'My Folder' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    expect(screen.getByText('My Folder')).toBeInTheDocument()
  })

  it('creates a new file via toolbar button', () => {
    render(<Finder windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-file'))
    })
    const input = screen.getByTestId(/rename-input-/) as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { value: 'test.txt' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    expect(screen.getByText('test.txt')).toBeInTheDocument()
  })

  it('selects a node on single click', () => {
    render(<Finder windowId="w1" />)
    const welcomeNode = screen.getByText('Welcome.txt').closest('[data-testid^="fs-node-"]') as HTMLElement
    act(() => {
      fireEvent.click(welcomeNode)
    })
    expect(welcomeNode.style.background).toContain('var(--accent-blue)')
  })

  it('renames a node via double-click on the name', () => {
    render(<Finder windowId="w1" />)
    const name = screen.getByTestId(/node-name-/)
    act(() => {
      fireEvent.doubleClick(name)
    })
    const input = screen.getByTestId(/rename-input-/) as HTMLInputElement
    expect(input.value).toBe('Welcome.txt')
    act(() => {
      fireEvent.change(input, { target: { value: 'Renamed.txt' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    expect(screen.getByText('Renamed.txt')).toBeInTheDocument()
    expect(screen.queryByText('Welcome.txt')).toBeNull()
  })

  it('deletes a selected node via the delete button', () => {
    render(<Finder windowId="w1" />)
    // Select Welcome.txt
    const welcomeNode = screen.getByText('Welcome.txt').closest('[data-testid^="fs-node-"]') as HTMLElement
    act(() => {
      fireEvent.click(welcomeNode)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('finder-delete'))
    })
    expect(screen.queryByText('Welcome.txt')).toBeNull()
  })

  it('delete button is disabled when nothing is selected', () => {
    render(<Finder windowId="w1" />)
    const deleteBtn = screen.getByTestId('finder-delete') as HTMLButtonElement
    expect(deleteBtn.disabled).toBe(true)
  })

  it('switches to icon view', () => {
    render(<Finder windowId="w1" />)
    expect(screen.getByTestId('finder-list-view')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('finder-view-icon'))
    })
    expect(screen.getByTestId('finder-icon-view')).toBeInTheDocument()
    expect(screen.queryByTestId('finder-list-view')).toBeNull()
  })

  it('switches back to list view from icon view', () => {
    render(<Finder windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('finder-view-icon'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('finder-view-list'))
    })
    expect(screen.getByTestId('finder-list-view')).toBeInTheDocument()
  })

  it('persists created files to localStorage', () => {
    render(<Finder windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-file'))
    })
    const input = screen.getByTestId(/rename-input-/) as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { value: 'persisted.txt' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.filesystem')!)
    const nodes = Object.values(stored) as { name: string }[]
    expect(nodes.some((n) => n.name === 'persisted.txt')).toBe(true)
  })

  it('recursively deletes a folder and its children', () => {
    render(<Finder windowId="w1" />)
    // Create a folder
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-folder'))
    })
    let input = screen.getByTestId(/rename-input-/) as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { value: 'Parent' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    // Navigate into Parent (double-click the container, not the name span which triggers rename)
    act(() => {
      fireEvent.doubleClick(screen.getByText('Parent').closest('[data-testid^="fs-node-"]')!)
    })
    // Create a file inside Parent
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-file'))
    })
    input = screen.getByTestId(/rename-input-/) as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { value: 'child.txt' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    // Go back to Documents
    act(() => {
      fireEvent.click(screen.getByTestId('breadcrumb-documents'))
    })
    // Select and delete Parent folder (separate act blocks so selectedId updates before delete)
    const parentNode = screen.getByText('Parent').closest('[data-testid^="fs-node-"]') as HTMLElement
    act(() => {
      fireEvent.click(parentNode)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('finder-delete'))
    })
    expect(screen.queryByText('Parent')).toBeNull()
    // Verify the child is also gone from the store
    const tree = useFileStore.getState().tree
    const childExists = Object.values(tree).some((n) => n.name === 'child.txt')
    expect(childExists).toBe(false)
  })
})
