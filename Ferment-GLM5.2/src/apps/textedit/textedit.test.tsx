import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TextEdit } from './textedit'
import { useFileStore } from '../../store/file-store'

function resetFS() {
  localStorage.removeItem('tahoe.filesystem')
  useFileStore.getState().reset()
}

describe('TextEdit', () => {
  beforeEach(() => {
    resetFS()
  })

  it('renders the editor with toolbar and status bar', () => {
    render(<TextEdit windowId="w1" />)
    expect(screen.getByTestId('textedit-root')).toBeInTheDocument()
    expect(screen.getByTestId('textedit-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('te-statusbar')).toBeInTheDocument()
  })

  it('shows default filename "Untitled.txt"', () => {
    render(<TextEdit windowId="w1" />)
    expect(screen.getByTestId('te-filename')).toHaveTextContent('Untitled.txt')
  })

  it('starts in plain text mode with a textarea editor', () => {
    render(<TextEdit windowId="w1" />)
    expect(screen.getByTestId('te-plain-editor')).toBeInTheDocument()
    expect(screen.queryByTestId('te-rich-editor')).toBeNull()
  })

  it('switches to rich text mode with contentEditable editor', () => {
    render(<TextEdit windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('te-mode-rich'))
    })
    expect(screen.getByTestId('te-rich-editor')).toBeInTheDocument()
    expect(screen.queryByTestId('te-plain-editor')).toBeNull()
  })

  it('switches back to plain text mode', () => {
    render(<TextEdit windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('te-mode-rich')) })
    act(() => { fireEvent.click(screen.getByTestId('te-mode-plain')) })
    expect(screen.getByTestId('te-plain-editor')).toBeInTheDocument()
  })

  it('counts words and characters as you type', () => {
    render(<TextEdit windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('te-plain-editor'), { target: { value: 'Hello world test' } })
    })
    expect(screen.getByTestId('te-word-count')).toHaveTextContent('3 words')
    expect(screen.getByTestId('te-char-count')).toHaveTextContent('16 characters')
  })

  it('shows zero counts for empty content', () => {
    render(<TextEdit windowId="w1" />)
    expect(screen.getByTestId('te-word-count')).toHaveTextContent('0 words')
    expect(screen.getByTestId('te-char-count')).toHaveTextContent('0 characters')
  })

  it('saves a new file to the localStorage filesystem (Documents folder)', () => {
    render(<TextEdit windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('te-plain-editor'), { target: { value: 'Saved content' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('te-save'))
    })
    const docs = useFileStore.getState().getChildren('documents')
    const newFile = docs.find((n) => n.name === 'Untitled.txt')
    expect(newFile).toBeDefined()
    expect(newFile!.content).toBe('Saved content')
  })

  it('updates an existing file on re-save instead of creating a duplicate', () => {
    render(<TextEdit windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('te-plain-editor'), { target: { value: 'First save' } })
    })
    act(() => { fireEvent.click(screen.getByTestId('te-save')) })
    // Documents has Welcome.txt + newly saved Untitled.txt
    const docsAfterFirstSave = useFileStore.getState().getChildren('documents')
    expect(docsAfterFirstSave).toHaveLength(2)

    act(() => {
      fireEvent.change(screen.getByTestId('te-plain-editor'), { target: { value: 'Updated content' } })
    })
    act(() => { fireEvent.click(screen.getByTestId('te-save')) })
    // Re-save should NOT create a third file
    expect(useFileStore.getState().getChildren('documents')).toHaveLength(2)
    const savedFile = useFileStore.getState().getChildren('documents').find((n) => n.name === 'Untitled.txt')
    expect(savedFile!.content).toBe('Updated content')
  })

  it('New button clears the editor and resets filename', () => {
    render(<TextEdit windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('te-plain-editor'), { target: { value: 'Some text' } })
    })
    act(() => { fireEvent.click(screen.getByTestId('te-save')) })
    act(() => { fireEvent.click(screen.getByTestId('te-new')) })
    expect((screen.getByTestId('te-plain-editor') as HTMLTextAreaElement).value).toBe('')
    expect(screen.getByTestId('te-filename')).toHaveTextContent('Untitled.txt')
  })

  it('Open dialog shows files from the Documents folder', () => {
    useFileStore.getState().createNode('existing.txt', 'file', 'documents')
    useFileStore.getState().updateContent(
      useFileStore.getState().getChildren('documents').find((n) => n.name === 'existing.txt')!.id,
      'file content'
    )
    render(<TextEdit windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('te-open')) })
    expect(screen.getByTestId('te-open-dialog')).toBeInTheDocument()
    // Should show existing.txt and Welcome.txt
    const fileList = screen.getByTestId('te-file-list')
    expect(fileList).toHaveTextContent('existing.txt')
    expect(fileList).toHaveTextContent('Welcome.txt')
  })

  it('Open dialog shows no-files message when Documents is empty', () => {
    // Delete all files from Documents
    const docs = useFileStore.getState().getChildren('documents')
    for (const d of docs) {
      useFileStore.getState().deleteNode(d.id)
    }
    render(<TextEdit windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('te-open')) })
    expect(screen.getByTestId('te-no-files')).toBeInTheDocument()
  })

  it('opens a file from the open dialog into the editor', () => {
    const id = useFileStore.getState().createNode('opener.txt', 'file', 'documents')
    useFileStore.getState().updateContent(id, 'Opened content')
    render(<TextEdit windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('te-open')) })
    act(() => { fireEvent.click(screen.getByTestId(`te-file-${id}`)) })
    expect((screen.getByTestId('te-plain-editor') as HTMLTextAreaElement).value).toBe('Opened content')
    expect(screen.getByTestId('te-filename')).toHaveTextContent('opener.txt')
  })

  it('closes the open dialog on Cancel', () => {
    render(<TextEdit windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('te-open')) })
    act(() => { fireEvent.click(screen.getByTestId('te-open-cancel')) })
    expect(screen.queryByTestId('te-open-dialog')).toBeNull()
  })

  it('closes the open dialog on overlay click', () => {
    render(<TextEdit windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('te-open')) })
    act(() => { fireEvent.click(screen.getByTestId('te-open-dialog')) })
    expect(screen.queryByTestId('te-open-dialog')).toBeNull()
  })

  it('saved file appears in the Finder file store', () => {
    render(<TextEdit windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('te-plain-editor'), { target: { value: 'Cross-app file' } })
    })
    act(() => { fireEvent.click(screen.getByTestId('te-save')) })
    // Verify the file exists in the store that Finder reads
    const docs = useFileStore.getState().getChildren('documents')
    expect(docs.some((n) => n.content === 'Cross-app file')).toBe(true)
  })

  it('counts words correctly with multiple spaces', () => {
    render(<TextEdit windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('te-plain-editor'), { target: { value: '  multiple   spaces  ' } })
    })
    expect(screen.getByTestId('te-word-count')).toHaveTextContent('2 words')
  })

  it('rich text editor captures content via onInput', () => {
    render(<TextEdit windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('te-mode-rich')) })
    const editor = screen.getByTestId('te-rich-editor')
    act(() => {
      editor.innerHTML = '<b>Bold text</b>'
      fireEvent.input(editor)
    })
    expect(screen.getByTestId('te-char-count')).toHaveTextContent('9 characters')
  })
})
