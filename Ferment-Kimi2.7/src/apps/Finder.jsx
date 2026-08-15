import { useState } from 'react';
import './Finder.css';

const FINDER_SIDEBAR = [
  { id: 'favorites', label: 'Favorites', type: 'section' },
  { id: 'airdrop', label: 'AirDrop', type: 'item', icon: 'airdrop' },
  { id: 'recents', label: 'Recents', type: 'item', icon: 'clock' },
  { id: 'applications', label: 'Applications', type: 'item', icon: 'app' },
  { id: 'desktop', label: 'Desktop', type: 'item', icon: 'desktop' },
  { id: 'documents', label: 'Documents', type: 'item', icon: 'doc' },
  { id: 'downloads', label: 'Downloads', type: 'item', icon: 'download' },
  { id: 'locations', label: 'Locations', type: 'section' },
  { id: 'macintosh', label: 'Macintosh HD', type: 'item', icon: 'drive' },
  { id: 'icloud', label: 'iCloud Drive', type: 'item', icon: 'cloud' },
  { id: 'tags', label: 'Tags', type: 'section' },
  { id: 'red', label: 'Red', type: 'item', icon: 'tag-red' },
  { id: 'blue', label: 'Blue', type: 'item', icon: 'tag-blue' },
];

const FINDER_FILES = {
  recents: [
    { id: 'r1', name: 'Screenshot.png', type: 'image', date: 'Today, 10:23 AM', size: '1.2 MB' },
    { id: 'r2', name: 'Project Brief.pdf', type: 'pdf', date: 'Today, 9:15 AM', size: '245 KB' },
    { id: 'r3', name: 'Budget.xlsx', type: 'sheet', date: 'Yesterday', size: '18 KB' },
    { id: 'r4', name: 'Notes.txt', type: 'text', date: 'Yesterday', size: '2 KB' },
  ],
  applications: [
    { id: 'a1', name: 'Safari', type: 'app', date: 'May 15, 2026', size: '24 MB' },
    { id: 'a2', name: 'Mail', type: 'app', date: 'May 15, 2026', size: '18 MB' },
    { id: 'a3', name: 'Calendar', type: 'app', date: 'May 15, 2026', size: '12 MB' },
  ],
  desktop: [
    { id: 'd1', name: 'Wallpaper.jpg', type: 'image', date: 'Jun 1, 2026', size: '3.4 MB' },
  ],
  documents: [
    { id: 'doc1', name: 'Resume.pdf', type: 'pdf', date: 'Mar 10, 2026', size: '120 KB' },
    { id: 'doc2', name: 'Receipts.zip', type: 'archive', date: 'Apr 2, 2026', size: '4 MB' },
  ],
  downloads: [
    { id: 'dl1', name: 'Installer.dmg', type: 'disk', date: 'Today, 8:00 AM', size: '1.1 GB' },
  ],
  icloud: [
    { id: 'ic1', name: 'Vacation Photos', type: 'folder', date: 'Jul 4, 2026', size: '--' },
    { id: 'ic2', name: 'Invoices', type: 'folder', date: 'Jul 1, 2026', size: '--' },
  ],
};

function FileIcon({ type }) {
  switch (type) {
    case 'image':
      return <div className="finder-file-icon finder-icon-image" />;
    case 'pdf':
      return <div className="finder-file-icon finder-icon-pdf" />;
    case 'sheet':
      return <div className="finder-file-icon finder-icon-sheet" />;
    case 'text':
      return <div className="finder-file-icon finder-icon-text" />;
    case 'app':
      return <div className="finder-file-icon finder-icon-app" />;
    case 'folder':
      return <div className="finder-file-icon finder-icon-folder" />;
    case 'archive':
      return <div className="finder-file-icon finder-icon-archive" />;
    case 'disk':
      return <div className="finder-file-icon finder-icon-disk" />;
    default:
      return <div className="finder-file-icon finder-icon-doc" />;
  }
}

function SidebarIcon({ icon }) {
  return <div className={`finder-sidebar-icon finder-sidebar-${icon}`} />;
}

export default function Finder() {
  const [selectedFolder, setSelectedFolder] = useState('recents');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('icons');

  const files = FINDER_FILES[selectedFolder] || [];

  return (
    <div className="finder">
      <div className="finder-toolbar">
        <div className="finder-toolbar-left">
          <button className="finder-tool-button" aria-label="Back">‹</button>
          <button className="finder-tool-button" aria-label="Forward">›</button>
          <span className="finder-folder-name">
            {FINDER_SIDEBAR.find((f) => f.id === selectedFolder)?.label || 'Finder'}
          </span>
        </div>
        <div className="finder-toolbar-right">
          <button
            className={`finder-view-toggle ${viewMode === 'icons' ? 'active' : ''}`}
            onClick={() => setViewMode('icons')}
            aria-label="Icon view"
          >
            ▦
          </button>
          <button
            className={`finder-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            ☰
          </button>
          <button className="finder-tool-button" aria-label="Share">⇧</button>
          <button className="finder-tool-button" aria-label="Search">⌕</button>
        </div>
      </div>
      <div className="finder-body">
        <aside className="finder-sidebar">
          {FINDER_SIDEBAR.map((item) =>
            item.type === 'section' ? (
              <div key={item.id} className="finder-section">
                {item.label}
              </div>
            ) : (
              <button
                key={item.id}
                className={`finder-sidebar-item ${selectedFolder === item.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedFolder(item.id);
                  setSelectedFile(null);
                }}
              >
                <SidebarIcon icon={item.icon} />
                <span>{item.label}</span>
              </button>
            )
          )}
        </aside>
        <main className={`finder-content finder-view-${viewMode}`}>
          {files.length === 0 ? (
            <div className="finder-empty">This folder is empty.</div>
          ) : viewMode === 'icons' ? (
            <div className="finder-grid">
              {files.map((file) => (
                <button
                  key={file.id}
                  className={`finder-file ${selectedFile === file.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(file.id)}
                  onDoubleClick={() => {}}
                >
                  <FileIcon type={file.type} />
                  <span className="finder-file-name">{file.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <table className="finder-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date Modified</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className={selectedFile === file.id ? 'selected' : ''}
                    onClick={() => setSelectedFile(file.id)}
                  >
                    <td>
                      <span className="finder-list-name">
                        <FileIcon type={file.type} />
                        {file.name}
                      </span>
                    </td>
                    <td>{file.date}</td>
                    <td>{file.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
      <div className="finder-statusbar">
        <span>{files.length} items</span>
        <span>{selectedFile ? '1 selected' : 'None selected'}</span>
      </div>
    </div>
  );
}
