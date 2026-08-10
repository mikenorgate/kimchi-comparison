import { Folder as FolderIcon, Home as HomeIcon } from 'lucide-react';

interface SidebarEntry {
  id: string;
  label: string;
  fsNodeId: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const FAVORITES: SidebarEntry[] = [
  { id: 'home', label: 'Home', fsNodeId: 'root', Icon: HomeIcon },
  { id: 'applications', label: 'Applications', fsNodeId: 'applications', Icon: FolderIcon },
  { id: 'documents', label: 'Documents', fsNodeId: 'documents', Icon: FolderIcon },
  { id: 'downloads', label: 'Downloads', fsNodeId: 'downloads', Icon: FolderIcon },
  { id: 'pictures', label: 'Pictures', fsNodeId: 'pictures', Icon: FolderIcon },
  { id: 'music', label: 'Music', fsNodeId: 'music', Icon: FolderIcon },
  { id: 'movies', label: 'Movies', fsNodeId: 'movies', Icon: FolderIcon },
];

interface FinderSidebarProps {
  /** The id of the topmost folder in the current path; used for highlight. */
  currentRootId: string;
  /** Called with the favorite's fs node id when the user clicks it. */
  onSelectFolder: (id: string) => void;
}

export default function FinderSidebar({ currentRootId, onSelectFolder }: FinderSidebarProps) {
  return (
    <aside
      className="w-48 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 py-2 text-sm"
      data-testid="finder-sidebar"
    >
      <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Favorites
      </div>
      <ul className="flex flex-col">
        {FAVORITES.map((entry) => {
          const Icon = entry.Icon;
          const active = entry.fsNodeId === currentRootId;
          return (
            <li key={entry.id}>
              <button
                type="button"
                data-testid={`finder-sidebar-${entry.id}`}
                data-fs-node-id={entry.fsNodeId}
                onClick={() => onSelectFolder(entry.fsNodeId)}
                className={
                  'flex w-full items-center gap-2 px-3 py-1 text-left ' +
                  (active
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-700 hover:bg-slate-200')
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{entry.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
