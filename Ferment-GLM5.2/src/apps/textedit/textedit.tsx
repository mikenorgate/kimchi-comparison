import { useState, useRef, useMemo, useCallback } from 'react'
import { useFileStore, type FSNode } from '../../store/file-store'

function countWords(text: string): number {
  const plain = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  const words = plain.trim().split(/\s+/).filter((w) => w.length > 0)
  return words.length
}

function countChars(text: string): number {
  return text.replace(/<[^>]*>/g, '').length
}

export function TextEdit({ windowId: _windowId }: { windowId: string }) {
  const { tree, createNode, updateContent, getChildren } = useFileStore()
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('Untitled.txt')
  const [currentFileId, setCurrentFileId] = useState<string | null>(null)
  const [isRichText, setIsRichText] = useState(false)
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const richRef = useRef<HTMLDivElement | null>(null)

  const words = useMemo(() => countWords(content), [content])
  const chars = useMemo(() => countChars(content), [content])

  const handleNew = useCallback(() => {
    setContent('')
    setFileName('Untitled.txt')
    setCurrentFileId(null)
    if (richRef.current) richRef.current.innerHTML = ''
  }, [])

  const handleSave = useCallback(() => {
    if (currentFileId) {
      updateContent(currentFileId, content)
    } else {
      // Create new file in Documents folder
      const id = createNode(fileName, 'file', 'documents')
      updateContent(id, content)
      setCurrentFileId(id)
    }
  }, [currentFileId, content, fileName, createNode, updateContent])

  const handleOpen = useCallback((file: FSNode) => {
    setContent(file.content ?? '')
    setFileName(file.name)
    setCurrentFileId(file.id)
    setShowOpenDialog(false)
    if (richRef.current) richRef.current.innerHTML = file.content ?? ''
  }, [])

  const handlePlainInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }, [])

  const handleRichInput = useCallback(() => {
    if (richRef.current) {
      setContent(richRef.current.innerHTML)
    }
  }, [])

  // List of files in Documents folder for the open dialog
  const docFiles = useMemo(
    () => getChildren('documents').filter((n) => n.type === 'file'),
    [getChildren, tree]
  )

  const toolbarBtn: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: 13,
    padding: '4px 10px',
    borderRadius: 4,
  }

  return (
    <div data-testid="textedit-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Toolbar */}
      <div
        data-testid="textedit-toolbar"
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}
      >
        <button data-testid="te-new" onClick={handleNew} style={toolbarBtn}>New</button>
        <button data-testid="te-open" onClick={() => setShowOpenDialog(true)} style={toolbarBtn}>Open</button>
        <button data-testid="te-save" onClick={handleSave} style={{ ...toolbarBtn, background: 'var(--accent-blue)', color: 'white' }}>Save</button>
        <div style={{ width: 1, height: 20, background: 'var(--glass-border)', margin: '0 4px' }} />
        <button
          data-testid="te-mode-plain"
          onClick={() => setIsRichText(false)}
          style={{ ...toolbarBtn, fontWeight: !isRichText ? 700 : 400 }}
        >
          Plain
        </button>
        <button
          data-testid="te-mode-rich"
          onClick={() => setIsRichText(true)}
          style={{ ...toolbarBtn, fontWeight: isRichText ? 700 : 400 }}
        >
          Rich Text
        </button>
        <div style={{ flex: 1 }} />
        <span data-testid="te-filename" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fileName}</span>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isRichText ? (
          <div
            ref={richRef}
            data-testid="te-rich-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={handleRichInput}
            style={{
              flex: 1,
              padding: 16,
              overflowY: 'auto',
              color: 'var(--text-primary)',
              fontSize: 14,
              lineHeight: 1.6,
              outline: 'none',
            }}
          />
        ) : (
          <textarea
            ref={editorRef}
            data-testid="te-plain-editor"
            value={content}
            onChange={handlePlainInput}
            placeholder="Start typing…"
            style={{
              flex: 1,
              padding: 16,
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'monospace',
              lineHeight: 1.6,
              background: 'transparent',
            }}
          />
        )}
      </div>

      {/* Status bar */}
      <div
        data-testid="te-statusbar"
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px', borderTop: '0.5px solid var(--glass-border)', fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}
      >
        <span data-testid="te-word-count">{words} words</span>
        <span data-testid="te-char-count">{chars} characters</span>
      </div>

      {/* Open dialog */}
      {showOpenDialog && (
        <div
          data-testid="te-open-dialog"
          onClick={() => setShowOpenDialog(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 360, borderRadius: 12, padding: 16 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Open File</h3>
            {docFiles.length === 0 ? (
              <div data-testid="te-no-files" style={{ fontSize: 13, color: 'var(--text-secondary)', padding: 12, textAlign: 'center' }}>
                No files in Documents
              </div>
            ) : (
              <div data-testid="te-file-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {docFiles.map((file) => (
                  <div
                    key={file.id}
                    data-testid={`te-file-${file.id}`}
                    onClick={() => handleOpen(file)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{file.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {new Date(file.modifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              data-testid="te-open-cancel"
              onClick={() => setShowOpenDialog(false)}
              style={{ marginTop: 12, ...toolbarBtn, border: '0.5px solid var(--glass-border)', borderRadius: 6 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
