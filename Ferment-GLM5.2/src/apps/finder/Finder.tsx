import { useState } from 'react'

/** Mock filesystem — a hardcoded nested tree. */
interface FsNode {
  name: string
  type: 'folder' | 'file'
  children?: FsNode[]
}

const MOCK_FS: FsNode = {
  name: 'Home',
  type: 'folder',
  children: [
    {
      name: 'Documents',
      type: 'folder',
      children: [
        { name: 'Resume.pdf', type: 'file' },
        { name: 'Budget.xlsx', type: 'file' },
        { name: 'Notes.txt', type: 'file' },
        { name: 'Projects', type: 'folder', children: [
          { name: 'README.md', type: 'file' },
          { name: 'index.html', type: 'file' },
        ]},
      ],
    },
    {
      name: 'Downloads',
      type: 'folder',
      children: [
        { name: 'installer.dmg', type: 'file' },
        { name: 'photo.jpg', type: 'file' },
        { name: 'report.zip', type: 'file' },
      ],
    },
    {
      name: 'Applications',
      type: 'folder',
      children: [
        { name: 'Safari.app', type: 'file' },
        { name: 'Mail.app', type: 'file' },
        { name: 'Calendar.app', type: 'file' },
        { name: 'Notes.app', type: 'file' },
      ],
    },
    {
      name: 'Desktop',
      type: 'folder',
      children: [
        { name: 'screenshot.png', type: 'file' },
        { name: 'todo.txt', type: 'file' },
      ],
    },
    { name: 'readme.md', type: 'file' },
  ],
}

/** Find a node by following a path array from the root. */
function findNode(path: string[]): FsNode | null {
  let node: FsNode = MOCK_FS
  for (const segment of path) {
    if (!node.children) return null
    const child = node.children.find(c => c.name === segment)
    if (!child) return null
    node = child
  }
  return node
}

const SIDEBAR_LOCATIONS = ['Home', 'Documents', 'Downloads', 'Applications', 'Desktop']

/**
 * Finder app — sidebar with Locations and a main pane listing files/folders.
 * Double-click a folder to navigate into it; sidebar to jump to a location.
 */
export default function Finder() {
  const [path, setPath] = useState<string[]>([])
  const currentNode = findNode(path) ?? MOCK_FS
  const items = currentNode.children ?? []

  const navigateTo = (segments: string[]) => {
    setPath(segments)
  }

  const navigateInto = (folderName: string) => {
    setPath(prev => [...prev, folderName])
  }

  // Build breadcrumb from path
  const breadcrumb = ['Home', ...path]

  // Map sidebar location names to path arrays
  const sidebarClick = (location: string) => {
    if (location === 'Home') {
      navigateTo([])
    } else {
      navigateTo([location])
    }
  }

  return (
    <div
      data-testid="finder"
      style={{
        display: 'flex',
        height: '100%',
        background: '#1e1e1e',
        color: '#fff',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        data-testid="finder-sidebar"
        style={{
          width: '180px',
          minWidth: '180px',
          background: '#2a2a2a',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          padding: '10px 0',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.5, padding: '4px 12px' }}>
          Locations
        </div>
        {SIDEBAR_LOCATIONS.map(loc => (
          <div
            key={loc}
            data-testid={`finder-location-${loc.toLowerCase()}`}
            onClick={() => sidebarClick(loc)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              background: breadcrumb[breadcrumb.length - 1] === loc ? 'rgba(10,132,255,0.3)' : 'transparent',
            }}
          >
            📁 {loc}
          </div>
        ))}
      </div>

      {/* Main pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Breadcrumb / toolbar */}
        <div
          data-testid="finder-breadcrumb"
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px',
            opacity: 0.8,
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          {breadcrumb.map((seg, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span style={{ opacity: 0.3 }}>/</span>}
              <span
                data-testid={`finder-crumb-${i}`}
                onClick={() => navigateTo(path.slice(0, i))}
                style={{ cursor: i < breadcrumb.length - 1 ? 'pointer' : 'default' }}
              >
                {seg}
              </span>
            </span>
          ))}
        </div>

        {/* File grid */}
        <div
          data-testid="finder-file-list"
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: '12px',
            padding: '16px',
            alignContent: 'flex-start',
          }}
        >
          {items.map(item => (
            <div
              key={item.name}
              data-testid={`finder-item-${item.name.replace(/[^a-z0-9]/gi, '-')}`}
              onDoubleClick={() => item.type === 'folder' && navigateInto(item.name)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '32px' }}>
                {item.type === 'folder' ? '📁' : '📄'}
              </div>
              <span style={{ fontSize: '11px', textAlign: 'center', wordBreak: 'break-word' }}>
                {item.name}
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ opacity: 0.4, fontSize: '14px', padding: '20px' }}>
              This folder is empty
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
