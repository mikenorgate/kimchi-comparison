import { useEffect, useRef } from 'react';
import type { FsNode } from '../types';

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

function kindFor(node: FsNode): string {
  if (node.type === 'folder') return 'Folder';
  const lower = node.name.toLowerCase();
  if (lower.endsWith('.app')) return 'Application';
  if (lower.endsWith('.txt')) return 'Text Document';
  if (lower.endsWith('.md')) return 'Markdown Document';
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) return 'Image';
  if (/\.(mp3|wav|aac|flac|m4a)$/.test(lower)) return 'Audio';
  if (/\.(mp4|mov|m4v|webm)$/.test(lower)) return 'Video';
  return 'Document';
}

interface FinderListViewProps {
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

export default function FinderListView({
  nodes,
  selectedIds,
  renamingId,
  renameDraft,
  onRenameDraftChange,
  onCommitRename,
  onCancelRename,
  onItemActivate,
  onContextMenu,
}: FinderListViewProps) {
  return (
    <div className="p-2" data-testid="finder-list-view">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
            <th className="border-b border-slate-200 px-2 py-1 font-medium">Name</th>
            <th className="border-b border-slate-200 px-2 py-1 font-medium">Kind</th>
            <th className="border-b border-slate-200 px-2 py-1 font-medium">Date Modified</th>
          </tr>
        </thead>
        <tbody>
          {nodes.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-slate-400">
                (empty folder)
              </td>
            </tr>
          )}
          {nodes.map((node) => {
            const selected = selectedIds.includes(node.id);
            const isRenaming = renamingId === node.id;
            return (
              <tr
                key={node.id}
                data-testid={`finder-item-${node.id}`}
                data-node-id={node.id}
                data-node-type={node.type}
                data-node-name={node.name}
                onClick={(e) => onItemActivate(e, node)}
                onDoubleClick={(e) => onItemActivate(e, node)}
                onContextMenu={(e) => onContextMenu(e, node.id)}
                className={
                  'cursor-default ' +
                  (selected ? 'bg-blue-500/15' : 'hover:bg-slate-100')
                }
              >
                <td className="border-b border-slate-100 px-2 py-1">
                  {isRenaming ? (
                    <RenameInput
                      value={renameDraft}
                      onChange={onRenameDraftChange}
                      onCommit={onCommitRename}
                      onCancel={onCancelRename}
                    />
                  ) : (
                    node.name
                  )}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-slate-500">
                  {kindFor(node)}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-slate-500">
                  {formatDate(node.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
      className="w-full rounded border border-blue-500 px-1 py-0.5 text-sm text-slate-800 outline-none"
      data-testid="finder-rename-input"
    />
  );
}
