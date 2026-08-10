import type { MenuItem } from '../types';
import ContextMenu from '../components/ContextMenu';

interface FinderContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

/**
 * Thin wrapper around the shared ContextMenu so the Finder owns its menu
 * surface while still using the standard chrome for dismissal behavior.
 */
export default function FinderContextMenu({ x, y, items, onClose }: FinderContextMenuProps) {
  return <ContextMenu x={x} y={y} items={items} onClose={onClose} />;
}
