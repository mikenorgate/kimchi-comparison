import { ChevronLeft, ChevronRight, ChevronUp, LayoutGrid, List, FolderPlus, FilePlus } from 'lucide-react';
import type { FsNode } from '../types';

interface FinderToolbarProps {
  canBack: boolean;
  canForward: boolean;
  viewMode: 'icon' | 'list';
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onToggleView: () => void;
  onNewFolder: () => void;
  onNewFile: () => void;
  breadcrumbs: FsNode[];
  onBreadcrumbClick: (id: string) => void;
}

/**
 * Toolbar with navigation arrows, breadcrumb path, view toggle, and the
 * new folder / new file actions. The "up" arrow appears only when the
 * current folder is not the root.
 */
export default function FinderToolbar({
  canBack,
  canForward,
  viewMode,
  onBack,
  onForward,
  onUp,
  onToggleView,
  onNewFolder,
  onNewFile,
  breadcrumbs,
  onBreadcrumbClick,
}: FinderToolbarProps) {
  return (
    <div
      className="flex items-center gap-2 border-b border-slate-200 bg-white px-2 py-1.5"
      data-testid="finder-toolbar"
    >
      <button
        type="button"
        aria-label="Back"
        data-testid="finder-back"
        disabled={!canBack}
        onClick={onBack}
        className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Forward"
        data-testid="finder-forward"
        disabled={!canForward}
        onClick={onForward}
        className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Up"
        data-testid="finder-up"
        disabled={breadcrumbs.length <= 1}
        onClick={onUp}
        className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      <nav
        className="ml-2 flex-1 truncate text-sm text-slate-700"
        data-testid="finder-breadcrumbs"
        aria-label="Path"
      >
        {breadcrumbs.map((node, idx) => (
          <span key={node.id} className="inline-flex items-center">
            <button
              type="button"
              className="rounded px-1 hover:bg-slate-100"
              onClick={() => onBreadcrumbClick(node.id)}
              data-testid={`finder-crumb-${node.id}`}
            >
              {node.name || '/'}
            </button>
            {idx < breadcrumbs.length - 1 && (
              <span className="px-1 text-slate-400">/</span>
            )}
          </span>
        ))}
      </nav>

      <button
        type="button"
        aria-label="Toggle view"
        data-testid="finder-toggle-view"
        onClick={onToggleView}
        className="rounded p-1 text-slate-600 hover:bg-slate-100"
        title={viewMode === 'icon' ? 'Switch to list view' : 'Switch to icon view'}
      >
        {viewMode === 'icon' ? (
          <List className="h-4 w-4" />
        ) : (
          <LayoutGrid className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        aria-label="New folder"
        data-testid="finder-new-folder"
        onClick={onNewFolder}
        className="rounded p-1 text-slate-600 hover:bg-slate-100"
        title="New folder"
      >
        <FolderPlus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="New file"
        data-testid="finder-new-file"
        onClick={onNewFile}
        className="rounded p-1 text-slate-600 hover:bg-slate-100"
        title="New file"
      >
        <FilePlus className="h-4 w-4" />
      </button>
    </div>
  );
}
