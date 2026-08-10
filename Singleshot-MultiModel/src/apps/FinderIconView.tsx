import { useEffect, useRef } from 'react';
import {
  FileText as FileTextIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  Music as MusicIcon,
  Film as FilmIcon,
  Package as PackageIcon,
} from 'lucide-react';
import type { FsNode } from '../types';

function iconForNode(node: FsNode) {
  if (node.type === 'folder') return FolderIcon;
  const lower = node.name.toLowerCase();
  if (lower.endsWith('.app')) return PackageIcon;
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return FileTextIcon;
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) return ImageIcon;
  if (/\.(mp3|wav|aac|flac|m4a)$/.test(lower)) return MusicIcon;
  if (/\.(mp4|mov|m4v|webm)$/.test(lower)) return FilmIcon;
  return FileTextIcon;
}

interface FinderIconViewProps {
  nodes: FsNode[];
  selectedIds: string[];
  renamingId: string | null;
  renameDraft: string;
  onRenameDraftChange: (value: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onItemActivate: (event: React.MouseEvent, node: FsNode) => void;
  onContextMenu: (event: React.MouseEvent, id: string) => void;
}

export default function FinderIconView({
  nodes,
  selectedIds,
  renamingId,
  renameDraft,
  onRenameDraftChange,
  onCommitRename,
  onCancelRename,
  onItemActivate,
  onContextMenu,
}: FinderIconViewProps) {
  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3 p-3"
      data-testid="finder-icon-view"
    >
      {nodes.length === 0 && (
        <div className="col-span-full p-6 text-center text-sm text-slate-400">
          (empty folder)
        </div>
      )}
      {nodes.map((node) => {
        const Icon = iconForNode(node);
        const selected = selectedIds.includes(node.id);
        const isRenaming = renamingId === node.id;
        return (
          <button
            key={node.id}
            type="button"
            data-testid={`finder-item-${node.id}`}
            data-node-id={node.id}
            data-node-type={node.type}
            data-node-name={node.name}
            onClick={(e) => onItemActivate(e, node)}
            onDoubleClick={(e) => onItemActivate(e, node)}
            onContextMenu={(e) => onContextMenu(e, node.id)}
            className={
              'flex flex-col items-center gap-1 rounded p-2 text-center ' +
              (selected ? 'bg-blue-500/15 ring-1 ring-blue-500/40' : 'hover:bg-slate-100')
            }
          >
            <Icon
              className={
                'h-10 w-10 ' +
                (node.type === 'folder'
                  ? 'text-blue-500'
                  : node.name.toLowerCase().endsWith('.app')
                    ? 'text-slate-600'
                    : 'text-slate-500')
              }
            />
            {isRenaming ? (
              <RenameInput
                value={renameDraft}
                onChange={onRenameDraftChange}
                onCommit={onCommitRename}
                onCancel={onCancelRename}
              />
            ) : (
              <span className="line-clamp-2 break-all text-[11px] leading-tight text-slate-700">
                {node.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface RenameInputProps {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

function RenameInput({ value, onChange, onCommit, onCancel }: RenameInputProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, []);
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onCommit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
      onBlur={onCommit}
      className="w-full rounded border border-blue-500 px-1 py-0.5 text-center text-[11px] text-slate-800 outline-none"
      data-testid="finder-rename-input"
    />
  );
}
